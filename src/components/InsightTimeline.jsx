import { motion } from 'framer-motion';

const moodMeta = {
  happy: { icon: 'G', tone: 'bg-emerald-400/16 text-emerald-200' },
  calm: { icon: 'C', tone: 'bg-cyan-400/16 text-cyan-200' },
  neutral: { icon: 'N', tone: 'bg-slate-300/14 text-slate-200' },
  sad: { icon: 'S', tone: 'bg-violet-400/16 text-violet-200' },
  anxious: { icon: 'A', tone: 'bg-rose-400/16 text-rose-200' },
};

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function InsightTimeline({ items }) {
  return (
    <section
      id="timeline"
      className="rounded-[32px] border border-white/10 bg-white/6 p-5 backdrop-blur-2xl sm:p-6"
    >
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/60">
          Mind Timeline
        </p>
        <h2 className="mt-2 text-3xl font-medium text-white">
          A calm record of what your inner world has been saying
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-200/68">
          Structured like a changelog, but designed for emotional clarity. Each
          entry captures a shift, a pattern, or a moment worth noticing.
        </p>
      </div>

      <div className="relative mt-8 space-y-6 before:absolute before:left-[17px] before:top-0 before:h-full before:w-px before:bg-white/10">
        {items.map((item, index) => {
          const meta = moodMeta[item.mood] ?? moodMeta.neutral;
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.04 }}
              className="relative pl-12"
            >
              <div
                className={`absolute left-0 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 ${meta.tone}`}
              >
                <span className="text-xs font-medium">{meta.icon}</span>
              </div>

              <motion.div
                whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(3,9,23,0.34)' }}
                className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[0_18px_50px_rgba(2,8,23,0.3)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs uppercase tracking-[0.26em] text-cyan-100/56">
                    {formatDate(item.timestamp)} · {formatTime(item.timestamp)}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] capitalize tracking-[0.2em] text-white/70">
                    {item.mood}
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-medium text-white">{item.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100/72">
                  {item.description}
                </p>
              </motion.div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
