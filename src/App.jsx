import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CursorGlow from './components/CursorGlow';
import AuthShell from './components/AuthShell';
import CompanionConsole from './components/CompanionConsole';
import InsightTimeline from './components/InsightTimeline';
import Journal from './components/Journal';
import MiniPlayer from './components/MiniPlayer';
import MusicPanel from './components/MusicPanel';
import MusicPlayer from './components/MusicPlayer';
import MoodInsightCard from './components/MoodInsightCard';
import {
  analyzeEmotion,
  generateInsights,
  getMostCommonEmotion,
  getMoodTrends,
  getOrbMood,
  getPersonalizedSuggestions,
  getTimePattern,
} from './components/MoodTracker';
import {
  createLocalAccount,
  getActiveUser,
  loadUserAppData,
  persistUserAppData,
  signInDemoAccount,
  signInLocalAccount,
  signOutLocalAccount,
  updateUserSettings,
} from './lib/appState';
import { streamMessageToAI } from './lib/chat';
import { useMusic } from './context/MusicContext';
import { parseMusicCommand } from './utils/commandParser';
import { getMusicByQuery } from './utils/youtubeAPI';

const Hero3D = lazy(() => import('./components/Hero3D'));
const ChatPanel = lazy(() => import('./components/ChatPanel'));

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "I'm here for you. Share what feels heavy, and we'll move through it with a little more calm.",
  },
];

const DAILY_CHECKIN_KEY = 'mindorbit.notification.lastCheckIn';
const MOOD_ONLY_TERMS = /\b(calm|calming|relaxing|ambient|meditation|upbeat|happy|sad|anxious|sleep|focus)\b/i;

function detectMusicIntent(text) {
  return /\b(play|music|song|songs|track|tracks|playlist|listen|listening|background music|relaxing music|calming music|ambient music|meditation music|upbeat music)\b/i.test(
    text,
  );
}

function getRequestedMusicMood(text, fallbackMood) {
  const normalized = text.toLowerCase();

  if (
    /\b(calm|calming|relax|relaxing|ambient|meditation|sleep|focus|soft|peaceful)\b/.test(
      normalized,
    )
  ) {
    return 'calm';
  }

  if (/\b(anxious|anxiety|stress|stressed|overwhelmed|panic|nervous)\b/.test(normalized)) {
    return 'anxious';
  }

  if (/\b(sad|lonely|cry|emotional|heavy|down|heartbroken)\b/.test(normalized)) {
    return 'sad';
  }

  if (/\b(happy|upbeat|energetic|dance|lift|cheer|joy|bright)\b/.test(normalized)) {
    return 'happy';
  }

  return fallbackMood === 'neutral' ? 'calm' : fallbackMood;
}

function detectMusicSuggestionReply(text) {
  return /\b(music|song|songs|track|tracks|playlist|play)\b/i.test(text);
}

function detectMusicPlaybackRefusal(text) {
  return /(can('|’)t|cannot|can not)\s+play.*\b(music|song|track)\b|guide you on how to listen/i.test(
    text,
  );
}

function extractMusicQuery(text) {
  const trimmed = text.trim();
  const quoted = trimmed.match(/["'“”](.+?)["'“”]/);

  if (quoted?.[1]) {
    return quoted[1].trim();
  }

  const patterns = [
    /(?:play|listen to|put on|start)\s+(.+)/i,
    /(.+?)\s+(?:song|track|music|playlist)$/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    const value = match?.[1]?.trim();

    if (value && value.length > 2 && !/\b(calm|calming|relaxing|ambient|meditation|upbeat|happy|sad|anxious)\b/i.test(value)) {
      return value.replace(/^(a|an|the)\s+/i, '').trim();
    }
  }

  return '';
}

function extractResolvedMusicQuery(text) {
  const directQuery = extractMusicQuery(text);

  if (directQuery) {
    return directQuery;
  }

  const trimmed = text.trim();
  const cleanQuoted = trimmed.match(/["'“”](.+?)["'“”]/);

  if (cleanQuoted?.[1]) {
    return cleanQuoted[1].trim();
  }

  const namedTrackMatch = trimmed.match(
    /^(?:can you\s+)?(?:please\s+)?(?:play|listen to|put on|start)\s+(.+?\s+by\s+.+)$/i,
  );

  if (namedTrackMatch?.[1]) {
    return namedTrackMatch[1].trim();
  }

  const directTitleByArtist = trimmed.match(/^(.+?\s+by\s+.+)$/i);

  if (directTitleByArtist?.[1] && directTitleByArtist[1].trim().split(/\s+/).length <= 10) {
    return directTitleByArtist[1].trim();
  }

  if (
    trimmed.split(/\s+/).length <= 4 &&
    !/[?.!]$/.test(trimmed) &&
    !/\b(i|feel|am|need|help|how|what|why|can|could|should|anxious|sad|happy|calm|lost|sleep)\b/i.test(
      trimmed,
    )
  ) {
    return trimmed;
  }

  return '';
}

function shouldHandleMusicRequest(text) {
  if (detectMusicIntent(text)) {
    return true;
  }

  const query = extractResolvedMusicQuery(text);

  if (query) {
    return true;
  }

  const trimmed = text.trim();
  return (
    trimmed.split(/\s+/).length <= 8 &&
    !/[?.!]$/.test(trimmed) &&
    /(?:\bby\b|["'“”])/.test(trimmed)
  );
}

function createTimelineItems(moodHistory, insights, journalEntries) {
  const moodDescriptions = {
    anxious:
      'You tend to feel more anxious late at night, when thoughts become louder and the day is finally quiet.',
    sad: 'A heavier emotional tone has been showing up lately. Slower reflection and gentler routines may help.',
    happy:
      'There are moments of steadier energy returning. Notice what supported them and what helped them stay.',
    calm: 'Your nervous system seems more settled here. These moments can become anchors for more difficult days.',
    neutral:
      'Your emotional baseline is relatively even. This creates a useful reference point for noticing subtle shifts.',
  };

  const baseItems = moodHistory.slice(-4).reverse().map((entry) => ({
    id: `timeline-${entry.id}`,
    mood: entry.mood,
    timestamp: entry.timestamp,
    title:
      entry.mood === 'anxious'
        ? 'Anxiety Spike'
        : entry.mood === 'sad'
          ? 'Heavier Mood Detected'
          : entry.mood === 'happy'
            ? 'Brighter Energy Returning'
            : entry.mood === 'calm'
              ? 'Calmer State Observed'
              : 'Baseline Check-In',
    description: moodDescriptions[entry.mood] ?? moodDescriptions.neutral,
  }));

  const insightItems = insights.slice(0, 2).map((insight, index) => ({
    id: `insight-${index}`,
    mood: moodHistory.at(-1)?.mood ?? 'calm',
    timestamp: journalEntries.at(-1)?.timestamp ?? new Date().toISOString(),
    title: index === 0 ? 'Pattern Emerging' : 'A Gentle Reflection',
    description: insight,
  }));

  const items = [...baseItems, ...insightItems];
  return items.length > 0
    ? items
    : [
        {
          id: 'timeline-empty',
          mood: 'calm',
          timestamp: new Date().toISOString(),
          title: 'Your mind timeline begins here',
          description:
            'Start a conversation or save a journal reflection to let MindOrbit begin noticing your patterns.',
        },
      ];
}

function useSpeechOutput(enabled) {
  const lastSpokenId = useRef(null);

  return {
    speak(message) {
      if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window) || !message) {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.97;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    },
    hasSpoken(messageId) {
      return lastSpokenId.current === messageId;
    },
    markSpoken(messageId) {
      lastSpokenId.current = messageId;
    },
    stop() {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    },
  };
}

function showNotification(title, body) {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.showNotification(title, { body }))
      .catch(() => {
        new Notification(title, { body });
      });
    return;
  }

  new Notification(title, { body });
}

export default function App() {
  const {
    mood: musicMood,
    playlist,
    queue,
    currentIndex,
    currentTrack,
    tracksByMood,
    isPlaying: isMusicPlaying,
    volume: musicVolume,
    autoPlayEnabled,
    panelOpen: musicPanelOpen,
    expandPlayer,
    collapsePlayer,
    progress: musicProgress,
    currentTime: musicCurrentTime,
    duration: musicDuration,
    musicProfile,
    isLoading: isMusicLoading,
    error: musicError,
    autoplayBlocked,
    setQueue,
    playTrack,
    playNext,
    playPrev,
    pauseTrack,
    togglePlayback,
    setVolume: setMusicVolume,
    setMood: setMusicMood,
    updateProgress,
    seekBy,
    toggleAutoPlay,
    playlists,
    activePlaylistId,
    createPlaylist,
    addToPlaylist,
    loadPlaylist,
  } = useMusic();
  const [activeUser, setActiveUser] = useState(() => getActiveUser());
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [journalEntries, setJournalEntries] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [analytics, setAnalytics] = useState({ sessions: 0, checkInDates: [] });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [assistantState, setAssistantState] = useState('Idle');
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const messagesRef = useRef(messages);
  const today = new Date().toISOString().slice(0, 10);

  const voiceOutput = useSpeechOutput(activeUser?.settings?.voicePlaybackEnabled);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!activeUser) {
      setMessages(initialMessages);
      setJournalEntries([]);
      setMoodHistory([]);
      setAnalytics({ sessions: 0, checkInDates: [] });
      setIsHydrated(false);
      return;
    }

    const stored = loadUserAppData(activeUser.id, initialMessages);
    const nextAnalytics = {
      sessions: (stored.analytics?.sessions ?? 0) + 1,
      checkInDates: stored.analytics?.checkInDates ?? [],
    };

    setMessages(stored.chatHistory);
    setJournalEntries(stored.journalEntries);
    setMoodHistory(stored.moodHistory);
    setAnalytics(nextAnalytics);
    setIsHydrated(true);

    persistUserAppData(activeUser.id, { analytics: nextAnalytics }, initialMessages);
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser || !isHydrated) {
      return;
    }

    persistUserAppData(
      activeUser.id,
      {
        chatHistory: messages,
        journalEntries,
        moodHistory,
        analytics,
      },
      initialMessages,
    );
  }, [activeUser, analytics, isHydrated, journalEntries, messages, moodHistory]);

  useEffect(() => {
    if (!activeUser?.settings?.notificationsEnabled || notificationPermission !== 'granted') {
      return;
    }

    const key = `${DAILY_CHECKIN_KEY}.${activeUser.id}`;
    const lastReminder = window.localStorage.getItem(key);

    if (lastReminder === today) {
      return;
    }

    showNotification('MindOrbit check-in', 'How are you feeling today? Take a quiet moment to notice.');
    window.localStorage.setItem(key, today);
  }, [activeUser, notificationPermission, today]);

  const dominantMood = useMemo(() => getMostCommonEmotion(moodHistory), [moodHistory]);
  const latestMood = moodHistory.at(-1)?.mood ?? 'calm';
  const orbMood = getOrbMood(latestMood) === 'neutral' ? 'calm' : getOrbMood(latestMood);
  const moodTrends = useMemo(() => getMoodTrends(moodHistory), [moodHistory]);
  const timePattern = useMemo(() => getTimePattern(moodHistory), [moodHistory]);
  const generatedInsights = useMemo(
    () => generateInsights(moodHistory, journalEntries),
    [journalEntries, moodHistory],
  );
  const personalizedSuggestions = useMemo(
    () => getPersonalizedSuggestions(moodHistory, journalEntries),
    [journalEntries, moodHistory],
  );
  const musicRecommendations = useMemo(() => playlist, [playlist]);
  const timelineItems = useMemo(
    () => createTimelineItems(moodHistory, generatedInsights, journalEntries),
    [generatedInsights, journalEntries, moodHistory],
  );

  useEffect(() => {
    if (!activeUser) {
      return;
    }

    const normalizedMood = latestMood === 'neutral' ? 'calm' : latestMood;
    setMusicMood(normalizedMood, { auto: false });
  }, [activeUser, latestMood, setMusicMood]);

  const metrics = useMemo(
    () => ({
      conversationCount: messages.filter((message) => message.role === 'user').length,
      journalCount: journalEntries.length,
      moodCount: moodHistory.length,
    }),
    [journalEntries.length, messages, moodHistory.length],
  );

  const triggerMoodMusic = (targetMood) => {
    const normalizedTargetMood = targetMood === 'neutral' ? 'calm' : targetMood;
    const tracks = (tracksByMood?.[normalizedTargetMood] ?? playlist ?? []).filter(Boolean);

    expandPlayer();
    setMusicMood(normalizedTargetMood, { auto: false, fromUser: true });

    if (tracks.length) {
      setQueue(tracks, 0, {
        autoplay: true,
        fromUser: true,
        source: 'mood',
        mood: normalizedTargetMood,
      });
      return tracks[0];
    }

    if (currentTrack) {
      playTrack(
        {
          ...currentTrack,
          mood: normalizedTargetMood,
        },
        { fromUser: true, source: 'mood' },
      );
      return currentTrack;
    }

    return null;
  };

  const triggerSongSearch = async (query, fallbackMood) => {
    expandPlayer();
    const tracks = await getMusicByQuery(query, fallbackMood);
    const firstTrack = tracks[0];

    if (!firstTrack) {
      throw new Error('I could not find that track on YouTube right now.');
    }

    setQueue(
      tracks.map((track) => ({
        ...track,
        mood: fallbackMood === 'neutral' ? 'calm' : fallbackMood,
      })),
      0,
      {
        autoplay: true,
        fromUser: true,
        source: 'search',
        mood: fallbackMood,
      },
    );
    return firstTrack;
  };

  const registerMood = (mood, source) => {
    const normalizedMood = mood === 'neutral' ? 'calm' : mood;
    const entry = {
      id: `${source}-${Date.now()}`,
      mood: normalizedMood,
      source,
      timestamp: new Date().toISOString(),
    };

    setMoodHistory((current) => [...current.slice(-49), entry]);
    setAnalytics((current) => ({
      ...current,
      checkInDates: Array.from(new Set([...(current.checkInDates ?? []), today])).slice(-30),
    }));
    setMusicMood(normalizedMood, { auto: source === 'chat' || source === 'journal', fromUser: source === 'chat' });
  };

  const updateAssistantMessage = (messageId, updater) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId
          ? {
              ...message,
              ...updater(message),
            }
          : message,
      ),
    );
  };

  const handleSendMessage = async (content) => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    const detectedMood = analyzeEmotion(trimmed);
    const normalizedMood = detectedMood === 'neutral' ? latestMood || 'calm' : detectedMood;
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    const assistantMessageId = `assistant-${Date.now()}-stream`;

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      },
    ]);
    registerMood(detectedMood, 'chat');
    setChatOpen(true);

    const musicCommand = parseMusicCommand(trimmed, normalizedMood);
    const explicitQuery =
      musicCommand?.type === 'play_query'
        ? musicCommand.query
        : extractResolvedMusicQuery(trimmed);

    if (musicCommand?.type === 'next') {
      playNext({ fromUser: true, wrap: true });
      updateAssistantMessage(assistantMessageId, () => ({
        content: 'Skipped to the next song in your queue.',
        isStreaming: false,
      }));
      return;
    }

    if (musicCommand?.type === 'previous') {
      playPrev({ fromUser: true, forceTrackChange: true });
      updateAssistantMessage(assistantMessageId, () => ({
        content: 'Moved back to the previous song in your queue.',
        isStreaming: false,
      }));
      return;
    }

    if (musicCommand?.type === 'pause') {
      pauseTrack();
      updateAssistantMessage(assistantMessageId, () => ({
        content: 'Paused the player. You can resume whenever you want.',
        isStreaming: false,
      }));
      return;
    }

    if (musicCommand?.type === 'resume') {
      if (!isMusicPlaying) {
        togglePlayback();
      }
      expandPlayer();
      updateAssistantMessage(assistantMessageId, () => ({
        content: 'Resumed your current track in MindOrbit.',
        isStreaming: false,
      }));
      return;
    }

    if (musicCommand?.type === 'open_player') {
      expandPlayer();
      updateAssistantMessage(assistantMessageId, () => ({
        content: 'Opened the full player for you.',
        isStreaming: false,
      }));
      return;
    }

    if (
      musicCommand?.type === 'play_query' ||
      musicCommand?.type === 'play_mood' ||
      shouldHandleMusicRequest(trimmed)
    ) {
      const requestedMusicMood =
        musicCommand?.mood || getRequestedMusicMood(trimmed, normalizedMood);
      expandPlayer();

      try {
        if (explicitQuery) {
          const track = await triggerSongSearch(explicitQuery, requestedMusicMood);
          updateAssistantMessage(assistantMessageId, () => ({
            content: `I found "${track.title}" for you and opened it in the player. You can keep listening from the mini player at the bottom or open the full player for controls.`,
            isStreaming: false,
          }));
        } else {
          triggerMoodMusic(requestedMusicMood);
          expandPlayer();
          updateAssistantMessage(assistantMessageId, () => ({
            content: `I started a ${requestedMusicMood} playlist for you in MindOrbit. You can control it from the mini player at the bottom or open the full player for the complete music view.`,
            isStreaming: false,
          }));
        }
        setAssistantState('Responded');
        setTimeout(() => setAssistantState('Idle'), 1200);
        return;
      } catch (error) {
        triggerMoodMusic(requestedMusicMood);
        updateAssistantMessage(assistantMessageId, () => ({
          content: explicitQuery
            ? `I could not load that exact track right now, so I started a ${requestedMusicMood} mix from MindOrbit's built-in library instead. Use the player controls to pause, jump ahead, or open the full player.`
            : `Live recommendations are unavailable right now, so I started a ${requestedMusicMood} mix from MindOrbit's built-in library instead.`,
          isStreaming: false,
          isError: false,
        }));
        setAssistantState('Needs attention');
        setTimeout(() => setAssistantState('Idle'), 1200);
        return;
      }
    }

    setIsSending(true);
    setAssistantState('Listening...');

    let reply = '';

    try {
      await streamMessageToAI({
        message: trimmed,
        messages: [...messagesRef.current, userMessage],
        onState: (state) => {
          setAssistantState(state);
        },
        onToken: (token) => {
          reply += token;
          updateAssistantMessage(assistantMessageId, (message) => ({
            content: `${message.content}${token}`,
            isStreaming: true,
          }));
        },
        onDone: () => {
          setAssistantState('Responded');
        },
      });

      const finalReply =
        reply.trim() ||
        "I'm here with you. Could you say a little more so I can respond more helpfully?";

      const replySuggestsMusic = detectMusicSuggestionReply(finalReply);
      const requestWasMusic = shouldHandleMusicRequest(trimmed);
      const refusalStyleMusicReply = detectMusicPlaybackRefusal(finalReply);
      let displayReply = finalReply;

      if (requestWasMusic || replySuggestsMusic || refusalStyleMusicReply) {
        const requestedMusicMood = getRequestedMusicMood(
          requestWasMusic ? trimmed : finalReply,
          normalizedMood,
        );

        try {
          if (explicitQuery) {
            const track = await triggerSongSearch(explicitQuery, requestedMusicMood);
            displayReply = `I found "${track.title}" for you and opened it in the player. If audio does not start immediately, tap the green play button once and it will begin in this browser.`;
          } else {
            triggerMoodMusic(requestedMusicMood);
            expandPlayer();
            displayReply = `I opened ${requestedMusicMood} music for you in MindOrbit. If audio does not start immediately, tap the green play button once and it will begin in this browser.`;
          }
        } catch {
          if (replySuggestsMusic || refusalStyleMusicReply || requestWasMusic) {
            triggerMoodMusic(requestedMusicMood);
            expandPlayer();
            displayReply = `I opened the built-in player for you. If audio does not start immediately, tap the green play button once and it will begin in this browser.`;
          }
        }
      }

      updateAssistantMessage(assistantMessageId, () => ({
        content: displayReply,
        isStreaming: false,
      }));

      if (!voiceOutput.hasSpoken(assistantMessageId) && activeUser?.settings?.voicePlaybackEnabled) {
        voiceOutput.speak(displayReply);
        voiceOutput.markSpoken(assistantMessageId);
      }
    } catch (error) {
      updateAssistantMessage(assistantMessageId, () => ({
        content:
          error?.message ||
          'The AI companion could not respond right now. Please try again in a moment.',
        isStreaming: false,
        isError: true,
      }));
      setAssistantState('Needs attention');
    } finally {
      setIsSending(false);
      setTimeout(() => setAssistantState('Idle'), 1200);
    }
  };

  const handleSaveEntry = (entry) => {
    setJournalEntries((current) => [...current, entry]);
    registerMood(entry.mood, 'journal');
  };

  const handleCreateAccount = async (form) => {
    setAuthError('');
    setIsAuthSubmitting(true);
    try {
      const user = await createLocalAccount(form);
      setActiveUser(user);
    } catch (error) {
      setAuthError(error?.message || 'Could not create that account.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignIn = async (form) => {
    setAuthError('');
    setIsAuthSubmitting(true);
    try {
      const user = await signInLocalAccount(form);
      setActiveUser(user);
    } catch (error) {
      setAuthError(error?.message || 'Could not sign you in.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleDemoAccess = async () => {
    setAuthError('');
    setIsAuthSubmitting(true);
    try {
      const user = await signInDemoAccount();
      setActiveUser(user);
    } catch (error) {
      setAuthError(error?.message || 'Could not prepare the demo workspace.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleToggleVoice = (enabled) => {
    if (!activeUser) {
      return;
    }

    const nextUser = updateUserSettings(activeUser.id, {
      voicePlaybackEnabled: enabled,
    });

    if (!enabled) {
      voiceOutput.stop();
    }

    setActiveUser(nextUser);
  };

  const handleToggleNotifications = async (enabled) => {
    if (!activeUser) {
      return;
    }

    let permission = notificationPermission;

    if (enabled && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }

    const nextUser = updateUserSettings(activeUser.id, {
      notificationsEnabled: enabled && permission === 'granted',
      notificationsPermission: permission,
    });
    setActiveUser(nextUser);

    if (enabled && permission === 'granted') {
      showNotification('MindOrbit reminders enabled', 'You will get a gentle check-in when you return.');
    }
  };

  const handleInstall = async () => {
    if (!installPromptEvent) {
      return;
    }

    await installPromptEvent.prompt();
    setInstallPromptEvent(null);
  };

  const handleSignOut = () => {
    signOutLocalAccount();
    voiceOutput.stop();
    pauseTrack();
    setActiveUser(null);
    setChatOpen(false);
  };

  if (!activeUser) {
    return (
      <AuthShell
        onCreateAccount={handleCreateAccount}
        onSignIn={handleSignIn}
        onDemoAccess={handleDemoAccess}
        isSubmitting={isAuthSubmitting}
        error={authError}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070F] text-white">
      <CursorGlow />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,80,255,0.2),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(55,176,255,0.12),transparent_20%),linear-gradient(180deg,#05070F_0%,#060A13_46%,#091220_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:88px_88px] opacity-25" />

      <main className="relative z-10 pb-32">
        <Suspense fallback={null}>
          <Hero3D
            mood={orbMood}
            active={isSending}
            aiState={assistantState}
            musicProfile={musicProfile}
            currentTrack={currentTrack}
            isMusicPlaying={isMusicPlaying}
            onOpenMusic={expandPlayer}
            chatOpen={chatOpen}
            onStartConversation={() => setChatOpen(true)}
          />
        </Suspense>

        <section className="mx-auto w-full max-w-[1600px] px-6 pb-10 sm:px-10 lg:px-16">
          <MusicPlayer
            mood={musicMood}
            currentTrack={currentTrack}
            recommendations={musicRecommendations}
            tracksByMood={tracksByMood}
            isLoading={isMusicLoading}
            error={musicError}
            autoPlayEnabled={autoPlayEnabled}
            onToggleAutoPlay={toggleAutoPlay}
            onPlayTrack={(track) => playTrack(track, { fromUser: true })}
          />
        </section>

        <section className="mx-auto w-full max-w-[1600px] px-6 pb-10 sm:px-10 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.52fr)]">
            <InsightTimeline items={timelineItems} />

            <div className="grid content-start gap-6">
              <MoodInsightCard
                eyebrow="Behavioral Insight"
                title="Designed for clarity, not overwhelm"
                description={`Your most common recent state has been ${dominantMood}. ${timePattern ? `A stronger pattern appears during the ${timePattern}.` : 'MindOrbit is still learning your daily rhythm.'}`}
                tone="soft"
              />
              <MoodInsightCard
                eyebrow="AI Observation"
                title={generatedInsights[0] ?? 'Your patterns are still unfolding'}
                description={
                  generatedInsights[1] ??
                  'As you keep journaling and checking in, MindOrbit will respond with more personalized guidance.'
                }
                tone="accent"
              />
              <CompanionConsole
                user={activeUser}
                metrics={metrics}
                settings={activeUser.settings}
                installAvailable={Boolean(installPromptEvent)}
                notificationPermission={notificationPermission}
                onInstall={handleInstall}
                onToggleVoice={handleToggleVoice}
                onToggleNotifications={handleToggleNotifications}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1600px] px-6 pb-12 sm:px-10 lg:px-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
            <Journal entries={journalEntries} onSaveEntry={handleSaveEntry} />

            <div className="grid content-start gap-6">
              <div className="rounded-[32px] border border-white/10 bg-white/6 p-5 backdrop-blur-2xl sm:p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/56">
                  Insight Dashboard
                </p>
                <div className="mt-5 space-y-4">
                  {personalizedSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion}
                      whileHover={{ y: -3, boxShadow: '0 18px 38px rgba(3,9,23,0.22)' }}
                      className="rounded-[22px] border border-white/8 bg-slate-950/22 px-4 py-4 text-sm leading-7 text-slate-100/76"
                    >
                      <span className="mr-2 text-cyan-200/70">0{index + 1}</span>
                      {suggestion}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 rounded-[24px] border border-white/8 bg-slate-950/22 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/56">
                    Mood Trends
                  </p>
                  <div className="mt-4 space-y-3">
                    {moodTrends.map((point) => (
                      <div
                        key={point.day}
                        className="grid grid-cols-[52px_1fr_74px] items-center gap-3"
                      >
                        <span className="text-xs uppercase tracking-[0.18em] text-white/56">
                          {point.day}
                        </span>
                        <div className="h-2 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400"
                            style={{ width: `${((point.score ?? 1) / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-right text-xs capitalize text-slate-200/66">
                          {point.mood}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-6 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/56">
                  Continue with MindOrbit
                </p>
                <h2 className="mt-3 max-w-md text-3xl font-medium text-white">
                  A private space for clearer patterns and calmer decisions.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-200/70">
                  Return whenever you need a softer perspective. MindOrbit keeps the
                  experience structured, calm, and always judgment-free across devices.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 18px 42px rgba(70,130,255,0.28)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setChatOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 px-6 py-3 text-sm font-medium text-white"
                  >
                    Start Conversation
                  </motion.button>
                  <motion.a
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    href="#timeline"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 px-6 py-3 text-sm font-medium text-white/82"
                  >
                    See Your Mind Timeline
                  </motion.a>
                </div>
              </section>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {chatOpen && (
            <Suspense fallback={null}>
              <ChatPanel
                activeUser={activeUser}
                messages={messages}
                isSending={isSending}
                aiState={assistantState}
                currentTrack={currentTrack}
                isMusicPlaying={isMusicPlaying}
                musicAutoplayBlocked={autoplayBlocked}
                onClose={() => setChatOpen(false)}
                onSendMessage={handleSendMessage}
                onTogglePlayback={togglePlayback}
                onSeekBack={() => seekBy(-10)}
                onSeekForward={() => seekBy(10)}
                onOpenMusic={expandPlayer}
                suggestions={['I feel anxious', 'I feel lost', "Can't sleep", ...personalizedSuggestions].slice(0, 5)}
                voicePlaybackEnabled={activeUser.settings.voicePlaybackEnabled}
                onToggleVoicePlayback={handleToggleVoice}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </main>

        {!chatOpen ? (
          <MiniPlayer
            currentTrack={currentTrack}
            isPlaying={isMusicPlaying}
            progress={musicProgress}
            volume={musicVolume}
            autoplayBlocked={autoplayBlocked}
            onTogglePlayback={togglePlayback}
            onSkipBack={() => playPrev({ fromUser: true, forceTrackChange: true })}
            onSkipForward={() => playNext({ fromUser: true, wrap: true })}
            onOpenPanel={expandPlayer}
            onVolumeChange={setMusicVolume}
          />
        ) : null}

        <MusicPanel
          open={musicPanelOpen}
          currentTrack={currentTrack}
          currentIndex={currentIndex}
          isPlaying={isMusicPlaying}
          playlist={playlist}
          queue={queue}
          progress={musicProgress}
          volume={musicVolume}
          autoplayBlocked={autoplayBlocked}
          autoPlayEnabled={autoPlayEnabled}
          mood={musicMood}
          currentTime={musicCurrentTime}
          duration={musicDuration}
          playlists={playlists}
          activePlaylistId={activePlaylistId}
          onClose={collapsePlayer}
          onTogglePlayback={togglePlayback}
          onSkipBack={() => playPrev({ fromUser: true, forceTrackChange: true })}
          onSkipForward={() => playNext({ fromUser: true, wrap: true })}
          onSeek={updateProgress}
          onVolumeChange={setMusicVolume}
          onToggleAutoPlay={toggleAutoPlay}
          onPlayTrack={(trackOrIndex) => playTrack(trackOrIndex, { fromUser: true })}
          onCreatePlaylist={createPlaylist}
          onAddToPlaylist={addToPlaylist}
          onLoadPlaylist={(playlistId) => loadPlaylist(playlistId, { fromUser: true })}
        />
      </div>
  );
}
