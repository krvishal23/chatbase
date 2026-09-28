import { useState } from 'react';
import { Room } from '../types/chat';
import {
  Hash,
  Lock,
  MessageSquare,
  Search,
  Volume2,
  VolumeX,
  Code2,
  BookOpen,
  Menu,
  X,
  Sparkles,
  Info,
  Activity,
  Pin,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface ChatHeaderProps {
  room: Room;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  pingLatency: number | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenApiExplorer: () => void;
  onOpenReadme: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
  memberCount: number;
  onToggleDetailsDrawer: () => void;
  isDetailsDrawerOpen: boolean;
  onTalkToChatbbase: () => void;
}

export function ChatHeader({
  room,
  connectionStatus,
  pingLatency,
  searchQuery,
  onSearchChange,
  onOpenApiExplorer,
  onOpenReadme,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  memberCount,
  onToggleDetailsDrawer,
  isDetailsDrawerOpen,
  onTalkToChatbbase,
}: ChatHeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showTopicBanner, setShowTopicBanner] = useState(false);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(sounds.enabled);
    if (sounds.enabled) {
      sounds.playSend();
    }
  };

  return (
    <div className="flex flex-col shrink-0">
      <header className="h-16 px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Toggle & Room Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
            title="Toggle Channels"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-sm">
              {room.type === 'dm' ? (
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              ) : room.isPrivate ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : (
                <Hash className="w-4 h-4 text-indigo-400" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                  {room.name}
                  {room.name === 'chatbbase' && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                      AI Bot
                    </span>
                  )}
                </h2>

                <button
                  onClick={() => setShowTopicBanner(!showTopicBanner)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded cursor-pointer hidden sm:inline"
                  title="Toggle Topic Header"
                >
                  <Pin className="w-3 h-3" />
                </button>
              </div>

              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {room.description || 'Welcome to this conversation'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions, Search, API Explorer, Connection status */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick ask bot button */}
          <button
            onClick={onTalkToChatbbase}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl transition-all cursor-pointer"
            title="Ask chatbbase bot"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>@chatbbase</span>
          </button>

          {/* Search */}
          {showSearchInput ? (
            <div className="relative flex items-center animate-in fade-in duration-150">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filter messages..."
                autoFocus
                className="w-36 sm:w-48 pl-7 pr-7 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <button
                onClick={() => {
                  onSearchChange('');
                  setShowSearchInput(false);
                }}
                className="absolute right-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Search in channel"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleSound}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={soundEnabled ? 'Audio Chimes Enabled' : 'Audio Muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* REST API Explorer */}
          <button
            onClick={onOpenApiExplorer}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl transition-all cursor-pointer font-mono"
            title="Inspect & Test REST API Endpoints"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">REST API</span>
          </button>

          {/* Documentation Modal */}
          <button
            onClick={onOpenReadme}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl transition-all cursor-pointer"
            title="Architecture & Setup Docs"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Docs</span>
          </button>

          {/* Details Drawer Toggle */}
          <button
            onClick={onToggleDetailsDrawer}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isDetailsDrawerOpen
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Channel Info & Bot Tools"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Socket.io Live Status Badge */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 font-mono text-[11px]">
            {connectionStatus === 'connected' ? (
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                title="Socket.io connected in real time"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden md:inline">Socket.io</span>
                {pingLatency !== null && <span>{pingLatency}ms</span>}
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Dynamic Pinned Announcement / Topic Bar */}
      {showTopicBanner && (
        <div className="px-4 py-2 bg-indigo-950/30 border-b border-indigo-900/40 text-xs text-indigo-200 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">
              <strong>Channel Goal:</strong> {room.description || 'General discussions & team collaboration.'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400/80 shrink-0 ml-2">
            Tip: Type <code className="bg-indigo-950 px-1 rounded">/summary</code> to recap
          </span>
        </div>
      )}
    </div>
  );
}
