import { RegistrationApiError } from './types';
import { authenticatedFetch } from './authenticated-fetch';

export type MeResponse = {
  userId: string;
  email: string;
  onboardingCompleted: boolean;
  birthProfileComplete: boolean;
  locationComplete: boolean;
  dynamicsComplete: boolean;
  presentationComplete: boolean;
};

/** Authenticated GET /api/v1/auth/me — uses Bearer + refresh-on-401. */
export async function fetchMe(): Promise<MeResponse> {
  const res = await authenticatedFetch('/api/v1/auth/me', { method: 'GET' });
  const text = await res.text();
  let json: { data: MeResponse | null; error: { code: string; message: string } | null };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    throw new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: { code: 'INVALID_RESPONSE', message: 'Not JSON', traceId: '' },
    });
  }
  if (!res.ok || json.error || !json.data) {
    const err = json.error;
    throw new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: err
        ? { code: err.code, message: err.message, traceId: '' }
        : {
            code: 'ME_FAILED',
            message: 'Could not load profile',
            traceId: '',
          },
    });
  }
  return json.data;
}
