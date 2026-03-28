import { getRefreshToken, saveSession } from '../auth/session';
import type { ApiEnvelope } from './types';
import { RegistrationApiError } from './types';
import { apiUrl } from './api-base';
import type { TokenBundle } from './types';

let refreshInFlight: Promise<boolean> | null = null;

function traceIdFromResponse(res: Response): string {
  return res.headers.get('X-Trace-Id')?.trim() ?? '';
}

function parseTokenEnvelope(text: string, res: Response): ApiEnvelope<TokenBundle> {
  if (!text.trim()) {
    throw new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Empty response body',
        traceId: traceIdFromResponse(res),
      },
    });
  }
  try {
    return JSON.parse(text) as ApiEnvelope<TokenBundle>;
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
}

/**
 * Single-flight refresh: rotates refresh token and persists new access + refresh + email.
 * Returns false if no refresh token or server rejects refresh.
 */
export async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  refreshInFlight = (async () => {
    const refresh = await getRefreshToken();
    if (!refresh) return false;
    const url = apiUrl('/api/v1/auth/refresh');
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });
    } catch {
      return false;
    }
    const text = await res.text();
    let json: ApiEnvelope<TokenBundle>;
    try {
      json = parseTokenEnvelope(text, res);
    } catch {
      return false;
    }
    if (!res.ok || json.error || !json.data?.accessToken || !json.data?.refreshToken) {
      return false;
    }
    const d = json.data;
    await saveSession(d.accessToken, d.refreshToken, d.email);
    return true;
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}
