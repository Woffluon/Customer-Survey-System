import { z } from 'zod';

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1).default('re_mock_key'),
  RESEND_FROM_EMAIL: z.string().email().default('onboarding@resend.dev'),
  NOTIFICATION_TO_EMAIL: z.string().email().default('admin@example.com'),
  TURNSTILE_SECRET_KEY: z.string().min(1).default('1x0000000000000000000000000000000AA'),
});

export function getEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn('Environment variable validation warning:', result.error.format());
    return {
      RESEND_API_KEY: process.env.RESEND_API_KEY || 're_mock_key',
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      NOTIFICATION_TO_EMAIL: process.env.NOTIFICATION_TO_EMAIL || 'admin@example.com',
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA',
    };
  }
  return result.data;
}
