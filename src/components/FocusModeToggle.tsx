import { Maximize2, Minimize2 } from 'lucide-react';
import { useFocus } from '../contexts/FocusContext';

interface FocusModeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function FocusModeToggle({ 
  size = 'md', 
  showText = true, 
  className = '' 
}: FocusModeToggleProps) {
  const { isFocusMode, toggleFocusMode } = useFocus();

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2',
    lg: 'px-4 py-3 text-lg'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  return (
    <button
      onClick={toggleFocusMode}
      className={`
        flex items-center gap-2 
        bg-gradient-to-r from-indigo-500/20 to-purple-500/20 
        border border-indigo-500/30 rounded-lg 
        hover:border-indigo-400 transition-all 
        font-medium text-indigo-400 hover:text-indigo-300
        ${sizeClasses[size]}
        ${className}
      `}
      title={`${isFocusMode ? 'Exit' : 'Enter'} Focus Mode (F)`}
    >
      {isFocusMode ? (
        <Minimize2 size={iconSizes[size]} />
      ) : (
        <Maximize2 size={iconSizes[size]} />
      )}
      {showText && (
        <span>
          {isFocusMode ? 'Exit Focus' : 'Focus Mode'}
        </span>
      )}
    </button>
  );
}

// Floating exit button for focus mode
export function FocusExitButton() {
  const { isFocusMode, exitFocusMode } = useFocus();

  if (!isFocusMode) return null;

  return (
    <button
      onClick={exitFocusMode}
      className="
        fixed top-4 right-4 z-50
        flex items-center gap-2 px-3 py-2
        bg-gray-900/90 backdrop-blur-sm
        border border-gray-600/50 rounded-lg
        hover:bg-gray-800/90 hover:border-gray-500
        transition-all duration-200
        font-medium text-gray-200 hover:text-white
        shadow-lg
      "
      title="Exit Focus Mode (Esc)"
    >
      <Minimize2 size={16} />
      <span className="hidden sm:inline">Exit Focus</span>
    </button>
  );
}