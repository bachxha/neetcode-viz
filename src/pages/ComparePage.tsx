import { useEffect } from 'react';
import { ArrowLeft, ExternalLink, BookmarkIcon, CheckCircleIcon } from 'lucide-react';
import { ComparisonMode } from '../components/ComparisonMode';
import { getComparison } from '../data/comparisons';
import { problems } from '../data/problems';
import { BookmarkButton } from '../components/BookmarkButton';
import { CompletionButton } from '../components/CompletionButton';
import { Notes } from '../components/Notes';
import { Timer } from '../components/Timer';
import { RelatedProblems } from '../components/RelatedProblems';
import { ProgressTracker } from '../components/ProgressTracker';
import { useRecentProblems } from '../contexts/RecentProblemsContext';

interface ComparePageProps {
  problemId: string;
  onBack: () => void;
  onSelectProblem: (problemId: string) => void;
}

export function ComparePage({ problemId, onBack, onSelectProblem }: ComparePageProps) {
  const comparison = getComparison(problemId);
  const problem = problems.find(p => p.id === problemId);
  const { addRecentProblem } = useRecentProblems();

  // Track this problem as recently visited
  useEffect(() => {
    if (problem) {
      addRecentProblem({
        id: problem.id,
        title: problem.title,
        category: problem.category,
        difficulty: problem.difficulty
      });
    }
  }, [problem, addRecentProblem]);

  if (!comparison || !problem) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Comparison Not Available</h2>
          <p className="text-slate-300 mb-4">
            Algorithm comparison for this problem is not yet available.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:border-blue-400 transition-all"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Timer Component */}
      <Timer problemSlug={problemId} />
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <div className="w-px h-6 bg-slate-600"></div>
              <div>
                <h1 className="text-xl font-bold text-white">{problem.title}</h1>
                <p className="text-sm text-slate-400">Algorithm Comparison</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CompletionButton problemId={problemId} />
              <BookmarkButton problemId={problemId} />
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
                title="Open on LeetCode"
              >
                <ExternalLink size={16} />
                <span className="hidden sm:inline">LeetCode</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Notes Section */}
        <div className="mb-6">
          <Notes problemId={problemId} />
        </div>

        {/* Comparison Mode */}
        <div className="min-h-screen">
          <ComparisonMode comparison={comparison} />
        </div>

        {/* Progress Tracking */}
        <div className="mt-8">
          <ProgressTracker problemId={problemId} difficulty={problem.difficulty} />
        </div>

        {/* Related Problems */}
        <div className="mt-8">
          <RelatedProblems currentProblemId={problemId} onSelectProblem={onSelectProblem} />
        </div>

        {/* Performance Comparison Summary */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Performance Summary</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-3">{comparison.approaches.bruteForce.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Complexity:</span>
                  <span className="text-red-400 font-mono">{comparison.approaches.bruteForce.timeComplexity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Space Complexity:</span>
                  <span className="text-red-400 font-mono">{comparison.approaches.bruteForce.spaceComplexity}</span>
                </div>
                <p className="text-slate-300 text-xs mt-2">{comparison.approaches.bruteForce.description}</p>
              </div>
            </div>
            
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">{comparison.approaches.optimal.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Complexity:</span>
                  <span className="text-green-400 font-mono">{comparison.approaches.optimal.timeComplexity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Space Complexity:</span>
                  <span className="text-green-400 font-mono">{comparison.approaches.optimal.spaceComplexity}</span>
                </div>
                <p className="text-slate-300 text-xs mt-2">{comparison.approaches.optimal.description}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-400 font-semibold mb-2">💡 Interview Tip</h4>
            <p className="text-slate-300 text-sm">
              Always start by discussing the brute force approach to show you understand the problem. 
              Then optimize it step by step. This demonstrates your problem-solving process and gets you 
              to the optimal solution naturally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}