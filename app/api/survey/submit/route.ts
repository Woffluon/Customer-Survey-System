import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstile } from '@/survey/lib/verify-turnstile';
import { checkRateLimit, setRateLimitCookie } from '@/survey/lib/rate-limit';
import { getSurvey } from '@/survey/lib/get-survey';
import { buildSurveySchema } from '@/survey/lib/survey-schema';
import { sendNotificationEmail } from '@/survey/lib/send-notification-email';
import { ApiResponse } from '@/survey/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  let body: any;

  // 1. Parse JSON Body
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_json' },
      { status: 400 }
    );
  }

  const { surveyToken, surveySlug, turnstileToken, honeypot, respondent, answers } = body || {};
  const identifier = surveySlug || surveyToken;

  if (!identifier) {
    return NextResponse.json(
      { success: false, error: 'missing_token' },
      { status: 400 }
    );
  }

  // 2. Verify Turnstile
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const turnstileResult = await verifyTurnstile(turnstileToken || '', ip);
  if (!turnstileResult.success) {
    return NextResponse.json(
      { success: false, error: 'turnstile_failed' },
      { status: 403 }
    );
  }

  // 3. Honeypot Check (silent fake success for bots)
  if (honeypot && String(honeypot).trim() !== '') {
    return NextResponse.json({
      success: true,
      redirect: '/thank-you',
    });
  }

  // 4. Rate Limit Check (Signed Cookie)
  const rateLimitResult = checkRateLimit(request, identifier);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { success: false, error: 'rate_limited' },
      { status: 429 }
    );
  }

  // 5. Load Survey Configuration
  const survey = await getSurvey(identifier);
  if (!survey) {
    return NextResponse.json(
      { success: false, error: 'invalid_survey' },
      { status: 404 }
    );
  }

  // 6. Validate Answers via Dynamic Zod Schema
  const schema = buildSurveySchema(survey);
  const dataToValidate: Record<string, any> = { ...(answers || {}) };

  if (survey.respondent.collectName) {
    dataToValidate['respondent_name'] = respondent?.name || '';
  }
  if (survey.respondent.collectEmail) {
    dataToValidate['respondent_email'] = respondent?.email || '';
  }
  if (survey.respondent.collectCompany) {
    dataToValidate['respondent_company'] = respondent?.company || '';
  }

  const validation = schema.safeParse(dataToValidate);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const fieldPath = issue.path[0] as string;
      fieldErrors[fieldPath] = issue.message;
    }
    return NextResponse.json(
      {
        success: false,
        error: 'validation_failed',
        fieldErrors,
      },
      { status: 422 }
    );
  }

  // 7. Dispatch Email
  const emailResult = await sendNotificationEmail({
    surveyConfig: survey,
    answers: validation.data,
    respondent,
    submittedAt: new Date(),
    ipAddress: ip,
  });

  if (!emailResult.success) {
    return NextResponse.json(
      { success: false, error: 'email_failed' },
      { status: 500 }
    );
  }

  // 8. Construct Success Response & Set Cookie
  const redirectUrl = `/thank-you?title=${encodeURIComponent(survey.title)}`;
  const response = NextResponse.json<ApiResponse>({
    success: true,
    redirect: redirectUrl,
  });

  setRateLimitCookie(response, identifier);

  return response;
}
