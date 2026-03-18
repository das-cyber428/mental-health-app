import { AnimatePresence, motion } from 'framer-motion';
import MessageBubble from './MessageBubble';

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{
            duration: 1.1,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.12,
            ease: 'easeInOut',
          }}
          className="h-2 w-2 rounded-full bg-cyan-100/80"
        />
      ))}
    </div>
  );
}

export default function ChatContainer({ messages, isSending, scrollRef }) {
  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-[24px] border border-white/8 bg-[rgba(8,12,24,0.82)] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-4"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      <AnimatePresence>
        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex justify-start"
          >
            <div className="max-w-[75%] rounded-[22px] rounded-bl-md border border-white/8 bg-[rgba(19,24,39,0.92)] px-4 py-4 text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_16px_36px_rgba(20,60,120,0.12)]">
              <div className="mb-3 flex items-center gap-3">
                <TypingDots />
              </div>
              <p className="text-[15px] leading-[1.6] text-slate-200/84">Thinking...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
