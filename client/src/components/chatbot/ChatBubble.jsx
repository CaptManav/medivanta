import React from 'react';
import clsx from 'clsx';
import { Bot, User } from 'lucide-react';

export const ChatBubble = ({ message, isBot = true, timestamp, data }) => {
  return (
    <div className={clsx('flex gap-2.5 my-3', isBot ? 'justify-start' : 'justify-end')}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={clsx('max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm',
        isBot
          ? 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200/60'
          : 'bg-teal-600 text-white rounded-tr-sm'
      )}>
        <p className="whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <span className={clsx('block text-[10px] mt-1 text-right', isBot ? 'text-slate-400' : 'text-teal-200')}>
            {timestamp}
          </span>
        )}
      </div>

      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
