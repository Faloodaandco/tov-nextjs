import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, postcode } = body;

    if (!name || !phone || !postcode) {
      return NextResponse.json({ error: 'Name, phone, and postcode are required.' }, { status: 400 });
    }

    // Sanitize phone number (basic)
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    const leadDoc = {
      name: name.slice(0, 100),
      phone: cleanPhone.slice(0, 20),
      email: email ? email.slice(0, 100) : null,
      postcode: postcode.toUpperCase().slice(0, 10),
      createdAt: new Date().toISOString(),
      source: 'student_promo_2026',
      offer: '50_off_first_3',
      ordersUsed: 0,
    };

    // Use phone number as document ID for idempotency/upsert
    await adminDb.collection('student_leads').doc(cleanPhone).set(leadDoc, { merge: true });

    // 1. Alert Restaurant (Email)
    await adminDb.collection('mail').add({
      to: ['info@tasteofvillagerestaurants.co.uk', 'sales@faloodaandco.co.uk'],
      message: {
        subject: `New Student Lead (50% Off): ${name.slice(0, 50)}`,
        html: `
          <h3>New Student Promo Signup</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${cleanPhone}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Postcode:</strong> ${postcode}</p>
        `,
      }
    });

    // 2. Alert Customer (Email - if provided)
    if (email) {
      await adminDb.collection('mail').add({
        to: [email],
        message: {
          subject: 'Your 50% Off Taste of Village Student Pass',
          html: `
            <div style="font-family: sans-serif; color: #133026; max-w-md; margin: 0 auto;">
              <h2 style="color: #a44230;">Welcome to Taste of Village</h2>
              <p>Hi ${name},</p>
              <p>Thanks for claiming your student pass. Use the promo code below for 50% off your first 3 orders (Delivery or Collection in Hayes & Slough).</p>
              <div style="background: #FAF8F3; border: 1px solid #133026; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="margin: 0; letter-spacing: 2px;">STUDENT50</h1>
              </div>
              <p>Order now at <a href="https://tasteofvillagerestaurants.co.uk" style="color: #133026;">tasteofvillagerestaurants.co.uk</a></p>
            </div>
          `,
        }
      });
    }

    // 3. Attempt WhatsApp (Free-form, might require a template in production)
    const { sendWhatsAppMessage } = await import('@/lib/waba');
    const phoneId = process.env.WABA_PHONE_ID || '1353080021225827';
    await sendWhatsAppMessage(phoneId, cleanPhone, {
      type: 'text',
      text: { 
        body: `Hi ${name}! 🎉\n\nHere is your Taste of Village Student Pass.\n\nUse code *STUDENT50* at checkout for 50% off your first 3 orders.\n\nOrder here: https://tasteofvillagerestaurants.co.uk`
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Student Lead API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
