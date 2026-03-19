import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';
import useMusicGesture from '../hooks/useMusicGesture';

function PlayIcon({ paused }) {
  return paused ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M8 5.5v13l10-6.5L8 5.5Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M8 6h3v12H8zM13 6h3v12h-3z" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="m8 14 4-4 4 4" />
    </svg>
  );
}

export default function MiniPlayer({
  currentTrack,
  isPlaying,
  progress,
  volume,
  autoplayBlocked,
  onTogglePlayback,
  onSkipBack,
  onSkipForward,
  onOpenPanel,
  onVolumeChange,
}) {
  const gestureHandlers = useMusicGesture({ onExpand: onOpenPanel });

  if (!currentTrack) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 24 }}
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-5xl rounded-[28px] border border-white/10 bg-[rgba(12,14,18,0.82)] px-4 py-3 shadow-[0_25px_70px_rgba(2,8,23,0.5)] backdrop-blur-2xl"
      {...gestureHandlers}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenPanel}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            onOpenPanel();
          }
        }}
        className="flex cursor-pointer items-center gap-4"
      >
        <div className="relative h-14 w-14 overflow-hidden rounded-[18px] border border-white/10">
          <motion.img
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={isPlaying ? { duration: 18, repeat: Number.POSITIVE_INFINITY, ease: 'linear' } : { duration: 0.4 }}
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{currentTrack.title}</p>
          <p className="truncate text-xs text-white/56">{currentTrack.artist}</p>
          <div className="mt-2">
            <ProgressBar progress={progress} compact />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Previous track"
            onClick={(event) => {
              event.stopPropagation();
              onSkipBack?.();
            }}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/82 transition hover:bg-white/10 sm:flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current rotate-180">
              <path d="M6 6h2v12H6zM10 12 20 6v12L10 12Z" />
            </svg>
          </button>

          <button
            type="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={(event) => {
              event.stopPropagation();
              onTogglePlayback();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1ed760] text-slate-950 shadow-[0_18px_34px_rgba(30,215,96,0.24)]"
          >
            <PlayIcon paused={!isPlaying} />
          </button>

          <button
            type="button"
            aria-label="Next track"
            onClick={(event) => {
              event.stopPropagation();
              onSkipForward?.();
            }}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/82 transition hover:bg-white/10 sm:flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M6 6h2v12H6zM10 12 20 6v12L10 12Z" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Expand player"
            onClick={(event) => {
              event.stopPropagation();
              onOpenPanel();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/82 transition hover:bg-white/10"
          >
            <ExpandIcon />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 px-1 lg:hidden">
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/38">Volume</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(event) => onVolumeChange(event.target.value)}
          className="w-full accent-[#1ed760]"
        />
      </div>

      {autoplayBlocked ? (
        <div className="mt-3 rounded-[18px] border border-emerald-300/18 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-50/88">
          Audio is ready. Tap the green play button once to start sound in this browser.
        </div>
      ) : null}
    </motion.div>
  );
}
