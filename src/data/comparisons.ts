import type { Complexity } from './problems';

export interface ComparisonApproach {
  name: string;
  description: string;
  timeComplexity: Complexity;
  spaceComplexity: Complexity;
  visualizer: string; // component name
  codeFile: string;  // path to code solution file
}

export interface AlgorithmComparison {
  problemId: string;
  title: string;
  approaches: {
    bruteForce: ComparisonApproach;
    optimal: ComparisonApproach;
  };
  keyInsight: string;
}

export const comparisons: AlgorithmComparison[] = [
  {
    problemId: 'two-sum',
    title: 'Two Sum',
    approaches: {
      bruteForce: {
        name: 'Brute Force',
        description: 'Check every pair of numbers using nested loops',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        visualizer: 'TwoSumBruteVisualizer',
        codeFile: 'twoSumBrute'
      },
      optimal: {
        name: 'HashMap',
        description: 'One-pass with complement lookup using HashMap',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        visualizer: 'TwoSumVisualizer',
        codeFile: 'twoSum'
      }
    },
    keyInsight: 'Instead of checking all pairs (O(n²)), store what you\'ve seen and look up what you need (O(n)). Trading space for time is often the key to optimization.'
  },
  {
    problemId: 'binary-search',
    title: 'Search Algorithm',
    approaches: {
      bruteForce: {
        name: 'Linear Search',
        description: 'Check every element one by one from left to right',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        visualizer: 'LinearSearchVisualizer',
        codeFile: 'linearSearch'
      },
      optimal: {
        name: 'Binary Search',
        description: 'Divide and conquer on sorted array by halving search space',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        visualizer: 'BinarySearchComparisonVisualizer',
        codeFile: 'binarySearch'
      }
    },
    keyInsight: 'On sorted data, you can eliminate half of the possibilities with each comparison. This logarithmic reduction makes binary search exponentially faster than linear search as data size grows.'
  }
];

export function getComparison(problemId: string): AlgorithmComparison | undefined {
  return comparisons.find(comp => comp.problemId === problemId);
}

export function hasComparison(problemId: string): boolean {
  return comparisons.some(comp => comp.problemId === problemId);
}