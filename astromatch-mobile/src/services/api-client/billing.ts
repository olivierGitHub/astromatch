import { authenticatedFetch } from './authenticated-fetch';
import { RegistrationApiError } from './types';

export type BillingPlatform = 'ios' | 'android';

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

export async function validatePurchase(body: {
  platform: BillingPlatform;
  productId: string;
  receiptData: string;
  transactionId?: string;
  destinationLabel?: string;
}): Promise<void> {
  const res = await authenticatedFetch('/api/v1/billing/purchase/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseErr(res);
}

export type RestoreItem = {
  platform: BillingPlatform;
  productId: string;
  transactionId?: string;
  receiptData?: string;
  destinationLabel?: string;
};

export async function restorePurchases(items: RestoreItem[]): Promise<void> {
  const res = await authenticatedFetch('/api/v1/billing/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw await parseErr(res);
}
