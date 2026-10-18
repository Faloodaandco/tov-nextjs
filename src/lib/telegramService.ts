/**
 * Telegram Bot Service
 *
 * Sends messages via the Telegram Bot API.
 * Used for: order notifications, loyalty milestone nudges, owner reports.
 *
 * Bot: @faloodabot
 * Token sourced from TELEGRAM_BOT_TOKEN env var.
 *
 * Telegram API is FREE — no per-message cost. Safe to call without budget checks.
 */

const TELEGRAM_API = 'https://api.telegram.org';

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('[Telegram] TELEGRAM_BOT_TOKEN not set');
  return token;
}

export interface TelegramSendResult {
  ok: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Send a text message via Telegram Bot API.
 *
 * @param chatId  Telegram chat ID or @username
 * @param text    Message text (supports Markdown V2 or HTML)
 * @param parseMode  'MarkdownV2' | 'HTML' | undefined
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: 'MarkdownV2' | 'HTML' | undefined = 'HTML',
): Promise<TelegramSendResult> {
  try {
    const token = getBotToken();
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error(`[Telegram] Send failed:`, data.description);
      return { ok: false, error: data.description };
    }

    console.info(`[Telegram] Message sent to ${chatId}, msgId: ${data.result?.message_id}`);
    return { ok: true, messageId: data.result?.message_id };
  } catch (err: any) {
    console.error(`[Telegram] Send error:`, err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Send a photo with caption via Telegram Bot API.
 * Useful for QR codes, promotional images.
 */
export async function sendTelegramPhoto(
  chatId: string | number,
  photoUrl: string,
  caption: string,
  parseMode: 'MarkdownV2' | 'HTML' | undefined = 'HTML',
): Promise<TelegramSendResult> {
  try {
    const token = getBotToken();
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: parseMode,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error(`[Telegram] Photo send failed:`, data.description);
      return { ok: false, error: data.description };
    }

    return { ok: true, messageId: data.result?.message_id };
  } catch (err: any) {
    console.error(`[Telegram] Photo send error:`, err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Get bot info — useful for initial connection test.
 */
export async function getTelegramBotInfo(): Promise<{ ok: boolean; username?: string }> {
  try {
    const token = getBotToken();
    const res = await fetch(`${TELEGRAM_API}/bot${token}/getMe`);
    const data = await res.json();
    return { ok: data.ok, username: data.result?.username };
  } catch {
    return { ok: false };
  }
}
