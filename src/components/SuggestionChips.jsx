import { motion } from 'framer-motion';

export default function SuggestionChips({ suggestions, onSelect }) {
  if (!suggestions?.length) {
    return null;
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {suggestions.map((item) => (
          <motion.button
            key={item}
            whileHover={{ y: -2, boxShadow: '0 12px 24px rgba(36,98,255,0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(item)}
            className="rounded-full border border-white/10 bg-[rgba(19,24,39,0.78)] px-3 py-2 text-xs text-cyan-50/78 backdrop-blur-xl transition hover:border-cyan-200/26 hover:text-white sm:px-4"
          >
            {item}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
