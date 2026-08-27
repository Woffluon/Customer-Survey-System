// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/survey/components/turnstile-widget', () => ({
  TurnstileWidget: ({ onSuccess }: { onSuccess: (token: string) => void }) => (
    <button type="button" onClick={() => onSuccess('test_token')}>Verify</button>
  ),
}));

import { SurveyForm } from '@/survey/components/survey-form';
import { LanguageProvider } from '@/survey/i18n/use-translation';
import type { SurveyConfig } from '@/survey/lib/types';

const config: SurveyConfig = {
  token: 'sample-survey',
  title: 'Sample Survey',
  description: '',
  defaultLanguage: 'en',
  active: true,
  expiresAt: null,
  respondent: { collectName: true, collectEmail: true, collectCompany: false },
  questions: [],
};

describe('SurveyForm', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.push.mockReset();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, redirect: '/thank-you' }),
    }));
  });

  it('submits the selected interface language with the form payload', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider defaultLanguage="en">
        <SurveyForm config={config} />
      </LanguageProvider>
    );

    await user.type(screen.getByLabelText(/full name/i), 'Alex Smith');
    await user.type(screen.getByLabelText(/email address/i), 'alex@example.com');
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    await user.click(screen.getByRole('button', { name: /submit responses/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(String(options?.body))).toMatchObject({
      surveySlug: 'sample-survey',
      language: 'en',
    });
  });
});
