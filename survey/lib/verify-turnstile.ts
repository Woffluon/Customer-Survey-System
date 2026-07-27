import { getEnv } from './env';

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes: string[];
}

export async function verifyTurnstile(
  token: string,
  ip: string
): Promise<TurnstileVerifyResult> {
  const env = getEnv();

  // Test / dummy token allowance for dev/testing
  if (
    token === 'dummy_token' ||
    token === 'XXXX.DUMMY.TOKEN.XXXX' ||
    token.startsWith('test_')
  ) {
    return { success: true, errorCodes: [] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();
    return {
      success: Boolean(data.success),
      errorCodes: data['error-codes'] || [],
    };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, errorCodes: ['fetch_error'] };
  }
}
