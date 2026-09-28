import { useState, useEffect } from 'react';
import { X, Send, Play, Copy, Check, Terminal, Globe, RefreshCw } from 'lucide-react';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoomId: string;
}

export function ApiExplorerModal({ isOpen, onClose, activeRoomId }: ApiExplorerModalProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'getMessages' | 'postMessage' | 'getRooms' | 'getHealth'>('getMessages');
  const [postSender, setPostSender] = useState('REST_Tester');
  const [postText, setPostText] = useState('Hello from the REST API endpoint! 🚀');
  const [postRoomId, setPostRoomId] = useState(activeRoomId);

  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPostRoomId(activeRoomId);
  }, [activeRoomId]);

  if (!isOpen) return null;

  const executeRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseBody('');

    try {
      let res: Response;
      if (selectedEndpoint === 'getMessages') {
        res = await fetch(`/api/messages?roomId=${encodeURIComponent(postRoomId)}&limit=10`);
      } else if (selectedEndpoint === 'postMessage') {
        res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: postRoomId,
            sender: {
              id: 'usr-rest-client',
              username: postSender,
              avatar: '🌐',
              avatarColor: '#10b981',
            },
            text: postText,
          }),
        });
      } else if (selectedEndpoint === 'getRooms') {
        res = await fetch('/api/rooms');
      } else {
        res = await fetch('/api/health');
      }

      setResponseStatus(res.status);
      const data = await res.json();
      setResponseBody(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const getCurlCommand = () => {
    const origin = window.location.origin;
    if (selectedEndpoint === 'getMessages') {
      return `curl -X GET "${origin}/api/messages?roomId=${postRoomId}&limit=10"`;
    }
    if (selectedEndpoint === 'postMessage') {
      return `curl -X POST "${origin}/api/messages" \\
  -H "Content-Type: application/json" \\
  -d '{"roomId": "${postRoomId}", "sender": {"username": "${postSender}"}, "text": "${postText}"}'`;
    }
    if (selectedEndpoint === 'getRooms') {
      return `curl -X GET "${origin}/api/rooms"`;
    }
    return `curl -X GET "${origin}/api/health"`;
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(getCurlCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                chatbbase REST API Explorer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Express 4.x
                </span>
              </h3>
              <p className="text-xs text-slate-400">Test backend REST endpoints with live Socket.io sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Endpoint Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'getMessages', label: 'GET /api/messages', method: 'GET', desc: 'Fetch chat history' },
              { id: 'postMessage', label: 'POST /api/messages', method: 'POST', desc: 'Send message (syncs to Socket.io)' },
              { id: 'getRooms', label: 'GET /api/rooms', method: 'GET', desc: 'List all channels' },
              { id: 'getHealth', label: 'GET /api/health', method: 'GET', desc: 'Health & Socket stats' },
            ].map((tab) => {
              const isActive = selectedEndpoint === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedEndpoint(tab.id as typeof selectedEndpoint);
                    setResponseBody('');
                    setResponseStatus(null);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border text-left transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`font-bold mr-1.5 ${
                      tab.method === 'GET' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {tab.method}
                  </span>
                  {tab.label.split(' ')[1]}
                </button>
              );
            })}
          </div>

          {/* Parameters for selected endpoint */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Request Parameters
            </div>

            {selectedEndpoint === 'getMessages' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">roomId</label>
                  <input
                    type="text"
                    value={postRoomId}
                    onChange={(e) => setPostRoomId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">limit</label>
                  <input
                    type="text"
                    value="10"
                    readOnly
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-400 font-mono"
                  />
                </div>
              </div>
            )}

            {selectedEndpoint === 'postMessage' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">roomId</label>
                    <input
                      type="text"
                      value={postRoomId}
                      onChange={(e) => setPostRoomId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">sender.username</label>
                    <input
                      type="text"
                      value={postSender}
                      onChange={(e) => setPostSender(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">text</label>
                  <input
                    type="text"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <p className="text-[11px] text-emerald-400/90 italic">
                  💡 Note: Sending this REST request will persist the message and simultaneously emit `message:received` through Socket.io to all users!
                </p>
              </div>
            )}

            {(selectedEndpoint === 'getRooms' || selectedEndpoint === 'getHealth') && (
              <p className="text-xs text-slate-400">No request body or URL parameters required.</p>
            )}

            {/* Execute Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={executeRequest}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{loading ? 'Sending...' : 'Send Request'}</span>
              </button>

              <button
                onClick={copyCurl}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                title="Copy cURL snippet"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied cURL!' : 'Copy cURL'}</span>
              </button>
            </div>
          </div>

          {/* cURL Snippet Box */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              cURL Command
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
              {getCurlCommand()}
            </pre>
          </div>

          {/* Response Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Response
              </span>
              {responseStatus !== null && (
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  Status: {responseStatus}
                </span>
              )}
            </div>
            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 max-h-56 overflow-y-auto overflow-x-auto whitespace-pre">
              {responseBody || '// Click "Send Request" to execute the endpoint'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
