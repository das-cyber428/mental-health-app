import { AnimatePresence, motion } from 'framer-motion';
import GestureSheet from './GestureSheet';
import PlayerControls from './PlayerControls';
import PlaylistPanel from './PlaylistPanel';
import ProgressBar from './ProgressBar';
import QueuePanel from './QueuePanel';

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function formatTime(seconds) {
  const total = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function FullPlayerSheet({
  open,
  currentTrack,
  currentIndex,
  isPlaying,
  queue,
  progress,
  volume,
  mood,
  autoplayBlocked,
  currentTime,
  duration,
  autoPlayEnabled,
  playlists,
  activePlaylistId,
  onClose,
  onTogglePlayback,
  onSkipBack,
  onSkipForward,
  onSeek,
  onVolumeChange,
  onToggleAutoPlay,
  onPlayTrack,
  onCreatePlaylist,
  onAddToPlaylist,
  onLoadPlaylist,
}) {
  return (
    <AnimatePresence>
      {open && currentTrack ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[rgba(3,6,14,0.72)] backdrop-blur-md"
          onClick={onClose}
        >
          <GestureSheet onClose={onClose}>
            <div
              onClick={(event) => event.stopPropagation()}
              className="max-h-[86vh] overflow-y-auto p-5 md:p-7"
              style={{
                backgroundImage: `radial-gradient(circle at top, ${currentTrack.accent}2e, transparent 38%), linear-gradient(180deg, rgba(8,12,24,0.98), rgba(5,9,20,0.98))`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">MindOrbit Player</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[#86f5ba]">
                    {mood}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/82 transition hover:bg-white/10"
                >
                  <ChevronDownIcon />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-6">
                <div>
                  <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black/20">
                    <motion.img
                      animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                      transition={
                        isPlaying
                          ? { duration: 24, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }
                          : { duration: 0.4 }
                      }
                      src={currentTrack.thumbnail}
                      alt={currentTrack.title}
                      className="aspect-square w-full object-cover"
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-2xl font-semibold text-white">{currentTrack.title}</h3>
                    <p className="mt-2 text-sm text-white/58">{currentTrack.artist}</p>
                  </div>

                  <div className="mt-6">
                    <ProgressBar progress={progress} onSeek={onSeek} />
                    <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/46">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="mt-7">
                    <PlayerControls
                      isPlaying={isPlaying}
                      onTogglePlayback={onTogglePlayback}
                      onSkipBack={onSkipBack}
                      onSkipForward={onSkipForward}
                    />
                  </div>

                  <div className="mt-7 rounded-[24px] border border-white/10 bg-white/5 p-4">
                    {autoplayBlocked ? (
                      <div className="mb-4 rounded-[18px] border border-emerald-300/18 bg-emerald-300/10 px-3 py-3 text-sm text-emerald-50/88">
                        Audio is queued. Tap play once to start sound in this browser.
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-white/84">Volume</p>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(event) => onVolumeChange(event.target.value)}
                        className="w-40 accent-[#1ed760]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={onToggleAutoPlay}
                      className={`mt-4 rounded-full border px-4 py-2 text-sm transition ${
                        autoPlayEnabled
                          ? 'border-[#1ed760]/30 bg-[#1ed760]/10 text-[#8efbc1]'
                          : 'border-white/10 bg-white/6 text-white/76'
                      }`}
                    >
                      Auto Play Music {autoPlayEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/42">Queue</p>
                        <p className="mt-1 text-sm text-white/58">
                          {queue.length} tracks lined up, currently on #{currentIndex + 1}
                        </p>
                      </div>
                    </div>
                    <QueuePanel
                      queue={queue}
                      currentTrack={currentTrack}
                      currentIndex={currentIndex}
                      onPlayTrack={onPlayTrack}
                    />
                  </section>

                  <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="mb-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">Playlists</p>
                      <p className="mt-1 text-sm text-white/58">
                        Save the current track or load a saved list any time.
                      </p>
                    </div>
                    <PlaylistPanel
                      playlists={playlists}
                      currentTrack={currentTrack}
                      activePlaylistId={activePlaylistId}
                      onCreatePlaylist={onCreatePlaylist}
                      onAddToPlaylist={onAddToPlaylist}
                      onLoadPlaylist={onLoadPlaylist}
                    />
                  </section>
                </div>
              </div>
            </div>
          </GestureSheet>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
