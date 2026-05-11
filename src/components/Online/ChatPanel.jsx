import { useState, useRef, useEffect } from 'react';
import { playChatMessage } from '../../utils/sounds';

const QUICK = ['👍', '😂', '🔥', '😮', '🎉', '😢'];

function msgTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export default function ChatPanel({ messages, onSend, myPlayerNum, playerColors, playerNames }) {
  const [open, setOpen]     = useState(false);
  const [text, setText]     = useState('');
  const [unread, setUnread] = useState(0);
  const listRef             = useRef(null);
  const prevLen             = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevLen.current) {
      if (!open) {
        setUnread(u => u + (messages.length - prevLen.current));
        playChatMessage();
      } else if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
    prevLen.current = messages.length;
  }, [messages.length, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open]);

  function send(msg) {
    const m = msg.trim();
    if (!m) return;
    onSend(m);
    setText('');
    if (listRef.current) setTimeout(() => { listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);
  }

  const myColor  = playerColors?.[myPlayerNum]  ?? '#818cf8';
  const oppNum   = myPlayerNum === 1 ? 2 : 1;
  const oppColor = playerColors?.[oppNum] ?? '#fb7185';

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">

      {/* Açık panel */}
      {open && (
        <div className="glass rounded-2xl border border-slate-700/50 w-72 flex flex-col shadow-xl overflow-hidden" style={{ maxHeight: 320 }}>
          {/* Başlık */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/40">
            <span className="text-xs font-semibold text-slate-300">Sohbet</span>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
          </div>

          {/* Mesajlar */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2" style={{ minHeight: 80, maxHeight: 160 }}>
            {messages.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-4">Henüz mesaj yok</p>
            )}
            {messages.map((m, i) => {
              const isMe = m.playerNum === myPlayerNum;
              const color = isMe ? myColor : oppColor;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%]">
                    {!isMe && (
                      <div className="text-[10px] mb-0.5" style={{ color: oppColor }}>
                        {m.playerName ?? playerNames?.[oppNum] ?? `P${oppNum}`}
                      </div>
                    )}
                    <div
                      className="text-xs px-3 py-1.5 rounded-xl"
                      style={{ background: `${color}22`, border: `1px solid ${color}44`, color: '#f1f5f9' }}
                    >
                      {m.message}
                    </div>
                    <div className="text-[9px] text-slate-700 mt-0.5 px-1">{msgTime(m.sentAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hızlı emoji */}
          <div className="flex gap-1 px-3 py-1.5 border-t border-slate-700/40">
            {QUICK.map(e => (
              <button key={e} onClick={() => send(e)}
                className="text-lg hover:scale-125 transition-transform active:scale-95">
                {e}
              </button>
            ))}
          </div>

          {/* Yazı girişi */}
          <div className="flex gap-2 px-3 pb-3">
            <input
              className="flex-1 glass rounded-xl px-3 py-1.5 text-xs text-white border border-slate-700 focus:border-indigo-500 outline-none bg-transparent placeholder-slate-600"
              placeholder="Mesaj yaz..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(text)}
              maxLength={60}
            />
            <button
              onClick={() => send(text)}
              disabled={!text.trim()}
              className="text-xs px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-colors"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Toggle butonu */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-11 h-11 rounded-full glass border border-slate-700/50 flex items-center justify-center text-xl hover:border-indigo-500/50 transition-all shadow-lg"
      >
        💬
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
