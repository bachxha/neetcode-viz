import React, { useState, useEffect, useCallback } from 'react';
import { problems } from '../data/problems';

interface ReviewCard {
  id: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  approach: string;
  patterns: string[];
}

// Problem approaches/hints for review
const problemApproaches: Record<string, { statement: string; approach: string; patterns: string[] }> = {
  'two-sum': {
    statement: 'Given an array of integers and a target, return indices of two numbers that add up to target.',
    approach: 'Use a hash map to store complement (target - num) as you iterate. O(n) time, O(n) space.',
    patterns: ['Hash Map', 'One Pass'],
  },
  'valid-parentheses': {
    statement: 'Given a string of brackets, determine if the input string is valid (properly opened and closed).',
    approach: 'Use a stack. Push opening brackets, pop and match for closing. Stack should be empty at end.',
    patterns: ['Stack', 'Matching'],
  },
  'merge-two-sorted-lists': {
    statement: 'Merge two sorted linked lists into one sorted list.',
    approach: 'Use dummy head, compare nodes, link smaller one. Handle remaining nodes at end.',
    patterns: ['Two Pointers', 'Linked List'],
  },
  'best-time-to-buy-and-sell-stock': {
    statement: 'Find maximum profit from buying and selling stock once.',
    approach: 'Track minimum price seen so far, calculate profit at each step, keep max profit.',
    patterns: ['Sliding Window', 'Kadane\'s'],
  },
  'binary-search': {
    statement: 'Search for target in sorted array, return index or -1.',
    approach: 'Use left/right pointers, compare mid element. Shrink search space by half each iteration.',
    patterns: ['Binary Search', 'Divide & Conquer'],
  },
  'invert-binary-tree': {
    statement: 'Invert a binary tree (mirror it).',
    approach: 'Recursively swap left and right children at each node. Base case: null node.',
    patterns: ['DFS', 'Recursion', 'Tree'],
  },
  'climbing-stairs': {
    statement: 'Count distinct ways to climb n stairs taking 1 or 2 steps.',
    approach: 'DP: ways[i] = ways[i-1] + ways[i-2]. Same as Fibonacci. O(n) time, O(1) space possible.',
    patterns: ['Dynamic Programming', 'Fibonacci'],
  },
  'number-of-islands': {
    statement: 'Count number of islands in a 2D grid of 1s (land) and 0s (water).',
    approach: 'DFS/BFS from each unvisited land cell, mark visited. Count number of DFS calls.',
    patterns: ['DFS', 'BFS', 'Graph', 'Flood Fill'],
  },
  'coin-change': {
    statement: 'Find minimum coins needed to make amount. Return -1 if impossible.',
    approach: 'DP: dp[i] = min coins for amount i. For each coin, dp[i] = min(dp[i], dp[i-coin] + 1).',
    patterns: ['Dynamic Programming', 'Bottom-Up'],
  },
  'lru-cache': {
    statement: 'Design LRU cache with O(1) get and put operations.',
    approach: 'Hash map for O(1) lookup + doubly linked list for O(1) removal/insertion. Move to front on access.',
    patterns: ['Hash Map', 'Doubly Linked List', 'Design'],
  },
  'three-sum': {
    statement: 'Find all unique triplets that sum to zero.',
    approach: 'Sort array. Fix one element, use two pointers for remaining two. Skip duplicates.',
    patterns: ['Two Pointers', 'Sorting'],
  },
  'container-with-most-water': {
    statement: 'Find two lines that form container with most water.',
    approach: 'Two pointers at ends. Move the shorter line inward. Area = min(heights) * width.',
    patterns: ['Two Pointers', 'Greedy'],
  },
  'maximum-subarray': {
    statement: 'Find contiguous subarray with largest sum.',
    approach: 'Kadane\'s: current_sum = max(num, current_sum + num). Track max seen.',
    patterns: ['Dynamic Programming', 'Kadane\'s'],
  },
  'product-of-array-except-self': {
    statement: 'Return array where each element is product of all other elements.',
    approach: 'Two passes: left products then right products. Multiply together. No division.',
    patterns: ['Prefix/Suffix', 'Array'],
  },
  'valid-anagram': {
    statement: 'Check if two strings are anagrams.',
    approach: 'Count character frequencies with hash map or array[26]. Compare counts.',
    patterns: ['Hash Map', 'Counting'],
  },
};

const QuickReview: React.FC = () => {
  const [completedProblems, setCompletedProblems] = useState<string[]>([]);
  const [reviewCards, setReviewCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Load completed problems
  useEffect(() => {
    const stored = localStorage.getItem('neetcode-completions');
    if (stored) {
      try {
        const completions = JSON.parse(stored);
        const completed = Object.keys(completions).filter(id => completions[id]);
        setCompletedProblems(completed);
      } catch (e) {
        console.error('Error loading completions:', e);
      }
    }
  }, []);

  // Build review cards from completed problems
  useEffect(() => {
    const cards: ReviewCard[] = [];
    
    completedProblems.forEach(id => {
      const problem = problems.find(p => p.id === id);
      const approach = problemApproaches[id];
      
      if (problem && approach) {
        cards.push({
          id: problem.id,
          name: problem.title,
          category: problem.category,
          difficulty: problem.difficulty,
          statement: approach.statement,
          approach: approach.approach,
          patterns: approach.patterns,
        });
      }
    });

    // Shuffle cards for variety
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setReviewCards(shuffled.slice(0, 10)); // Max 10 cards per session
  }, [completedProblems]);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleNext = useCallback(() => {
    setReviewedCount(prev => prev + 1);
    
    if (currentIndex < reviewCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      setSessionComplete(true);
    }
  }, [currentIndex, reviewCards.length]);

  const handleRestart = () => {
    const shuffled = [...reviewCards].sort(() => Math.random() - 0.5);
    setReviewCards(shuffled);
    setCurrentIndex(0);
    setIsRevealed(false);
    setReviewedCount(0);
    setSessionComplete(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (reviewCards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Quick Review</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Complete some problems first to unlock review mode!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Mark problems as solved to add them to your review deck.
        </p>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Session Complete!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You reviewed {reviewedCount} problem{reviewedCount !== 1 ? 's' : ''}
        </p>
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Start New Session
        </button>
      </div>
    );
  }

  const card = reviewCards[currentIndex];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <span className="font-semibold">Quick Review</span>
          </div>
          <div className="text-sm opacity-90">
            {currentIndex + 1} / {reviewCards.length}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Problem Info */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-2 py-1 rounded text-sm font-medium ${getDifficultyColor(card.difficulty)} bg-opacity-10`}>
            {card.difficulty}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">{card.category}</span>
        </div>

        {/* Problem Name */}
        <h3 className="text-xl font-bold mb-4 dark:text-white">{card.name}</h3>

        {/* Problem Statement */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-300">{card.statement}</p>
        </div>

        {/* Question Prompt */}
        {!isRevealed && (
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400 italic mb-4">
              How would you solve this? What patterns apply?
            </p>
            <button
              onClick={handleReveal}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              Reveal Approach
            </button>
          </div>
        )}

        {/* Revealed Approach */}
        {isRevealed && (
          <div className="space-y-4 animate-fadeIn">
            {/* Patterns */}
            <div className="flex flex-wrap gap-2">
              {card.patterns.map((pattern, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                >
                  {pattern}
                </span>
              ))}
            </div>

            {/* Approach */}
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-green-500">💡</span>
                <p className="text-green-800 dark:text-green-300">{card.approach}</p>
              </div>
            </div>

            {/* Next Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {currentIndex < reviewCards.length - 1 ? 'Next Card →' : 'Finish Session'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
          style={{ width: `${((currentIndex + (isRevealed ? 1 : 0)) / reviewCards.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default QuickReview;
