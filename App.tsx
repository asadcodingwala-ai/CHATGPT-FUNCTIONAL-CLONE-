
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatThread, Message, ModelType } from './types';
import { geminiService } from './services/geminiService';
import { PanelLeftOpen, Terminal, Share2, MoreHorizontal, Bot } from 'lucide-react';

const STORAGE_KEY = 'gemini_chat_history_v1';

const App: React.FC = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThreads(parsed);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    }
  }, [threads]);

  // Scroll to bottom on messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threads, currentThreadId, streamingContent]);

  const currentThread = threads.find(t => t.id === currentThreadId) || null;

  const handleNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    const newThread: ChatThread = {
      id: newId,
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now()
    };
    setThreads(prev => [newThread, ...prev]);
    setCurrentThreadId(newId);
  }, []);

  const handleDeleteThread = useCallback((id: string) => {
    setThreads(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (currentThreadId === id) {
        setCurrentThreadId(filtered[0]?.id || null);
      }
      return filtered;
    });
  }, [currentThreadId]);

  const handleSendMessage = async (content: string) => {
    let activeThreadId = currentThreadId;
    
    // Create new thread if none exists
    if (!activeThreadId) {
      activeThreadId = crypto.randomUUID();
      const newThread: ChatThread = {
        id: activeThreadId,
        title: content.slice(0, 30) + '...',
        messages: [],
        updatedAt: Date.now()
      };
      setThreads(prev => [newThread, ...prev]);
      setCurrentThreadId(activeThreadId);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // Update state with user message
    setThreads(prev => prev.map(t => 
      t.id === activeThreadId 
      ? { ...t, messages: [...t.messages, userMessage], updatedAt: Date.now() }
      : t
    ));

    setIsLoading(true);
    setStreamingContent('');

    try {
      const threadToProcess = threads.find(t => t.id === activeThreadId) || { messages: [] };
      const fullMessages = [...threadToProcess.messages, userMessage];
      
      let fullAssistantContent = '';
      const stream = geminiService.streamChat(fullMessages, ModelType.FLASH);

      for await (const chunk of stream) {
        fullAssistantContent += chunk;
        setStreamingContent(fullAssistantContent);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullAssistantContent,
        timestamp: Date.now()
      };

      setThreads(prev => prev.map(t => 
        t.id === activeThreadId 
        ? { ...t, messages: [...t.messages, assistantMessage], updatedAt: Date.now() }
        : t
      ));

      // Generate title if it's the first exchange
      if (fullMessages.length === 1) {
        const title = await geminiService.generateTitle(content);
        setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, title } : t));
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: Date.now()
      };
      setThreads(prev => prev.map(t => 
        t.id === activeThreadId 
        ? { ...t, messages: [...t.messages, errorMessage] }
        : t
      ));
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onSelectThread={setCurrentThreadId}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-200 lg:p-1.5"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200 truncate max-w-[150px] md:max-w-xs">
                {currentThread?.title || 'Gemini Chat Pro'}
              </span>
              <div className="hidden md:flex px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] text-slate-400 font-mono uppercase">
                Flash 3.0
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <Share2 size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col" ref={scrollRef}>
          {!currentThread || currentThread.messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mb-2">
                <Bot size={40} />
              </div>
              <div className="max-w-md space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">How can I help you today?</h1>
                <p className="text-slate-400 text-sm md:text-base">
                  Gemini Chat Pro is a versatile assistant that can help with coding, creative writing, analysis, and more.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  "Write a React hook for local storage",
                  "Plan a 3-day trip to Kyoto",
                  "Explain quantum entanglement simply",
                  "Draft a professional email for a job application"
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => handleSendMessage(hint)}
                    className="p-4 text-left rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 transition-all text-sm text-slate-300"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-32">
              {currentThread.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && streamingContent && (
                <ChatMessage 
                  message={{ 
                    id: 'streaming', 
                    role: 'assistant', 
                    content: streamingContent, 
                    timestamp: Date.now() 
                  }} 
                  isStreaming={true}
                />
              )}
              {isLoading && !streamingContent && (
                <div className="w-full py-8 bg-slate-800/40 border-y border-slate-700/50">
                  <div className="max-w-3xl mx-auto px-4 flex gap-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <Bot size={22} className="text-white" />
                    </div>
                    <div className="flex items-center h-10 ml-2">
                      <div className="dot-flashing" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-10">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default App;
