import { motion } from 'framer-motion';

function StreamingCursor() {
  return (
    <motion.span
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      className="ml-1 inline-block h-4 w-2 rounded-full bg-cyan-200/80 align-middle"
    />
  );
}

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
        className={`max-w-[78%] rounded-[22px] px-4 py-4 shadow-[0_14px_28px_rgba(3,9,23,0.18)] sm:px-5 ${
          isUser
            ? 'rounded-br-md bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 text-white'
            : message.isError
              ? 'rounded-bl-md border border-rose-300/12 bg-rose-400/8 text-rose-50 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_16px_36px_rgba(120,20,60,0.12)]'
              : 'rounded-bl-md border border-white/8 bg-[rgba(19,24,39,0.92)] text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_16px_36px_rgba(20,60,120,0.12)]'
        }`}
      >
        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/42">
          <span>{isUser ? 'You' : 'MindOrbit'}</span>
          {message.timestamp ? (
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
          ) : null}
        </div>
        <p
          className={`whitespace-pre-wrap ${
            isUser ? 'text-sm leading-[1.6]' : 'text-[15px] leading-[1.7] sm:text-base'
          }`}
        >
          {message.content}
          {message.isStreaming ? <StreamingCursor /> : null}
        </p>
      </div>
    </motion.div>
  );
}
