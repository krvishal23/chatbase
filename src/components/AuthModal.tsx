import { useState } from 'react';
import { User } from '../types/chat';
import { MessageSquare, Sparkles, UserCheck, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (userData: {
    username: string;
    avatar: string;
    avatarColor: string;
    status: User['status'];
  }) => void;
}

const PRESET_AVATARS = [
  '⚡', '🚀', '👩‍💻', '👨‍💻', '🦊', '🐯', '🤖', '👾',
  '🎨', '🔮', '🌟', '💎', '🦄', '🍀', '🍕', '☕'
];

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
];

const DEMO_USERS = [
  { username: 'Alex Rivera', avatar: '⚡', avatarColor: '#3b82f6', role: 'Frontend Lead' },
  { username: 'Sarah Chen', avatar: '👩‍💻', avatarColor: '#ec4899', role: 'Fullstack Dev' },
  { username: 'Jordan Smith', avatar: '🚀', avatarColor: '#10b981', role: 'DevOps Engineer' },
  { username: 'Dev Guest', avatar: '👾', avatarColor: '#8b5cf6', role: 'Tester' },
];

export function AuthModal({ isOpen, onLogin }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('⚡');
  const [avatarColor, setAvatarColor] = useState('#6366f1');
  const [status, setStatus] = useState<User['status']>('online');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a display name or choose a profile');
      return;
    }
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    setError('');
    onLogin({
      username: username.trim(),
      avatar,
      avatarColor,
      status,
    });
  };

  const handleSelectDemo = (demo: typeof DEMO_USERS[0]) => {
    setUsername(demo.username);
    setAvatar(demo.avatar);
    setAvatarColor(demo.avatarColor);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-900 border-b border-slate-800/80">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                chatbbase <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">Real-Time</span>
              </h2>
              <p className="text-xs text-slate-400">Node.js + Express + Socket.io + AI Assistant</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Select Demo Accounts */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Sign In (Click to choose)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => {
                const isSelected = username === demo.username;
                return (
                  <button
                    key={demo.username}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-inner shrink-0"
                      style={{ backgroundColor: demo.avatarColor + '30', borderColor: demo.avatarColor }}
                    >
                      {demo.avatar}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">{demo.username}</div>
                      <div className="text-[10px] text-slate-400 truncate">{demo.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-widest absolute">
              or enter custom name
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username / Display Name
              </label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Alex, CyberDev, Jordan"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
              />
              {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Choose Emoji Avatar
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-slate-800">
                {PRESET_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                      avatar === emoji
                        ? 'bg-indigo-600/30 ring-2 ring-indigo-500 scale-110'
                        : 'hover:bg-slate-800 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Avatar Glow Color
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setAvatarColor(col)}
                    className={`w-7 h-7 rounded-full transition-all ${
                      avatarColor === col
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            {/* Initial Status */}
            <div>
              <label htmlFor="initial-status-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Initial Status
              </label>
              <select
                id="initial-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as User['status'])}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="online">🟢 Online (Active)</option>
                <option value="away">🟡 Away (Temporarily idle)</option>
                <option value="busy">🔴 Busy (Do not disturb)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <span>Enter chatbbase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
