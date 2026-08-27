import { describe, expect, it } from 'vitest';
import { createSurveySubmitPayload } from '@/survey/lib/create-submit-payload';

describe('createSurveySubmitPayload', () => {
  it('includes the selected form language in the API payload', () => {
    expect(createSurveySubmitPayload({
      surveyToken: 'sample-survey',
      turnstileToken: 'test_token',
      honeypot: '',
      respondent: { name: 'Alex Smith', email: 'alex@example.com' },
      answers: { answer: 'yes' },
      language: 'en',
    })).toMatchObject({
      surveyToken: 'sample-survey',
      surveySlug: 'sample-survey',
      language: 'en',
    });
  });
});
