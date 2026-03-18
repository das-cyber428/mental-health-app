import { motion } from 'framer-motion';

export default function FloatingInfoCard({
  eyebrow,
  title,
  body,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 1.1 },
        y: { duration: 9, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
      }}
      className={`absolute max-w-xs rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-2xl ${className}`}
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/56">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-lg font-medium text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-200/70">{body}</p>
    </motion.div>
  );
}
