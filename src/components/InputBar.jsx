import { motion } from 'framer-motion';
import { useId } from 'react';

export default function InputBar({
  draft,
  isSending,
  onChange,
  onSubmit,
}) {
  const id = useId();

  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="rounded-[24px] border border-white/10 bg-[rgba(10,15,30,0.82)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_20px_44px_rgba(2,8,23,0.36)] backdrop-blur-xl transition focus-within:border-cyan-300/24 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(85,200,255,0.08),0_20px_44px_rgba(2,8,23,0.4)]">
        <label className="sr-only" htmlFor={id}>
          Message
        </label>

        <div className="flex items-end gap-3">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/5 text-base text-slate-300/72 transition hover:border-cyan-200/22 hover:text-white"
            aria-label="Voice input"
          >
            <span aria-hidden="true">🎤</span>
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
            <span aria-hidden="true">➤</span>
          </motion.button>
        </div>
      </div>
    </form>
  );
}
