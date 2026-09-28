import fs from 'fs';
import path from 'path';
import { Message, Room, User } from './types.js';

interface DatabaseSchema {
  rooms: Room[];
  messages: Message[];
  users: Record<string, User>; // username -> User
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'chat_db.json');

export const CHATBBASE_BOT: User = {
  id: 'sys-chatbbase',
  username: 'chatbbase',
  avatar: '⚡',
  avatarColor: '#6366f1',
  status: 'online',
};

const INITIAL_ROOMS: Room[] = [
  {
    id: 'general',
    name: 'general',
    description: 'Company-wide announcements and team collaboration with chatbbase',
    type: 'channel',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'engineering',
    name: 'engineering',
    description: 'Architecture, bugs, releases, and tech discussions',
    type: 'channel',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'random',
    name: 'random',
    description: 'Memes, music, hobbies, and fun games with chatbbase',
    type: 'channel',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'showcase',
    name: 'showcase',
    description: 'Share what you have built and project milestones',
    type: 'channel',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-seed-1',
    roomId: 'general',
    sender: {
      id: 'sys-chatbbase',
      username: 'chatbbase',
      avatar: '⚡',
      avatarColor: '#6366f1',
    },
    text: 'Hello team! I am chatbbase ⚡, your real-time assistant bot. Type `/help` or mention `@chatbbase` anytime for instant assistance, summaries, dice rolls, or server stats! 🚀',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'read',
    reactions: [
      { emoji: '👋', count: 3, users: ['chatbbase', 'Sarah Chen', 'Alex Rivera'] },
      { emoji: '🚀', count: 4, users: ['Alex Rivera', 'Jordan Smith', 'chatbbase', 'Sarah Chen'] },
    ],
  },
  {
    id: 'msg-seed-2',
    roomId: 'general',
    sender: {
      id: 'usr-sarah',
      username: 'Sarah Chen',
      avatar: '👩‍💻',
      avatarColor: '#ec4899',
    },
    text: 'The new dynamic interface feels incredibly responsive! Real-time Socket.io messages are delivering instantly. Try typing `/help` or mention `@chatbbase` to see it reply live in real time! ✨',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'read',
    reactions: [
      { emoji: '🔥', count: 2, users: ['Sarah Chen', 'Jordan Smith'] },
    ],
  },
  {
    id: 'msg-seed-3',
    roomId: 'engineering',
    sender: {
      id: 'usr-alex',
      username: 'Alex Rivera',
      avatar: '⚡',
      avatarColor: '#3b82f6',
    },
    text: 'REST endpoints for `GET /api/messages` and `POST /api/messages` are fully integrated and synced with Socket.io broadcast. Check the API Explorer in the top right!',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'delivered',
    reactions: [
      { emoji: '💡', count: 1, users: ['Alex Rivera'] },
    ],
  },
];

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const users = parsed.users || {};
        users['chatbbase'] = CHATBBASE_BOT;
        return {
          rooms: parsed.rooms || INITIAL_ROOMS,
          messages: parsed.messages || INITIAL_MESSAGES,
          users,
        };
      }
    } catch (err) {
      console.warn('Failed to read chat_db.json, initializing fresh store:', err);
    }

    const initialData: DatabaseSchema = {
      rooms: INITIAL_ROOMS,
      messages: INITIAL_MESSAGES,
      users: {
        chatbbase: CHATBBASE_BOT,
      },
    };
    this.saveDataSync(initialData);
    return initialData;
  }

  private saveDataSync(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing chat_db.json:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveDataSync(this.data);
      this.saveTimeout = null;
    }, 250);
  }

  // --- Rooms ---
  getRooms(): Room[] {
    return [...this.data.rooms];
  }

  getRoomById(roomId: string): Room | undefined {
    return this.data.rooms.find((r) => r.id === roomId);
  }

  createRoom(room: Omit<Room, 'createdAt'>): Room {
    const existing = this.getRoomById(room.id);
    if (existing) {
      return existing;
    }
    const newRoom: Room = {
      ...room,
      createdAt: new Date().toISOString(),
    };
    this.data.rooms.push(newRoom);
    this.scheduleSave();
    return newRoom;
  }

  // --- Messages ---
  getMessages(roomId?: string, limit = 100, before?: string): Message[] {
    let filtered = roomId
      ? this.data.messages.filter((m) => m.roomId === roomId)
      : this.data.messages;

    if (before) {
      const beforeTime = new Date(before).getTime();
      filtered = filtered.filter(
        (m) => new Date(m.createdAt).getTime() < beforeTime
      );
    }

    // Sort chronologically ascending
    filtered = [...filtered].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    if (limit > 0 && filtered.length > limit) {
      filtered = filtered.slice(filtered.length - limit);
    }

    return filtered;
  }

  getMessageById(messageId: string): Message | undefined {
    return this.data.messages.find((m) => m.id === messageId);
  }

  addMessage(msg: Message): Message {
    // Avoid duplicate message IDs
    const existingIndex = this.data.messages.findIndex((m) => m.id === msg.id);
    if (existingIndex >= 0) {
      return this.data.messages[existingIndex];
    }
    this.data.messages.push(msg);
    this.scheduleSave();
    return msg;
  }

  updateMessageStatus(messageId: string, status: 'delivered' | 'read'): Message | undefined {
    const msg = this.getMessageById(messageId);
    if (msg) {
      msg.status = status;
      this.scheduleSave();
    }
    return msg;
  }

  toggleReaction(messageId: string, emoji: string, username: string): Message | undefined {
    const msg = this.getMessageById(messageId);
    if (!msg) return undefined;

    if (!msg.reactions) {
      msg.reactions = [];
    }

    const reaction = msg.reactions.find((r) => r.emoji === emoji);
    if (reaction) {
      const userIndex = reaction.users.indexOf(username);
      if (userIndex >= 0) {
        reaction.users.splice(userIndex, 1);
        reaction.count -= 1;
        if (reaction.count <= 0) {
          msg.reactions = msg.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        reaction.users.push(username);
        reaction.count += 1;
      }
    } else {
      msg.reactions.push({
        emoji,
        count: 1,
        users: [username],
      });
    }

    this.scheduleSave();
    return msg;
  }

  // --- Users ---
  getUser(username: string): User | undefined {
    return this.data.users[username.toLowerCase()];
  }

  upsertUser(user: User): User {
    const key = user.username.toLowerCase();
    this.data.users[key] = {
      ...this.data.users[key],
      ...user,
      lastSeen: new Date().toISOString(),
    };
    this.scheduleSave();
    return this.data.users[key];
  }

  getAllUsers(): User[] {
    return Object.values(this.data.users);
  }

  clearOldMessages(keepCount = 1000) {
    if (this.data.messages.length > keepCount) {
      this.data.messages = this.data.messages.slice(-keepCount);
      this.scheduleSave();
    }
  }
}

export const db = new Database();
