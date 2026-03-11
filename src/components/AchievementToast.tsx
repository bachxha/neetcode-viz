import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAchievements } from '../contexts/AchievementsContext';

export function AchievementToast() {
  const { newlyUnlocked, badges, clearNewlyUnlocked } = useAchievements();
  const [displayBadge, setDisplayBadge] = useState<string | null>(null);

  useEffect(() => {
    if (newlyUnlocked.length > 0 && !displayBadge) {
      // Show the first newly unlocked badge
      setDisplayBadge(newlyUnlocked[0]);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, displayBadge]);

  const handleDismiss = () => {
    setDisplayBadge(null);
    // Clear all newly unlocked badges after showing one
    setTimeout(() => {
      clearNewlyUnlocked();
    }, 300); // Wait for exit animation
  };

  const badge = displayBadge ? badges.find(b => b.id === displayBadge) : null;

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 100 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 shadow-lg shadow-yellow-500/10 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Trophy size={18} className="text-yellow-400" />
                </div>
                <span className="text-sm font-medium text-yellow-400">
                  Badge Unlocked!
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
              >
                <X size={14} className="text-yellow-400" />
              </button>
            </div>

            {/* Badge Content */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">{badge.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{badge.name}</h4>
                <p className="text-sm text-slate-300">{badge.description}</p>
              </div>
            </div>

            {/* Celebration particles */}
            <div className="absolute -top-2 -right-2">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1, 0.8], 
                  rotate: [0, 180, 360] 
                }}
                transition={{ 
                  duration: 0.6, 
                  repeat: 2,
                  ease: "easeOut" 
                }}
                className="text-lg"
              >
                ⭐
              </motion.div>
            </div>

            <div className="absolute -top-3 -left-2">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1, 0.8], 
                  rotate: [0, -180, -360] 
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.2,
                  repeat: 2,
                  ease: "easeOut" 
                }}
                className="text-lg"
              >
                🎉
              </motion.div>
            </div>

            {/* Progress bar (auto-dismiss indicator) */}
            <div className="mt-3 w-full bg-yellow-500/20 rounded-full h-1">
              <motion.div
                className="bg-yellow-400 h-1 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}