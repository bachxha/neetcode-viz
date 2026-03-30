import { useState } from 'react';
import { blind75, getBlind75Categories, getBlind75ByCategory, type Blind75Category, type Blind75Problem } from '../data/blind75';
import { problems } from '../data/problems';
import { useCompletions } from '../contexts/CompletionContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import { ChevronDown, ExternalLink, Play, Lock, Star, Check, Target, Flame } from 'lucide-react';

interface Blind75PageProps {
  onSelectProblem: (id: string) => void;
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

function ProblemRow({ 
  problem, 
  ourProblem,
  onSelect 
}: { 
  problem: Blind75Problem;
  ourProblem: typeof problems[0] | undefined;
  onSelect: (id: string) => void;
}) {
  const { completions } = useCompletions();
  const { bookmarks, toggleBookmark } = useBookmarks();
  
  const isCompleted = completions.includes(problem.id);
  const isBookmarked = bookmarks.includes(problem.id);
  const hasVisualizer = ourProblem?.hasVisualization ?? false;
  
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.01]"
      style={{ 
        backgroundColor: isCompleted ? 'var(--bg-success, rgba(34, 197, 94, 0.1))' : 'var(--bg-card)',
        border: '1px solid',
        borderColor: isCompleted ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-primary)'
      }}
    >
      {/* Completion indicator */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
        isCompleted ? 'bg-green-500 text-white' : 'bg-slate-700'
      }`}>
        {isCompleted ? <Check size={14} /> : <span className="text-xs text-slate-500">{problem.leetcodeNumber}</span>}
      </div>
      
      {/* Problem info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span 
            className="font-medium truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {problem.title}
          </span>
          {ourProblem && <DifficultyBadge difficulty={ourProblem.difficulty} />}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(problem.id);
          }}
          className={`p-1.5 rounded transition-colors ${
            isBookmarked ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Star size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
        
        {/* LeetCode link */}
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded text-slate-500 hover:text-blue-400 transition-colors"
          title="Open on LeetCode"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={16} />
        </a>
        
        {/* Visualizer button */}
        {hasVisualizer ? (
          <button
            onClick={() => onSelect(problem.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
          >
            <Play size={14} />
            Visualize
          </button>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 text-slate-500 rounded-lg text-sm">
            <Lock size={14} />
            Soon
          </span>
        )}
      </div>
    </div>
  );
}

function CategorySection({
  category,
  onSelectProblem,
}: {
  category: Blind75Category;
  onSelectProblem: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const { completions } = useCompletions();
  
  const categoryProblems = getBlind75ByCategory(category);
  const completedCount = categoryProblems.filter(p => completions.includes(p.id)).length;
  const withVisualizerCount = categoryProblems.filter(p => {
    const ourProblem = problems.find(op => op.id === p.id);
    return ourProblem?.hasVisualization;
  }).length;
  
  const progressPercent = Math.round((completedCount / categoryProblems.length) * 100);
  
  return (
    <div 
      className="border rounded-lg overflow-hidden transition-colors"
      style={{ borderColor: 'var(--border-primary)' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 transition-colors hover:opacity-90"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <ChevronDown
          size={20}
          className={`transition-transform ${isOpen ? '' : '-rotate-90'}`}
          style={{ color: 'var(--text-secondary)' }}
        />
        <div className="flex-1 text-left">
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{category}</span>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full max-w-[200px]">
              <div 
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-green-400">{completedCount}/{categoryProblems.length}</span>
          </div>
        </div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="text-blue-400">{withVisualizerCount} visualized</span>
        </span>
      </button>
      
      {isOpen && (
        <div 
          className="p-3 space-y-2 transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {categoryProblems.map((problem) => {
            const ourProblem = problems.find(p => p.id === problem.id);
            return (
              <ProblemRow
                key={problem.id}
                problem={problem}
                ourProblem={ourProblem}
                onSelect={onSelectProblem}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Blind75Page({ onSelectProblem }: Blind75PageProps) {
  const { completions } = useCompletions();
  const categories = getBlind75Categories();
  
  const totalProblems = blind75.length;
  const completedTotal = blind75.filter(p => completions.includes(p.id)).length;
  const visualizedTotal = blind75.filter(p => {
    const ourProblem = problems.find(op => op.id === p.id);
    return ourProblem?.hasVisualization;
  }).length;
  
  const progressPercent = Math.round((completedTotal / totalProblems) * 100);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Target className="w-10 h-10 text-orange-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Blind 75
          </h1>
        </div>
        <p className="text-slate-400 text-lg mb-6">
          The classic 75 LeetCode problems every engineer should know
        </p>
        
        {/* Overall Progress */}
        <div 
          className="inline-block px-6 py-4 rounded-xl"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)'
          }}
        >
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{completedTotal}</div>
              <div className="text-xs text-slate-500">Completed</div>
            </div>
            <div className="h-12 w-px bg-slate-700" />
            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{progressPercent}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="h-12 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{visualizedTotal}</div>
              <div className="text-xs text-slate-500">Visualized</div>
            </div>
          </div>
        </div>

        {/* Motivation */}
        {progressPercent >= 50 && progressPercent < 100 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-orange-400">
            <Flame size={20} />
            <span className="font-medium">You're on fire! Keep going!</span>
          </div>
        )}
        {progressPercent === 100 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
            <Check size={20} />
            <span className="font-medium">🎉 Congratulations! You've mastered the Blind 75!</span>
          </div>
        )}
      </div>
      
      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            onSelectProblem={onSelectProblem}
          />
        ))}
      </div>
      
      {/* Footer note */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>
          The Blind 75 is a curated list by{' '}
          <a 
            href="https://www.teamblind.com/post/New-Year-Gift---Curated-List-of-Top-75-LeetCode-Questions-to-Save-Your-Time-OaM1orEU" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Yangshun Tay
          </a>
          {' '}— the essential problems for technical interviews.
        </p>
      </div>
    </div>
  );
}
