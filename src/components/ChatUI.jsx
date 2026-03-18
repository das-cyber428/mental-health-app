import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const fallbackSuggestions = [
  'I feel overwhelmed today',
  'Help me slow down',
  'I need a grounding prompt',
];

export default function ChatUI({
  messages,
  isSending,
  onClose,
  onSendMessage,
  suggestions = fallbackSuggestions,
}) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }

    const currentDraft = draft;
    setDraft('');
    await onSendMessage(currentDraft);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed inset-0 z-30 flex items-end justify-center bg-slate-950/22 p-3 backdrop-blur-[2px] sm:p-5 xl:items-start xl:justify-end xl:p-6 2xl:p-8"
      onClick={onClose}
    >
      <motion.aside
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.98 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-[min(88vh,860px)] w-full max-w-[440px] rounded-[28px] border border-white/14 bg-white/8 p-4 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur-[28px] sm:p-5 xl:mt-4 xl:mr-4 xl:h-[calc(100vh-3rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/60">
                Live Companion
              </p>
              <h2 className="mt-2 text-2xl font-medium text-white">
                Calm conversation
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-200/68">
                Your chat history is saved locally, and the companion adapts its
                prompts based on the emotional patterns it notices.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/14"
            >
              Close
            </button>
          </div>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-[24px] border border-white/10 bg-slate-950/30 p-4"
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-7 ${
                  message.role === 'user'
                    ? 'ml-auto rounded-br-md bg-gradient-to-r from-violet-500 to-blue-500 text-white'
                    : 'rounded-bl-md border border-white/10 bg-white/8 text-slate-100/90'
                }`}
              >
                {message.content}
              </motion.div>
            ))}

            <AnimatePresence>
              {isSending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex rounded-[20px] rounded-bl-md border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-100/76"
                >
                  Solace is reflecting...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                onClick={() => setDraft(item)}
                className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs text-cyan-50/70 transition hover:border-cyan-200/30 hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <label className="sr-only" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              rows="4"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Tell the companion what you are feeling..."
              className="w-full resize-none rounded-[24px] border border-white/10 bg-slate-950/35 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-300/34 focus:border-cyan-300/40"
            />

            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-teal-400 px-6 py-3 text-sm font-medium text-white shadow-[0_16px_40px_rgba(73,112,255,0.4)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send message
            </button>
          </form>
        </div>
      </motion.aside>
    </motion.div>
  );
}
