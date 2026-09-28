import React, { useState } from 'react';
import { Message, User } from '../types/chat';
import { Check, CheckCheck, Clock, Smile, Pin, Quote, Sparkles } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  currentUser: User | null;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onQuoteReply?: (text: string, senderName: string) => void;
  onTogglePin?: (messageId: string) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🚀', '😂', '🎉'];

export function MessageItem({
  message,
  currentUser,
  onToggleReaction,
  onQuoteReply,
  onTogglePin,
}: MessageItemProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isMe = currentUser?.username === message.sender.username;
  const isBot = message.sender.username === 'chatbbase' || message.sender.id === 'sys-chatbbase';

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const fullDateTooltip = new Date(message.createdAt).toLocaleString();

  const renderStatus = () => {
    if (!isMe) return null;
    if (message.status === 'sending') {
      return (
        <span title="Sending...">
          <Clock className="w-3 h-3 text-slate-500 animate-spin" />
        </span>
      );
    }
    if (message.status === 'read') {
      return (
        <span title="Read">
          <CheckCheck className="w-3.5 h-3.5 text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
        </span>
      );
    }
    return (
      <span title="Delivered">
        <Check className="w-3 h-3 text-slate-400" />
      </span>
    );
  };

  // Helper to parse basic markdown, mentions, code blocks, and lists
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Code block lines
      if (line.startsWith('```') || line.endsWith('```')) {
        return (
          <div key={idx} className="font-mono text-xs text-emerald-400 bg-slate-950 p-2 rounded-md my-1 border border-slate-800">
            {line.replace(/```[a-z]*/g, '')}
          </div>
        );
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="pl-3 border-l-2 border-indigo-500 text-slate-400 italic my-1">
            {line.slice(2)}
          </blockquote>
        );
      }

      // Bullet points
      const isBullet = line.startsWith('• ') || line.startsWith('- ');
      const content = isBullet ? line.slice(2) : line;

      // Parse bold, inline code, and mentions
      const parts = content.split(/(\*\*.*?\*\*|`.*?`|@[a-zA-Z0-9_-]+)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('@')) {
          const isChatbbase = part.toLowerCase() === '@chatbbase' || part.toLowerCase() === '@chatbase';
          return (
            <span
              key={pIdx}
              className={`font-semibold px-1 py-0.2 rounded transition-colors ${
                isChatbbase
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono'
                  : 'bg-slate-800 text-sky-400'
              }`}
            >
              {part}
            </span>
          );
        }
        return part;
      });

      return (
        <div key={idx} className={`${isBullet ? 'flex items-start gap-1.5' : ''}`}>
          {isBullet && <span className="text-indigo-400 shrink-0">•</span>}
          <span>{renderedParts}</span>
        </div>
      );
    });
  };

  return (
    <div
      className={`group relative flex gap-3 px-3 sm:px-4 py-2 hover:bg-slate-900/70 rounded-xl transition-all duration-150 ${
        isBot
          ? 'bg-gradient-to-r from-indigo-950/20 to-transparent border-l-2 border-indigo-500 pl-3'
          : isMe
          ? 'bg-indigo-950/10'
          : ''
      } ${message.isPinned ? 'ring-1 ring-amber-500/30 bg-amber-500/5' : ''}`}
    >
      {/* Sender Avatar */}
      <div className="shrink-0 pt-0.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm ring-1 ring-slate-800 transition-transform group-hover:scale-105 ${
            isBot ? 'ring-indigo-500/40 shadow-indigo-500/20 shadow-md' : ''
          }`}
          style={{
            backgroundColor: (message.sender.avatarColor || '#6366f1') + '25',
            borderColor: message.sender.avatarColor || '#6366f1',
          }}
        >
          {isBot ? '⚡' : message.sender.avatar || '💬'}
        </div>
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className={`text-xs font-semibold ${
              isBot
                ? 'text-indigo-300 flex items-center gap-1 font-bold'
                : isMe
                ? 'text-indigo-400'
                : 'text-slate-200'
            }`}
          >
            {message.sender.username}
          </span>

          {isBot && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              BOT
            </span>
          )}

          {isMe && !isBot && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              You
            </span>
          )}

          {message.isPinned && (
            <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
              <Pin className="w-2.5 h-2.5" />
              Pinned
            </span>
          )}

          <span
            className="text-[11px] text-slate-500 hover:text-slate-400 cursor-default font-mono"
            title={fullDateTooltip}
          >
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Content */}
        <div className="text-sm text-slate-200 leading-relaxed break-words space-y-0.5">
          {renderFormattedText(message.text)}
        </div>

        {/* Image Attachment (if any) */}
        {message.attachment?.type === 'image' && message.attachment.url && (
          <div className="mt-2 max-w-sm rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
            <img
              src={message.attachment.url}
              alt="attachment"
              className="w-full h-auto object-cover max-h-64 hover:scale-[1.02] transition-transform duration-200"
              loading="lazy"
            />
          </div>
        )}

        {/* Reactions Badges */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.reactions.map((reaction) => {
              const hasReacted =
                currentUser && reaction.users.includes(currentUser.username);
              return (
                <button
                  key={reaction.emoji}
                  onClick={() => onToggleReaction(message.id, reaction.emoji)}
                  title={`Reacted by: ${reaction.users.join(', ')}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                    hasReacted
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/30 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm leading-none">{reaction.emoji}</span>
                  <span className="text-[11px] font-mono">{reaction.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Delivery / Read Status indicator */}
        <div className="flex items-center justify-end gap-1 mt-0.5 text-[11px] text-slate-500">
          {renderStatus()}
        </div>
      </div>

      {/* Floating Action Bar on Hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-2 flex items-center bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl p-0.5 z-10">
        {/* Quick Emojis */}
        <div className="flex items-center">
          {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
            <button
              key={emoji}
              onClick={() => onToggleReaction(message.id, emoji)}
              className="p-1 hover:bg-slate-700 rounded-lg text-xs transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Emoji picker trigger */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add reaction"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute right-0 bottom-full mb-1 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex gap-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              {['🎉', '🚀', '👀', '💯', '🤔', '👏', '⚡', '💡'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onToggleReaction(message.id, emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-sm hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quote Reply Button */}
        {onQuoteReply && (
          <button
            onClick={() => onQuoteReply(message.text, message.sender.username)}
            title="Quote message"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Pin Button */}
        {onTogglePin && (
          <button
            onClick={() => onTogglePin(message.id)}
            title={message.isPinned ? 'Unpin message' : 'Pin message'}
            className={`p-1 rounded-lg transition-colors ${
              message.isPinned
                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
