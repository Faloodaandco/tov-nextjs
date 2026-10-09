import { NextRequest, NextResponse } from 'next/server';

function verifyPin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const pin = authHeader.split(' ')[1];
  return pin === process.env.STAFF_PIN;
}

const META_GRAPH_URL = 'https://graph.facebook.com/v21.0';

async function fetchFromMeta(endpoint: string, token: string) {
  try {
    const res = await fetch(`${META_GRAPH_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.error?.message || `HTTP ${res.status}`, status: res.status };
    }
    return await res.json();
  } catch (err: any) {
    return { error: err.message || 'Fetch failed' };
  }
}

export async function GET(request: NextRequest) {
  if (!verifyPin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hayesToken = process.env.META_HAYES_SYSTEM_USER_TOKEN || process.env.META_SYSTEM_USER_TOKEN;
  const sloughToken = process.env.META_SLOUGH_SYSTEM_USER_TOKEN || process.env.META_SYSTEM_USER_TOKEN;

  if (!hayesToken || !sloughToken) {
    return NextResponse.json({ error: 'Meta System User Tokens not configured' }, { status: 500 });
  }

  try {
    // 1. Fetch Hayes Data
    const [hayesWaba, hayesPhone, hayesCatalog] = await Promise.all([
      fetchFromMeta('1405724971671322?fields=id,name,currency,timezone_id', hayesToken),
      fetchFromMeta('1309829288888481?fields=id,display_phone_number,quality_rating,status,messaging_limit_tier', hayesToken),
      fetchFromMeta('987964757674623?fields=id,name,product_count', hayesToken),
    ]);

    // 2. Fetch Slough Data
    const [sloughWaba, sloughPhone, sloughCatalog] = await Promise.all([
      fetchFromMeta('2476578809531282?fields=id,name,currency,timezone_id', sloughToken),
      fetchFromMeta('1395146440346525?fields=id,display_phone_number,quality_rating,status,messaging_limit_tier', sloughToken),
      fetchFromMeta('1657059252594459?fields=id,name,product_count', sloughToken),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      hayes: {
        branch: 'Hayes',
        waba: hayesWaba,
        phone: hayesPhone,
        catalog: hayesCatalog,
        webhookUrl: 'https://www.tasteofvillagerestaurants.co.uk/api/waba/webhook',
      },
      slough: {
        branch: 'Slough',
        waba: sloughWaba,
        phone: sloughPhone,
        catalog: sloughCatalog,
        webhookUrl: 'https://www.tasteofvillagerestaurants.co.uk/api/waba/webhook',
      },
    });
  } catch (error: any) {
    console.error('[Admin WABA API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Meta WABA status', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyPin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { branch = 'hayes', recipientPhone } = body;

    if (!recipientPhone) {
      return NextResponse.json({ error: 'recipientPhone is required' }, { status: 400 });
    }

    const token = branch === 'slough'
      ? (process.env.META_SLOUGH_SYSTEM_USER_TOKEN || process.env.META_SYSTEM_USER_TOKEN)
      : (process.env.META_HAYES_SYSTEM_USER_TOKEN || process.env.META_SYSTEM_USER_TOKEN);

    const phoneId = branch === 'slough'
      ? (process.env.TOV_SLOUGH_PHONE_ID || '1395146440346525')
      : (process.env.TOV_HAYES_PHONE_ID || '1309829288888481');

    if (!token) {
      return NextResponse.json({ error: 'Missing Meta access token' }, { status: 500 });
    }

    // Format phone
    let formatted = String(recipientPhone).trim().replace(/\s+/g, '');
    if (formatted.startsWith('0')) {
      formatted = '+44' + formatted.slice(1);
    } else if (formatted.startsWith('44') && !formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }

    // Outbound ping
    const res = await fetch(`${META_GRAPH_URL}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formatted,
        type: 'text',
        text: {
          preview_url: false,
          body: `🔔 *Taste of Village (${branch.toUpperCase()}) Meta Diagnostics Ping*\n\nYour WhatsApp Cloud API pipeline is active and verified healthy.\nTimestamp: ${new Date().toLocaleTimeString('en-GB')}`
        }
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || 'Meta API call failed', details: data }, { status: 400 });
    }

    return NextResponse.json({ success: true, metaResponse: data });
  } catch (err: any) {
    console.error('[Admin WABA API POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
