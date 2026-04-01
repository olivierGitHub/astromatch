import { apiUrl } from './api-base';
import { authenticatedFetch } from './authenticated-fetch';
import { RegistrationApiError } from './types';

export const DYNAMIC_LABELS = [
  { id: 'deep_connection', title: 'Deep connection' },
  { id: 'playful_exploration', title: 'Playful exploration' },
  { id: 'slow_burn', title: 'Slow burn' },
  { id: 'adventure_together', title: 'Adventure together' },
  { id: 'spiritual_alignment', title: 'Spiritual alignment' },
  { id: 'friendship_first', title: 'Friendship first' },
  { id: 'passion_forward', title: 'Passion forward' },
  { id: 'co_creation', title: 'Co-creation' },
] as const;

export async function fetchPrivacyNotice(): Promise<string> {
  const res = await fetch(apiUrl('/api/v1/legal/privacy'));
  const text = await res.text();
  const json = JSON.parse(text) as { data: { content: string } | null };
  if (!res.ok || !json.data?.content) throw new Error('privacy');
  return json.data.content;
}

export async function searchPlaces(q: string): Promise<{ label: string; lat: number; lng: number; timezone: string }[]> {
  const res = await fetch(`${apiUrl('/api/v1/places/search')}?q=${encodeURIComponent(q)}`);
  const text = await res.text();
  const json = JSON.parse(text) as { data: { places: { label: string; lat: number; lng: number; timezone: string }[] } };
  if (!res.ok || !json.data?.places) return [];
  return json.data.places;
}

async function parseErr(res: Response): Promise<RegistrationApiError> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { error?: { code: string; message: string; traceId?: string } };
    return new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: {
        code: j.error?.code ?? 'ERROR',
        message: j.error?.message ?? text,
        traceId: j.error?.traceId ?? '',
      },
    });
  } catch {
    return new RegistrationApiError(res.status, {
      data: null,
      meta: {},
      error: { code: 'ERROR', message: text, traceId: '' },
    });
  }
}

export type Gender = 'MALE' | 'FEMALE';
export type Attraction = 'MEN' | 'WOMEN' | 'ALL';

export async function putIdentity(gender: Gender, attraction: Attraction): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/profile/identity', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ gender, attraction }),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function putConsents(body: Record<string, boolean>): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/consents', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function putBirthProfile(payload: {
  birthDate: string | null;       // "YYYY-MM-DD"
  birthTimeUnknown: boolean;
  birthTime: string | null;
  birthPlaceLabel: string;
  birthPlaceLat: number | null;
  birthPlaceLng: number | null;
  birthTimezone: string;
}): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/profile/birth', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function putLocationProfile(payload: {
  label: string;
  lat: number | null;
  lng: number | null;
  manual: boolean;
}): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/profile/location', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function putDynamics(labels: string[]): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/profile/dynamics', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ labels }),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function putFirstName(firstName: string): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/profile/firstname', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ firstName }),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function putRedFlags(flags: string[]): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/profile/redflags', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ flags }),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function putBio(bio: string): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/profile/bio', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ bio }),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function completeOnboarding(): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/onboarding/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: '{}',
  });
  if (!res.ok) throw await parseErr(res);
}

export type ProfileSnapshot = {
  bio: string | null;
  redFlags: string[];
  birthDate: string | null;       // "YYYY-MM-DD"
  birthTime: string | null;       // "HH:mm:ss"
  birthTimeUnknown: boolean;
  birthPlaceLabel: string | null;
  birthTimezone: string | null;
};

export async function fetchMyProfile(): Promise<ProfileSnapshot> {
  const res = await authenticatedFetch('/api/v1/me/profile', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: ProfileSnapshot };
  return j.data;
}

export type MyPhotoDto = {
  id: string;
  sortOrder: number;
  contentType: string;
};

export async function fetchMyPhotos(): Promise<MyPhotoDto[]> {
  const res = await authenticatedFetch('/api/v1/me/profile/photos', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: MyPhotoDto[] };
  return j.data ?? [];
}

export async function uploadProfilePhotoAndGetId(uri: string): Promise<MyPhotoDto> {
  const form = new FormData();
  const name = uri.split('/').pop() ?? 'photo.jpg';
  const ext = name.split('.').pop()?.toLowerCase();
  const type =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  form.append('file', { uri, name, type } as unknown as Blob);
  const res = await authenticatedFetch('/api/v1/me/profile/photos', {
    method: 'POST',
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: MyPhotoDto };
  return j.data;
}

export async function deleteProfilePhoto(photoId: string): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/me/profile/photos/${photoId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw await parseErr(res);
}

export async function reorderProfilePhotos(orderedIds: string[]): Promise<void> {
  const res = await authenticatedFetch('/api/v1/me/profile/photos/order', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function uploadProfilePhoto(uri: string): Promise<void> {
  const form = new FormData();
  const name = uri.split('/').pop() ?? 'photo.jpg';
  const ext = name.split('.').pop()?.toLowerCase();
  const type =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  form.append('file', { uri, name, type } as unknown as Blob);
  const res = await authenticatedFetch('/api/v1/me/profile/photos', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw await parseErr(res);
}

export async function deleteAccountRemote(): Promise<void> {
  const res = await authenticatedFetch('/api/v1/account', { method: 'DELETE' });
  if (!res.ok) throw await parseErr(res);
}
