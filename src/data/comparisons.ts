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
  },
  {
    problemId: 'container-with-most-water',
    title: 'Container With Most Water',
    approaches: {
      bruteForce: {
        name: 'Brute Force',
        description: 'Check every pair of lines using nested loops to find max area',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        visualizer: 'ContainerBruteForceVisualizer',
        codeFile: 'containerBruteForce'
      },
      optimal: {
        name: 'Two Pointers',
        description: 'Start from both ends, move the shorter pointer inward',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        visualizer: 'ContainerTwoPointersVisualizer',
        codeFile: 'containerTwoPointers'
      }
    },
    keyInsight: 'The area is limited by the shorter line. Moving the taller line can only decrease area (width shrinks, height stays same or drops). By always moving the shorter pointer, we explore all potentially better configurations in O(n) time.'
  },
  {
    problemId: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    approaches: {
      bruteForce: {
        name: 'Brute Force',
        description: 'Check every substring (n²) and verify each has no duplicates (O(n))',
        timeComplexity: 'O(n³)',
        spaceComplexity: 'O(1)',
        visualizer: 'LongestSubstringBruteVisualizer',
        codeFile: 'longestSubstringBrute'
      },
      optimal: {
        name: 'Sliding Window',
        description: 'Maintain window with Set, expand right and shrink left when duplicates found',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        visualizer: 'LongestSubstringSlidingVisualizer',
        codeFile: 'longestSubstringSliding'
      }
    },
    keyInsight: 'Instead of checking all substrings, maintain a window of unique characters. When a duplicate is found, slide the left boundary right until the duplicate is removed. Each character is added and removed at most once.'
  },
  {
    problemId: 'sorting',
    title: 'Sorting Algorithms',
    approaches: {
      bruteForce: {
        name: 'Bubble Sort',
        description: 'Compare adjacent elements repeatedly, bubbling larger elements to the end',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        visualizer: 'SortingComparisonVisualizer',
        codeFile: 'bubbleSort'
      },
      optimal: {
        name: 'Merge Sort',
        description: 'Divide array into smaller parts, sort them, and merge back efficiently',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        visualizer: 'SortingComparisonVisualizer',
        codeFile: 'mergeSort'
      }
    },
    keyInsight: 'While simple algorithms like Bubble Sort have O(n²) time complexity due to nested comparisons, divide-and-conquer approaches like Merge Sort achieve O(n log n) by breaking the problem into smaller subproblems. The logarithmic factor comes from the depth of recursion, making it significantly faster for large datasets.'
  }
];

export function getComparison(problemId: string): AlgorithmComparison | undefined {
  return comparisons.find(comp => comp.problemId === problemId);
}

export function hasComparison(problemId: string): boolean {
  return comparisons.some(comp => comp.problemId === problemId);
}