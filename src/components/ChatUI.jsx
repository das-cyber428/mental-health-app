import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ChatContainer from './ChatContainer';
import InputBar from './InputBar';
import SuggestionChips from './SuggestionChips';

const fallbackSuggestions = ['I feel anxious', 'I feel lost', "Can't sleep"];

const SpeechRecognitionApi =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function ChatUI({
  activeUser,
  messages,
  isSending,
  aiState,
  currentTrack,
  isMusicPlaying,
  musicAutoplayBlocked,
  onClose,
  onSendMessage,
  onTogglePlayback,
  onSeekBack,
  onSeekForward,
  onOpenMusic,
  suggestions = fallbackSuggestions,
  voicePlaybackEnabled,
  onToggleVoicePlayback,
}) {
  const [draft, setDraft] = useState('');
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  const systemStates = useMemo(
    () => ['Listening...', 'Thinking...', 'Responding...'],
    [],
  );

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!SpeechRecognitionApi) {
      return undefined;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      setDraft(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const currentDraft = draft;
    setDraft('');
    await onSendMessage(currentDraft);
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current.start();
    setIsListening(true);
  };

  const musicControlsVisible = Boolean(currentTrack && onTogglePlayback);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(3,6,14,0.5)] p-0 backdrop-blur-[3px] md:p-4 xl:items-stretch xl:justify-end xl:p-5"
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
                <h2 className="mt-2 text-2xl font-medium text-white">
                  {activeUser?.name ? `${activeUser.name}, this space is yours` : 'Focused conversation'}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-200/70">
                  Streaming responses, voice controls, and calmer message hierarchy keep
                  the conversation easy to follow on both desktop and mobile.
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
              {systemStates.map((state) => {
                const active = aiState === state;
                return (
                  <motion.span
                    key={state}
                    animate={{ opacity: active ? [0.45, 1, 0.45] : 0.7 }}
                    transition={{
                      duration: 1.8,
                      repeat: active ? Number.POSITIVE_INFINITY : 0,
                      ease: 'easeInOut',
                    }}
                    className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] ${
                      active
                        ? 'border-cyan-200/18 bg-cyan-300/10 text-cyan-50'
                        : 'border-white/8 bg-[rgba(17,22,38,0.78)] text-cyan-50/66'
                    }`}
                  >
                    {state}
                  </motion.span>
                );
              })}
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-5">
            <ChatContainer messages={messages} scrollRef={scrollRef} />

            {musicControlsVisible ? (
              <div className="rounded-[22px] border border-white/8 bg-[rgba(12,16,28,0.88)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center gap-3">
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="h-12 w-12 rounded-[14px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{currentTrack.title}</p>
                    <p className="truncate text-xs text-white/56">{currentTrack.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onSeekBack}
                      className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/82 transition hover:bg-white/10"
                    >
                      -10s
                    </button>
                    <button
                      type="button"
                      onClick={onTogglePlayback}
                      className="rounded-full bg-[#1ed760] px-4 py-2 text-xs font-medium text-slate-950 shadow-[0_12px_26px_rgba(30,215,96,0.28)]"
                    >
                      {isMusicPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                      type="button"
                      onClick={onSeekForward}
                      className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/82 transition hover:bg-white/10"
                    >
                      +10s
                    </button>
                    <button
                      type="button"
                      onClick={onOpenMusic}
                      className="hidden rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/72 transition hover:bg-white/10 sm:inline-flex"
                    >
                      Open
                    </button>
                  </div>
                </div>
                {musicAutoplayBlocked ? (
                  <p className="mt-3 text-xs text-emerald-100/82">
                    Audio is queued. Press play once to start sound in this browser.
                  </p>
                ) : null}
              </div>
            ) : null}

            <SuggestionChips suggestions={suggestions} onSelect={setDraft} />

            <div className="sticky bottom-0 pb-6 pt-2 bg-[rgba(10,15,30,0.9)] backdrop-blur-md">
              <InputBar
                draft={draft}
                isSending={isSending}
                onChange={setDraft}
                onSubmit={handleSubmit}
                isListening={isListening}
                voiceSupported={Boolean(recognitionRef.current)}
                onToggleListening={handleToggleListening}
                voicePlaybackEnabled={voicePlaybackEnabled}
                onToggleVoicePlayback={onToggleVoicePlayback}
              />
            </div>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
