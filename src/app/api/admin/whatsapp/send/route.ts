import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/waba';
import { adminDb } from '@/lib/firebaseAdmin';
import { authenticateAdminRequest } from '@/lib/adminServerGuard';

export async function POST(request: NextRequest) {
  const admin = await authenticateAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { to, message, branch = 'hayes' } = body;

    if (!to || !message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Recipient phone ("to") and message text are required' }, { status: 400 });
    }

    const cleanPhone = to.replace(/[^0-9]/g, '');
    const isSlough = branch === 'slough';
    const phoneId = isSlough
      ? (process.env.TOV_SLOUGH_PHONE_ID || '1395146440346525')
      : (process.env.TOV_HAYES_PHONE_ID || '1309829288888481');

    const result = await sendWhatsAppMessage(phoneId, cleanPhone, {
      type: 'text',
      text: { body: message.trim() },
    });

    if (!result || result.error) {
      return NextResponse.json({
        error: result?.error?.message || result?.error || 'Failed to send WhatsApp message via Meta API',
      }, { status: 502 });
    }

    // Save outbound message to chat thread
    const now = new Date().toISOString();
    await adminDb.collection('whatsapp_conversations').doc(cleanPhone).set({
      phone: cleanPhone,
      lastMessage: message.trim(),
      timestamp: now,
      branchId: isSlough ? 'slough' : 'hayes',
    }, { merge: true });

    await adminDb.collection('whatsapp_conversations').doc(cleanPhone).collection('messages').add({
      phone: cleanPhone,
      name: `${admin.name} (Staff)`,
      direction: 'outbound',
      body: message.trim(),
      timestamp: now,
      read: true,
      staffId: admin.id,
      phoneId,
    });

    return NextResponse.json({
      success: true,
      messageId: result?.messages?.[0]?.id,
    });
  } catch (error: any) {
    console.error('[Admin WhatsApp Send API] Error:', error);
    return NextResponse.json({ error: error.message || 'Send message failed' }, { status: 500 });
  }
}
