import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CursorGlow from './components/CursorGlow';
import FloatingInfoCard from './components/FloatingInfoCard';
import InsightPanel from './components/InsightPanel';
import Journal from './components/Journal';
import {
  analyzeEmotion,
  generateInsights,
  getMostCommonEmotion,
  getMoodTrends,
  getOrbMood,
  getPersonalizedSuggestions,
  getTimePattern,
  loadAppData,
  persistChatHistory,
  persistJournalEntries,
  persistMoodHistory,
} from './components/MoodTracker';
import { sendMessageToAI } from './lib/chat';

const HeroCanvas = lazy(() => import('./components/HeroCanvas'));
const ChatUI = lazy(() => import('./components/ChatUI'));

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "I'm here with you. Share what is feeling heavy, and we'll slow it down together.",
  },
];

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [journalEntries, setJournalEntries] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = loadAppData(initialMessages);
    setMessages(stored.chatHistory);
    setJournalEntries(stored.journalEntries);
    setMoodHistory(stored.moodHistory);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    persistChatHistory(messages);
  }, [isHydrated, messages]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    persistJournalEntries(journalEntries);
  }, [isHydrated, journalEntries]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    persistMoodHistory(moodHistory);
  }, [isHydrated, moodHistory]);

  const dominantMood = useMemo(() => getMostCommonEmotion(moodHistory), [moodHistory]);
  const latestMood = moodHistory.at(-1)?.mood ?? 'neutral';
  const orbMood = getOrbMood(latestMood);
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

  const stats = useMemo(
    () => [
      {
        eyebrow: 'Emotion Aware',
        title: `Orb state: ${orbMood}`,
        body: 'The AI orb now adjusts its glow and breathing rhythm to mirror your latest emotional signal.',
        className: 'top-[10%] left-[6%] hidden 2xl:block',
      },
      {
        eyebrow: 'Living Journal',
        title: `${journalEntries.length} saved reflections`,
        body: 'Your entries are timestamped, analyzed gently, and used to generate follow-up prompts and patterns.',
        className: 'bottom-[10%] left-[8%] hidden 2xl:block',
      },
      {
        eyebrow: 'Pattern Detection',
        title: `Most common emotion: ${dominantMood}`,
        body: 'Mood trends, time-based insight, and personalized suggestions are now woven into the experience.',
        className: 'top-[16%] right-[12%] hidden 2xl:block',
      },
    ],
    [dominantMood, journalEntries.length, orbMood],
  );

  const registerMood = (mood, source) => {
    const entry = {
      id: `${source}-${Date.now()}`,
      mood,
      source,
      timestamp: new Date().toISOString(),
    };

    setMoodHistory((current) => [...current.slice(-49), entry]);
  };

  const handleSendMessage = async (content) => {
    const trimmed = content.trim();
    if (!trimmed || isSending) {
      return;
    }

    const detectedMood = analyzeEmotion(trimmed);
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    registerMood(detectedMood, 'chat');
    setIsSending(true);

    try {
      const reply = await sendMessageToAI(trimmed);

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveEntry = (entry) => {
    setJournalEntries((current) => [...current, entry]);
    registerMood(entry.mood, 'journal');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <CursorGlow />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(121,92,255,0.24),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(50,203,255,0.18),transparent_24%),linear-gradient(160deg,#050816_0%,#090d1d_48%,#071322_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />

      <main className="relative z-10 min-h-screen">
        <section className="relative min-h-screen overflow-hidden">
          <Suspense fallback={null}>
            <HeroCanvas mood={orbMood} onOrbClick={() => setChatOpen(true)} />
          </Suspense>

          <div className="pointer-events-none absolute inset-0">
            {stats.map((item) => (
              <FloatingInfoCard key={item.title} {...item} />
            ))}
          </div>

          <div className="relative z-20 flex min-h-screen items-center px-6 py-10 sm:px-10 lg:px-16">
            <div className="w-full max-w-[1600px]">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-[min(720px,100%)] pb-8 pr-0 xl:pr-[28rem] 2xl:pr-[34rem]"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100/75 backdrop-blur-xl">
                  AI Mental Health Companion
                </div>

                <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl 2xl:max-w-2xl">
                  I&apos;m here for you.
                </h1>

                <p className="mt-6 max-w-xl text-base leading-8 text-slate-200/78 sm:text-lg 2xl:max-w-2xl">
                  A calmer, emotionally intelligent companion that remembers your
                  reflections, notices patterns softly, and responds with
                  personalized support.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setChatOpen(true)}
                    className="inline-flex items-center justify-center rounded-full border border-cyan-200/20 bg-gradient-to-r from-violet-500 via-blue-500 to-teal-400 px-7 py-3 text-sm font-medium text-white shadow-[0_10px_45px_rgba(72,113,255,0.45)]"
                  >
                    Open Companion
                  </motion.button>

                  <motion.a
                    whileHover={{ x: 3 }}
                    href="#insights"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-7 py-3 text-sm font-medium text-white/84 backdrop-blur-xl"
                  >
                    View insights
                  </motion.a>
                </div>

                <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
                  {[
                    'Mood-aware 3D orb',
                    'AI reflection questions',
                    'Persistent personal insights',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-3xl border border-white/10 bg-white/6 px-5 py-4 text-sm text-slate-200/80 backdrop-blur-2xl"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {chatOpen && (
              <Suspense fallback={null}>
                <ChatUI
                  messages={messages}
                  isSending={isSending}
                  onClose={() => setChatOpen(false)}
                  onSendMessage={handleSendMessage}
                  suggestions={personalizedSuggestions}
                />
              </Suspense>
            )}
          </AnimatePresence>
        </section>

        <section
          id="insights"
          className="relative z-20 mx-auto w-full max-w-[1600px] px-6 pb-20 sm:px-10 lg:px-16"
        >
          <div className="grid gap-8">
            <InsightPanel
              trends={moodTrends}
              insights={generatedInsights}
              dominantMood={dominantMood}
              timePattern={timePattern}
              personalizedSuggestions={personalizedSuggestions}
            />
            <Journal entries={journalEntries} onSaveEntry={handleSaveEntry} />
          </div>
        </section>
      </main>
    </div>
  );
}
