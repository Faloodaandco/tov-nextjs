'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Send,
  RefreshCw,
  Search,
  Phone,
  Clock,
  User,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface Message {
  id: string;
  phone: string;
  name?: string;
  direction: 'inbound' | 'outbound';
  body: string;
  timestamp: string;
  read?: boolean;
}

interface Conversation {
  id: string;
  phone: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  branchId?: 'hayes' | 'slough';
  unreadCount?: number;
  activeCart?: any;
  lastPaidOrderId?: string;
}

interface Props {
  selectedBranch: 'all' | 'hayes' | 'slough';
}

const QUICK_REPLIES = [
  { label: 'Greeting', text: '👋 Hello! Taste of Village team here. How can we help you today?' },
  { label: 'Order In Prep', text: '🍽️ Your order has been received and is being prepared fresh in our kitchen.' },
  { label: 'Order Ready', text: '✨ Your order is freshly prepared and ready for collection!' },
  { label: 'Out for Delivery', text: '🛵 Our driver has departed with your fresh order and is on the way!' },
  { label: 'Menu Link', text: '📋 You can browse our full menu and place an order here: https://www.tasteofvillagerestaurants.co.uk' },
];

export const WhatsAppInboxTab: React.FC<Props> = ({ selectedBranch }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Conversation List
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const branchParam = selectedBranch !== 'all' ? `?branch=${selectedBranch}` : '';
      const res = await fetch(`/api/admin/whatsapp/conversations${branchParam}`);
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (!activePhone && data.conversations.length > 0) {
          setActivePhone(data.conversations[0].phone);
        }
      }
    } catch (err: any) {
      if (!silent) setErrorStatus(err.message || 'Error loading chats');
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, [selectedBranch, activePhone]);

  // Fetch Messages for Selected Phone
  const fetchMessages = useCallback(async (phone: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err: any) {
      if (!silent) setErrorStatus(err.message || 'Error loading thread');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations(true);
    }, 7000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (activePhone) {
      fetchMessages(activePhone);
      const interval = setInterval(() => {
        fetchMessages(activePhone, true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activePhone, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activePhone || !replyText.trim() || sending) return;

    setSending(true);
    setErrorStatus(null);
    setSuccessStatus(null);

    const activeConv = conversations.find((c) => c.phone === activePhone);
    const branchToSend = activeConv?.branchId || (selectedBranch !== 'all' ? selectedBranch : 'hayes');

    try {
      const res = await fetch('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activePhone,
          message: replyText.trim(),
          branch: branchToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setReplyText('');
      setSuccessStatus('Message sent successfully!');
      setTimeout(() => setSuccessStatus(null), 3000);

      // Refresh messages immediately
      fetchMessages(activePhone, true);
      fetchConversations(true);
    } catch (err: any) {
      setErrorStatus(err.message || 'Failed to send WhatsApp message');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConv = conversations.find((c) => c.phone === activePhone);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-white">WhatsApp Live Concierge</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Cloud API Live
            </span>
          </div>
          <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
            Real-time dual-branch chat for customer orders, support & cart inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchConversations();
              if (activePhone) fetchMessages(activePhone);
            }}
            disabled={loadingList}
            className="px-3 py-1.5 rounded-xl bg-[#1C2D22] hover:bg-[#253A2C] border border-[#D3A762]/30 text-xs font-semibold text-[#D3A762] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {errorStatus && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorStatus}</span>
        </div>
      )}

      {successStatus && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successStatus}</span>
        </div>
      )}

      {/* Two column chat interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px] bg-[#14231B] border border-[#D3A762]/20 rounded-2xl overflow-hidden">
        {/* Left: Conversation List (4 cols) */}
        <div className="lg:col-span-4 border-r border-[#D3A762]/20 flex flex-col h-full bg-[#111C15]">
          {/* Search box */}
          <div className="p-3 border-b border-[#D3A762]/10">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#FAF6F0]/40" />
              <input
                type="text"
                placeholder="Search phone or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#FAF6F0]/40 focus:outline-none focus:border-[#D3A762]"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#D3A762]/10">
            {loadingList && conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#FAF6F0]/50">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#FAF6F0]/50">
                No active conversations yet. Messages sent by customers to either WhatsApp number will appear here instantly.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.phone === activePhone;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActivePhone(conv.phone)}
                    className={`w-full text-left p-3 transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C2D22] border-l-4 border-l-[#D3A762]'
                        : 'hover:bg-[#16271F]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0D1912] border border-[#D3A762]/30 flex items-center justify-center text-[#D3A762] shrink-0 font-bold text-xs">
                      {conv.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white truncate">{conv.name}</span>
                        <span className="text-[10px] text-[#FAF6F0]/40 shrink-0">
                          {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#FAF6F0]/50 font-mono mb-1">{conv.phone}</div>
                      <p className="text-xs text-[#FAF6F0]/70 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                            conv.branchId === 'slough'
                              ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {conv.branchId === 'slough' ? 'Slough' : 'Hayes'}
                        </span>
                        {conv.activeCart?.items?.length > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#D3A762]/20 text-[#D3A762] font-semibold flex items-center gap-1">
                            <ShoppingBag className="w-2.5 h-2.5" /> Cart ({conv.activeCart.items.length})
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Thread & Reply Box (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#0D1912]">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 bg-[#14231B] border-b border-[#D3A762]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1C2D22] border border-[#D3A762]/40 flex items-center justify-center text-[#D3A762] font-bold">
                    {activeConv.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {activeConv.name}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1C2D22] border border-[#D3A762]/30 text-[#D3A762]">
                        {activeConv.branchId === 'slough' ? 'Slough Branch' : 'Hayes Branch'}
                      </span>
                    </h3>
                    <div className="text-xs text-[#FAF6F0]/60 flex items-center gap-2 mt-0.5">
                      <Phone className="w-3 h-3 text-[#D3A762]" />
                      <span>{activeConv.phone}</span>
                    </div>
                  </div>
                </div>

                {activeConv.activeCart?.items && (
                  <div className="text-right text-xs bg-[#1C2D22] border border-[#D3A762]/20 rounded-xl p-2 hidden sm:block">
                    <div className="text-[#D3A762] font-semibold text-[11px]">Active Order Cart</div>
                    <div className="text-white font-bold">{activeConv.activeCart.items.length} dishes</div>
                  </div>
                )}
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages && messages.length === 0 ? (
                  <div className="text-center text-xs text-[#FAF6F0]/50 py-12">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-xs text-[#FAF6F0]/50 py-12">
                    No chat history stored yet. Outgoing and incoming messages will appear here.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOutbound = msg.direction === 'outbound';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                            isOutbound
                              ? 'bg-[#1C2D22] border border-[#D3A762]/40 text-white rounded-br-xs'
                              : 'bg-[#25D366]/15 border border-[#25D366]/30 text-[#FAF6F0] rounded-bl-xs'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.body}</div>
                        </div>
                        <span className="text-[10px] text-[#FAF6F0]/40 mt-1 px-1">
                          {isOutbound ? 'Staff • ' : 'Customer • '}
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick reply chips */}
              <div className="px-3 py-2 bg-[#111C15] border-t border-[#D3A762]/10 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
                <span className="text-[10px] uppercase font-bold text-[#D3A762]/70 shrink-0 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Quick:
                </span>
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.label}
                    type="button"
                    onClick={() => setReplyText(qr.text)}
                    className="px-2.5 py-1 rounded-lg bg-[#1C2D22] hover:bg-[#253A2C] border border-[#D3A762]/20 text-[11px] text-[#FAF6F0]/80 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>

              {/* Reply Input Bar */}
              <form onSubmit={handleSendReply} className="p-3 bg-[#14231B] border-t border-[#D3A762]/20 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Reply to ${activeConv.name || activeConv.phone}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sending}
                  className="flex-1 bg-[#0D1912] border border-[#D3A762]/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#FAF6F0]/40 focus:outline-none focus:border-[#D3A762] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#D3A762] hover:bg-[#dfb774] text-[#0D1912] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#FAF6F0]/50">
              <MessageSquare className="w-12 h-12 text-[#D3A762]/30 mb-3" />
              <p className="text-sm font-semibold text-white">Select a conversation</p>
              <p className="text-xs text-[#FAF6F0]/60 max-w-sm mt-1">
                Choose a customer from the left column to view message history and send direct replies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
