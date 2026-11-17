import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CHAT_API_URL } from '../config';
import { localAnswer } from '../lib/localAnswer';
import type { CV } from '../types';
import { IconBot, IconChat, IconClose, IconSend } from './Icons';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Điểm mạnh lớn nhất của bạn là gì?',
  'Kể về kinh nghiệm làm việc',
  'Bạn có thể bắt đầu làm việc khi nào?',
  'Bạn dùng những công nghệ nào?',
];

async function askApi(messages: Msg[]): Promise<string> {
  const res = await fetch(`${CHAT_API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { reply?: string };
  if (!data.reply) throw new Error('Phản hồi rỗng');
  return data.reply;
}

export function ChatWidget({ cv, open, onOpenChange, pendingQuestion, onQuestionConsumed }: {
  cv: CV;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingQuestion: string | null;
  onQuestionConsumed: () => void;
}) {
  const greeting: Msg = {
    role: 'assistant',
    content: `Xin chào! Mình là trợ lý AI của ${cv.profile.name}.\nBạn có thể hỏi về kỹ năng, kinh nghiệm, dự án hoặc thời gian có thể bắt đầu làm việc.`,
  };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const history = [...messages, { role: 'user' as const, content: q }];
    setMessages(history);
    setDraft('');
    setBusy(true);
    let reply: string;
    try {
      reply = CHAT_API_URL ? await askApi(history.slice(-12)) : localAnswer(cv, q);
    } catch {
      // API lỗi → vẫn trả lời bằng dữ liệu CV
      reply = localAnswer(cv, q);
    }
    setMessages([...history, { role: 'assistant', content: reply }]);
    setBusy(false);
  }

  useEffect(() => {
    if (open && pendingQuestion) {
      onQuestionConsumed();
      void send(pendingQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingQuestion]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.content));
  const suggestions = SUGGESTIONS.filter((s) => !asked.has(s));

  return (
    <>
      {open && (
        <section className="chat-panel" role="dialog" aria-label="Chatbot hỏi đáp về CV">
          <div className="chat-head">
            <svg className="bg" aria-hidden="true" viewBox="0 0 440 90" preserveAspectRatio="none">
              <path d="M0 65 C 70 45, 140 85, 220 65 S 370 45, 440 65 V 90 H 0 Z" fill="#0E6BA8" opacity="0.45" />
            </svg>
            <div className="chat-avatar"><IconBot size={24} /></div>
            <div className="chat-title">
              <strong>Trợ lý AI của {cv.profile.name}</strong>
              <span><i className="online" />Trực tuyến · trả lời dựa trên CV</span>
            </div>
            <button className="chat-close" onClick={() => onOpenChange(false)} aria-label="Đóng chatbot">
              <IconClose size={20} />
            </button>
          </div>

          <div className="chat-body" ref={bodyRef} aria-live="polite">
            {[greeting, ...messages].map((m, i) =>
              m.role === 'assistant' ? (
                <div className="bot-row" key={i}>
                  <span className="bot-tag">AI</span>
                  <div className="bubble bot">{m.content}</div>
                </div>
              ) : (
                <div className="bubble user" key={i}>{m.content}</div>
              ),
            )}
            {busy && (
              <div className="bot-row">
                <span className="bot-tag">AI</span>
                <div className="bubble bot typing" aria-label="Đang trả lời"><i /><i /><i /></div>
              </div>
            )}
            {!busy && suggestions.length > 0 && (
              <div className="suggest">
                <span className="mono" style={{ fontSize: 12, color: 'var(--muted-2)' }}>Gợi ý câu hỏi</span>
                <div className="suggest-list">
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={onSubmit}>
            <div className="row">
              <label htmlFor="chat-input" className="sr-only">Nhập câu hỏi</label>
              <input
                id="chat-input"
                ref={inputRef}
                className="input"
                value={draft}
                maxLength={1000}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Hỏi về kỹ năng, dự án, kinh nghiệm…"
              />
              <button type="submit" className="btn btn-primary btn-icon" style={{ width: 46, height: 46 }} disabled={busy || !draft.trim()} aria-label="Gửi câu hỏi">
                <IconSend size={20} />
              </button>
            </div>
            <span className="chat-note">AI có thể nhầm lẫn — liên hệ {cv.profile.email} để xác nhận.</span>
          </form>
        </section>
      )}

      <button className="chat-fab" onClick={() => onOpenChange(!open)} aria-label={open ? 'Đóng chatbot' : 'Mở chatbot hỏi đáp'} aria-expanded={open}>
        {open ? <IconClose size={26} /> : <IconChat size={28} />}
      </button>
    </>
  );
}
