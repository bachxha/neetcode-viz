import { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHintsForProblem, type Hint } from '../data/hints';

interface HintsProps {
  problemId: string;
  className?: string;
}

export function Hints({ problemId, className = '' }: HintsProps) {
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const problemHints = getHintsForProblem(problemId);
  
  if (!problemHints) {
    return null; // No hints available for this problem
  }

  const handleShowNextHint = () => {
    if (currentHintLevel < problemHints.hints.length - 1) {
      setCurrentHintLevel(currentHintLevel + 1);
    }
  };

  const handleReset = () => {
    setCurrentHintLevel(0);
  };

  const getHintLevelColor = (level: Hint['level']) => {
    switch (level) {
      case 'nudge': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'approach': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'near-solution': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getHintLevelTitle = (level: Hint['level']) => {
    switch (level) {
      case 'nudge': return 'Nudge';
      case 'approach': return 'Approach';
      case 'near-solution': return 'Near Solution';
      default: return 'Hint';
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold text-slate-200">AI Hints</span>
          <span className="text-sm text-slate-400">
            ({currentHintLevel + 1}/3 revealed)
          </span>
        </div>
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">
              {/* Hints Display */}
              <div className="space-y-3">
                {problemHints.hints.slice(0, currentHintLevel + 1).map((hint, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${getHintLevelColor(hint.level)}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{hint.icon}</span>
                      <span className="font-medium text-sm">
                        {getHintLevelTitle(hint.level)} {index + 1}: {hint.title}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {hint.content}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                <div className="text-xs text-slate-400">
                  Progressive hints • Start with gentle nudges
                </div>
                <div className="flex gap-2">
                  {currentHintLevel > 0 && (
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-300"
                    >
                      Reset
                    </button>
                  )}
                  {currentHintLevel < problemHints.hints.length - 1 && (
                    <button
                      onClick={handleShowNextHint}
                      className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded transition-colors text-white font-medium"
                    >
                      Show Next Hint {currentHintLevel < problemHints.hints.length - 1 ? `(${currentHintLevel + 2}/3)` : ''}
                    </button>
                  )}
                  {currentHintLevel === problemHints.hints.length - 1 && (
                    <span className="px-3 py-1.5 text-xs bg-green-600/20 text-green-400 rounded">
                      All hints revealed! 🎯
                    </span>
                  )}
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex gap-1">
                {problemHints.hints.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full ${
                      index <= currentHintLevel 
                        ? 'bg-blue-500' 
                        : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for problems that don't have hints yet
export function HintsPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-4 ${className}`}>
      <div className="flex items-center gap-2 text-slate-400">
        <HelpCircle className="w-5 h-5" />
        <span className="text-sm">AI hints coming soon for this problem!</span>
      </div>
    </div>
  );
}