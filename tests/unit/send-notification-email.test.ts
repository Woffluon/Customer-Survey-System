import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resendSend: vi.fn(),
  Resend: vi.fn(),
  getEnv: vi.fn(),
}));

vi.mock('resend', () => ({
  Resend: mocks.Resend,
}));

vi.mock('@/survey/lib/env', () => ({
  getEnv: mocks.getEnv,
}));

import { sendSurveyEmails } from '@/survey/lib/send-notification-email';
import type { SurveyConfig } from '@/survey/lib/types';

const survey: SurveyConfig = {
  token: 'sample-survey',
  title: 'Sample Survey',
  description: '',
  defaultLanguage: 'tr',
  active: true,
  expiresAt: null,
  respondent: { collectName: true, collectEmail: true, collectCompany: false },
  questions: [],
};

describe('sendSurveyEmails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.Resend.mockImplementation(function ResendMock() {
      return {
      emails: { send: mocks.resendSend },
      };
    });
    mocks.getEnv.mockReturnValue({
      RESEND_API_KEY: 're_live_test_key',
      RESEND_FROM_EMAIL: 'onboarding@resend.dev',
      NOTIFICATION_TO_EMAIL: 'admin@example.com',
    });
    mocks.resendSend.mockResolvedValue({ error: null });
  });

  it('sends the detailed notification and privacy-safe recipient receipt', async () => {
    const result = await sendSurveyEmails({
      surveyConfig: survey,
      answers: { private_answer: 'Gizli anket yanıtı' },
      respondent: { name: 'Ayşe Yılmaz', email: 'raw@example.com' },
      recipientEmail: 'participant@example.com',
      language: 'tr',
      submittedAt: new Date('2026-08-27T11:30:00.000Z'),
      ipAddress: '127.0.0.1',
    });

    expect(result).toEqual({ success: true });
    expect(mocks.resendSend).toHaveBeenCalledTimes(2);
    expect(mocks.resendSend).toHaveBeenCalledWith(expect.objectContaining({
      to: ['admin@example.com'],
      subject: 'Yeni Anket Yanıtı: Sample Survey',
    }));
    expect(mocks.resendSend).toHaveBeenCalledWith(expect.objectContaining({
      to: ['participant@example.com'],
      subject: 'Yanıtınız alındı: Sample Survey',
      html: expect.not.stringContaining('Gizli anket yanıtı'),
    }));
  });

  it('fails when either provider request fails', async () => {
    mocks.resendSend
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'recipient rejected' } });

    const result = await sendSurveyEmails({
      surveyConfig: survey,
      answers: {},
      respondent: { name: 'Ayşe Yılmaz' },
      recipientEmail: 'participant@example.com',
      language: 'en',
      submittedAt: new Date('2026-08-27T11:30:00.000Z'),
      ipAddress: '127.0.0.1',
    });

    expect(result).toEqual({ success: false, error: 'email_failed' });
  });

  it('does not log the participant address in mock mode', async () => {
    mocks.getEnv.mockReturnValue({
      RESEND_API_KEY: 're_mock_key',
      RESEND_FROM_EMAIL: 'onboarding@resend.dev',
      NOTIFICATION_TO_EMAIL: 'admin@example.com',
    });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const result = await sendSurveyEmails({
      surveyConfig: survey,
      answers: {},
      respondent: { name: 'Ayşe Yılmaz' },
      recipientEmail: 'participant@example.com',
      language: 'tr',
      submittedAt: new Date('2026-08-27T11:30:00.000Z'),
      ipAddress: '127.0.0.1',
    });

    expect(result).toEqual({ success: true });
    expect(logSpy.mock.calls.flat().join(' ')).not.toContain('participant@example.com');
    logSpy.mockRestore();
  });

  it('returns a generic failure when rendering or delivery throws', async () => {
    mocks.resendSend.mockRejectedValue(new Error('connection lost'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await sendSurveyEmails({
      surveyConfig: survey,
      answers: {},
      respondent: { name: 'Ayşe Yılmaz' },
      recipientEmail: 'participant@example.com',
      language: 'tr',
      submittedAt: new Date('2026-08-27T11:30:00.000Z'),
      ipAddress: '127.0.0.1',
    });

    expect(result).toEqual({ success: false, error: 'email_failed' });
    errorSpy.mockRestore();
  });
});
