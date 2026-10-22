import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { authenticateAdminRequest } from '@/lib/adminServerGuard';

export async function GET(request: NextRequest) {
  const admin = await authenticateAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');
  const branch = searchParams.get('branch'); // 'hayes' | 'slough' | 'all'

  try {
    // If phone query is provided, fetch messages for that specific conversation
    if (phone) {
      const messagesSnap = await adminDb
        .collection('whatsapp_conversations')
        .doc(phone)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .limit(100)
        .get();

      const messages = messagesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Mark unread as read
      await adminDb.collection('whatsapp_conversations').doc(phone).set(
        { unreadCount: 0 },
        { merge: true }
      ).catch(() => {});

      return NextResponse.json({ success: true, messages });
    }

    // Otherwise, fetch conversation list
    let query = adminDb.collection('whatsapp_conversations').limit(50);
    const snap = await query.get();

    let conversations = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        phone: data.phone || doc.id,
        name: data.name || data.profileName || 'Customer',
        lastMessage: data.lastMessage || (data.activeCart?.items?.length ? `Cart with ${data.activeCart.items.length} item(s)` : 'New inquiry'),
        timestamp: data.timestamp || data.updatedAt || new Date().toISOString(),
        branchId: data.branchId || (doc.id.includes(process.env.TOV_SLOUGH_PHONE_ID || '') ? 'slough' : 'hayes'),
        unreadCount: data.unreadCount || 0,
        activeCart: data.activeCart || null,
        lastPaidOrderId: data.lastPaidOrderId || null,
      };
    });

    // Filter by branch if requested
    if (branch && branch !== 'all') {
      conversations = conversations.filter(c => c.branchId === branch);
    }

    // Sort by timestamp descending
    conversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    console.error('[Admin WhatsApp API] Error fetching conversations:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch conversations' }, { status: 500 });
  }
}
