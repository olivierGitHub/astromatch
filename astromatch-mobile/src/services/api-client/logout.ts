import { getRefreshToken } from '../auth/session';
import { apiUrl } from './api-base';
import { RegistrationApiError } from './types';

export async function logoutRemote(): Promise<void> {
  const refresh = await getRefreshToken();
  if (!refresh) return;
  const url = apiUrl('/api/v1/auth/logout');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    const text = await res.text();
    if (!res.ok) {
      try {
        const json = JSON.parse(text) as { error?: { message?: string } };
        throw new RegistrationApiError(res.status, {
          data: null,
          meta: {},
          error: {
            code: 'LOGOUT_FAILED',
            message: json.error?.message ?? 'Logout failed',
            details: null,
            traceId: '',
          },
        });
      } catch (e) {
        if (e instanceof RegistrationApiError) throw e;
      }
    }
  } catch (e) {
    if (e instanceof RegistrationApiError) throw e;
    // still clear local session even if network fails
  }
}
