import { motion } from 'framer-motion';
import { Lock, Calendar } from 'lucide-react';
import { useAchievements, type Badge } from '../contexts/AchievementsContext';

interface AchievementBadgeProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export function AchievementBadge({ 
  badge, 
  size = 'md', 
  showProgress = true,
  className = '' 
}: AchievementBadgeProps) {
  const { isUnlocked, getUnlockedBadge, getProgress } = useAchievements();
  
  const unlocked = isUnlocked(badge.id);
  const unlockedBadge = getUnlockedBadge(badge.id);
  const progress = getProgress(badge.id);

  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 'text-2xl',
      title: 'text-sm font-medium',
      description: 'text-xs',
      date: 'text-xs'
    },
    md: {
      container: 'p-4',
      icon: 'text-3xl',
      title: 'text-base font-semibold',
      description: 'text-sm',
      date: 'text-xs'
    },
    lg: {
      container: 'p-6',
      icon: 'text-4xl',
      title: 'text-lg font-bold',
      description: 'text-base',
      date: 'text-sm'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        relative rounded-lg border transition-all duration-300
        ${unlocked 
          ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/10' 
          : 'bg-slate-800/50 border-slate-600/30'
        }
        ${currentSize.container}
        ${className}
      `}
    >
      {/* Lock overlay for locked badges */}
      {!unlocked && (
        <div className="absolute inset-0 bg-slate-900/60 rounded-lg flex items-center justify-center">
          <Lock size={size === 'lg' ? 24 : size === 'md' ? 20 : 16} className="text-slate-400" />
        </div>
      )}

      {/* Badge content */}
      <div className={`text-center ${unlocked ? '' : 'blur-sm'}`}>
        {/* Badge icon */}
        <div className={`${currentSize.icon} mb-2`}>
          {badge.icon}
        </div>

        {/* Badge name */}
        <h3 className={`${currentSize.title} ${unlocked ? 'text-white' : 'text-slate-400'} mb-1`}>
          {badge.name}
        </h3>

        {/* Badge description */}
        <p className={`${currentSize.description} ${unlocked ? 'text-slate-300' : 'text-slate-500'} mb-2`}>
          {badge.description}
        </p>

        {/* Progress bar for locked badges */}
        {!unlocked && showProgress && progress && (
          <div className="mb-2">
            <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((progress.current / progress.total) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {progress.current}/{progress.total}
            </p>
          </div>
        )}

        {/* Unlock date for unlocked badges */}
        {unlocked && unlockedBadge && (
          <div className={`flex items-center justify-center gap-1 ${currentSize.date} text-yellow-400`}>
            <Calendar size={size === 'lg' ? 14 : 12} />
            <span>
              {new Date(unlockedBadge.unlockedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>

      {/* Unlock glow effect */}
      {unlocked && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20"
          animate={{ 
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
}