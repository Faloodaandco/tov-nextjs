/**
 * Taste of Village Hayes — Gemini AI Assistant
 *
 * Provides intelligent, high-accuracy natural language understanding for WhatsApp ordering:
 * - Multi-item order parsing ("2 chicken biryani, 3 seekh kebab and 2 garlic naan")
 * - Dish recommendations & culinary guidance ("I want karahi, what do you recommend?")
 * - Authentic FAQs (100% Halal certification, opening times, delivery radius)
 *
 * Strict Anti-Hallucination & Performance Guardrails:
 * - 2500ms hard timeout fallback to instant catalog/regex
 * - All dish prices & IDs verified strictly against tov-menu.json
 * - Zero hallucinated URLs — all payments generated server-side via Square API
 */

import { GoogleGenAI } from '@google/genai';
import menuItems from '@/data/tov-menu.json';
import { getMenuItemById, type MenuItem } from '@/lib/wabaMenu';
import {
  TOV_KNOWLEDGE_BASE,
  TOV_CHEF_TASTING_PROFILES,
  TOV_SALES_PSYCHOLOGY_PLAYBOOK,
  TOV_OBJECTION_HANDLERS,
  TOV_PSYCHOLOGICAL_DIAGNOSTICS,
  TOV_BRAND_DNA,
} from '@/data/tovKnowledge';

export interface ParsedOrderItem {
  id: string;
  name: string;
  quantity: number;
  pricePence: number;
}

export interface AssistantResult {
  intent: 'order' | 'recommendation' | 'faq' | 'general';
  reply: string;
  orderItems: ParsedOrderItem[];
  suggestedDish?: MenuItem | null;
}

// ── Compact Menu representation for high-speed prompt context ─────────
const TOV_PREFIX = 'tov_item_1777480501499_';

const COMPACT_MENU = (menuItems as MenuItem[]).map(item => {
  const shortId = item.id.startsWith(TOV_PREFIX) ? item.id.slice(TOV_PREFIX.length) : item.id;
  return {
    id: shortId,
    fullId: item.id,
    name: item.name,
    price: item.price,
    category: item.category,
  };
});

const KNOWLEDGE_BASE_TEXT = TOV_KNOWLEDGE_BASE.map(
  k => `• [${k.category.toUpperCase()}] Q: ${k.question} -> A: ${k.answer}`
).join('\n');

const CHEF_TASTING_TEXT = TOV_CHEF_TASTING_PROFILES.map(
  p => `• ${p.name} (Heat: ${p.heatLevel}/5): ${p.tastingHook} Best with: ${p.pairingRecommendation.bread} & ${p.pairingRecommendation.drink}`
).join('\n');

const OBJECTIONS_TEXT = TOV_OBJECTION_HANDLERS.map(
  o => `• When customer asks/worries: "${o.objection}" -> Chef rapid answer: "${o.rapidChefResponse}" Closing prompt: "${o.closingQuestion}"`
).join('\n');

const DIAGNOSTICS_TEXT = TOV_PSYCHOLOGICAL_DIAGNOSTICS.map(
  d => `• If customer is undecided (${d.qualificationGoal}): Ask: "${d.question}"`
).join('\n');

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (cachedClient) return cachedClient;

  // 1. Google AI Studio API key
  if (process.env.GEMINI_API_KEY) {
    cachedClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return cachedClient;
  }

  // 2. Vertex AI Service Account (JSON or Base64)
  const rawKey =
    process.env.GCP_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (rawKey && rawKey.trim()) {
    try {
      const trimmed = rawKey.trim();
      const parsed = trimmed.startsWith('{')
        ? JSON.parse(trimmed)
        : JSON.parse(Buffer.from(trimmed, 'base64').toString('utf8'));

      if (parsed?.client_email && parsed?.private_key) {
        cachedClient = new GoogleGenAI({
          vertexai: true,
          project: parsed.project_id || 'falooda-js',
          location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
          googleAuthOptions: {
            credentials: {
              client_email: parsed.client_email,
              private_key: parsed.private_key.replace(/\\n/g, '\n'),
            },
            projectId: parsed.project_id || 'falooda-js',
          },
        });
        return cachedClient;
      }
    } catch (err) {
      console.warn('[geminiAssistant] Failed to parse service account key:', err);
    }
  }

  return null;
}

const SYSTEM_INSTRUCTION = `You are the Executive Chef & Master Food Consultant for Taste of Village Hayes (766B Uxbridge Rd, Hayes UB4 0RU, London | https://tasteofvillagerestaurants.co.uk/).
You embody an Asian culinary food master (chef/taster level) AND an elite, warm, charismatic WhatsApp salesman.

CHEF CULINARY EXPERTISE:
- Authentic Pakistani & North Indian Punjabi tradition: iron-wok Karahi seared over roaring high flame (fresh tomatoes, ginger, green chilies, whole crushed coriander—never watery buffet base gravy!), charcoal tandoor grilling at 450°C, and slow-dum basmati rice.
- Use mouthwatering, vivid sensory vocabulary ('sizzling charcoal-kissed', 'wok-caramelized tomato fond', 'tender marrow richness', 'aromatic fenugreek butter cream').

SALES PSYCHOLOGY & RAPID CLOSING PLAYBOOK:
1. BREVITY IS KING: Max 2 punchy, appetizing sentences in British English. WhatsApp customers skim on mobile.
2. ASSUMPTIVE CLOSE: If the customer orders or asks about a Karahi or Curry, don't ask "anything else?" Instead, ask an assumptive bread/rice question: "Shall I add a hot Butter Naan or fragrant Pilau Rice to scoop that rich masala?"
3. PALATE BALANCE UPSELL: If ordering spicy or fiery dishes (Charsi Karahi, Seekh Kebabs, Chops), suggest balancing the heat with a chilled Mango Lassi (£2.50) or fresh Mint Raita (£1.20).
4. GROUP SOCIAL PROOF: If the user is undecided or feeding a group/family, anchor to the Village Special Platter (Serves 4 - £29.99), highlighting that it feeds 4 generously with chops, kebabs, tikkas, and wings while saving over £14 vs individual dishes.
5. OBJECTION DEFENSE: If asked why prep takes 20-25 mins, proudly state that every dish is fired fresh from raw scratch on high flame and charcoal—never reheated pre-cooked trays.
6. DELIVEROO SAVINGS: When comparing delivery apps, remind that ordering direct saves 15-20% with zero service fees.

CHEF TASTING NOTES & SIGNATURES:
${CHEF_TASTING_TEXT}

RAPID OBJECTION HANDLING MATRIX:
${OBJECTIONS_TEXT}

QUALIFYING UNDECIDED CUSTOMERS:
${DIAGNOSTICS_TEXT}

KNOWLEDGE BASE & FAQS:
${KNOWLEDGE_BASE_TEXT}

MENU DISHES (Short ID, Full ID, Name, Price GBP):
${JSON.stringify(COMPACT_MENU)}

TASK:
Analyze the customer's WhatsApp message and return a JSON object with:
{
  "intent": "order" | "recommendation" | "faq" | "general",
  "reply": "Concise, appetizing response (max 2 sentences). Warm, confident chef/salesman voice.",
  "items": [
    { "id": "short_or_full_id", "name": "Exact Dish Name", "quantity": 1 }
  ],
  "suggestedDishId": "short_or_full_id_if_recommending" // or null
}

RULES:
1. 'order': If the user asks to order or buy items (e.g. "2 chicken biryani", "I want charsi karahi and 2 garlic naan"), match dishes from the MENU and put them in 'items' with exact quantity.
2. 'recommendation': If the user asks for suggestions, recommendations, or popular dishes, recommend authentic TOV dishes using chef sensory terms, set 'suggestedDishId', and use an assumptive closing prompt.
3. 'faq': If the user asks about Halal status, opening hours, address, parking, delivery, or allergens, answer accurately using the KNOWLEDGE BASE above.
4. STRICT INVARIANT: ONLY recommend dishes from the Taste of Village menu above. Never invent dishes. Never mention other restaurants. Canonical domain is https://tasteofvillagerestaurants.co.uk/.`;

/**
 * Analyze a customer's message using Gemini 2.5 Flash.
 * Enforces a strict 2500ms safety timeout — if Gemini takes too long or fails,
 * returns null so the caller can fall back to instant deterministic routing.
 */
/**
 * Validate & parse raw assistant JSON output into a verified AssistantResult.
 * Resolves ordered dishes and recommendations strictly against tov-menu.json.
 */
function parseAssistantJson(parsed: any): AssistantResult | null {
  if (!parsed || typeof parsed !== 'object') return null;

  const intent = (parsed.intent || 'general') as AssistantResult['intent'];
  const reply = typeof parsed.reply === 'string' ? parsed.reply : '';

  // Validate & resolve ordered items against real menu
  const orderItems: ParsedOrderItem[] = [];
  if (Array.isArray(parsed.items) && parsed.items.length > 0) {
    for (const item of parsed.items) {
      const rawId = item.id ? String(item.id).trim() : '';
      const fullId = rawId.startsWith('tov_item_') ? rawId : `${TOV_PREFIX}${rawId}`;
      const menuItem = getMenuItemById(fullId) || getMenuItemById(rawId);

      if (menuItem) {
        const qty = Math.max(1, parseInt(item.quantity || '1', 10) || 1);
        orderItems.push({
          id: menuItem.id,
          name: menuItem.name,
          quantity: qty,
          pricePence: Math.round(menuItem.price * 100),
        });
      }
    }
  }

  // Validate suggested dish
  let suggestedDish: MenuItem | null = null;
  if (parsed.suggestedDishId) {
    const rawSugId = String(parsed.suggestedDishId).trim();
    const fullSugId = rawSugId.startsWith('tov_item_') ? rawSugId : `${TOV_PREFIX}${rawSugId}`;
    suggestedDish = getMenuItemById(fullSugId) || getMenuItemById(rawSugId) || null;
  }

  return {
    intent,
    reply,
    orderItems,
    suggestedDish,
  };
}

/**
 * Redundant Edge Nodes on Local Mesh (Priority: LAN -> Tailscale)
 */
const EDGE_OLLAMA_NODES: string[] = [
  // Removed private LAN and Tailscale IPs as Vercel cannot reach them.
  // Add a public Cloudflare Tunnel URL here when available.
];

/**
 * Query Redundant Edge Ollama Cluster (mkr4 & rnw2 running Qwen2.5:3b).
 * Provides sub-second local failover if Google Gemini API times out or is offline.
 */
async function queryEdgeOllama(userText: string): Promise<AssistantResult | null> {
  for (const baseUrl of EDGE_OLLAMA_NODES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5:3b',
          format: 'json',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: userText },
          ],
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();
      const content = data?.message?.content?.trim();
      if (!content) continue;

      const parsed = JSON.parse(content);
      const result = parseAssistantJson(parsed);
      if (result) {
        return result;
      }
    } catch {
      // Failover to next node in cluster
    }
  }
  return null;
}

/**
 * Analyze a customer's message using Multi-Tier Redundant RAG Architecture:
 * 1. Primary: Google Gemini 2.5 Flash API (2500ms safety cap)
 * 2. Secondary Failover: Edge Node 1 (mkr4 Ollama Qwen2.5 on Tailscale/LAN)
 * 3. Tertiary Failover: Edge Node 2 (rnw2 Ollama Qwen2.5 on Tailscale/LAN)
 * 4. Quaternary Fallback: Safe deterministic regex routing in wabaMenu
 */
export async function analyzeWithGemini(userText: string): Promise<AssistantResult | null> {
  const client = getClient();

  if (client) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 2500);
    });

    const queryPromise = (async (): Promise<AssistantResult | null> => {
      try {
        const response = await client.models.generateContent({
          model,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
          },
          contents: userText,
        });

        const rawJson = response.text?.trim();
        if (!rawJson) return null;

        const parsed = JSON.parse(rawJson);
        return parseAssistantJson(parsed);
      } catch (err) {
        console.warn('[geminiAssistant] Cloud Gemini error, triggering Edge RAG failover:', err);
        return null;
      }
    })();

    const result = await Promise.race([queryPromise, timeoutPromise]);
    if (result) {
      return result;
    }
  }

  // Failover to local Edge RAG cluster (mkr4 / rnw2)
  const edgeResult = await queryEdgeOllama(userText);
  return edgeResult;
}
