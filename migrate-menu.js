const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccount = require('./service-account.json');
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

async function run() {
  const menuData = JSON.parse(fs.readFileSync('src/data/tov-menu.json', 'utf8'));
  console.log(`Loaded ${menuData.length} items from JSON.`);

  const batch = db.batch();
  for (const item of menuData) {
    const docRef = db.collection('menuItems').doc(item.id);
    batch.set(docRef, item);
  }
  
  await batch.commit();
  console.log('Successfully pushed menu to Firestore!');
}

run().then(() => process.exit(0)).catch(console.error);
