const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf-8');
let base64Key = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('FIREBASE_SERVICE_ACCOUNT_BASE64=')) {
    base64Key = line.split('=')[1];
  }
});

let app;
if (base64Key) {
  const decoded = Buffer.from(base64Key, 'base64').toString('utf-8');
  app = initializeApp({ credential: cert(JSON.parse(decoded)) });
} else {
  app = initializeApp({ projectId: 'taste-of-village-21052' });
}

const db = getFirestore(app);
async function run() {
  const collections = await db.listCollections();
  console.log("COLLECTIONS:", collections.map(c => c.id).join(", "));
  
  for (const c of ['menuItems', 'menu', 'products']) {
    const snap = await db.collection(c).limit(5).get();
    if (snap.size > 0) {
      console.log(`\nFound ${c}:`);
      snap.forEach(doc => console.log(doc.id, doc.data()));
    }
  }
}
run().then(() => process.exit(0)).catch(console.error);
