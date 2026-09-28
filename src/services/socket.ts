import { io, Socket } from 'socket.io-client';
import { Message, Reaction, User } from '../types/chat';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.io] Connected to server, ID:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ [Socket.io] Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [Socket.io] Disconnected:', reason);
    });
  }
  return socket;
}

export function joinUser(
  user: { username: string; avatar?: string; avatarColor?: string; status?: User['status'] },
  callback?: (res: { success: boolean; user?: User; error?: string }) => void
) {
  const s = getSocket();
  if (s.connected) {
    s.emit('user:join', user, callback);
  } else {
    s.once('connect', () => {
      s.emit('user:join', user, callback);
    });
  }
}

export function updateUserStatus(status: User['status']) {
  const s = getSocket();
  s.emit('user:update_status', status);
}

export function joinRoom(
  roomId: string,
  callback?: (res: { success: boolean; roomId: string; messages: Message[]; error?: string }) => void
) {
  const s = getSocket();
  s.emit('room:join', roomId, callback);
}

export function leaveRoom(roomId: string) {
  const s = getSocket();
  s.emit('room:leave', roomId);
}

export function sendMessageSocket(
  payload: {
    tempId?: string;
    roomId: string;
    text: string;
    attachment?: Message['attachment'];
  },
  callback?: (res: { success: boolean; message?: Message; error?: string }) => void
) {
  const s = getSocket();
  s.emit('message:send', payload, callback);
}

export function sendTypingStart(roomId: string) {
  const s = getSocket();
  s.emit('typing:start', { roomId });
}

export function sendTypingStop(roomId: string) {
  const s = getSocket();
  s.emit('typing:stop', { roomId });
}

export function markMessageRead(messageId: string, roomId: string) {
  const s = getSocket();
  s.emit('message:read', { messageId, roomId });
}

export function toggleReactionSocket(
  messageId: string,
  emoji: string,
  roomId: string,
  callback?: (res: { success: boolean; reactions?: Reaction[] }) => void
) {
  const s = getSocket();
  s.emit('reaction:toggle', { messageId, emoji, roomId }, callback);
}
