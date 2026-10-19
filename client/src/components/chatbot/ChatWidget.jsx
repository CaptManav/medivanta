import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, RefreshCw } from 'lucide-react';
import { ChatBubble } from './ChatBubble.jsx';
import api from '../../services/api.js';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      isBot: true,
      text: "Namaste! I am MediBot 🏥. I provide real-time verified information for Dr. Awari Hospital and Samarth Ayurved College Hospital.\n\nAsk me about live beds, OPD timings, doctors, ambulance, or insurance!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const queryText = typeof textToSend === 'string' ? textToSend : input;
    if (!queryText.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      isBot: false,
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: queryText });
      const botReply = res.data.data.reply;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          isBot: true,
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          isBot: true,
          text: "I'm having difficulty connecting to the hospital live registry. Please call 108 for immediate medical emergencies.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Samarth Bed Availability',
    'Dr. Awari OPD Hours',
    'Ambulance contacts',
    'Is PM-JAY accepted?',
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-teal-600/30 transition-all duration-200 transform hover:scale-105 focus:outline-none"
          aria-label="Open MediBot live assistant"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-400 border-2 border-white"></span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                  MediBot
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-teal-900 text-teal-300 border border-teal-700">
                    Live DB
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Hospital & Bed Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m.text} isBot={m.isBot} timestamp={m.time} />
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-500 my-2 pl-9">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Checking live hospital database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 text-slate-600 transition-colors text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask beds, timings, ambulance..."
              className="flex-1 text-sm bg-slate-100 border border-transparent rounded-xl px-3.5 py-2 focus:bg-white focus:border-teal-600 focus:outline-none transition-all text-slate-800"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
