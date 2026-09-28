import { Message, Room, User } from '../types/chat';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchRooms(): Promise<Room[]> {
  const res = await fetch('/api/rooms');
  if (!res.ok) throw new Error('Failed to fetch rooms');
  const data = await res.json();
  return data.rooms || [];
}

export async function createRoomApi(room: {
  name: string;
  description?: string;
  type?: 'channel' | 'dm';
  isPrivate?: boolean;
}): Promise<Room> {
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(room),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create room');
  }
  const data = await res.json();
  return data.room;
}

export async function fetchMessagesApi(
  roomId: string,
  limit = 100,
  before?: string
): Promise<Message[]> {
  const params = new URLSearchParams();
  params.append('roomId', roomId);
  params.append('limit', String(limit));
  if (before) params.append('before', before);

  const res = await fetch(`/api/messages?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  const data = await res.json();
  return data.messages || [];
}

export async function sendMessageApi(payload: {
  roomId: string;
  sender: {
    id: string;
    username: string;
    avatar: string;
    avatarColor: string;
  };
  text: string;
  attachment?: Message['attachment'];
}): Promise<Message> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send message via REST');
  }
  const data = await res.json();
  return data.message;
}

export async function toggleReactionApi(
  messageId: string,
  emoji: string,
  username: string
): Promise<Message> {
  const res = await fetch(`/api/messages/${messageId}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emoji, username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to toggle reaction');
  }
  const data = await res.json();
  return data.message;
}

export async function fetchUsersApi(): Promise<{ users: User[]; onlineCount: number }> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return { users: data.users || [], onlineCount: data.onlineCount || 0 };
}
