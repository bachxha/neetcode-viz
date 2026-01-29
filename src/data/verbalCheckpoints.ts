/**
 * Verbal Explanation Checkpoints
 * Define what a good technical explanation should cover
 */

export interface ExplanationCheckpoint {
  id: string;
  label: string;
  description: string;
  keywords: string[]; // words/phrases that indicate this was covered
  importance: 'required' | 'recommended' | 'bonus';
  tips: string[];
}

export const explanationCheckpoints: ExplanationCheckpoint[] = [
  {
    id: 'problem-understanding',
    label: 'Problem Understanding',
    description: 'Restate the problem in your own words to confirm understanding',
    keywords: [
      'the problem asks',
      'we need to find',
      'we need to return',
      'given an array',
      'given a string',
      'the goal is',
      'we want to',
      'essentially',
      'in other words',
      'what we\'re trying to do',
      'the input is',
      'the output should',
      'find the',
      'return the',
      'calculate the',
      'determine if',
      'check whether',
    ],
    importance: 'required',
    tips: [
      'Start by restating the problem in your own words',
      'Clarify inputs and expected outputs',
      'Mention any constraints or edge cases upfront',
    ],
  },
  {
    id: 'approach-explanation',
    label: 'Approach Explanation',
    description: 'Explain the algorithm or pattern you\'ll use',
    keywords: [
      'i\'ll use',
      'my approach',
      'the pattern is',
      'the idea is',
      'the strategy',
      'we can use',
      'i would use',
      'the algorithm',
      'using a',
      'we\'ll iterate',
      'we\'ll traverse',
      'first we',
      'then we',
      'the key insight',
      'the trick is',
      'hash map',
      'two pointer',
      'sliding window',
      'binary search',
      'dynamic programming',
      'dfs',
      'bfs',
      'recursion',
      'backtracking',
      'greedy',
      'divide and conquer',
      'stack',
      'queue',
      'heap',
    ],
    importance: 'required',
    tips: [
      'Name the algorithm pattern explicitly',
      'Explain WHY this approach works',
      'Walk through the high-level steps',
    ],
  },
  {
    id: 'time-complexity',
    label: 'Time Complexity',
    description: 'Analyze and state the time complexity',
    keywords: [
      'time complexity',
      'o of',
      'o(n)',
      'o(1)',
      'o(log n)',
      'o(n log n)',
      'o(n squared)',
      'o(n^2)',
      'o(2^n)',
      'runs in',
      'linear time',
      'constant time',
      'logarithmic',
      'quadratic',
      'exponential',
      'the runtime is',
      'time is',
    ],
    importance: 'required',
    tips: [
      'State the Big-O explicitly',
      'Explain what n represents',
      'Break down nested operations',
    ],
  },
  {
    id: 'space-complexity',
    label: 'Space Complexity',
    description: 'Analyze and state the space complexity',
    keywords: [
      'space complexity',
      'extra space',
      'additional space',
      'in-place',
      'no extra space',
      'memory usage',
      'space is o',
      'uses o(',
      'allocate',
      'storing',
      'auxiliary space',
      'constant space',
      'linear space',
    ],
    importance: 'required',
    tips: [
      'Don\'t forget to mention space!',
      'Consider both auxiliary and input space',
      'Mention if solution is in-place',
    ],
  },
  {
    id: 'edge-cases',
    label: 'Edge Cases',
    description: 'Discuss edge cases and how to handle them',
    keywords: [
      'edge case',
      'empty',
      'null',
      'single element',
      'one element',
      'negative',
      'zero',
      'duplicate',
      'what if',
      'corner case',
      'special case',
      'boundary',
      'overflow',
      'underflow',
      'invalid input',
      'edge condition',
      'no elements',
      'all same',
      'sorted',
      'unsorted',
    ],
    importance: 'recommended',
    tips: [
      'Think about empty/null inputs',
      'Consider single-element cases',
      'Check for duplicates if relevant',
      'Think about numeric edge cases (0, negative, overflow)',
    ],
  },
  {
    id: 'tradeoffs',
    label: 'Trade-offs',
    description: 'Discuss alternative approaches and trade-offs',
    keywords: [
      'alternatively',
      'trade-off',
      'trade off',
      'could also',
      'another approach',
      'one option',
      'versus',
      'compared to',
      'brute force',
      'optimize',
      'instead of',
      'the downside',
      'the benefit',
      'pros and cons',
      'if we had more space',
      'if we had more time',
      'other solutions',
      'different approach',
    ],
    importance: 'bonus',
    tips: [
      'Mention at least one alternative approach',
      'Explain space/time trade-offs',
      'Compare your approach to brute force',
    ],
  },
];

// Common filler words to detect
export const fillerWords = [
  'um',
  'uh',
  'like',
  'you know',
  'basically',
  'actually',
  'literally',
  'so yeah',
  'kind of',
  'sort of',
  'i mean',
  'i guess',
  'right',
  'yeah',
  'okay so',
  'well',
  'er',
  'ah',
];

// Tips for reducing filler words
export const fillerTips = [
  'Pause instead of saying "um" or "uh"',
  'Slow down your speaking pace',
  'Practice with a timer to build fluency',
  'Use silence as a tool - it\'s better than fillers',
  'Prepare key transition phrases beforehand',
];

// Scoring weights
export const checkpointWeights: Record<string, number> = {
  'problem-understanding': 15,
  'approach-explanation': 25,
  'time-complexity': 20,
  'space-complexity': 15,
  'edge-cases': 15,
  'tradeoffs': 10,
};

export function getCheckpointById(id: string): ExplanationCheckpoint | undefined {
  return explanationCheckpoints.find(c => c.id === id);
}
