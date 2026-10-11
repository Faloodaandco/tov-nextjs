export async function sendWhatsAppMessage(phoneId: string, to: string, messagePayload: any) {
  const token = process.env.META_CATALOG_ACCESS_TOKEN;
  if (!token) {
    console.error('[WABA API] Missing META_CATALOG_ACCESS_TOKEN');
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
        if (attempt < maxAttempts && res.status >= 500) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
      }
      return data;
    } catch (error: any) {
      console.error(`[WABA API] Fetch error (attempt ${attempt}):`, error?.message || error);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      return null;
    }
  }
  return null;
}
