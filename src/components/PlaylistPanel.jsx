import { useState } from 'react';

export default function PlaylistPanel({
  playlists = [],
  currentTrack,
  activePlaylistId,
  onCreatePlaylist,
  onAddToPlaylist,
  onLoadPlaylist,
}) {
  const [draftName, setDraftName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    try {
      const playlist = onCreatePlaylist?.(draftName);
      setDraftName('');
      setError('');

      if (playlist && currentTrack) {
        onAddToPlaylist?.(playlist.id, currentTrack);
      }
    } catch (createError) {
      setError(createError?.message || 'Could not create playlist.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
        <p className="text-sm font-medium text-white">Create Playlist</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Late night reset"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-[rgba(11,14,26,0.86)] px-4 py-3 text-sm text-white outline-none placeholder:text-white/34"
          />
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-full bg-[#1ed760] px-5 py-3 text-sm font-medium text-slate-950 shadow-[0_12px_26px_rgba(30,215,96,0.24)]"
          >
            Create
          </button>
        </div>
        {error ? <p className="mt-3 text-xs text-amber-200/78">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        {playlists.map((playlist) => {
          const active = playlist.id === activePlaylistId;

          return (
            <div
              key={playlist.id}
              className={`rounded-[20px] border px-4 py-4 ${
                active ? 'border-[#1ed760]/30 bg-[#1ed760]/10' : 'border-white/8 bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{playlist.name}</p>
                  <p className="mt-1 text-xs text-white/52">
                    {playlist.tracks.length} saved {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                  </p>
                  {playlist.tracks[0] ? (
                    <p className="mt-2 line-clamp-1 text-xs text-white/42">
                      {playlist.tracks[0].title}
                      {playlist.tracks[1] ? `, ${playlist.tracks[1].title}` : ''}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onLoadPlaylist?.(playlist.id)}
                    className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/78 transition hover:bg-white/12"
                  >
                    Play
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToPlaylist?.(playlist.id, currentTrack)}
                    disabled={!currentTrack}
                    className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/78 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Save Current
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
