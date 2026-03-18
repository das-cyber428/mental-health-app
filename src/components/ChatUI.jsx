import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ChatContainer from './ChatContainer';
import InputBar from './InputBar';
import SuggestionChips from './SuggestionChips';

const fallbackSuggestions = ['I feel anxious', 'I feel lost', "Can't sleep"];

const systemStates = ['Listening...', 'Thinking...', 'Responding...'];

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
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const currentDraft = draft;
    setDraft('');
    await onSendMessage(currentDraft);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed inset-0 z-30 flex items-end justify-center bg-[rgba(3,6,14,0.5)] p-0 backdrop-blur-[3px] md:p-4 xl:items-stretch xl:justify-end xl:p-5"
      onClick={onClose}
    >
      <motion.aside
        initial={{ opacity: 0, y: 30, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.985 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden border border-white/8 bg-[rgba(10,15,30,0.7)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_30px_80px_rgba(2,6,23,0.48)] backdrop-blur-[18px] md:h-[min(94vh,960px)] md:max-w-[620px] md:rounded-[24px] xl:max-w-[680px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))]" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),inset_0_-24px_40px_rgba(0,0,0,0.18)]" />

        <div className="relative z-10 flex h-full flex-col">
          <header className="border-b border-white/8 px-4 pb-4 pt-5 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/62">
                  Live Companion Chat
                </p>
                <h2 className="mt-2 text-2xl font-medium text-white">Focused conversation</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-200/70">
                  A clear, private space for reflection with stronger readability,
                  calmer motion, and less visual noise.
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-white/72 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {systemStates.map((state, index) => (
                <motion.span
                  key={state}
                  animate={{ opacity: isSending ? [0.45, 1, 0.45] : 0.7 }}
                  transition={{
                    duration: 1.8,
                    delay: index * 0.12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                  className="rounded-full border border-white/8 bg-[rgba(17,22,38,0.78)] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-cyan-50/66"
                >
                  {state}
                </motion.span>
              ))}
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-5">
            <ChatContainer messages={messages} isSending={isSending} scrollRef={scrollRef} />

            <SuggestionChips suggestions={suggestions} onSelect={setDraft} />

            <div className="sticky bottom-0">
              <InputBar
                draft={draft}
                isSending={isSending}
                onChange={setDraft}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
