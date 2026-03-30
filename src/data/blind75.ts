// The classic Blind 75 list - curated LeetCode problems for interview prep
// Maps to our problems.ts entries where visualizers exist

export interface Blind75Problem {
  id: string;           // matches our problem id
  title: string;
  category: string;     // Blind 75 category grouping
  leetcodeUrl: string;
  leetcodeNumber: number;
}

export const blind75Categories = [
  'Array',
  'Binary',
  'Dynamic Programming',
  'Graph',
  'Interval',
  'Linked List',
  'Matrix',
  'String',
  'Tree',
  'Heap',
] as const;

export type Blind75Category = typeof blind75Categories[number];

export const blind75: Blind75Problem[] = [
  // Array
  { id: 'two-sum', title: 'Two Sum', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/two-sum/', leetcodeNumber: 1 },
  { id: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', leetcodeNumber: 121 },
  { id: 'contains-duplicate', title: 'Contains Duplicate', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/', leetcodeNumber: 217 },
  { id: 'product-of-array-except-self', title: 'Product of Array Except Self', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', leetcodeNumber: 238 },
  { id: 'maximum-subarray', title: 'Maximum Subarray', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/', leetcodeNumber: 53 },
  { id: 'maximum-product-subarray', title: 'Maximum Product Subarray', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/', leetcodeNumber: 152 },
  { id: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum in Rotated Sorted Array', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', leetcodeNumber: 153 },
  { id: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', leetcodeNumber: 33 },
  { id: '3sum', title: '3Sum', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/3sum/', leetcodeNumber: 15 },
  { id: 'container-with-most-water', title: 'Container With Most Water', category: 'Array', leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/', leetcodeNumber: 11 },

  // Binary
  { id: 'sum-of-two-integers', title: 'Sum of Two Integers', category: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/sum-of-two-integers/', leetcodeNumber: 371 },
  { id: 'number-of-1-bits', title: 'Number of 1 Bits', category: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/number-of-1-bits/', leetcodeNumber: 191 },
  { id: 'counting-bits', title: 'Counting Bits', category: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/counting-bits/', leetcodeNumber: 338 },
  { id: 'missing-number', title: 'Missing Number', category: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/missing-number/', leetcodeNumber: 268 },
  { id: 'reverse-bits', title: 'Reverse Bits', category: 'Binary', leetcodeUrl: 'https://leetcode.com/problems/reverse-bits/', leetcodeNumber: 190 },

  // Dynamic Programming
  { id: 'climbing-stairs', title: 'Climbing Stairs', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/', leetcodeNumber: 70 },
  { id: 'coin-change', title: 'Coin Change', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/coin-change/', leetcodeNumber: 322 },
  { id: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/', leetcodeNumber: 300 },
  { id: 'longest-common-subsequence', title: 'Longest Common Subsequence', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/', leetcodeNumber: 1143 },
  { id: 'word-break', title: 'Word Break', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/word-break/', leetcodeNumber: 139 },
  { id: 'combination-sum-iv', title: 'Combination Sum IV', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/combination-sum-iv/', leetcodeNumber: 377 },
  { id: 'house-robber', title: 'House Robber', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/house-robber/', leetcodeNumber: 198 },
  { id: 'house-robber-ii', title: 'House Robber II', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/', leetcodeNumber: 213 },
  { id: 'decode-ways', title: 'Decode Ways', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/decode-ways/', leetcodeNumber: 91 },
  { id: 'unique-paths', title: 'Unique Paths', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/unique-paths/', leetcodeNumber: 62 },
  { id: 'jump-game', title: 'Jump Game', category: 'Dynamic Programming', leetcodeUrl: 'https://leetcode.com/problems/jump-game/', leetcodeNumber: 55 },

  // Graph
  { id: 'clone-graph', title: 'Clone Graph', category: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/clone-graph/', leetcodeNumber: 133 },
  { id: 'course-schedule', title: 'Course Schedule', category: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/course-schedule/', leetcodeNumber: 207 },
  { id: 'pacific-atlantic-water-flow', title: 'Pacific Atlantic Water Flow', category: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', leetcodeNumber: 417 },
  { id: 'number-of-islands', title: 'Number of Islands', category: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/', leetcodeNumber: 200 },
  { id: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', category: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/', leetcodeNumber: 128 },
  { id: 'alien-dictionary', title: 'Alien Dictionary', category: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/alien-dictionary/', leetcodeNumber: 269 },
  { id: 'graph-valid-tree', title: 'Graph Valid Tree', category: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/graph-valid-tree/', leetcodeNumber: 261 },
  { id: 'number-of-connected-components-in-an-undirected-graph', title: 'Number of Connected Components', category: 'Graph', leetcodeUrl: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', leetcodeNumber: 323 },

  // Interval
  { id: 'insert-interval', title: 'Insert Interval', category: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/insert-interval/', leetcodeNumber: 57 },
  { id: 'merge-intervals', title: 'Merge Intervals', category: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/', leetcodeNumber: 56 },
  { id: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', category: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/', leetcodeNumber: 435 },
  { id: 'meeting-rooms', title: 'Meeting Rooms', category: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms/', leetcodeNumber: 252 },
  { id: 'meeting-rooms-ii', title: 'Meeting Rooms II', category: 'Interval', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', leetcodeNumber: 253 },

  // Linked List
  { id: 'reverse-linked-list', title: 'Reverse Linked List', category: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', leetcodeNumber: 206 },
  { id: 'linked-list-cycle', title: 'Linked List Cycle', category: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/', leetcodeNumber: 141 },
  { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', category: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', leetcodeNumber: 21 },
  { id: 'merge-k-sorted-lists', title: 'Merge K Sorted Lists', category: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', leetcodeNumber: 23 },
  { id: 'remove-nth-node-from-end-of-list', title: 'Remove Nth Node From End', category: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', leetcodeNumber: 19 },
  { id: 'reorder-list', title: 'Reorder List', category: 'Linked List', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/', leetcodeNumber: 143 },

  // Matrix
  { id: 'set-matrix-zeroes', title: 'Set Matrix Zeroes', category: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/', leetcodeNumber: 73 },
  { id: 'spiral-matrix', title: 'Spiral Matrix', category: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/', leetcodeNumber: 54 },
  { id: 'rotate-image', title: 'Rotate Image', category: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/rotate-image/', leetcodeNumber: 48 },
  { id: 'word-search', title: 'Word Search', category: 'Matrix', leetcodeUrl: 'https://leetcode.com/problems/word-search/', leetcodeNumber: 79 },

  // String
  { id: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', leetcodeNumber: 3 },
  { id: 'longest-repeating-character-replacement', title: 'Longest Repeating Character Replacement', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/', leetcodeNumber: 424 },
  { id: 'minimum-window-substring', title: 'Minimum Window Substring', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', leetcodeNumber: 76 },
  { id: 'valid-anagram', title: 'Valid Anagram', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/', leetcodeNumber: 242 },
  { id: 'group-anagrams', title: 'Group Anagrams', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/', leetcodeNumber: 49 },
  { id: 'valid-parentheses', title: 'Valid Parentheses', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/', leetcodeNumber: 20 },
  { id: 'valid-palindrome', title: 'Valid Palindrome', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/', leetcodeNumber: 125 },
  { id: 'longest-palindromic-substring', title: 'Longest Palindromic Substring', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', leetcodeNumber: 5 },
  { id: 'palindromic-substrings', title: 'Palindromic Substrings', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/palindromic-substrings/', leetcodeNumber: 647 },
  { id: 'encode-and-decode-strings', title: 'Encode and Decode Strings', category: 'String', leetcodeUrl: 'https://leetcode.com/problems/encode-and-decode-strings/', leetcodeNumber: 271 },

  // Tree
  { id: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', leetcodeNumber: 104 },
  { id: 'same-tree', title: 'Same Tree', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/same-tree/', leetcodeNumber: 100 },
  { id: 'invert-binary-tree', title: 'Invert Binary Tree', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', leetcodeNumber: 226 },
  { id: 'binary-tree-maximum-path-sum', title: 'Binary Tree Maximum Path Sum', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', leetcodeNumber: 124 },
  { id: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', leetcodeNumber: 102 },
  { id: 'serialize-and-deserialize-binary-tree', title: 'Serialize and Deserialize Binary Tree', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', leetcodeNumber: 297 },
  { id: 'subtree-of-another-tree', title: 'Subtree of Another Tree', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/', leetcodeNumber: 572 },
  { id: 'construct-binary-tree-from-preorder-and-inorder-traversal', title: 'Construct Binary Tree from Preorder and Inorder', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', leetcodeNumber: 105 },
  { id: 'validate-binary-search-tree', title: 'Validate Binary Search Tree', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/', leetcodeNumber: 98 },
  { id: 'kth-smallest-element-in-a-bst', title: 'Kth Smallest Element in a BST', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', leetcodeNumber: 230 },
  { id: 'lowest-common-ancestor-of-a-binary-search-tree', title: 'Lowest Common Ancestor of BST', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', leetcodeNumber: 235 },
  { id: 'implement-trie-prefix-tree', title: 'Implement Trie (Prefix Tree)', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/', leetcodeNumber: 208 },
  { id: 'add-and-search-word', title: 'Add and Search Word', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', leetcodeNumber: 211 },
  { id: 'word-search-ii', title: 'Word Search II', category: 'Tree', leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/', leetcodeNumber: 212 },

  // Heap
  { id: 'merge-k-sorted-lists-heap', title: 'Merge K Sorted Lists', category: 'Heap', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', leetcodeNumber: 23 },
  { id: 'top-k-frequent-elements', title: 'Top K Frequent Elements', category: 'Heap', leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', leetcodeNumber: 347 },
  { id: 'find-median-from-data-stream', title: 'Find Median from Data Stream', category: 'Heap', leetcodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/', leetcodeNumber: 295 },
];

// Get unique categories in display order
export const getBlind75Categories = (): Blind75Category[] => {
  return [...blind75Categories];
};

// Get problems by category
export const getBlind75ByCategory = (category: Blind75Category): Blind75Problem[] => {
  return blind75.filter(p => p.category === category);
};
