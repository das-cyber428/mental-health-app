import { motion } from 'framer-motion';
import TrackCard from './TrackCard';

export default function MoodPlaylistSection({
  title,
  description,
  tracks,
  currentTrack,
  onPlayTrack,
}) {
  if (!tracks?.length) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-white/42">{title}</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/58">{description}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
      >
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            active={currentTrack?.id === track.id}
            onPlay={onPlayTrack}
          />
        ))}
      </motion.div>
    </section>
  );
}
