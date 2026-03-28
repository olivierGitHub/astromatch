import { apiUrl } from './api-base';
import type { ApiEnvelope, RegisterSuccessData } from './types';
import { RegistrationApiError } from './types';

export type RegisterRequest = {
  email: string;
  password: string;
  /** ISO date YYYY-MM-DD */
  birthDate: string;
};

function traceIdFromResponse(res: Response): string {
  return res.headers.get('X-Trace-Id')?.trim() ?? '';
}

function parseEnvelope(text: string, res: Response): ApiEnvelope<RegisterSuccessData> {
  if (!text.trim()) {
    const traceId = traceIdFromResponse(res);
    throw new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Empty response body',
        details: null,
        traceId,
      },
    });
  }
  try {
    return JSON.parse(text) as ApiEnvelope<RegisterSuccessData>;
  } catch {
    const traceId = traceIdFromResponse(res);
    throw new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Response was not valid JSON',
        details: null,
        traceId,
      },
    });
  }
}

export async function registerAccount(req: RegisterRequest): Promise<ApiEnvelope<RegisterSuccessData>> {
  const url = apiUrl('/api/v1/auth/register');
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
    throw new RegistrationApiError(res.status, json as unknown as ApiEnvelope<null>);
  }
  return json;
}
