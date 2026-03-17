import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search, MessageSquare, Send, Plus, DollarSign,
  Paperclip, Users, ChevronLeft
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [showConversation, setShowConversation] = useState(false);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-[calc(100vh-3.5rem)] lg:h-screen flex"
    >
      <motion.div
        variants={item}
        className={`w-full lg:w-80 border-r border-white/[0.06] flex flex-col bg-[#0F0F23]/80 backdrop-blur-xl ${
          showConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Chat</h1>
            <button
              onClick={() => setShowConversation(true)}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9945FF]/20 to-[#9945FF]/10 text-[#9945FF] flex items-center justify-center hover:from-[#9945FF]/30 hover:to-[#9945FF]/20 transition-all duration-200 border border-[#9945FF]/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-[#9945FF] transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#9945FF]/40 focus:bg-white/[0.06] focus:shadow-[0_0_15px_-4px_rgba(153,69,255,0.2)] transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center mb-4">
            <MessageSquare className="w-7 h-7 text-white/25" />
          </div>
          <h3 className="text-white/70 font-medium mb-1">No conversations yet</h3>
          <p className="text-white/35 text-sm mb-4">
            Start a new chat to send payments and messages.
          </p>
          <button
            onClick={() => setShowConversation(true)}
            className="px-4 py-2 rounded-xl bg-[#9945FF]/10 text-[#9945FF] text-sm font-medium hover:bg-[#9945FF]/20 transition-all duration-200 flex items-center gap-2 border border-[#9945FF]/20"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className={`flex-1 flex flex-col bg-[#0B0B1A] ${
          !showConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-white/[0.06] bg-[#0F0F23]/80 backdrop-blur-xl">
          <button
            onClick={() => setShowConversation(false)}
            className="w-9 h-9 rounded-xl bg-white/[0.06] text-white/50 flex items-center justify-center hover:bg-white/[0.1] transition-colors border border-white/[0.06]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-white/70">New Conversation</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10 flex items-center justify-center mb-6 border border-white/[0.06] shadow-[0_8px_40px_-12px_rgba(153,69,255,0.15)]">
            <Users className="w-10 h-10 text-white/25" />
          </div>
          <h2 className="text-xl font-bold text-white/70 mb-2">Select a conversation</h2>
          <p className="text-white/35 text-sm max-w-sm">
            Choose a contact from the sidebar or start a new conversation to begin chatting and sending payments.
          </p>
        </div>

        <div className="border-t border-white/[0.06] p-4 bg-[#0F0F23]/60 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl bg-white/[0.06] text-white/40 flex items-center justify-center hover:bg-white/[0.1] hover:text-white/60 transition-all duration-200 flex-shrink-0 border border-white/[0.06]">
              <DollarSign className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/[0.06] text-white/40 flex items-center justify-center hover:bg-white/[0.1] hover:text-white/60 transition-all duration-200 flex-shrink-0 border border-white/[0.06]">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#9945FF]/40 focus:bg-white/[0.06] focus:shadow-[0_0_15px_-4px_rgba(153,69,255,0.2)] transition-all duration-300"
              />
            </div>
            <button className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#7B2FE0] text-white flex items-center justify-center hover:shadow-[0_0_20px_-4px_rgba(153,69,255,0.5)] hover:brightness-110 transition-all duration-300 flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
