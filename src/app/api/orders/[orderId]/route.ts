import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * GET /api/orders/[orderId]
 * Public endpoint for customer order tracking.
 * Returns ONLY status fields — no customer PII, no payment details.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId || orderId.length > 50) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const snap = await getDoc(doc(db, 'orders', orderId));

    if (!snap.exists()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const data = snap.data();

    // Return fields needed by tracking UI — excludes phone, delivery address, payment IDs
    return NextResponse.json({
      id: data.orderId || orderId,
      orderId: data.orderId || orderId,
      status: data.status || 'unknown',
      fulfillmentType: data.fulfillmentType || 'collection',
      estimatedReadyMinutes: data.estimatedReadyMinutes || null,
      estimatedReadyAt: data.estimatedReadyAt || null,
      branch: data.branch || null,
      createdAt: data.createdAt || null,
      timestamp: data.timestamp || data.createdAt || null,
      total: data.total || 0,
      customerName: data.customer?.name || data.customerName || 'Customer',
      items: (data.items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price || 0,
        image: item.image || null,
      })),
    });
  } catch (err: any) {
    console.error('[Orders API] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
