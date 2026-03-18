import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CursorGlow from './components/CursorGlow';
import Hero3D from './components/Hero3D';
import InsightTimeline from './components/InsightTimeline';
import Journal from './components/Journal';
import MoodInsightCard from './components/MoodInsightCard';
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

const ChatPanel = lazy(() => import('./components/ChatPanel'));

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "I'm here for you. Share what feels heavy, and we'll move through it with a little more calm.",
  },
];

function createTimelineItems(moodHistory, insights, journalEntries) {
  const moodDescriptions = {
    anxious: 'You tend to feel more anxious late at night, when thoughts become louder and the day is finally quiet.',
    sad: 'A heavier emotional tone has been showing up lately. Slower reflection and gentler routines may help.',
    happy: 'There are moments of steadier energy returning. Notice what supported them and what helped them stay.',
    calm: 'Your nervous system seems more settled here. These moments can become anchors for more difficult days.',
    neutral: 'Your emotional baseline is relatively even. This creates a useful reference point for noticing subtle shifts.',
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
    if (!isHydrated) return;
    persistChatHistory(messages);
  }, [isHydrated, messages]);

  useEffect(() => {
    if (!isHydrated) return;
    persistJournalEntries(journalEntries);
  }, [isHydrated, journalEntries]);

  useEffect(() => {
    if (!isHydrated) return;
    persistMoodHistory(moodHistory);
  }, [isHydrated, moodHistory]);

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
  const timelineItems = useMemo(
    () => createTimelineItems(moodHistory, generatedInsights, journalEntries),
    [generatedInsights, journalEntries, moodHistory],
  );

  const registerMood = (mood, source) => {
    const normalizedMood = mood === 'neutral' ? 'calm' : mood;
    const entry = {
      id: `${source}-${Date.now()}`,
      mood: normalizedMood,
      source,
      timestamp: new Date().toISOString(),
    };
    setMoodHistory((current) => [...current.slice(-49), entry]);
  };

  const handleSendMessage = async (content) => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

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
      const reply = await sendMessageToAI(trimmed, [...messages, userMessage]);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content:
            error?.message ||
            'I had trouble reaching the AI service just now. Please try again in a moment.',
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
    <div className="relative min-h-screen overflow-hidden bg-[#05070F] text-white">
      <CursorGlow />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,80,255,0.2),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(55,176,255,0.12),transparent_20%),linear-gradient(180deg,#05070F_0%,#060A13_46%,#091220_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:88px_88px] opacity-25" />

      <main className="relative z-10">
        <Hero3D
          mood={orbMood}
          active={isSending}
          chatOpen={chatOpen}
          onStartConversation={() => setChatOpen(true)}
        />

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
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/56">
                  Feature Layer
                </p>
                <div className="mt-4 grid gap-3">
                  {[
                    {
                      title: 'AI Companion',
                      body: 'A listening interface that responds softly and keeps context over time.',
                    },
                    {
                      title: 'Journal Intelligence',
                      body: 'Write once, then see mood, keywords, and questions that deepen reflection.',
                    },
                    {
                      title: 'Insight Cards',
                      body: 'Minimal summaries that make your patterns feel understandable, not clinical.',
                    },
                  ].map((item) => (
                    <motion.div
                      key={item.title}
                      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(3,9,23,0.26)' }}
                      className="rounded-[22px] border border-white/8 bg-slate-950/22 p-4"
                    >
                      <h3 className="text-base font-medium text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-200/68">{item.body}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
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
                      <div key={point.day} className="grid grid-cols-[52px_1fr_74px] items-center gap-3">
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
                  experience structured, calm, and always judgment-free.
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
                messages={messages}
                isSending={isSending}
                onClose={() => setChatOpen(false)}
                onSendMessage={handleSendMessage}
                suggestions={['I feel anxious', 'I feel lost', ...personalizedSuggestions].slice(0, 4)}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
