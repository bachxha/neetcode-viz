import { useState } from 'react';
import { SubsetsVisualizer } from './visualizers/SubsetsVisualizer';
import { MergeIntervalsVisualizer } from './visualizers/MergeIntervalsVisualizer';
import { NQueensVisualizer } from './visualizers/NQueensVisualizer';
import { MeetingRoomsIIVisualizer } from './visualizers/MeetingRoomsIIVisualizer';
import { InsertIntervalVisualizer } from './visualizers/InsertIntervalVisualizer';
import { NonOverlappingIntervalsVisualizer } from './visualizers/NonOverlappingIntervalsVisualizer';
import { CombinationSumVisualizer } from './visualizers/CombinationSumVisualizer';
import { PermutationsVisualizer } from './visualizers/PermutationsVisualizer';
import { WordSearchVisualizer } from './visualizers/WordSearchVisualizer';
import { LetterCombinationsVisualizer } from './visualizers/LetterCombinationsVisualizer';
import { SubsetsIIVisualizer } from './visualizers/SubsetsIIVisualizer';
import { CombinationSumIIVisualizer } from './visualizers/CombinationSumIIVisualizer';
import { PalindromePartitioningVisualizer } from './visualizers/PalindromePartitioningVisualizer';
import { ClimbingStairsVisualizer } from './visualizers/ClimbingStairsVisualizer';
import { TwoPointersVisualizer } from './visualizers/TwoPointersVisualizer';
import { BinarySearchVisualizer } from './visualizers/BinarySearchVisualizer';
import { NumberOfIslandsVisualizer } from './visualizers/NumberOfIslandsVisualizer';
import { PacificAtlanticVisualizer } from './visualizers/PacificAtlanticVisualizer';
import { RottingOrangesVisualizer } from './visualizers/RottingOrangesVisualizer';
import { ValidParenthesesVisualizer } from './visualizers/ValidParenthesesVisualizer';
import { KthLargestVisualizer } from './visualizers/KthLargestVisualizer';
import { BinaryTreeLevelOrderVisualizer } from './visualizers/BinaryTreeLevelOrderVisualizer';
import { InvertBinaryTreeVisualizer } from './visualizers/InvertBinaryTreeVisualizer';
import { MaximumDepthOfBinaryTreeVisualizer } from './visualizers/MaximumDepthOfBinaryTreeVisualizer';
import { ValidateBinarySearchTreeVisualizer } from './visualizers/ValidateBinarySearchTreeVisualizer';
import { LowestCommonAncestorBSTVisualizer } from './visualizers/LowestCommonAncestorBSTVisualizer';
import { BinaryTreeRightSideViewVisualizer } from './visualizers/BinaryTreeRightSideViewVisualizer';
import { SubtreeOfAnotherTreeVisualizer } from './visualizers/SubtreeOfAnotherTreeVisualizer';
import { SameTreeVisualizer } from './visualizers/SameTreeVisualizer';
import { CountGoodNodesInBinaryTreeVisualizer } from './visualizers/CountGoodNodesInBinaryTreeVisualizer';
import { ReverseLinkedListVisualizer } from './visualizers/ReverseLinkedListVisualizer';
import { BestTimeToBuyAndSellStockVisualizer } from './visualizers/BestTimeToBuyAndSellStockVisualizer';
import { CloneGraphVisualizer } from './visualizers/CloneGraphVisualizer';
import { problems, categories, type Problem, type Category } from './data/problems';
import { ChevronRight, ChevronDown, ExternalLink, Play, Lock } from 'lucide-react';

type View = 'home' | string;

function DifficultyBadge({ difficulty }: { difficulty: Problem['difficulty'] }) {
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

function ProblemCard({ problem, onSelect }: { problem: Problem; onSelect: (id: string) => void }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        problem.hasVisualization
          ? 'bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer'
          : 'bg-slate-800/50 border-slate-700/50'
      }`}
      onClick={() => problem.hasVisualization && onSelect(problem.id)}
    >
      <div className={`p-2 rounded-lg ${problem.hasVisualization ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-500'}`}>
        {problem.hasVisualization ? <Play size={16} /> : <Lock size={16} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium truncate ${problem.hasVisualization ? 'text-white' : 'text-slate-400'}`}>
            {problem.title}
          </span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
      </div>
      
      <a
        href={problem.leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        title="Open on LeetCode"
      >
        <ExternalLink size={14} />
      </a>
      
      {problem.hasVisualization && (
        <ChevronRight className="text-slate-500" size={16} />
      )}
    </div>
  );
}

function CategorySection({ 
  category, 
  onSelectProblem 
}: { 
  category: Category; 
  onSelectProblem: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const categoryProblems = problems.filter(p => p.category === category);
  const withViz = categoryProblems.filter(p => p.hasVisualization).length;
  
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <ChevronDown
          size={20}
          className={`text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}
        />
        <span className="font-semibold flex-1 text-left">{category}</span>
        <span className="text-sm text-slate-400">
          {withViz > 0 && <span className="text-blue-400">{withViz} visualized · </span>}
          {categoryProblems.length} problems
        </span>
      </button>
      
      {isOpen && (
        <div className="p-3 space-y-2 bg-slate-900/50">
          {categoryProblems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onSelect={onSelectProblem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HomePage({ onSelect }: { onSelect: (view: View) => void }) {
  const totalProblems = problems.length;
  const totalWithViz = problems.filter(p => p.hasVisualization).length;
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          NeetCode Visualizer
        </h1>
        <p className="text-slate-400 text-lg mb-4">
          Interactive algorithm visualizations for interview prep
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-blue-400 font-bold">{totalWithViz}</span>
            <span className="text-slate-400"> / {totalProblems} visualized</span>
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-slate-400">{categories.length} categories</span>
          </div>
        </div>
      </div>
      
      {/* Quick access to visualized problems */}
      {totalWithViz > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Play size={18} className="text-blue-400" />
            Available Visualizations
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {problems.filter(p => p.hasVisualization).map((problem) => (
              <button
                key={problem.id}
                onClick={() => onSelect(problem.id)}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg hover:border-blue-400 transition-all text-left"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <Play size={18} />
                </div>
                <div>
                  <div className="font-medium">{problem.title}</div>
                  <div className="text-sm text-slate-400">{problem.category}</div>
                </div>
                <DifficultyBadge difficulty={problem.difficulty} />
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* All problems by category */}
      <h2 className="text-lg font-semibold mb-3">All Problems</h2>
      <div className="space-y-3">
        {categories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            onSelectProblem={onSelect}
          />
        ))}
      </div>
      
      <div className="mt-8 text-center text-slate-500 text-sm">
        <p>More visualizations coming soon...</p>
        <p className="mt-1">Built for interview prep 🎯</p>
      </div>
    </div>
  );
}

// Visualizer router
function Visualizer({ problemId }: { problemId: string }) {
  switch (problemId) {
    // Backtracking
    case 'subsets':
      return <SubsetsVisualizer />;
    case 'subsets-ii':
      return <SubsetsIIVisualizer />;
    case 'combination-sum':
      return <CombinationSumVisualizer />;
    case 'combination-sum-ii':
      return <CombinationSumIIVisualizer />;
    case 'permutations':
      return <PermutationsVisualizer />;
    case 'word-search':
      return <WordSearchVisualizer />;
    case 'palindrome-partitioning':
      return <PalindromePartitioningVisualizer />;
    case 'letter-combinations':
      return <LetterCombinationsVisualizer />;
    case 'n-queens':
      return <NQueensVisualizer />;
    // 1-D Dynamic Programming
    case 'climbing-stairs':
      return <ClimbingStairsVisualizer />;
    // Graphs
    case 'number-of-islands':
      return <NumberOfIslandsVisualizer />;
    case 'clone-graph':
      return <CloneGraphVisualizer />;
    case 'pacific-atlantic-water-flow':
      return <PacificAtlanticVisualizer />;
    case 'rotting-oranges':
      return <RottingOrangesVisualizer />;
    // Intervals
    case 'merge-intervals':
      return <MergeIntervalsVisualizer />;
    case 'insert-interval':
      return <InsertIntervalVisualizer />;
    case 'non-overlapping-intervals':
      return <NonOverlappingIntervalsVisualizer />;
    case 'meeting-rooms-ii':
      return <MeetingRoomsIIVisualizer />;
    // Two Pointers
    case 'container-with-most-water':
      return <TwoPointersVisualizer />;
    // Stack
    case 'valid-parentheses':
      return <ValidParenthesesVisualizer />;
    // Binary Search
    case 'binary-search':
      return <BinarySearchVisualizer />;
    // Heap / Priority Queue
    case 'kth-largest-element-in-stream':
      return <KthLargestVisualizer />;
    // Trees
    case 'binary-tree-level-order-traversal':
      return <BinaryTreeLevelOrderVisualizer />;
    case 'binary-tree-right-side-view':
      return <BinaryTreeRightSideViewVisualizer />;
    case 'count-good-nodes':
      return <CountGoodNodesInBinaryTreeVisualizer />;
    case 'invert-binary-tree':
      return <InvertBinaryTreeVisualizer />;
    case 'maximum-depth-of-binary-tree':
      return <MaximumDepthOfBinaryTreeVisualizer />;
    case 'validate-bst':
      return <ValidateBinarySearchTreeVisualizer />;
    case 'lowest-common-ancestor-bst':
      return <LowestCommonAncestorBSTVisualizer />;
    case 'same-tree':
      return <SameTreeVisualizer />;
    case 'subtree-of-another-tree':
      return <SubtreeOfAnotherTreeVisualizer />;
    // Linked List
    case 'reverse-linked-list':
      return <ReverseLinkedListVisualizer />;
    // Sliding Window
    case 'best-time-to-buy-and-sell-stock':
      return <BestTimeToBuyAndSellStockVisualizer />;
    default:
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
          <p className="text-slate-400">Visualization for this problem is not yet available.</p>
        </div>
      );
  }
}

function App() {
  const [view, setView] = useState<View>('home');
  const currentProblem = problems.find(p => p.id === view);
  
  return (
    <div className="min-h-screen bg-slate-900">
      {view !== 'home' && (
        <nav className="border-b border-slate-700 px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setView('home')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{currentProblem?.category}</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">{currentProblem?.title}</span>
          {currentProblem && (
            <a
              href={currentProblem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 transition-colors"
            >
              LeetCode <ExternalLink size={14} />
            </a>
          )}
        </nav>
      )}
      
      {view === 'home' ? (
        <HomePage onSelect={setView} />
      ) : (
        <Visualizer problemId={view} />
      )}
    </div>
  );
}

export default App;
