import { useState } from 'react';
import { Room, User } from '../types/chat';
import {
  Hash,
  MessageSquare,
  Users,
  Plus,
  Zap,
  LogOut,
  ChevronDown,
  Sparkles,
  Lock,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  rooms: Room[];
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onlineUsers: User[];
  currentUser: User | null;
  onOpenCreateRoom: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onUpdateStatus: (status: User['status']) => void;
  onStartDirectMessage: (user: User) => void;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onTalkToChatbbase: () => void;
}

export function Sidebar({
  rooms,
  activeRoomId,
  onSelectRoom,
  onlineUsers,
  currentUser,
  onOpenCreateRoom,
  onLogout,
  onUpdateStatus,
  onStartDirectMessage,
  connectionStatus,
  onTalkToChatbbase,
}: SidebarProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const channels = rooms.filter((r) => r.type !== 'dm');
  const dms = rooms.filter((r) => r.type === 'dm');

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400 ring-emerald-400/30';
      case 'away':
        return 'bg-amber-400 ring-amber-400/30';
      case 'busy':
        return 'bg-rose-400 ring-rose-400/30';
      default:
        return 'bg-slate-500 ring-slate-500/30';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        return 'Offline';
    }
  };

  return (
    <aside className="w-64 sm:w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full shrink-0 select-none backdrop-blur-md">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/30">
            <Zap className="w-5 h-5 text-white fill-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5 font-sans">
              chatbbase
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.0
              </span>
            </h1>
            <p className="text-[11px] font-mono flex items-center gap-1.5">
              {connectionStatus === 'connected' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Socket.io Live
                </span>
              ) : connectionStatus === 'connecting' ? (
                <span className="text-amber-400">Connecting...</span>
              ) : (
                <span className="text-rose-400">Reconnecting...</span>
              )}
            </p>
          </div>
        </div>

        {/* Talk to chatbbase bot quick button */}
        <button
          onClick={onTalkToChatbbase}
          className="p-1.5 rounded-lg text-indigo-300 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 transition-all hover:scale-105"
          title="Direct Message with chatbbase Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Assistant Bot Spotlight Card */}
        <div
          onClick={onTalkToChatbbase}
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-all cursor-pointer group shadow-sm hover:shadow-indigo-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-sm shadow-inner">
                ⚡
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                  chatbbase Bot
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-400">AI Assistant & Utilities</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              Active
            </span>
          </div>
        </div>

        {/* Channels Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Channels ({channels.length})
            </span>
            <button
              onClick={onOpenCreateRoom}
              title="Create new channel"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {channels.map((channel) => {
              const isActive = channel.id === activeRoomId;
              return (
                <button
                  key={channel.id}
                  onClick={() => onSelectRoom(channel.id)}
                  className={`w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  {channel.isPrivate ? (
                    <Lock
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                  ) : (
                    <Hash
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                  )}
                  <span className="truncate text-left flex-1">{channel.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Messages Section */}
        {dms.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Direct Messages ({dms.length})
              </span>
            </div>
            <div className="space-y-0.5">
              {dms.map((dm) => {
                const isActive = dm.id === activeRoomId;
                return (
                  <button
                    key={dm.id}
                    onClick={() => onSelectRoom(dm.id)}
                    className={`w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate text-left flex-1">{dm.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Online / Active Users Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Online Users ({onlineUsers.length})
            </span>
          </div>

          <div className="space-y-0.5">
            {onlineUsers.length === 0 ? (
              <p className="px-2.5 py-2 text-xs text-slate-500 italic">No other users online yet</p>
            ) : (
              onlineUsers.map((user) => {
                const isMe = currentUser?.username === user.username;
                const isBot = user.username === 'chatbbase';
                return (
                  <div
                    key={user.id || user.username}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
                          style={{ backgroundColor: (user.avatarColor || '#6366f1') + '25' }}
                        >
                          {user.avatar || '👤'}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-slate-900 ${getStatusColor(
                            user.status
                          )}`}
                        />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-medium text-slate-200 block truncate">
                          {user.username}{' '}
                          {isMe && <span className="text-[10px] text-indigo-400">(you)</span>}
                          {isBot && (
                            <span className="text-[9px] font-mono px-1 rounded bg-indigo-500/20 text-indigo-300">
                              BOT
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {getStatusLabel(user.status)}
                        </span>
                      </div>
                    </div>

                    {!isMe && (
                      <button
                        onClick={() => onStartDirectMessage(user)}
                        title={`Message @${user.username}`}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-indigo-600 hover:text-white text-slate-400 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User Profile Footer Card */}
      {currentUser && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 relative">
          {/* Status dropdown */}
          {statusMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 p-1.5 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-30 space-y-1 animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">
                Change Status
              </div>
              {(['online', 'away', 'busy'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    onUpdateStatus(st);
                    setStatusMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700 rounded-xl text-left transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(st)}`} />
                  <span className="capitalize">{st}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-opacity flex-1 cursor-pointer"
            >
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold shadow-inner"
                  style={{ backgroundColor: currentUser.avatarColor + '30' }}
                >
                  {currentUser.avatar}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${getStatusColor(
                    currentUser.status
                  )}`}
                />
              </div>

              <div className="truncate flex-1">
                <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                  {currentUser.username}
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {currentUser.status}
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              title="Sign Out / Switch Profile"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
