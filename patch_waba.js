const fs = require('fs');
const file = 'src/app/api/waba/webhook/route.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { after } from 'next/server';")) {
  code = code.replace("import { NextRequest, NextResponse } from 'next/server';", "import { NextRequest, NextResponse, after } from 'next/server';");
}

const replacement = `
    const body = JSON.parse(rawBody);

    after(async () => {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const phoneId = change.value?.metadata?.phone_number_id;
          const messages = change.value?.messages || [];
          const contacts = change.value?.contacts || [];

          // Process messages in parallel to avoid sequential blocking delays!
          const messagePromises = messages.map(async (message: any) => {
            // ── Fast In-Memory Deduplication (0ms) ───────────────────
            if (SEEN_MESSAGE_IDS.has(message.id)) {
              return;
            }
            SEEN_MESSAGE_IDS.add(message.id);
            if (SEEN_MESSAGE_IDS.size > 2000) {
              const first = SEEN_MESSAGE_IDS.values().next().value;
              if (first) SEEN_MESSAGE_IDS.delete(first);
            }

            // Asynchronously persist to Firestore without blocking response
            adminDb.collection('webhook_dedup').doc(\`tov_\${message.id}\`).set({
              messageId: message.id,
              processedAt: new Date().toISOString(),
              expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }).catch(() => {});

            const from = message.from;
            const profileName = contacts[0]?.profile?.name || from;

            try {
              if (message.type === 'text') {
                await handleTextMessage(phoneId, from, profileName, message.text?.body || '');
              } else if (message.type === 'interactive') {
                await handleInteractiveMessage(phoneId, from, profileName, message);
              } else if (message.type === 'order') {
                await handleOrderMessage(phoneId, from, profileName, message);
              }
            } catch (msgErr) {
              console.error(\`[TOV WABA] Error handling message \${message.id}:\`, msgErr);
            }
          });

          await Promise.all(messagePromises);
        }
      }
    });

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
`;

// Replace the processing block
code = code.replace(/const body = JSON\.parse\(rawBody\);[\s\S]*?return new NextResponse\('EVENT_RECEIVED', \{ status: 200 \}\);/, replacement.trim());

fs.writeFileSync(file, code);
