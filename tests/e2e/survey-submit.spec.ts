import { expect, test } from '@playwright/test';

test('accepts a valid completion survey in mock email mode', async ({ request }) => {
  const response = await request.post('/api/survey/submit', {
    data: {
      surveySlug: 'project-completion',
      turnstileToken: 'test_e2e_token',
      respondent: {
        name: 'Test Participant',
        email: 'participant@example.com',
      },
      answers: {
        business_name: 'Example Ltd',
        overall_satisfaction: 8,
        recommendation_score: 8,
        communication_rating: 4,
        quality_rating: 4,
        process_rating: 4,
        value_rating: 4,
        best_part: 'Clear communication',
        improvement_area: 'More status updates',
      },
      language: 'en',
    },
  });

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    success: true,
    redirect: expect.stringContaining('/thank-you'),
  });
});
