import { apiUrl } from './api-base';
import { authenticatedFetch } from './authenticated-fetch';
import { RegistrationApiError } from './types';

export type FeedPhotoRef = {
  id: string;
  sortOrder: number;
  contentType: string;
};

export type NatalPlanet = {
  planet: string;
  symbol: string;
  sign: string;
};

export type FeedCandidateCard = {
  userId: string;
  cosmicContext: string;
  suggestedDynamicKey: string;
  suggestedDynamicTitle: string;
  localityLine: string;
  bioPreview: string;
  photos: FeedPhotoRef[];
  redFlags: string[];
  firstName: string;
  age: number;
  natalChart: NatalPlanet[];
};

export type SwipeAction = 'PASS' | 'LIKE' | 'SUPER_LIKE';

export type MismatchFocus = 'DYNAMIC' | 'PROFILE' | 'UNSPECIFIED';

export type MatchCreated = {
  matchId: string;
  otherUserId: string;
  myFirstPhotoId: string | null;
  otherFirstPhotoId: string | null;
  mySunSign: string | null;
  otherSunSign: string | null;
};

export type SwipeResult = {
  remainingLikesToday: number;
  remainingSupersToday: number;
  match: MatchCreated | null;
  bonusLikeCreditsRemaining: number;
};

export type FeedQuota = {
  remainingLikesToday: number;
  remainingSupersToday: number;
  dailyLikeCap: number;
  dailySuperLikeCap: number;
  bonusLikeCredits: number;
  alignmentBoostUntil: string | null;
  locationPassUntil: string | null;
  locationPassLabel: string | null;
};

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

export type PendingLike = {
  userId: string;
  firstName: string | null;
  firstPhotoId: string | null;
};

export async function fetchPendingLikes(): Promise<PendingLike[]> {
  const res = await authenticatedFetch('/api/v1/feed/likes', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: PendingLike[] };
  return j.data ?? [];
}

export async function fetchFeedProfile(userId: string): Promise<FeedCandidateCard> {
  const res = await authenticatedFetch(`/api/v1/feed/profiles/${userId}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: FeedCandidateCard };
  return j.data;
}

export async function fetchMyPreviewCard(): Promise<FeedCandidateCard> {
  const res = await authenticatedFetch('/api/v1/feed/me', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: FeedCandidateCard };
  return j.data;
}

export async function fetchFeedQuota(): Promise<FeedQuota> {
  const res = await authenticatedFetch('/api/v1/feed/quota', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: FeedQuota };
  return j.data;
}

export async function fetchFeedCandidates(): Promise<FeedCandidateCard[]> {
  const res = await authenticatedFetch('/api/v1/feed/candidates', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: { candidates: FeedCandidateCard[] } };
  return j.data?.candidates ?? [];
}

export async function postFeedMismatch(targetUserId: string, focus: MismatchFocus): Promise<void> {
  const res = await authenticatedFetch('/api/v1/feed/mismatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ targetUserId, focus }),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function postFeedSwipe(targetUserId: string, action: SwipeAction): Promise<SwipeResult> {
  const res = await authenticatedFetch('/api/v1/feed/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ targetUserId, action }),
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: SwipeResult };
  return j.data;
}

export function feedProfilePhotoUrl(ownerUserId: string, photoId: string): string {
  return apiUrl(`/api/v1/feed/profiles/${ownerUserId}/photos/${photoId}`);
}
