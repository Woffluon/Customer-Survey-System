import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyTurnstile: vi.fn(),
  checkRateLimit: vi.fn(),
  setRateLimitCookie: vi.fn(),
  getSurvey: vi.fn(),
  buildSurveySchema: vi.fn(),
  sendSurveyEmails: vi.fn(),
}));

vi.mock('@/survey/lib/verify-turnstile', () => ({ verifyTurnstile: mocks.verifyTurnstile }));
vi.mock('@/survey/lib/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  setRateLimitCookie: mocks.setRateLimitCookie,
}));
vi.mock('@/survey/lib/get-survey', () => ({ getSurvey: mocks.getSurvey }));
vi.mock('@/survey/lib/survey-schema', () => ({ buildSurveySchema: mocks.buildSurveySchema }));
vi.mock('@/survey/lib/send-notification-email', () => ({ sendSurveyEmails: mocks.sendSurveyEmails }));

import { POST } from '@/app/api/survey/submit/route';

const survey = {
  token: 'sample-survey',
  title: 'Sample Survey',
  description: '',
  defaultLanguage: 'en' as const,
  active: true,
  expiresAt: null,
  respondent: { collectName: true, collectEmail: true, collectCompany: false },
  questions: [],
};

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/survey/submit', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/survey/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyTurnstile.mockResolvedValue({ success: true, errorCodes: [] });
    mocks.checkRateLimit.mockReturnValue({ limited: false });
    mocks.getSurvey.mockResolvedValue(survey);
    mocks.buildSurveySchema.mockReturnValue({
      safeParse: vi.fn(() => ({
        success: true,
        data: {
          respondent_name: 'Alex Smith',
          respondent_email: 'normalized@example.com',
        },
      })),
    });
    mocks.sendSurveyEmails.mockResolvedValue({ success: true });
  });

  it('uses the normalized address and survey default locale when the request locale is invalid', async () => {
    const response = await POST(request({
      surveySlug: 'sample-survey',
      turnstileToken: 'test_token',
      respondent: { name: 'Alex Smith', email: ' raw@example.com ' },
      answers: {},
      language: 'de',
    }));

    expect(response.status).toBe(200);
    expect(mocks.sendSurveyEmails).toHaveBeenCalledWith(expect.objectContaining({
      recipientEmail: 'normalized@example.com',
      language: 'en',
    }));
    expect(mocks.setRateLimitCookie).toHaveBeenCalledTimes(1);
  });

  it('does not mark the submission complete when either email fails', async () => {
    mocks.sendSurveyEmails.mockResolvedValue({ success: false, error: 'email_failed' });

    const response = await POST(request({
      surveySlug: 'sample-survey',
      turnstileToken: 'test_token',
      respondent: { name: 'Alex Smith', email: 'alex@example.com' },
      answers: {},
      language: 'tr',
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ success: false, error: 'email_failed' });
    expect(mocks.setRateLimitCookie).not.toHaveBeenCalled();
  });
});
