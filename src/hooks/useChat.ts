import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, Room, User } from '../types/chat';
import {
  getSocket,
  joinUser,
  joinRoom,
  leaveRoom,
  sendMessageSocket,
  sendTypingStart,
  sendTypingStop,
  markMessageRead,
  toggleReactionSocket,
  updateUserStatus,
} from '../services/socket';
import {
  fetchRooms,
  fetchMessagesApi,
  sendMessageApi,
  createRoomApi,
  toggleReactionApi,
  fetchUsersApi,
} from '../services/api';
import { sounds } from '../utils/sound';

const STORAGE_KEY_USER = 'pulsechat_current_user';
const STORAGE_KEY_LAST_ROOM = 'pulsechat_last_room';

export const CHATBBASE_BOT_USER: User = {
  id: 'sys-chatbbase',
  username: 'chatbbase',
  avatar: '⚡',
  avatarColor: '#6366f1',
  status: 'online',
  isOnline: true,
};

export function useChat() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected'
  >('connecting');
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_ROOM) || 'general';
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const myTypingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sendMethod, setSendMethod] = useState<'socket' | 'rest'>('socket');

  // Load rooms on mount
  const refreshRooms = useCallback(async () => {
    try {
      const roomList = await fetchRooms();
      setRooms(roomList);
    } catch (err) {
      console.warn('Could not fetch rooms via REST:', err);
    }
  }, []);

  // Fetch messages for a specific room via REST API
  const loadRoomMessages = useCallback(async (roomId: string) => {
    setLoadingHistory(true);
    setError(null);
    try {
      const history = await fetchMessagesApi(roomId, 100);
      setMessages(history);
      // Mark latest messages as read if not sent by current user
      if (currentUser) {
        history.forEach((msg) => {
          if (msg.sender.username !== currentUser.username && msg.status !== 'read') {
            markMessageRead(msg.id, roomId);
          }
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      setError(message);
    } finally {
      setLoadingHistory(false);
    }
  }, [currentUser]);

  // Set active room and join socket room
  const selectRoom = useCallback(
    (roomId: string) => {
      if (roomId === activeRoomId) return;

      leaveRoom(activeRoomId);
      setActiveRoomId(roomId);
      localStorage.setItem(STORAGE_KEY_LAST_ROOM, roomId);
      setTypingUsers([]);

      joinRoom(roomId, (res) => {
        if (!res.success) {
          console.warn('Socket join room returned error:', res.error);
        }
      });

      loadRoomMessages(roomId);
    },
    [activeRoomId, loadRoomMessages]
  );

  // Initialize socket & event listeners
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setConnectionStatus('connected');
      // If user exists, re-join user to session
      if (currentUser) {
        joinUser(currentUser, () => {
          joinRoom(activeRoomId);
        });
      }

      // Latency measurement
      const start = Date.now();
      socket.emit('ping:check', () => {
        setPingLatency(Date.now() - start);
      });
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleConnectError = () => {
      setConnectionStatus('disconnected');
    };

    const handleMessageReceived = (incoming: Message) => {
      if (incoming.roomId === activeRoomId) {
        setMessages((prev) => {
          // Guard against duplicates
          const exists = prev.some((m) => m.id === incoming.id);
          if (exists) {
            return prev.map((m) => (m.id === incoming.id ? incoming : m));
          }
          return [...prev, incoming];
        });

        // Audio feedback
        if (currentUser && incoming.sender.username === currentUser.username) {
          sounds.playSend();
        } else {
          sounds.playReceive();
          if (currentUser) {
            markMessageRead(incoming.id, incoming.roomId);
          }
        }
      }
    };

    const handleReadReceipt = (data: { messageId: string; status: 'read' }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, status: data.status } : msg
        )
      );
    };

    const handleReactionUpdated = (data: {
      messageId: string;
      reactions: Message['reactions'];
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, reactions: data.reactions } : msg
        )
      );
    };

    const handleTypingUpdate = (data: {
      username: string;
      roomId: string;
      isTyping: boolean;
    }) => {
      if (data.roomId !== activeRoomId) return;

      const { username, isTyping } = data;
      if (typingTimeoutRef.current[username]) {
        clearTimeout(typingTimeoutRef.current[username]);
        delete typingTimeoutRef.current[username];
      }

      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.includes(username)) return [...prev, username];
          return prev;
        } else {
          return prev.filter((u) => u !== username);
        }
      });

      if (isTyping) {
        // Auto remove typing indicator after 3.5 seconds in case stop event was missed
        typingTimeoutRef.current[username] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== username));
        }, 3500);
      }
    };

    const handleUsersUpdate = (users: User[]) => {
      const hasBot = users.some((u) => u.username === 'chatbbase');
      setOnlineUsers(hasBot ? users : [CHATBBASE_BOT_USER, ...users]);
    };

    const handleRoomCreated = (room: Room) => {
      setRooms((prev) => {
        if (prev.some((r) => r.id === room.id)) return prev;
        return [...prev, room];
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('message:received', handleMessageReceived);
    socket.on('message:read_receipt', handleReadReceipt);
    socket.on('reaction:updated', handleReactionUpdated);
    socket.on('typing:update', handleTypingUpdate);
    socket.on('users:update', handleUsersUpdate);
    socket.on('room:created', handleRoomCreated);

    if (socket.connected) {
      handleConnect();
    }

    // Ping check every 25 seconds
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        const start = Date.now();
        socket.emit('ping:check', () => {
          setPingLatency(Date.now() - start);
        });
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('message:received', handleMessageReceived);
      socket.off('message:read_receipt', handleReadReceipt);
      socket.off('reaction:updated', handleReactionUpdated);
      socket.off('typing:update', handleTypingUpdate);
      socket.off('users:update', handleUsersUpdate);
      socket.off('room:created', handleRoomCreated);
    };
  }, [activeRoomId, currentUser]);

  // Initial load
  useEffect(() => {
    refreshRooms();
    loadRoomMessages(activeRoomId);
    fetchUsersApi()
      .then((res) => {
        const online = res.users.filter((u) => u.isOnline);
        const hasBot = online.some((u) => u.username === 'chatbbase');
        setOnlineUsers(hasBot ? online : [CHATBBASE_BOT_USER, ...online]);
      })
      .catch(() => {
        setOnlineUsers([CHATBBASE_BOT_USER]);
      });
  }, [activeRoomId, refreshRooms, loadRoomMessages]);

  // Login / Join function
  const login = useCallback(
    (userData: { username: string; avatar?: string; avatarColor?: string; status?: User['status'] }) => {
      const user: User = {
        id: `usr-${userData.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        username: userData.username.trim(),
        avatar: userData.avatar || '😎',
        avatarColor: userData.avatarColor || '#6366f1',
        status: userData.status || 'online',
      };

      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

      joinUser(user, (res) => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
        }
        joinRoom(activeRoomId);
      });
    },
    [activeRoomId]
  );

  // Logout / Switch User
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  }, []);

  // Update user status
  const setStatus = useCallback((status: User['status']) => {
    if (!currentUser) return;
    const updated = { ...currentUser, status };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    updateUserStatus(status);
  }, [currentUser]);

  // Send message
  const sendMessage = useCallback(
    async (text: string, attachment?: Message['attachment']) => {
      if (!text.trim() || !currentUser) return;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const optimisticMessage: Message = {
        id: tempId,
        roomId: activeRoomId,
        sender: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          avatarColor: currentUser.avatarColor,
        },
        text: text.trim(),
        createdAt: new Date().toISOString(),
        reactions: [],
        status: 'sending',
        attachment,
      };

      // Add optimistic message to list immediately
      setMessages((prev) => [...prev, optimisticMessage]);

      // Stop typing
      sendTypingStop(activeRoomId);
      if (myTypingTimerRef.current) {
        clearTimeout(myTypingTimerRef.current);
        myTypingTimerRef.current = null;
      }

      try {
        if (sendMethod === 'socket') {
          // Send via Socket.io
          sendMessageSocket(
            {
              tempId,
              roomId: activeRoomId,
              text: text.trim(),
              attachment,
            },
            (res) => {
              if (res.success && res.message) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === tempId ? res.message! : m))
                );
              } else {
                setError(res.error || 'Failed to send message');
              }
            }
          );
        } else {
          // Send via REST API endpoint
          const res = await sendMessageApi({
            roomId: activeRoomId,
            sender: {
              id: currentUser.id,
              username: currentUser.username,
              avatar: currentUser.avatar,
              avatarColor: currentUser.avatarColor,
            },
            text: text.trim(),
            attachment,
          });
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? res : m))
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error sending message';
        setError(message);
      }
    },
    [activeRoomId, currentUser, sendMethod]
  );

  // Handle typing debounce
  const handleTyping = useCallback(() => {
    if (!currentUser) return;
    sendTypingStart(activeRoomId);

    if (myTypingTimerRef.current) {
      clearTimeout(myTypingTimerRef.current);
    }

    myTypingTimerRef.current = setTimeout(() => {
      sendTypingStop(activeRoomId);
      myTypingTimerRef.current = null;
    }, 2000);
  }, [activeRoomId, currentUser]);

  // Toggle reaction
  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!currentUser) return;

      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const reactions = [...(msg.reactions || [])];
          const found = reactions.find((r) => r.emoji === emoji);

          if (found) {
            const userIdx = found.users.indexOf(currentUser.username);
            if (userIdx >= 0) {
              found.users.splice(userIdx, 1);
              found.count -= 1;
            } else {
              found.users.push(currentUser.username);
              found.count += 1;
            }
          } else {
            reactions.push({
              emoji,
              count: 1,
              users: [currentUser.username],
            });
          }
          return {
            ...msg,
            reactions: reactions.filter((r) => r.count > 0),
          };
        })
      );

      // Socket emit
      toggleReactionSocket(messageId, emoji, activeRoomId, (res) => {
        if (!res.success) {
          // fallback to REST API
          toggleReactionApi(messageId, emoji, currentUser.username).catch(() => {});
        }
      });
    },
    [activeRoomId, currentUser]
  );

  // Create room
  const createRoom = useCallback(
    async (roomData: { name: string; description?: string; isPrivate?: boolean }) => {
      const room = await createRoomApi(roomData);
      setRooms((prev) => {
        if (prev.some((r) => r.id === room.id)) return prev;
        return [...prev, room];
      });
      selectRoom(room.id);
      return room;
    },
    [selectRoom]
  );

  // Start direct message with a user
  const startDirectMessage = useCallback(
    async (targetUser: User) => {
      if (!currentUser) return;
      // Stable DM room ID derived from both usernames sorted alphabetically
      const sorted = [currentUser.username.toLowerCase(), targetUser.username.toLowerCase()].sort();
      const dmRoomId = `dm-${sorted[0]}-${sorted[1]}`;

      const existingRoom = rooms.find((r) => r.id === dmRoomId);
      if (existingRoom) {
        selectRoom(dmRoomId);
      } else {
        const newDm = await createRoomApi({
          name: targetUser.username,
          description: `Direct message with @${targetUser.username}`,
          type: 'dm',
        });
        setRooms((prev) => [...prev, newDm]);
        selectRoom(newDm.id);
      }
    },
    [currentUser, rooms, selectRoom]
  );

  // Filter messages by search query
  const filteredMessages = messages.filter((m) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.text.toLowerCase().includes(query) ||
      m.sender.username.toLowerCase().includes(query)
    );
  });

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || {
    id: activeRoomId,
    name: activeRoomId,
    description: 'Active Channel',
    type: 'channel' as const,
    createdAt: new Date().toISOString(),
  };

  return {
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
    messages: filteredMessages,
    rawMessagesCount: messages.length,
    loadingHistory,
    error,
    clearError: () => setError(null),
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
  };
}
