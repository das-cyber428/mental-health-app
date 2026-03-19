import { motion } from 'framer-motion';

export default function GestureSheet({ children, onClose }) {
  return (
    <motion.section
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.22 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 120 || info.velocity.y > 900) {
          onClose?.();
        }
      }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      className="absolute inset-x-0 bottom-0 rounded-t-[36px] border border-white/10 bg-[rgba(8,12,24,0.96)] shadow-[0_-24px_80px_rgba(2,8,23,0.55)] md:left-auto md:right-6 md:top-6 md:w-[460px] md:rounded-[32px]"
    >
      <div className="flex justify-center pt-3 md:hidden">
        <div className="h-1.5 w-12 rounded-full bg-white/14" />
      </div>
      {children}
    </motion.section>
  );
}
