import { X, BookOpen, CheckCircle, Server, Cpu, Database, ShieldCheck } from 'lucide-react';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReadmeModal({ isOpen, onClose }: ReadmeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">chatbbase — Documentation & Architecture</h3>
              <p className="text-xs text-slate-400">Complete setup guide, REST API contracts, Socket.io event protocols, and Assistant Bot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Markdown Content Viewer */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
          {/* Quick Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold">
              React 19 + TypeScript
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
              Node.js + Express 4.x
            </span>
            <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full text-xs font-semibold">
              Socket.io 4.8.x Real-Time
            </span>
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
              Persistent JSON DB
            </span>
          </div>

          <section className="space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              1. Project Setup & Run Instructions
            </h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <p className="text-slate-500"># 1. Install dependencies</p>
              <p className="text-emerald-400">npm install</p>
              <p className="text-slate-500"># 2. Run both Backend (Express + Socket.io) & Frontend (Vite) on port 3000</p>
              <p className="text-emerald-400">npm run dev</p>
              <p className="text-slate-500"># 3. Build for production</p>
              <p className="text-emerald-400">npm run build</p>
              <p className="text-slate-500"># 4. Run in production</p>
              <p className="text-emerald-400">npm start</p>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              2. Mandatory REST APIs
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                  <tr>
                    <th className="p-2.5 border-b border-slate-800">Method</th>
                    <th className="p-2.5 border-b border-slate-800">Endpoint</th>
                    <th className="p-2.5 border-b border-slate-800">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                    <td className="p-2.5 text-white">/api/messages?roomId=general&limit=50</td>
                    <td className="p-2.5 text-slate-300 font-sans">Fetches persistent chat history for the room.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-amber-400 font-bold">POST</td>
                    <td className="p-2.5 text-white">/api/messages</td>
                    <td className="p-2.5 text-slate-300 font-sans">
                      Stores message persistently and broadcasts it through Socket.io in real time.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                    <td className="p-2.5 text-white">/api/rooms</td>
                    <td className="p-2.5 text-slate-300 font-sans">Lists channels and direct message threads.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-amber-400 font-bold">POST</td>
                    <td className="p-2.5 text-white">/api/rooms</td>
                    <td className="p-2.5 text-slate-300 font-sans">Creates a new public or private room.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                    <td className="p-2.5 text-white">/api/users</td>
                    <td className="p-2.5 text-slate-300 font-sans">Lists all registered and currently active users.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                    <td className="p-2.5 text-white">/api/health</td>
                    <td className="p-2.5 text-slate-300 font-sans">System health, active socket count, and online users.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              3. Mandatory Real-Time Socket.io Protocol
            </h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
              <div><strong className="text-indigo-400">user:join</strong>: Client authenticates with username and avatar.</div>
              <div><strong className="text-indigo-400">room:join</strong>: Sockets subscribe to specific room channel (`room:$&#123;roomId&#125;`).</div>
              <div><strong className="text-indigo-400">message:send</strong>: Real-time message dispatch, saved to DB and broadcasted via `message:received`.</div>
              <div><strong className="text-indigo-400">typing:start / typing:stop</strong>: Broadcasts typing state to room peers without polling.</div>
              <div><strong className="text-indigo-400">reaction:toggle</strong>: Syncs emoji reactions across all connected users.</div>
              <div><strong className="text-indigo-400">message:read</strong>: Emits read receipts with double checkmarks.</div>
              <div><strong className="text-indigo-400">disconnect</strong>: Server detects drop and broadcasts `user:left` and updated user list.</div>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              4. Data Persistence & Architecture Decisions
            </h4>
            <p className="text-slate-300 text-xs">
              <strong>Server-Authoritative State:</strong> All messages pass through the Express server and are written to an atomic disk-backed JSON database store in <code>data/chat_db.json</code>. When refreshing or reconnecting, chat history is loaded directly via the REST API or socket synchronization, fulfilling the requirement: <em>"View previous messages after refreshing the application"</em>.
            </p>
            <p className="text-slate-300 text-xs">
              <strong>Multi-tab Testing:</strong> You can open two browser tabs (or an incognito window), log in as two different users (e.g., &quot;Sarah Chen&quot; and &quot;Alex Rivera&quot;), and witness instant real-time messaging, typing indicators, read receipts, and reactions!
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              5. Environment Variables & Assumptions
            </h4>
            <ul className="list-disc pl-5 text-xs space-y-1 text-slate-300">
              <li><code>PORT</code>: HTTP &amp; WebSocket server port (defaults to 3000).</li>
              <li><code>NODE_ENV</code>: &apos;development&apos; runs Vite middleware mode; &apos;production&apos; serves static assets.</li>
              <li>Dummy authentication is supported out of the box with persistent username profiles and avatar customization.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
