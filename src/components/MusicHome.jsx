import MoodPlaylistSection from './MoodPlaylistSection';

const moodDescriptions = {
  calm: 'Slow, ambient selections that keep the room soft and uncluttered.',
  anxious: 'Lower-stimulation music designed to settle the nervous system.',
  sad: 'Warm, reflective tracks for heavier moments and gentler pacing.',
  happy: 'Brighter, uplifting picks that keep momentum without getting harsh.',
};

export default function MusicHome({
  mood,
  currentTrack,
  tracksByMood,
  isLoading,
  error,
  autoPlayEnabled,
  onToggleAutoPlay,
  onPlayTrack,
}) {
  const orderedMoods = ['calm', 'anxious', 'sad', 'happy'];

  return (
    <section className="space-y-8 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 backdrop-blur-2xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-white/44">Music Home</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Recommended for your mood</h2>
          <p className="mt-3 text-sm leading-7 text-white/62">
            A curated Spotify-inspired listening layer for MindOrbit. Music stays in the
            background, follows your emotional state, and remains easy to control on mobile.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleAutoPlay}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            autoPlayEnabled
              ? 'border-[#1ed760]/30 bg-[#1ed760]/10 text-[#8efbc1]'
              : 'border-white/10 bg-white/6 text-white/76'
          }`}
        >
          Auto Play Music {autoPlayEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/72">
          Loading fresh YouTube recommendations for your current mood...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[22px] border border-amber-200/12 bg-amber-300/8 px-4 py-3 text-sm text-amber-50/84">
          {error}
        </div>
      ) : null}

      <div className="space-y-8">
        <MoodPlaylistSection
          title={`Recommended for ${mood}`}
          description={moodDescriptions[mood] || moodDescriptions.calm}
          tracks={tracksByMood[mood] ?? []}
          currentTrack={currentTrack}
          onPlayTrack={onPlayTrack}
        />

        <div className="grid gap-8 xl:grid-cols-2">
          {orderedMoods
            .filter((entry) => entry !== mood)
            .map((entry) => (
              <MoodPlaylistSection
                key={entry}
                title={`${entry.charAt(0).toUpperCase()}${entry.slice(1)} picks`}
                description={moodDescriptions[entry]}
                tracks={tracksByMood[entry] ?? []}
                currentTrack={currentTrack}
                onPlayTrack={onPlayTrack}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
