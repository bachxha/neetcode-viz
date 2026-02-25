import { useEffect, useState, useCallback } from 'react';

const SHORTCUTS_HINT_STORAGE_KEY = 'neetcode-viz-shortcuts-hint-dismissed';
const SPEED_OPTIONS = [0.5, 1, 2];

interface KeyboardShortcutsProps {
  onPlayPause?: () => void;
  onStepBack?: () => void;
  onStepForward?: () => void;
  onReset?: () => void;
  onSpeedChange?: (speed: number) => void;
  currentSpeed?: number;
  canStepBack?: boolean;
  canStepForward?: boolean;
}

interface UseKeyboardShortcutsReturn {
  showShortcutsModal: boolean;
  setShowShortcutsModal: (show: boolean) => void;
  showHint: boolean;
  dismissHint: () => void;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onStepBack,
  onStepForward,
  onReset,
  onSpeedChange,
  currentSpeed = 1,
  canStepBack = true,
  canStepForward = true,
}: KeyboardShortcutsProps): UseKeyboardShortcutsReturn {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Check if hint should be shown on mount
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(SHORTCUTS_HINT_STORAGE_KEY);
      if (!dismissed) {
        setShowHint(true);
      }
    } catch (error) {
      console.warn('Failed to check shortcuts hint preference:', error);
    }
  }, []);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    try {
      localStorage.setItem(SHORTCUTS_HINT_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('Failed to save shortcuts hint preference:', error);
    }
  }, []);

  // Check if an input field is currently focused
  const isInputFocused = useCallback((): boolean => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';
    
    return inputTypes.includes(tagName) || isContentEditable;
  }, []);

  // Toggle speed to next option
  const toggleSpeed = useCallback(() => {
    if (!onSpeedChange) return;
    
    const currentIndex = SPEED_OPTIONS.indexOf(currentSpeed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    const nextSpeed = SPEED_OPTIONS[nextIndex];
    
    onSpeedChange(nextSpeed);
  }, [currentSpeed, onSpeedChange]);

  // Main keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input fields
      if (isInputFocused()) return;

      // Handle shortcuts
      switch (e.key) {
        case ' ': // Space - Play/Pause
          e.preventDefault();
          onPlayPause?.();
          // Dismiss hint when user starts using shortcuts
          if (showHint) dismissHint();
          break;

        case 'ArrowLeft': // Left arrow - Step back
          e.preventDefault();
          if (canStepBack) {
            onStepBack?.();
            if (showHint) dismissHint();
          }
          break;

        case 'ArrowRight': // Right arrow - Step forward
          e.preventDefault();
          if (canStepForward) {
            onStepForward?.();
            if (showHint) dismissHint();
          }
          break;

        case 'r':
        case 'R': // R - Reset
          e.preventDefault();
          onReset?.();
          if (showHint) dismissHint();
          break;

        case 's':
        case 'S': // S - Toggle speed
          e.preventDefault();
          toggleSpeed();
          if (showHint) dismissHint();
          break;

        case '?': // ? - Show/hide shortcuts modal
          e.preventDefault();
          setShowShortcutsModal(prev => !prev);
          if (showHint) dismissHint();
          break;

        case 'Escape': // Escape - Close modals
          e.preventDefault();
          setShowShortcutsModal(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isInputFocused,
    onPlayPause,
    onStepBack,
    onStepForward,
    onReset,
    toggleSpeed,
    canStepBack,
    canStepForward,
    showHint,
    dismissHint,
  ]);

  return {
    showShortcutsModal,
    setShowShortcutsModal,
    showHint,
    dismissHint,
  };
}