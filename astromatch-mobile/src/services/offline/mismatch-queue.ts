import AsyncStorage from '@react-native-async-storage/async-storage';

import { postFeedMismatch, type MismatchFocus } from '../api-client/feed';

const STORAGE_KEY = 'astromatch_mismatch_queue_v1';
const MAX_PENDING = 50;

export type PendingMismatch = { targetUserId: string; focus: MismatchFocus };

export async function enqueueMismatch(pending: PendingMismatch): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const list: PendingMismatch[] = raw ? (JSON.parse(raw) as PendingMismatch[]) : [];
  list.push(pending);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_PENDING)));
}

/**
 * Retries queued mismatch submissions (e.g. after reconnect). Failures stay in the queue.
 */
export async function flushMismatchQueue(): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  let list: PendingMismatch[];
  try {
    list = JSON.parse(raw) as PendingMismatch[];
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }
  if (!list.length) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }
  const remaining: PendingMismatch[] = [];
  for (const p of list) {
    try {
      await postFeedMismatch(p.targetUserId, p.focus);
    } catch {
      remaining.push(p);
    }
  }
  if (remaining.length === 0) {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } else {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  }
}
