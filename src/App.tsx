import { useState } from 'react';
import { useChat } from './hooks/useChat';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { AuthModal } from './components/AuthModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { ApiExplorerModal } from './components/ApiExplorerModal';
import { ReadmeModal } from './components/ReadmeModal';
import { Sparkles, ExternalLink, Zap } from 'lucide-react';

export default function App() {
  const {
    currentUser,
    login,
    logout,
    setStatus,
    connectionStatus,
    pingLatency,
    rooms,
    activeRoom,
    activeRoomId,
    selectRoom,
    createRoom,
    startDirectMessage,
    messages,
    rawMessagesCount,
    loadingHistory,
    error,
    clearError,
    sendMessage,
    handleTyping,
    typingUsers,
    onlineUsers,
    toggleReaction,
    searchQuery,
    setSearchQuery,
    sendMethod,
    setSendMethod,
    refreshRooms,
  } = useChat();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isApiExplorerOpen, setIsApiExplorerOpen] = useState(false);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If user is not logged in, prompt AuthModal
  const showLoginPrompt = !currentUser || isAuthOpen;

  const handleSelectRoomAndCloseMobile = (roomId: string) => {
    selectRoom(roomId);
    setIsMobileSidebarOpen(false);
  };

  const handleTalkToChatbbase = () => {
    startDirectMessage({
      id: 'sys-chatbbase',
      username: 'chatbbase',
      avatar: '⚡',
      avatarColor: '#6366f1',
      status: 'online',
    });
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          rooms={rooms}
          activeRoomId={activeRoomId}
          onSelectRoom={selectRoom}
          onlineUsers={onlineUsers}
          currentUser={currentUser}
          onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
          onOpenProfile={() => setIsAuthOpen(true)}
          onLogout={logout}
          onUpdateStatus={setStatus}
          onStartDirectMessage={startDirectMessage}
          connectionStatus={connectionStatus}
          onTalkToChatbbase={handleTalkToChatbbase}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-72 max-w-[80vw]">
            <Sidebar
              rooms={rooms}
              activeRoomId={activeRoomId}
              onSelectRoom={handleSelectRoomAndCloseMobile}
              onlineUsers={onlineUsers}
              currentUser={currentUser}
              onOpenCreateRoom={() => {
                setIsMobileSidebarOpen(false);
                setIsCreateRoomOpen(true);
              }}
              onOpenProfile={() => {
                setIsMobileSidebarOpen(false);
                setIsAuthOpen(true);
              }}
              onLogout={() => {
                setIsMobileSidebarOpen(false);
                logout();
              }}
              onUpdateStatus={setStatus}
              onStartDirectMessage={(user) => {
                setIsMobileSidebarOpen(false);
                startDirectMessage(user);
              }}
              connectionStatus={connectionStatus}
              onTalkToChatbbase={handleTalkToChatbbase}
            />
          </div>
        </div>
      )}

      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Real-time testing pro-tip banner */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40 border-b border-indigo-900/40 px-3 py-1.5 flex items-center justify-between text-[11px] text-indigo-300">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 inline-block animate-pulse" />
            <span className="truncate">
              <strong>chatbbase Live Sync:</strong> Instant messaging, typing indicators, and bot assistance. Type <code className="bg-slate-900 px-1 rounded text-white font-mono">/help</code> or ask <code className="bg-slate-900 px-1 rounded text-white font-mono">@chatbbase</code>!
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsApiExplorerOpen(true)}
              className="hover:text-white underline font-mono cursor-pointer"
            >
              REST APIs
            </button>
            <button
              onClick={() => setIsReadmeOpen(true)}
              className="hover:text-white underline cursor-pointer"
            >
              Architecture Docs
            </button>
          </div>
        </div>

        <ChatArea
          room={activeRoom}
          messages={messages}
          rawMessagesCount={rawMessagesCount}
          loadingHistory={loadingHistory}
          error={error}
          onClearError={clearError}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          connectionStatus={connectionStatus}
          pingLatency={pingLatency}
          typingUsers={typingUsers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sendMethod={sendMethod}
          onChangeSendMethod={setSendMethod}
          onSendMessage={sendMessage}
          onTyping={handleTyping}
          onToggleReaction={toggleReaction}
          onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
          onOpenReadme={() => setIsReadmeOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onRetryLoad={() => selectRoom(activeRoomId)}
          onTalkToChatbbase={handleTalkToChatbbase}
          onStartDirectMessage={startDirectMessage}
        />
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showLoginPrompt}
        onLogin={(userData) => {
          login(userData);
          setIsAuthOpen(false);
        }}
      />

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreate={createRoom}
      />

      <ApiExplorerModal
        isOpen={isApiExplorerOpen}
        onClose={() => setIsApiExplorerOpen(false)}
        activeRoomId={activeRoomId}
      />

      <ReadmeModal
        isOpen={isReadmeOpen}
        onClose={() => setIsReadmeOpen(false)}
      />
    </div>
  );
}
