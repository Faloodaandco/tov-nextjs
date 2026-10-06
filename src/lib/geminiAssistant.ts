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
import { TOV_KNOWLEDGE_BASE } from '@/data/tovKnowledge';

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

const SYSTEM_INSTRUCTION = `You are the AI Order & Hospitality Assistant for Taste of Village Hayes (766B Uxbridge Rd, Hayes UB4 0RU, London).
We serve 100% Halal authentic Pakistani & North Indian Punjabi cuisine.
Signature items: Chicken Karahi (£12.99), Lamb Charsi Karahi (£24.99), Village Special Platters, Seekh Kebabs, Biryanis, and fresh Tandoori Naans.

KNOWLEDGE BASE & FAQS:
${KNOWLEDGE_BASE_TEXT}

MENU DISHES (Short ID, Full ID, Name, Price GBP):
${JSON.stringify(COMPACT_MENU)}

TASK:
Analyze the customer's WhatsApp message and return a JSON object with:
{
  "intent": "order" | "recommendation" | "faq" | "general",
  "reply": "Concise, warm response in British English (max 2 sentences). Always polite, hospitable, and helpful.",
  "items": [
    { "id": "short_or_full_id", "name": "Exact Dish Name", "quantity": 1 }
  ],
  "suggestedDishId": "short_or_full_id_if_recommending" // or null
}

RULES:
1. 'order': If the user requests to order, buy, or get dishes (e.g. "2 chicken biryani", "I want chicken karahi and 2 naan"), match dishes from the MENU and put them in 'items' with exact quantity.
2. 'recommendation': If the user asks for suggestions, recommendations, or popular dishes (e.g. "what karahi do you recommend?", "what is good to eat?"), suggest 1 or 2 authentic TOV dishes, explain briefly why they are popular, and set 'suggestedDishId' to the primary recommendation.
3. 'faq': If the user asks about Halal status, opening hours, address, parking, spice levels, catering, or allergens, answer accurately using the KNOWLEDGE BASE above.
4. STRICT INVARIANT: ONLY recommend dishes from the Taste of Village menu above. Never invent dishes. Never mention other restaurants.`;

/**
 * Analyze a customer's message using Gemini 2.5 Flash.
 * Enforces a strict 2500ms safety timeout — if Gemini takes too long or fails,
 * returns null so the caller can fall back to instant deterministic routing.
 */
export async function analyzeWithGemini(userText: string): Promise<AssistantResult | null> {
  const client = getClient();
  if (!client) {
    return null;
  }

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
    } catch (err) {
      console.warn('[geminiAssistant] Inference error:', err);
      return null;
    }
  })();

  return Promise.race([queryPromise, timeoutPromise]);
}
