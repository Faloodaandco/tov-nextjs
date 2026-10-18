/**
 * GET /api/telegram/setup
 *
 * Utility endpoint to get the owner's Telegram chat ID.
 * After the owner starts a conversation with @faloodabot,
 * this endpoint fetches the latest messages to find the chat ID.
 *
 * Usage: GET /api/telegram/setup?token=<TELEGRAM_BOT_TOKEN>
 * Returns: List of recent chat IDs from the bot's updates
 */
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'No bot token provided' }, { status: 400 });
    }

    // Get recent updates (messages sent to the bot)
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=20`);
    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json({ error: 'Failed to get updates', details: data }, { status: 500 });
    }

    // Extract unique chat IDs with user info
    const chats = new Map<number, { chatId: number; firstName: string; lastName?: string; username?: string }>();

    for (const update of data.result || []) {
      const msg = update.message;
      if (msg?.chat) {
        chats.set(msg.chat.id, {
          chatId: msg.chat.id,
          firstName: msg.chat.first_name || '',
          lastName: msg.chat.last_name || '',
          username: msg.chat.username || '',
        });
      }
    }

    // Get bot info
    const botRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const botData = await botRes.json();

    return NextResponse.json({
      bot: botData.result,
      recentChats: Array.from(chats.values()),
      instructions: [
        '1. Have the owner send any message to @faloodabot on Telegram',
        '2. Refresh this page to see their chat ID',
        '3. Add TELEGRAM_OWNER_CHAT_ID=<chatId> to Vercel env vars',
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
