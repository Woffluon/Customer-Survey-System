import { render } from '@react-email/components';
import { Resend } from 'resend';
import { SurveyConfig, AnswerValue, Language } from './types';
import { SurveyEmailTemplate } from './email-template';
import { SurveyConfirmationEmailTemplate } from './survey-confirmation-email-template';
import { createSurveyResponseAttachment } from './survey-response-export';
import { getEnv } from './env';

interface SendEmailParams {
  surveyConfig: SurveyConfig;
  answers: Record<string, AnswerValue>;
  respondent?: {
    name?: string;
    email?: string;
    company?: string;
  };
  recipientEmail: string;
  language: Language;
  submittedAt: Date;
  ipAddress: string;
}

export async function sendSurveyEmails({
  surveyConfig,
  answers,
  respondent,
  recipientEmail,
  language,
  submittedAt,
  ipAddress,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const env = getEnv();

  const notificationDate = submittedAt.toLocaleString('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const confirmationDate = submittedAt.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const notificationSubject = `Yeni Anket Yanıtı: ${surveyConfig.title}`;
  const confirmationSubject = language === 'tr'
    ? `Yanıtınız alındı: ${surveyConfig.title}`
    : `Your response has been received: ${surveyConfig.title}`;

  try {
    const responseAttachment = createSurveyResponseAttachment({
      surveyConfig,
      answers,
      respondent,
      language,
      submittedAt,
    });
    const [notificationHtml, confirmationHtml] = await Promise.all([
      render(SurveyEmailTemplate({
        surveyConfig,
        answers,
        respondent,
        submittedAt: notificationDate,
        ipAddress,
      })),
      render(SurveyConfirmationEmailTemplate({
        surveyTitle: surveyConfig.title,
        respondentName: respondent?.name,
        submittedAt: confirmationDate,
        language,
      })),
    ]);

    if (!env.RESEND_API_KEY || env.RESEND_API_KEY === 're_mock_key') {
      console.log('--- MOCK EMAIL DISPATCH ---');
      console.log('Admin notification and participant confirmation were prepared.');
      console.log('---------------------------');
      return { success: true };
    }

    const resend = new Resend(env.RESEND_API_KEY);

    const [notificationResult, confirmationResult] = await Promise.all([
      resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: [env.NOTIFICATION_TO_EMAIL],
        subject: notificationSubject,
        html: notificationHtml,
        attachments: [responseAttachment],
      }),
      resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: [recipientEmail],
        subject: confirmationSubject,
        html: confirmationHtml,
      }),
    ]);

    if (notificationResult.error || confirmationResult.error) {
      console.error('Survey email dispatch was rejected by the provider.');
      return { success: false, error: 'email_failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Survey email dispatch failed.');
    return { success: false, error: 'email_failed' };
  }
}
