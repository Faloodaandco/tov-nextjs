import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendWhatsAppMessage } from '@/lib/waba';
import { LOCATIONS } from '@/config/shopConfig';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;
    const url = new URL(request.url);
    const paramSecret = url.searchParams.get('secret');

    // Security Verification
    if (secret && authHeader !== `Bearer ${secret}` && paramSecret !== secret) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const hayesPhoneId = process.env.TOV_HAYES_PHONE_ID;
    const sloughPhoneId = process.env.TOV_SLOUGH_PHONE_ID;

    if (!hayesPhoneId || !sloughPhoneId) {
      return NextResponse.json({
        error: 'Missing TOV_HAYES_PHONE_ID or TOV_SLOUGH_PHONE_ID in environment',
      }, { status: 500 });
    }

    // Determine current ISO week to prevent duplicate sends
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
    const broadcastId = `friday_${now.getFullYear()}_w${weekNumber}`;

    const broadcastLogRef = adminDb.collection('broadcast_logs').doc(broadcastId);
    const logSnap = await broadcastLogRef.get();
    if (logSnap.exists) {
      return NextResponse.json({
        status: 'skipped',
        message: `Broadcast ${broadcastId} was already sent on ${logSnap.data()?.sentAt}`,
      });
    }

    // Query active customers with opt-in for marketing
    const customersSnap = await adminDb.collection('customers')
      .where('optedIn', '==', true)
      .limit(50)
      .get();

    let sentCount = 0;
    let failedCount = 0;

    for (const doc of customersSnap.docs) {
      const data = doc.data();
      const phone = data.phone;
      const name = data.name || 'Friend';
      const branch = data.preferredBranch === 'slough' ? 'slough' : 'hayes';
      const phoneId = branch === 'slough' ? sloughPhoneId : hayesPhoneId;
      const branchName = branch === 'slough' ? 'Slough (Farnham Rd)' : 'Hayes (Uxbridge Rd)';

      if (!phone) continue;

      const messagePayload = {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: 'Weekend Desi Feast' },
          body: {
            text: `Salam ${name}! Weekend dinner is sorted at Taste of Village ${branchName}.\n\nIndulge in our slow-simmered Handi Karahi, sizzling Mixed Grills, and fresh Roghni Naans hot from the clay tandoor.\n\nOrder online for prompt collection or local delivery!`,
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: `tov_wknd_${branch}`,
                  title: '🍛 View Menu',
                },
              },
              {
                type: 'reply',
                reply: {
                  id: `tov_book_${branch}`,
                  title: '📅 Book Table',
                },
              },
            ],
          },
        },
      };

      const res = await sendWhatsAppMessage(phoneId, phone, messagePayload);
      if (res?.messages?.[0]?.id) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    // Record broadcast log
    await broadcastLogRef.set({
      sentAt: new Date().toISOString(),
      sentCount,
      failedCount,
      totalAudience: customersSnap.size,
    });

    return NextResponse.json({
      status: 'success',
      broadcastId,
      sentCount,
      failedCount,
      totalAudience: customersSnap.size,
    });
  } catch (error: any) {
    console.error('[Friday Broadcast Cron] Error:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
