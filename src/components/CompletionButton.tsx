import { Check } from 'lucide-react';
import { useCompletions } from '../contexts/CompletionContext';

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
  const completed = isCompleted(problemId);
  
  const iconSize = size === 'sm' ? 16 : 18;
  const baseClasses = "transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 rounded";
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering parent click handlers
        toggleCompletion(problemId);
      }}
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