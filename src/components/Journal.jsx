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

export default function Journal({ entries, onSaveEntry }) {
  const [draft, setDraft] = useState('');
  const [preview, setPreview] = useState(null);

  const sortedEntries = useMemo(() => [...entries].reverse().slice(0, 3), [entries]);

  const handleAnalyze = () => {
    if (!draft.trim()) {
      return;
    }

    const mood = analyzeEmotion(draft);
    const keywords = extractKeywords(draft);
    const questions = generateReflectionQuestions(draft, mood);

    setPreview({
      mood,
      keywords,
      questions,
      highlighted: highlightKeywords(draft),
    });
  };

  const handleSave = () => {
    if (!draft.trim()) {
      return;
    }

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
    <section className="rounded-[32px] border border-white/10 bg-white/7 p-5 backdrop-blur-2xl sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/60">
            Smart Journal
          </p>
          <h2 className="mt-2 text-2xl font-medium text-white">Reflect with context</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-200/68">
            Save timestamped entries, surface emotional keywords, and let the
            companion offer softer follow-up questions.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            className="rounded-full border border-white/12 bg-white/7 px-5 py-3 text-sm text-white/82 transition hover:bg-white/10"
          >
            Analyze emotion
          </button>
          <button
            onClick={handleSave}
            className="rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-teal-400 px-5 py-3 text-sm font-medium text-white shadow-[0_16px_40px_rgba(73,112,255,0.28)]"
          >
            Save entry
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/28 p-4">
          <textarea
            rows="10"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What felt loud, tender, or unexpectedly steady today?"
            className="min-h-[240px] w-full resize-none rounded-[24px] border border-white/10 bg-slate-950/35 px-4 py-4 text-sm leading-8 text-white outline-none placeholder:text-slate-300/34 focus:border-cyan-300/40"
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/28 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/60">
              Emotion Snapshot
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm capitalize text-white">
                {preview?.mood ?? 'neutral'}
              </div>
              <div className="flex flex-wrap gap-2">
                {(preview?.keywords ?? []).slice(0, 4).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-cyan-200/14 bg-cyan-300/8 px-3 py-1 text-xs text-cyan-50/70"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="mt-4 rounded-[20px] border border-white/8 bg-white/5 p-4 text-sm leading-7 text-slate-100/72"
              dangerouslySetInnerHTML={{
                __html:
                  preview?.highlighted ??
                  'Your emotional highlights will appear here after you analyze a reflection.',
              }}
            />
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/28 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/60">
              Reflection Questions
            </p>
            <div className="mt-4 space-y-3">
              {(preview?.questions ?? [
                'What made you feel this way?',
                'What would help tomorrow feel kinder?',
                'What support do you need from yourself tonight?',
              ]).map((question) => (
                <motion.div
                  key={question}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-100/78"
                >
                  {question}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {sortedEntries.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-200/68 lg:col-span-3">
            Your saved reflections will appear here with timestamps, emotional
            analysis, and keywords.
          </div>
        ) : (
          sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[24px] border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.24em] text-cyan-100/56">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs capitalize text-white/82">
                  {entry.mood}
                </span>
              </div>
              <p className="mt-4 max-h-[9rem] overflow-hidden text-sm leading-7 text-slate-100/76">
                {entry.text}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(entry.keywords ?? []).slice(0, 4).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-cyan-200/14 bg-cyan-300/8 px-3 py-1 text-[11px] text-cyan-50/70"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
