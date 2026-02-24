import { useState, useEffect } from 'react';

const SPEED_STORAGE_KEY = 'neetcode-viz-speed';
const DEFAULT_SPEED = 1;

export function useSpeedControl() {
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);

  // Load speed from localStorage on mount
  useEffect(() => {
    try {
      const storedSpeed = localStorage.getItem(SPEED_STORAGE_KEY);
      if (storedSpeed) {
        const parsedSpeed = parseFloat(storedSpeed);
        if (!isNaN(parsedSpeed) && parsedSpeed > 0) {
          setSpeed(parsedSpeed);
        }
      }
    } catch (error) {
      console.warn('Failed to load speed from localStorage:', error);
    }
  }, []);

  // Update speed and save to localStorage
  const updateSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    try {
      localStorage.setItem(SPEED_STORAGE_KEY, newSpeed.toString());
    } catch (error) {
      console.warn('Failed to save speed to localStorage:', error);
    }
  };

  return { speed, updateSpeed };
}