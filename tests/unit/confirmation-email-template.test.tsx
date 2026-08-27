import { render } from '@react-email/components';
import { describe, expect, it } from 'vitest';
import { SurveyConfirmationEmailTemplate } from '@/survey/lib/survey-confirmation-email-template';

describe('SurveyConfirmationEmailTemplate', () => {
  it('renders a Turkish receipt without survey answers or IP information', async () => {
    const html = await render(
      SurveyConfirmationEmailTemplate({
        surveyTitle: 'Proje Başlangıç Anketi',
        respondentName: 'Ayşe Yılmaz',
        submittedAt: '27 Ağustos 2026 14:30',
        language: 'tr',
      })
    );

    expect(html).toContain('Yanıtınız alındı');
    expect(html).toContain('Ayşe Yılmaz');
    expect(html).toContain('Proje Başlangıç Anketi');
    expect(html).toContain('#d94625');
    expect(html).not.toContain('Gizli anket yanıtı');
    expect(html).not.toContain('127.0.0.1');
  });

  it('renders English confirmation copy', async () => {
    const html = await render(
      SurveyConfirmationEmailTemplate({
        surveyTitle: 'Project Completion Survey',
        respondentName: 'Alex Smith',
        submittedAt: 'August 27, 2026, 2:30 PM',
        language: 'en',
      })
    );

    expect(html).toContain('Your response has been received');
    expect(html).toContain('Project Completion Survey');
  });
});
