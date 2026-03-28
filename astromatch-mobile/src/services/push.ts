import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { authenticatedFetch } from './api-client/authenticated-fetch';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registers for push permissions, obtains an Expo push token when possible, and stores it server-side.
 * Failures are non-fatal (NFR-I2: log / skip when token unavailable in dev).
 */
export async function registerPushTokenWithServer(): Promise<void> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const projectId =
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
    const tokenRes = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : ({} as Notifications.ExpoPushTokenOptions),
    );
    const expoPushToken = tokenRes.data;
    await authenticatedFetch('/api/v1/me/device/push-token', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ expoPushToken }),
    });
  } catch (e) {
    console.warn('astromatch: push registration skipped', e);
  }
}
