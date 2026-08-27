import { describe, expect, it } from 'vitest';
import {
  buildSurveyResponseExport,
  createSurveyResponseAttachment,
} from '@/survey/lib/survey-response-export';
import type { SurveyConfig } from '@/survey/lib/types';

const survey: SurveyConfig = {
  token: 'client/onboarding',
  title: 'Müşteri Başlangıç Anketi',
  description: '',
  defaultLanguage: 'tr',
  active: true,
  expiresAt: null,
  respondent: { collectName: true, collectEmail: true, collectCompany: true },
  questions: [
    {
      id: 'project_name',
      type: 'short_text',
      label: { tr: 'Proje adı', en: 'Project name' },
      required: true,
    },
    {
      id: 'priority',
      type: 'single_choice',
      label: { tr: 'Öncelik', en: 'Priority' },
      required: true,
      options: [
        { id: 'urgent', label: { tr: 'Acil', en: 'Urgent' } },
        { id: 'normal', label: { tr: 'Normal', en: 'Normal' } },
      ],
    },
    {
      id: 'services',
      type: 'multi_choice',
      label: { tr: 'Hizmetler', en: 'Services' },
      required: false,
      options: [
        { id: 'web', label: { tr: 'Web sitesi', en: 'Website' } },
        { id: 'brand', label: { tr: 'Marka kimliği', en: 'Brand identity' } },
      ],
    },
    {
      id: 'score',
      type: 'rating',
      label: { tr: 'Hazırlık puanı', en: 'Readiness score' },
      required: true,
      min: 1,
      max: 5,
    },
    {
      id: 'notes',
      type: 'long_text',
      label: { tr: 'Notlar', en: 'Notes' },
      required: false,
    },
  ],
};

const submittedAt = new Date('2026-08-27T11:30:00.000Z');
const respondent = {
  name: 'Ayşe Yılmaz',
  email: 'ayse@example.com',
  company: 'Örnek A.Ş.',
};
const answers = {
  project_name: 'Nova',
  priority: 'urgent',
  services: ['web', 'brand'],
  score: 4,
};

describe('survey response export', () => {
  it('builds a Turkish export with raw option identifiers and localized display values', () => {
    const exported = buildSurveyResponseExport({
      surveyConfig: survey,
      answers,
      respondent,
      language: 'tr',
      submittedAt,
    });

    expect(exported).toEqual({
      format: 'survey-response/v1',
      survey: {
        token: 'client/onboarding',
        title: 'Müşteri Başlangıç Anketi',
        language: 'tr',
      },
      submittedAt: '2026-08-27T11:30:00.000Z',
      respondent,
      answers: [
        {
          questionId: 'project_name',
          question: 'Proje adı',
          type: 'short_text',
          value: 'Nova',
          displayValue: 'Nova',
        },
        {
          questionId: 'priority',
          question: 'Öncelik',
          type: 'single_choice',
          value: 'urgent',
          displayValue: 'Acil',
        },
        {
          questionId: 'services',
          question: 'Hizmetler',
          type: 'multi_choice',
          value: ['web', 'brand'],
          displayValue: ['Web sitesi', 'Marka kimliği'],
        },
        {
          questionId: 'score',
          question: 'Hazırlık puanı',
          type: 'rating',
          value: 4,
          displayValue: 4,
        },
        {
          questionId: 'notes',
          question: 'Notlar',
          type: 'long_text',
          value: null,
          displayValue: null,
        },
      ],
    });
    expect(JSON.stringify(exported)).not.toContain('127.0.0.1');
  });

  it('uses English question and option labels and serializes a safe attachment', () => {
    const attachment = createSurveyResponseAttachment({
      surveyConfig: survey,
      answers,
      respondent,
      language: 'en',
      submittedAt,
    });

    expect(attachment.filename).toBe('client_onboarding-response-2026-08-27T11-30-00-000Z.json');
    expect(attachment.contentType).toBe('application/json; charset=utf-8');
    expect(Buffer.isBuffer(attachment.content)).toBe(true);

    const exported = JSON.parse(attachment.content.toString('utf8'));
    expect(exported.survey.language).toBe('en');
    expect(exported.answers).toEqual(expect.arrayContaining([
      expect.objectContaining({ question: 'Priority', value: 'urgent', displayValue: 'Urgent' }),
      expect.objectContaining({ question: 'Services', value: ['web', 'brand'], displayValue: ['Website', 'Brand identity'] }),
    ]));
    expect(JSON.stringify(exported)).not.toContain('127.0.0.1');
  });
});
