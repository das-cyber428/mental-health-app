import { motion } from 'framer-motion';

function IconButton({ label, onClick, children, large = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition hover:bg-white/12 ${
        large ? 'h-16 w-16 shadow-[0_20px_44px_rgba(30,215,96,0.24)]' : 'h-12 w-12'
      }`}
    >
      {children}
    </button>
  );
}

function SkipIcon({ reversed = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 fill-current ${reversed ? 'rotate-180' : ''}`}
    >
      <path d="M6 6h2v12H6zM10 12 20 6v12L10 12Z" />
    </svg>
  );
}

function PlayIcon({ paused, large = false }) {
  return paused ? (
    <svg viewBox="0 0 24 24" className={`${large ? 'h-7 w-7' : 'h-6 w-6'} fill-current`}>
      <path d="M8 5.5v13l10-6.5L8 5.5Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className={`${large ? 'h-7 w-7' : 'h-6 w-6'} fill-current`}>
      <path d="M8 6h3v12H8zM13 6h3v12h-3z" />
    </svg>
  );
}

export default function PlayerControls({
  isPlaying,
  onTogglePlayback,
  onSkipBack,
  onSkipForward,
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <IconButton label="Previous track" onClick={onSkipBack}>
        <SkipIcon reversed />
      </IconButton>
      <motion.button
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={onTogglePlayback}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#1ed760] to-[#49f2af] text-slate-950 shadow-[0_20px_44px_rgba(30,215,96,0.32)]"
      >
        <motion.span
          animate={isPlaying ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 1.2, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
        >
          <PlayIcon paused={!isPlaying} large />
        </motion.span>
      </motion.button>
      <IconButton label="Next track" onClick={onSkipForward}>
        <SkipIcon />
      </IconButton>
    </div>
  );
}
