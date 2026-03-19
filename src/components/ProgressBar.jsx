import { motion } from 'framer-motion';

export default function ProgressBar({ progress = 0, compact = false, onSeek }) {
  const handleSeek = (event) => {
    if (!onSeek) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const nextProgress = ((event.clientX - rect.left) / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, nextProgress)));
  };

  return (
    <button
      type="button"
      onClick={handleSeek}
      className={`group relative block w-full overflow-visible rounded-full bg-white/8 ${
        compact ? 'h-1.5' : 'h-2'
      }`}
    >
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#1ed760] via-[#2ee59f] to-[#67f0db]"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      <motion.span
        className={`absolute top-1/2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.35)] transition ${
          compact ? 'h-3 w-3 -translate-y-1/2' : 'h-4 w-4 -translate-y-1/2'
        }`}
        animate={{ left: `calc(${progress}% - ${compact ? '6px' : '8px'})`, opacity: progress > 0 ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </button>
  );
}
