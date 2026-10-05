const http = require('http');

const payload = {
  entry: [{
    changes: [{
      value: {
        metadata: { phone_number_id: '1353080021225827' },
        contacts: [{ profile: { name: 'Test User' } }],
        messages: [{
          from: '447000000000',
          id: `wamid.${Date.now()}`,
          type: 'text',
          text: { body: 'Menu' }
        }]
      }
    }]
  }]
};

const req = http.request('http://localhost:3000/api/waba/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-proxy': 'falooda-master'
  }
}, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});
req.on('error', console.error);
req.write(JSON.stringify(payload));
req.end();
