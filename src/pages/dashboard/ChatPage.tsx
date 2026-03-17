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
        className={`w-full lg:w-80 border-r border-gray-200 flex flex-col bg-white ${
          showConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Chat</h1>
            <button
              onClick={() => setShowConversation(true)}
              className="w-9 h-9 rounded-xl bg-[#9945FF]/10 text-[#9945FF] flex items-center justify-center hover:bg-[#9945FF]/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <MessageSquare className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-gray-700 font-medium mb-1">No conversations yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Start a new chat to send payments and messages.
          </p>
          <button
            onClick={() => setShowConversation(true)}
            className="px-4 py-2 rounded-xl bg-[#9945FF]/10 text-[#9945FF] text-sm font-medium hover:bg-[#9945FF]/20 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className={`flex-1 flex flex-col bg-[#F4F5F7] ${
          !showConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setShowConversation(false)}
            className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">New Conversation</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10 flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Select a conversation</h2>
          <p className="text-gray-500 text-sm max-w-sm">
            Choose a contact from the sidebar or start a new conversation to begin chatting and sending payments.
          </p>
        </div>

        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#9945FF]/40 focus:ring-2 focus:ring-[#9945FF]/10 transition-all"
              />
            </div>
            <button className="w-9 h-9 rounded-xl bg-[#9945FF] text-white flex items-center justify-center hover:bg-[#8030E0] transition-colors flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
