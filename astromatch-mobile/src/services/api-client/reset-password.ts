import { apiUrl } from './api-base';
import { RegistrationApiError } from './types';

function traceIdFromResponse(res: Response): string {
  return res.headers.get('X-Trace-Id')?.trim() ?? '';
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const url = apiUrl('/api/v1/auth/reset-password');
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ token: token.trim(), newPassword }),
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
  if (!res.ok) {
    let code = 'RESET_FAILED';
    let message = 'Could not reset password';
    let traceId = traceIdFromResponse(res);
    try {
      const j = JSON.parse(text) as { error?: { code?: string; message?: string; traceId?: string } };
      if (j.error?.code) code = j.error.code;
      if (j.error?.message) message = j.error.message;
      if (j.error?.traceId) traceId = j.error.traceId;
    } catch {
      /* ignore */
    }
    throw new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: { code, message, traceId },
    });
  }
}
