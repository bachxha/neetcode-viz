import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Clock, AlertCircle, X } from 'lucide-react';
import { progressStore, useProgress } from '../store/progressStore';
import type { Difficulty } from '../data/problems';

interface ProgressTrackerProps {
  problemId: string;
  difficulty: Difficulty;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffMinutes > 0) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }
  return 'just now';
}

function ConfidenceRating({
  onRate,
  onClose,
}: {
  onRate: (confidence: number) => void;
  onClose: () => void;
}) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const confidenceLabels: Record<number, string> = {
    1: "Didn't remember",
    2: 'Hard recall',
    3: 'Medium',
    4: 'Easy recall',
    5: 'Very confident',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 bg-slate-900/95 rounded-lg flex flex-col items-center justify-center p-4 z-10"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>

      <h4 className="text-sm font-medium text-slate-300 mb-3">
        How confident do you feel?
      </h4>

      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onRate(rating)}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(null)}
            className={`p-2 rounded-lg transition-all ${
              (hoveredRating ?? 0) >= rating
                ? 'text-yellow-400 scale-110'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Star
              size={24}
              fill={(hoveredRating ?? 0) >= rating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400 h-4">
        {hoveredRating ? confidenceLabels[hoveredRating] : 'Click to rate'}
      </p>
    </motion.div>
  );
}

export function ProgressTracker({ problemId, difficulty }: ProgressTrackerProps) {
  const [showRating, setShowRating] = useState(false);
  const progress = useProgress(problemId);

  const isDueForReview = progress && progress.nextReviewAt <= Date.now();
  const lastSolvedAt = progress?.solvedAt[progress.solvedAt.length - 1];

  const handleMarkSolved = () => {
    setShowRating(true);
  };

  const handleRate = (confidence: number) => {
    progressStore.markSolved(problemId, difficulty, confidence);
    setShowRating(false);
  };

  return (
    <div className="relative bg-slate-800 rounded-lg p-4 border border-slate-700">
      <AnimatePresence>
        {showRating && (
          <ConfidenceRating
            onRate={handleRate}
            onClose={() => setShowRating(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {progress ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                <span className="text-sm text-green-400 font-medium">
                  Solved {progress.reviewCount} time{progress.reviewCount > 1 ? 's' : ''}
                </span>
              </div>
              
              {lastSolvedAt && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={12} />
                  <span>Last: {formatRelativeTime(lastSolvedAt)}</span>
                </div>
              )}

              {isDueForReview && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-amber-400 font-medium"
                >
                  <AlertCircle size={12} />
                  <span>Due for review!</span>
                </motion.div>
              )}

              {progress.confidence && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={
                        star <= progress.confidence
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-600'
                      }
                    />
                  ))}
                  <span className="text-xs text-slate-500 ml-1">
                    confidence
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not solved yet</p>
          )}
        </div>

        <button
          onClick={handleMarkSolved}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            progress
              ? isDueForReview
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {progress
            ? isDueForReview
              ? 'Review Now'
              : 'Solve Again'
            : 'Mark as Solved'}
        </button>
      </div>
    </div>
  );
}

// Compact version for problem cards
export function ProgressBadge({ problemId }: { problemId: string }) {
  const progress = useProgress(problemId);

  if (!progress) return null;

  const isDueForReview = progress.nextReviewAt <= Date.now();

  return (
    <div className="flex items-center gap-1">
      {isDueForReview ? (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">
          <AlertCircle size={10} />
          Review
        </span>
      ) : (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
          <Check size={10} />
          Solved
        </span>
      )}
    </div>
  );
}
