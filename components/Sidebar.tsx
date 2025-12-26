
import React from 'react';
import { Plus, MessageSquare, Trash2, Github, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ChatThread } from '../types';

interface SidebarProps {
  threads: ChatThread[];
  currentThreadId: string | null;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  threads,
  currentThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  isSidebarOpen,
  setSidebarOpen
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            New Chat
          </button>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="ml-2 lg:hidden p-2 text-slate-400 hover:text-slate-200"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {threads.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full mb-3">
                <MessageSquare className="text-slate-500" size={24} />
              </div>
              <p className="text-sm text-slate-500">No conversations yet</p>
            </div>
          ) : (
            threads.sort((a, b) => b.updatedAt - a.updatedAt).map((thread) => (
              <div
                key={thread.id}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  currentThreadId === thread.id 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
                onClick={() => {
                  onSelectThread(thread.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
              >
                <MessageSquare size={16} className="flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{thread.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(thread.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">Gemini User</p>
              <p className="text-xs text-slate-500 truncate">Free Plan</p>
            </div>
            <button className="text-slate-500 hover:text-slate-200">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
