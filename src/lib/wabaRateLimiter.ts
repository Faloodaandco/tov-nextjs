/**
 * WABA Rate Limiter & Anti-Spam Protection
 *
 * Prevents abuse of the WhatsApp ordering bot:
 * - Rate limiting per phone number (max messages per window)
 * - Prompt injection detection (blocks attempts to override system instructions)
 * - Spam pattern detection (repeated messages, gibberish)
 *
 * Uses in-memory Map with periodic cleanup — lightweight, no external deps.
 * Resets on cold start (acceptable for serverless — spam state is ephemeral).
 */

// ── Rate Limiter ────────────────────────────────────────────────────

interface RateBucket {
  count: number;
  firstAt: number;    // timestamp of first message in window
  lastText: string;   // last message text (for repeat detection)
  repeatCount: number; // consecutive identical messages
  warningsSent: number;
}

const rateBuckets = new Map<string, RateBucket>();

const RATE_CONFIG = {
  windowMs: 60_000,    // 1-minute window
  maxPerWindow: 15,    // max 15 messages per minute (generous for ordering)
  repeatThreshold: 4,  // 4 identical messages = spam
  warningMax: 2,       // after 2 warnings, silently drop
};

/** Cleanup stale buckets every 5 minutes */
let lastCleanup = Date.now();
function cleanupBuckets() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.firstAt > RATE_CONFIG.windowMs * 3) {
      rateBuckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: 'rate_limit' | 'spam_repeat' | 'injection' | 'gibberish';
  warningMessage?: string;
}

/**
 * Check if a message should be processed or rate-limited.
 *
 * @param phone  Customer phone number (E.164)
 * @param text   Message text
 * @returns { allowed: boolean, reason?, warningMessage? }
 */
export function checkRateLimit(phone: string, text: string): RateLimitResult {
  cleanupBuckets();
  const now = Date.now();
  const cleanText = text.trim().toLowerCase();

  // ── 1. Prompt Injection Detection ──────────────────────────────────
  if (isPromptInjection(text)) {
    console.warn(`[RateLimit] Injection attempt from ${phone}: ${text.slice(0, 80)}`);
    return {
      allowed: false,
      reason: 'injection',
      warningMessage: 'Sorry, I can only help with menu orders and restaurant questions. Type *menu* to browse our dishes! 😊',
    };
  }

  // ── 2. Gibberish / Excessively Long Messages ──────────────────────
  if (text.length > 500 && !/menu|order|cart|checkout|delivery|collection/i.test(text)) {
    console.warn(`[RateLimit] Long non-order message from ${phone}: ${text.length} chars`);
    return {
      allowed: false,
      reason: 'gibberish',
      warningMessage: 'I couldn\'t understand that. Type *menu* to browse dishes or *help* for assistance.',
    };
  }

  // ── 3. Rate Bucket Check ──────────────────────────────────────────
  let bucket = rateBuckets.get(phone);

  if (!bucket || now - bucket.firstAt > RATE_CONFIG.windowMs) {
    // New window
    bucket = { count: 1, firstAt: now, lastText: cleanText, repeatCount: 1, warningsSent: 0 };
    rateBuckets.set(phone, bucket);
    return { allowed: true };
  }

  bucket.count++;

  // Check for repeated identical messages
  if (cleanText === bucket.lastText) {
    bucket.repeatCount++;
    if (bucket.repeatCount >= RATE_CONFIG.repeatThreshold) {
      bucket.warningsSent++;
      if (bucket.warningsSent > RATE_CONFIG.warningMax) {
        // Silently drop after too many warnings
        console.warn(`[RateLimit] Silently dropping repeated spam from ${phone}`);
        return { allowed: false, reason: 'spam_repeat' };
      }
      return {
        allowed: false,
        reason: 'spam_repeat',
        warningMessage: 'I noticed you\'re sending the same message multiple times. Let me know what you need and I\'ll help! Type *menu* to browse.',
      };
    }
  } else {
    bucket.lastText = cleanText;
    bucket.repeatCount = 1;
  }

  // Check rate limit
  if (bucket.count > RATE_CONFIG.maxPerWindow) {
    bucket.warningsSent++;
    if (bucket.warningsSent > RATE_CONFIG.warningMax) {
      console.warn(`[RateLimit] Silently dropping rate-limited from ${phone}`);
      return { allowed: false, reason: 'rate_limit' };
    }
    return {
      allowed: false,
      reason: 'rate_limit',
      warningMessage: 'You\'re sending messages a bit too fast! Please wait a moment and try again. 😊',
    };
  }

  rateBuckets.set(phone, bucket);
  return { allowed: true };
}

// ── Prompt Injection Detection ─────────────────────────────────────

const INJECTION_PATTERNS = [
  // Override system instructions
  /ignore\s+(all\s+)?previous\s+(instructions|prompts|rules)/i,
  /forget\s+(all\s+)?previous/i,
  /disregard\s+(all\s+)?above/i,
  /override\s+system/i,
  /new\s+instruction/i,
  /act\s+as\s+(if\s+you\s+are|a)\s+(?!a\s+customer)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(?!hungry)/i,
  /you\s+are\s+now\s+a/i,
  /system\s*:\s*/i,
  /\[system\]/i,
  /\[INST\]/i,
  /<<SYS>>/i,
  /role\s*:\s*(system|assistant)/i,

  // Data exfiltration
  /what\s+(is|are)\s+your\s+(instructions|system|prompt|rules)/i,
  /show\s+me\s+your\s+(prompt|instructions|config)/i,
  /reveal\s+(your|the)\s+(system|hidden)/i,
  /print\s+(your|system)\s+(instructions|prompt)/i,
  /dump\s+(all|your)/i,

  // Code injection
  /```[\s\S]{20,}```/,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /import\s+os/i,
  /require\s*\(\s*['"][^'"]+['"]\s*\)/i,

  // Harmful intent
  /how\s+to\s+(hack|exploit|break|attack)/i,
  /bypass\s+(security|authentication|filter)/i,
  /sql\s*inject/i,
  /cross.site\s*script/i,
];

function isPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(text));
}
