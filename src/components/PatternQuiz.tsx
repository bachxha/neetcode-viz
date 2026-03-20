import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, X, RefreshCw, Trophy, Target, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface QuizProblem {
  id: string;
  name: string;
  statement: string;
  hints: string[];
  correctPattern: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Hash Map',
  'Stack',
  'Heap / Priority Queue',
  'Tree Traversal',
  'Graph (BFS/DFS)',
  'Dynamic Programming',
  'Backtracking',
  'Greedy',
  'Linked List',
];

// Quiz problems - curated set that test pattern recognition
const QUIZ_PROBLEMS: QuizProblem[] = [
  {
    id: 'container-water',
    name: 'Container With Most Water',
    statement: 'Given n non-negative integers representing heights of vertical lines, find two lines that together with the x-axis form a container that holds the most water.',
    hints: ['Think about starting from the edges', 'How can you decide which pointer to move?'],
    correctPattern: 'Two Pointers',
    explanation: 'Two pointers start at both ends. Move the pointer with smaller height inward since moving the larger one can only decrease area.',
    difficulty: 'Medium',
  },
  {
    id: 'longest-substr',
    name: 'Longest Substring Without Repeating Characters',
    statement: 'Given a string, find the length of the longest substring without repeating characters.',
    hints: ['You need to track characters in current window', 'When do you shrink vs expand?'],
    correctPattern: 'Sliding Window',
    explanation: 'Sliding window with a hash set. Expand right pointer, shrink left when duplicate found. Track max window size.',
    difficulty: 'Medium',
  },
  {
    id: 'koko-bananas',
    name: 'Koko Eating Bananas',
    statement: 'Given piles of bananas and h hours, find the minimum eating speed k such that Koko can eat all bananas within h hours.',
    hints: ['The answer is bounded between 1 and max pile size', 'Can you check if a given speed works?'],
    correctPattern: 'Binary Search',
    explanation: 'Binary search on the answer space (1 to max pile). For each speed, check if total hours ≤ h.',
    difficulty: 'Medium',
  },
  {
    id: 'two-sum',
    name: 'Two Sum',
    statement: 'Given an array of integers and a target, return indices of two numbers that add up to target. Each input has exactly one solution.',
    hints: ['What operation gives you the "partner" number?', 'How can you check if partner exists quickly?'],
    correctPattern: 'Hash Map',
    explanation: 'For each number, compute complement (target - num). Use hash map to check if complement exists in O(1).',
    difficulty: 'Easy',
  },
  {
    id: 'valid-parens',
    name: 'Valid Parentheses',
    statement: 'Given a string containing just parentheses characters, determine if the input string is valid (properly opened and closed).',
    hints: ['What needs to match with what?', 'Order matters - last opened should be first closed'],
    correctPattern: 'Stack',
    explanation: 'Push opening brackets onto stack. For closing brackets, check if stack top matches. Stack should be empty at end.',
    difficulty: 'Easy',
  },
  {
    id: 'kth-largest',
    name: 'Kth Largest Element in a Stream',
    statement: 'Design a class that finds the kth largest element in a stream. The class should support adding new numbers and returning the kth largest.',
    hints: ['You only care about the k largest elements', 'What data structure gives you the smallest of a set efficiently?'],
    correctPattern: 'Heap / Priority Queue',
    explanation: 'Maintain a min-heap of size k. The root is always the kth largest. When adding, push and pop if size exceeds k.',
    difficulty: 'Easy',
  },
  {
    id: 'max-depth',
    name: 'Maximum Depth of Binary Tree',
    statement: 'Given the root of a binary tree, return its maximum depth (number of nodes along the longest path from root to leaf).',
    hints: ['Base case: what is depth of empty tree?', 'How does child depth relate to parent depth?'],
    correctPattern: 'Tree Traversal',
    explanation: 'DFS recursion: max depth = 1 + max(left depth, right depth). Base case: null node returns 0.',
    difficulty: 'Easy',
  },
  {
    id: 'num-islands',
    name: 'Number of Islands',
    statement: 'Given a 2D grid of "1"s (land) and "0"s (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands.',
    hints: ['When you find land, how do you mark the whole island?', 'What prevents counting the same island twice?'],
    correctPattern: 'Graph (BFS/DFS)',
    explanation: 'For each unvisited "1", increment count and flood-fill (DFS/BFS) to mark all connected land as visited.',
    difficulty: 'Medium',
  },
  {
    id: 'coin-change',
    name: 'Coin Change',
    statement: 'Given coin denominations and a target amount, find the fewest number of coins needed to make that amount. Return -1 if impossible.',
    hints: ['For amount X, what are the possible last coins used?', 'Can you build up from smaller amounts?'],
    correctPattern: 'Dynamic Programming',
    explanation: 'DP where dp[i] = min coins for amount i. For each amount, try each coin: dp[i] = min(dp[i], dp[i-coin] + 1).',
    difficulty: 'Medium',
  },
  {
    id: 'subsets',
    name: 'Subsets',
    statement: 'Given an integer array of unique elements, return all possible subsets (the power set).',
    hints: ['For each element, you have a choice', 'Think recursively: include or exclude'],
    correctPattern: 'Backtracking',
    explanation: 'Backtracking: for each element, branch into include/exclude. Build subsets incrementally and backtrack.',
    difficulty: 'Medium',
  },
  {
    id: 'jump-game',
    name: 'Jump Game',
    statement: 'Given an array where each element represents max jump length at that position, determine if you can reach the last index starting from index 0.',
    hints: ['Do you need to try every path?', 'What if you track the furthest reachable position?'],
    correctPattern: 'Greedy',
    explanation: 'Greedy: track max reachable index. At each position, update max reach. If current index > max reach, return false.',
    difficulty: 'Medium',
  },
  {
    id: 'reverse-ll',
    name: 'Reverse Linked List',
    statement: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
    hints: ['You need to change where each node points', 'What pointers do you need to track?'],
    correctPattern: 'Linked List',
    explanation: 'Iterative: use prev, curr, next pointers. At each step, reverse the link and advance all pointers.',
    difficulty: 'Easy',
  },
];

interface QuizStats {
  total: number;
  correct: number;
  byPattern: Record<string, { total: number; correct: number }>;
}

function loadStats(): QuizStats {
  try {
    const saved = localStorage.getItem('patternQuizStats');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { total: 0, correct: 0, byPattern: {} };
}

function saveStats(stats: QuizStats) {
  localStorage.setItem('patternQuizStats', JSON.stringify(stats));
}

export function PatternQuiz() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentProblem, setCurrentProblem] = useState<QuizProblem | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(0);
  const [stats, setStats] = useState<QuizStats>(loadStats);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  // Pick a random problem
  const pickNewProblem = () => {
    const idx = Math.floor(Math.random() * QUIZ_PROBLEMS.length);
    setCurrentProblem(QUIZ_PROBLEMS[idx]);
    setSelectedPattern(null);
    setShowResult(false);
    setShowHint(0);
  };

  useEffect(() => {
    pickNewProblem();
  }, []);

  const handleSubmit = () => {
    if (!selectedPattern || !currentProblem) return;
    
    const isCorrect = selectedPattern === currentProblem.correctPattern;
    setShowResult(true);
    setSessionTotal(t => t + 1);
    
    if (isCorrect) {
      setSessionCorrect(c => c + 1);
    }

    // Update persistent stats
    setStats(prev => {
      const updated = {
        total: prev.total + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        byPattern: { ...prev.byPattern },
      };
      
      const pattern = currentProblem.correctPattern;
      if (!updated.byPattern[pattern]) {
        updated.byPattern[pattern] = { total: 0, correct: 0 };
      }
      updated.byPattern[pattern].total++;
      if (isCorrect) updated.byPattern[pattern].correct++;
      
      saveStats(updated);
      return updated;
    });
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const sessionAccuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Easy') return 'text-green-400';
    if (diff === 'Medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!currentProblem) return null;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Brain className="text-purple-500" size={32} />
            <div>
              <h1 className="text-2xl font-bold">Pattern Recognition Quiz</h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Identify the algorithm pattern before solving
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className={`flex gap-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            <div className="flex items-center gap-1">
              <Target size={16} />
              <span>Session: {sessionCorrect}/{sessionTotal}</span>
              {sessionTotal > 0 && (
                <span className={sessionAccuracy >= 70 ? 'text-green-400' : 'text-yellow-400'}>
                  ({sessionAccuracy}%)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={16} />
              <span>All-time: {stats.correct}/{stats.total}</span>
              {stats.total > 0 && (
                <span className={accuracy >= 70 ? 'text-green-400' : 'text-yellow-400'}>
                  ({accuracy}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Problem Card */}
        <motion.div
          key={currentProblem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{currentProblem.name}</h2>
            <span className={`text-sm font-medium ${getDifficultyColor(currentProblem.difficulty)}`}>
              {currentProblem.difficulty}
            </span>
          </div>
          
          <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            {currentProblem.statement}
          </p>

          {/* Hints */}
          {!showResult && showHint < currentProblem.hints.length && (
            <button
              onClick={() => setShowHint(h => h + 1)}
              className={`text-sm flex items-center gap-1 mb-4 ${
                isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
              }`}
            >
              <Zap size={14} />
              Show hint ({showHint + 1}/{currentProblem.hints.length})
            </button>
          )}
          
          <AnimatePresence>
            {showHint > 0 && !showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-purple-50'}`}
              >
                {currentProblem.hints.slice(0, showHint).map((hint, i) => (
                  <p key={i} className={`text-sm ${isDark ? 'text-slate-300' : 'text-purple-800'}`}>
                    💡 {hint}
                  </p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pattern Selection */}
        {!showResult && (
          <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
            <h3 className="font-medium mb-4">Which pattern does this problem use?</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PATTERNS.map(pattern => (
                <button
                  key={pattern}
                  onClick={() => setSelectedPattern(pattern)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedPattern === pattern
                      ? 'bg-purple-600 text-white'
                      : isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {pattern}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!selectedPattern}
              className={`w-full mt-4 py-3 rounded-lg font-medium transition-all ${
                selectedPattern
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : isDark
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-6 mb-6 ${
                selectedPattern === currentProblem.correctPattern
                  ? 'bg-green-900/30 border border-green-500/50'
                  : 'bg-red-900/30 border border-red-500/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {selectedPattern === currentProblem.correctPattern ? (
                  <>
                    <Check className="text-green-400" size={24} />
                    <span className="text-green-400 font-semibold text-lg">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="text-red-400" size={24} />
                    <span className="text-red-400 font-semibold text-lg">
                      Not quite — it's {currentProblem.correctPattern}
                    </span>
                  </>
                )}
              </div>
              
              <p className={`${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {currentProblem.explanation}
              </p>
              
              <button
                onClick={pickNewProblem}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
              >
                <RefreshCw size={16} />
                Next Problem
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pattern Stats */}
        {stats.total > 0 && (
          <div className={`rounded-xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
            <h3 className="font-medium mb-4">Your Pattern Accuracy</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(stats.byPattern)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([pattern, data]) => {
                  const acc = Math.round((data.correct / data.total) * 100);
                  return (
                    <div
                      key={pattern}
                      className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}
                    >
                      <div className="text-sm font-medium">{pattern}</div>
                      <div className={`text-xs ${acc >= 70 ? 'text-green-400' : acc >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {data.correct}/{data.total} ({acc}%)
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
