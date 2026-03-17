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
              aria-label="New conversation"
              className="w-9 h-9 rounded-xl sf-icon-chip-purple flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#9945FF] transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="sf-input pl-10"
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
            className="sf-btn-secondary"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className={`flex-1 flex flex-col bg-[#F7F8FA] ${
          !showConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setShowConversation(false)}
            aria-label="Back to conversations"
            className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">New Conversation</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Select a conversation</h2>
          <p className="text-gray-500 text-sm max-w-sm">
            Choose a contact from the sidebar or start a new conversation to begin chatting and sending payments.
          </p>
        </div>

        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center gap-2">
            <button aria-label="Attach payment" className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200 hover:text-gray-600 transition-all duration-200 flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </button>
            <button aria-label="Attach file" className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200 hover:text-gray-600 transition-all duration-200 flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="sf-input"
              />
            </div>
            <button aria-label="Send message" className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#7B2FE0] text-white flex items-center justify-center hover:shadow-[0_4px_20px_-4px_rgba(153,69,255,0.4)] transition-all duration-300 flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
