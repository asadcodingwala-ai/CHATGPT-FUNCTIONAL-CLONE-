
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-8">
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 transition-all focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Gemini..."
          disabled={disabled}
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 py-3 px-4 resize-none max-h-[200px] text-sm md:text-base custom-scrollbar"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-3 mb-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center"
        >
          {disabled ? (
            <div className="flex gap-1 items-center px-1">
              <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
      <p className="text-[10px] md:text-xs text-center text-slate-500 mt-3 flex items-center justify-center gap-1.5">
        <Sparkles size={12} /> Powered by Gemini-3 Flash. Context is preserved within the session.
      </p>
    </div>
  );
};
