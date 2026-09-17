/**
 * Push notification utilities.
 * Wraps Firebase Cloud Messaging for web push notifications.
 */

export async function requestPushPermission(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    // Token retrieval would happen here via FCM
    return null;
  } catch (error) {
    console.error('[Push] Permission request failed:', error);
    return null;
  }
}

export async function getExistingPushToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return null;
}

export function setupForegroundNotifications(
  _callback: (payload: any) => void
): () => void {
  // No-op unsubscribe
  return () => {};
}
