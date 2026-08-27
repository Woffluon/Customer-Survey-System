import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3010',
  },
  webServer: {
    command: 'pnpm exec next dev --port 3010',
    url: 'http://127.0.0.1:3010',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      RESEND_API_KEY: 're_mock_key',
      RESEND_FROM_EMAIL: 'onboarding@resend.dev',
      NOTIFICATION_TO_EMAIL: 'admin@example.com',
      TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
      RATE_LIMIT_SECRET: 'test_rate_limit_secret',
    },
  },
});
