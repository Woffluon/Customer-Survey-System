import { render } from '@react-email/components';
import { describe, expect, it } from 'vitest';
import { SurveyEmailTemplate } from '@/survey/lib/email-template';
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

describe('SurveyEmailTemplate', () => {
  it('notes that a JSON export is attached using the existing email design', async () => {
    const html = await render(SurveyEmailTemplate({
      surveyConfig: survey,
      answers: {},
      respondent: { name: 'Ayşe Yılmaz' },
      submittedAt: '27 Ağustos 2026 14:30',
      ipAddress: '127.0.0.1',
    }));

    expect(html).toContain('JSON dışa aktarma dosyası e-postaya eklenmiştir');
    expect(html).toContain('#d94625');
  });
});
