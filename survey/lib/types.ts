export type Language = 'tr' | 'en';

export type LocalizedString = Record<Language, string>;

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multi_choice'
  | 'rating';

export interface QuestionOption {
  id: string;
  label: LocalizedString;
}

interface BaseQuestion {
  id: string;
  type: QuestionType;
  label: LocalizedString;
  required: boolean;
}

export interface ShortTextQuestion extends BaseQuestion {
  type: 'short_text';
}

export interface LongTextQuestion extends BaseQuestion {
  type: 'long_text';
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single_choice';
  options: QuestionOption[];
}

export interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi_choice';
  options: QuestionOption[];
}

export interface RatingQuestion extends BaseQuestion {
  type: 'rating';
  min: number;
  max: number;
}

export type Question =
  | ShortTextQuestion
  | LongTextQuestion
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | RatingQuestion;

export interface RespondentConfig {
  collectName: boolean;
  collectEmail: boolean;
  collectCompany: boolean;
}

export interface SurveyConfig {
  token: string;
  title: string;
  description: string;
  defaultLanguage: Language;
  active: boolean;
  expiresAt: string | null;
  respondent: RespondentConfig;
  questions: Question[];
}

export interface SubmitPayload {
  surveyToken: string;
  turnstileToken: string;
  honeypot: string;
  respondent?: {
    name?: string;
    email?: string;
    company?: string;
  };
  answers: Record<string, string | string[] | number>;
}

export interface ApiSuccessResponse {
  success: true;
  redirect: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  fieldErrors?: Record<string, string>;
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;
