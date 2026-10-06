/**
 * Taste of Village Hayes — Edge RAG Vector Sync & Ingestion Engine
 *
 * Uses local Ollama edge nodes (mkr4 at 192.168.0.99 / rnw2 at 192.168.0.156)
 * with `nomic-embed-text` (768 dimensions) to create a self-contained,
 * zero-latency in-memory vector database for redundant RAG failover.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Edge node endpoints in priority order (LAN + Tailscale)
const OLLAMA_HOSTS = [
  { host: '192.168.0.99', port: 11434, name: 'mkr4-lan' },
  { host: '100.90.59.82', port: 11434, name: 'mkr4-tailscale' },
  { host: '192.168.0.156', port: 11434, name: 'rnw2-lan' },
  { host: '100.83.112.2', port: 11434, name: 'rnw2-tailscale' },
];

const EMBEDDING_MODEL = 'nomic-embed-text:latest';

function getEmbedding(text, hostConfig) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: text.trim(),
    });

    const req = http.request(
      {
        hostname: hostConfig.host,
        port: hostConfig.port,
        path: '/api/embeddings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 8000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (json.embedding && Array.isArray(json.embedding)) {
              resolve(json.embedding);
            } else {
              reject(new Error(`No embedding array in response: ${body.slice(0, 100)}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body.slice(0, 100)}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Embedding request timed out to ${hostConfig.name}`));
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function getEmbeddingWithFallback(text) {
  for (const hostConfig of OLLAMA_HOSTS) {
    try {
      const vec = await getEmbedding(text, hostConfig);
      return { vec, sourceNode: hostConfig.name };
    } catch (err) {
      // Try next node in cluster
    }
  }
  throw new Error('All edge Ollama nodes failed to generate embedding');
}

// ── Cosine Similarity for Vector Search ──────────────────────────────
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  console.log('🚀 Starting Taste of Village Edge RAG Knowledge Ingestion...');

  // 1. Read Knowledge Source Code
  const knowledgePath = path.join(__dirname, '../src/data/tovKnowledge.ts');
  const code = fs.readFileSync(knowledgePath, 'utf8');

  // Parse extracted items (using regex extraction to stay standalone JS)
  const chunks = [];

  // 1. FAQs
  const faqRegex = /{\s*category:\s*'([^']+)',\s*topic:\s*'([^']+)',\s*question:\s*'([^']+)',\s*answer:\s*'([^']+)'/g;
  let m;
  while ((m = faqRegex.exec(code)) !== null) {
    chunks.push({
      id: `faq_${chunks.length + 1}`,
      type: 'faq',
      title: `${m[2]} (${m[1]})`,
      text: `Q: ${m[3]} A: ${m[4]}`,
      rawQuestion: m[3],
      rawAnswer: m[4],
      category: m[1],
    });
  }

  // 2. Chef Tasting Profiles
  const profileRegex = /name:\s*'([^']+)',\s*category:\s*'([^']+)',\s*price:\s*([0-9.]+),\s*heatLevel:\s*([0-9]+)[\s\S]*?tastingHook:\s*'([^']+)'/g;
  while ((m = profileRegex.exec(code)) !== null) {
    chunks.push({
      id: `dish_${chunks.length + 1}`,
      type: 'dish_profile',
      title: m[1],
      price: parseFloat(m[3]),
      heatLevel: parseInt(m[4], 10),
      text: `Dish: ${m[1]} | Price: £${m[3]} | Heat: ${m[4]}/5 | Tasting Hook: ${m[5]}`,
      tastingHook: m[5],
      category: m[2],
    });
  }

  // 3. Objection Handlers
  const objectionRegex = /objection:\s*'([^']+)',\s*rootFear:\s*'([^']+)',\s*rapidChefResponse:\s*'([^']+)',\s*closingQuestion:\s*'([^']+)'/g;
  while ((m = objectionRegex.exec(code)) !== null) {
    chunks.push({
      id: `obj_${chunks.length + 1}`,
      type: 'objection_handler',
      title: `Objection: ${m[1]}`,
      text: `Customer concern: ${m[1]} -> Chef response: ${m[3]} Closing: ${m[4]}`,
      rapidResponse: m[3],
      closingQuestion: m[4],
    });
  }

  console.log(`📦 Extracted ${chunks.length} distinct culinary & sales chunks from tovKnowledge.ts`);

  // Embed each chunk
  const vectorEntries = [];
  let successfulNode = '';

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`   [${i + 1}/${chunks.length}] Embedding "${chunk.title.slice(0, 40)}" ... `);

    try {
      const { vec, sourceNode } = await getEmbeddingWithFallback(chunk.text);
      successfulNode = sourceNode;
      vectorEntries.push({
        id: chunk.id,
        type: chunk.type,
        title: chunk.title,
        text: chunk.text,
        metadata: {
          category: chunk.category || 'general',
          price: chunk.price,
          heatLevel: chunk.heatLevel,
          tastingHook: chunk.tastingHook,
          rawQuestion: chunk.rawQuestion,
          rawAnswer: chunk.rawAnswer,
          rapidResponse: chunk.rapidResponse,
          closingQuestion: chunk.closingQuestion,
        },
        embedding: vec,
      });
      console.log(`✅ [768 dims via ${sourceNode}]`);
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }

  // Save to JSON vector file
  const outPath = path.join(__dirname, '../src/data/tov-edge-vectors.json');
  fs.writeFileSync(outPath, JSON.stringify(vectorEntries, null, 2), 'utf8');
  console.log(`\n💾 Successfully saved ${vectorEntries.length} embedded vectors to ${outPath}`);
  console.log(`   File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);

  // ── Run Vector Similarity Search Test ─────────────────────────────
  console.log('\n🔍 Running Verification Similarity Searches:');
  const testQueries = [
    'Is your chicken and lamb halal certified?',
    'What is your best wok-cooked lamb karahi?',
    'Why does fresh food take 20 minutes?',
    'What sharing platter feeds 4 people?',
  ];

  for (const q of testQueries) {
    console.log(`\nQuery: "${q}"`);
    const { vec } = await getEmbeddingWithFallback(q);
    const scored = vectorEntries.map((e) => ({
      title: e.title,
      type: e.type,
      text: e.text,
      score: cosineSimilarity(vec, e.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 2);
    top.forEach((res, rank) => {
      console.log(`   #${rank + 1} (Score: ${(res.score * 100).toFixed(1)}%) [${res.type}] ${res.title}`);
    });
  }

  console.log('\n✨ Edge RAG Vector Ingestion Complete!');
}

main().catch((err) => {
  console.error('Fatal error in sync-edge-rag:', err);
  process.exit(1);
});
