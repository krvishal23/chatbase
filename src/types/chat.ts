export interface User {
  id: string;
  username: string;
  avatar: string;
  avatarColor: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  isOnline?: boolean;
  socketId?: string;
  lastSeen?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageAttachment {
  type: 'image' | 'code' | 'file';
  url?: string;
  name?: string;
  codeLanguage?: string;
}

export interface Message {
  id: string;
  roomId: string;
  sender: {
    id: string;
    username: string;
    avatar: string;
    avatarColor: string;
  };
  text: string;
  createdAt: string;
  reactions: Reaction[];
  status: 'sending' | 'delivered' | 'read';
  attachment?: MessageAttachment;
  isPinned?: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  type: 'channel' | 'dm';
  isPrivate?: boolean;
  members?: string[];
  createdAt: string;
  unreadCount?: number;
  lastMessage?: string;
}

export interface TypingState {
  [roomId: string]: {
    [username: string]: boolean;
  };
}
