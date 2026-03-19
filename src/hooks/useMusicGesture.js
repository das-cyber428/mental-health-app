import { useMemo, useRef } from 'react';

export default function useMusicGesture({ onExpand, onCollapse, threshold = 72 }) {
  const startYRef = useRef(null);

  const handlers = useMemo(
    () => ({
      onTouchStart(event) {
        startYRef.current = event.touches?.[0]?.clientY ?? null;
      },
      onTouchEnd(event) {
        if (startYRef.current == null) {
          return;
        }

        const endY = event.changedTouches?.[0]?.clientY ?? startYRef.current;
        const delta = endY - startYRef.current;

        if (delta <= -threshold) {
          onExpand?.();
        }

        if (delta >= threshold) {
          onCollapse?.();
        }

        startYRef.current = null;
      },
    }),
    [onCollapse, onExpand, threshold],
  );

  return handlers;
}
