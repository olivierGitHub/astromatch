import { authenticatedFetch } from './authenticated-fetch';
import { apiUrl } from './api-base';
import { RegistrationApiError } from './types';

export type ReportContext = 'FEED' | 'CHAT' | 'MATCH';

export type HelpChannel = {
  id: string;
  label: string;
  description: string;
  contactHint: string;
};

export type HelpChannelsPayload = {
  accountAndData: HelpChannel[];
  billingAndPurchases: HelpChannel[];
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

export async function submitSafetyReport(
  reportedUserId: string,
  context: ReportContext,
  reasonCode: string,
  detail?: string,
): Promise<{ reportId: string }> {
  const res = await authenticatedFetch('/api/v1/safety/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      reportedUserId,
      context,
      reasonCode,
      detail: detail ?? undefined,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw await parseErr(res);
  const j = JSON.parse(text) as { data: { reportId: string } };
  return j.data;
}

export async function blockUser(blockedUserId: string): Promise<void> {
  const res = await authenticatedFetch('/api/v1/safety/block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ blockedUserId }),
  });
  if (!res.ok) throw await parseErr(res);
}

export async function unblockUser(blockedUserId: string): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/safety/blocks/${blockedUserId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await parseErr(res);
}

export async function fetchHelpChannels(): Promise<HelpChannelsPayload> {
  const res = await fetch(apiUrl('/api/v1/help/channels'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { error?: { message: string } };
      throw new Error(j.error?.message ?? text);
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e;
      throw new Error(text);
    }
  }
  const j = JSON.parse(text) as { data: HelpChannelsPayload };
  return j.data;
}
