export interface User {
  id: string;
  username: string;
  avatar: string;
  avatarColor: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  socketId?: string;
  lastSeen?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // usernames
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
  createdAt: string; // ISO string
  reactions: Reaction[];
  status: 'sending' | 'delivered' | 'read';
  attachment?: MessageAttachment;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  type: 'channel' | 'dm';
  isPrivate?: boolean;
  members?: string[]; // user IDs or usernames for DMs
  createdAt: string;
}

export interface TypingUser {
  username: string;
  roomId: string;
  timestamp: number;
}
