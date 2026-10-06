import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

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

    // Direct lookup by document ID (Square checkout saves with doc(cleanOrderId))
    let docSnap = await adminDb.collection('orders').doc(orderId).get();

    // Fallback lookups if not found directly
    if (!docSnap.exists) {
      // 1. Look up by 'orderId' field
      const q = await adminDb.collection('orders').where('orderId', '==', orderId).limit(1).get();
      if (!q.empty) {
        docSnap = q.docs[0];
      } else {
        // 2. Try uppercase doc ID
        const upper = orderId.toUpperCase();
        docSnap = await adminDb.collection('orders').doc(upper).get();
        if (!docSnap.exists) {
          const qUpper = await adminDb.collection('orders').where('orderId', '==', upper).limit(1).get();
          if (!qUpper.empty) {
            docSnap = qUpper.docs[0];
          }
        }
      }
    }

    if (!docSnap.exists) {
      // 3. Fallback: Check whatsapp_orders collection
      const waDocSnap = await adminDb.collection('whatsapp_orders').doc(orderId).get();
      if (waDocSnap.exists) {
        const waData = waDocSnap.data() || {};
        return NextResponse.json({
          id: waData.orderId || waData.referenceId || orderId,
          orderId: waData.orderId || waData.referenceId || orderId,
          status: waData.status === 'PAID' ? 'CONFIRMED' : (waData.status || 'pending'),
          fulfillmentType: waData.fulfillmentType || 'collection',
          estimatedReadyMinutes: waData.fulfillmentType === 'delivery' ? 40 : 25,
          estimatedReadyAt: waData.estimatedReadyAt || null,
          branch: waData.branchId || 'hayes',
          createdAt: waData.createdAt || null,
          timestamp: waData.createdAt || null,
          total: (waData.totalPence || 0) / 100,
          customerName: waData.name || 'Customer',
          items: (waData.items || []).map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: (item.pricePence || 0) / 100,
            image: null,
          })),
        });
      }

      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const data = docSnap.data() || {};

    // Return fields needed by tracking UI — excludes phone, delivery address, payment IDs
    return NextResponse.json({
      id: data.orderId || data.id || orderId,
      orderId: data.orderId || data.id || orderId,
      status: data.status || 'pending',
      fulfillmentType: data.fulfillmentType || data.type || 'collection',
      estimatedReadyMinutes: data.estimatedReadyMinutes || 25,
      estimatedReadyAt: data.estimatedReadyAt || null,
      branch: data.branch || null,
      createdAt: data.createdAt || null,
      timestamp: data.timestamp || data.createdAt || null,
      total: data.total || 0,
      customerName: data.customerName || data.customer?.name || 'Customer',
      items: (data.items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price || 0,
        image: item.image || null,
      })),
    });
  } catch (err: any) {
    console.error('[Orders API] Error fetching order:', err);
    return NextResponse.json({ error: 'Failed to fetch order', message: err?.message }, { status: 500 });
  }
}
