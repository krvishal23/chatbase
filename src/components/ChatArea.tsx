import { useEffect, useRef, useState } from 'react';
import { Message, Room, User } from '../types/chat';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { TypingIndicator } from './TypingIndicator';
import { ChannelDetailsDrawer } from './ChannelDetailsDrawer';
import { MessageSquareDashed, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatAreaProps {
  room: Room;
  messages: Message[];
  rawMessagesCount: number;
  loadingHistory: boolean;
  error: string | null;
  onClearError: () => void;
  currentUser: User | null;
  onlineUsers: User[];
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  pingLatency: number | null;
  typingUsers: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sendMethod: 'socket' | 'rest';
  onChangeSendMethod: (m: 'socket' | 'rest') => void;
  onSendMessage: (text: string, attachment?: Message['attachment']) => void;
  onTyping: () => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onOpenApiExplorer: () => void;
  onOpenReadme: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
  onRetryLoad: () => void;
  onTalkToChatbbase: () => void;
  onStartDirectMessage: (user: User) => void;
}

export function ChatArea({
  room,
  messages,
  rawMessagesCount,
  loadingHistory,
  error,
  onClearError,
  currentUser,
  onlineUsers,
  connectionStatus,
  pingLatency,
  typingUsers,
  searchQuery,
  onSearchChange,
  sendMethod,
  onChangeSendMethod,
  onSendMessage,
  onTyping,
  onToggleReaction,
  onOpenApiExplorer,
  onOpenReadme,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  onRetryLoad,
  onTalkToChatbbase,
  onStartDirectMessage,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleTogglePin = (messageId: string) => {
    setPinnedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  };

  const handleQuoteReply = (quotedText: string, senderName: string) => {
    onSendMessage(`> ${senderName}: ${quotedText}\n\n`);
  };

  const handleExecuteCommand = (cmd: string) => {
    onSendMessage(cmd);
  };

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    msgs.forEach((msg) => {
      const msgDate = new Date(msg.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel = msgDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (msgDate.toDateString() === today.toDateString()) {
        dateLabel = 'Today';
      } else if (msgDate.toDateString() === yesterday.toDateString()) {
        dateLabel = 'Yesterday';
      }

      const existingGroup = groups.find((g) => g.date === dateLabel);
      const enrichedMsg = {
        ...msg,
        isPinned: pinnedMessageIds.has(msg.id),
      };

      if (existingGroup) {
        existingGroup.messages.push(enrichedMsg);
      } else {
        groups.push({ date: dateLabel, messages: [enrichedMsg] });
      }
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);
  const pinnedMessages = messages.filter((m) => pinnedMessageIds.has(m.id));

  return (
    <div className="flex-1 flex h-full bg-slate-950 min-w-0 overflow-hidden relative">
      {/* Primary Chat Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <ChatHeader
          room={room}
          connectionStatus={connectionStatus}
          pingLatency={pingLatency}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenApiExplorer={onOpenApiExplorer}
          onOpenReadme={onOpenReadme}
          onToggleMobileSidebar={onToggleMobileSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
          memberCount={onlineUsers.length}
          onToggleDetailsDrawer={() => setIsDetailsDrawerOpen(!isDetailsDrawerOpen)}
          isDetailsDrawerOpen={isDetailsDrawerOpen}
          onTalkToChatbbase={onTalkToChatbbase}
        />

        {/* Error Alert Bar */}
        {error && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={onClearError}
              className="text-xs text-rose-400 hover:text-white font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-xs">Fetching history from chatbbase API...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 py-12 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-md">
                <MessageSquareDashed className="w-6 h-6 text-indigo-400" />
              </div>
              {searchQuery ? (
                <div>
                  <p className="text-sm font-semibold text-slate-300">No matching messages found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try another keyword or clear the search filter.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-300">
                    Welcome to #{room.name}!
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    This is the start of #{room.name}. Type <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400">/help</code> or ask <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400">@chatbbase</code> anything to see live real-time answers!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messageGroups.map((group) => (
                <div key={group.date} className="space-y-2">
                  {/* Date separator */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-slate-800/80 w-full" />
                    <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono font-medium px-3 py-0.5 rounded-full absolute shadow-sm">
                      {group.date}
                    </span>
                  </div>

                  {/* Messages in this date */}
                  <div className="space-y-1">
                    {group.messages.map((message) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        currentUser={currentUser}
                        onToggleReaction={onToggleReaction}
                        onQuoteReply={handleQuoteReply}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Bottom Message Input */}
        <MessageInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          sendMethod={sendMethod}
          onChangeSendMethod={onChangeSendMethod}
          placeholder={`Message #${room.name}... (type / for commands, @ for mentions)`}
          disabled={!currentUser}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Right-Hand Context Drawer */}
      <ChannelDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        room={room}
        members={onlineUsers}
        pinnedMessages={pinnedMessages}
        onExecuteCommand={handleExecuteCommand}
        onSelectUserDm={onStartDirectMessage}
      />
    </div>
  );
}
