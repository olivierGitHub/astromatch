import { apiUrl } from './api-base';
import { authenticatedFetch } from './authenticated-fetch';
import { RegistrationApiError } from './types';

export function matchProfilePhotoUrl(otherUserId: string, photoId: string): string {
  return apiUrl(`/api/v1/matches/profiles/${otherUserId}/photos/${photoId}`);
}

export function matchMessageAudioUrl(matchId: string, messageId: string): string {
  return apiUrl(`/api/v1/matches/${matchId}/messages/${messageId}/audio`);
}

export function matchMessageImageUrl(matchId: string, messageId: string): string {
  return apiUrl(`/api/v1/matches/${matchId}/messages/${messageId}/image`);
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

export type ChatMessageKind = 'TEXT' | 'AUDIO' | 'IMAGE';

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  kind: ChatMessageKind;
  audioDurationMs: number | null;
};

function parseChatMessage(row: unknown): ChatMessage {
  const o = row as Record<string, unknown>;
  const k = o.kind;
  const kind: ChatMessageKind =
    k === 'AUDIO' ? 'AUDIO' : k === 'IMAGE' ? 'IMAGE' : 'TEXT';
  const dur = o.audioDurationMs;
  return {
    id: String(o.id),
    senderId: String(o.senderId),
    body: typeof o.body === 'string' ? o.body : '',
    createdAt: String(o.createdAt),
    kind,
    audioDurationMs: dur == null || dur === '' ? null : Number(dur),
  };
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
  const j = JSON.parse(text) as { data: unknown[] };
  return (j.data ?? []).map(parseChatMessage);
}

export async function sendMessage(matchId: string, body: string): Promise<ChatMessage> {
  const res = await authenticatedFetch(`/api/v1/matches/${matchId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ body }),
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: unknown };
  return parseChatMessage(j.data);
}

export type VoiceUploadFile = { uri: string; name: string; type: string };

export async function sendVoiceMessage(
  matchId: string,
  file: VoiceUploadFile,
  durationMs: number,
): Promise<ChatMessage> {
  const formData = new FormData();
  formData.append('file', file as unknown as Blob);
  formData.append('durationMs', String(Math.max(0, Math.round(durationMs))));
  const res = await authenticatedFetch(`/api/v1/matches/${matchId}/messages/audio`, {
    method: 'POST',
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: unknown };
  return parseChatMessage(j.data);
}

export async function sendImageMessage(matchId: string, file: VoiceUploadFile): Promise<ChatMessage> {
  const formData = new FormData();
  formData.append('file', file as unknown as Blob);
  const res = await authenticatedFetch(`/api/v1/matches/${matchId}/messages/image`, {
    method: 'POST',
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: unknown };
  return parseChatMessage(j.data);
}
