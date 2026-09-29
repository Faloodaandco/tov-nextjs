import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Validates UK phone number format (starts with 07 or +44, 10-11 digits).
 */
function isValidUKPhone(rawPhone: string): boolean {
  if (!rawPhone || typeof rawPhone !== 'string') return false;
  const cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  // UK mobile: starts with 07 and has 10 or 11 digits
  if (cleaned.startsWith('07')) {
    return /^\d{10,11}$/.test(cleaned);
  }
  // International UK format: starts with +44
  if (cleaned.startsWith('+44')) {
    const afterCode = cleaned.slice(3);
    if (afterCode.startsWith('07')) {
      return /^\d{10,11}$/.test(afterCode);
    }
    // 9 to 11 digits following +44
    return /^\d{9,11}$/.test(afterCode);
  }
  return false;
}

/**
 * GET /api/bookings
 * Returns slot availability counts for a given date and branch (no customer PII).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const branch = searchParams.get('branch')?.toLowerCase() || 'hayes';

    if (!date) {
      return NextResponse.json({ error: 'Date query parameter is required' }, { status: 400 });
    }

    const snapshot = await adminDb.collection('bookings')
      .where('date', '==', date)
      .get();

    const slotCounts: Record<string, number> = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const docBranch = (data.branch || data.location || '').toLowerCase();
      const docStatus = (data.status || '').toUpperCase();
      if (docBranch === branch && docStatus !== 'CANCELLED') {
        const time = data.time;
        if (time) {
          slotCounts[time] = (slotCounts[time] || 0) + 1;
        }
      }
    });

    return NextResponse.json({ date, branch, slotCounts });
  } catch (error: any) {
    console.error('[Bookings API GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

/**
 * POST /api/bookings
 * Validates and creates a booking using server-side Firebase Admin SDK.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = (body.name || body.customerName || '').trim();
    const phone = (body.phone || body.customerPhone || '').trim();
    const email = (body.email || body.customerEmail || '').trim();
    const date = (body.date || '').trim();
    const time = (body.time || '').trim();
    const guests = body.guests;
    let branch = (body.branch || '').trim().toLowerCase();
    const location = (body.location || '').trim().toLowerCase();

    if (!branch && location) {
      if (location.includes('slough') || location === 'f0b00da2-4444-4444-4444-000000000005') {
        branch = 'slough';
      } else if (location.includes('hayes') || location === 'f0b00da2-4444-4444-4444-000000000004' || location === 'taste-of-village-21052') {
        branch = 'hayes';
      } else {
        branch = location;
      }
    }

    // 1. Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    if (!time) {
      return NextResponse.json({ error: 'Time is required' }, { status: 400 });
    }
    if (guests === undefined || guests === null || guests === '') {
      return NextResponse.json({ error: 'Number of guests is required' }, { status: 400 });
    }
    if (!branch) {
      return NextResponse.json({ error: 'Branch is required' }, { status: 400 });
    }

    // 2. Validate branch is 'hayes' or 'slough'
    if (branch !== 'hayes' && branch !== 'slough') {
      return NextResponse.json(
        { error: 'Invalid branch. Branch must be "hayes" or "slough"' },
        { status: 400 }
      );
    }

    // 3. Validate guests is 1-20
    const guestsNum = Number(guests);
    if (!Number.isInteger(guestsNum) || guestsNum < 1 || guestsNum > 20) {
      return NextResponse.json(
        { error: 'Guests must be an integer between 1 and 20' },
        { status: 400 }
      );
    }

    // 4. Validate UK phone number format (starts with 07 or +44, 10-11 digits)
    if (!isValidUKPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid UK phone number. Phone number must start with 07 or +44 and contain 10-11 digits' },
        { status: 400 }
      );
    }

    // 5. Check slot capacity (max 5 bookings per 30-min slot per branch)
    let slotSnapshot;
    try {
      slotSnapshot = await adminDb.collection('bookings')
        .where('date', '==', date)
        .where('time', '==', time)
        .get();
    } catch {
      slotSnapshot = await adminDb.collection('bookings')
        .where('date', '==', date)
        .get();
    }

    const activeBookings = slotSnapshot.docs.filter((doc) => {
      const d = doc.data();
      const docBranch = (d.branch || d.location || '').toLowerCase();
      const docStatus = (d.status || '').toUpperCase();
      return (
        d.time === time &&
        docBranch === branch &&
        docStatus !== 'CANCELLED'
      );
    });

    if (activeBookings.length >= 5) {
      return NextResponse.json(
        { error: 'This time slot is fully booked. Maximum 5 bookings per slot allowed.' },
        { status: 409 }
      );
    }

    // 6. Generate ID and create booking document
    const bookingId = (body.id && typeof body.id === 'string' && body.id.trim())
      ? body.id.trim()
      : `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const bookingDoc = {
      id: bookingId,
      customerName: name,
      name,
      customerPhone: phone,
      phone,
      email,
      customerEmail: email,
      date,
      time,
      guests: guestsNum,
      branch,
      location: branch,
      tenant_id: 'taste-of-village-21052',
      tenantId: 'taste-of-village-21052',
      status: 'PENDING',
      notes: body.notes ? String(body.notes).trim() : '',
      ...(body.preOrderItems && Array.isArray(body.preOrderItems) && body.preOrderItems.length > 0 ? {
        preOrderItems: body.preOrderItems,
        preOrderTotal: typeof body.preOrderTotal === 'number' ? body.preOrderTotal : 0,
        paymentMethod: body.paymentMethod || 'store',
      } : {}),
      createdAt: Timestamp.now(),
    };

    // 7. Write to Firestore 'bookings' collection using adminDb
    await adminDb.collection('bookings').doc(bookingId).set(bookingDoc);

    // 8. Queue email notification asynchronously (non-blocking)
    try {
      const branchName = branch === 'slough' ? 'Taste of Village Slough' : 'Taste of Village Hayes';
      const storeEmail = 'info@tasteofvillagerestaurants.co.uk';
      const recipients = [storeEmail];
      if (email && !recipients.includes(email.toLowerCase())) {
        recipients.push(email.toLowerCase());
      }

      const subject = `📅 New Table Booking: ${date} at ${time} (${branchName})`;
      const text = `
🚨 NEW TABLE BOOKING
==================================
Booking ID: ${bookingId}
Branch:     ${branchName}
Date:       ${date}
Time:       ${time}
Guests:     ${guestsNum}

CUSTOMER DETAILS:
Name:       ${name}
Phone:      ${phone}
Email:      ${email}
Notes:      ${body.notes || 'None'}
==================================
`;
      const html = `<div style="font-family: Arial, sans-serif;">
        <h2 style="color: #1E3A34;">New Table Booking - ${branchName}</h2>
        <p><strong>Booking Reference:</strong> ${bookingId}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Guests:</strong> ${guestsNum}</p>
        <br/>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Notes:</strong> ${body.notes || 'None'}</p>
      </div>`;

      await adminDb.collection('mail').add({
        to: recipients,
        replyTo: email,
        message: { subject, text, html },
        bookingId,
        timestamp: new Date().toISOString(),
        status: 'queued',
      });
    } catch (emailErr) {
      console.warn('[Bookings API] Failed to queue booking email notification:', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        bookingId,
        id: bookingId,
        message: 'Booking created successfully',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[Bookings API POST] Server error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while processing booking' },
      { status: 500 }
    );
  }
}
