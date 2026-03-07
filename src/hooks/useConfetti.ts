import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  scalar?: number;
  gravity?: number;
  decay?: number;
  drift?: number;
  ticks?: number;
}

export const useConfetti = () => {
  const timeoutRef = useRef<number | null>(null);

  const checkReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const fireConfetti = useCallback((element?: HTMLElement | null, options?: ConfettiOptions) => {
    // Respect user's reduced motion preference
    if (checkReducedMotion()) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    let origin = options?.origin;
    
    // If element is provided, calculate origin from its position
    if (element && !origin) {
      const rect = element.getBoundingClientRect();
      origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      };
    }

    const defaultOptions: ConfettiOptions = {
      particleCount: 30,
      spread: 60,
      origin: origin || { x: 0.5, y: 0.6 },
      colors: ['#34d399', '#10b981', '#059669', '#047857'],
      scalar: 0.8,
      gravity: 1.2,
      decay: 0.94,
      drift: 0,
      ticks: 100,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Fire confetti
    confetti(finalOptions);

    // Fire a smaller burst slightly delayed for a nice effect
    timeoutRef.current = setTimeout(() => {
      confetti({
        ...finalOptions,
        particleCount: 15,
        spread: 30,
        scalar: 0.6,
      });
    }, 150);
  }, [checkReducedMotion]);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    clearTimeouts();
  }, [clearTimeouts]);

  return {
    fireConfetti,
    clearTimeouts,
    cleanup,
    isReducedMotion: checkReducedMotion,
  };
};