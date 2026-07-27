import { render } from '@react-email/components';
import { Resend } from 'resend';
import { SurveyConfig, AnswerValue } from './types';
import { SurveyEmailTemplate } from './email-template';
import { getEnv } from './env';

interface SendEmailParams {
  surveyConfig: SurveyConfig;
  answers: Record<string, AnswerValue>;
  respondent?: {
    name?: string;
    email?: string;
    company?: string;
  };
  submittedAt: Date;
  ipAddress: string;
}

export async function sendNotificationEmail({
  surveyConfig,
  answers,
  respondent,
  submittedAt,
  ipAddress,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const env = getEnv();

  const formattedDate = submittedAt.toLocaleString('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  try {
    const html = await render(
      SurveyEmailTemplate({
        surveyConfig,
        answers,
        respondent,
        submittedAt: formattedDate,
        ipAddress,
      })
    );

    // Development / Mock mode handling
    if (!env.RESEND_API_KEY || env.RESEND_API_KEY === 're_mock_key') {
      console.log('--- MOCK EMAIL DISPATCH ---');
      console.log(`To: ${env.NOTIFICATION_TO_EMAIL}`);
      console.log(`Subject: Yeni Anket Yanıtı — ${surveyConfig.title}`);
      console.log(`Submitted At: ${formattedDate}`);
      console.log('---------------------------');
      return { success: true };
    }

    const resend = new Resend(env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: [env.NOTIFICATION_TO_EMAIL],
      subject: `Yeni Anket Yanıtı — ${surveyConfig.title}`,
      html,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to render/send notification email:', error);
    return { success: false, error: errorMessage };
  }
}
