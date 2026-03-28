import { apiUrl } from './api-base';
import type { ApiEnvelope } from './types';
import { RegistrationApiError } from './types';

export type ForgotPasswordData = {
  sent: boolean;
  resetToken: string | null;
};

function traceIdFromResponse(res: Response): string {
  return res.headers.get('X-Trace-Id')?.trim() ?? '';
}

export async function requestPasswordReset(email: string): Promise<ApiEnvelope<ForgotPasswordData>> {
  const url = apiUrl('/api/v1/auth/forgot-password');
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  } catch {
    throw new RegistrationApiError(0, {
      data: null,
      meta: {},
      error: {
        code: 'NETWORK_ERROR',
        message: 'Could not reach the server',
        traceId: '',
      },
    });
  }
  const text = await res.text();
  let json: ApiEnvelope<ForgotPasswordData>;
  try {
    if (!text.trim()) {
      throw new Error('empty');
    }
    json = JSON.parse(text) as ApiEnvelope<ForgotPasswordData>;
  } catch {
    throw new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Response was not valid JSON',
        traceId: traceIdFromResponse(res),
      },
    });
  }
  if (!res.ok || json.error) {
    throw new RegistrationApiError(res.status, json as unknown as import('./types').ApiEnvelope<null>);
  }
  return json;
}
