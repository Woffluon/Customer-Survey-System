import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from './env';

function getHmacSecret(): string {
  const env = getEnv();
  return env.RATE_LIMIT_SECRET || 'default_rate_limit_secret_for_dev_only';
}

function signToken(token: string, timestamp: number): string {
  const secret = getHmacSecret();
  const data = `${token}:${timestamp}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function checkRateLimit(
  request: NextRequest,
  surveyToken: string
): { limited: boolean } {
  const cookieName = `survey_rl_${surveyToken}`;
  const cookieValue = request.cookies.get(cookieName)?.value;

  if (!cookieValue) {
    return { limited: false };
  }

  const [timestampStr, signature] = cookieValue.split('.');
  if (!timestampStr || !signature) {
    return { limited: false };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { limited: false };
  }

  // Check 60 second window
  const now = Date.now();
  if (now - timestamp > 60 * 1000) {
    return { limited: false };
  }

  // Verify HMAC signature
  const expectedSig = signToken(surveyToken, timestamp);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);

  if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { limited: true };
  }

  return { limited: false };
}

export function setRateLimitCookie(
  response: NextResponse,
  surveyToken: string
): void {
  const cookieName = `survey_rl_${surveyToken}`;
  const now = Date.now();
  const signature = signToken(surveyToken, now);
  const cookieValue = `${now}.${signature}`;

  response.cookies.set(cookieName, cookieValue, {
    maxAge: 60,
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
}
