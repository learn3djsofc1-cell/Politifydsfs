import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MessageSquare, Send, Plus,
  ChevronLeft, ExternalLink, Loader2, AlertCircle,
  Check, X, Coins, Bot, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Conversation {
  id: number;
  other_username: string;
  other_user_id: number;
  last_message: string | null;
  last_message_type: string | null;
  last_message_at: string | null;
  updated_at: string;
}

interface Message {
  id: number;
  sender_id: number;
  content: string;
  message_type: string;
  transaction_id: number | null;
  created_at: string;
  sender_username: string;
  amount?: string;
  token?: string;
  tx_signature?: string;
  network?: string;
  tx_status?: string;
  tx_receiver_id?: number;
}

interface SearchResult {
  id: number;
  username: string;
}

interface PendingPayment {
  amount: number;
  token: 'SOL' | 'USDC';
  originalMessage: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export const ChatPage = () => {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingPayment, setSendingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [parsingIntent, setParsingIntent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch { /* silent */ } finally {
      setLoadingConversations(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async (convId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        fetchMessages(activeConversation.id);
      }, 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeConversation, fetchMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, pendingPayment]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || data);
        }
      } catch { /* silent */ } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, token]);

  const startConversation = async (otherUserId: number, otherUsername: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        const conv: Conversation = {
          id: data.id,
          other_username: otherUsername,
          other_user_id: otherUserId,
          last_message: null,
          last_message_type: null,
          last_message_at: null,
          updated_at: new Date().toISOString(),
        };
        setActiveConversation(conv);
        setShowConversation(true);
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        await fetchConversations();
      }
    } catch { /* silent */ }
  };

  const sendTextMessage = async (text: string) => {
    if (!token || !activeConversation) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        await fetchMessages(activeConversation.id);
        await fetchConversations();
      }
    } catch { /* silent */ } finally {
      setSendingMessage(false);
    }
  };

  const sendMessage = async () => {
    if (!token || !activeConversation || !messageText.trim() || sendingMessage || parsingIntent) return;
    const text = messageText.trim();
    setMessageText('');
    setParsingIntent(true);

    try {
      const intentRes = await fetch('/api/chat/parse-intent', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (intentRes.ok) {
        const intent = await intentRes.json();
        if (intent.type === 'payment' && intent.amount > 0) {
          setPendingPayment({
            amount: intent.amount,
            token: intent.token,
            originalMessage: text,
          });
          setPaymentError('');
          setConfirmPassword('');
          setParsingIntent(false);
          return;
        }
      }
    } catch {
      /* AI parsing failed, send as normal text */
    }

    setParsingIntent(false);
    await sendTextMessage(text);
  };

  const confirmPayment = async () => {
    if (!token || !activeConversation || !pendingPayment || !confirmPassword || sendingPayment) return;
    setSendingPayment(true);
    setPaymentError('');
    try {
      const res = await fetch('/api/transactions/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: activeConversation.other_user_id,
          amount: pendingPayment.amount,
          token: pendingPayment.token,
          password: confirmPassword,
          conversationId: activeConversation.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data.error || 'Transaction failed');
        return;
      }
      setPendingPayment(null);
      setConfirmPassword('');
      setPaymentError('');
      setSuccessMessage(`${pendingPayment.amount} ${pendingPayment.token} sent successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchMessages(activeConversation.id);
      await fetchConversations();
    } catch {
      setPaymentError('Failed to send payment');
    } finally {
      setSendingPayment(false);
    }
  };

  const cancelPayment = () => {
    if (pendingPayment) {
      setMessageText(pendingPayment.originalMessage);
    }
    setPendingPayment(null);
    setConfirmPassword('');
    setPaymentError('');
  };

  const sendAsText = async () => {
    if (!pendingPayment) return;
    const text = pendingPayment.originalMessage;
    setPendingPayment(null);
    setConfirmPassword('');
    setPaymentError('');
    await sendTextMessage(text);
  };

  const selectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setShowConversation(true);
    setPendingPayment(null);
    setPaymentError('');
    setSuccessMessage('');
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const networkMode = user?.networkMode || 'devnet';
  const isTestnet = networkMode === 'devnet';

  const getExplorerUrl = (sig: string) => {
    const base = `https://explorer.solana.com/tx/${sig}`;
    return isTestnet ? `${base}?cluster=devnet` : base;
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-[calc(100vh-3.5rem)] lg:h-screen flex overflow-hidden"
    >
      <motion.div
        variants={item}
        className={`w-full lg:w-80 border-r border-gray-200 flex flex-col bg-white ${
          showConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Chat</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); setSearchResults([]); }}
                className="w-9 h-9 rounded-xl bg-[#9945FF]/10 text-[#9945FF] flex items-center justify-center hover:bg-[#9945FF]/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by username..."
                  autoFocus
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all"
                />
              </div>
              {searching && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => startConversation(u.id, u.username)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9945FF]/15 to-[#14F195]/15 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-gray-500">{u.username.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">@{u.username}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <p className="text-xs text-gray-400 mt-2 text-center">No users found</p>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-1" />
                    <div className="h-3 w-40 bg-gray-50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">No conversations yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Start a new chat to send payments and messages.
              </p>
              <button
                onClick={() => setShowSearch(true)}
                className="px-4 py-2 rounded-xl bg-[#9945FF]/10 text-[#9945FF] text-sm font-medium hover:bg-[#9945FF]/20 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Conversation
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
                  activeConversation?.id === conv.id ? 'bg-[#9945FF]/5' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9945FF]/15 to-[#14F195]/15 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-500">{conv.other_username.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">@{conv.other_username}</span>
                    {conv.last_message_at && (
                      <span className="text-xs text-gray-400">{formatTime(conv.last_message_at)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {conv.last_message_type === 'payment'
                      ? `💸 ${conv.last_message}`
                      : conv.last_message || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className={`flex-1 min-w-0 flex flex-col bg-[#F4F5F7] ${
          !showConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Select a conversation</h2>
            <p className="text-gray-500 text-sm max-w-sm">
              Choose a contact from the sidebar or start a new conversation. Type naturally to send payments — e.g. "send 10 USDC" or "transfer 0.5 SOL".
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
              <button
                onClick={() => { setShowConversation(false); setPendingPayment(null); }}
                className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9945FF]/15 to-[#14F195]/15 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-gray-500">{activeConversation.other_username.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900">@{activeConversation.other_username}</span>
                {isTestnet && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Testnet</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#9945FF]/5">
                <Bot className="w-3.5 h-3.5 text-[#9945FF]" />
                <span className="text-[10px] font-medium text-[#9945FF]">AI Assisted</span>
              </div>
            </div>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3">
              {messages.length === 0 && !pendingPayment && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#9945FF]/10 flex items-center justify-center mx-auto mb-3">
                    <Bot className="w-6 h-6 text-[#9945FF]" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">AI-powered chat banking</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Type naturally to send payments. Try "send 10 USDC" or "transfer 0.5 SOL". Regular messages work too!
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                const isPayment = msg.message_type === 'payment';

                if (isPayment) {
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[calc(100vw-6rem)] sm:max-w-[320px] rounded-2xl p-4 ${
                        isMe ? 'bg-gradient-to-br from-[#9945FF] to-[#7B2FE0] text-white' : 'bg-white border border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Coins className={`w-4 h-4 ${isMe ? 'text-white/70' : 'text-[#9945FF]'}`} />
                          <span className={`text-xs font-medium ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                            {isMe ? 'Payment Sent' : 'Payment Received'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className={`text-2xl font-bold ${isMe ? 'text-white' : 'text-gray-900'}`}>
                            {msg.amount ? parseFloat(msg.amount).toFixed(msg.token === 'SOL' ? 4 : 2) : '—'}
                          </span>
                          <span className={`text-sm font-medium ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                            {msg.token || ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {msg.tx_status && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              msg.tx_status === 'confirmed'
                                ? isMe ? 'bg-green-400/20 text-green-200' : 'bg-green-100 text-green-700'
                                : msg.tx_status === 'failed'
                                  ? isMe ? 'bg-red-400/20 text-red-200' : 'bg-red-100 text-red-700'
                                  : isMe ? 'bg-white/20 text-white/70' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {msg.tx_status === 'confirmed' && <Check className="w-3 h-3" />}
                              {msg.tx_status === 'failed' && <X className="w-3 h-3" />}
                              {msg.tx_status === 'pending' && <Loader2 className="w-3 h-3 animate-spin" />}
                              {msg.tx_status.charAt(0).toUpperCase() + msg.tx_status.slice(1)}
                            </span>
                          )}
                          {msg.tx_signature && (
                            <a
                              href={getExplorerUrl(msg.tx_signature)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                                isMe ? 'text-white/60 hover:text-white/80' : 'text-[#9945FF] hover:text-[#7B2FE0]'
                              }`}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Explorer
                            </a>
                          )}
                        </div>
                        <span className={`text-[10px] block mt-2 ${isMe ? 'text-white/40' : 'text-gray-400'}`}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[calc(100vw-6rem)] sm:max-w-[280px] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? 'bg-[#9945FF] text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm break-words">{msg.content}</p>
                      <span className={`text-[10px] block mt-1 ${isMe ? 'text-white/50' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <AnimatePresence>
                {pendingPayment && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[calc(100vw-4rem)] sm:max-w-[340px] w-full rounded-2xl bg-white border-2 border-[#9945FF]/20 shadow-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-[#9945FF]/5 to-[#14F195]/5 px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#9945FF]/10 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-[#9945FF]" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-900">SendlyFi AI</span>
                            <span className="text-[10px] text-gray-400 ml-1.5">Payment detected</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-gray-700 mb-3">
                          You want to send <span className="font-bold text-gray-900">{pendingPayment.amount} {pendingPayment.token}</span> to <span className="font-bold text-[#9945FF]">@{activeConversation.other_username}</span>
                        </p>

                        <div className="bg-gray-50 rounded-xl p-3 mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">Amount</span>
                            <span className="font-bold text-gray-900">{pendingPayment.amount} {pendingPayment.token}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">To</span>
                            <span className="font-medium text-gray-900">@{activeConversation.other_username}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Network</span>
                            <span className={`font-medium ${isTestnet ? 'text-amber-600' : 'text-green-600'}`}>
                              {isTestnet ? 'Testnet' : 'Mainnet'}
                            </span>
                          </div>
                        </div>

                        {paymentError && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 mb-3">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-xs text-red-700">{paymentError}</span>
                          </div>
                        )}

                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') confirmPayment(); }}
                          placeholder="Enter password to confirm"
                          autoFocus
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all mb-3"
                        />

                        <div className="flex flex-col-reverse sm:flex-row gap-2">
                          <div className="flex gap-2 sm:contents">
                            <button
                              onClick={cancelPayment}
                              disabled={sendingPayment}
                              className="flex-1 sm:flex-none py-2.5 px-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={sendAsText}
                              disabled={sendingPayment || sendingMessage}
                              className="flex-1 sm:flex-none py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              Send as text
                            </button>
                          </div>
                          <button
                            onClick={confirmPayment}
                            disabled={sendingPayment || !confirmPassword}
                            className="w-full sm:w-auto sm:flex-1 py-2.5 px-4 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {sendingPayment ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4" />
                                Confirm & Send
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-center"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{successMessage}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder='Type a message or "send 10 USDC"...'
                    disabled={parsingIntent}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim() || sendingMessage || parsingIntent}
                  className="w-9 h-9 rounded-xl bg-[#9945FF] text-white flex items-center justify-center hover:bg-[#8030E0] transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  {parsingIntent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                AI detects payment intents automatically
              </p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
