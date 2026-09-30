import { adminDb } from '../src/config/firebaseAdmin';

async function main() {
  console.log('Fetching recent orders...');
  const snap = await adminDb.collection('orders')
    .orderBy('created_at', 'desc')
    .limit(5)
    .get();

  snap.forEach(doc => {
    const data = doc.data();
    console.log(`Order ID: ${doc.id}`);
    console.log(`- Status: ${data.status}`);
    console.log(`- Payment: ${data.payment_status} (${data.payment_method || 'Unknown'})`);
    console.log(`- Total: £${data.total?.toFixed(2)}`);
    console.log(`- Customer: ${data.customer?.name} (${data.customer?.phone})`);
    console.log(`- Created: ${data.created_at}`);
    console.log(`- Items: ${data.items?.length || 0}`);
    console.log('---');
  });
}

main().catch(console.error);
