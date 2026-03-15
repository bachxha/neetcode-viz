import type { Complexity } from '../data/problems';

interface ComplexityBadgeProps {
  complexity: Complexity;
  label?: 'Time' | 'Space';
  size?: 'sm' | 'md';
}

export const ComplexityBadge = ({ complexity, label, size = 'sm' }: ComplexityBadgeProps) => {
  const getComplexityColor = (complexity: Complexity): string => {
    switch (complexity) {
      case 'O(1)':
      case 'O(log n)':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'O(n)':
      case 'O(√n)':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'O(n log n)':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'O(n²)':
      case 'O(n³)':
      case 'O(2^n)':
      case 'O(n!)':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs'
    : 'px-3 py-1 text-sm';

  return (
    <span 
      className={`
        ${getComplexityColor(complexity)} 
        ${sizeClasses} 
        border rounded-full font-medium inline-flex items-center gap-1
      `}
      title={label ? `${label}: ${complexity}` : complexity}
    >
      {label && (
        <span className="text-[10px] opacity-75">
          {label[0]}:
        </span>
      )}
      {complexity}
    </span>
  );
};

interface ComplexityBadgesProps {
  timeComplexity: Complexity;
  spaceComplexity: Complexity;
  size?: 'sm' | 'md';
}

export const ComplexityBadges = ({ timeComplexity, spaceComplexity, size = 'sm' }: ComplexityBadgesProps) => {
  return (
    <div className="flex items-center gap-1.5">
      <ComplexityBadge complexity={timeComplexity} label="Time" size={size} />
      <ComplexityBadge complexity={spaceComplexity} label="Space" size={size} />
    </div>
  );
};