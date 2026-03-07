import { Check } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { useCompletions } from '../contexts/CompletionContext';
import { useConfetti } from '../hooks/useConfetti';

interface CompletionButtonProps {
  problemId: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const CompletionButton: React.FC<CompletionButtonProps> = ({ 
  problemId, 
  size = 'md', 
  className = '' 
}) => {
  const { isCompleted, toggleCompletion } = useCompletions();
  const { fireConfetti, cleanup } = useConfetti();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const completed = isCompleted(problemId);
  
  const iconSize = size === 'sm' ? 16 : 18;
  const baseClasses = "transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 rounded";
  
  // Cleanup confetti timeouts on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    
    const wasCompleted = completed;
    toggleCompletion(problemId);
    
    // Fire confetti only when marking as completed (not when unmarking)
    if (!wasCompleted) {
      // Small delay to let the UI update first
      setTimeout(() => {
        fireConfetti(buttonRef.current);
      }, 100);
    }
  };
  
  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      className={`${baseClasses} ${className}`}
      title={completed ? 'Mark as incomplete' : 'Mark as completed'}
      aria-label={completed ? 'Mark as incomplete' : 'Mark as completed'}
    >
      <Check
        size={iconSize}
        className={`transition-colors duration-200 ${
          completed 
            ? 'text-green-400 bg-green-400/20 rounded-full p-0.5' 
            : 'text-gray-400 hover:text-green-400'
        }`}
        style={{
          backgroundColor: completed ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
        }}
      />
    </button>
  );
};