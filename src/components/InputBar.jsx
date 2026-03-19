import { motion } from 'framer-motion';
import { useId } from 'react';

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
      <path d="M12 4a3 3 0 0 1 3 3v5a3 3 0 1 1-6 0V7a3 3 0 0 1 3-3Z" />
      <path d="M18 11a6 6 0 0 1-12 0" />
      <path d="M12 17v3" />
      <path d="M8 20h8" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="m4 12 15-8-4 8 4 8-15-8Z" />
    </svg>
  );
}

function SpeakerIcon({ enabled }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
      <path d="M5 10v4h4l5 4V6l-5 4H5Z" />
      {enabled ? <path d="M17 9a4 4 0 0 1 0 6" /> : <path d="m17 9 3 6" />}
    </svg>
  );
}

export default function InputBar({
  draft,
  isSending,
  onChange,
  onSubmit,
  isListening,
  voiceSupported,
  onToggleListening,
  voicePlaybackEnabled,
  onToggleVoicePlayback,
}) {
  const id = useId();

  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="rounded-[24px] border border-white/10 bg-[rgba(10,15,30,0.82)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_20px_44px_rgba(2,8,23,0.36)] backdrop-blur-xl transition focus-within:border-cyan-300/24 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(85,200,255,0.08),0_20px_44px_rgba(2,8,23,0.4)]">
        <label className="sr-only" htmlFor={id}>
          Message
        </label>

        <div className="mb-3 flex items-center justify-between gap-3 px-1 text-[11px] uppercase tracking-[0.22em] text-white/48">
          <span>{isListening ? 'Listening now' : 'Share what you are feeling'}</span>
          <button
            type="button"
            onClick={() => onToggleVoicePlayback?.(!voicePlaybackEnabled)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] transition ${
              voicePlaybackEnabled
                ? 'border-cyan-200/18 bg-cyan-300/10 text-cyan-50'
                : 'border-white/10 bg-white/5 text-white/62'
            }`}
          >
            <SpeakerIcon enabled={voicePlaybackEnabled} />
            Voice
          </button>
        </div>

        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={onToggleListening}
            disabled={!voiceSupported}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-slate-300 transition ${
              isListening
                ? 'border-cyan-200/24 bg-cyan-300/12 text-cyan-50 shadow-[0_0_0_1px_rgba(120,240,255,0.12)]'
                : 'border-white/8 bg-white/5 hover:border-cyan-200/22 hover:text-white'
            } disabled:cursor-not-allowed disabled:opacity-35`}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            <motion.span
              animate={isListening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 1.1, repeat: isListening ? Number.POSITIVE_INFINITY : 0 }}
            >
              <MicIcon />
            </motion.span>
          </button>

          <textarea
            id={id}
            rows="1"
            value={draft}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Share what you're feeling..."
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-7 text-white outline-none placeholder:text-slate-400/60"
          />

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 18px 34px rgba(50,120,255,0.26)' }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSending || !draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 text-white shadow-[0_14px_30px_rgba(53,108,255,0.34)] transition disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Send message"
          >
            <SendIcon />
          </motion.button>
        </div>
      </div>
    </form>
  );
}
