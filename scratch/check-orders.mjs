import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { applicationDefault } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({ 
    credential: applicationDefault(),
    projectId: 'taste-of-village-21052'
  });
}

const db = getFirestore();

async function main() {
  console.log('Fetching recent orders...');
  const snap = await db.collection('orders')
    .orderBy('created_at', 'desc')
    .limit(10)
    .get();

  snap.forEach(doc => {
    const data = doc.data();
    console.log(`Order ID: ${doc.id}`);
    console.log(`- Status: ${data.status}`);
    console.log(`- Payment: ${data.payment_status} (${data.payment_method || 'Unknown'})`);
    console.log(`- Total: £${data.total?.toFixed(2)}`);
    console.log(`- Customer: ${data.customer?.name} (${data.customer?.phone})`);
    console.log(`- Created: ${data.created_at}`);
    console.log('---');
  });
}

main().catch(console.error);
