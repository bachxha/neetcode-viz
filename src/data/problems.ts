export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Category = 
  | 'Arrays & Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Stack'
  | 'Binary Search'
  | 'Linked List'
  | 'Trees'
  | 'Tries'
  | 'Heap / Priority Queue'
  | 'Backtracking'
  | 'Graphs'
  | 'Advanced Graphs'
  | '1-D Dynamic Programming'
  | '2-D Dynamic Programming'
  | 'Greedy'
  | 'Intervals'
  | 'Math & Geometry'
  | 'Bit Manipulation';

export interface Problem {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  leetcodeUrl: string;
  hasVisualization: boolean;
}

export const problems: Problem[] = [
  // Arrays & Hashing
  { id: 'contains-duplicate', title: 'Contains Duplicate', category: 'Arrays & Hashing', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/', hasVisualization: true },
  { id: 'valid-anagram', title: 'Valid Anagram', category: 'Arrays & Hashing', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/', hasVisualization: true },
  { id: 'two-sum', title: 'Two Sum', category: 'Arrays & Hashing', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/two-sum/', hasVisualization: true },
  { id: 'group-anagrams', title: 'Group Anagrams', category: 'Arrays & Hashing', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/', hasVisualization: true },
  { id: 'top-k-frequent-elements', title: 'Top K Frequent Elements', category: 'Arrays & Hashing', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', hasVisualization: true },
  { id: 'encode-and-decode-strings', title: 'Encode and Decode Strings', category: 'Arrays & Hashing', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/encode-and-decode-strings/', hasVisualization: true },
  { id: 'product-of-array-except-self', title: 'Product of Array Except Self', category: 'Arrays & Hashing', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', hasVisualization: true },
  { id: 'valid-sudoku', title: 'Valid Sudoku', category: 'Arrays & Hashing', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/valid-sudoku/', hasVisualization: true },
  { id: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', category: 'Arrays & Hashing', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/', hasVisualization: true },

  // Two Pointers
  { id: 'valid-palindrome', title: 'Valid Palindrome', category: 'Two Pointers', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/', hasVisualization: false },
  { id: 'two-sum-ii', title: 'Two Sum II', category: 'Two Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', hasVisualization: false },
  { id: '3sum', title: '3Sum', category: 'Two Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/3sum/', hasVisualization: true },
  { id: 'container-with-most-water', title: 'Container With Most Water', category: 'Two Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/', hasVisualization: true },
  { id: 'trapping-rain-water', title: 'Trapping Rain Water', category: 'Two Pointers', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/', hasVisualization: true },

  // Sliding Window
  { id: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', category: 'Sliding Window', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', hasVisualization: true },
  { id: 'longest-substring-without-repeating', title: 'Longest Substring Without Repeating Characters', category: 'Sliding Window', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', hasVisualization: true },
  { id: 'longest-repeating-character-replacement', title: 'Longest Repeating Character Replacement', category: 'Sliding Window', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/', hasVisualization: false },
  { id: 'permutation-in-string', title: 'Permutation in String', category: 'Sliding Window', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutation-in-string/', hasVisualization: false },
  { id: 'minimum-window-substring', title: 'Minimum Window Substring', category: 'Sliding Window', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', hasVisualization: true },
  { id: 'sliding-window-maximum', title: 'Sliding Window Maximum', category: 'Sliding Window', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', hasVisualization: false },

  // Stack
  { id: 'valid-parentheses', title: 'Valid Parentheses', category: 'Stack', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/', hasVisualization: true },
  { id: 'min-stack', title: 'Min Stack', category: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/min-stack/', hasVisualization: true },
  { id: 'evaluate-reverse-polish-notation', title: 'Evaluate Reverse Polish Notation', category: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', hasVisualization: true },
  { id: 'generate-parentheses', title: 'Generate Parentheses', category: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/generate-parentheses/', hasVisualization: true },
  { id: 'daily-temperatures', title: 'Daily Temperatures', category: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/', hasVisualization: true },
  { id: 'car-fleet', title: 'Car Fleet', category: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/car-fleet/', hasVisualization: false },
  { id: 'largest-rectangle-in-histogram', title: 'Largest Rectangle in Histogram', category: 'Stack', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', hasVisualization: true },

  // Binary Search
  { id: 'binary-search', title: 'Binary Search', category: 'Binary Search', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/binary-search/', hasVisualization: true },
  { id: 'search-2d-matrix', title: 'Search a 2D Matrix', category: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/', hasVisualization: true },
  { id: 'koko-eating-bananas', title: 'Koko Eating Bananas', category: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/', hasVisualization: true },
  { id: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum in Rotated Sorted Array', category: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', hasVisualization: true },
  { id: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array', category: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', hasVisualization: true },
  { id: 'time-based-key-value-store', title: 'Time Based Key-Value Store', category: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/', hasVisualization: false },
  { id: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', category: 'Binary Search', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', hasVisualization: false },

  // Linked List
  { id: 'reverse-linked-list', title: 'Reverse Linked List', category: 'Linked List', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', hasVisualization: true },
  { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', category: 'Linked List', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', hasVisualization: true },
  { id: 'linked-list-cycle', title: 'Linked List Cycle', category: 'Linked List', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/', hasVisualization: true },
  { id: 'reorder-list', title: 'Reorder List', category: 'Linked List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/', hasVisualization: true },
  { id: 'remove-nth-node-from-end', title: 'Remove Nth Node From End of List', category: 'Linked List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', hasVisualization: true },
  { id: 'copy-list-with-random-pointer', title: 'Copy List with Random Pointer', category: 'Linked List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/', hasVisualization: false },
  { id: 'add-two-numbers', title: 'Add Two Numbers', category: 'Linked List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/', hasVisualization: true },
  { id: 'find-the-duplicate-number', title: 'Find the Duplicate Number', category: 'Linked List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/', hasVisualization: true },
  { id: 'lru-cache', title: 'LRU Cache', category: 'Linked List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/lru-cache/', hasVisualization: true },
  { id: 'merge-k-sorted-lists', title: 'Merge k Sorted Lists', category: 'Linked List', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', hasVisualization: false },
  { id: 'reverse-nodes-in-k-group', title: 'Reverse Nodes in k-Group', category: 'Linked List', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', hasVisualization: false },

  // Trees
  { id: 'invert-binary-tree', title: 'Invert Binary Tree', category: 'Trees', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', hasVisualization: true },
  { id: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', category: 'Trees', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', hasVisualization: true },
  { id: 'diameter-of-binary-tree', title: 'Diameter of Binary Tree', category: 'Trees', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/', hasVisualization: false },
  { id: 'balanced-binary-tree', title: 'Balanced Binary Tree', category: 'Trees', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/balanced-binary-tree/', hasVisualization: false },
  { id: 'same-tree', title: 'Same Tree', category: 'Trees', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/same-tree/', hasVisualization: true },
  { id: 'subtree-of-another-tree', title: 'Subtree of Another Tree', category: 'Trees', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/', hasVisualization: true },
  { id: 'lowest-common-ancestor-bst', title: 'Lowest Common Ancestor of BST', category: 'Trees', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', hasVisualization: true },
  { id: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', category: 'Trees', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', hasVisualization: true },
  { id: 'binary-tree-right-side-view', title: 'Binary Tree Right Side View', category: 'Trees', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/', hasVisualization: true },
  { id: 'count-good-nodes', title: 'Count Good Nodes in Binary Tree', category: 'Trees', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/', hasVisualization: true },
  { id: 'validate-bst', title: 'Validate Binary Search Tree', category: 'Trees', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/', hasVisualization: true },
  { id: 'kth-smallest-in-bst', title: 'Kth Smallest Element in a BST', category: 'Trees', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', hasVisualization: true },
  { id: 'construct-tree-from-preorder-inorder', title: 'Construct Binary Tree from Preorder and Inorder', category: 'Trees', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', hasVisualization: false },
  { id: 'binary-tree-max-path-sum', title: 'Binary Tree Maximum Path Sum', category: 'Trees', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', hasVisualization: false },
  { id: 'serialize-deserialize-binary-tree', title: 'Serialize and Deserialize Binary Tree', category: 'Trees', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', hasVisualization: false },

  // Tries
  { id: 'implement-trie', title: 'Implement Trie (Prefix Tree)', category: 'Tries', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/', hasVisualization: false },
  { id: 'design-add-search-words', title: 'Design Add and Search Words Data Structure', category: 'Tries', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', hasVisualization: false },
  { id: 'word-search-ii', title: 'Word Search II', category: 'Tries', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/', hasVisualization: false },

  // Heap / Priority Queue
  { id: 'kth-largest-element-in-stream', title: 'Kth Largest Element in a Stream', category: 'Heap / Priority Queue', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/', hasVisualization: true },
  { id: 'last-stone-weight', title: 'Last Stone Weight', category: 'Heap / Priority Queue', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/last-stone-weight/', hasVisualization: false },
  { id: 'k-closest-points', title: 'K Closest Points to Origin', category: 'Heap / Priority Queue', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/', hasVisualization: false },
  { id: 'kth-largest-element-in-array', title: 'Kth Largest Element in an Array', category: 'Heap / Priority Queue', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', hasVisualization: false },
  { id: 'task-scheduler', title: 'Task Scheduler', category: 'Heap / Priority Queue', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/task-scheduler/', hasVisualization: false },
  { id: 'design-twitter', title: 'Design Twitter', category: 'Heap / Priority Queue', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/design-twitter/', hasVisualization: false },
  { id: 'find-median-from-data-stream', title: 'Find Median from Data Stream', category: 'Heap / Priority Queue', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/', hasVisualization: true },

  // Backtracking
  { id: 'subsets', title: 'Subsets', category: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets/', hasVisualization: true },
  { id: 'combination-sum', title: 'Combination Sum', category: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum/', hasVisualization: true },
  { id: 'permutations', title: 'Permutations', category: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutations/', hasVisualization: true },
  { id: 'subsets-ii', title: 'Subsets II', category: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets-ii/', hasVisualization: true },
  { id: 'combination-sum-ii', title: 'Combination Sum II', category: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum-ii/', hasVisualization: true },
  { id: 'word-search', title: 'Word Search', category: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/word-search/', hasVisualization: true },
  { id: 'palindrome-partitioning', title: 'Palindrome Partitioning', category: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/', hasVisualization: true },
  { id: 'letter-combinations', title: 'Letter Combinations of a Phone Number', category: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', hasVisualization: true },
  { id: 'sudoku-solver', title: 'Sudoku Solver', category: 'Backtracking', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/sudoku-solver/', hasVisualization: true },
  { id: 'n-queens', title: 'N-Queens', category: 'Backtracking', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/n-queens/', hasVisualization: true },

  // Graphs
  { id: 'number-of-islands', title: 'Number of Islands', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/', hasVisualization: true },
  { id: 'max-area-of-island', title: 'Max Area of Island', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/max-area-of-island/', hasVisualization: false },
  { id: 'clone-graph', title: 'Clone Graph', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/clone-graph/', hasVisualization: true },
  { id: 'walls-and-gates', title: 'Walls and Gates', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/walls-and-gates/', hasVisualization: false },
  { id: 'rotting-oranges', title: 'Rotting Oranges', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/', hasVisualization: true },
  { id: 'pacific-atlantic-water-flow', title: 'Pacific Atlantic Water Flow', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', hasVisualization: true },
  { id: 'surrounded-regions', title: 'Surrounded Regions', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/surrounded-regions/', hasVisualization: true },
  { id: 'course-schedule', title: 'Course Schedule', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule/', hasVisualization: true },
  { id: 'course-schedule-ii', title: 'Course Schedule II', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/', hasVisualization: false },
  { id: 'graph-valid-tree', title: 'Graph Valid Tree', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/graph-valid-tree/', hasVisualization: false },
  { id: 'connected-components', title: 'Number of Connected Components', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', hasVisualization: false },
  { id: 'redundant-connection', title: 'Redundant Connection', category: 'Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/redundant-connection/', hasVisualization: false },
  { id: 'word-ladder', title: 'Word Ladder', category: 'Graphs', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/word-ladder/', hasVisualization: false },

  // Advanced Graphs
  { id: 'reconstruct-itinerary', title: 'Reconstruct Itinerary', category: 'Advanced Graphs', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/reconstruct-itinerary/', hasVisualization: false },
  { id: 'min-cost-to-connect-all-points', title: 'Min Cost to Connect All Points', category: 'Advanced Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/min-cost-to-connect-all-points/', hasVisualization: false },
  { id: 'network-delay-time', title: 'Network Delay Time', category: 'Advanced Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/network-delay-time/', hasVisualization: false },
  { id: 'swim-in-rising-water', title: 'Swim in Rising Water', category: 'Advanced Graphs', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/', hasVisualization: false },
  { id: 'alien-dictionary', title: 'Alien Dictionary', category: 'Advanced Graphs', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/alien-dictionary/', hasVisualization: false },
  { id: 'cheapest-flights', title: 'Cheapest Flights Within K Stops', category: 'Advanced Graphs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', hasVisualization: false },

  // 1-D Dynamic Programming
  { id: 'climbing-stairs', title: 'Climbing Stairs', category: '1-D Dynamic Programming', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/', hasVisualization: true },
  { id: 'min-cost-climbing-stairs', title: 'Min Cost Climbing Stairs', category: '1-D Dynamic Programming', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/min-cost-climbing-stairs/', hasVisualization: false },
  { id: 'house-robber', title: 'House Robber', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber/', hasVisualization: false },
  { id: 'house-robber-ii', title: 'House Robber II', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/', hasVisualization: false },
  { id: 'longest-palindromic-substring', title: 'Longest Palindromic Substring', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', hasVisualization: false },
  { id: 'palindromic-substrings', title: 'Palindromic Substrings', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/palindromic-substrings/', hasVisualization: false },
  { id: 'decode-ways', title: 'Decode Ways', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/decode-ways/', hasVisualization: false },
  { id: 'coin-change', title: 'Coin Change', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change/', hasVisualization: true },
  { id: 'maximum-product-subarray', title: 'Maximum Product Subarray', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/', hasVisualization: false },
  { id: 'word-break', title: 'Word Break', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/word-break/', hasVisualization: false },
  { id: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/', hasVisualization: true },
  { id: 'partition-equal-subset-sum', title: 'Partition Equal Subset Sum', category: '1-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/', hasVisualization: false },

  // 2-D Dynamic Programming
  { id: 'unique-paths', title: 'Unique Paths', category: '2-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/unique-paths/', hasVisualization: false },
  { id: 'longest-common-subsequence', title: 'Longest Common Subsequence', category: '2-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/', hasVisualization: false },
  { id: 'best-time-to-buy-sell-stock-with-cooldown', title: 'Best Time to Buy and Sell Stock with Cooldown', category: '2-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/', hasVisualization: false },
  { id: 'coin-change-ii', title: 'Coin Change II', category: '2-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change-ii/', hasVisualization: false },
  { id: 'target-sum', title: 'Target Sum', category: '2-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/target-sum/', hasVisualization: false },
  { id: 'interleaving-string', title: 'Interleaving String', category: '2-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/interleaving-string/', hasVisualization: false },
  { id: 'longest-increasing-path-in-matrix', title: 'Longest Increasing Path in a Matrix', category: '2-D Dynamic Programming', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/', hasVisualization: false },
  { id: 'distinct-subsequences', title: 'Distinct Subsequences', category: '2-D Dynamic Programming', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/distinct-subsequences/', hasVisualization: false },
  { id: 'edit-distance', title: 'Edit Distance', category: '2-D Dynamic Programming', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/edit-distance/', hasVisualization: false },
  { id: 'burst-balloons', title: 'Burst Balloons', category: '2-D Dynamic Programming', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/burst-balloons/', hasVisualization: false },
  { id: 'regular-expression-matching', title: 'Regular Expression Matching', category: '2-D Dynamic Programming', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/regular-expression-matching/', hasVisualization: false },

  // Greedy
  { id: 'maximum-subarray', title: 'Maximum Subarray', category: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/', hasVisualization: false },
  { id: 'jump-game', title: 'Jump Game', category: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/jump-game/', hasVisualization: false },
  { id: 'jump-game-ii', title: 'Jump Game II', category: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/jump-game-ii/', hasVisualization: false },
  { id: 'gas-station', title: 'Gas Station', category: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/gas-station/', hasVisualization: false },
  { id: 'hand-of-straights', title: 'Hand of Straights', category: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/hand-of-straights/', hasVisualization: false },
  { id: 'merge-triplets', title: 'Merge Triplets to Form Target Triplet', category: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/', hasVisualization: false },
  { id: 'partition-labels', title: 'Partition Labels', category: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/partition-labels/', hasVisualization: false },
  { id: 'valid-parenthesis-string', title: 'Valid Parenthesis String', category: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/valid-parenthesis-string/', hasVisualization: false },

  // Intervals
  { id: 'insert-interval', title: 'Insert Interval', category: 'Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/insert-interval/', hasVisualization: true },
  { id: 'merge-intervals', title: 'Merge Intervals', category: 'Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/', hasVisualization: true },
  { id: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', category: 'Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/', hasVisualization: true },
  { id: 'meeting-rooms', title: 'Meeting Rooms', category: 'Intervals', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms/', hasVisualization: false },
  { id: 'meeting-rooms-ii', title: 'Meeting Rooms II', category: 'Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', hasVisualization: true },
  { id: 'minimum-interval', title: 'Minimum Interval to Include Each Query', category: 'Intervals', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/', hasVisualization: false },

  // Math & Geometry
  { id: 'rotate-image', title: 'Rotate Image', category: 'Math & Geometry', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/rotate-image/', hasVisualization: false },
  { id: 'spiral-matrix', title: 'Spiral Matrix', category: 'Math & Geometry', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/', hasVisualization: false },
  { id: 'set-matrix-zeroes', title: 'Set Matrix Zeroes', category: 'Math & Geometry', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/', hasVisualization: false },
  { id: 'happy-number', title: 'Happy Number', category: 'Math & Geometry', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/happy-number/', hasVisualization: false },
  { id: 'plus-one', title: 'Plus One', category: 'Math & Geometry', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/plus-one/', hasVisualization: false },
  { id: 'pow-x-n', title: 'Pow(x, n)', category: 'Math & Geometry', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/powx-n/', hasVisualization: false },
  { id: 'multiply-strings', title: 'Multiply Strings', category: 'Math & Geometry', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/multiply-strings/', hasVisualization: false },
  { id: 'detect-squares', title: 'Detect Squares', category: 'Math & Geometry', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/detect-squares/', hasVisualization: false },

  // Bit Manipulation
  { id: 'single-number', title: 'Single Number', category: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/single-number/', hasVisualization: false },
  { id: 'number-of-1-bits', title: 'Number of 1 Bits', category: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/number-of-1-bits/', hasVisualization: false },
  { id: 'counting-bits', title: 'Counting Bits', category: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/counting-bits/', hasVisualization: false },
  { id: 'reverse-bits', title: 'Reverse Bits', category: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/reverse-bits/', hasVisualization: false },
  { id: 'missing-number', title: 'Missing Number', category: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/missing-number/', hasVisualization: false },
  { id: 'sum-of-two-integers', title: 'Sum of Two Integers', category: 'Bit Manipulation', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/sum-of-two-integers/', hasVisualization: false },
  { id: 'reverse-integer', title: 'Reverse Integer', category: 'Bit Manipulation', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reverse-integer/', hasVisualization: false },
];

export const categories: Category[] = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  '1-D Dynamic Programming',
  '2-D Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation',
];

export function getProblemsByCategory(category: Category): Problem[] {
  return problems.filter(p => p.category === category);
}

export function getProblemsWithVisualization(): Problem[] {
  return problems.filter(p => p.hasVisualization);
}
