import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Search, MessageSquare, Send, Plus, DollarSign,
  ChevronLeft, ExternalLink, Loader2, AlertCircle,
  Check, X, Coins, Droplets
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
  const [showPayment, setShowPayment] = useState(false);
  const [paymentToken, setPaymentToken] = useState<'SOL' | 'USDC'>('SOL');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPassword, setPaymentPassword] = useState('');
  const [sendingPayment, setSendingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [airdropping, setAirdropping] = useState(false);
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
  }, [messages]);

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

  const sendMessage = async () => {
    if (!token || !activeConversation || !messageText.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageText.trim() }),
      });
      if (res.ok) {
        setMessageText('');
        await fetchMessages(activeConversation.id);
        await fetchConversations();
      }
    } catch { /* silent */ } finally {
      setSendingMessage(false);
    }
  };

  const sendPayment = async () => {
    if (!token || !activeConversation || !paymentAmount || !paymentPassword || sendingPayment) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Enter a valid amount');
      return;
    }
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
          amount,
          token: paymentToken,
          password: paymentPassword,
          conversationId: activeConversation.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data.error || 'Transaction failed');
        return;
      }
      setShowPayment(false);
      setPaymentAmount('');
      setPaymentPassword('');
      setPaymentError('');
      await fetchMessages(activeConversation.id);
      await fetchConversations();
    } catch {
      setPaymentError('Failed to send payment');
    } finally {
      setSendingPayment(false);
    }
  };

  const requestAirdrop = async () => {
    if (!token || airdropping) return;
    setAirdropping(true);
    try {
      const res = await fetch('/api/transactions/airdrop', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('1 SOL airdropped to your wallet!');
      } else {
        const data = await res.json();
        alert(data.error || 'Airdrop failed');
      }
    } catch {
      alert('Airdrop request failed');
    } finally {
      setAirdropping(false);
    }
  };

  const selectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setShowConversation(true);
    setShowPayment(false);
    setPaymentError('');
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
      className="h-[calc(100vh-3.5rem)] lg:h-screen flex"
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
              {isTestnet && (
                <button
                  onClick={requestAirdrop}
                  disabled={airdropping}
                  className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors"
                  title="Request 1 SOL Airdrop (Testnet)"
                >
                  <Droplets className={`w-5 h-5 ${airdropping ? 'animate-pulse' : ''}`} />
                </button>
              )}
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
        className={`flex-1 flex flex-col bg-[#F4F5F7] ${
          !showConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {!activeConversation ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">Select a conversation</h2>
              <p className="text-gray-500 text-sm max-w-sm">
                Choose a contact from the sidebar or start a new conversation to begin chatting and sending payments.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
              <button
                onClick={() => { setShowConversation(false); setShowPayment(false); }}
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
            </div>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Start the conversation by sending a message</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                const isPayment = msg.message_type === 'payment';

                if (isPayment) {
                  const isSender = isMe;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[320px] rounded-2xl p-4 ${
                        isMe ? 'bg-gradient-to-br from-[#9945FF] to-[#7B2FE0] text-white' : 'bg-white border border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Coins className={`w-4 h-4 ${isMe ? 'text-white/70' : 'text-[#9945FF]'}`} />
                          <span className={`text-xs font-medium ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                            {isSender ? 'Payment Sent' : 'Payment Received'}
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
                    <div className={`max-w-[280px] rounded-2xl px-4 py-2.5 ${
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
              <div ref={messagesEndRef} />
            </div>

            {showPayment && (
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Send Payment</h3>
                  <button
                    onClick={() => { setShowPayment(false); setPaymentError(''); }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {paymentError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 mb-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-xs text-red-700">{paymentError}</span>
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setPaymentToken('SOL')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      paymentToken === 'SOL'
                        ? 'bg-[#9945FF]/10 text-[#9945FF] border border-[#9945FF]/30'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    SOL
                  </button>
                  <button
                    onClick={() => setPaymentToken('USDC')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      paymentToken === 'USDC'
                        ? 'bg-[#14F195]/10 text-[#0DAA6D] border border-[#14F195]/30'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    USDC
                  </button>
                </div>

                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Amount in ${paymentToken}`}
                  step={paymentToken === 'SOL' ? '0.0001' : '0.01'}
                  min="0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all mb-3"
                />

                <input
                  type="password"
                  value={paymentPassword}
                  onChange={(e) => setPaymentPassword(e.target.value)}
                  placeholder="Enter password to confirm"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all mb-3"
                />

                <button
                  onClick={sendPayment}
                  disabled={sendingPayment || !paymentAmount || !paymentPassword}
                  className="w-full py-2.5 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send {paymentAmount || '0'} {paymentToken}
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowPayment(!showPayment); setPaymentError(''); }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                    showPayment
                      ? 'bg-[#9945FF]/10 text-[#9945FF]'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim() || sendingMessage}
                  className="w-9 h-9 rounded-xl bg-[#9945FF] text-white flex items-center justify-center hover:bg-[#8030E0] transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
