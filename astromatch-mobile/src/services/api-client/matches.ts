import { apiUrl } from './api-base';
import { authenticatedFetch } from './authenticated-fetch';
import { RegistrationApiError } from './types';

export function matchProfilePhotoUrl(otherUserId: string, photoId: string): string {
  return apiUrl(`/api/v1/matches/profiles/${otherUserId}/photos/${photoId}`);
}

export type MatchSummary = {
  matchId: string;
  otherUserId: string;
  otherEmail: string;
  firstName: string;
  firstPhotoId: string | null;
  lastMessageBody: string | null;
  lastMessageSenderId: string | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
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

export async function fetchMatches(): Promise<MatchSummary[]> {
  const res = await authenticatedFetch('/api/v1/matches', { method: 'GET', headers: { Accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: MatchSummary[] };
  return j.data ?? [];
}

export async function fetchMessages(matchId: string): Promise<ChatMessage[]> {
  const res = await authenticatedFetch(`/api/v1/matches/${matchId}/messages`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: ChatMessage[] };
  return j.data ?? [];
}

export async function sendMessage(matchId: string, body: string): Promise<ChatMessage> {
  const res = await authenticatedFetch(`/api/v1/matches/${matchId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ body }),
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: ChatMessage };
  return j.data;
}
