import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Paperclip,
  Zap,
  Globe,
  Image as ImageIcon,
  Code,
  Terminal,
  Sparkles,
  Dice5,
  Activity,
  AtSign,
} from 'lucide-react';
import { Message, User } from '../types/chat';

interface MessageInputProps {
  onSendMessage: (text: string, attachment?: Message['attachment']) => void;
  onTyping: () => void;
  sendMethod: 'socket' | 'rest';
  onChangeSendMethod: (method: 'socket' | 'rest') => void;
  placeholder?: string;
  disabled?: boolean;
  onlineUsers?: User[];
}

const COMMON_EMOJIS = ['😀', '😂', '🔥', '🚀', '❤️', '👍', '🎉', '✨', '💡', '⚡', '🤖', '💻', '💯', '👏'];

const SLASH_COMMANDS = [
  { cmd: '/help', label: 'Help Guide', desc: 'List all chatbbase assistant commands', icon: Sparkles },
  { cmd: '/summary', label: 'Summarize', desc: 'AI summary of recent channel discussion', icon: Terminal },
  { cmd: '/status', label: 'Live Metrics', desc: 'Active sockets, messages count & uptime', icon: Activity },
  { cmd: '/roll', label: 'Roll Dice', desc: 'Roll a random number from 1 to 6', icon: Dice5 },
  { cmd: '/flip', label: 'Flip Coin', desc: 'Flip a coin (Heads / Tails)', icon: Sparkles },
  { cmd: '/time', label: 'Server Time', desc: 'Show server UTC and local time', icon: Terminal },
  { cmd: '/quote', label: 'Dev Quote', desc: 'Inspiring software engineering quote', icon: Sparkles },
];

export function MessageInput({
  onSendMessage,
  onTyping,
  sendMethod,
  onChangeSendMethod,
  placeholder = 'Type your message...',
  disabled = false,
  onlineUsers = [],
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  // Autocomplete state
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);

  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Monitor text for slash command or @ mention trigger
  useEffect(() => {
    if (text.startsWith('/')) {
      const query = text.slice(1).toLowerCase();
      setShowSlashMenu(true);
      setShowMentionMenu(false);
      setSlashFilter(query);
      setSelectedSlashIndex(0);
    } else {
      setShowSlashMenu(false);
    }

    const lastWord = text.split(/\s+/).pop() || '';
    if (lastWord.startsWith('@')) {
      const query = lastWord.slice(1).toLowerCase();
      setShowMentionMenu(true);
      setShowSlashMenu(false);
      setMentionFilter(query);
      setSelectedMentionIndex(0);
    } else {
      setShowMentionMenu(false);
    }
  }, [text]);

  const filteredCommands = SLASH_COMMANDS.filter(
    (c) => c.cmd.toLowerCase().includes(slashFilter) || c.label.toLowerCase().includes(slashFilter)
  );

  const mentionCandidates: { username: string; avatar: string; role?: string }[] = [
    { username: 'chatbbase', avatar: '⚡', role: 'AI Bot' },
    ...onlineUsers.map((u) => ({ username: u.username, avatar: u.avatar || '👤' })),
  ].filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.username.toLowerCase() === item.username.toLowerCase()) &&
      item.username.toLowerCase().includes(mentionFilter)
  );

  const handleSend = () => {
    if (!text.trim() && !imageUrl) return;

    let attachment: Message['attachment'] | undefined;
    if (imageUrl.trim()) {
      attachment = {
        type: 'image',
        url: imageUrl.trim(),
      };
    }

    onSendMessage(text, attachment);
    setText('');
    setImageUrl('');
    setShowImageInput(false);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setShowSlashMenu(false);
    setShowMentionMenu(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Navigate slash menu
    if (showSlashMenu && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashIndex((prev) => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        const selected = filteredCommands[selectedSlashIndex];
        if (selected) {
          setText(selected.cmd + ' ');
          setShowSlashMenu(false);
        }
        return;
      }
      if (e.key === 'Escape') {
        setShowSlashMenu(false);
        return;
      }
    }

    // Navigate mention menu
    if (showMentionMenu && mentionCandidates.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev + 1) % mentionCandidates.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev - 1 + mentionCandidates.length) % mentionCandidates.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        const selected = mentionCandidates[selectedMentionIndex];
        if (selected) {
          const words = text.split(/\s+/);
          words.pop();
          words.push(`@${selected.username} `);
          setText(words.join(' '));
          setShowMentionMenu(false);
        }
        return;
      }
      if (e.key === 'Escape') {
        setShowMentionMenu(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping();

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setText(promptText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800 relative">
      {/* Dynamic Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 pb-2 overflow-x-auto scrollbar-none text-xs">
        <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Quick:
        </span>
        {[
          { label: '⚡ Ask @chatbbase', text: '@chatbbase ' },
          { label: '📝 /summary', text: '/summary' },
          { label: '📊 /status', text: '/status' },
          { label: '🎲 /roll', text: '/roll' },
          { label: '💡 /quote', text: '/quote' },
        ].map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => handleQuickPrompt(chip.text)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all shrink-0 text-[11px] font-medium active:scale-95"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Optional Attached Image Preview */}
      {showImageInput && (
        <div className="mb-2 p-2.5 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center gap-2 shadow-inner">
          <ImageIcon className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste direct image URL (https://...jpg/png)"
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setShowImageInput(false);
              setImageUrl('');
            }}
            className="text-xs text-slate-400 hover:text-rose-400"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input container */}
      <div className="relative rounded-2xl bg-slate-950/90 border border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all p-1.5 shadow-xl">
        {/* Dynamic Slash Commands Autocomplete */}
        {showSlashMenu && filteredCommands.length > 0 && (
          <div className="absolute bottom-full left-2 mb-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>chatbbase Slash Commands</span>
              <span className="font-mono text-[9px]">Tab / Enter to select</span>
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {filteredCommands.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedSlashIndex;
                return (
                  <button
                    key={item.cmd}
                    type="button"
                    onClick={() => {
                      setText(item.cmd + ' ');
                      setShowSlashMenu(false);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors text-xs ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold">{item.cmd}</span>
                      <span className="text-[11px] opacity-75">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic @ Mention Autocomplete */}
        {showMentionMenu && mentionCandidates.length > 0 && (
          <div className="absolute bottom-full left-4 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Mention User or Bot
            </div>
            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              {mentionCandidates.map((cand, idx) => {
                const isSelected = idx === selectedMentionIndex;
                return (
                  <button
                    key={cand.username}
                    type="button"
                    onClick={() => {
                      const words = text.split(/\s+/);
                      words.pop();
                      words.push(`@${cand.username} `);
                      setText(words.join(' '));
                      setShowMentionMenu(false);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition-colors text-xs ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm">{cand.avatar}</span>
                    <span className="font-medium">@{cand.username}</span>
                    {cand.role && (
                      <span className="text-[10px] font-mono opacity-70 ml-auto">{cand.role}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Emoji popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-2 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-wrap gap-1.5 w-64 z-30 animate-in fade-in zoom-in-95 duration-150">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-lg hover:scale-110 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Attachment menu */}
        {showAttachMenu && (
          <div className="absolute bottom-full left-10 mb-2 p-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col gap-1 w-44 z-30 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => {
                setShowImageInput(true);
                setShowAttachMenu(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg text-left"
            >
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              Attach Image URL
            </button>
            <button
              type="button"
              onClick={() => {
                setText((prev) => prev + '```typescript\n// code snippet\n```\n');
                setShowAttachMenu(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg text-left"
            >
              <Code className="w-4 h-4 text-emerald-400" />
              Insert Code Block
            </button>
          </div>
        )}

        <div className="flex items-end gap-1.5">
          {/* Action buttons */}
          <div className="flex items-center pb-1 pl-1">
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
              title="Insert Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
              title="Add attachment"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="flex-1 max-h-36 py-2 px-2 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans"
          />

          {/* Send Method Toggle & Send Button */}
          <div className="flex items-center gap-1.5 pb-1 pr-1 shrink-0">
            <button
              type="button"
              onClick={() =>
                onChangeSendMethod(sendMethod === 'socket' ? 'rest' : 'socket')
              }
              title={`Delivery transport: ${
                sendMethod === 'socket' ? 'Socket.io real-time' : 'REST API POST'
              } (Click to toggle)`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-all border ${
                sendMethod === 'socket'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20 shadow-sm'
              }`}
            >
              {sendMethod === 'socket' ? (
                <>
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                  <span className="hidden sm:inline">Socket.io</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-indigo-400" />
                  <span className="hidden sm:inline">REST</span>
                </>
              )}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || (!text.trim() && !imageUrl)}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-1.5 px-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Type <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">/</kbd> for commands,{' '}
          <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">@</kbd> to mention
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          chatbbase ⚡ Real-Time
        </span>
      </div>
    </div>
  );
}
