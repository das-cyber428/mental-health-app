import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import YouTubePlayer from '../components/YouTubePlayer';
import { getMusicByMood } from '../utils/youtubeAPI';

const MUSIC_STATE_STORAGE_KEY = 'mindorbit.musicState';
const PLAYLISTS_STORAGE_KEY = 'mindorbit.musicPlaylists';

const fallbackCatalog = {
  calm: [
    {
      id: 'calm-fallback-1',
      mood: 'calm',
      title: 'Sanctuary of Calm',
      artist: 'MindOrbit Fallback',
      videoId: 'DEePqoOahZk',
      thumbnail: 'https://i.ytimg.com/vi/DEePqoOahZk/hqdefault.jpg',
      energy: 0.42,
      accent: '#61d0ff',
    },
    {
      id: 'calm-fallback-2',
      mood: 'calm',
      title: 'Gentle Night Rain',
      artist: 'MindOrbit Fallback',
      videoId: '1ZYbU82GVz4',
      thumbnail: 'https://i.ytimg.com/vi/1ZYbU82GVz4/hqdefault.jpg',
      energy: 0.38,
      accent: '#6fd8ff',
    },
    {
      id: 'calm-fallback-3',
      mood: 'calm',
      title: 'Deep Focus Ambient',
      artist: 'MindOrbit Fallback',
      videoId: 'lFcSrYw-ARY',
      thumbnail: 'https://i.ytimg.com/vi/lFcSrYw-ARY/hqdefault.jpg',
      energy: 0.4,
      accent: '#7bd7ff',
    },
  ],
  anxious: [
    {
      id: 'anxious-fallback-1',
      mood: 'anxious',
      title: 'Relaxing Music for Stress Relief',
      artist: 'MindOrbit Fallback',
      videoId: 'aR-7IdBmtVo',
      thumbnail: 'https://i.ytimg.com/vi/aR-7IdBmtVo/hqdefault.jpg',
      energy: 0.28,
      accent: '#59d3ff',
    },
    {
      id: 'anxious-fallback-2',
      mood: 'anxious',
      title: 'Quiet Piano for Stress Relief',
      artist: 'MindOrbit Fallback',
      videoId: 'sTANio_2E0Q',
      thumbnail: 'https://i.ytimg.com/vi/sTANio_2E0Q/hqdefault.jpg',
      energy: 0.24,
      accent: '#63dcff',
    },
    {
      id: 'anxious-fallback-3',
      mood: 'anxious',
      title: 'Breathing Space',
      artist: 'MindOrbit Fallback',
      videoId: 'ZToicYcHIOU',
      thumbnail: 'https://i.ytimg.com/vi/ZToicYcHIOU/hqdefault.jpg',
      energy: 0.22,
      accent: '#6ce0ff',
    },
  ],
  sad: [
    {
      id: 'sad-fallback-1',
      mood: 'sad',
      title: 'Say Goodbye',
      artist: 'MindOrbit Fallback',
      videoId: 'ch0Mf5Y0vzE',
      thumbnail: 'https://i.ytimg.com/vi/ch0Mf5Y0vzE/hqdefault.jpg',
      energy: 0.32,
      accent: '#8d7eff',
    },
    {
      id: 'sad-fallback-2',
      mood: 'sad',
      title: 'Soft Piano Reflection',
      artist: 'MindOrbit Fallback',
      videoId: '2OEL4P1Rz04',
      thumbnail: 'https://i.ytimg.com/vi/2OEL4P1Rz04/hqdefault.jpg',
      energy: 0.29,
      accent: '#9a8dff',
    },
    {
      id: 'sad-fallback-3',
      mood: 'sad',
      title: 'Comforting Instrumental',
      artist: 'MindOrbit Fallback',
      videoId: '9Q634rbsypE',
      thumbnail: 'https://i.ytimg.com/vi/9Q634rbsypE/hqdefault.jpg',
      energy: 0.3,
      accent: '#a193ff',
    },
  ],
  happy: [
    {
      id: 'happy-fallback-1',
      mood: 'happy',
      title: 'Lofi Hip Hop Radio',
      artist: 'MindOrbit Fallback',
      videoId: 'DWcJFNfaw9c',
      thumbnail: 'https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg',
      energy: 0.76,
      accent: '#4de3c1',
    },
    {
      id: 'happy-fallback-2',
      mood: 'happy',
      title: 'Feel Good Morning',
      artist: 'MindOrbit Fallback',
      videoId: 'jfKfPfyJRdk',
      thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
      energy: 0.68,
      accent: '#63ebb9',
    },
    {
      id: 'happy-fallback-3',
      mood: 'happy',
      title: 'Bright Day Mix',
      artist: 'MindOrbit Fallback',
      videoId: 'rUxyKA_-grg',
      thumbnail: 'https://i.ytimg.com/vi/rUxyKA_-grg/hqdefault.jpg',
      energy: 0.72,
      accent: '#71f2bf',
    },
  ],
};

const DEFAULT_PLAYLISTS = [
  {
    id: 'playlist-calm',
    name: 'Calm Essentials',
    tracks: fallbackCatalog.calm,
  },
  {
    id: 'playlist-reset',
    name: 'Reset For Anxiety',
    tracks: fallbackCatalog.anxious,
  },
  {
    id: 'playlist-soft-light',
    name: 'Soft Light',
    tracks: fallbackCatalog.sad,
  },
  {
    id: 'playlist-bright-start',
    name: 'Bright Start',
    tracks: fallbackCatalog.happy,
  },
];

const MusicContext = createContext(null);

function loadYouTubeIframeApi() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube player is only available in the browser.'));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (window.__mindOrbitYouTubeApiPromise) {
    return window.__mindOrbitYouTubeApiPromise;
  }

  window.__mindOrbitYouTubeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-mindorbit-youtube-api="true"]');

    const handleReady = () => {
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error('YouTube player failed to initialize.'));
      }
    };

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      handleReady();
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.dataset.mindorbitYoutubeApi = 'true';
    script.onerror = () => reject(new Error('Could not load the YouTube IFrame API.'));
    document.head.appendChild(script);
  });

  return window.__mindOrbitYouTubeApiPromise;
}

function normalizeMood(mood) {
  return fallbackCatalog[mood] ? mood : 'calm';
}

function loadJson(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function saveJson(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function dedupeTracks(tracks = []) {
  const seen = new Set();

  return tracks.filter((track) => {
    const key = track?.videoId || track?.id;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function clampIndex(index, tracks) {
  if (!tracks.length) {
    return 0;
  }

  return Math.max(0, Math.min(index, tracks.length - 1));
}

function findTrackIndex(tracks, track) {
  if (!track) {
    return -1;
  }

  return tracks.findIndex(
    (item) => item.id === track.id || (item.videoId && item.videoId === track.videoId),
  );
}

function findFallbackTrack(mood, trackId) {
  return (fallbackCatalog[normalizeMood(mood)] ?? []).find((track) => track.id === trackId);
}

function buildFallbackMessage(message) {
  return message === 'Music recommendations could not load right now.'
    ? 'Live recommendations are unavailable right now. MindOrbit is using its built-in tracks instead.'
    : message || 'MindOrbit is using its built-in tracks right now.';
}

export function MusicProvider({ children }) {
  const storedState = loadJson(MUSIC_STATE_STORAGE_KEY, {});
  const initialMood = normalizeMood(storedState?.mood || 'calm');
  const initialQueue = dedupeTracks(
    storedState?.queue?.length ? storedState.queue : fallbackCatalog[initialMood],
  );
  const initialIndex = clampIndex(storedState?.currentIndex ?? 0, initialQueue);
  const initialTrack =
    initialQueue[initialIndex] ??
    findFallbackTrack(initialMood, storedState?.currentTrackId) ??
    fallbackCatalog[initialMood][0];
  const initialPlaylists = loadJson(PLAYLISTS_STORAGE_KEY, DEFAULT_PLAYLISTS);

  const [mood, setMoodState] = useState(initialMood);
  const [queue, setQueueState] = useState(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(storedState?.volume ?? 42);
  const [panelOpen, setPanelOpen] = useState(false);
  const [queuePanelOpen, setQueuePanelOpen] = useState(false);
  const [playlistPanelOpen, setPlaylistPanelOpen] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(storedState?.autoPlayEnabled ?? true);
  const [hasInteracted, setHasInteracted] = useState(storedState?.hasInteracted ?? false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [trackGroups, setTrackGroups] = useState(fallbackCatalog);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [playlists, setPlaylists] = useState(
    Array.isArray(initialPlaylists) && initialPlaylists.length ? initialPlaylists : DEFAULT_PLAYLISTS,
  );
  const [activePlaylistId, setActivePlaylistId] = useState(storedState?.activePlaylistId ?? null);
  const [queueSource, setQueueSource] = useState(storedState?.queueSource ?? 'mood');

  const playerRef = useRef(null);
  const playerHostRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const autoplayCheckTimeoutRef = useRef(null);
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);

  const currentTrack = queue[currentIndex] ?? initialTrack;

  useEffect(() => {
    queueRef.current = queue;
    currentIndexRef.current = currentIndex;
  }, [currentIndex, queue]);

  const clearAutoplayCheck = () => {
    if (autoplayCheckTimeoutRef.current) {
      clearTimeout(autoplayCheckTimeoutRef.current);
      autoplayCheckTimeoutRef.current = null;
    }
  };

  const scheduleAutoplayCheck = () => {
    if (typeof window === 'undefined') {
      return;
    }

    clearAutoplayCheck();
    autoplayCheckTimeoutRef.current = window.setTimeout(() => {
      const state = playerRef.current?.getPlayerState?.();
      
      if (
        state !== window.YT?.PlayerState?.PLAYING &&
        state !== window.YT?.PlayerState?.BUFFERING
      ) {
        setAutoplayBlocked(true);
        setIsPlaying(false);
      }
    }, 1500);
  };

  const applyQueue = (tracks, startIndex = 0, options = {}) => {
    const nextQueue = dedupeTracks(tracks);

    if (!nextQueue.length) {
      return [];
    }

    const nextIndex = clampIndex(startIndex, nextQueue);
    const nextTrack = nextQueue[nextIndex];

    setQueueState(nextQueue);
    setCurrentIndex(nextIndex);
    setQueueSource(options.source || 'manual');
    setActivePlaylistId(options.playlistId ?? null);
    setMoodState(normalizeMood(options.mood || nextTrack.mood || mood));
    setAutoplayBlocked(false);
    setCurrentTime(0);
    setDuration(0);

    if (options.fromUser) {
      setHasInteracted(true);
    }

    if (options.autoplay !== false) {
      setIsPlaying(true);
    }

    return nextQueue;
  };

  const playTrack = (trackOrIndex, options = {}) => {
    if (typeof trackOrIndex === 'number') {
      const nextIndex = clampIndex(trackOrIndex, queue);
      const nextTrack = queue[nextIndex];

      if (!nextTrack) {
        return;
      }

      setCurrentIndex(nextIndex);
      setMoodState(normalizeMood(nextTrack.mood || mood));
      setAutoplayBlocked(false);
      setCurrentTime(0);
      setDuration(0);

      if (options.fromUser) {
        setHasInteracted(true);
      }

      if (options.autoplay !== false) {
        setIsPlaying(true);
      }

      return;
    }

    const track = trackOrIndex ?? currentTrack;

    if (!track) {
      return;
    }

    const existingIndex = findTrackIndex(queue, track);

    if (existingIndex >= 0) {
      playTrack(existingIndex, options);
      return;
    }

    const nextQueue = [...queue, track];
    applyQueue(nextQueue, nextQueue.length - 1, {
      ...options,
      source: options.source || 'manual',
      mood: track.mood || mood,
      playlistId: options.playlistId ?? activePlaylistId,
    });
  };

  const playNext = (options = {}) => {
    if (!queue.length) {
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex < queue.length) {
      playTrack(nextIndex, { autoplay: true, fromUser: Boolean(options.fromUser) });
      return;
    }

    if (options.wrap || autoPlayEnabled) {
      playTrack(0, { autoplay: true, fromUser: Boolean(options.fromUser) });
      return;
    }

    setIsPlaying(false);
  };

  const playPrev = (options = {}) => {
    if (!queue.length) {
      return;
    }

    if (currentTime > 5 && !options.forceTrackChange) {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0, true);
      }
      setCurrentTime(0);
      return;
    }

    const nextIndex = currentIndex - 1;

    if (nextIndex >= 0) {
      playTrack(nextIndex, { autoplay: true, fromUser: Boolean(options.fromUser) });
      return;
    }

    if (queue.length > 1) {
      playTrack(queue.length - 1, { autoplay: true, fromUser: Boolean(options.fromUser) });
    }
  };

  useEffect(() => {
    saveJson(MUSIC_STATE_STORAGE_KEY, {
      mood,
      queue,
      currentIndex,
      currentTrackId: currentTrack?.id,
      volume,
      autoPlayEnabled,
      hasInteracted,
      activePlaylistId,
      queueSource,
    });
  }, [
    activePlaylistId,
    autoPlayEnabled,
    currentIndex,
    currentTrack?.id,
    hasInteracted,
    mood,
    queue,
    queueSource,
    volume,
  ]);

  useEffect(() => {
    saveJson(PLAYLISTS_STORAGE_KEY, playlists);
  }, [playlists]);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled || playerRef.current || !playerHostRef.current || !currentTrack) {
        return;
      }

      playerRef.current = new YT.Player(playerHostRef.current, {
        height: '1',
        width: '1',
        videoId: currentTrack.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
            event.target.mute();
            event.target.cueVideoById(currentTrack.videoId);
            setPlayerReady(true);
          },
          onStateChange: (event) => {
            if (window.YT?.PlayerState?.PLAYING && event.data === window.YT.PlayerState.PLAYING) {
              clearAutoplayCheck();
              setAutoplayBlocked(false);
              setIsPlaying(true);
              setDuration(Number(playerRef.current?.getDuration?.() ?? 0));
            }

            if (window.YT?.PlayerState?.PAUSED && event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }

            if (window.YT?.PlayerState?.ENDED && event.data === window.YT.PlayerState.ENDED) {
              if (currentIndexRef.current < queueRef.current.length - 1) {
                setCurrentIndex((index) => index + 1);
                setIsPlaying(true);
                return;
              }

              if (queueRef.current.length > 1 && autoPlayEnabled) {
                setCurrentIndex(0);
                setIsPlaying(true);
                return;
              }

              setIsPlaying(false);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      clearAutoplayCheck();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!playerReady || !playerRef.current) {
      return;
    }

    playerRef.current.setVolume(volume);
  }, [playerReady, volume]);

  useEffect(() => {
    if (!playerReady || !playerRef.current || !currentTrack) {
      return;
    }

    clearAutoplayCheck();
    setCurrentTime(0);
    setDuration(0);

    if (isPlaying && hasInteracted) {
      setAutoplayBlocked(false);
      playerRef.current.loadVideoById({
        videoId: currentTrack.videoId,
        startSeconds: 0,
      });
      playerRef.current.unMute();
      scheduleAutoplayCheck();
      return;
    }

    playerRef.current.mute();
    playerRef.current.cueVideoById(currentTrack.videoId);
  }, [currentTrack?.videoId, playerReady]);

  useEffect(() => {
    if (!playerReady || !playerRef.current || !currentTrack || !hasInteracted) {
      return;
    }

    const state = playerRef.current.getPlayerState?.();

    if (isPlaying) {
      setAutoplayBlocked(false);
      playerRef.current.unMute();
      if (state !== window.YT?.PlayerState?.PLAYING) {
        playerRef.current.playVideo();
      }
      scheduleAutoplayCheck();
      return;
    }

    clearAutoplayCheck();
    if (
      state === window.YT?.PlayerState?.PLAYING ||
      state === window.YT?.PlayerState?.BUFFERING
    ) {
      playerRef.current.pauseVideo();
    }
  }, [currentTrack?.videoId, hasInteracted, isPlaying, playerReady]);

  useEffect(() => {
    if (!playerReady || !playerRef.current || !isPlaying) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    progressIntervalRef.current = window.setInterval(() => {
      setCurrentTime(Number(playerRef.current?.getCurrentTime?.() ?? 0));
      setDuration(Number(playerRef.current?.getDuration?.() ?? 0));
    }, 400);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, playerReady]);

  useEffect(() => {
    let cancelled = false;
    const normalizedMood = normalizeMood(mood);

    setIsLoading(true);
    setError('');

    getMusicByMood(normalizedMood)
      .then((tracks) => {
        if (cancelled) {
          return;
        }

        const nextTracks = dedupeTracks(tracks.length > 0 ? tracks : fallbackCatalog[normalizedMood]);
        setTrackGroups((current) => ({
          ...current,
          [normalizedMood]: nextTracks,
        }));

        if (!queue.length || queueSource === 'mood') {
          const existingIndex = findTrackIndex(nextTracks, currentTrack);
          applyQueue(nextTracks, existingIndex >= 0 ? existingIndex : 0, {
            autoplay: isPlaying,
            fromUser: false,
            source: 'mood',
            mood: normalizedMood,
          });
        }
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }

        const nextTracks = fallbackCatalog[normalizedMood];
        setError(buildFallbackMessage(fetchError?.message));
        setTrackGroups((current) => ({
          ...current,
          [normalizedMood]: nextTracks,
        }));

        if (!queue.length || queueSource === 'mood') {
          const existingIndex = findTrackIndex(nextTracks, currentTrack);
          applyQueue(nextTracks, existingIndex >= 0 ? existingIndex : 0, {
            autoplay: isPlaying,
            fromUser: false,
            source: 'mood',
            mood: normalizedMood,
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mood]);

  const pauseTrack = () => {
    clearAutoplayCheck();
    if (playerRef.current && playerReady) {
      playerRef.current.pauseVideo();
    }
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!currentTrack) {
      return;
    }

    if (!playerRef.current || !playerReady) {
      setAutoplayBlocked(false);
      setIsPlaying((current) => !current);
      setHasInteracted(true);
      return;
    }

    if (isPlaying) {
      pauseTrack();
      return;
    }

    setAutoplayBlocked(false);
    setHasInteracted(true);
    playerRef.current.unMute();
    playerRef.current.playVideo();
    scheduleAutoplayCheck();
    setIsPlaying(true);
  };

  const setVolume = (nextVolume) => {
    const normalizedVolume = Math.max(0, Math.min(100, Number(nextVolume)));
    setVolumeState(normalizedVolume);
    if (playerRef.current && playerReady) {
      playerRef.current.setVolume(normalizedVolume);
    }
  };

  const setMood = (nextMood, options = {}) => {
    const normalizedMood = normalizeMood(nextMood);
    setMoodState(normalizedMood);

    if (options.auto && autoPlayEnabled && options.fromUser) {
      setHasInteracted(true);
      setIsPlaying(true);
    }
  };

  const updateProgress = (nextProgress) => {
    const normalizedProgress = Math.max(0, Math.min(100, Number(nextProgress)));
    if (duration > 0) {
      const nextTime = (normalizedProgress / 100) * duration;
      if (playerRef.current && playerReady) {
        playerRef.current.seekTo(nextTime, true);
      }
      setCurrentTime(nextTime);
    }
  };

  const seekBy = (seconds) => {
    if (!playerRef.current || !playerReady || !duration) {
      return;
    }

    const nextTime = Math.max(0, Math.min(duration, currentTime + seconds));
    playerRef.current.seekTo(nextTime, true);
    setCurrentTime(nextTime);
  };

  const createPlaylist = (name) => {
    const trimmed = name.trim();

    if (!trimmed) {
      throw new Error('Playlist name is required.');
    }

    const playlist = {
      id: `playlist-${Date.now()}`,
      name: trimmed,
      tracks: [],
    };

    setPlaylists((current) => [playlist, ...current]);
    return playlist;
  };

  const addToPlaylist = (playlistId, track = currentTrack) => {
    if (!track) {
      return;
    }

    setPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.id !== playlistId) {
          return playlist;
        }

        const hasTrack = playlist.tracks.some(
          (item) => item.id === track.id || item.videoId === track.videoId,
        );

        if (hasTrack) {
          return playlist;
        }

        return {
          ...playlist,
          tracks: [...playlist.tracks, track],
        };
      }),
    );
  };

  const loadPlaylist = (playlistId, options = {}) => {
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist?.tracks?.length) {
      return null;
    }

    applyQueue(playlist.tracks, 0, {
      autoplay: options.autoplay !== false,
      fromUser: options.fromUser ?? true,
      source: 'playlist',
      mood: playlist.tracks[0]?.mood || mood,
      playlistId,
    });

    if (options.openPanel !== false) {
      setPanelOpen(true);
    }

    return playlist;
  };

  const toggleQueuePanel = () => {
    setQueuePanelOpen((current) => !current);
  };

  const togglePlaylistPanel = () => {
    setPlaylistPanelOpen((current) => !current);
  };

  const expandPlayer = () => {
    setPanelOpen(true);
  };

  const collapsePlayer = () => {
    setPanelOpen(false);
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const musicProfile = useMemo(
    () => ({
      mood,
      energy: currentTrack?.energy ?? 0.45,
      accent: currentTrack?.accent ?? '#61d0ff',
      isPlaying,
    }),
    [currentTrack?.accent, currentTrack?.energy, isPlaying, mood],
  );

  const value = useMemo(
    () => ({
      tracksByMood: trackGroups,
      recommendedByMood: trackGroups,
      mood,
      queue,
      playlist: queue,
      currentIndex,
      currentTrack,
      isPlaying,
      volume,
      autoPlayEnabled,
      panelOpen,
      isExpanded: panelOpen,
      queuePanelOpen,
      playlistPanelOpen,
      progress,
      duration,
      currentTime,
      hasInteracted,
      autoplayBlocked,
      musicProfile,
      isLoading,
      error,
      playlists,
      activePlaylistId,
      queueSource,
      setQueue: applyQueue,
      playTrack,
      playTrackByIndex: playTrack,
      playNext,
      playPrev,
      pauseTrack,
      togglePlayback,
      setVolume,
      setMood,
      skipTrack: playNext,
      setPanelOpen,
      expandPlayer,
      collapsePlayer,
      updateProgress,
      seekBy,
      toggleAutoPlay: () => setAutoPlayEnabled((current) => !current),
      createPlaylist,
      addToPlaylist,
      loadPlaylist,
      toggleQueuePanel,
      togglePlaylistPanel,
    }),
    [
      activePlaylistId,
      autoPlayEnabled,
      autoplayBlocked,
      currentIndex,
      currentTime,
      currentTrack,
      duration,
      error,
      hasInteracted,
      isLoading,
      isPlaying,
      mood,
      musicProfile,
      panelOpen,
      playlistPanelOpen,
      playlists,
      progress,
      queue,
      queuePanelOpen,
      queueSource,
      trackGroups,
      volume,
    ],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <YouTubePlayer hostRef={playerHostRef} />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error('useMusic must be used inside MusicProvider.');
  }

  return context;
}
