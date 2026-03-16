import { useState, useEffect, useRef } from 'react';

/**
 * Animates a numeric value counting up or down to the target.
 * @param {number} target - The value to animate toward.
 * @param {number} duration - Total animation time in ms (default 800).
 */
export function useAnimatedCount(target, duration = 800) {
  const [displayed, setDisplayed] = useState(target);
  const currentRef = useRef(target);
  const animRef = useRef(null);

  useEffect(() => {
    if (animRef.current) clearInterval(animRef.current);

    const from = currentRef.current;
    if (from === target) return;

    const diff = Math.abs(target - from);
    const direction = target > from ? 1 : -1;
    // Clamp step interval: fast for big jumps, slow for small ones
    const stepDuration = Math.max(16, Math.min(duration / diff, 80));

    animRef.current = setInterval(() => {
      currentRef.current += direction;
      setDisplayed(currentRef.current);
      if (currentRef.current === target) {
        clearInterval(animRef.current);
      }
    }, stepDuration);

    return () => clearInterval(animRef.current);
  }, [target, duration]);

  return displayed;
}
