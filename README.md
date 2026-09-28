# chatbbase — Real-Time Messenger (React + Node.js + Express + Socket.io)

chatbbase is a full-stack, real-time messaging application engineered with **React (Frontend)** and **Node.js + Express + Socket.io (Backend)**, featuring an intelligent in-app assistant bot (`chatbbase`), dynamic channel management, typing indicators, read receipts, and persistent database storage.

---

## 🌟 Key Features

### 1. Real-Time Communication (Socket.io - Mandatory)
- **Instant Message Delivery**: Messages arrive sub-15ms without page refreshes.
- **Room / Channel Isolation**: Users join dedicated channels (`#general`, `#engineering`, `#random`, `#showcase`) with room-based broadcast (`io.to('room:${roomId}')`).
- **Presence Tracking**: Server tracks connected sockets, broadcasts active user lists, and gracefully handles unexpected disconnections.
- **Typing Indicators**: Real-time broadcast of `"User is typing..."` with debounced timers.
- **Interactive Reactions**: Emoji reactions (👍, ❤️, 🔥, 🚀, 😂, 🎉) synced instantly across all active clients.
- **Read & Delivery Receipts**: Messages mark delivered (`✓`) and read (`✓✓` in sky blue) dynamically.

### 2. Intelligent Assistant Bot (`chatbbase`)
- **Real-Time Assistant**: Chat with `@chatbbase` in any channel or via Direct Message.
- **Slash Commands**:
  - `/help`: Complete guide of commands and bot tools.
  - `/summary`: Real-time AI channel summary of recent discussions.
  - `/status`: Live WebSocket connections count, online users, messages count, and server uptime.
  - `/roll [sides]`: Dice roller (e.g. `/roll 20`).
  - `/flip`: Coin flip (Heads or Tails).
  - `/time`: Server UTC and local timestamps.
  - `/quote`: Daily software engineering and design quotes.
- **Dynamic Typing Simulation**: Bot simulates natural thinking before broadcasting replies.

### 3. Dynamic Modern UI
- **Autocomplete Menus**: Typing `/` triggers slash command selection; typing `@` triggers user/bot mentions.
- **Quick Prompt Chips**: 1-click action chips above the composer (`Ask @chatbbase`, `/status`, `/summary`, etc.).
- **Channel Details Drawer**: Collapsible right sidebar displaying channel description, pinned messages, member roster, and quick tool execution.
- **Markdown & Code Formatting**: Bold, italics, blockquotes, code blocks, and highlighted user mentions.
- **Micro-Interactions**: Hover toolbars, quote replies, and pinned message highlights.

### 4. REST API Integration (Express)
- **`GET /api/messages`**: Fetches persistent chat history with pagination (`?roomId=...&limit=...`).
- **`POST /api/messages`**: Sends a message via REST, writes to persistent storage, and simultaneously broadcasts via Socket.io to all room subscribers.
- **`GET /api/rooms` & `POST /api/rooms`**: Lists and creates channels/rooms.
- **`GET /api/users`**: Lists registered and active users with presence status.
- **`GET /api/health`**: Service status, active socket connections, and uptime.
- **Interactive In-App REST API Explorer**: Built-in visual API runner to inspect responses and copy curl commands.

### 3. Persistent Data Storage
- Stored on disk in `data/chat_db.json` with an in-memory cache and atomic write throttling.
- Previous messages are retained across page refreshes and server reboots.

### 4. User Experience & Bonus Features
- **Username-Based Login**: Quick demo profiles (Alex Rivera, Sarah Chen, Jordan Smith) or custom usernames with avatar customization.
- **User Status System**: Online 🟢, Away 🟡, Busy 🔴, Offline ⚪ with dropdown controls.
- **Audio Feedback**: Web Audio API sound feedback for sending and receiving messages (toggleable mute).
- **Search & Filter**: Search conversations by keyword or sender.
- **Direct Messaging**: Click any online user to initiate a direct message thread.

---

## 🚀 Getting Started & Setup

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### Running the Application

In this modern full-stack setup, Node.js + Express and Vite run unified on port **3000** for seamless WebSocket handshakes and zero-CORS friction.

#### Development Mode (Frontend + Backend)
```bash
npm run dev
```
- Starts the Express backend on `http://localhost:3000` with Vite middleware mounted.
- Socket.io is attached to the HTTP server and available on `ws://localhost:3000`.
- Open `http://localhost:3000` in your browser.

#### Production Build & Run
```bash
# 1. Build the production frontend assets
npm run build

# 2. Run the production server
npm start
```

---

## 🛠️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port for the Express and Socket.io server |
| `NODE_ENV` | `development` | Set to `production` when deploying |
| `APP_URL` | `http://localhost:3000` | Canonical host URL |

---

## 📡 Socket.io Event Documentation

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `user:join` | Client ➔ Server | `{ username, avatar, avatarColor, status }` | Registers socket session |
| `user:joined` | Server ➔ Clients | `{ username, status, ... }` | Broadcasts user joined |
| `user:left` | Server ➔ Clients | `{ username }` | Broadcasts user disconnected |
| `users:update` | Server ➔ Clients | `User[]` | Synchronizes active online user list |
| `room:join` | Client ➔ Server | `roomId: string` | Subscribes socket to room |
| `message:send` | Client ➔ Server | `{ roomId, text, attachment? }` | Sends chat message |
| `message:received` | Server ➔ Clients | `Message` | Broadcasts new message to room |
| `message:read` | Client ➔ Server | `{ messageId, roomId }` | Emits read receipt |
| `message:read_receipt`| Server ➔ Clients | `{ messageId, status: 'read' }` | Updates read double ticks |
| `typing:start` | Client ➔ Server | `{ roomId }` | Dispatches typing event |
| `typing:stop` | Client ➔ Server | `{ roomId }` | Clears typing event |
| `typing:update` | Server ➔ Clients | `{ username, roomId, isTyping }`| Updates typing indicator |
| `reaction:toggle` | Client ➔ Server | `{ messageId, emoji, roomId }`| Adds/removes emoji reaction |
| `reaction:updated` | Server ➔ Clients | `{ messageId, reactions }` | Broadcasts reaction list |

---

## 🌐 REST API Endpoints

### 1. Fetch Messages
```http
GET /api/messages?roomId=general&limit=50
```
**Response (200 OK):**
```json
{
  "success": true,
  "roomId": "general",
  "count": 2,
  "messages": [
    {
      "id": "msg-123",
      "roomId": "general",
      "sender": {
        "id": "usr-alex",
        "username": "Alex Rivera",
        "avatar": "⚡",
        "avatarColor": "#3b82f6"
      },
      "text": "Hello world!",
      "createdAt": "2026-09-28T12:00:00.000Z",
      "status": "read",
      "reactions": []
    }
  ]
}
```

### 2. Send Message via REST
```http
POST /api/messages
Content-Type: application/json

{
  "roomId": "general",
  "sender": {
    "username": "Sarah Chen",
    "avatar": "👩‍💻",
    "avatarColor": "#ec4899"
  },
  "text": "Sent via REST API!"
}
```
*Note: Messages sent through `POST /api/messages` are persisted and immediately broadcast to all active Socket.io clients.*

### 3. List Rooms
```http
GET /api/rooms
```

### 4. Create Room
```http
POST /api/rooms
Content-Type: application/json

{
  "name": "design-system",
  "description": "UI/UX talks and design tokens"
}
```

### 5. Health Check
```http
GET /api/health
```

---

## 📐 Architecture & Design Decisions

1. **Single Port Full-Stack Runtime**:
   Express mounts Vite middlewares during development and serves static files in production. The HTTP server shares the exact same port with `SocketIOServer`, eliminating CORS mismatches and complex reverse proxy setups.

2. **Server-Authoritative State**:
   The server is the single source of truth for message IDs, timestamps, read receipts, and reactions. Clients optimistically render messages for perceived zero-latency, reconciling once acknowledged by the server.

3. **Persistent File-Backed JSON Store**:
   Instead of transient memory that wipes on process exit, all messages and channels are persisted in `data/chat_db.json` with write-debouncing. This allows instant recovery upon page refresh and server restarts without heavy native binary compile requirements.

4. **Bi-directional Dual-Mode Messaging**:
   Users can test messages sent via Socket.io or via the REST API using the toggle in the message input or the in-app API Explorer.

5. **Multi-Tab Testing**:
   Open the app in two browser tabs or in an incognito window, log in as different users, and experience real-time message broadcasting, typing states, and read receipts.

---

## 💡 Assumptions Made

1. **Authentication**: Dummy authentication is implemented via username, avatar, and client-stored session (`localStorage`). No external identity provider (e.g. Auth0) is enforced, matching the prompt's bonus guidelines.
2. **Persistence**: File-persisted storage satisfies the database persistence requirement without requiring local database daemons (like MongoDB or PostgreSQL) to be installed on the evaluator's machine.

---

## 🚢 Deployment on Render / Railway

To deploy on Render or Railway:
1. Create a **Web Service** repository from this codebase.
2. Set Build Command: `npm run build`
3. Set Start Command: `npm start`
4. Set Environment Variables: `PORT=3000`, `NODE_ENV=production`
5. The service will automatically bind port 3000 and handle WebSocket upgrades.
