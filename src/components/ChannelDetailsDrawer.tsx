import { X, Hash, Lock, Users, Pin, Sparkles, Terminal, Dice5, HelpCircle, Activity, Image as ImageIcon } from 'lucide-react';
import { Message, Room, User } from '../types/chat';

interface ChannelDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  members: User[];
  pinnedMessages: Message[];
  onExecuteCommand: (command: string) => void;
  onSelectUserDm: (user: User) => void;
}

export function ChannelDetailsDrawer({
  isOpen,
  onClose,
  room,
  members,
  pinnedMessages,
  onExecuteCommand,
  onSelectUserDm,
}: ChannelDetailsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-col h-full shrink-0 animate-in slide-in-from-right duration-200 select-none z-20">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
            {room.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />}
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-white truncate">#{room.name}</h3>
            <span className="text-[10px] text-slate-400">Channel Overview</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
        {/* About / Topic Card */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            About Channel
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {room.description || 'Welcome to this channel! Use it for team communication and updates.'}
          </p>
          <div className="text-[10px] text-slate-500 pt-1">
            Created on {new Date(room.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* chatbbase Bot Toolbox */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              chatbbase Bot Commands
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { cmd: '/summary', label: 'Summarize', icon: Terminal, desc: 'AI summary' },
              { cmd: '/status', label: 'Server Stats', icon: Activity, desc: 'Live metrics' },
              { cmd: '/roll', label: 'Roll Dice', icon: Dice5, desc: '1 to 6' },
              { cmd: '/help', label: 'Help Guide', icon: HelpCircle, desc: 'All tools' },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.cmd}
                  onClick={() => onExecuteCommand(tool.cmd)}
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700/60 hover:border-indigo-500/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-slate-200 group-hover:text-indigo-300 font-medium">
                    <Icon className="w-3 h-3 text-indigo-400" />
                    <span className="font-mono text-[11px]">{tool.cmd}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{tool.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pinned Messages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Pin className="w-3 h-3 text-amber-400" />
              Pinned Messages ({pinnedMessages.length})
            </span>
          </div>

          {pinnedMessages.length === 0 ? (
            <p className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-500 italic">
              No pinned messages in this channel yet. Click pin on any message to highlight it here.
            </p>
          ) : (
            <div className="space-y-1.5">
              {pinnedMessages.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                    <span>{m.sender.avatar}</span>
                    <span>{m.sender.username}</span>
                  </div>
                  <p className="text-slate-300 line-clamp-2 text-[11px]">{m.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Channel Members */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-400" />
              Active Members ({members.length})
            </span>
          </div>

          <div className="space-y-1">
            {members.map((u) => (
              <div
                key={u.id || u.username}
                onClick={() => onSelectUserDm(u)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                      style={{ backgroundColor: (u.avatarColor || '#6366f1') + '25' }}
                    >
                      {u.avatar || '👤'}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-slate-900 ${
                        u.status === 'online'
                          ? 'bg-emerald-400'
                          : u.status === 'away'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                  </div>
                  <div className="truncate">
                    <div className="text-slate-200 font-medium truncate flex items-center gap-1">
                      {u.username}
                      {u.username === 'chatbbase' && (
                        <span className="text-[9px] font-mono px-1 bg-indigo-500/20 text-indigo-300 rounded">
                          BOT
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-indigo-400">
                  Message
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
