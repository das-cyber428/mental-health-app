import { Suspense, lazy } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

const HeroCanvas = lazy(() => import('./HeroCanvas'));

const statusSteps = ['Listening...', 'Thinking...', 'Responding...'];

export default function Hero3D({
  mood,
  active,
  aiState,
  musicProfile,
  currentTrack,
  isMusicPlaying,
  chatOpen,
  onStartConversation,
  onOpenMusic,
}) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.8 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.8 });
  const orbTransform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0)`;

  const handlePointerMove = (event) => {
    const { currentTarget, clientX, clientY } = event;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((clientY - rect.top) / rect.height - 0.5) * 18;
    pointerX.set(x);
    pointerY.set(y);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-[1600px] items-center gap-12 px-6 py-8 sm:px-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.98fr)] lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-2xl"
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-cyan-100/70 backdrop-blur-xl">
          MindOrbit
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="mt-8 max-w-xl text-5xl font-semibold leading-[0.92] text-white sm:text-6xl xl:text-7xl"
        >
          I&apos;m here for you.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16 }}
          className="mt-6 max-w-xl text-xl leading-9 text-slate-200/76"
        >
          A quiet space where your thoughts are heard, patterns are understood,
          and clarity begins.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="mt-6 max-w-xl text-base leading-8 text-slate-300/70"
        >
          MindOrbit now streams replies in real time, remembers your reflections per
          account, and adapts across chat, voice, journaling, and installable mobile use.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 20px 55px rgba(70,130,255,0.38)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartConversation}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 px-7 py-3 text-sm font-medium text-white shadow-[0_18px_45px_rgba(72,113,255,0.32)]"
          >
            Start Conversation
          </motion.button>
          <motion.a
            whileHover={{ y: -1, boxShadow: '0 16px 38px rgba(12,18,30,0.32)' }}
            whileTap={{ scale: 0.97 }}
            href="#timeline"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-medium text-white/82 backdrop-blur-xl"
          >
            See Your Mind Timeline
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex flex-col gap-2 text-sm text-slate-300/64"
        >
          <span>Private. Secure. Always judgment-free.</span>
          <span>Designed for clarity, not overwhelm.</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.48 }}
          className="mt-12 grid gap-4 sm:grid-cols-3"
        >
          {[
            'Streaming replies that arrive token by token',
            'Voice input and playback for calmer hands-free support',
            'Per-user insights, check-ins, and installable mobile behavior',
          ].map((item) => (
            <motion.div
              key={item}
              whileHover={{ y: -4, boxShadow: '0 18px 42px rgba(8,12,26,0.35)' }}
              className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200/72 backdrop-blur-xl"
            >
              {item}
            </motion.div>
          ))}
        </motion.div>

        {currentTrack ? (
          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.56 }}
            whileHover={{ y: -3, boxShadow: '0 18px 42px rgba(8,12,26,0.35)' }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onOpenMusic}
            className="mt-6 flex w-full max-w-xl items-center gap-4 rounded-[26px] border border-white/10 bg-white/6 p-3 text-left backdrop-blur-xl"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-[18px] border border-white/10">
              <motion.img
                animate={isMusicPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  isMusicPlaying
                    ? { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }
                    : { duration: 0.4 }
                }
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/56">
                Mood Music
              </p>
              <p className="mt-2 truncate text-base font-medium text-white">{currentTrack.title}</p>
              <p className="truncate text-xs uppercase tracking-[0.18em] text-cyan-100/58">
                {currentTrack.artist}
              </p>
            </div>
            <div className="shrink-0 rounded-full border border-cyan-200/18 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-50">
              {isMusicPlaying ? 'Playing' : 'Open'}
            </div>
          </motion.button>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <div className="absolute inset-0 rounded-[38px] bg-[radial-gradient(circle_at_20%_20%,rgba(124,92,255,0.22),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(45,212,191,0.12),transparent_28%)] blur-3xl" />
        <motion.div
          style={{ transform: orbTransform }}
          animate={{
            filter: chatOpen ? 'blur(5px) saturate(0.85)' : 'blur(0px) saturate(1)',
            opacity: chatOpen ? 0.55 : 1,
            scale: chatOpen ? 0.96 : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] shadow-[0_35px_90px_rgba(2,8,23,0.55)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.28em] text-cyan-100/54">
            <span>Responsive Orb</span>
            <span className="capitalize text-white/72">{mood}</span>
          </div>
          <div className="relative h-[420px] sm:h-[520px] lg:h-[760px]">
            <Suspense fallback={null}>
              <HeroCanvas
                mood={mood}
                active={active}
                aiState={aiState}
                musicProfile={musicProfile}
                onOrbClick={onStartConversation}
              />
            </Suspense>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-3 px-5 pb-5">
              {statusSteps.map((step) => (
                <motion.div
                  key={step}
                  animate={{
                    opacity: aiState === step ? [0.42, 1, 0.42] : 0.62,
                    y: aiState === step ? [0, -2, 0] : 0,
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: aiState === step ? Number.POSITIVE_INFINITY : 0,
                    ease: 'easeInOut',
                  }}
                  className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] backdrop-blur-xl ${
                    aiState === step
                      ? 'border-cyan-200/18 bg-cyan-300/10 text-cyan-50'
                      : 'border-white/10 bg-slate-950/34 text-cyan-50/68'
                  }`}
                >
                  {step}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
