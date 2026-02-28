import { Star } from 'lucide-react';
import { useBookmarks } from '../contexts/BookmarkContext';

interface BookmarkButtonProps {
  problemId: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  problemId, 
  size = 'md', 
  className = '' 
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(problemId);
  
  const iconSize = size === 'sm' ? 16 : 18;
  const baseClasses = "transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500 rounded";
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering parent click handlers
        toggleBookmark(problemId);
      }}
      className={`${baseClasses} ${className}`}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <Star
        size={iconSize}
        className={`transition-colors duration-200 ${
          bookmarked 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-400 hover:text-yellow-400'
        }`}
      />
    </button>
  );
};