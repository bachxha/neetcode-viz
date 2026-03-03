import { problems, type Difficulty } from '../data/problems';

interface DifficultyFilterProps {
  selectedDifficulty: 'All' | Difficulty;
  onDifficultyChange: (difficulty: 'All' | Difficulty) => void;
  className?: string;
}

type DifficultyOption = 'All' | 'Easy' | 'Medium' | 'Hard';

export const DifficultyFilter = ({ 
  selectedDifficulty, 
  onDifficultyChange, 
  className = "" 
}: DifficultyFilterProps) => {
  // Count problems by difficulty
  const counts = problems.reduce((acc, problem) => {
    acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<Difficulty, number>);

  const totalCount = problems.length;

  const difficulties: DifficultyOption[] = ['All', 'Easy', 'Medium', 'Hard'];

  const getButtonStyles = (difficulty: DifficultyOption) => {
    const isSelected = selectedDifficulty === difficulty;
    
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium border";
    
    if (difficulty === 'All') {
      return isSelected
        ? `${baseClasses} bg-blue-500/20 border-blue-500/50 text-blue-400`
        : `${baseClasses} bg-gray-500/10 border-gray-500/30 text-gray-400 hover:text-gray-300 hover:border-gray-400`;
    }
    
    if (difficulty === 'Easy') {
      return isSelected
        ? `${baseClasses} bg-green-500/20 border-green-500/50 text-green-400`
        : `${baseClasses} bg-gray-500/10 border-gray-500/30 text-gray-400 hover:text-gray-300 hover:border-gray-400`;
    }
    
    if (difficulty === 'Medium') {
      return isSelected
        ? `${baseClasses} bg-yellow-500/20 border-yellow-500/50 text-yellow-400`
        : `${baseClasses} bg-gray-500/10 border-gray-500/30 text-gray-400 hover:text-gray-300 hover:border-gray-400`;
    }
    
    if (difficulty === 'Hard') {
      return isSelected
        ? `${baseClasses} bg-red-500/20 border-red-500/50 text-red-400`
        : `${baseClasses} bg-gray-500/10 border-gray-500/30 text-gray-400 hover:text-gray-300 hover:border-gray-400`;
    }
    
    return baseClasses;
  };

  const getPillCount = (difficulty: DifficultyOption) => {
    if (difficulty === 'All') return totalCount;
    return counts[difficulty as Difficulty] || 0;
  };

  return (
    <div className={`flex gap-3 flex-wrap ${className}`}>
      {difficulties.map((difficulty) => (
        <button
          key={difficulty}
          onClick={() => onDifficultyChange(difficulty)}
          className={getButtonStyles(difficulty)}
        >
          {difficulty}
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
            {getPillCount(difficulty)}
          </span>
        </button>
      ))}
    </div>
  );
};