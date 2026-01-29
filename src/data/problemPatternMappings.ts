/**
 * Problem Pattern Mappings
 * Maps problems to their applicable algorithm patterns for the Pattern Trainer
 */

export interface ProblemPatternMapping {
  problemId: string;
  patterns: string[]; // Pattern IDs from patterns.ts
  hints: string[]; // Progressive hints
  explanation: string; // Why these patterns apply
  description: string; // Problem description for training
}

export const problemPatternMappings: ProblemPatternMapping[] = [
  // ========== Arrays & Hashing ==========
  {
    problemId: 'contains-duplicate',
    patterns: ['hash-table'],
    hints: [
      'How can you check if you\'ve seen an element before?',
      'What data structure gives O(1) lookup time?',
      'A Set can track seen elements efficiently.',
    ],
    explanation: 'Use a HashSet to track seen elements. For each element, check if it exists in the set - if yes, duplicate found. Otherwise add to set. O(n) time, O(n) space.',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
  },
  {
    problemId: 'valid-anagram',
    patterns: ['hash-table'],
    hints: [
      'What property defines an anagram?',
      'Same characters, same frequencies.',
      'Count character frequencies using a HashMap or array.',
    ],
    explanation: 'Count character frequencies in both strings. If all frequencies match, they\'re anagrams. Use a HashMap or int[26] array for O(n) time.',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram uses all original letters exactly once.',
  },
  {
    problemId: 'two-sum',
    patterns: ['hash-table'],
    hints: [
      'For each number, what value would make it sum to target?',
      'Can you check if that complement exists quickly?',
      'HashMap: store values → indices for O(1) complement lookup.',
    ],
    explanation: 'For each number num, check if (target - num) exists in a HashMap. If yes, return both indices. Otherwise add num → index to map. O(n) time.',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution.',
  },
  {
    problemId: 'group-anagrams',
    patterns: ['hash-table'],
    hints: [
      'How can you identify anagrams?',
      'Anagrams have the same sorted characters.',
      'Use sorted string as key, group values in HashMap.',
    ],
    explanation: 'Sort each string to get a canonical form - all anagrams sort to the same string. Use this as HashMap key to group anagrams together.',
    description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
  },
  {
    problemId: 'top-k-frequent-elements',
    patterns: ['hash-table', 'heap-pattern'],
    hints: [
      'First, count frequencies of each element.',
      'Then find the k elements with highest frequency.',
      'Use a HashMap + Heap, or bucket sort for O(n).',
    ],
    explanation: 'Count frequencies with HashMap. Then use min-heap of size k to track k most frequent, or bucket sort where bucket[i] = elements appearing i times.',
    description: 'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
  },
  {
    problemId: 'longest-consecutive-sequence',
    patterns: ['hash-table'],
    hints: [
      'Sorting would give O(n log n). Can we do O(n)?',
      'Use a Set for O(1) lookups.',
      'Only start counting from sequence beginnings (no left neighbor).',
    ],
    explanation: 'Add all numbers to a HashSet. For each number, if num-1 doesn\'t exist (start of sequence), count consecutive numbers. Track maximum length.',
    description: 'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. Must run in O(n) time.',
  },

  // ========== Two Pointers ==========
  {
    problemId: 'valid-palindrome',
    patterns: ['opposite-direction'],
    hints: [
      'A palindrome reads the same forwards and backwards.',
      'Compare characters from both ends moving inward.',
      'Skip non-alphanumeric characters, ignore case.',
    ],
    explanation: 'Two pointers from both ends. Skip non-alphanumeric, compare lowercase chars. Move pointers inward until they meet or mismatch.',
    description: 'A phrase is a palindrome if it reads the same forward and backward (ignoring cases and non-alphanumeric). Return true if the input is a palindrome.',
  },
  {
    problemId: 'two-sum-ii',
    patterns: ['opposite-direction'],
    hints: [
      'The array is SORTED - how does this help?',
      'If sum is too small, you need a bigger number.',
      'If sum is too big, you need a smaller number.',
    ],
    explanation: 'Two pointers at both ends. Sum too small → move left pointer right. Sum too big → move right pointer left. Sorted array guarantees we find the answer.',
    description: 'Given a 1-indexed sorted array, find two numbers that add up to target. Return their indices (1-indexed). Exactly one solution exists.',
  },
  {
    problemId: '3sum',
    patterns: ['opposite-direction'],
    hints: [
      'Can you reduce this to 2Sum?',
      'Fix one number, find two others that sum to -fixed.',
      'Sort first to enable two-pointer technique and skip duplicates.',
    ],
    explanation: 'Sort array. For each number nums[i], use two pointers to find pairs summing to -nums[i]. Skip duplicates by checking adjacent elements.',
    description: 'Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j != k and they sum to 0. No duplicate triplets.',
  },
  {
    problemId: 'container-with-most-water',
    patterns: ['opposite-direction'],
    hints: [
      'Area = min(height) × width. Start with max width.',
      'Which pointer should you move?',
      'Moving the shorter one might find a taller line.',
    ],
    explanation: 'Two pointers at both ends for max width. Area limited by shorter line. Move the shorter pointer inward - moving taller one can only decrease area.',
    description: 'Given n non-negative integers where each represents a line height at position i, find two lines forming a container with maximum water area.',
  },
  {
    problemId: 'trapping-rain-water',
    patterns: ['opposite-direction', 'variable-window'],
    hints: [
      'Water at each position depends on max heights to left and right.',
      'Water trapped = min(maxLeft, maxRight) - currentHeight.',
      'Two pointers can track maxLeft and maxRight efficiently.',
    ],
    explanation: 'Two pointers with tracked maxLeft and maxRight. Process the smaller side - its water is determined. Move that pointer inward and update max.',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
  },

  // ========== Sliding Window ==========
  {
    problemId: 'best-time-to-buy-and-sell-stock',
    patterns: ['variable-window'],
    hints: [
      'You need to buy before selling.',
      'Track the minimum price seen so far.',
      'At each price, calculate profit if selling now.',
    ],
    explanation: 'Keep track of minimum price seen. For each day, calculate profit = price - minSeen. Track maximum profit. This is essentially a variable window tracking min.',
    description: 'Given an array prices where prices[i] is stock price on day i, maximize profit by buying then selling on different days. Return max profit (or 0).',
  },
  {
    problemId: 'longest-substring-without-repeating',
    patterns: ['variable-window'],
    hints: [
      'You need a contiguous substring - think sliding window.',
      'Expand right to add characters, shrink left on duplicates.',
      'Use Set or HashMap to track characters in current window.',
    ],
    explanation: 'Variable sliding window. Expand right, add char to set. If duplicate, shrink from left until valid. Track max window size.',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
  },
  {
    problemId: 'longest-repeating-character-replacement',
    patterns: ['variable-window'],
    hints: [
      'Window is valid if (windowSize - maxFreq) <= k.',
      'maxFreq = most frequent character in window.',
      'We can replace at most k characters to make all same.',
    ],
    explanation: 'Variable window tracking character frequencies. Window valid if we can replace (size - maxFreq) chars with ≤ k. Expand right, shrink left when invalid.',
    description: 'Given string s and integer k, you can replace at most k characters. Return the length of the longest substring with all same characters.',
  },
  {
    problemId: 'permutation-in-string',
    patterns: ['fixed-window'],
    hints: [
      'A permutation has same character frequencies.',
      'Use a fixed window of size s1.length.',
      'Compare frequency counts as window slides.',
    ],
    explanation: 'Fixed sliding window of size |s1|. Compare character frequencies in window with s1. Match found when frequencies equal.',
    description: 'Given two strings s1 and s2, return true if s2 contains a permutation of s1 (any arrangement of s1\'s characters as substring).',
  },
  {
    problemId: 'minimum-window-substring',
    patterns: ['variable-window'],
    hints: [
      'Need a window containing all characters of t.',
      'Expand until valid, then shrink while maintaining validity.',
      'Track required chars and how many are satisfied.',
    ],
    explanation: 'Variable window with char frequency tracking. Expand right until window contains all of t. Shrink from left while still valid, update minimum.',
    description: 'Given strings s and t, return the minimum window substring of s containing all characters of t (including duplicates). Empty if no such window.',
  },
  {
    problemId: 'sliding-window-maximum',
    patterns: ['fixed-window', 'monotonic-deque'],
    hints: [
      'Need max of each window of size k.',
      'Brute force: O(nk). Can we do O(n)?',
      'Use a monotonic decreasing deque.',
    ],
    explanation: 'Monotonic deque stores indices of decreasing elements. Front is always window max. Remove elements outside window and smaller elements when adding.',
    description: 'Given an array nums and window size k, return the max value of each sliding window as it moves from left to right.',
  },

  // ========== Stack ==========
  {
    problemId: 'valid-parentheses',
    patterns: ['stack-matching'],
    hints: [
      'Each closing bracket must match the most recent opening.',
      'LIFO order - use a stack.',
      'Push opening brackets, pop and match on closing.',
    ],
    explanation: 'Push opening brackets onto stack. For closing brackets, check if top matches. If not, or stack empty at end, invalid.',
    description: 'Given a string containing just \'(\', \')\', \'{\', \'}\', \'[\', \']\', determine if the input string is valid (every open bracket has matching close in correct order).',
  },
  {
    problemId: 'min-stack',
    patterns: ['stack-matching'],
    hints: [
      'Need O(1) push, pop, top, AND getMin.',
      'How can you track minimum efficiently?',
      'Store minimum alongside each element, or use auxiliary stack.',
    ],
    explanation: 'Each stack entry stores (value, minSoFar). When pushing, min = min(value, current min). Pop just removes top. O(1) operations.',
    description: 'Design a stack that supports push, pop, top, and retrieving the minimum element, all in O(1) time.',
  },
  {
    problemId: 'daily-temperatures',
    patterns: ['monotonic-stack'],
    hints: [
      'For each day, find the next warmer day.',
      'Stack of indices waiting for warmer temps.',
      'Pop indices when current temp is warmer.',
    ],
    explanation: 'Monotonic decreasing stack of indices. For each temp, pop all smaller temps and record days waited. Push current index.',
    description: 'Given array of daily temperatures, return array where answer[i] is number of days until a warmer temperature. 0 if no future warmer day.',
  },
  {
    problemId: 'evaluate-reverse-polish-notation',
    patterns: ['stack-matching'],
    hints: [
      'RPN: operands come before operator.',
      'When you see an operator, apply to last two operands.',
      'Use stack to hold operands.',
    ],
    explanation: 'Push numbers onto stack. On operator: pop two operands, compute, push result. Final stack top is answer.',
    description: 'Evaluate the expression in Reverse Polish Notation. Valid operators are +, -, *, /. Each operand may be an integer or another expression.',
  },
  {
    problemId: 'generate-parentheses',
    patterns: ['subsets-pattern'],
    hints: [
      'Generate all valid combinations - backtracking!',
      'Track open and close counts.',
      'Can add open if open < n, close if close < open.',
    ],
    explanation: 'Backtracking with two counters. Add \'(\' if openCount < n. Add \')\' if closeCount < openCount. Base case: both counts = n.',
    description: 'Given n pairs of parentheses, generate all combinations of well-formed parentheses.',
  },
  {
    problemId: 'largest-rectangle-in-histogram',
    patterns: ['monotonic-stack'],
    hints: [
      'For each bar, find how far it can extend left and right.',
      'Limited by first shorter bar on each side.',
      'Monotonic increasing stack of indices.',
    ],
    explanation: 'Monotonic increasing stack. When bar is shorter than top, pop and calculate area (popped bar\'s height × width to current). Add sentinel heights.',
    description: 'Given array heights representing histogram bar heights (width = 1 each), find the area of the largest rectangle in the histogram.',
  },

  // ========== Binary Search ==========
  {
    problemId: 'binary-search',
    patterns: ['standard-binary-search'],
    hints: [
      'Array is sorted - eliminate half each step.',
      'Compare middle element with target.',
      'Adjust left or right boundary based on comparison.',
    ],
    explanation: 'Classic binary search. Compare mid with target. If equal, found. If target > mid, search right half. If target < mid, search left half.',
    description: 'Given a sorted array of integers nums and target, return the index if found, otherwise return -1. Must be O(log n).',
  },
  {
    problemId: 'search-2d-matrix',
    patterns: ['standard-binary-search'],
    hints: [
      'Each row is sorted, first element > last of previous row.',
      'Can treat the matrix as a 1D sorted array.',
      'Binary search with index mapping: row = mid / cols, col = mid % cols.',
    ],
    explanation: 'Treat m×n matrix as sorted array of length m*n. Binary search with index = row*cols + col. Map back: row = mid/cols, col = mid%cols.',
    description: 'Given an m×n matrix where each row is sorted and first integer of each row > last integer of previous row, search for target value.',
  },
  {
    problemId: 'koko-eating-bananas',
    patterns: ['binary-search-answer'],
    hints: [
      'Binary search on the answer (eating speed k).',
      'Can Koko finish all bananas at speed k in h hours?',
      'Time for pile = ceil(pile / k). Sum of times ≤ h?',
    ],
    explanation: 'Binary search on speed k from 1 to max(piles). For each k, check if Koko can finish in h hours. Find minimum valid k.',
    description: 'Koko has n banana piles. She can eat at most k bananas/hour per pile. With h hours before guards return, find minimum k to eat all bananas.',
  },
  {
    problemId: 'find-minimum-in-rotated-sorted-array',
    patterns: ['standard-binary-search'],
    hints: [
      'The array is sorted but rotated at some pivot.',
      'One half is always sorted.',
      'Minimum is at the rotation point.',
    ],
    explanation: 'Binary search. If nums[mid] > nums[right], min is in right half. Else min is in left half (including mid). Converge on the minimum.',
    description: 'Given a sorted array rotated 1 to n times, find the minimum element. All elements are unique. Must be O(log n).',
  },
  {
    problemId: 'search-in-rotated-sorted-array',
    patterns: ['standard-binary-search'],
    hints: [
      'The array is sorted but rotated.',
      'At least one half is always properly sorted.',
      'Check which half is sorted, then check if target is in it.',
    ],
    explanation: 'Binary search. Identify the sorted half. Check if target is in the sorted half\'s range. Eliminate the half that can\'t contain target.',
    description: 'Given a sorted rotated array with unique elements, search for target. Return index if found, -1 if not. Must be O(log n).',
  },
  {
    problemId: 'time-based-key-value-store',
    patterns: ['binary-search-answer'],
    hints: [
      'Timestamps are always increasing for same key.',
      'Find largest timestamp ≤ given timestamp.',
      'Binary search on the timestamps.',
    ],
    explanation: 'Store (key → list of (timestamp, value)). On get, binary search for largest timestamp ≤ given timestamp.',
    description: 'Design a key-value store where each key has timestamped values. Get returns value with timestamp ≤ given timestamp, or "" if none.',
  },

  // ========== Linked List ==========
  {
    problemId: 'reverse-linked-list',
    patterns: ['reverse-in-place'],
    hints: [
      'Change the direction of each pointer.',
      'Need to save next node before changing pointer.',
      'Use three pointers: prev, current, next.',
    ],
    explanation: 'Three pointers. Save next = curr.next. Reverse: curr.next = prev. Advance: prev = curr, curr = next. Return prev at end.',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
  },
  {
    problemId: 'merge-two-sorted-lists',
    patterns: ['merge-sorted'],
    hints: [
      'Compare heads of both lists.',
      'Take smaller one, advance that list\'s pointer.',
      'Continue until one list is exhausted.',
    ],
    explanation: 'Use dummy head. Compare l1.val and l2.val, append smaller to result, advance that list. Attach remaining list at end.',
    description: 'Merge two sorted linked lists into one sorted list by splicing together the nodes. Return the merged list\'s head.',
  },
  {
    problemId: 'linked-list-cycle',
    patterns: ['fast-slow'],
    hints: [
      'If there\'s a cycle, you\'ll loop forever.',
      'Two pointers at different speeds will meet in a cycle.',
      'Fast moves 2 steps, slow moves 1 step.',
    ],
    explanation: 'Fast-slow pointers. Fast moves 2 steps, slow moves 1. If they meet, cycle exists. If fast reaches null, no cycle.',
    description: 'Given head, determine if the linked list has a cycle. A cycle exists if some node can be reached again by following next pointers.',
  },
  {
    problemId: 'reorder-list',
    patterns: ['fast-slow', 'reverse-in-place'],
    hints: [
      'Pattern: L0→Ln→L1→Ln-1→L2→Ln-2→...',
      'Find middle, reverse second half, merge alternating.',
      'Combine fast-slow (find middle) + reverse + merge.',
    ],
    explanation: 'Three steps: 1) Find middle with fast-slow. 2) Reverse second half. 3) Merge first and reversed second half alternating.',
    description: 'Reorder list from L0→L1→...→Ln to L0→Ln→L1→Ln-1→L2→Ln-2→... Do not modify node values, only node positions.',
  },
  {
    problemId: 'remove-nth-node-from-end',
    patterns: ['fast-slow'],
    hints: [
      'To find nth from end, how far apart should two pointers be?',
      'Move fast n steps ahead, then move both together.',
      'When fast reaches end, slow is at nth from end.',
    ],
    explanation: 'Two pointers n apart. Move fast n steps ahead. Then move both until fast reaches end. Slow is at node before target. Remove slow.next.',
    description: 'Given linked list head, remove the nth node from the end and return the head. Try to do it in one pass.',
  },
  {
    problemId: 'lru-cache',
    patterns: ['hash-table', 'doubly-linked-list'],
    hints: [
      'Need O(1) get and put.',
      'HashMap for O(1) access by key.',
      'Doubly linked list for O(1) removal and insertion (track recency).',
    ],
    explanation: 'HashMap maps key → node. Doubly linked list maintains recency order. Most recent at head. On access, move to head. On eviction, remove tail.',
    description: 'Design LRU Cache with capacity. get(key) returns value or -1. put(key, value) updates or inserts, evicting least recently used if at capacity.',
  },
  {
    problemId: 'add-two-numbers',
    patterns: ['linked-list-math'],
    hints: [
      'Numbers are stored in reverse order - units digit first.',
      'Add corresponding digits plus carry.',
      'Handle different list lengths and final carry.',
    ],
    explanation: 'Traverse both lists simultaneously, add digits plus carry. Create new node with digit = sum % 10, carry = sum / 10. Handle remaining carry.',
    description: 'Given two linked lists representing non-negative integers in reverse order, add them and return the sum as a linked list.',
  },

  // ========== Trees ==========
  {
    problemId: 'invert-binary-tree',
    patterns: ['dfs-traversal', 'tree-recursion-return'],
    hints: [
      'Swap left and right children at each node.',
      'Recursively invert the subtrees.',
      'Base case: null node.',
    ],
    explanation: 'At each node, swap left and right children, then recursively invert both subtrees. Base case returns null.',
    description: 'Given the root of a binary tree, invert the tree (mirror it) and return its root.',
  },
  {
    problemId: 'maximum-depth-of-binary-tree',
    patterns: ['dfs-traversal', 'tree-recursion-return'],
    hints: [
      'Depth = 1 + max(leftDepth, rightDepth).',
      'Base case: null node has depth 0.',
      'Can use DFS or BFS.',
    ],
    explanation: 'Recursively compute max depth. Return 0 for null. For each node, return 1 + max(leftDepth, rightDepth).',
    description: 'Given a binary tree, find its maximum depth. Maximum depth is the number of nodes along the longest root-to-leaf path.',
  },
  {
    problemId: 'same-tree',
    patterns: ['dfs-traversal', 'tree-recursion-return'],
    hints: [
      'Two trees are same if roots match and subtrees match.',
      'Base case: both null → same. One null → different.',
      'Recursively check left and right subtrees.',
    ],
    explanation: 'Recursively compare. Both null → true. One null or values differ → false. Otherwise check left subtrees same AND right subtrees same.',
    description: 'Given roots of two binary trees p and q, check if they are the same (structurally identical with same node values).',
  },
  {
    problemId: 'subtree-of-another-tree',
    patterns: ['dfs-traversal', 'tree-recursion-return'],
    hints: [
      'Check if subRoot matches at any node in root.',
      'Use same-tree check at each node.',
      'Recursively search left and right subtrees.',
    ],
    explanation: 'For each node in root tree, check if the subtree rooted there is same as subRoot. Use same-tree comparison helper.',
    description: 'Given roots of two binary trees root and subRoot, return true if subRoot is a subtree of root.',
  },
  {
    problemId: 'binary-tree-level-order-traversal',
    patterns: ['bfs-level-order'],
    hints: [
      'Level by level traversal - use BFS.',
      'Process all nodes at current level before next level.',
      'Track level size to know when level ends.',
    ],
    explanation: 'BFS with queue. Record queue size at level start. Process exactly that many nodes, adding their children. Collect nodes per level.',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes (left to right, level by level).',
  },
  {
    problemId: 'validate-bst',
    patterns: ['dfs-traversal'],
    hints: [
      'BST: all left descendants < node < all right descendants.',
      'Track valid range for each node.',
      'Update range when going left (upper bound) or right (lower bound).',
    ],
    explanation: 'DFS with min/max bounds. Start with (-∞, +∞). Left child must be < current. Right child must be > current. Update bounds accordingly.',
    description: 'Given root of a binary tree, determine if it is a valid binary search tree (left subtree values < root < right subtree values).',
  },
  {
    problemId: 'lowest-common-ancestor-bst',
    patterns: ['dfs-traversal'],
    hints: [
      'BST property helps navigate efficiently.',
      'If both values < root, LCA is in left subtree.',
      'If both values > root, LCA is in right subtree.',
      'Otherwise, current node is the LCA.',
    ],
    explanation: 'Use BST property. If both p and q < root, go left. If both > root, go right. When split occurs (or found a target), current is LCA.',
    description: 'Given a BST and two nodes p and q, find their lowest common ancestor (LCA). LCA is lowest node having both p and q as descendants.',
  },
  {
    problemId: 'binary-tree-right-side-view',
    patterns: ['bfs-level-order', 'dfs-traversal'],
    hints: [
      'From the right, you see the rightmost node at each level.',
      'BFS: take last node of each level.',
      'DFS: visit right child first, track depth.',
    ],
    explanation: 'BFS: for each level, the last node visited is the rightmost. Or DFS right-first with depth tracking - first node at each depth is rightmost.',
    description: 'Given a binary tree, return values of nodes visible from the right side, from top to bottom.',
  },
  {
    problemId: 'count-good-nodes',
    patterns: ['dfs-traversal'],
    hints: [
      'A "good" node has no greater values on path from root.',
      'Track maximum value seen on current path.',
      'Node is good if node.val >= maxOnPath.',
    ],
    explanation: 'DFS tracking maxSoFar on path. Node is good if val >= maxSoFar. Update maxSoFar = max(maxSoFar, val) when descending.',
    description: 'Given a binary tree, return the number of "good" nodes. A node X is good if no node on path from root to X has value > X.',
  },

  // ========== Backtracking ==========
  {
    problemId: 'subsets',
    patterns: ['subsets-pattern'],
    hints: [
      'For each element: include it or don\'t.',
      'Use backtracking to explore both choices.',
      'Result includes all intermediate states.',
    ],
    explanation: 'Backtracking. At each element, add to current subset and recurse, then backtrack. Add current subset to result at every step.',
    description: 'Given an integer array nums of unique elements, return all possible subsets (the power set). No duplicates in result.',
  },
  {
    problemId: 'combination-sum',
    patterns: ['combinations-pattern'],
    hints: [
      'Same number can be used multiple times.',
      'Use backtracking with a running sum.',
      'Don\'t go back to previous indices to avoid duplicates.',
    ],
    explanation: 'Backtracking with target reduction. For each candidate, include it (can reuse, so don\'t increment index) and recurse. Stop when target = 0 or < 0.',
    description: 'Given an array of distinct integers candidates and a target, return all unique combinations summing to target. Same number can be used unlimited times.',
  },
  {
    problemId: 'permutations',
    patterns: ['permutations-pattern'],
    hints: [
      'Every element must appear exactly once.',
      'Track which elements are used.',
      'Backtrack by marking unused after exploring.',
    ],
    explanation: 'Backtracking with used array. Try each unused element, mark used, recurse, then backtrack by marking unused. Base case: length = n.',
    description: 'Given an array nums of distinct integers, return all possible permutations in any order.',
  },
  {
    problemId: 'subsets-ii',
    patterns: ['subsets-pattern'],
    hints: [
      'Similar to Subsets, but has duplicates.',
      'Sort first to group duplicates.',
      'Skip duplicates at same recursion level.',
    ],
    explanation: 'Sort array. Backtracking like Subsets, but skip nums[i] if nums[i] == nums[i-1] and i > start (same level duplicate).',
    description: 'Given an integer array nums that may contain duplicates, return all possible subsets. No duplicate subsets in result.',
  },
  {
    problemId: 'combination-sum-ii',
    patterns: ['combinations-pattern'],
    hints: [
      'Each number can only be used once.',
      'Array has duplicates, result shouldn\'t.',
      'Sort and skip same elements at same level.',
    ],
    explanation: 'Sort array. Backtracking similar to Combination Sum, but increment index (no reuse) and skip duplicates at same level.',
    description: 'Given a collection of candidate numbers (may have duplicates) and target, find all unique combinations summing to target. Each number used at most once.',
  },
  {
    problemId: 'word-search',
    patterns: ['constraint-satisfaction', 'dfs-graph-traversal'],
    hints: [
      'Search for word starting from each cell.',
      'DFS exploring 4 directions.',
      'Mark visited cells to avoid reusing.',
    ],
    explanation: 'For each cell, DFS searching for word. Mark cell as visited (modify char), explore 4 neighbors, backtrack by restoring char.',
    description: 'Given an m×n grid of characters board and a string word, return true if word exists in the grid (consecutive adjacent cells).',
  },
  {
    problemId: 'n-queens',
    patterns: ['constraint-satisfaction'],
    hints: [
      'Place queens one row at a time.',
      'Check column, diagonal, anti-diagonal constraints.',
      'Backtrack if no valid position in current row.',
    ],
    explanation: 'Backtracking row by row. For each row, try each column. Check if safe (no queen in column, diagonals). Place, recurse, backtrack.',
    description: 'Place n queens on an n×n chessboard such that no two queens attack each other. Return all distinct solutions.',
  },
  {
    problemId: 'palindrome-partitioning',
    patterns: ['subsets-pattern', 'constraint-satisfaction'],
    hints: [
      'Partition string into palindromic substrings.',
      'Try all possible first palindrome, then recurse on rest.',
      'Each partition choice is a backtracking branch.',
    ],
    explanation: 'Backtracking. Try each prefix that is palindrome, add to current partition, recurse on suffix. Base case: empty string = valid partition.',
    description: 'Given a string s, partition it such that every substring is a palindrome. Return all possible palindrome partitionings.',
  },
  {
    problemId: 'letter-combinations',
    patterns: ['combinations-pattern'],
    hints: [
      'Each digit maps to 3-4 letters.',
      'Combine one letter from each digit.',
      'Backtracking through each digit\'s options.',
    ],
    explanation: 'Backtracking. For each digit, try all its letters. Recurse to next digit. Base case: processed all digits, add combination.',
    description: 'Given a string containing digits 2-9, return all possible letter combinations (phone keypad mapping).',
  },

  // ========== Graphs ==========
  {
    problemId: 'number-of-islands',
    patterns: ['dfs-graph-traversal', 'bfs-graph-traversal'],
    hints: [
      'Each connected group of \'1\'s is an island.',
      'When you find a \'1\', explore and mark all connected land.',
      'Count how many times you start a new exploration.',
    ],
    explanation: 'Iterate grid. On each unvisited \'1\', increment count and DFS/BFS to mark all connected \'1\'s as visited.',
    description: 'Given an m×n grid of \'1\'s (land) and \'0\'s (water), count the number of islands (connected groups of land).',
  },
  {
    problemId: 'clone-graph',
    patterns: ['dfs-graph-traversal', 'bfs-graph-traversal'],
    hints: [
      'Need to clone nodes and their connections.',
      'Use HashMap to track original → clone mapping.',
      'DFS or BFS to traverse and clone.',
    ],
    explanation: 'DFS/BFS with HashMap. For each node, create clone if not exists, then clone neighbors recursively. Return cloned start node.',
    description: 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.',
  },
  {
    problemId: 'course-schedule',
    patterns: ['topological-sort', 'cycle-detection'],
    hints: [
      'Prerequisites form a directed graph.',
      'Can finish all courses if no circular dependency.',
      'Detect cycle in directed graph.',
    ],
    explanation: 'Build adjacency list from prerequisites. Detect cycle using DFS with 3 states (unvisited, visiting, visited). No cycle = can finish.',
    description: 'There are numCourses courses with prerequisites. Return true if you can finish all courses (no circular dependencies).',
  },
  {
    problemId: 'pacific-atlantic-water-flow',
    patterns: ['dfs-graph-traversal'],
    hints: [
      'Water flows from high to low.',
      'Instead of from each cell, think from the oceans inward.',
      'Find cells reachable from Pacific AND Atlantic.',
    ],
    explanation: 'Reverse thinking: DFS from ocean borders going to higher/equal cells. Find cells reachable from both Pacific (top/left) and Atlantic (bottom/right).',
    description: 'Given m×n island with height grid, find cells where rain water can flow to both Pacific (top/left) and Atlantic (bottom/right) oceans.',
  },
  {
    problemId: 'rotting-oranges',
    patterns: ['bfs-graph-traversal'],
    hints: [
      'Rotten oranges spread to neighbors each minute.',
      'Multi-source BFS - all rotten oranges spread simultaneously.',
      'Track minutes as BFS levels.',
    ],
    explanation: 'Add all initially rotten oranges to queue. BFS: each level = 1 minute. Rot adjacent fresh oranges. Count minutes until all rotted or impossible.',
    description: 'In a grid with 0=empty, 1=fresh orange, 2=rotten orange, every minute rotten oranges rot adjacent fresh ones. Return minutes to rot all, or -1.',
  },
  {
    problemId: 'course-schedule-ii',
    patterns: ['topological-sort'],
    hints: [
      'Need an ordering where prerequisites come first.',
      'This is topological sort.',
      'Use Kahn\'s algorithm (BFS with indegree) or DFS.',
    ],
    explanation: 'Topological sort using Kahn\'s algorithm: track indegrees, start with 0-indegree nodes, reduce neighbor indegrees. Or DFS post-order reverse.',
    description: 'Return the ordering of courses to finish all of them. If impossible (cycle), return empty array.',
  },

  // ========== Dynamic Programming ==========
  {
    problemId: 'climbing-stairs',
    patterns: ['1d-dp'],
    hints: [
      'To reach step n, you came from step n-1 or n-2.',
      'dp[n] = dp[n-1] + dp[n-2].',
      'This is the Fibonacci sequence!',
    ],
    explanation: 'DP where dp[i] = ways to reach step i. Recurrence: dp[i] = dp[i-1] + dp[i-2]. Base: dp[1]=1, dp[2]=2. Can optimize to O(1) space.',
    description: 'You can climb 1 or 2 steps at a time. How many distinct ways can you climb to the top (n steps)?',
  },
  {
    problemId: 'house-robber',
    patterns: ['1d-dp'],
    hints: [
      'Can\'t rob adjacent houses.',
      'For house i: rob it + dp[i-2], or skip and take dp[i-1].',
      'dp[i] = max(rob[i] + dp[i-2], dp[i-1]).',
    ],
    explanation: 'DP where dp[i] = max money up to house i. Recurrence: dp[i] = max(nums[i] + dp[i-2], dp[i-1]). Can optimize to O(1) space.',
    description: 'Rob houses along a street. Adjacent houses have connected security - can\'t rob two adjacent. Find maximum money you can rob.',
  },
  {
    problemId: 'coin-change',
    patterns: ['1d-dp', 'knapsack-pattern'],
    hints: [
      'Minimum coins to make each amount.',
      'For amount i, try each coin: dp[i] = min(dp[i], dp[i-coin] + 1).',
      'Bottom-up from amount 0.',
    ],
    explanation: 'DP where dp[i] = min coins for amount i. For each amount, try each coin. dp[i] = min(dp[i], dp[i-coin] + 1). Return dp[amount].',
    description: 'Given coins of different denominations and a total amount, find the fewest coins needed. Return -1 if that amount can\'t be made.',
  },
  {
    problemId: 'longest-increasing-subsequence',
    patterns: ['1d-dp', 'lcs-lis-pattern'],
    hints: [
      'dp[i] = length of LIS ending at index i.',
      'For each i, check all j < i where nums[j] < nums[i].',
      'Can optimize to O(n log n) with binary search.',
    ],
    explanation: 'DP where dp[i] = LIS length ending at i. For each i, dp[i] = max(dp[j] + 1) for all j < i where nums[j] < nums[i]. Answer = max(dp).',
    description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
  },
  {
    problemId: 'unique-paths',
    patterns: ['2d-dp'],
    hints: [
      'Can only move right or down.',
      'Ways to reach (i,j) = ways from top + ways from left.',
      'dp[i][j] = dp[i-1][j] + dp[i][j-1].',
    ],
    explanation: '2D DP. dp[i][j] = paths to cell (i,j). Recurrence: dp[i][j] = dp[i-1][j] + dp[i][j-1]. Base: first row and column are all 1.',
    description: 'A robot on an m×n grid starts top-left, wants to reach bottom-right. It can only move right or down. How many unique paths?',
  },
  {
    problemId: 'longest-common-subsequence',
    patterns: ['2d-dp', 'lcs-lis-pattern'],
    hints: [
      'Compare characters at each position.',
      'If match: 1 + LCS of remaining.',
      'If no match: max(skip from text1, skip from text2).',
    ],
    explanation: '2D DP. If text1[i] == text2[j]: dp[i][j] = dp[i-1][j-1] + 1. Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).',
    description: 'Given two strings text1 and text2, return the length of their longest common subsequence. If none, return 0.',
  },

  // ========== Heap / Priority Queue ==========
  {
    problemId: 'kth-largest-element-in-stream',
    patterns: ['heap-pattern'],
    hints: [
      'Need to efficiently track kth largest.',
      'Min-heap of size k keeps k largest elements.',
      'Heap top = kth largest.',
    ],
    explanation: 'Maintain min-heap of size k. On add: push element, pop if size > k. Top of heap is always kth largest.',
    description: 'Design a class to find the kth largest element in a stream. Return kth largest after each new element is added.',
  },
  {
    problemId: 'task-scheduler',
    patterns: ['heap-pattern', 'greedy-interval'],
    hints: [
      'Same task needs n intervals between executions.',
      'Process most frequent tasks first (greedy).',
      'Use max-heap for frequency, track cooldown.',
    ],
    explanation: 'Greedy with max-heap. Each cycle: take up to n+1 most frequent tasks. Track remaining counts. Add idle if fewer tasks than cycle length.',
    description: 'Given tasks array and cooldown n, find minimum intervals to complete all tasks. Same task needs at least n intervals between executions.',
  },
  {
    problemId: 'find-median-from-data-stream',
    patterns: ['heap-pattern'],
    hints: [
      'Median = middle of sorted data.',
      'Maintain two halves: smaller and larger.',
      'Use max-heap for smaller half, min-heap for larger.',
    ],
    explanation: 'Two heaps: max-heap for smaller half, min-heap for larger half. Balance sizes. Median = top of larger heap or average of both tops.',
    description: 'Design a data structure that supports adding integers and finding the median. Median is middle value (or average of two middle values).',
  },

  // ========== Intervals ==========
  {
    problemId: 'merge-intervals',
    patterns: ['merge-intervals'],
    hints: [
      'Sort intervals by start time.',
      'If current overlaps with last merged, extend end.',
      'Otherwise, add as new interval.',
    ],
    explanation: 'Sort by start time. For each interval: if overlaps with last (start ≤ last.end), merge by updating end. Else add as new.',
    description: 'Given an array of intervals, merge all overlapping intervals and return non-overlapping intervals covering all inputs.',
  },
  {
    problemId: 'insert-interval',
    patterns: ['merge-intervals'],
    hints: [
      'Three parts: before, overlapping, after.',
      'Add all intervals ending before newInterval starts.',
      'Merge all overlapping, then add remaining.',
    ],
    explanation: 'Add intervals ending before new starts. Merge intervals overlapping with new. Add remaining intervals after new.',
    description: 'Given sorted non-overlapping intervals and a new interval, insert the new interval and merge if necessary.',
  },
  {
    problemId: 'non-overlapping-intervals',
    patterns: ['merge-intervals', 'greedy-interval'],
    hints: [
      'Minimize removals = maximize kept intervals.',
      'Greedy: keep interval that ends earliest.',
      'Sort by end time, keep non-overlapping.',
    ],
    explanation: 'Sort by end time. Greedily keep intervals: if start >= last.end, keep it. Count removed = total - kept.',
    description: 'Given an array of intervals, return the minimum number of intervals to remove to make the rest non-overlapping.',
  },
  {
    problemId: 'meeting-rooms-ii',
    patterns: ['meeting-rooms', 'heap-pattern'],
    hints: [
      'Need to find maximum concurrent meetings.',
      'Sort by start time, track end times of ongoing meetings.',
      'Use min-heap for end times.',
    ],
    explanation: 'Sort by start. Use min-heap of end times. For each meeting: remove ended meetings (end ≤ start), add current. Max heap size = rooms needed.',
    description: 'Given an array of meeting time intervals, find the minimum number of conference rooms required.',
  },
];

// Helper function to get mapping for a specific problem
export function getPatternMapping(problemId: string): ProblemPatternMapping | undefined {
  return problemPatternMappings.find(m => m.problemId === problemId);
}

// Helper function to get all problems using a specific pattern
export function getProblemsForPattern(patternId: string): ProblemPatternMapping[] {
  return problemPatternMappings.filter(m => m.patterns.includes(patternId));
}

// Get all unique patterns used in mappings
export function getAllUsedPatterns(): string[] {
  const patternSet = new Set<string>();
  problemPatternMappings.forEach(m => m.patterns.forEach(p => patternSet.add(p)));
  return Array.from(patternSet);
}
