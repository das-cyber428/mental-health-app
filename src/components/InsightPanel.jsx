import { motion } from 'framer-motion';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const moodLabels = {
  1: 'Anxious',
  2: 'Sad',
  3: 'Neutral',
  4: 'Happy',
};

export default function InsightPanel({
  trends,
  insights,
  dominantMood,
  timePattern,
  personalizedSuggestions,
}) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/7 p-5 backdrop-blur-2xl sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/60">
            AI Insight Dashboard
          </p>
          <h2 className="mt-2 text-2xl font-medium text-white">Patterns with compassion</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-200/68">
            Seven-day mood trends, emotional rhythm detection, and gentle AI
            observations that feel reflective rather than clinical.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm text-white/84">
            Most common: <span className="capitalize text-cyan-100">{dominantMood}</span>
          </div>
          <div className="rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm text-white/84">
            Pattern: <span className="capitalize text-cyan-100">{timePattern ?? 'emerging'}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/28 p-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 16, right: 16, left: -18, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis
                  domain={[1, 4]}
                  tickFormatter={(value) => moodLabels[value]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  width={64}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.92)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                    color: '#fff',
                  }}
                  formatter={(value) => moodLabels[Math.round(value)]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  connectNulls
                  stroke="#63d8ff"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#9a7bff', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[24px] border border-white/10 bg-white/6 p-4"
            >
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/56">
                Insight {index + 1}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-100/76">{insight}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {personalizedSuggestions.map((suggestion, index) => (
          <div
            key={suggestion}
            className="rounded-[24px] border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/56">
              Suggestion {index + 1}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-100/76">{suggestion}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
