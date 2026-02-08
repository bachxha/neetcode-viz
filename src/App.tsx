import { useState } from 'react';
import { SubsetsVisualizer } from './visualizers/SubsetsVisualizer';
import { MergeIntervalsVisualizer } from './visualizers/MergeIntervalsVisualizer';
import { NQueensVisualizer } from './visualizers/NQueensVisualizer';
import { MeetingRoomsIIVisualizer } from './visualizers/MeetingRoomsIIVisualizer';
import { MeetingRoomsVisualizer } from './visualizers/MeetingRoomsVisualizer';
import { InsertIntervalVisualizer } from './visualizers/InsertIntervalVisualizer';
import { NonOverlappingIntervalsVisualizer } from './visualizers/NonOverlappingIntervalsVisualizer';
import { CombinationSumVisualizer } from './visualizers/CombinationSumVisualizer';
import { PermutationsVisualizer } from './visualizers/PermutationsVisualizer';
import { WordSearchVisualizer } from './visualizers/WordSearchVisualizer';
import { LetterCombinationsVisualizer } from './visualizers/LetterCombinationsVisualizer';
import { SubsetsIIVisualizer } from './visualizers/SubsetsIIVisualizer';
import { CombinationSumIIVisualizer } from './visualizers/CombinationSumIIVisualizer';
import { PalindromePartitioningVisualizer } from './visualizers/PalindromePartitioningVisualizer';
import { SudokuSolverVisualizer } from './visualizers/SudokuSolverVisualizer';
import { GenerateParenthesesVisualizer } from './visualizers/GenerateParenthesesVisualizer';
import { ClimbingStairsVisualizer } from './visualizers/ClimbingStairsVisualizer';
import { CoinChangeVisualizer } from './visualizers/CoinChangeVisualizer';
import { TwoPointersVisualizer } from './visualizers/TwoPointersVisualizer';
import { BinarySearchVisualizer } from './visualizers/BinarySearchVisualizer';
import { SearchInRotatedSortedArrayVisualizer } from './visualizers/SearchInRotatedSortedArrayVisualizer';
import { FindMinimumInRotatedSortedArrayVisualizer } from './visualizers/FindMinimumInRotatedSortedArrayVisualizer';
import { KokoEatingBananasVisualizer } from './visualizers/KokoEatingBananasVisualizer';
import { Search2DMatrixVisualizer } from './visualizers/Search2DMatrixVisualizer';
import { NumberOfIslandsVisualizer } from './visualizers/NumberOfIslandsVisualizer';
import { PacificAtlanticVisualizer } from './visualizers/PacificAtlanticVisualizer';
import { RottingOrangesVisualizer } from './visualizers/RottingOrangesVisualizer';
import { SurroundedRegionsVisualizer } from './visualizers/SurroundedRegionsVisualizer';
import { ValidParenthesesVisualizer } from './visualizers/ValidParenthesesVisualizer';
import { KthLargestVisualizer } from './visualizers/KthLargestVisualizer';
import { FindMedianFromDataStreamVisualizer } from './visualizers/FindMedianFromDataStreamVisualizer';
import { BinaryTreeLevelOrderVisualizer } from './visualizers/BinaryTreeLevelOrderVisualizer';
import { InvertBinaryTreeVisualizer } from './visualizers/InvertBinaryTreeVisualizer';
import { MaximumDepthOfBinaryTreeVisualizer } from './visualizers/MaximumDepthOfBinaryTreeVisualizer';
import { ValidateBinarySearchTreeVisualizer } from './visualizers/ValidateBinarySearchTreeVisualizer';
import { LowestCommonAncestorBSTVisualizer } from './visualizers/LowestCommonAncestorBSTVisualizer';
import { TrappingRainWaterVisualizer } from './visualizers/TrappingRainWaterVisualizer';
import { BinaryTreeRightSideViewVisualizer } from './visualizers/BinaryTreeRightSideViewVisualizer';
import { SubtreeOfAnotherTreeVisualizer } from './visualizers/SubtreeOfAnotherTreeVisualizer';
import { SameTreeVisualizer } from './visualizers/SameTreeVisualizer';
import { CountGoodNodesInBinaryTreeVisualizer } from './visualizers/CountGoodNodesInBinaryTreeVisualizer';
import { KthSmallestElementInBSTVisualizer } from './visualizers/KthSmallestElementInBSTVisualizer';
import { ReverseLinkedListVisualizer } from './visualizers/ReverseLinkedListVisualizer';
import { MergeTwoSortedListsVisualizer } from './visualizers/MergeTwoSortedListsVisualizer';
import { BestTimeToBuyAndSellStockVisualizer } from './visualizers/BestTimeToBuyAndSellStockVisualizer';
import { LongestSubstringWithoutRepeatingVisualizer } from './visualizers/LongestSubstringWithoutRepeatingVisualizer';
import { MinimumWindowSubstringVisualizer } from './visualizers/MinimumWindowSubstringVisualizer';
import { CloneGraphVisualizer } from './visualizers/CloneGraphVisualizer';
import { CourseScheduleVisualizer } from './visualizers/CourseScheduleVisualizer';
import { WordLadderVisualizer } from './visualizers/WordLadderVisualizer';
import { NetworkDelayTimeVisualizer } from './visualizers/NetworkDelayTimeVisualizer';
import { ImplementTrieVisualizer } from './visualizers/ImplementTrieVisualizer';
import { DailyTemperaturesVisualizer } from './visualizers/DailyTemperaturesVisualizer';
import { MinStackVisualizer } from './visualizers/MinStackVisualizer';
import { EvaluateReversePolishNotationVisualizer } from './visualizers/EvaluateReversePolishNotationVisualizer';
import { LargestRectangleInHistogramVisualizer } from './visualizers/LargestRectangleInHistogramVisualizer';
import { LongestIncreasingSubsequenceVisualizer } from './visualizers/LongestIncreasingSubsequenceVisualizer';
import { ThreeSumVisualizer } from './visualizers/ThreeSumVisualizer';
import { LRUCacheVisualizer } from './visualizers/LRUCacheVisualizer';
import { AddTwoNumbersVisualizer } from './visualizers/AddTwoNumbersVisualizer';
import { RemoveNthNodeFromEndVisualizer } from './visualizers/RemoveNthNodeFromEndVisualizer';
import { ReorderListVisualizer } from './visualizers/ReorderListVisualizer';
import { LinkedListCycleVisualizer } from './visualizers/LinkedListCycleVisualizer';
import { FindTheDuplicateNumberVisualizer } from './visualizers/FindTheDuplicateNumberVisualizer';
import { JumpGameVisualizer } from './visualizers/JumpGameVisualizer';
import { UniquePathsVisualizer } from './visualizers/UniquePathsVisualizer';
import { CountingBitsVisualizer } from './visualizers/CountingBitsVisualizer';
import { SpiralMatrixVisualizer } from './visualizers/SpiralMatrixVisualizer';
import { PatternsPage } from './patterns/PatternsPage';
import { PatternDetailPage } from './pages/PatternDetailPage';
import { patterns } from './data/patterns';
import { DashboardPage } from './pages/DashboardPage';
import { PatternTrainerPage } from './pages/PatternTrainerPage';
import { VerbalTrainerPage } from './pages/VerbalTrainerPage';
import { BugHunterPage } from './pages/BugHunterPage';
import { CompanyPathsPage } from './pages/CompanyPathsPage';
import { CompanyPathDetailPage } from './pages/CompanyPathDetailPage';
import { ProgressTracker, ProgressBadge } from './components/ProgressTracker';
import { PrepDashboard } from './components/PrepDashboard';
import { PrepStreak } from './components/PrepStreak';
import { problems, categories, type Problem, type Category } from './data/problems';
import { ChevronRight, ChevronDown, ExternalLink, Play, Lock, Lightbulb, LayoutDashboard, Brain, Building2, Mic, Bug, TrendingUp } from 'lucide-react';

type View = 'home' | 'patterns' | 'dashboard' | 'trainer' | 'verbal-trainer' | 'bug-hunter' | 'company-paths' | string;

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
          <ProgressBadge problemId={problem.id} />
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
          AlgoForge
        </h1>
        <p className="text-slate-400 text-lg mb-4">
          Master algorithm patterns through interactive visualizations
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
        
        {/* PrepStreak Widget */}
        <div className="mt-6 flex justify-center">
          <PrepStreak onSelectProblem={onSelect} />
        </div>
        
        {/* Navigation to Patterns, Dashboard, and Trainer */}
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => onSelect('company-paths')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg hover:border-blue-400 transition-all font-medium text-blue-400 hover:text-blue-300"
          >
            <Building2 size={18} />
            Company Paths
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelect('trainer')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg hover:border-pink-400 transition-all font-medium text-pink-400 hover:text-pink-300"
          >
            <Brain size={18} />
            Pattern Trainer
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelect('verbal-trainer')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-lg hover:border-orange-400 transition-all font-medium text-orange-400 hover:text-orange-300"
          >
            <Mic size={18} />
            Verbal Trainer
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelect('bug-hunter')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg hover:border-red-400 transition-all font-medium text-red-400 hover:text-red-300"
          >
            <Bug size={18} />
            Bug Hunter
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelect('prep-stats')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg hover:border-emerald-400 transition-all font-medium text-emerald-400 hover:text-emerald-300"
          >
            <TrendingUp size={18} />
            Prep Dashboard
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelect('dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:border-purple-400 transition-all font-medium text-purple-400 hover:text-purple-300"
          >
            <LayoutDashboard size={18} />
            Progress Dashboard
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelect('patterns')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg hover:border-cyan-400 transition-all font-medium text-cyan-400 hover:text-cyan-300"
          >
            <Lightbulb size={18} />
            Explore Algorithm Patterns
            <ChevronRight size={16} />
          </button>
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

// Wrapper that adds ProgressTracker to visualizers
function VisualizerWithProgress({ problemId }: { problemId: string }) {
  const problem = problems.find(p => p.id === problemId);
  
  return (
    <div>
      <Visualizer problemId={problemId} />
      {problem && (
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <ProgressTracker problemId={problemId} difficulty={problem.difficulty} />
        </div>
      )}
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
    case 'sudoku-solver':
      return <SudokuSolverVisualizer />;
    case 'n-queens':
      return <NQueensVisualizer />;
    // 1-D Dynamic Programming
    case 'climbing-stairs':
      return <ClimbingStairsVisualizer />;
    case 'coin-change':
      return <CoinChangeVisualizer />;
    case 'longest-increasing-subsequence':
      return <LongestIncreasingSubsequenceVisualizer />;
    // 2-D Dynamic Programming  
    case 'unique-paths':
      return <UniquePathsVisualizer />;
    // Graphs
    case 'number-of-islands':
      return <NumberOfIslandsVisualizer />;
    case 'clone-graph':
      return <CloneGraphVisualizer />;
    case 'course-schedule':
      return <CourseScheduleVisualizer />;
    case 'pacific-atlantic-water-flow':
      return <PacificAtlanticVisualizer />;
    case 'rotting-oranges':
      return <RottingOrangesVisualizer />;
    case 'surrounded-regions':
      return <SurroundedRegionsVisualizer />;
    case 'word-ladder':
      return <WordLadderVisualizer />;
    // Advanced Graphs
    case 'network-delay-time':
      return <NetworkDelayTimeVisualizer />;
    // Intervals
    case 'merge-intervals':
      return <MergeIntervalsVisualizer />;
    case 'insert-interval':
      return <InsertIntervalVisualizer />;
    case 'non-overlapping-intervals':
      return <NonOverlappingIntervalsVisualizer />;
    case 'meeting-rooms':
      return <MeetingRoomsVisualizer />;
    case 'meeting-rooms-ii':
      return <MeetingRoomsIIVisualizer />;
    // Two Pointers
    case '3sum':
      return <ThreeSumVisualizer />;
    case 'container-with-most-water':
      return <TwoPointersVisualizer />;
    case 'trapping-rain-water':
      return <TrappingRainWaterVisualizer />;
    // Stack
    case 'valid-parentheses':
      return <ValidParenthesesVisualizer />;
    case 'generate-parentheses':
      return <GenerateParenthesesVisualizer />;
    case 'daily-temperatures':
      return <DailyTemperaturesVisualizer />;
    case 'min-stack':
      return <MinStackVisualizer />;
    case 'evaluate-reverse-polish-notation':
      return <EvaluateReversePolishNotationVisualizer />;
    case 'largest-rectangle-in-histogram':
      return <LargestRectangleInHistogramVisualizer />;
    // Binary Search
    case 'binary-search':
      return <BinarySearchVisualizer />;
    case 'search-2d-matrix':
      return <Search2DMatrixVisualizer />;
    case 'koko-eating-bananas':
      return <KokoEatingBananasVisualizer />;
    case 'search-in-rotated-sorted-array':
      return <SearchInRotatedSortedArrayVisualizer />;
    case 'find-minimum-in-rotated-sorted-array':
      return <FindMinimumInRotatedSortedArrayVisualizer />;
    // Heap / Priority Queue
    case 'kth-largest-element-in-stream':
      return <KthLargestVisualizer />;
    case 'find-median-from-data-stream':
      return <FindMedianFromDataStreamVisualizer />;
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
    case 'kth-smallest-in-bst':
      return <KthSmallestElementInBSTVisualizer />;
    case 'lowest-common-ancestor-bst':
      return <LowestCommonAncestorBSTVisualizer />;
    case 'same-tree':
      return <SameTreeVisualizer />;
    case 'subtree-of-another-tree':
      return <SubtreeOfAnotherTreeVisualizer />;
    // Linked List
    case 'reverse-linked-list':
      return <ReverseLinkedListVisualizer />;
    case 'merge-two-sorted-lists':
      return <MergeTwoSortedListsVisualizer />;
    case 'reorder-list':
      return <ReorderListVisualizer />;
    case 'linked-list-cycle':
      return <LinkedListCycleVisualizer />;
    case 'remove-nth-node-from-end':
      return <RemoveNthNodeFromEndVisualizer />;
    case 'add-two-numbers':
      return <AddTwoNumbersVisualizer />;
    case 'find-the-duplicate-number':
      return <FindTheDuplicateNumberVisualizer />;
    case 'lru-cache':
      return <LRUCacheVisualizer />;
    // Sliding Window
    case 'best-time-to-buy-and-sell-stock':
      return <BestTimeToBuyAndSellStockVisualizer />;
    case 'longest-substring-without-repeating':
      return <LongestSubstringWithoutRepeatingVisualizer />;
    case 'minimum-window-substring':
      return <MinimumWindowSubstringVisualizer />;
    // Greedy
    case 'jump-game':
      return <JumpGameVisualizer />;
    // Tries
    case 'implement-trie':
      return <ImplementTrieVisualizer />;
    // Bit Manipulation
    case 'counting-bits':
      return <CountingBitsVisualizer />;
    // Math & Geometry
    case 'spiral-matrix':
      return <SpiralMatrixVisualizer />;
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
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const currentProblem = problems.find(p => p.id === view);
  
  return (
    <div className="min-h-screen bg-slate-900">
      {view !== 'home' && (
        <nav className="border-b border-slate-700 px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => {
              if (selectedCompany) {
                setSelectedCompany(null);
              } else if (patterns.find(p => p.id === view)) {
                setView('patterns');
              } else {
                setView('home');
              }
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <span className="text-slate-600">|</span>
          {view === 'patterns' ? (
            <span className="text-white font-medium">Algorithm Patterns</span>
          ) : patterns.find(p => p.id === view) ? (
            <>
              <span className="text-slate-400">Patterns</span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-medium">{patterns.find(p => p.id === view)?.name}</span>
            </>
          ) : view === 'prep-stats' ? (
            <span className="text-white font-medium">Prep Dashboard</span>
          ) : view === 'dashboard' ? (
            <span className="text-white font-medium">Progress Dashboard</span>
          ) : view === 'trainer' ? (
            <span className="text-white font-medium">Pattern Trainer</span>
          ) : view === 'verbal-trainer' ? (
            <span className="text-white font-medium">Verbal Trainer</span>
          ) : view === 'bug-hunter' ? (
            <span className="text-white font-medium">Bug Hunter</span>
          ) : view === 'company-paths' ? (
            <>
              <span className="text-white font-medium">Company Interview Paths</span>
              {selectedCompany && (
                <>
                  <span className="text-slate-600">/</span>
                  <span className="text-blue-400 font-medium capitalize">{selectedCompany}</span>
                </>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>
      )}
      
      {view === 'home' ? (
        <HomePage onSelect={setView} />
      ) : view === 'patterns' ? (
        <PatternsPage onSelectPattern={(patternId) => setView(patternId)} />
      ) : patterns.find(p => p.id === view) ? (
        <PatternDetailPage
          pattern={patterns.find(p => p.id === view)!}
          onBack={() => setView('patterns')}
          onSelectProblem={(id) => setView(id)}
        />
      ) : view === 'prep-stats' ? (
        <PrepDashboard />
      ) : view === 'dashboard' ? (
        <DashboardPage onSelectProblem={setView} />
      ) : view === 'trainer' ? (
        <PatternTrainerPage />
      ) : view === 'verbal-trainer' ? (
        <VerbalTrainerPage />
      ) : view === 'bug-hunter' ? (
        <BugHunterPage />
      ) : view === 'company-paths' ? (
        selectedCompany ? (
          <CompanyPathDetailPage
            companyId={selectedCompany}
            onSelectProblem={(problemId) => {
              setView(problemId);
            }}
            onBack={() => setSelectedCompany(null)}
          />
        ) : (
          <CompanyPathsPage
            onSelectCompany={(companyId) => setSelectedCompany(companyId)}
          />
        )
      ) : (
        <VisualizerWithProgress problemId={view} />
      )}
    </div>
  );
}

export default App;
