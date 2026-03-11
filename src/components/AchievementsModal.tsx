import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star } from 'lucide-react';
import { useAchievements } from '../contexts/AchievementsContext';
import { AchievementBadge } from './AchievementBadge';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { badges, unlockedBadges } = useAchievements();

  const unlockedCount = unlockedBadges.length;
  const totalCount = badges.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  // Sort badges: unlocked first (by unlock date), then locked
  const sortedBadges = [...badges].sort((a, b) => {
    const aUnlocked = unlockedBadges.find(ub => ub.badgeId === a.id);
    const bUnlocked = unlockedBadges.find(ub => ub.badgeId === b.id);
    
    if (aUnlocked && bUnlocked) {
      // Both unlocked - sort by unlock date (most recent first)
      return bUnlocked.unlockedAt - aUnlocked.unlockedAt;
    } else if (aUnlocked) {
      // Only a is unlocked
      return -1;
    } else if (bUnlocked) {
      // Only b is unlocked
      return 1;
    } else {
      // Both locked - maintain original order
      return 0;
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div 
              className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-6 border-b"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                    <Trophy size={24} className="text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      Achievement Badges
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {unlockedCount} of {totalCount} badges earned
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Progress Overview */}
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Overall Progress
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                
                <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                  <motion.div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{unlockedCount}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Badges Earned</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{totalCount - unlockedCount}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>To Unlock</div>
                  </div>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {unlockedCount === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-700/30 max-w-md mx-auto">
                      <Star size={48} className="mx-auto text-slate-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        No badges earned yet
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Start solving problems to unlock your first achievement badge!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedBadges.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <AchievementBadge 
                          badge={badge} 
                          size="md" 
                          showProgress={true}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div 
                className="p-6 border-t bg-slate-800/30"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <div className="text-center">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Keep solving problems to unlock more achievements! 🚀
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Celebration animation for newly unlocked badges */}
          <AnimatePresence>
            {unlockedCount > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: [0, 1.2, 1], rotate: [0, 180, 360] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-8 right-8 z-60"
              >
                <div className="text-4xl">🎉</div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}