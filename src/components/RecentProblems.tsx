import React, { useState, useRef, useEffect } from 'react';
import { Clock, X, Trash2 } from 'lucide-react';
import { useRecentProblems } from '../contexts/RecentProblemsContext';

interface RecentProblemsProps {
  onSelectProblem: (problemId: string) => void;
  className?: string;
}

function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const colors = {
    Easy: 'bg-green-500/20 text-green-400',
    Medium: 'bg-yellow-500/20 text-yellow-400',
    Hard: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}

export const RecentProblems: React.FC<RecentProblemsProps> = ({ 
  onSelectProblem, 
  className = '' 
}) => {
  const { recentProblems, clearRecentProblems, getTimeSinceVisited } = useRecentProblems();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProblemClick = (problemId: string) => {
    onSelectProblem(problemId);
    setIsOpen(false);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentProblems();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* History Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-500/20 to-gray-500/20 border border-slate-500/30 rounded-lg hover:border-slate-400 transition-all text-sm font-medium text-slate-400 hover:text-slate-300"
        title="Recent problems history"
      >
        <Clock size={16} />
        History
        {recentProblems.length > 0 && (
          <span className="bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0.5 rounded-full">
            {recentProblems.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border shadow-lg z-50 transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-primary)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Problems
            </h3>
            <div className="flex items-center gap-1">
              {recentProblems.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                  title="Clear history"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-500/20 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-2">
            {recentProblems.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={32} className="mx-auto mb-3 text-gray-500" />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No recent problems yet
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Visit a problem to start building your history
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentProblems.map((problem) => (
                  <button
                    key={`${problem.id}-${problem.timestamp}`}
                    onClick={() => handleProblemClick(problem.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-500/10 transition-colors text-left"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="font-medium text-sm truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {problem.title}
                        </span>
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {problem.category}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {getTimeSinceVisited(problem.timestamp)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};