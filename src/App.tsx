import { useState, useEffect } from 'react';
import { ComplexityBadges } from './components/ComplexityBadge';
import { ThemeProvider } from './contexts/ThemeContext';
import { FocusProvider } from './contexts/FocusContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { CompletionProvider } from './contexts/CompletionContext';
import { NotesProvider } from './contexts/NotesContext';
import { TimeTrackerProvider } from './contexts/TimeTrackerContext';
import { AchievementsProvider } from './contexts/AchievementsContext';
import { RecentProblemsProvider } from './contexts/RecentProblemsContext';
import { useAchievementIntegration } from './hooks/useAchievementIntegration';
import { ThemeToggle } from './components/ThemeToggle';
import { FocusModeToggle, FocusExitButton } from './components/FocusModeToggle';
import { SearchBar } from './components/SearchBar';
import { DifficultyFilter } from './components/DifficultyFilter';
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
import { ContainerWithMostWaterVisualizer } from './visualizers/ContainerWithMostWaterVisualizer';
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
import { CompanyPrepPage } from './pages/CompanyPrepPage';
import { Blind75Page } from './pages/Blind75Page';
import { ProgressTracker, ProgressBadge } from './components/ProgressTracker';
import { PrepDashboard } from './components/PrepDashboard';
import { StreakWidget } from './components/StreakWidget';
import { PracticeStats } from './components/PracticeStats';
import { StatsCard } from './components/StatsCard';
import { ProgressDashboard } from './pages/ProgressDashboard';
import { PatternDrill } from './components/PatternDrill';
import { ImFeelingLucky } from './components/ImFeelingLucky';
import { WhatsNew, useWhatsNew } from './components/WhatsNew';
import { ExportImportModal } from './components/ExportImportModal';
import { ReviewDue } from './components/ReviewDue';
import { DailyChallenge } from './components/DailyChallenge';
import QuickReview from './components/QuickReview';
import { PatternQuiz } from './components/PatternQuiz';
import { ComparePage } from './pages/ComparePage';
import { hasComparison } from './data/comparisons';
import { problems, categories, type Problem, type Category, type Difficulty } from './data/problems';
import { BookmarkButton } from './components/BookmarkButton';
import { CompletionButton } from './components/CompletionButton';
import { Notes } from './components/Notes';
import { useBookmarks } from './contexts/BookmarkContext';
import { useCompletions } from './contexts/CompletionContext';
import { useNotes } from './contexts/NotesContext';
import { useTimeTracker } from './contexts/TimeTrackerContext';
import { useFocus } from './contexts/FocusContext';
import { useRecentProblems } from './contexts/RecentProblemsContext';
import { Timer } from './components/Timer';
import { RelatedProblems } from './components/RelatedProblems';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementToast } from './components/AchievementToast';
import { RecentProblems } from './components/RecentProblems';
import { WelcomeBack } from './components/WelcomeBack';
import { ChevronRight, ChevronDown, ExternalLink, Play, Lock, Lightbulb, LayoutDashboard, Brain, Building2, Mic, Bug, TrendingUp, Target, Sparkles, Star, Check, Download, Upload, Trophy, BarChart3 } from 'lucide-react';

type View = 'home' | 'patterns' | 'dashboard' | 'progress' | 'trainer' | 'verbal-trainer' | 'bug-hunter' | 'company-paths' | 'review' | string;

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

function ProblemCard({ problem, onSelect, onCompare }: { problem: Problem; onSelect: (id: string) => void; onCompare?: (id: string) => void }) {
  const { hasNote } = useNotes();
  const { getStats, formatTime } = useTimeTracker();
  
  const timeStats = getStats(problem.id);
  
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        problem.hasVisualization ? 'cursor-pointer hover:border-blue-500' : ''
      }`}
      style={{
        backgroundColor: problem.hasVisualization ? 'var(--bg-card)' : 'var(--bg-secondary)',
        borderColor: problem.hasVisualization ? 'var(--border-primary)' : 'var(--border-secondary)',
        opacity: problem.hasVisualization ? 1 : 0.6
      }}
      onClick={() => problem.hasVisualization && onSelect(problem.id)}
    >
      <div 
        className="p-2 rounded-lg"
        style={{
          backgroundColor: problem.hasVisualization ? 'var(--accent-blue)/20' : 'var(--bg-tertiary)',
          color: problem.hasVisualization ? 'var(--accent-blue)' : 'var(--text-muted)'
        }}
      >
        {problem.hasVisualization ? <Play size={16} /> : <Lock size={16} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span 
            className="font-medium truncate"
            style={{ 
              color: problem.hasVisualization ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            {problem.title}
          </span>
          <DifficultyBadge difficulty={problem.difficulty} />
          <ProgressBadge problemId={problem.id} />
          {problem.complexity && (
            <ComplexityBadges 
              timeComplexity={problem.complexity.time}
              spaceComplexity={problem.complexity.space}
              size="sm"
            />
          )}
          {hasNote(problem.id) && (
            <span className="text-xs" title="Has notes">📝</span>
          )}
          {timeStats && (
            <>
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full" title={`⏱️ Last: ${formatTime(timeStats.lastTime)}`}>
                ⏱️
              </span>
              {timeStats.attempts > 1 && (
                <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full" title={`${timeStats.attempts} attempts`}>
                  ×{timeStats.attempts}
                </span>
              )}
            </>
          )}
        </div>
        {timeStats && (
          <div className="text-xs text-slate-400 mt-1">
            Last: {formatTime(timeStats.lastTime)}
            {timeStats.bestTime !== Infinity && timeStats.bestTime !== timeStats.lastTime && (
              <span className="ml-2">• Best: {formatTime(timeStats.bestTime)}</span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {hasComparison(problem.id) && onCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompare(problem.id);
            }}
            className="p-1.5 rounded transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            title="Compare Approaches"
          >
            <BarChart3 size={14} />
          </button>
        )}
        <CompletionButton problemId={problem.id} size="sm" />
        <BookmarkButton problemId={problem.id} size="sm" />
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded transition-colors hover:opacity-80"
          style={{ 
            color: 'var(--text-secondary)'
          }}
          title="Open on LeetCode"
        >
          <ExternalLink size={14} />
        </a>
      </div>
      
      {problem.hasVisualization && (
        <ChevronRight style={{ color: 'var(--text-muted)' }} size={16} />
      )}
    </div>
  );
}

function CategorySection({ 
  category, 
  onSelectProblem,
  onCompareProblem,
  filterType = 'all',
  searchQuery = '',
  difficultyFilter = 'All'
}: { 
  category: Category; 
  onSelectProblem: (id: string) => void;
  onCompareProblem?: (id: string) => void;
  filterType?: 'all' | 'saved' | 'completed';
  searchQuery?: string;
  difficultyFilter?: 'All' | Difficulty;
}) {
  const { bookmarks } = useBookmarks();
  const { completions, getCompletionPercentage } = useCompletions();
  const [isOpen, setIsOpen] = useState(true);
  
  let categoryProblems = problems.filter(p => p.category === category);
  if (filterType === 'saved') {
    categoryProblems = categoryProblems.filter(p => bookmarks.includes(p.id));
  } else if (filterType === 'completed') {
    categoryProblems = categoryProblems.filter(p => completions.includes(p.id));
  }
  if (searchQuery.trim()) {
    categoryProblems = categoryProblems.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (difficultyFilter !== 'All') {
    categoryProblems = categoryProblems.filter(p => p.difficulty === difficultyFilter);
  }
  
  const withViz = categoryProblems.filter(p => p.hasVisualization).length;
  
  // Don't render category if no problems match the filter
  if (categoryProblems.length === 0) {
    return null;
  }
  
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
          {filterType === 'all' && (
            <div className="text-xs mt-1">
              <span className="text-green-400">{getCompletionPercentage(category)}% completed</span>
            </div>
          )}
        </div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {withViz > 0 && <span className="text-blue-400">{withViz} visualized · </span>}
          {categoryProblems.length} problems
        </span>
      </button>
      
      {isOpen && (
        <div 
          className="p-3 space-y-2 transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {categoryProblems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onSelect={onSelectProblem}
              onCompare={onCompareProblem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HomePage({ onSelect, onCompare, onShowExportImport, onShowAchievements }: { onSelect: (view: View) => void; onCompare?: (problemId: string) => void; onShowExportImport: () => void; onShowAchievements: () => void }) {
  const { bookmarkCount, bookmarks } = useBookmarks();
  const { completionCount, completions } = useCompletions();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'saved' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize difficulty filter from localStorage
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Difficulty>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neetcode-difficulty-filter') as ('All' | Difficulty);
      return saved || 'All';
    }
    return 'All';
  });

  // Persist difficulty filter to localStorage
  useEffect(() => {
    localStorage.setItem('neetcode-difficulty-filter', difficultyFilter);
  }, [difficultyFilter]);
  
  const totalProblems = problems.length;
  const totalWithViz = problems.filter(p => p.hasVisualization).length;
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="ml-auto mb-6 flex justify-end gap-3">
        <button
          onClick={onShowExportImport}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:border-green-400 transition-all text-sm font-medium text-green-400 hover:text-green-300"
          title="Export or import your progress data"
        >
          <Download size={16} />
          <Upload size={14} className="-ml-1" />
          Backup
        </button>
        <button
          onClick={onShowAchievements}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg hover:border-yellow-400 transition-all text-sm font-medium text-yellow-400 hover:text-yellow-300"
          title="View your achievement badges"
        >
          <Trophy size={16} />
          Achievements
        </button>
        <ThemeToggle />
      </div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AlgoForge
        </h1>
        <p className="text-slate-400 text-lg mb-4">
          Master algorithm patterns through interactive visualizations
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div 
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-primary)',
              border: '1px solid'
            }}
          >
            <span className="text-blue-400 font-bold">{totalWithViz}</span>
            <span style={{ color: 'var(--text-secondary)' }}> / {totalProblems} visualized</span>
          </div>
          <div 
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-primary)',
              border: '1px solid'
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>{categories.length} categories</span>
          </div>
        </div>
        
        {/* Review Due Component */}
        <div className="mt-6 max-w-2xl mx-auto">
          <ReviewDue onSelectProblem={onSelect} />
        </div>

        {/* Daily Challenge */}
        <div className="mt-6 max-w-4xl mx-auto">
          <DailyChallenge onSelectProblem={onSelect} />
        </div>

        {/* Practice Stats Widgets */}
        <div className="mt-6 flex justify-center gap-6 flex-wrap">
          <StatsCard 
            onNavigateToProblems={() => onSelect('home')} 
            onNavigateToDrill={() => onSelect('drill')} 
          />
          <StreakWidget onSelectProblem={onSelect} />
          <PracticeStats />
        </div>
        
        {/* I'm Feeling Lucky Button */}
        <div className="mt-6 flex justify-center">
          <ImFeelingLucky onSelectProblem={onSelect} />
          
          {/* Quick Review Button */}
          <button
            onClick={() => onSelect('review')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>📝</span>
            <span className="font-medium">Quick Review</span>
          </button>
        </div>
        
        {/* Navigation to Patterns, Dashboard, and Trainer */}
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => onSelect('blind75')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg hover:border-orange-400 transition-all font-medium text-orange-400 hover:text-orange-300"
          >
            <Target size={18} />
            Blind 75
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelect('drill')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg hover:border-cyan-400 transition-all font-medium text-cyan-400 hover:text-cyan-300"
          >
            <Target size={18} />
            Pattern Drill Mode
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelect('company')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg hover:border-emerald-400 transition-all font-medium text-emerald-400 hover:text-emerald-300"
          >
            <Building2 size={18} />
            Company Prep
            <ChevronRight size={16} />
          </button>
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
            onClick={() => onSelect('quiz')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-lg hover:border-violet-400 transition-all font-medium text-violet-400 hover:text-violet-300"
          >
            <Brain size={18} />
            Pattern Quiz
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
            onClick={() => onSelect('progress')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg hover:border-indigo-400 transition-all font-medium text-indigo-400 hover:text-indigo-300"
          >
            <TrendingUp size={18} />
            Analytics Dashboard
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
        
        {/* Filter buttons */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
              selectedFilter === 'all'
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                : 'bg-gray-500/10 border border-gray-500/30 text-gray-400 hover:text-gray-300 hover:border-gray-400'
            }`}
          >
            All Problems
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
              {totalProblems}
            </span>
          </button>
          <button
            onClick={() => setSelectedFilter('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
              selectedFilter === 'saved'
                ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                : 'bg-gray-500/10 border border-gray-500/30 text-gray-400 hover:text-gray-300 hover:border-gray-400'
            }`}
          >
            <Star size={16} className={selectedFilter === 'saved' ? 'fill-current' : ''} />
            Saved
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
              {bookmarkCount}
            </span>
          </button>
          <button
            onClick={() => setSelectedFilter('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
              selectedFilter === 'completed'
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-gray-500/10 border border-gray-500/30 text-gray-400 hover:text-gray-300 hover:border-gray-400'
            }`}
          >
            <Check size={16} className={selectedFilter === 'completed' ? 'fill-current' : ''} />
            Completed
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
              {completionCount}
            </span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mt-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search problems by name..."
            className="max-w-md mx-auto"
          />
        </div>
        
        {/* Difficulty Filter */}
        <div className="mt-6">
          <DifficultyFilter
            selectedDifficulty={difficultyFilter}
            onDifficultyChange={setDifficultyFilter}
            className="justify-center"
          />
        </div>
      </div>
      
      {/* Quick access to visualized problems */}
      {selectedFilter === 'all' && totalWithViz > 0 && !searchQuery.trim() && difficultyFilter === 'All' && (
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
                <div className="flex-1">
                  <div className="font-medium">{problem.title}</div>
                  <div className="text-sm text-slate-400">{problem.category}</div>
                  {problem.complexity && (
                    <div className="mt-2">
                      <ComplexityBadges 
                        timeComplexity={problem.complexity.time}
                        spaceComplexity={problem.complexity.space}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
                <DifficultyBadge difficulty={problem.difficulty} />
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* All problems by category */}
      <h2 className="text-lg font-semibold mb-3">
        {selectedFilter === 'all' ? 'All Problems' : selectedFilter === 'saved' ? 'Saved Problems' : 'Completed Problems'}
      </h2>
      
      {selectedFilter === 'saved' && bookmarkCount === 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <Star size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Saved Problems</h3>
          <p className="text-gray-400 mb-4">
            Click the star icon next to any problem to bookmark it for later practice.
          </p>
          <button
            onClick={() => setSelectedFilter('all')}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:border-blue-400 transition-all"
          >
            Browse All Problems
          </button>
        </div>
      )}
      
      {selectedFilter === 'completed' && completionCount === 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <Check size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Completed Problems</h3>
          <p className="text-gray-400 mb-4">
            Click the checkmark icon next to any problem to mark it as completed.
          </p>
          <button
            onClick={() => setSelectedFilter('all')}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:border-blue-400 transition-all"
          >
            Browse All Problems
          </button>
        </div>
      )}
      
      <div className="space-y-3">
        {categories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            onSelectProblem={onSelect}
            onCompareProblem={onCompare}
            filterType={selectedFilter}
            searchQuery={searchQuery}
            difficultyFilter={difficultyFilter}
          />
        ))}
      </div>
      
      {/* No results message */}
      {(searchQuery.trim() || difficultyFilter !== 'All') && (() => {
        const filteredProblems = problems.filter(p => {
          const matchesSearch = !searchQuery.trim() || p.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFilter = selectedFilter === 'all' || 
            (selectedFilter === 'saved' && bookmarks.includes(p.id)) ||
            (selectedFilter === 'completed' && completions.includes(p.id));
          const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
          return matchesSearch && matchesFilter && matchesDifficulty;
        });
        return filteredProblems.length === 0;
      })() && (
        <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/30 mt-6">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No problems found</h3>
          <p className="text-gray-400 mb-4">
            Try adjusting your search or removing filters.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:border-blue-400 transition-all"
            >
              Clear Search
            </button>
            <button
              onClick={() => setDifficultyFilter('All')}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:border-purple-400 transition-all"
            >
              Reset Difficulty
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center text-slate-500 text-sm">
        <p>More visualizations coming soon...</p>
        <p className="mt-1">Built for interview prep 🎯</p>
      </div>
    </div>
  );
}

// Wrapper that adds ProgressTracker to visualizers
function VisualizerWithProgress({ problemId, onSelectProblem }: { problemId: string; onSelectProblem: (id: string) => void }) {
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
  
  return (
    <div>
      {/* Timer Component */}
      <Timer problemSlug={problemId} />
      
      {/* Add bookmark button to the top of the visualizer */}
      {problem && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {problem.title}
              </h1>
              <DifficultyBadge difficulty={problem.difficulty} />
              {problem.complexity && (
                <ComplexityBadges 
                  timeComplexity={problem.complexity.time}
                  spaceComplexity={problem.complexity.space}
                  size="md"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <CompletionButton problemId={problemId} />
              <BookmarkButton problemId={problemId} />
            </div>
          </div>
          
          {/* Complexity Analysis section */}
          {problem.complexity && (
            <div className="mb-6 p-4 bg-gray-800/30 border border-gray-700/30 rounded-lg">
              <h3 className="text-sm font-semibold mb-2 text-gray-300">Complexity Analysis</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {problem.complexity.explanation}
              </p>
            </div>
          )}
          
          {/* Notes section */}
          <Notes problemId={problemId} className="mb-6" />
        </div>
      )}
      <Visualizer problemId={problemId} />
      {problem && (
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <ProgressTracker problemId={problemId} difficulty={problem.difficulty} />
          <RelatedProblems currentProblemId={problemId} onSelectProblem={onSelectProblem} />
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
      return <ContainerWithMostWaterVisualizer />;
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
  const [selectedCompanyPrep, setSelectedCompanyPrep] = useState<string | null>(null);
  const currentProblem = problems.find(p => p.id === view);
  
  // What's New modal functionality
  const { shouldShowModal, showModal, hideModal } = useWhatsNew();
  
  // Export/Import modal functionality
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  
  // Achievements modal functionality
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  
  return (
    <ThemeProvider>
      <FocusProvider>
        <BookmarkProvider>
          <RecentProblemsProvider>
            <CompletionProvider>
            <AchievementsProvider>
              <NotesProvider>
                <TimeTrackerProvider>
                <AppContent 
                  view={view}
                  setView={setView}
                  selectedCompany={selectedCompany}
                  setSelectedCompany={setSelectedCompany}
                  selectedCompanyPrep={selectedCompanyPrep}
                  setSelectedCompanyPrep={setSelectedCompanyPrep}
                  currentProblem={currentProblem}
                  shouldShowModal={shouldShowModal}
                  showModal={showModal}
                  hideModal={hideModal}
                  showExportImportModal={showExportImportModal}
                  setShowExportImportModal={setShowExportImportModal}
                  showAchievementsModal={showAchievementsModal}
                  setShowAchievementsModal={setShowAchievementsModal}
                />
                <AchievementToast />
                </TimeTrackerProvider>
              </NotesProvider>
            </AchievementsProvider>
            </CompletionProvider>
          </RecentProblemsProvider>
        </BookmarkProvider>
      </FocusProvider>
    </ThemeProvider>
  );
}

function AppContent({
  view,
  setView,
  selectedCompany,
  setSelectedCompany,
  selectedCompanyPrep,
  setSelectedCompanyPrep,
  currentProblem,
  shouldShowModal,
  showModal,
  hideModal,
  showExportImportModal,
  setShowExportImportModal,
  showAchievementsModal,
  setShowAchievementsModal
}: {
  view: View;
  setView: (view: View) => void;
  selectedCompany: string | null;
  setSelectedCompany: (company: string | null) => void;
  selectedCompanyPrep: string | null;
  setSelectedCompanyPrep: (company: string | null) => void;
  currentProblem: Problem | undefined;
  shouldShowModal: boolean;
  showModal: () => void;
  hideModal: () => void;
  showExportImportModal: boolean;
  setShowExportImportModal: (show: boolean) => void;
  showAchievementsModal: boolean;
  setShowAchievementsModal: (show: boolean) => void;
}) {
  // Initialize achievement integration
  useAchievementIntegration();
  
  // Get focus mode state
  const { isFocusMode } = useFocus();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Focus Exit Button */}
      <FocusExitButton />
      
      {view !== 'home' && !isFocusMode && (
        <nav 
          className="border-b px-6 py-3 flex items-center gap-4 transition-colors"
          style={{ 
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)'
          }}
        >
          <button
            onClick={() => {
              if (selectedCompanyPrep) {
                setSelectedCompanyPrep(null);
              } else if (selectedCompany) {
                setSelectedCompany(null);
              } else if (patterns.find(p => p.id === view)) {
                setView('patterns');
              } else {
                setView('home');
              }
            }}
            className="transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Back
          </button>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          {view === 'patterns' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Algorithm Patterns</span>
          ) : patterns.find(p => p.id === view) ? (
            <>
              <span style={{ color: 'var(--text-secondary)' }}>Patterns</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{patterns.find(p => p.id === view)?.name}</span>
            </>
          ) : view === 'prep-stats' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Prep Dashboard</span>
          ) : view === 'dashboard' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Progress Dashboard</span>
          ) : view === 'progress' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Analytics Dashboard</span>
          ) : view === 'trainer' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Pattern Trainer</span>
          ) : view === 'drill' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Pattern Drill Mode</span>
          ) : view === 'verbal-trainer' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Verbal Trainer</span>
          ) : view === 'bug-hunter' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Bug Hunter</span>
          ) : view === 'company' ? (
            <>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Company Prep</span>
              {selectedCompanyPrep && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                  <span className="font-medium text-emerald-400">{selectedCompanyPrep}</span>
                </>
              )}
            </>
          ) : view === 'company-paths' ? (
            <>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Company Interview Paths</span>
              {selectedCompany && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                  <span className="font-medium text-blue-400 capitalize">{selectedCompany}</span>
                </>
              )}
            </>
          ) : view === 'review' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>📝 Quick Review</span>
          ) : view === 'quiz' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>🧩 Pattern Quiz</span>
          ) : view === 'blind75' ? (
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>🎯 Blind 75</span>
          ) : (
            <>
              <span style={{ color: 'var(--text-secondary)' }}>{currentProblem?.category}</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{currentProblem?.title}</span>
              {currentProblem && (
                <a
                  href={currentProblem.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm hover:text-blue-400 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  LeetCode <ExternalLink size={14} />
                </a>
              )}
            </>
          )}
          
          {/* Focus Mode, Theme Toggle, Export/Import, Achievements, and What's New Button */}
          <div className="ml-auto flex items-center gap-3">
            <FocusModeToggle size="sm" showText={false} />
            <ThemeToggle />
            <RecentProblems onSelectProblem={setView} />
            <button
              onClick={() => setShowExportImportModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:border-green-400 transition-all text-sm font-medium text-green-400 hover:text-green-300"
              title="Export or import your progress data"
            >
              <Download size={16} />
              <Upload size={14} className="-ml-1" />
              Backup
            </button>
            <button
              onClick={() => setShowAchievementsModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg hover:border-yellow-400 transition-all text-sm font-medium text-yellow-400 hover:text-yellow-300"
              title="View your achievement badges"
            >
              <Trophy size={16} />
              Achievements
            </button>
            <button
              onClick={showModal}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg hover:border-blue-400 transition-all text-sm font-medium text-blue-400 hover:text-blue-300"
              title="See what's new in AlgoForge"
            >
              <Sparkles size={16} />
              What's New
            </button>
          </div>
        </nav>
      )}
      
      {view === 'home' ? (
        <HomePage 
          onSelect={setView} 
          onCompare={(problemId: string) => setView(`compare:${problemId}`)}
          onShowExportImport={() => setShowExportImportModal(true)} 
          onShowAchievements={() => setShowAchievementsModal(true)} 
        />
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
      ) : view === 'progress' ? (
        <ProgressDashboard />
      ) : view === 'trainer' ? (
        <PatternTrainerPage />
      ) : view === 'drill' ? (
        <PatternDrill onNavigateToProblem={setView} />
      ) : view === 'verbal-trainer' ? (
        <VerbalTrainerPage />
      ) : view === 'bug-hunter' ? (
        <BugHunterPage />
      ) : view === 'company' ? (
        <CompanyPrepPage
          selectedCompany={selectedCompanyPrep || undefined}
          onSelectCompany={setSelectedCompanyPrep}
        />
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
      ) : view === 'review' ? (
        <div className="max-w-2xl mx-auto">
          <QuickReview />
        </div>
      ) : view === 'quiz' ? (
        <PatternQuiz />
      ) : view === 'blind75' ? (
        <Blind75Page onSelectProblem={setView} />
      ) : view.startsWith('compare:') ? (
        <ComparePage 
          problemId={view.replace('compare:', '')}
          onBack={() => setView('home')}
          onSelectProblem={setView}
        />
      ) : (
        <VisualizerWithProgress problemId={view} onSelectProblem={setView} />
      )}
      
      {/* Welcome Back Component */}
      <WelcomeBack 
        onSelectProblem={setView}
        onStartQuiz={() => setView('quiz')}
      />
      
      {/* What's New Modal */}
      <WhatsNew 
        isOpen={shouldShowModal} 
        onClose={hideModal} 
      />
      
      {/* Export/Import Modal */}
      <ExportImportModal
        isOpen={showExportImportModal}
        onClose={() => setShowExportImportModal(false)}
      />
      
      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </div>
  );
}

export default App;
