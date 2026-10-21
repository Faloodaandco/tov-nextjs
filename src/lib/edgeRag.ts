/**
 * Taste of Village — Edge RAG Knowledge & Retrieval Engine
 *
 * Implements lightweight, zero-dependency Semantic & Keyword Hybrid RAG retrieval
 * for Edge Ollama (Llama 3.2 / Qwen 2.5) and Cloud Gemini.
 *
 * Teaches the local agent the complete restaurant knowledge base:
 * - 100% Halal certification & meat sourcing policies
 * - 30+ authentic FAQs (opening hours 10AM-2AM, delivery radius, parking, catering)
 * - Deep chef tasting profiles, iron-wok & charcoal tandoor secrets, and palate pairings
 * - Rapid objection handling (prep times from scratch, spice balance, Deliveroo savings)
 * - Branch awareness: Hayes (Uxbridge Rd) vs. Slough (Farnham Rd)
 */

import {
  TOV_KNOWLEDGE_BASE,
  TOV_CHEF_TASTING_PROFILES,
  TOV_OBJECTION_HANDLERS,
  TOV_PSYCHOLOGICAL_DIAGNOSTICS,
} from '@/data/tovKnowledge';
import hayesMenu from '@/data/tov-menu.json';
import sloughMenu from '@/data/tov-menu-slough.json';
import { LOCATIONS, type LocationId } from '@/config/shopConfig';

export interface KnowledgeSnippet {
  id: string;
  category: 'faq' | 'chef_profile' | 'objection' | 'diagnostic' | 'dish';
  title: string;
  content: string;
  keywords: string[];
  branch?: 'hayes' | 'slough' | 'all';
}

// ── Build Structured Knowledge Corpus ───────────────────────────────────

const CORPUS: KnowledgeSnippet[] = [];

// 1. FAQs & Operational Rules
for (const [idx, item] of TOV_KNOWLEDGE_BASE.entries()) {
  CORPUS.push({
    id: `faq_${idx}`,
    category: 'faq',
    title: item.question,
    content: `Q: ${item.question}\nA: ${item.answer}`,
    keywords: [
      item.topic.toLowerCase(),
      item.category.toLowerCase(),
      ...(item.searchKeywords || []).map(k => k.toLowerCase()),
      ...item.question.toLowerCase().split(/\s+/),
    ],
    branch: 'all',
  });
}

// 2. Chef Tasting Profiles & Sensory Notes
for (const profile of TOV_CHEF_TASTING_PROFILES) {
  CORPUS.push({
    id: `chef_${profile.id}`,
    category: 'chef_profile',
    title: `${profile.name} (Heat: ${profile.heatLevel}/5)`,
    content: `Dish: ${profile.name} | Heat: ${profile.heatLevel}/5 | Tasting Hook: "${profile.tastingHook}" | Cooking Secret: ${profile.chefSecret} | Best Paired With: ${profile.pairingRecommendation.bread} & ${profile.pairingRecommendation.drink} | Upsell Hook: "${profile.crossSellHook}"`,
    keywords: [
      profile.name.toLowerCase(),
      profile.category.toLowerCase(),
      'chef',
      'tasting',
      'recommend',
      'suggest',
      ...profile.flavorNotes.map(n => n.toLowerCase()),
      ...profile.name.toLowerCase().split(/\s+/),
    ],
    branch: 'all',
  });
}

// 3. Rapid Objection Handling Matrix
for (const [idx, handler] of TOV_OBJECTION_HANDLERS.entries()) {
  CORPUS.push({
    id: `obj_${idx}`,
    category: 'objection',
    title: handler.objection,
    content: `When customer worries: "${handler.objection}" -> Chef answer: "${handler.rapidChefResponse}" -> Closing question: "${handler.closingQuestion}"`,
    keywords: [
      handler.rootFear.toLowerCase(),
      'objection',
      'wait',
      'time',
      'expensive',
      'spicy',
      ...handler.objection.toLowerCase().split(/\s+/),
    ],
    branch: 'all',
  });
}

// 4. Psychological Qualification Diagnostics
for (const diag of TOV_PSYCHOLOGICAL_DIAGNOSTICS) {
  CORPUS.push({
    id: `diag_${diag.qualificationGoal}`,
    category: 'diagnostic',
    title: `Qualifying ${diag.qualificationGoal}`,
    content: `If customer is undecided on ${diag.qualificationGoal}: Ask: "${diag.question}"\nOptions:\n${diag.options.map(o => `• ${o.label} -> Recommend: ${o.recommendationPitch}`).join('\n')}`,
    keywords: [
      diag.qualificationGoal.toLowerCase(),
      'undecided',
      'family',
      'party',
      'group',
      'kids',
      'budget',
    ],
    branch: 'all',
  });
}

// 5. Popular Signature Dishes (Top picks for each branch)
const allDishes = [...(hayesMenu as any[]), ...(sloughMenu as any[])];
const seenDishNames = new Set<string>();
for (const dish of allDishes) {
  if (seenDishNames.has(dish.name)) continue;
  seenDishNames.add(dish.name);

  CORPUS.push({
    id: `dish_${dish.id}`,
    category: 'dish',
    title: dish.name,
    content: `Dish: ${dish.name} | Price: £${Number(dish.price).toFixed(2)} | Category: ${dish.category} | Description: ${dish.description || 'Authentic Desi Specialty'}`,
    keywords: [
      dish.name.toLowerCase(),
      (dish.category || '').toLowerCase(),
      ...dish.name.toLowerCase().split(/\s+/),
    ],
    branch: 'all',
  });
}

// ── Query Synonym Expansion Map ─────────────────────────────────────────

const SYNONYM_MAP: Record<string, string[]> = {
  halal: ['hmc', 'zabihah', 'meat', 'chicken', 'lamb', 'pork', 'supplier'],
  time: ['hours', 'opening', 'close', 'open', 'timing', 'late', 'night', 'schedule'],
  where: ['address', 'location', 'postcode', 'direction', 'parking', 'find'],
  delivery: ['deliver', 'radius', 'postcode', 'uber', 'deliveroo', 'distance', 'miles'],
  recommend: ['suggest', 'popular', 'favourite', 'signature', 'special', 'best', 'good'],
  spicy: ['chili', 'hot', 'heat', 'mild', 'medium', 'fiery'],
  group: ['family', 'party', 'sharing', 'platter', 'feast', 'people', 'friends'],
  naan: ['roti', 'bread', 'kulcha', 'paratha', 'garlic'],
  biryani: ['rice', 'pilau', 'dum'],
  karahi: ['handi', 'curry', 'salan', 'lamb', 'chicken', 'charsi'],
};

/**
 * Retrieve the most relevant knowledge chunks using Hybrid Keyword & Intent Scoring.
 * Runs in <1ms without any external vector database or API calls.
 */
export function retrieveRagContext(
  userQuery: string,
  branch: LocationId = 'hayes',
  topK = 4
): KnowledgeSnippet[] {
  const queryLower = userQuery.toLowerCase().trim();
  const rawTokens = queryLower.split(/[^a-zA-Z0-9]+/).filter(t => t.length > 2);

  // Expand tokens with domain synonyms
  const expandedTokens = new Set<string>(rawTokens);
  for (const token of rawTokens) {
    if (SYNONYM_MAP[token]) {
      for (const syn of SYNONYM_MAP[token]) {
        expandedTokens.add(syn);
      }
    }
  }

  const scored: { snippet: KnowledgeSnippet; score: number }[] = [];

  for (const snippet of CORPUS) {
    // Branch filter: only include all or matching branch
    if (snippet.branch && snippet.branch !== 'all' && snippet.branch !== branch) {
      continue;
    }

    let score = 0;
    const snippetText = `${snippet.title} ${snippet.content}`.toLowerCase();

    // 1. Exact phrase match in content (+15)
    if (queryLower.length > 4 && snippetText.includes(queryLower)) {
      score += 15;
    }

    // 2. Token overlap scoring
    for (const token of expandedTokens) {
      // Keyword array match (+6)
      if (snippet.keywords.some(k => k === token || k.includes(token))) {
        score += 6;
      }
      // Content substring match (+2)
      if (snippetText.includes(token)) {
        score += 2;
      }
    }

    // 3. Category boosting based on intent triggers
    if (/\b(halal|hours|open|time|where|address|deliver|parking|allerg)\b/i.test(queryLower) && snippet.category === 'faq') {
      score += 8;
    }
    if (/\b(recommend|suggest|what('?s| is) good|best|special|favourite)\b/i.test(queryLower) && snippet.category === 'chef_profile') {
      score += 10;
    }
    if (/\b(why|wait|long|fresh|expensive|buffet)\b/i.test(queryLower) && snippet.category === 'objection') {
      score += 8;
    }
    if (/\b(family|group|kids|children|party|people)\b/i.test(queryLower) && (snippet.id.includes('platter') || snippet.category === 'diagnostic')) {
      score += 9;
    }

    if (score > 0) {
      scored.push({ snippet, score });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(s => s.snippet);
}

/**
 * Builds an optimal RAG-augmented prompt tailored for Llama 3.2 / Qwen 2.5 on Edge Ollama.
 */
export function buildLlamaRagPrompt(
  userQuery: string,
  branch: LocationId = 'hayes'
): { systemInstruction: string; userPrompt: string } {
  const loc = LOCATIONS[branch];
  const relevantSnippets = retrieveRagContext(userQuery, branch, 4);

  const contextText = relevantSnippets.length > 0
    ? relevantSnippets.map(s => `[${s.category.toUpperCase()}] ${s.content}`).join('\n\n')
    : `General Taste of Village Pakistani & North Indian Punjabi charcoal & wok dining. Open 10AM–2AM daily. 100% Halal certified.`;

  const systemInstruction = `You are the Executive Chef & Food Consultant for Taste of Village ${loc.name} (${loc.address}, ${loc.city} ${loc.postcode} | Tel: ${loc.phone} | WhatsApp: ${loc.whatsappPhone}).
You embody a master Asian culinary chef AND a warm, charismatic WhatsApp salesman.

CHEF CULINARY PRINCIPLES:
- Authentic Lahore & Gujranwala cuisine: iron-wok Karahi seared over high flame (fresh tomatoes, ginger, green chilies, whole crushed coriander—never watery base gravy!), charcoal tandoor grilling at 450°C, and slow-dum rice.
- Use mouthwatering, vivid sensory vocabulary ('sizzling charcoal-kissed', 'wok-caramelized tomato fond', 'tender marrow richness').

SALES PSYCHOLOGY:
1. BREVITY: Max 2 punchy, appetizing sentences in British English.
2. ASSUMPTIVE CLOSE: Always propose an authentic bread/rice pairing (e.g. "Shall I add a hot Butter Naan or fragrant Pilau Rice to scoop that rich masala?").
3. PALATE BALANCE: If ordering spicy dishes, suggest balancing with chilled Mango Lassi (£2.50) or Mint Raita (£1.20).
4. STRICT TRUTH: Answer strictly using the RETRIEVED RESTAURANT KNOWLEDGE below. Never invent dishes, prices, or policies.

RETRIEVED RESTAURANT KNOWLEDGE:
${contextText}

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "intent": "order" | "recommendation" | "faq" | "general",
  "reply": "Max 2 punchy, appetizing sentences in British English with assumptive close.",
  "items": [{ "id": "dish_id_if_ordering", "name": "Exact Name", "quantity": 1 }],
  "suggestedDishId": "dish_id_if_recommending_or_null"
}`;

  return {
    systemInstruction,
    userPrompt: userQuery,
  };
}
