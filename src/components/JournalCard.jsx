import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  analyzeEmotion,
  extractKeywords,
  generateReflectionQuestions,
  highlightKeywords,
} from './MoodTracker';

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function JournalCard({ entries, onSaveEntry }) {
  const [draft, setDraft] = useState('');
  const [preview, setPreview] = useState(null);
  const recentEntries = useMemo(() => [...entries].reverse().slice(0, 2), [entries]);

  const handleAnalyze = () => {
    if (!draft.trim()) return;
    const mood = analyzeEmotion(draft);
    const keywords = extractKeywords(draft);
    const questions = generateReflectionQuestions(draft, mood);
    setPreview({ mood, keywords, questions, highlighted: highlightKeywords(draft) });
  };

  const handleSave = () => {
    if (!draft.trim()) return;
    const mood = analyzeEmotion(draft);
    const keywords = extractKeywords(draft);
    const questions = generateReflectionQuestions(draft, mood);
    onSaveEntry({
      id: `journal-${Date.now()}`,
      text: draft.trim(),
      mood,
      keywords,
      questions,
      timestamp: new Date().toISOString(),
    });
    setDraft('');
    setPreview(null);
  };

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/6 p-5 backdrop-blur-2xl sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/60">
            Smart Journal
          </p>
          <h2 className="mt-2 text-3xl font-medium text-white">
            Write softly. See what your mind has been carrying.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-200/68">
            A clean writing space with gentle AI analysis, highlighted emotional
            phrases, and reflection prompts that help clarity arrive without
            pressure.
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/82 transition hover:bg-white/9"
          >
            Analyze
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 18px 42px rgba(70,130,255,0.28)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-teal-400 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_36px_rgba(72,113,255,0.26)]"
          >
            Save Journal
          </motion.button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <motion.div
          whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(3,9,23,0.28)' }}
          className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4"
        >
          <textarea
            rows="10"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What is moving through you today?"
            className="min-h-[280px] w-full resize-none rounded-[24px] border border-white/10 bg-slate-950/28 px-5 py-5 text-sm leading-8 text-white outline-none placeholder:text-slate-300/32 focus:border-cyan-300/35"
          />
        </motion.div>

        <div className="space-y-4">
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(3,9,23,0.28)' }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/56">AI Highlights</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm capitalize text-white/86">
                {preview?.mood ?? 'calm'}
              </span>
              {(preview?.keywords ?? []).slice(0, 4).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-cyan-200/12 bg-cyan-200/8 px-3 py-1 text-xs text-cyan-50/70"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div
              className="mt-4 rounded-[22px] border border-white/8 bg-slate-950/26 p-4 text-sm leading-7 text-slate-100/74"
              dangerouslySetInnerHTML={{
                __html:
                  preview?.highlighted ??
                  'Detected mood, meaningful phrases, and emotional themes will appear here.',
              }}
            />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(3,9,23,0.28)' }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/56">
              Reflection Prompts
            </p>
            <div className="mt-4 space-y-3">
              {(preview?.questions ?? [
                'What triggered this feeling?',
                'What might help tomorrow?',
                'What would make tonight feel more settled?',
              ]).map((question) => (
                <motion.div
                  key={question}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="rounded-[20px] border border-white/8 bg-slate-950/24 px-4 py-3 text-sm leading-7 text-slate-100/76"
                >
                  {question}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {recentEntries.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-200/68 lg:col-span-2">
            Your saved reflections will appear here with time, tone, and context.
          </div>
        ) : (
          recentEntries.map((entry) => (
            <motion.div
              key={entry.id}
              whileHover={{ y: -3, boxShadow: '0 18px 36px rgba(3,9,23,0.22)' }}
              className="rounded-[24px] border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.24em] text-cyan-100/56">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs capitalize text-white/80">
                  {entry.mood}
                </span>
              </div>
              <p className="mt-4 max-h-[9rem] overflow-hidden text-sm leading-7 text-slate-100/74">
                {entry.text}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
