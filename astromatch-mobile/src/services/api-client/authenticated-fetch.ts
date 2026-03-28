import { clearSession, getAccessToken } from '../auth/session';
import { apiUrl } from './api-base';
import { refreshSession } from './refresh-session';

let sessionInvalidationHandler: (() => void) | null = null;

/** Called after local session is cleared following failed auth (refresh or repeated 401). */
export function setSessionInvalidationHandler(handler: (() => void) | null): void {
  sessionInvalidationHandler = handler;
}

/**
 * Fetch with Bearer access token. On 401, runs refresh once and retries.
 * Clears session and invokes {@link setSessionInvalidationHandler} if auth cannot be restored.
 * Prefer GET or POST with a string/JSON-serializable body so retry can re-send safely.
 */
export async function authenticatedFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith('http') ? path : apiUrl(path);

  const send = async () => {
    const token = await getAccessToken();
    const headers = new Headers(init?.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }
    return fetch(url, { ...init, headers });
  };

  let res = await send();
  if (res.status !== 401) {
    return res;
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    await clearSession();
    sessionInvalidationHandler?.();
    return res;
  }

  res = await send();
  if (res.status === 401) {
    await clearSession();
    sessionInvalidationHandler?.();
  }
  return res;
}
