import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export default function CursorGlow() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const x = useSpring(mouseX, { stiffness: 180, damping: 28, mass: 0.8 });
  const y = useSpring(mouseY, { stiffness: 180, damping: 28, mass: 0.8 });

  useEffect(() => {
    const update = (event) => {
      mouseX.set(event.clientX - 180);
      mouseY.set(event.clientY - 180);
    };

    window.addEventListener('pointermove', update);
    return () => window.removeEventListener('pointermove', update);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ x, y }}
      className="pointer-events-none fixed left-0 top-0 z-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(76,233,255,0.22),rgba(115,92,255,0.12)_38%,transparent_72%)] blur-3xl"
    />
  );
}
