async function logWabaEvent(logData: {
  phoneId: string;
  to: string;
  type: string;
  status: 'success' | 'error';
  response?: any;
  error?: any;
}) {
  try {
    const { adminDb } = await import('@/lib/firebaseAdmin');
    await adminDb.collection('waba_logs').add({
      ...logData,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Non-blocking logging failure must never disrupt customer messaging
    console.warn('[WABA Logging] Failed to persist log:', err);
  }
}

async function recordOutboundChatMessage(to: string, messagePayload: any, phoneId: string) {
  try {
    const { adminDb } = await import('@/lib/firebaseAdmin');
    const now = new Date().toISOString();
    let text = '[Interactive Message]';
    if (messagePayload?.text?.body) {
      text = messagePayload.text.body;
    } else if (messagePayload?.interactive?.body?.text) {
      text = messagePayload.interactive.body.text;
    } else if (messagePayload?.type === 'template') {
      text = `[Template: ${messagePayload?.template?.name || 'notification'}]`;
    }

    const branch = (phoneId === process.env.TOV_SLOUGH_PHONE_ID) ? 'slough' : 'hayes';

    await adminDb.collection('whatsapp_conversations').doc(to).set({
      phone: to,
      lastMessage: text,
      timestamp: now,
      branchId: branch,
    }, { merge: true });

    await adminDb.collection('whatsapp_conversations').doc(to).collection('messages').add({
      phone: to,
      name: branch === 'slough' ? 'TOV Slough Concierge' : 'TOV Hayes Concierge',
      direction: 'outbound',
      body: text,
      timestamp: now,
      read: true,
      phoneId,
    });
  } catch (err) {
    console.warn('[WABA Chat Logging] Failed to record outbound message:', err);
  }
}

export async function sendWhatsAppMessage(phoneId: string, to: string, messagePayload: any) {
  const isSlough = phoneId === process.env.TOV_SLOUGH_PHONE_ID;
  const isHayes = phoneId === process.env.TOV_HAYES_PHONE_ID;

  const token =
    (isSlough && (process.env.META_SLOUGH_SYSTEM_USER_TOKEN || process.env.META_SLOUGH_ACCESS_TOKEN)) ||
    (isHayes && (process.env.META_HAYES_SYSTEM_USER_TOKEN || process.env.META_HAYES_ACCESS_TOKEN)) ||
    process.env.META_SYSTEM_USER_TOKEN ||
    process.env.META_CATALOG_ACCESS_TOKEN ||
    process.env.META_ACCESS_TOKEN;

  const payloadType = messagePayload?.type === 'interactive' && messagePayload?.interactive?.type
    ? `interactive_${messagePayload.interactive.type}`
    : (messagePayload?.type || 'unknown');

  if (!token) {
    console.error('[WABA API] Missing Meta Access Token for phoneId:', phoneId);
    logWabaEvent({
      phoneId,
      to,
      type: payloadType,
      status: 'error',
      error: 'Missing Meta Access Token',
    }).catch(() => {});
    return null;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    ...messagePayload,
  };

  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(`[WABA API] Error sending message (attempt ${attempt}):`, data);
        if (attempt === maxAttempts) {
          logWabaEvent({
            phoneId,
            to,
            type: payloadType,
            status: 'error',
            error: data,
          }).catch(() => {});
        }
        if (attempt < maxAttempts && res.status >= 500) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        return data;
      }

      logWabaEvent({
        phoneId,
        to,
        type: payloadType,
        status: 'success',
        response: data,
      }).catch(() => {});

      recordOutboundChatMessage(to, messagePayload, phoneId).catch(() => {});

      return data;
    } catch (error: any) {
      console.error(`[WABA API] Fetch error (attempt ${attempt}):`, error?.message || error);
      if (attempt === maxAttempts) {
        logWabaEvent({
          phoneId,
          to,
          type: payloadType,
          status: 'error',
          error: error?.message || String(error),
        }).catch(() => {});
      }
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      return null;
    }
  }
  return null;
}
