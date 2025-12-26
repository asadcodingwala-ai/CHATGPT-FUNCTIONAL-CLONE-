
import React from 'react';
import { Message } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group w-full py-8 ${isUser ? 'bg-transparent' : 'bg-slate-800/40 border-y border-slate-700/50'}`}>
      <div className="max-w-3xl mx-auto px-4 flex gap-6">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-emerald-600 shadow-lg shadow-emerald-900/20'}`}>
          {isUser ? <User size={20} className="text-white" /> : <Bot size={22} className="text-white" />}
        </div>
        
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isUser ? 'You' : 'Gemini AI'}
            </span>
            {!isUser && !isStreaming && (
              <button 
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-700 rounded-md text-slate-400"
                title="Copy response"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            )}
          </div>
          
          <div className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="inline-block ml-1 w-1.5 h-4 bg-emerald-400 animate-pulse align-middle" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
