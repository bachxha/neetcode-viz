// Company-specific interview paths for AlgoForge
// Based on real interview patterns and commonly asked problems

export interface PhaseProblem {
  problemId: string;
  priority: 'must-do' | 'recommended' | 'bonus';
  notes?: string;
}

export interface Phase {
  name: string;
  weeks: number;
  description: string;
  problems: PhaseProblem[];
}

export interface CompanyPath {
  id: string;
  name: string;
  logo: string;
  description: string;
  interviewStructure: string;
  focusAreas: string[];
  timeline: {
    weeks: number;
    hoursPerWeek: number;
  };
  phases: Phase[];
}

export const companyPaths: CompanyPath[] = [
  {
    id: 'google',
    name: 'Google',
    logo: '🔍',
    description: 'Known for rigorous technical interviews focusing on algorithmic complexity, graph problems, and system design thinking. Expect deep dives into time/space optimization.',
    interviewStructure: '2 phone screens + 4-5 onsite rounds (coding + behavioral + system design for senior)',
    focusAreas: ['Graph Algorithms', 'Dynamic Programming', 'Binary Search', 'Trees', 'String Manipulation'],
    timeline: {
      weeks: 8,
      hoursPerWeek: 12,
    },
    phases: [
      {
        name: 'Foundation',
        weeks: 2,
        description: 'Build strong fundamentals in core data structures and basic algorithms.',
        problems: [
          { problemId: 'two-sum', priority: 'must-do', notes: 'Classic warmup - know it cold' },
          { problemId: 'valid-anagram', priority: 'must-do' },
          { problemId: 'contains-duplicate', priority: 'must-do' },
          { problemId: 'binary-search', priority: 'must-do', notes: 'Foundation for many Google problems' },
          { problemId: 'reverse-linked-list', priority: 'must-do' },
          { problemId: 'merge-two-sorted-lists', priority: 'must-do' },
          { problemId: 'valid-parentheses', priority: 'must-do' },
          { problemId: 'climbing-stairs', priority: 'must-do', notes: 'Intro to DP thinking' },
          { problemId: 'best-time-to-buy-and-sell-stock', priority: 'recommended' },
          { problemId: 'invert-binary-tree', priority: 'recommended' },
        ],
      },
      {
        name: 'Core Patterns',
        weeks: 3,
        description: 'Master the patterns Google loves: graphs, binary search variations, and tree traversals.',
        problems: [
          { problemId: 'number-of-islands', priority: 'must-do', notes: 'Very frequently asked at Google' },
          { problemId: 'course-schedule', priority: 'must-do', notes: 'Topological sort - Google favorite' },
          { problemId: 'clone-graph', priority: 'must-do' },
          { problemId: 'pacific-atlantic-water-flow', priority: 'must-do' },
          { problemId: 'rotting-oranges', priority: 'must-do', notes: 'Multi-source BFS' },
          { problemId: 'search-in-rotated-sorted-array', priority: 'must-do' },
          { problemId: 'find-minimum-in-rotated-sorted-array', priority: 'must-do' },
          { problemId: 'koko-eating-bananas', priority: 'must-do', notes: 'Binary search on answer' },
          { problemId: 'binary-tree-level-order-traversal', priority: 'must-do' },
          { problemId: 'validate-bst', priority: 'must-do' },
          { problemId: 'lowest-common-ancestor-bst', priority: 'recommended' },
          { problemId: 'binary-tree-right-side-view', priority: 'recommended' },
          { problemId: 'count-good-nodes', priority: 'recommended' },
          { problemId: 'longest-substring-without-repeating', priority: 'must-do' },
          { problemId: 'merge-intervals', priority: 'must-do' },
        ],
      },
      {
        name: 'Advanced Patterns',
        weeks: 2,
        description: 'Tackle harder problems: complex DP, advanced graphs, and optimization problems.',
        problems: [
          { problemId: 'coin-change', priority: 'must-do', notes: 'Classic DP - must know' },
          { problemId: 'longest-increasing-subsequence', priority: 'must-do' },
          { problemId: 'word-break', priority: 'must-do', notes: 'Asked frequently' },
          { problemId: 'longest-common-subsequence', priority: 'must-do' },
          { problemId: 'unique-paths', priority: 'recommended' },
          { problemId: 'edit-distance', priority: 'must-do', notes: 'Google classic' },
          { problemId: 'word-ladder', priority: 'must-do', notes: 'BFS on strings - very Google' },
          { problemId: 'network-delay-time', priority: 'recommended', notes: 'Dijkstra\'s algorithm' },
          { problemId: 'alien-dictionary', priority: 'must-do', notes: 'Topological sort variation' },
          { problemId: 'trapping-rain-water', priority: 'must-do', notes: 'Classic hard problem' },
          { problemId: 'median-of-two-sorted-arrays', priority: 'bonus', notes: 'Very hard - good stretch goal' },
        ],
      },
      {
        name: 'Company Focus',
        weeks: 1,
        description: 'Practice Google-specific patterns and recently asked problems.',
        problems: [
          { problemId: 'subsets', priority: 'must-do' },
          { problemId: 'permutations', priority: 'must-do' },
          { problemId: 'combination-sum', priority: 'must-do' },
          { problemId: 'word-search', priority: 'recommended' },
          { problemId: 'n-queens', priority: 'bonus', notes: 'Backtracking mastery' },
          { problemId: 'lru-cache', priority: 'must-do', notes: 'System design + coding' },
          { problemId: 'implement-trie', priority: 'must-do', notes: 'Trie is Google favorite' },
          { problemId: 'design-add-search-words', priority: 'recommended' },
          { problemId: 'serialize-deserialize-binary-tree', priority: 'must-do' },
          { problemId: 'task-scheduler', priority: 'recommended' },
        ],
      },
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: '👤',
    description: 'Fast-paced interviews focusing on clean, efficient code. Strong emphasis on arrays, strings, trees, and graph traversals. Move fast and iterate.',
    interviewStructure: '1-2 phone screens + 4-5 onsite rounds (2 coding + 1 system design + 1 behavioral)',
    focusAreas: ['Arrays & Strings', 'Trees', 'Graph Traversal', 'Dynamic Programming', 'Binary Search'],
    timeline: {
      weeks: 6,
      hoursPerWeek: 15,
    },
    phases: [
      {
        name: 'Foundation',
        weeks: 1,
        description: 'Meta values speed - nail the basics quickly.',
        problems: [
          { problemId: 'two-sum', priority: 'must-do', notes: 'Know it in your sleep' },
          { problemId: 'valid-palindrome', priority: 'must-do' },
          { problemId: 'merge-two-sorted-lists', priority: 'must-do' },
          { problemId: 'reverse-linked-list', priority: 'must-do' },
          { problemId: 'valid-parentheses', priority: 'must-do' },
          { problemId: 'binary-search', priority: 'must-do' },
          { problemId: 'contains-duplicate', priority: 'recommended' },
          { problemId: 'best-time-to-buy-and-sell-stock', priority: 'must-do' },
        ],
      },
      {
        name: 'Core Patterns',
        weeks: 2,
        description: 'Master Meta\'s favorite patterns: arrays, strings, and trees.',
        problems: [
          { problemId: 'group-anagrams', priority: 'must-do', notes: 'Very common at Meta' },
          { problemId: 'longest-substring-without-repeating', priority: 'must-do', notes: 'Asked frequently' },
          { problemId: '3sum', priority: 'must-do' },
          { problemId: 'product-of-array-except-self', priority: 'must-do' },
          { problemId: 'top-k-frequent-elements', priority: 'must-do' },
          { problemId: 'invert-binary-tree', priority: 'must-do' },
          { problemId: 'maximum-depth-of-binary-tree', priority: 'must-do' },
          { problemId: 'binary-tree-level-order-traversal', priority: 'must-do' },
          { problemId: 'validate-bst', priority: 'must-do' },
          { problemId: 'lowest-common-ancestor-bst', priority: 'must-do' },
          { problemId: 'number-of-islands', priority: 'must-do' },
          { problemId: 'clone-graph', priority: 'must-do' },
          { problemId: 'merge-intervals', priority: 'must-do', notes: 'Meta classic' },
          { problemId: 'insert-interval', priority: 'recommended' },
        ],
      },
      {
        name: 'Advanced Patterns',
        weeks: 2,
        description: 'Tackle medium-hard problems with optimal solutions.',
        problems: [
          { problemId: 'subsets', priority: 'must-do' },
          { problemId: 'permutations', priority: 'must-do' },
          { problemId: 'combination-sum', priority: 'recommended' },
          { problemId: 'word-search', priority: 'must-do' },
          { problemId: 'coin-change', priority: 'must-do' },
          { problemId: 'house-robber', priority: 'must-do' },
          { problemId: 'longest-palindromic-substring', priority: 'must-do', notes: 'String DP classic' },
          { problemId: 'decode-ways', priority: 'recommended' },
          { problemId: 'word-break', priority: 'must-do' },
          { problemId: 'minimum-window-substring', priority: 'must-do', notes: 'Sliding window mastery' },
          { problemId: 'kth-largest-element-in-array', priority: 'must-do' },
          { problemId: 'daily-temperatures', priority: 'recommended' },
          { problemId: 'reorder-list', priority: 'must-do' },
          { problemId: 'add-two-numbers', priority: 'must-do' },
        ],
      },
      {
        name: 'Company Focus',
        weeks: 1,
        description: 'Meta-specific problems and system design prep.',
        problems: [
          { problemId: 'lru-cache', priority: 'must-do', notes: 'Very commonly asked' },
          { problemId: 'binary-tree-right-side-view', priority: 'must-do' },
          { problemId: 'construct-tree-from-preorder-inorder', priority: 'must-do' },
          { problemId: 'serialize-deserialize-binary-tree', priority: 'recommended' },
          { problemId: 'random-pick-with-weight', priority: 'must-do', notes: 'Asked frequently' },
          { problemId: 'vertical-order-traversal', priority: 'must-do', notes: 'Meta classic' },
          { problemId: 'k-closest-points', priority: 'recommended' },
          { problemId: 'meeting-rooms-ii', priority: 'must-do' },
          { problemId: 'merge-k-sorted-lists', priority: 'must-do' },
          { problemId: 'trapping-rain-water', priority: 'bonus' },
        ],
      },
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '📦',
    description: 'Strong focus on OOP design and Leadership Principles. Expect problems involving BFS/DFS, arrays, and string manipulation. Be ready to discuss tradeoffs.',
    interviewStructure: '1 online assessment + 1 phone screen + 4-5 loop interviews (coding + LP + system design)',
    focusAreas: ['BFS/DFS', 'Arrays', 'Strings', 'Trees', 'Object-Oriented Design'],
    timeline: {
      weeks: 7,
      hoursPerWeek: 12,
    },
    phases: [
      {
        name: 'Foundation',
        weeks: 2,
        description: 'Build strong fundamentals - Amazon OAs test basics thoroughly.',
        problems: [
          { problemId: 'two-sum', priority: 'must-do' },
          { problemId: 'contains-duplicate', priority: 'must-do' },
          { problemId: 'valid-anagram', priority: 'must-do' },
          { problemId: 'group-anagrams', priority: 'must-do' },
          { problemId: 'reverse-linked-list', priority: 'must-do' },
          { problemId: 'merge-two-sorted-lists', priority: 'must-do' },
          { problemId: 'valid-parentheses', priority: 'must-do' },
          { problemId: 'binary-search', priority: 'must-do' },
          { problemId: 'climbing-stairs', priority: 'recommended' },
          { problemId: 'best-time-to-buy-and-sell-stock', priority: 'must-do' },
        ],
      },
      {
        name: 'Core Patterns',
        weeks: 2,
        description: 'Master BFS/DFS and tree problems - Amazon loves these.',
        problems: [
          { problemId: 'number-of-islands', priority: 'must-do', notes: 'Amazon classic' },
          { problemId: 'rotting-oranges', priority: 'must-do', notes: 'Multi-source BFS' },
          { problemId: 'course-schedule', priority: 'must-do' },
          { problemId: 'clone-graph', priority: 'recommended' },
          { problemId: 'pacific-atlantic-water-flow', priority: 'recommended' },
          { problemId: 'invert-binary-tree', priority: 'must-do' },
          { problemId: 'maximum-depth-of-binary-tree', priority: 'must-do' },
          { problemId: 'binary-tree-level-order-traversal', priority: 'must-do' },
          { problemId: 'validate-bst', priority: 'must-do' },
          { problemId: 'subtree-of-another-tree', priority: 'must-do' },
          { problemId: 'kth-smallest-in-bst', priority: 'recommended' },
          { problemId: 'longest-substring-without-repeating', priority: 'must-do' },
        ],
      },
      {
        name: 'Advanced Patterns',
        weeks: 2,
        description: 'Complex problems requiring optimization and design thinking.',
        problems: [
          { problemId: 'merge-intervals', priority: 'must-do', notes: 'Very common at Amazon' },
          { problemId: 'meeting-rooms-ii', priority: 'must-do' },
          { problemId: 'insert-interval', priority: 'recommended' },
          { problemId: 'coin-change', priority: 'must-do' },
          { problemId: 'word-break', priority: 'must-do' },
          { problemId: 'longest-increasing-subsequence', priority: 'recommended' },
          { problemId: 'subsets', priority: 'must-do' },
          { problemId: 'permutations', priority: 'must-do' },
          { problemId: 'combination-sum', priority: 'recommended' },
          { problemId: 'word-search', priority: 'must-do', notes: 'DFS on matrix' },
          { problemId: '3sum', priority: 'must-do' },
          { problemId: 'container-with-most-water', priority: 'recommended' },
          { problemId: 'product-of-array-except-self', priority: 'must-do' },
        ],
      },
      {
        name: 'Company Focus',
        weeks: 1,
        description: 'Amazon-specific OOD problems and commonly asked questions.',
        problems: [
          { problemId: 'lru-cache', priority: 'must-do', notes: 'OOD + coding combined' },
          { problemId: 'min-stack', priority: 'must-do' },
          { problemId: 'design-twitter', priority: 'recommended', notes: 'OOD practice' },
          { problemId: 'kth-largest-element-in-array', priority: 'must-do' },
          { problemId: 'top-k-frequent-elements', priority: 'must-do' },
          { problemId: 'k-closest-points', priority: 'must-do' },
          { problemId: 'task-scheduler', priority: 'recommended' },
          { problemId: 'reorder-list', priority: 'recommended' },
          { problemId: 'serialize-deserialize-binary-tree', priority: 'bonus' },
          { problemId: 'trapping-rain-water', priority: 'bonus' },
        ],
      },
    ],
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: '🍎',
    description: 'Attention to detail and clean code matter. Expect well-defined problems with emphasis on optimal solutions, edge cases, and code quality.',
    interviewStructure: '2 phone screens + 5-6 onsite rounds (heavy coding focus + domain expertise)',
    focusAreas: ['Clean Code', 'Edge Cases', 'Arrays', 'Strings', 'Data Structures'],
    timeline: {
      weeks: 6,
      hoursPerWeek: 10,
    },
    phases: [
      {
        name: 'Foundation',
        weeks: 2,
        description: 'Write clean, well-tested code from the start.',
        problems: [
          { problemId: 'two-sum', priority: 'must-do', notes: 'Focus on clean implementation' },
          { problemId: 'valid-palindrome', priority: 'must-do' },
          { problemId: 'valid-anagram', priority: 'must-do' },
          { problemId: 'reverse-linked-list', priority: 'must-do' },
          { problemId: 'merge-two-sorted-lists', priority: 'must-do' },
          { problemId: 'valid-parentheses', priority: 'must-do' },
          { problemId: 'binary-search', priority: 'must-do' },
          { problemId: 'invert-binary-tree', priority: 'must-do' },
          { problemId: 'maximum-depth-of-binary-tree', priority: 'must-do' },
          { problemId: 'same-tree', priority: 'recommended' },
        ],
      },
      {
        name: 'Core Patterns',
        weeks: 2,
        description: 'Master common patterns with attention to edge cases.',
        problems: [
          { problemId: 'longest-substring-without-repeating', priority: 'must-do' },
          { problemId: 'group-anagrams', priority: 'must-do' },
          { problemId: 'product-of-array-except-self', priority: 'must-do' },
          { problemId: '3sum', priority: 'must-do' },
          { problemId: 'container-with-most-water', priority: 'recommended' },
          { problemId: 'binary-tree-level-order-traversal', priority: 'must-do' },
          { problemId: 'validate-bst', priority: 'must-do' },
          { problemId: 'lowest-common-ancestor-bst', priority: 'must-do' },
          { problemId: 'search-in-rotated-sorted-array', priority: 'must-do' },
          { problemId: 'merge-intervals', priority: 'must-do' },
          { problemId: 'number-of-islands', priority: 'must-do' },
          { problemId: 'clone-graph', priority: 'recommended' },
        ],
      },
      {
        name: 'Advanced Patterns',
        weeks: 1,
        description: 'Handle complex problems with optimal, clean solutions.',
        problems: [
          { problemId: 'coin-change', priority: 'must-do' },
          { problemId: 'house-robber', priority: 'must-do' },
          { problemId: 'word-break', priority: 'recommended' },
          { problemId: 'subsets', priority: 'must-do' },
          { problemId: 'permutations', priority: 'must-do' },
          { problemId: 'daily-temperatures', priority: 'recommended' },
          { problemId: 'min-stack', priority: 'must-do' },
          { problemId: 'evaluate-reverse-polish-notation', priority: 'recommended' },
          { problemId: 'reorder-list', priority: 'must-do' },
        ],
      },
      {
        name: 'Company Focus',
        weeks: 1,
        description: 'Apple-specific problems and polish your solutions.',
        problems: [
          { problemId: 'lru-cache', priority: 'must-do' },
          { problemId: 'rotate-image', priority: 'must-do', notes: 'In-place matrix manipulation' },
          { problemId: 'spiral-matrix', priority: 'must-do' },
          { problemId: 'set-matrix-zeroes', priority: 'recommended' },
          { problemId: 'implement-trie', priority: 'must-do' },
          { problemId: 'kth-largest-element-in-array', priority: 'recommended' },
          { problemId: 'construct-tree-from-preorder-inorder', priority: 'bonus' },
          { problemId: 'add-two-numbers', priority: 'must-do' },
        ],
      },
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '🪟',
    description: 'Classic computer science fundamentals with a practical bent. Good balance of algorithmic problems and system thinking. Emphasis on clear communication.',
    interviewStructure: '1-2 phone screens + 4-5 onsite rounds (coding + design + behavioral)',
    focusAreas: ['Trees', 'Graphs', 'Arrays', 'String Manipulation', 'System Design'],
    timeline: {
      weeks: 6,
      hoursPerWeek: 12,
    },
    phases: [
      {
        name: 'Foundation',
        weeks: 2,
        description: 'Strong CS fundamentals - Microsoft values the basics.',
        problems: [
          { problemId: 'two-sum', priority: 'must-do' },
          { problemId: 'valid-anagram', priority: 'must-do' },
          { problemId: 'reverse-linked-list', priority: 'must-do' },
          { problemId: 'linked-list-cycle', priority: 'must-do' },
          { problemId: 'merge-two-sorted-lists', priority: 'must-do' },
          { problemId: 'valid-parentheses', priority: 'must-do' },
          { problemId: 'binary-search', priority: 'must-do' },
          { problemId: 'climbing-stairs', priority: 'must-do' },
          { problemId: 'best-time-to-buy-and-sell-stock', priority: 'must-do' },
          { problemId: 'maximum-subarray', priority: 'must-do' },
        ],
      },
      {
        name: 'Core Patterns',
        weeks: 2,
        description: 'Trees and graphs are Microsoft favorites.',
        problems: [
          { problemId: 'invert-binary-tree', priority: 'must-do' },
          { problemId: 'maximum-depth-of-binary-tree', priority: 'must-do' },
          { problemId: 'binary-tree-level-order-traversal', priority: 'must-do' },
          { problemId: 'validate-bst', priority: 'must-do' },
          { problemId: 'lowest-common-ancestor-bst', priority: 'must-do' },
          { problemId: 'kth-smallest-in-bst', priority: 'recommended' },
          { problemId: 'number-of-islands', priority: 'must-do' },
          { problemId: 'course-schedule', priority: 'must-do' },
          { problemId: 'clone-graph', priority: 'must-do' },
          { problemId: 'longest-substring-without-repeating', priority: 'must-do' },
          { problemId: 'group-anagrams', priority: 'must-do' },
          { problemId: 'merge-intervals', priority: 'must-do' },
        ],
      },
      {
        name: 'Advanced Patterns',
        weeks: 1,
        description: 'Dynamic programming and complex data structures.',
        problems: [
          { problemId: 'coin-change', priority: 'must-do' },
          { problemId: 'house-robber', priority: 'must-do' },
          { problemId: 'word-break', priority: 'must-do' },
          { problemId: 'longest-common-subsequence', priority: 'recommended' },
          { problemId: 'unique-paths', priority: 'recommended' },
          { problemId: 'subsets', priority: 'must-do' },
          { problemId: 'permutations', priority: 'must-do' },
          { problemId: '3sum', priority: 'must-do' },
          { problemId: 'product-of-array-except-self', priority: 'must-do' },
        ],
      },
      {
        name: 'Company Focus',
        weeks: 1,
        description: 'Microsoft-specific problems and design questions.',
        problems: [
          { problemId: 'lru-cache', priority: 'must-do' },
          { problemId: 'min-stack', priority: 'must-do' },
          { problemId: 'implement-trie', priority: 'must-do' },
          { problemId: 'serialize-deserialize-binary-tree', priority: 'must-do' },
          { problemId: 'construct-tree-from-preorder-inorder', priority: 'recommended' },
          { problemId: 'meeting-rooms-ii', priority: 'must-do' },
          { problemId: 'rotate-image', priority: 'recommended' },
          { problemId: 'spiral-matrix', priority: 'recommended' },
          { problemId: 'add-two-numbers', priority: 'must-do' },
          { problemId: 'merge-k-sorted-lists', priority: 'bonus' },
        ],
      },
    ],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🎬',
    description: 'Senior-focused interviews emphasizing system design and production-quality code. Less algorithmic grinding, more practical problem solving and scale thinking.',
    interviewStructure: '1-2 phone screens + 4-6 onsite rounds (heavy system design focus)',
    focusAreas: ['System Design', 'Scalability', 'Data Structures', 'Production Code', 'Trade-offs'],
    timeline: {
      weeks: 8,
      hoursPerWeek: 10,
    },
    phases: [
      {
        name: 'Foundation',
        weeks: 1,
        description: 'Quick fundamentals review - Netflix assumes senior-level basics.',
        problems: [
          { problemId: 'two-sum', priority: 'must-do' },
          { problemId: 'valid-anagram', priority: 'recommended' },
          { problemId: 'reverse-linked-list', priority: 'must-do' },
          { problemId: 'binary-search', priority: 'must-do' },
          { problemId: 'merge-intervals', priority: 'must-do' },
          { problemId: 'best-time-to-buy-and-sell-stock', priority: 'must-do' },
        ],
      },
      {
        name: 'Data Structure Design',
        weeks: 3,
        description: 'Focus on designing and implementing efficient data structures.',
        problems: [
          { problemId: 'lru-cache', priority: 'must-do', notes: 'Netflix favorite - know it deeply' },
          { problemId: 'min-stack', priority: 'must-do' },
          { problemId: 'implement-trie', priority: 'must-do' },
          { problemId: 'design-add-search-words', priority: 'must-do' },
          { problemId: 'design-twitter', priority: 'must-do', notes: 'System design + coding' },
          { problemId: 'find-median-from-data-stream', priority: 'must-do', notes: 'Streaming data processing' },
          { problemId: 'kth-largest-element-in-stream', priority: 'must-do' },
          { problemId: 'time-based-key-value-store', priority: 'must-do' },
          { problemId: 'serialize-deserialize-binary-tree', priority: 'must-do' },
        ],
      },
      {
        name: 'Scale Problems',
        weeks: 2,
        description: 'Problems that test scaling and optimization thinking.',
        problems: [
          { problemId: 'top-k-frequent-elements', priority: 'must-do' },
          { problemId: 'kth-largest-element-in-array', priority: 'must-do' },
          { problemId: 'merge-k-sorted-lists', priority: 'must-do' },
          { problemId: 'task-scheduler', priority: 'must-do', notes: 'Resource scheduling' },
          { problemId: 'meeting-rooms-ii', priority: 'must-do' },
          { problemId: 'course-schedule', priority: 'must-do' },
          { problemId: 'course-schedule-ii', priority: 'recommended' },
          { problemId: 'network-delay-time', priority: 'must-do', notes: 'Distributed systems' },
          { problemId: 'cheapest-flights', priority: 'recommended' },
        ],
      },
      {
        name: 'Company Focus',
        weeks: 2,
        description: 'Production-focused problems and system design prep.',
        problems: [
          { problemId: 'longest-substring-without-repeating', priority: 'must-do' },
          { problemId: 'group-anagrams', priority: 'recommended' },
          { problemId: 'word-break', priority: 'must-do' },
          { problemId: 'coin-change', priority: 'recommended' },
          { problemId: 'longest-increasing-subsequence', priority: 'recommended' },
          { problemId: 'number-of-islands', priority: 'must-do' },
          { problemId: 'clone-graph', priority: 'must-do' },
          { problemId: 'binary-tree-level-order-traversal', priority: 'must-do' },
          { problemId: 'validate-bst', priority: 'must-do' },
        ],
      },
    ],
  },
  {
    id: 'startups',
    name: 'Startups',
    logo: '🚀',
    description: 'Breadth over depth. Fast-paced interviews testing practical problem-solving, speed, and adaptability. Less focus on optimal complexity, more on working solutions.',
    interviewStructure: 'Varies: typically 1-2 phone screens + 2-4 onsite rounds (coding + culture fit)',
    focusAreas: ['Practical Problems', 'Speed', 'Breadth', 'Full-Stack Thinking', 'Communication'],
    timeline: {
      weeks: 4,
      hoursPerWeek: 15,
    },
    phases: [
      {
        name: 'Quick Wins',
        weeks: 1,
        description: 'Master the most common problems quickly.',
        problems: [
          { problemId: 'two-sum', priority: 'must-do' },
          { problemId: 'valid-parentheses', priority: 'must-do' },
          { problemId: 'reverse-linked-list', priority: 'must-do' },
          { problemId: 'merge-two-sorted-lists', priority: 'must-do' },
          { problemId: 'binary-search', priority: 'must-do' },
          { problemId: 'contains-duplicate', priority: 'must-do' },
          { problemId: 'valid-anagram', priority: 'must-do' },
          { problemId: 'best-time-to-buy-and-sell-stock', priority: 'must-do' },
          { problemId: 'climbing-stairs', priority: 'must-do' },
          { problemId: 'maximum-subarray', priority: 'must-do' },
        ],
      },
      {
        name: 'Core Breadth',
        weeks: 2,
        description: 'Cover all major categories at medium difficulty.',
        problems: [
          { problemId: 'group-anagrams', priority: 'must-do' },
          { problemId: 'longest-substring-without-repeating', priority: 'must-do' },
          { problemId: '3sum', priority: 'must-do' },
          { problemId: 'product-of-array-except-self', priority: 'recommended' },
          { problemId: 'invert-binary-tree', priority: 'must-do' },
          { problemId: 'binary-tree-level-order-traversal', priority: 'must-do' },
          { problemId: 'validate-bst', priority: 'must-do' },
          { problemId: 'number-of-islands', priority: 'must-do' },
          { problemId: 'merge-intervals', priority: 'must-do' },
          { problemId: 'coin-change', priority: 'must-do' },
          { problemId: 'house-robber', priority: 'recommended' },
          { problemId: 'subsets', priority: 'must-do' },
          { problemId: 'permutations', priority: 'recommended' },
          { problemId: 'daily-temperatures', priority: 'recommended' },
          { problemId: 'top-k-frequent-elements', priority: 'must-do' },
        ],
      },
      {
        name: 'Practical Focus',
        weeks: 1,
        description: 'Real-world problems startups love to ask.',
        problems: [
          { problemId: 'lru-cache', priority: 'must-do', notes: 'Common in backend-focused startups' },
          { problemId: 'min-stack', priority: 'recommended' },
          { problemId: 'implement-trie', priority: 'recommended' },
          { problemId: 'meeting-rooms-ii', priority: 'must-do' },
          { problemId: 'reorder-list', priority: 'recommended' },
          { problemId: 'add-two-numbers', priority: 'must-do' },
          { problemId: 'search-in-rotated-sorted-array', priority: 'recommended' },
          { problemId: 'word-break', priority: 'bonus' },
          { problemId: 'rotting-oranges', priority: 'recommended' },
          { problemId: 'clone-graph', priority: 'recommended' },
        ],
      },
    ],
  },
];

// Helper functions
export function getCompanyPath(companyId: string): CompanyPath | undefined {
  return companyPaths.find(p => p.id === companyId);
}

export function getAllProblemIds(path: CompanyPath): string[] {
  return path.phases.flatMap(phase => phase.problems.map(p => p.problemId));
}

export function getMustDoProblems(path: CompanyPath): PhaseProblem[] {
  return path.phases.flatMap(phase => 
    phase.problems.filter(p => p.priority === 'must-do')
  );
}

export function getPhaseProblems(path: CompanyPath, phaseName: string): PhaseProblem[] {
  const phase = path.phases.find(p => p.name === phaseName);
  return phase?.problems ?? [];
}

export function getTotalProblemsCount(path: CompanyPath): number {
  return path.phases.reduce((sum, phase) => sum + phase.problems.length, 0);
}

export function getPriorityColor(priority: PhaseProblem['priority']): string {
  switch (priority) {
    case 'must-do':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'recommended':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'bonus':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
  }
}
