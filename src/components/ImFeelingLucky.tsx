import { useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Zap, AlertCircle, TrendingDown } from 'lucide-react';

interface AirtableRecord {
  id: string;
  fields: {
    Date: string;
    Title?: string;
    Category?: string;
    Difficulty?: string;
    Duration?: number;
    Completion?: string;
  };
}

interface CategoryStats {
  category: string;
  count: number;
  lastPracticed: Date | null;
  daysSinceLastPractice: number;
  avgDuration: number;
}

const AIRTABLE_CONFIG = {
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || '',
  tableId: import.meta.env.VITE_AIRTABLE_TABLE_ID || '',
  apiToken: import.meta.env.VITE_AIRTABLE_TOKEN || ''
};

// All available visualized problems grouped by category
const VISUALIZED_PROBLEMS_BY_CATEGORY = {
  'Arrays & Hashing': [
    'contains-duplicate', 'valid-anagram', 'two-sum', 'group-anagrams', 
    'top-k-frequent-elements', 'encode-and-decode-strings', 'product-of-array-except-self',
    'valid-sudoku', 'longest-consecutive-sequence'
  ],
  'Two Pointers': [
    '3sum', 'container-with-most-water', 'trapping-rain-water'
  ],
  'Sliding Window': [
    'best-time-to-buy-and-sell-stock', 'longest-substring-without-repeating',
    'minimum-window-substring'
  ],
  'Stack': [
    'valid-parentheses', 'generate-parentheses', 'daily-temperatures',
    'min-stack', 'evaluate-reverse-polish-notation', 'largest-rectangle-in-histogram'
  ],
  'Binary Search': [
    'binary-search', 'search-2d-matrix', 'koko-eating-bananas',
    'search-in-rotated-sorted-array', 'find-minimum-in-rotated-sorted-array'
  ],
  'Linked List': [
    'reverse-linked-list', 'merge-two-sorted-lists', 'reorder-list',
    'linked-list-cycle', 'remove-nth-node-from-end', 'add-two-numbers',
    'find-the-duplicate-number', 'lru-cache'
  ],
  'Trees': [
    'binary-tree-level-order-traversal', 'binary-tree-right-side-view',
    'count-good-nodes', 'invert-binary-tree', 'maximum-depth-of-binary-tree',
    'validate-bst', 'kth-smallest-in-bst', 'lowest-common-ancestor-bst',
    'same-tree', 'subtree-of-another-tree'
  ],
  'Tries': [
    'implement-trie'
  ],
  'Heap / Priority Queue': [
    'kth-largest-element-in-stream', 'find-median-from-data-stream'
  ],
  'Backtracking': [
    'subsets', 'subsets-ii', 'combination-sum', 'combination-sum-ii',
    'permutations', 'word-search', 'palindrome-partitioning',
    'letter-combinations', 'sudoku-solver', 'n-queens'
  ],
  'Graphs': [
    'number-of-islands', 'clone-graph', 'course-schedule',
    'pacific-atlantic-water-flow', 'rotting-oranges', 'surrounded-regions',
    'word-ladder'
  ],
  'Advanced Graphs': [
    'network-delay-time'
  ],
  '1-D Dynamic Programming': [
    'climbing-stairs', 'coin-change', 'longest-increasing-subsequence'
  ],
  '2-D Dynamic Programming': [
    'unique-paths'
  ],
  'Greedy': [
    'jump-game'
  ],
  'Intervals': [
    'merge-intervals', 'insert-interval', 'non-overlapping-intervals',
    'meeting-rooms', 'meeting-rooms-ii'
  ],
  'Math & Geometry': [
    'spiral-matrix'
  ],
  'Bit Manipulation': [
    'counting-bits'
  ]
} as const;

interface ImFeelingLuckyProps {
  onSelectProblem: (problemId: string) => void;
}

export function ImFeelingLucky({ onSelectProblem }: ImFeelingLuckyProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRecommendation, setLastRecommendation] = useState<{
    problemId: string;
    reason: string;
  } | null>(null);

  const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const [currentDice, setCurrentDice] = useState(0);

  const animateDice = () => {
    let counter = 0;
    const interval = setInterval(() => {
      setCurrentDice((prev) => (prev + 1) % diceIcons.length);
      counter++;
      if (counter >= 8) { // Roll for about 800ms
        clearInterval(interval);
      }
    }, 100);
  };

  const fetchAirtableData = async (): Promise<AirtableRecord[]> => {
    if (!AIRTABLE_CONFIG.baseId || !AIRTABLE_CONFIG.tableId || !AIRTABLE_CONFIG.apiToken) {
      throw new Error('Airtable configuration missing');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableId}?sort[0][field]=Date&sort[0][direction]=desc&pageSize=100`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    return data.records || [];
  };

  const analyzeWeakCategories = (records: AirtableRecord[]): string[] => {
    const now = new Date();
    const categoryStats: { [key: string]: CategoryStats } = {};

    // Initialize all categories
    Object.keys(VISUALIZED_PROBLEMS_BY_CATEGORY).forEach(category => {
      categoryStats[category] = {
        category,
        count: 0,
        lastPracticed: null,
        daysSinceLastPractice: Infinity,
        avgDuration: 0
      };
    });

    // Analyze records from the last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    records
      .filter(record => record.fields.Date && new Date(record.fields.Date) >= thirtyDaysAgo)
      .forEach(record => {
        const category = record.fields.Category;
        if (category && categoryStats[category]) {
          const practiceDate = new Date(record.fields.Date);
          categoryStats[category].count++;
          
          if (!categoryStats[category].lastPracticed || practiceDate > categoryStats[category].lastPracticed) {
            categoryStats[category].lastPracticed = practiceDate;
            categoryStats[category].daysSinceLastPractice = Math.floor(
              (now.getTime() - practiceDate.getTime()) / (24 * 60 * 60 * 1000)
            );
          }
        }
      });

    // Sort categories by weakness (least practiced + longest time since practice)
    const sortedCategories = Object.values(categoryStats)
      .sort((a, b) => {
        // Priority: never practiced > long time since practice > low count
        if (a.count === 0 && b.count > 0) return -1;
        if (b.count === 0 && a.count > 0) return 1;
        
        if (a.count === 0 && b.count === 0) {
          // Both never practiced, random order
          return Math.random() - 0.5;
        }

        // Weight: days since practice (70%) + inverse count (30%)
        const aScore = a.daysSinceLastPractice * 0.7 + (10 - a.count) * 0.3;
        const bScore = b.daysSinceLastPractice * 0.7 + (10 - b.count) * 0.3;
        
        return bScore - aScore;
      });

    // Return top 3 weakest categories
    return sortedCategories.slice(0, 3).map(stat => stat.category);
  };

  const selectRandomProblem = (weakCategories: string[]): { problemId: string; reason: string } => {
    const availableProblems: { problemId: string; category: string }[] = [];

    // Collect problems from weak categories
    weakCategories.forEach(category => {
      const problems = VISUALIZED_PROBLEMS_BY_CATEGORY[category as keyof typeof VISUALIZED_PROBLEMS_BY_CATEGORY];
      if (problems) {
        problems.forEach(problemId => {
          availableProblems.push({ problemId, category });
        });
      }
    });

    if (availableProblems.length === 0) {
      // Fallback: pick from all visualized problems
      const allProblems: string[] = [];
      Object.values(VISUALIZED_PROBLEMS_BY_CATEGORY).forEach(categoryProblems => {
        allProblems.push(...categoryProblems);
      });
      
      const randomProblem = allProblems[Math.floor(Math.random() * allProblems.length)];
      return {
        problemId: randomProblem,
        reason: "Random selection from all available visualizers"
      };
    }

    const selected = availableProblems[Math.floor(Math.random() * availableProblems.length)];
    const isNeverPracticed = weakCategories.length > 0;
    
    return {
      problemId: selected.problemId,
      reason: isNeverPracticed 
        ? `Focusing on ${selected.category} - your weakest area` 
        : `Strengthening ${selected.category} skills`
    };
  };

  const handleLuckyClick = async () => {
    setIsLoading(true);
    setIsRolling(true);
    setError(null);
    
    animateDice();

    try {
      // Add some delay for the dice animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const records = await fetchAirtableData();
      const weakCategories = analyzeWeakCategories(records);
      const selection = selectRandomProblem(weakCategories);
      
      setLastRecommendation(selection);
      
      // Navigate to the selected problem
      onSelectProblem(selection.problemId);
      
    } catch (err) {
      console.error('Error in I\'m Feeling Lucky:', err);
      
      // Fallback: pick truly random from all visualized problems
      const allProblems: string[] = [];
      Object.values(VISUALIZED_PROBLEMS_BY_CATEGORY).forEach(categoryProblems => {
        allProblems.push(...categoryProblems);
      });
      
      const randomProblem = allProblems[Math.floor(Math.random() * allProblems.length)];
      const fallbackSelection = {
        problemId: randomProblem,
        reason: "Random selection (Airtable fetch failed)"
      };
      
      setLastRecommendation(fallbackSelection);
      setError("Couldn't analyze your practice history, but here's a random problem!");
      
      onSelectProblem(fallbackSelection.problemId);
      
    } finally {
      setIsLoading(false);
      setIsRolling(false);
    }
  };

  const CurrentDiceIcon = diceIcons[currentDice];

  return (
    <div className="group">
      <button
        onClick={handleLuckyClick}
        disabled={isLoading}
        className={`relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500/40 rounded-xl hover:border-yellow-400 transition-all duration-300 font-bold text-lg text-yellow-400 hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-75 hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-105 transform ${
          isRolling ? 'animate-pulse scale-105' : ''
        }`}
        title="Picks a problem from your weak areas"
      >
        <div className={`p-1 rounded-lg bg-yellow-500/20 ${isRolling ? 'animate-spin' : 'group-hover:animate-bounce'}`}>
          {isRolling ? (
            <CurrentDiceIcon size={24} className="text-yellow-400" />
          ) : (
            <Zap size={24} className="text-yellow-400" />
          )}
        </div>
        
        <span className="flex items-center gap-2">
          I'm Feeling Lucky 🎲
          {isLoading && <span className="text-sm">Rolling...</span>}
        </span>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </button>
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-orange-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {lastRecommendation && !error && (
        <div className="mt-2 flex items-center gap-2 text-slate-400 text-sm">
          <TrendingDown size={16} />
          <span>{lastRecommendation.reason}</span>
        </div>
      )}
    </div>
  );
}