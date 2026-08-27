import { AnswerValue, Language, SubmitPayload } from './types';

interface CreateSubmitPayloadInput {
  surveyToken: string;
  turnstileToken: string;
  honeypot: string;
  respondent: {
    name?: string;
    email?: string;
    company?: string;
  };
  answers: Record<string, AnswerValue>;
  language: Language;
}

export function createSurveySubmitPayload({
  surveyToken,
  turnstileToken,
  honeypot,
  respondent,
  answers,
  language,
}: CreateSubmitPayloadInput): SubmitPayload {
  return {
    surveyToken,
    surveySlug: surveyToken,
    turnstileToken,
    honeypot,
    respondent,
    answers: answers as Record<string, string | string[] | number>,
    language,
  };
}
