import { motion } from 'framer-motion';

export default function MoodInsightCard({ eyebrow, title, description, tone = 'default' }) {
  const tones = {
    default: 'from-white/8 to-white/4',
    accent: 'from-cyan-400/10 to-white/4',
    soft: 'from-violet-400/10 to-white/4',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45 }}
      className={`rounded-[28px] border border-white/10 bg-gradient-to-b ${tones[tone] ?? tones.default} p-5 backdrop-blur-2xl`}
    >
      <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/56">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-medium text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-200/70">{description}</p>
    </motion.div>
  );
}
