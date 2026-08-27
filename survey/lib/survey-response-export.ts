import type { AnswerValue, Language, Question, SurveyConfig } from './types';

type ExportValue = Exclude<AnswerValue, undefined> | null;

interface ExportedAnswer {
  questionId: string;
  question: string;
  type: Question['type'];
  value: ExportValue;
  displayValue: ExportValue;
}

export interface SurveyResponseExport {
  format: 'survey-response/v1';
  survey: {
    token: string;
    title: string;
    language: Language;
  };
  submittedAt: string;
  respondent: {
    name?: string;
    email?: string;
    company?: string;
  };
  answers: ExportedAnswer[];
}

interface SurveyResponseExportParams {
  surveyConfig: SurveyConfig;
  answers: Record<string, AnswerValue>;
  respondent?: {
    name?: string;
    email?: string;
    company?: string;
  };
  language: Language;
  submittedAt: Date;
}

interface SurveyResponseAttachment {
  content: Buffer;
  filename: string;
  contentType: 'application/json; charset=utf-8';
}

function exportValue(answer: AnswerValue): ExportValue {
  return answer === undefined || (Array.isArray(answer) && answer.length === 0) ? null : answer;
}

function optionLabel(question: Extract<Question, { options: unknown[] }>, optionId: string, language: Language) {
  return question.options.find((option) => option.id === optionId)?.label[language] ?? optionId;
}

function displayValue(question: Question, value: ExportValue, language: Language): ExportValue {
  if (value === null) {
    return null;
  }

  if (question.type === 'single_choice' && typeof value === 'string') {
    return optionLabel(question, value, language);
  }

  if (question.type === 'multi_choice' && Array.isArray(value)) {
    return value.map((optionId) => optionLabel(question, optionId, language));
  }

  return value;
}

function safeFilenameToken(token: string) {
  return token.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^_+|_+$/g, '') || 'survey';
}

export function buildSurveyResponseExport({
  surveyConfig,
  answers,
  respondent,
  language,
  submittedAt,
}: SurveyResponseExportParams): SurveyResponseExport {
  return {
    format: 'survey-response/v1',
    survey: {
      token: surveyConfig.token,
      title: surveyConfig.title,
      language,
    },
    submittedAt: submittedAt.toISOString(),
    respondent: respondent ?? {},
    answers: surveyConfig.questions.map((question) => {
      const value = exportValue(answers[question.id]);

      return {
        questionId: question.id,
        question: question.label[language],
        type: question.type,
        value,
        displayValue: displayValue(question, value, language),
      };
    }),
  };
}

export function createSurveyResponseAttachment(params: SurveyResponseExportParams): SurveyResponseAttachment {
  const exported = buildSurveyResponseExport(params);
  const timestamp = params.submittedAt.toISOString().replace(/[:.]/g, '-');

  return {
    content: Buffer.from(JSON.stringify(exported, null, 2), 'utf8'),
    filename: `${safeFilenameToken(params.surveyConfig.token)}-response-${timestamp}.json`,
    contentType: 'application/json; charset=utf-8',
  };
}
