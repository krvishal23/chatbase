import http from 'http';
import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { Message, Room, User } from './server/types.js';

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // In-memory mapping of socketId -> User and username -> Set of socketIds
  const socketUserMap = new Map<string, User>();
  const userSocketsMap = new Map<string, Set<string>>();

  function getOnlineUsers(): User[] {
    const activeUsernames = Array.from(userSocketsMap.keys());
    return activeUsernames
      .map((username) => db.getUser(username))
      .filter((u): u is User => !!u);
  }

  function broadcastUsersUpdate() {
    const onlineUsers = getOnlineUsers();
    io.emit('users:update', onlineUsers);
  }

  // --- chatbbase Bot Automation ---
  function processChatbbaseResponse(roomId: string, text: string, senderName: string): string | null {
    const lower = text.toLowerCase().trim();
    const isDirect = roomId.includes('chatbbase');
    const isMentioned = lower.includes('@chatbbase') || lower.includes('@chatbase');
    const isSlashCommand = text.startsWith('/');

    if (!isDirect && !isMentioned && !isSlashCommand) {
      return null;
    }

    const cleanText = text.replace(/@chatbbase|@chatbase/gi, '').trim();
    const cmd = (cleanText.startsWith('/') ? cleanText.slice(1) : cleanText).toLowerCase();

    if (cmd.startsWith('help')) {
      return `👋 **chatbbase Assistant Manual** for @${senderName}:
• \`/summary\` — Generate an instant summary of recent discussion in this channel
• \`/status\` — View live Socket.io and Express server metrics
• \`/roll [sides]\` — Roll a dice (e.g. \`/roll 20\` or \`/roll\`)
• \`/flip\` — Flip a coin (Heads/Tails)
• \`/time\` — Show server UTC and local time
• \`/quote\` — Get an inspiring engineering thought
• \`/shrug\` — ¯\\_(ツ)_/¯
• Or ask me any question directly with \`@chatbbase <question>\`!`;
    }

    if (cmd.startsWith('status')) {
      const online = getOnlineUsers();
      return `⚡ **chatbbase Live Metrics**:
• Active WebSocket Connections: **${io.engine.clientsCount}**
• Online Users: **${online.length}** (${online.map((u) => u.username).join(', ') || 'none'})
• Registered Rooms: **${db.getRooms().length}**
• Server Runtime: Node.js ${process.version} | Express 4.x | Socket.io 4.8.x
• Persistent DB Storage: \`data/chat_db.json\` ✅`;
    }

    if (cmd.startsWith('summary')) {
      const recent = db.getMessages(roomId, 15);
      if (recent.length <= 1) {
        return `📝 **Channel Summary**: This channel just started! Not enough messages to summarize yet. Send some messages to build context!`;
      }
      const senders = Array.from(new Set(recent.map((m) => m.sender.username))).join(', ');
      const messageSnippets = recent
        .slice(-5)
        .map((m) => `• "${m.text.slice(0, 50)}${m.text.length > 50 ? '...' : ''}"`)
        .join('\n');
      return `📋 **Recent Summary for #${roomId}**:
• Total recent messages evaluated: **${recent.length}**
• Active contributors: **${senders}**
• Key snippets:
${messageSnippets}
All messages are synced in real-time across connected clients!`;
    }

    if (cmd.startsWith('roll')) {
      const parts = cmd.split(' ');
      const sides = parseInt(parts[1], 10) || 6;
      const roll = Math.floor(Math.random() * sides) + 1;
      return `🎲 @${senderName} rolled a **${roll}** (1-${sides})!`;
    }

    if (cmd.startsWith('flip')) {
      const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
      return `🪙 @${senderName} flipped a coin: **${result}**!`;
    }

    if (cmd.startsWith('time')) {
      return `🕒 Current Server Time: **${new Date().toUTCString()}** (Timestamp: \`${Date.now()}\`)`;
    }

    if (cmd.startsWith('shrug')) {
      return `¯\\_(ツ)_/¯`;
    }

    if (cmd.startsWith('quote')) {
      const quotes = [
        '“Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra',
        '“Make it work, make it right, make it fast.” — Kent Beck',
        '“Good code is its own best documentation.” — Steve McConnell',
        '“First, solve the problem. Then, write the code.” — John Johnson',
        '“Deleted code is debugged code.” — Jeff Sickel',
      ];
      return `💡 ${quotes[Math.floor(Math.random() * quotes.length)]}`;
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return `Hey @${senderName}! 👋 chatbbase is online and running in real time. How can I help you today? Type \`/help\` for available commands.`;
    }

    if (lower.includes('how are you')) {
      return `I'm operating at 100% efficiency! Sockets are streaming with low latency and all messages are safely persisted. 🚀`;
    }

    if (lower.includes('who are you') || lower.includes('what are you')) {
      return `I am **chatbbase** ⚡, the built-in intelligent assistant bot for this real-time messaging application. I support live channel moderation, utilities, summaries, and instant socket responses!`;
    }

    return `Thanks for the ping @${senderName}! I received: "${cleanText || text}". Try typing \`/help\` to see everything I can do, or ask me for a \`/summary\`! ⚡`;
  }

  function triggerChatbbaseIfApplicable(roomId: string, text: string, senderName: string) {
    if (senderName.toLowerCase() === 'chatbbase') return;

    const replyText = processChatbbaseResponse(roomId, text, senderName);
    if (!replyText) return;

    // 1. Emit typing indicator for chatbbase
    io.to(`room:${roomId}`).emit('typing:update', {
      username: 'chatbbase',
      roomId,
      isTyping: true,
    });

    // 2. Delay 800ms to simulate dynamic thinking and response
    setTimeout(() => {
      io.to(`room:${roomId}`).emit('typing:update', {
        username: 'chatbbase',
        roomId,
        isTyping: false,
      });

      const botMessage: Message = {
        id: `msg-bot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        roomId,
        sender: {
          id: 'sys-chatbbase',
          username: 'chatbbase',
          avatar: '⚡',
          avatarColor: '#6366f1',
        },
        text: replyText,
        createdAt: new Date().toISOString(),
        reactions: [],
        status: 'delivered',
      };

      const saved = db.addMessage(botMessage);
      io.to(`room:${roomId}`).emit('message:received', saved);
    }, 850);
  }

  // --- REST API Endpoints ---
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'chatbbase Real-Time API',
      timestamp: new Date().toISOString(),
      activeSockets: io.engine.clientsCount,
      onlineUsersCount: userSocketsMap.size,
      roomsCount: db.getRooms().length,
    });
  });

  // GET /api/rooms - List all rooms
  app.get('/api/rooms', (req: Request, res: Response) => {
    try {
      const rooms = db.getRooms();
      res.json({ success: true, rooms });
    } catch (err) {
      console.error('Error fetching rooms:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch rooms' });
    }
  });

  // POST /api/rooms - Create a room
  app.post('/api/rooms', (req: Request, res: Response) => {
    try {
      const { name, description, type, isPrivate, members } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, error: 'Room name is required' });
      }

      const id = name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
      const room = db.createRoom({
        id,
        name: name.trim(),
        description: description?.trim() || '',
        type: type || 'channel',
        isPrivate: !!isPrivate,
        members: members || [],
      });

      // Broadcast room created
      io.emit('room:created', room);

      res.status(201).json({ success: true, room });
    } catch (err) {
      console.error('Error creating room:', err);
      res.status(500).json({ success: false, error: 'Failed to create room' });
    }
  });

  // GET /api/messages - Fetch chat history (per REST API requirement)
  app.get('/api/messages', (req: Request, res: Response) => {
    try {
      const roomId = (req.query.roomId as string) || 'general';
      const limit = Math.min(Number(req.query.limit) || 50, 200);
      const before = req.query.before as string | undefined;

      const messages = db.getMessages(roomId, limit, before);
      res.json({
        success: true,
        roomId,
        count: messages.length,
        messages,
      });
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
  });

  // POST /api/messages - Send a message via REST (per REST API requirement)
  app.post('/api/messages', (req: Request, res: Response) => {
    try {
      const { roomId, sender, text, attachment } = req.body;

      if (!roomId || !text || !sender?.username) {
        return res.status(400).json({
          success: false,
          error: 'roomId, sender.username, and text are required',
        });
      }

      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        roomId,
        sender: {
          id: sender.id || `usr-${sender.username.toLowerCase()}`,
          username: sender.username,
          avatar: sender.avatar || '💬',
          avatarColor: sender.avatarColor || '#6366f1',
        },
        text: text.trim(),
        createdAt: new Date().toISOString(),
        reactions: [],
        status: 'delivered',
        attachment: attachment || undefined,
      };

      const savedMessage = db.addMessage(newMessage);

      // Broadcast instantly to connected Socket.io users in the room
      io.to(`room:${roomId}`).emit('message:received', savedMessage);

      // Trigger chatbbase assistant bot if message contains @chatbbase or commands
      triggerChatbbaseIfApplicable(roomId, text, sender.username);

      res.status(201).json({
        success: true,
        message: savedMessage,
      });
    } catch (err) {
      console.error('Error creating message:', err);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  });

  // POST /api/messages/:id/reactions - Toggle reaction via REST
  app.post('/api/messages/:id/reactions', (req: Request, res: Response) => {
    try {
      const { emoji, username } = req.body;
      const { id } = req.params;

      if (!emoji || !username) {
        return res.status(400).json({ success: false, error: 'emoji and username are required' });
      }

      const updated = db.toggleReaction(id, emoji, username);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Message not found' });
      }

      io.to(`room:${updated.roomId}`).emit('reaction:updated', {
        messageId: updated.id,
        reactions: updated.reactions,
      });

      res.json({ success: true, message: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to update reaction' });
    }
  });

  // GET /api/users - List users
  app.get('/api/users', (req: Request, res: Response) => {
    try {
      const allUsers = db.getAllUsers();
      const onlineUsers = getOnlineUsers();
      const onlineUsernames = new Set(onlineUsers.map((u) => u.username.toLowerCase()));

      const usersWithStatus = allUsers.map((u) => ({
        ...u,
        isOnline: onlineUsernames.has(u.username.toLowerCase()),
      }));

      res.json({
        success: true,
        users: usersWithStatus,
        onlineCount: onlineUsernames.size,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  });

  // --- Real-Time Socket.io Connection & Events ---
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // Ping check for connection latency
    socket.on('ping:check', (callback) => {
      if (typeof callback === 'function') callback();
    });

    // 1. User Join / Authentication
    socket.on('user:join', (userData: { username: string; avatar?: string; avatarColor?: string; status?: User['status'] }, ack) => {
      try {
        if (!userData || !userData.username) {
          if (typeof ack === 'function') ack({ success: false, error: 'Username is required' });
          return;
        }

        const username = userData.username.trim();
        const user: User = {
          id: `usr-${username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          username,
          avatar: userData.avatar || '😎',
          avatarColor: userData.avatarColor || '#6366f1',
          status: userData.status || 'online',
          socketId: socket.id,
          lastSeen: new Date().toISOString(),
        };

        db.upsertUser(user);
        socketUserMap.set(socket.id, user);

        const key = username.toLowerCase();
        if (!userSocketsMap.has(key)) {
          userSocketsMap.set(key, new Set());
        }
        userSocketsMap.get(key)!.add(socket.id);

        console.log(`[Socket] User joined: ${username} (${socket.id})`);

        // Send user acknowledgment
        if (typeof ack === 'function') {
          ack({ success: true, user });
        }

        // Broadcast user joined
        socket.broadcast.emit('user:joined', user);
        broadcastUsersUpdate();
      } catch (err) {
        console.error('Error on user:join:', err);
        if (typeof ack === 'function') ack({ success: false, error: 'Failed to join' });
      }
    });

    // 2. User Status Update (online / away / busy / offline)
    socket.on('user:update_status', (status: User['status']) => {
      const user = socketUserMap.get(socket.id);
      if (user) {
        user.status = status;
        db.upsertUser(user);
        broadcastUsersUpdate();
      }
    });

    // 3. Room Join / Leave
    socket.on('room:join', (roomId: string, ack) => {
      try {
        const roomName = `room:${roomId}`;
        socket.join(roomName);

        // Fetch recent messages
        const recentMessages = db.getMessages(roomId, 60);

        if (typeof ack === 'function') {
          ack({
            success: true,
            roomId,
            messages: recentMessages,
          });
        }
      } catch (err) {
        console.error('Error in room:join:', err);
        if (typeof ack === 'function') ack({ success: false, error: 'Failed to join room' });
      }
    });

    socket.on('room:leave', (roomId: string) => {
      socket.leave(`room:${roomId}`);
    });

    // 4. Send Message via Socket.io
    socket.on('message:send', (payload: {
      tempId?: string;
      roomId: string;
      text: string;
      attachment?: Message['attachment'];
    }, ack) => {
      try {
        const user = socketUserMap.get(socket.id);
        if (!user) {
          if (typeof ack === 'function') ack({ success: false, error: 'User not registered. Please sign in.' });
          return;
        }

        if (!payload.roomId || !payload.text || !payload.text.trim()) {
          if (typeof ack === 'function') ack({ success: false, error: 'Message text and roomId are required' });
          return;
        }

        const messageId = payload.tempId || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const message: Message = {
          id: messageId,
          roomId: payload.roomId,
          sender: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            avatarColor: user.avatarColor,
          },
          text: payload.text.trim(),
          createdAt: new Date().toISOString(),
          reactions: [],
          status: 'delivered',
          attachment: payload.attachment || undefined,
        };

        const saved = db.addMessage(message);

        // Broadcast to all sockets in this room (including sender or acknowledge sender)
        io.to(`room:${payload.roomId}`).emit('message:received', saved);

        // Trigger chatbbase assistant bot if message contains @chatbbase or commands
        triggerChatbbaseIfApplicable(payload.roomId, payload.text, user.username);

        if (typeof ack === 'function') {
          ack({ success: true, message: saved });
        }
      } catch (err) {
        console.error('Error handling message:send:', err);
        if (typeof ack === 'function') ack({ success: false, error: 'Failed to send message' });
      }
    });

    // 5. Message Read Receipt
    socket.on('message:read', (data: { messageId: string; roomId: string }) => {
      try {
        const updated = db.updateMessageStatus(data.messageId, 'read');
        if (updated) {
          io.to(`room:${data.roomId}`).emit('message:read_receipt', {
            messageId: data.messageId,
            status: 'read',
          });
        }
      } catch (err) {
        console.error('Error on message:read:', err);
      }
    });

    // 6. Message Reaction
    socket.on('reaction:toggle', (data: { messageId: string; emoji: string; roomId: string }, ack) => {
      try {
        const user = socketUserMap.get(socket.id);
        if (!user) return;

        const updated = db.toggleReaction(data.messageId, data.emoji, user.username);
        if (updated) {
          io.to(`room:${data.roomId}`).emit('reaction:updated', {
            messageId: updated.id,
            reactions: updated.reactions,
          });
          if (typeof ack === 'function') ack({ success: true, reactions: updated.reactions });
        }
      } catch (err) {
        console.error('Error on reaction:toggle:', err);
      }
    });

    // 7. Typing Indicators
    socket.on('typing:start', (data: { roomId: string }) => {
      const user = socketUserMap.get(socket.id);
      if (user && data.roomId) {
        socket.to(`room:${data.roomId}`).emit('typing:update', {
          username: user.username,
          roomId: data.roomId,
          isTyping: true,
        });
      }
    });

    socket.on('typing:stop', (data: { roomId: string }) => {
      const user = socketUserMap.get(socket.id);
      if (user && data.roomId) {
        socket.to(`room:${data.roomId}`).emit('typing:update', {
          username: user.username,
          roomId: data.roomId,
          isTyping: false,
        });
      }
    });

    // 8. Graceful Disconnection
    socket.on('disconnect', () => {
      const user = socketUserMap.get(socket.id);
      if (user) {
        const key = user.username.toLowerCase();
        const userSockets = userSocketsMap.get(key);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            userSocketsMap.delete(key);
            user.status = 'offline';
            user.lastSeen = new Date().toISOString();
            db.upsertUser(user);
            socket.broadcast.emit('user:left', { username: user.username });
          }
        }
        socketUserMap.delete(socket.id);
        broadcastUsersUpdate();
        console.log(`[Socket] User disconnected: ${user.username} (${socket.id})`);
      } else {
        console.log(`[Socket] Socket disconnected: ${socket.id}`);
      }
    });
  });

  // --- Serve Frontend ---
  if (!isProd) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ PulseChat Server running at http://0.0.0.0:${PORT}`);
    console.log(`📡 Socket.io server ready and accepting connections`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
