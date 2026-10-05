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

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[WABA API] Error sending message:', data);
    }
    return data;
  } catch (error) {
    console.error('[WABA API] Fetch error:', error);
    return null;
  }
}
