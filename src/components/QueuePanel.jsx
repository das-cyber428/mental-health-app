export default function QueuePanel({
  queue = [],
  currentTrack,
  currentIndex = 0,
  onPlayTrack,
}) {
  if (!queue.length) {
    return (
      <div className="rounded-[22px] border border-white/8 bg-white/5 bg-[#121212] px-4 py-4 text-sm text-white/58">
        Your queue is empty right now. Start any mood mix or artist request to build it.
      </div>
    );
  }

  const upcomingTracks = queue.slice(currentIndex + 1);

  return (
    <div className="flex flex-col rounded-xl bg-[#121212] py-4 text-white">
      {/* Top Tabs */}
      <div className="mb-6 flex items-center gap-6 px-4">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-white">Queue</span>
          <div className="mt-1.5 h-0.5 w-full bg-[#1ed760] rounded-full" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-white/60 hover:text-white transition cursor-pointer">Recently played</span>
          <div className="mt-1.5 h-0.5 w-full bg-transparent rounded-full" />
        </div>
      </div>

      {/* Now Playing Section */}
      <div className="mb-6 px-4">
        <h2 className="mb-4 text-base font-bold text-white">Now playing</h2>
        {currentTrack && (
          <div className="flex items-center gap-4 rounded-md p-2 transition hover:bg-white/10 group cursor-default">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                  <path d="M8 5.5v13l10-6.5L8 5.5Z" />
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-[#1ed760]">{currentTrack.title}</p>
              <p className="truncate text-[13px] text-white/60">{currentTrack.artist}</p>
            </div>
          </div>
        )}
      </div>

      {/* Up Next Section */}
      {upcomingTracks.length > 0 && (
        <div className="px-4">
          <h2 className="mb-4 text-base font-bold text-white flex items-center gap-2">
            Next from: MindOrbit
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white/60">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M11 7h2v5.5l4.7 2.8-.75 1.22L11 13z" />
            </svg>
          </h2>
          <div className="flex flex-col">
            {upcomingTracks.map((track, i) => {
              const actualIndex = currentIndex + 1 + i;
              return (
                <button
                  key={`${track.id}-${actualIndex}`}
                  type="button"
                  onClick={() => onPlayTrack?.(actualIndex)}
                  className="flex items-center gap-4 rounded-md p-2 text-left transition hover:bg-white/10 group"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                        <path d="M8 5.5v13l10-6.5L8 5.5Z" />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-white group-hover:text-white transition">{track.title}</p>
                    <p className="truncate text-[13px] text-white/60">{track.artist}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
