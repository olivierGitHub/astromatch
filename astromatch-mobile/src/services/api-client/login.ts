import { apiUrl } from './api-base';
import type { ApiEnvelope, TokenBundle } from './types';
import { RegistrationApiError } from './types';

export type LoginRequest = {
  email: string;
  password: string;
};

export type { TokenBundle } from './types';

function traceIdFromResponse(res: Response): string {
  return res.headers.get('X-Trace-Id')?.trim() ?? '';
}

function parseEnvelope(text: string, res: Response): ApiEnvelope<TokenBundle> {
  if (!text.trim()) {
    throw new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Empty response body',
        details: null,
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
        details: null,
        traceId: traceIdFromResponse(res),
      },
    });
  }
}

export async function loginAccount(req: LoginRequest): Promise<ApiEnvelope<TokenBundle>> {
  const url = apiUrl('/api/v1/auth/login');
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(req),
    });
  } catch {
    throw new RegistrationApiError(0, {
      data: null,
      meta: {},
      error: {
        code: 'NETWORK_ERROR',
        message: 'Could not reach the server',
        details: null,
        traceId: '',
      },
    });
  }
  const text = await res.text();
  const json = parseEnvelope(text, res);
  if (!res.ok || json.error) {
    throw new RegistrationApiError(res.status, json as unknown as import('./types').ApiEnvelope<null>);
  }
  return json;
}
