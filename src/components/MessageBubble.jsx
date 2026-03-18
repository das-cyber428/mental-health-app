import { motion } from 'framer-motion';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] rounded-[22px] px-4 py-4 shadow-[0_14px_28px_rgba(3,9,23,0.18)] sm:px-5 ${
          isUser
            ? 'rounded-br-md bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 text-white'
            : 'rounded-bl-md border border-white/8 bg-[rgba(19,24,39,0.92)] text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_16px_36px_rgba(20,60,120,0.12)]'
        }`}
      >
        <p className={`whitespace-pre-wrap ${isUser ? 'text-sm leading-[1.6]' : 'text-[15px] leading-[1.7] sm:text-base'}`}>
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}
