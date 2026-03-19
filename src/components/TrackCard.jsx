import { motion } from 'framer-motion';

export default function TrackCard({ track, active, onPlay }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -4, boxShadow: '0 24px 46px rgba(3,8,24,0.28)' }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={() => onPlay(track)}
      className={`group relative w-[244px] shrink-0 snap-start overflow-hidden rounded-[22px] border text-left ${
        active
          ? 'border-[#1ed760]/30 bg-[rgba(30,215,96,0.08)]'
          : 'border-white/10 bg-[rgba(14,19,34,0.72)]'
      }`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={track.thumbnail}
          alt={track.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(4,8,18,0.88))]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(6,10,18,0.78)] text-white shadow-[0_18px_40px_rgba(3,8,24,0.4)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path d="M8 5.5v13l10-6.5L8 5.5Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="line-clamp-1 text-base font-semibold text-white">{track.title}</p>
          <p className="mt-1 line-clamp-1 text-sm text-white/58">{track.artist}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/66">
            {track.mood}
          </span>
          {active ? (
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#6df7aa]">
              Playing
            </span>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}
