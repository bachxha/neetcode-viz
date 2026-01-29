export interface PatternProblem {
  id: string;          // matches problem.id in problems.ts
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcodeUrl: string;
}

export interface Pattern {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  shortDescription: string;
  keyInsight: string;
  timeComplexity: string;
  spaceComplexity: string;
  javaTemplate: string;
  steps: string[];
  relatedProblems: PatternProblem[];
}

export type PatternCategory = 
  | 'Sliding Window' 
  | 'Two Pointers' 
  | 'Binary Search'
  | 'Trees'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Backtracking'
  | 'Intervals'
  | 'Linked List';

export interface PatternCategoryInfo {
  name: PatternCategory;
  description: string;
  icon: string;
  color: string;
}

export const patternCategories: PatternCategoryInfo[] = [
  {
    name: 'Sliding Window',
    description: 'Maintain a window over a contiguous subarray/substring, expanding and shrinking to satisfy constraints.',
    icon: '🪟',
    color: 'blue',
  },
  {
    name: 'Two Pointers',
    description: 'Use two pointers to traverse data from different positions, narrowing the search space efficiently.',
    icon: '👉',
    color: 'purple',
  },
  {
    name: 'Binary Search',
    description: 'Divide the search space in half each step to find targets or optimize values in O(log n) time.',
    icon: '🔍',
    color: 'green',
  },
  {
    name: 'Trees',
    description: 'Recursive algorithms for tree traversal, construction, and manipulation using DFS/BFS patterns.',
    icon: '🌳',
    color: 'emerald',
  },
  {
    name: 'Graphs',
    description: 'Graph traversal, cycle detection, topological sorting, and connectivity patterns.',
    icon: '🕸️',
    color: 'cyan',
  },
  {
    name: 'Dynamic Programming',
    description: 'Break down complex problems into subproblems, store solutions to avoid recomputation.',
    icon: '💡',
    color: 'yellow',
  },
  {
    name: 'Backtracking',
    description: 'Exhaustive search with pruning - build solutions incrementally and backtrack when needed.',
    icon: '↩️',
    color: 'red',
  },
  {
    name: 'Intervals',
    description: 'Merge, schedule, and manipulate overlapping intervals with sorting-based approaches.',
    icon: '📊',
    color: 'orange',
  },
  {
    name: 'Linked List',
    description: 'In-place manipulation, cycle detection, and multi-pointer techniques for linked structures.',
    icon: '🔗',
    color: 'pink',
  },
];

export const patterns: Pattern[] = [
  // ─── Sliding Window ────────────────────────────────────────────────
  {
    id: 'fixed-window',
    name: 'Fixed Window',
    category: 'Sliding Window',
    description: 'Slide a window of fixed size K across the array. Useful when the problem specifies a fixed-length subarray or substring to analyze.',
    shortDescription: 'Slide a window of size K across the array',
    keyInsight: 'Instead of recalculating the entire window from scratch, subtract the element leaving the window and add the element entering. This turns O(n·k) into O(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) for sum-based, O(k) if tracking window contents',
    javaTemplate: `// Fixed Sliding Window Template
// Problem: Find max sum of subarray of size K
public int maxSumSubarray(int[] nums, int k) {
    int windowSum = 0;
    int maxSum = Integer.MIN_VALUE;

    for (int i = 0; i < nums.length; i++) {
        windowSum += nums[i];          // Add right element

        if (i >= k) {
            windowSum -= nums[i - k];  // Remove left element
        }

        if (i >= k - 1) {
            maxSum = Math.max(maxSum, windowSum);
        }
    }

    return maxSum;
}`,
    steps: [
      'Initialize window sum = 0 and max = -∞',
      'Add elements until window reaches size K',
      'Record the first window sum',
      'Slide: remove leftmost, add next right element',
      'Update max if current window sum is larger',
      'Repeat until end of array',
    ],
    relatedProblems: [
      { id: 'permutation-in-string', title: 'Permutation in String', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutation-in-string/' },
      { id: 'sliding-window-maximum', title: 'Sliding Window Maximum', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/' },
    ],
  },
  {
    id: 'variable-window',
    name: 'Variable Window',
    category: 'Sliding Window',
    description: 'Expand the window by moving the right pointer, and shrink by moving the left pointer when a constraint is violated. The window size changes dynamically.',
    shortDescription: 'Expand/shrink window based on condition',
    keyInsight: 'The left pointer only moves forward, so each element is added and removed at most once. Despite the nested while loop, total work is O(n).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k) where k = charset/element size',
    javaTemplate: `// Variable Sliding Window Template
// Problem: Longest substring without repeating characters
public int lengthOfLongestSubstring(String s) {
    Set<Character> window = new HashSet<>();
    int left = 0;
    int maxLen = 0;

    for (int right = 0; right < s.length(); right++) {
        // Shrink window until constraint is satisfied
        while (window.contains(s.charAt(right))) {
            window.remove(s.charAt(left));
            left++;
        }

        // Expand window
        window.add(s.charAt(right));

        // Update answer
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}`,
    steps: [
      'Initialize left = 0, right = 0, track window state',
      'Expand: move right pointer, add element to window',
      'Check constraint: is window still valid?',
      'If invalid: shrink by moving left, removing elements',
      'Update best answer with current window size',
      'Repeat until right reaches end',
    ],
    relatedProblems: [
      { id: 'longest-substring-without-repeating', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: 'longest-repeating-character-replacement', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
      { id: 'minimum-window-substring', title: 'Minimum Window Substring', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/' },
      { id: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
    ],
  },

  // ─── Two Pointers ──────────────────────────────────────────────────
  {
    id: 'opposite-direction',
    name: 'Opposite Direction',
    category: 'Two Pointers',
    description: 'Start pointers at both ends and move them inward. Works when the data is sorted or when you need to compare extremes. The key insight is deciding which pointer to move based on the current state.',
    shortDescription: 'Start from both ends, move inward',
    keyInsight: 'By starting from the extremes and moving inward, you guarantee you explore the full range. The decision of which pointer to move is problem-specific but eliminates impossible candidates.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    javaTemplate: `// Opposite Direction Two Pointers Template
// Problem: Two Sum II (sorted array)
public int[] twoSum(int[] numbers, int target) {
    int left = 0;
    int right = numbers.length - 1;

    while (left < right) {
        int sum = numbers[left] + numbers[right];

        if (sum == target) {
            return new int[]{left + 1, right + 1};
        } else if (sum < target) {
            left++;     // Need larger sum → move left up
        } else {
            right--;    // Need smaller sum → move right down
        }
    }

    return new int[]{-1, -1}; // No solution
}`,
    steps: [
      'Place left pointer at start, right pointer at end',
      'Calculate current value (sum, area, etc.)',
      'Compare against target or track best',
      'Decide which pointer to move based on comparison',
      'Move pointer inward',
      'Repeat until pointers meet',
    ],
    relatedProblems: [
      { id: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/' },
      { id: 'two-sum-ii', title: 'Two Sum II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { id: '3sum', title: '3Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/3sum/' },
      { id: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/' },
      { id: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/' },
    ],
  },
  {
    id: 'fast-slow',
    name: 'Fast-Slow Pointers',
    category: 'Two Pointers',
    description: 'Two pointers moving at different speeds through the same data structure. The classic application is Floyd\'s cycle detection (tortoise and hare), but also useful for finding the middle of a linked list.',
    shortDescription: 'Floyd\'s cycle detection, finding middle',
    keyInsight: 'If there is a cycle, the fast pointer will eventually "lap" the slow pointer inside the cycle, just like a faster runner on a circular track catches the slower one. No cycle means fast hits null.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    javaTemplate: `// Fast-Slow Pointers Template
// Problem: Linked List Cycle Detection
public boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;         // 1 step
        fast = fast.next.next;    // 2 steps

        if (slow == fast) {
            return true;          // Cycle detected!
        }
    }

    return false; // Fast reached null → no cycle
}

// Bonus: Find cycle start
public ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            slow = head;          // Reset slow to head
            while (slow != fast) {
                slow = slow.next; // Both move 1 step
                fast = fast.next;
            }
            return slow;          // Cycle start!
        }
    }
    return null;
}`,
    steps: [
      'Place both pointers at the head/start',
      'Move slow pointer by 1 step',
      'Move fast pointer by 2 steps',
      'Check if they meet (cycle!) or fast hits null (no cycle)',
      'If cycle found, optionally find cycle start: reset slow to head, advance both by 1',
      'They meet again at the cycle entry point',
    ],
    relatedProblems: [
      { id: 'linked-list-cycle', title: 'Linked List Cycle', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: 'find-the-duplicate-number', title: 'Find the Duplicate Number', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/' },
      { id: 'happy-number', title: 'Happy Number', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/happy-number/' },
      { id: 'reorder-list', title: 'Reorder List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/' },
    ],
  },

  // ─── Binary Search ─────────────────────────────────────────────────
  {
    id: 'standard-binary-search',
    name: 'Standard Binary Search',
    category: 'Binary Search',
    description: 'Classic binary search on a sorted array. Compare the middle element with the target and eliminate half of the remaining search space each iteration.',
    shortDescription: 'Find target in sorted array',
    keyInsight: 'Each comparison eliminates half the remaining elements. The key decision is whether to use left <= right (closed interval) or left < right (open interval), and how to update bounds.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    javaTemplate: `// Standard Binary Search Template
public int search(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2; // Avoid overflow

        if (nums[mid] == target) {
            return mid;           // Found!
        } else if (nums[mid] < target) {
            left = mid + 1;       // Target is in right half
        } else {
            right = mid - 1;      // Target is in left half
        }
    }

    return -1; // Not found
}`,
    steps: [
      'Set left = 0, right = length - 1',
      'Calculate mid = left + (right - left) / 2',
      'Compare nums[mid] with target',
      'If equal → found! Return mid',
      'If nums[mid] < target → search right half (left = mid + 1)',
      'If nums[mid] > target → search left half (right = mid - 1)',
      'Repeat while left ≤ right',
    ],
    relatedProblems: [
      { id: 'binary-search', title: 'Binary Search', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/binary-search/' },
      { id: 'search-2d-matrix', title: 'Search a 2D Matrix', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/' },
      { id: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
      { id: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
    ],
  },
  {
    id: 'binary-search-answer',
    name: 'Binary Search on Answer Space',
    category: 'Binary Search',
    description: 'Instead of searching for an element, binary search on the range of possible answers. Use a feasibility function to check if a candidate answer works, then narrow the range.',
    shortDescription: 'Minimize/maximize a value',
    keyInsight: 'When the problem asks to minimize/maximize a value and you can write a function to check "is X feasible?", binary search over X. The feasibility function must be monotonic: once true, stays true (or vice versa).',
    timeComplexity: 'O(n · log(answer_range))',
    spaceComplexity: 'O(1)',
    javaTemplate: `// Binary Search on Answer Space Template
// Problem: Koko Eating Bananas (minimize eating speed)
public int minEatingSpeed(int[] piles, int h) {
    int left = 1;                          // Min possible answer
    int right = Arrays.stream(piles).max().getAsInt(); // Max possible

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (canFinish(piles, mid, h)) {
            right = mid;       // mid works, try smaller
        } else {
            left = mid + 1;    // mid too slow, need faster
        }
    }

    return left; // Minimum feasible speed
}

// Feasibility function: can Koko finish at speed k in h hours?
private boolean canFinish(int[] piles, int k, int h) {
    int hours = 0;
    for (int pile : piles) {
        hours += (pile + k - 1) / k;  // ceil(pile / k)
    }
    return hours <= h;
}`,
    steps: [
      'Identify the answer range: [min_possible, max_possible]',
      'Set left = min, right = max',
      'Calculate mid = left + (right - left) / 2',
      'Check feasibility: can we achieve the goal with mid?',
      'If feasible → try smaller (right = mid)',
      'If not feasible → need larger (left = mid + 1)',
      'When left == right, that\'s our answer',
    ],
    relatedProblems: [
      { id: 'koko-eating-bananas', title: 'Koko Eating Bananas', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/' },
      { id: 'time-based-key-value-store', title: 'Time Based Key-Value Store', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/' },
      { id: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
    ],
  },

  // ─── Trees ─────────────────────────────────────────────────────────
  {
    id: 'dfs-traversal',
    name: 'DFS Traversal',
    category: 'Trees',
    description: 'Depth-First Search traversal patterns: preorder (root, left, right), inorder (left, root, right), postorder (left, right, root). Each serves different purposes.',
    shortDescription: 'Preorder, inorder, postorder traversal',
    keyInsight: 'The order determines when you process the current node vs its children. Preorder for copying structure, inorder for sorted output in BST, postorder for bottom-up calculations.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    javaTemplate: `// DFS Traversal Templates
class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

// Preorder: Root → Left → Right
public void preorder(TreeNode root) {
    if (root == null) return;
    
    process(root);              // Process current
    preorder(root.left);        // Process left subtree
    preorder(root.right);       // Process right subtree
}

// Inorder: Left → Root → Right
public void inorder(TreeNode root) {
    if (root == null) return;
    
    inorder(root.left);         // Process left subtree
    process(root);              // Process current
    inorder(root.right);        // Process right subtree
}

// Postorder: Left → Right → Root
public void postorder(TreeNode root) {
    if (root == null) return;
    
    postorder(root.left);       // Process left subtree
    postorder(root.right);      // Process right subtree
    process(root);              // Process current
}`,
    steps: [
      'Base case: if node is null, return',
      'Choose traversal order based on when to process current node',
      'Preorder: process current, then recurse left, then right',
      'Inorder: recurse left, process current, then recurse right',
      'Postorder: recurse left, recurse right, then process current',
      'Each recursive call handles its subtree completely',
    ],
    relatedProblems: [
      { id: 'binary-tree-preorder-traversal', title: 'Binary Tree Preorder Traversal', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-preorder-traversal/' },
      { id: 'binary-tree-inorder-traversal', title: 'Binary Tree Inorder Traversal', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
      { id: 'binary-tree-postorder-traversal', title: 'Binary Tree Postorder Traversal', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-postorder-traversal/' },
      { id: 'validate-bst', title: 'Validate Binary Search Tree', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/' },
    ],
  },
  {
    id: 'bfs-level-order',
    name: 'BFS Level Order',
    category: 'Trees',
    description: 'Breadth-First Search processes nodes level by level using a queue. Essential for level-order traversal, finding tree width, and problems requiring level-specific processing.',
    shortDescription: 'Level by level traversal with queue',
    keyInsight: 'Process all nodes at the current level before moving to the next level. Queue size at the start of each iteration gives you the number of nodes at that level.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(w) where w is max tree width',
    javaTemplate: `// BFS Level Order Template
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        int levelSize = queue.size();       // Nodes at current level
        List<Integer> currentLevel = new ArrayList<>();
        
        // Process all nodes at current level
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            currentLevel.add(node.val);
            
            // Add children for next level
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        
        result.add(currentLevel);
    }
    
    return result;
}`,
    steps: [
      'Initialize queue and add root if not null',
      'While queue is not empty:',
      '  Record current level size',
      '  Process exactly that many nodes (current level)',
      '  For each node: add to result, enqueue children',
      'This naturally separates levels',
    ],
    relatedProblems: [
      { id: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { id: 'binary-tree-right-side-view', title: 'Binary Tree Right Side View', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
      { id: 'binary-tree-zigzag-level-order-traversal', title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/' },
      { id: 'minimum-depth-of-binary-tree', title: 'Minimum Depth of Binary Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/minimum-depth-of-binary-tree/' },
    ],
  },
  {
    id: 'tree-recursion-return',
    name: 'Tree Recursion with Return Values',
    category: 'Trees',
    description: 'Recursive tree algorithms that return values from subtrees and combine them. Common for calculating heights, sums, or detecting properties that depend on subtree results.',
    shortDescription: 'Calculate and return values from subtrees',
    keyInsight: 'Each recursive call returns information about its subtree. The current node combines results from left and right subtrees to compute its own result.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    javaTemplate: `// Tree Recursion with Return Values Template
// Problem: Maximum Depth of Binary Tree
public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    
    int leftDepth = maxDepth(root.left);    // Get left subtree depth
    int rightDepth = maxDepth(root.right);  // Get right subtree depth
    
    return Math.max(leftDepth, rightDepth) + 1; // Current depth
}

// Problem: Balanced Binary Tree
public boolean isBalanced(TreeNode root) {
    return checkBalance(root) != -1;
}

private int checkBalance(TreeNode root) {
    if (root == null) return 0;
    
    int leftHeight = checkBalance(root.left);
    if (leftHeight == -1) return -1;        // Left subtree unbalanced
    
    int rightHeight = checkBalance(root.right);
    if (rightHeight == -1) return -1;       // Right subtree unbalanced
    
    if (Math.abs(leftHeight - rightHeight) > 1) {
        return -1;                          // Current node unbalanced
    }
    
    return Math.max(leftHeight, rightHeight) + 1; // Return height
}`,
    steps: [
      'Base case: return appropriate value for null node',
      'Recursively get results from left subtree',
      'Recursively get results from right subtree',
      'Combine left and right results with current node',
      'Return the combined result to parent',
      'Handle error cases (return sentinel like -1)',
    ],
    relatedProblems: [
      { id: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { id: 'balanced-binary-tree', title: 'Balanced Binary Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/balanced-binary-tree/' },
      { id: 'diameter-of-binary-tree', title: 'Diameter of Binary Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
      { id: 'binary-tree-max-path-sum', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
    ],
  },
  {
    id: 'tree-construction',
    name: 'Tree Construction',
    category: 'Trees',
    description: 'Build binary trees from traversal arrays (preorder/inorder, postorder/inorder) or other representations. Requires understanding traversal patterns.',
    shortDescription: 'Build trees from traversal arrays',
    keyInsight: 'Preorder/postorder tells you root positions, inorder tells you left/right subtree boundaries. Use this to recursively partition and build subtrees.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) for hashmap + O(h) recursion',
    javaTemplate: `// Tree Construction Template
// Problem: Build tree from preorder and inorder
public TreeNode buildTree(int[] preorder, int[] inorder) {
    Map<Integer, Integer> inMap = new HashMap<>();
    
    // Build hashmap for O(1) inorder lookups
    for (int i = 0; i < inorder.length; i++) {
        inMap.put(inorder[i], i);
    }
    
    return build(preorder, 0, preorder.length - 1,
                 inorder, 0, inorder.length - 1, inMap);
}

private TreeNode build(int[] preorder, int preStart, int preEnd,
                      int[] inorder, int inStart, int inEnd,
                      Map<Integer, Integer> inMap) {
    if (preStart > preEnd) return null;
    
    // First element in preorder is root
    TreeNode root = new TreeNode(preorder[preStart]);
    
    // Find root position in inorder
    int mid = inMap.get(root.val);
    int leftSize = mid - inStart;
    
    // Build left subtree
    root.left = build(preorder, preStart + 1, preStart + leftSize,
                     inorder, inStart, mid - 1, inMap);
    
    // Build right subtree
    root.right = build(preorder, preStart + leftSize + 1, preEnd,
                      inorder, mid + 1, inEnd, inMap);
    
    return root;
}`,
    steps: [
      'Create hashmap for O(1) inorder index lookup',
      'Use first preorder element as root',
      'Find root position in inorder array',
      'Calculate left subtree size',
      'Recursively build left subtree with correct ranges',
      'Recursively build right subtree with correct ranges',
    ],
    relatedProblems: [
      { id: 'construct-tree-from-preorder-inorder', title: 'Construct Binary Tree from Preorder and Inorder', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
      { id: 'construct-tree-from-postorder-inorder', title: 'Construct Binary Tree from Inorder and Postorder', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/' },
      { id: 'serialize-deserialize-binary-tree', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
    ],
  },

  // ─── Graphs ────────────────────────────────────────────────────────
  {
    id: 'dfs-graph-traversal',
    name: 'DFS Graph Traversal',
    category: 'Graphs',
    description: 'Explore graph nodes deeply before backtracking. Uses recursion or stack. Good for pathfinding, connected components, and cycle detection.',
    shortDescription: 'Deep exploration with recursion/stack',
    keyInsight: 'Mark nodes as visited to avoid cycles. DFS naturally explores one path completely before trying alternatives, making it good for finding any path or detecting connectivity.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V) for visited set + O(V) recursion stack',
    javaTemplate: `// DFS Graph Traversal Template
public void dfs(int[][] graph) {
    boolean[] visited = new boolean[graph.length];
    
    for (int i = 0; i < graph.length; i++) {
        if (!visited[i]) {
            dfsHelper(graph, i, visited);
        }
    }
}

private void dfsHelper(int[][] graph, int node, boolean[] visited) {
    visited[node] = true;
    process(node);  // Process current node
    
    // Visit all neighbors
    for (int neighbor : graph[node]) {
        if (!visited[neighbor]) {
            dfsHelper(graph, neighbor, visited);
        }
    }
}

// Iterative DFS with explicit stack
public void dfsIterative(int[][] graph) {
    boolean[] visited = new boolean[graph.length];
    Stack<Integer> stack = new Stack<>();
    
    for (int start = 0; start < graph.length; start++) {
        if (!visited[start]) {
            stack.push(start);
            
            while (!stack.isEmpty()) {
                int node = stack.pop();
                if (!visited[node]) {
                    visited[node] = true;
                    process(node);
                    
                    for (int neighbor : graph[node]) {
                        if (!visited[neighbor]) {
                            stack.push(neighbor);
                        }
                    }
                }
            }
        }
    }
}`,
    steps: [
      'Initialize visited array for all nodes',
      'For each unvisited node, start DFS',
      'Mark current node as visited',
      'Process current node',
      'Recursively visit all unvisited neighbors',
      'Backtrack when no more neighbors',
    ],
    relatedProblems: [
      { id: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/' },
      { id: 'max-area-of-island', title: 'Max Area of Island', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/max-area-of-island/' },
      { id: 'clone-graph', title: 'Clone Graph', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/clone-graph/' },
      { id: 'pacific-atlantic-water-flow', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
    ],
  },
  {
    id: 'bfs-graph-traversal',
    name: 'BFS Graph Traversal',
    category: 'Graphs',
    description: 'Explore graph nodes level by level using a queue. Guarantees shortest path in unweighted graphs. Good for minimum steps problems.',
    shortDescription: 'Level by level exploration with queue',
    keyInsight: 'BFS explores nodes in order of distance from start. First time you reach a node is via the shortest path, making it optimal for unweighted shortest path problems.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V) for queue and visited set',
    javaTemplate: `// BFS Graph Traversal Template
public int bfsShortestPath(int[][] graph, int start, int target) {
    if (start == target) return 0;
    
    boolean[] visited = new boolean[graph.length];
    Queue<Integer> queue = new LinkedList<>();
    
    queue.offer(start);
    visited[start] = true;
    int steps = 0;
    
    while (!queue.isEmpty()) {
        int size = queue.size();
        steps++;
        
        // Process all nodes at current distance
        for (int i = 0; i < size; i++) {
            int node = queue.poll();
            
            // Check all neighbors
            for (int neighbor : graph[node]) {
                if (neighbor == target) {
                    return steps;  // Found target!
                }
                
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.offer(neighbor);
                }
            }
        }
    }
    
    return -1;  // Target not reachable
}

// Multi-source BFS (e.g., Rotting Oranges)
public int multiSourceBFS(int[][] grid) {
    Queue<int[]> queue = new LinkedList<>();
    
    // Add all initial sources to queue
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == 2) {  // Initial "infected" cells
                queue.offer(new int[]{i, j});
            }
        }
    }
    
    int minutes = 0;
    int[][] directions = {{-1,0}, {1,0}, {0,-1}, {0,1}};
    
    while (!queue.isEmpty()) {
        int size = queue.size();
        
        for (int i = 0; i < size; i++) {
            int[] pos = queue.poll();
            
            for (int[] dir : directions) {
                int nx = pos[0] + dir[0];
                int ny = pos[1] + dir[1];
                
                if (nx >= 0 && nx < grid.length && 
                    ny >= 0 && ny < grid[0].length && 
                    grid[nx][ny] == 1) {
                    grid[nx][ny] = 2;
                    queue.offer(new int[]{nx, ny});
                }
            }
        }
        
        if (!queue.isEmpty()) minutes++;
    }
    
    return minutes;
}`,
    steps: [
      'Initialize queue with starting node(s)',
      'Mark starting nodes as visited',
      'While queue is not empty:',
      '  Process all nodes at current level/distance',
      '  Add unvisited neighbors to queue',
      '  Increment distance/steps',
      'Return when target found or queue empty',
    ],
    relatedProblems: [
      { id: 'rotting-oranges', title: 'Rotting Oranges', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/' },
      { id: 'walls-and-gates', title: 'Walls and Gates', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/walls-and-gates/' },
      { id: 'word-ladder', title: 'Word Ladder', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/word-ladder/' },
      { id: 'minimum-knight-moves', title: 'Minimum Knight Moves', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/minimum-knight-moves/' },
    ],
  },
  {
    id: 'cycle-detection',
    name: 'Cycle Detection',
    category: 'Graphs',
    description: 'Detect cycles in directed and undirected graphs. Uses DFS with node states (white/gray/black) for directed graphs, or parent tracking for undirected graphs.',
    shortDescription: 'Find cycles using DFS with states',
    keyInsight: 'For directed graphs: if you find a "gray" node (currently being explored), there\'s a cycle. For undirected graphs: if you reach a visited node that\'s not the parent, there\'s a cycle.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V) for recursion and state tracking',
    javaTemplate: `// Cycle Detection Templates
// Directed Graph Cycle Detection
enum Color { WHITE, GRAY, BLACK }

public boolean hasCycleDirected(List<List<Integer>> graph) {
    int n = graph.size();
    Color[] colors = new Color[n];
    Arrays.fill(colors, Color.WHITE);
    
    for (int i = 0; i < n; i++) {
        if (colors[i] == Color.WHITE) {
            if (dfsDirected(graph, i, colors)) {
                return true;
            }
        }
    }
    return false;
}

private boolean dfsDirected(List<List<Integer>> graph, int node, Color[] colors) {
    colors[node] = Color.GRAY;  // Currently exploring
    
    for (int neighbor : graph.get(node)) {
        if (colors[neighbor] == Color.GRAY) {
            return true;  // Back edge found → cycle!
        }
        if (colors[neighbor] == Color.WHITE && 
            dfsDirected(graph, neighbor, colors)) {
            return true;
        }
    }
    
    colors[node] = Color.BLACK;  // Done exploring
    return false;
}

// Undirected Graph Cycle Detection
public boolean hasCycleUndirected(int[][] graph) {
    boolean[] visited = new boolean[graph.length];
    
    for (int i = 0; i < graph.length; i++) {
        if (!visited[i]) {
            if (dfsUndirected(graph, i, -1, visited)) {
                return true;
            }
        }
    }
    return false;
}

private boolean dfsUndirected(int[][] graph, int node, int parent, boolean[] visited) {
    visited[node] = true;
    
    for (int neighbor : graph[node]) {
        if (!visited[neighbor]) {
            if (dfsUndirected(graph, neighbor, node, visited)) {
                return true;
            }
        } else if (neighbor != parent) {
            return true;  // Visited non-parent → cycle!
        }
    }
    
    return false;
}`,
    steps: [
      'For directed graphs: use three states (WHITE/GRAY/BLACK)',
      'For undirected graphs: track parent to avoid false positives',
      'Start DFS from each unvisited node',
      'Mark node as GRAY (currently exploring)',
      'If neighbor is GRAY → back edge → cycle detected',
      'After exploring all neighbors, mark as BLACK (done)',
    ],
    relatedProblems: [
      { id: 'course-schedule', title: 'Course Schedule', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule/' },
      { id: 'course-schedule-ii', title: 'Course Schedule II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/' },
      { id: 'graph-valid-tree', title: 'Graph Valid Tree', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/graph-valid-tree/' },
      { id: 'redundant-connection', title: 'Redundant Connection', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/redundant-connection/' },
    ],
  },
  {
    id: 'topological-sort',
    name: 'Topological Sort',
    category: 'Graphs',
    description: 'Order nodes in a directed acyclic graph such that for every edge u→v, u comes before v. Uses DFS (reverse postorder) or Kahn\'s algorithm (indegree-based).',
    shortDescription: 'Linear ordering of DAG nodes',
    keyInsight: 'Topological order exists only in DAGs. DFS approach: add node to result after processing all descendants. Kahn\'s approach: repeatedly remove nodes with no incoming edges.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V) for result and auxiliary data structures',
    javaTemplate: `// Topological Sort Templates
// Method 1: Kahn's Algorithm (BFS-based)
public List<Integer> topologicalSort(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    int[] indegree = new int[numCourses];
    
    // Build graph and calculate indegrees
    for (int i = 0; i < numCourses; i++) {
        graph.add(new ArrayList<>());
    }
    
    for (int[] prereq : prerequisites) {
        int course = prereq[0];
        int prerequisite = prereq[1];
        graph.get(prerequisite).add(course);
        indegree[course]++;
    }
    
    // Start with nodes having no incoming edges
    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (indegree[i] == 0) {
            queue.offer(i);
        }
    }
    
    List<Integer> result = new ArrayList<>();
    
    while (!queue.isEmpty()) {
        int node = queue.poll();
        result.add(node);
        
        // Reduce indegree of neighbors
        for (int neighbor : graph.get(node)) {
            indegree[neighbor]--;
            if (indegree[neighbor] == 0) {
                queue.offer(neighbor);
            }
        }
    }
    
    // Check for cycle
    if (result.size() != numCourses) {
        return new ArrayList<>();  // Cycle detected
    }
    
    return result;
}

// Method 2: DFS-based (Reverse Postorder)
public List<Integer> topologicalSortDFS(List<List<Integer>> graph) {
    int n = graph.size();
    boolean[] visited = new boolean[n];
    LinkedList<Integer> result = new LinkedList<>();
    
    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            dfs(graph, i, visited, result);
        }
    }
    
    return result;
}

private void dfs(List<List<Integer>> graph, int node, boolean[] visited, LinkedList<Integer> result) {
    visited[node] = true;
    
    for (int neighbor : graph.get(node)) {
        if (!visited[neighbor]) {
            dfs(graph, neighbor, visited, result);
        }
    }
    
    result.addFirst(node);  // Add to front (reverse postorder)
}`,
    steps: [
      'Kahn\'s Algorithm:',
      '1. Calculate indegree for each node',
      '2. Add zero-indegree nodes to queue',
      '3. Process queue: add to result, reduce neighbor indegrees',
      '4. If result size < num nodes → cycle exists',
      'DFS Approach:',
      '1. Perform DFS from each unvisited node',
      '2. Add node to result after processing all descendants',
      '3. Use addFirst to get reverse postorder',
    ],
    relatedProblems: [
      { id: 'course-schedule-ii', title: 'Course Schedule II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/' },
      { id: 'alien-dictionary', title: 'Alien Dictionary', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/alien-dictionary/' },
      { id: 'minimum-height-trees', title: 'Minimum Height Trees', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/minimum-height-trees/' },
    ],
  },
  {
    id: 'union-find',
    name: 'Union Find',
    category: 'Graphs',
    description: 'Disjoint Set Union (DSU) data structure for efficiently managing connected components. Supports union operations and finding component representatives.',
    shortDescription: 'Efficiently manage connected components',
    keyInsight: 'Path compression makes find nearly O(1). Union by rank keeps trees shallow. Perfect for dynamic connectivity problems where you add edges and query connectivity.',
    timeComplexity: 'O(α(n)) per operation, where α is inverse Ackermann',
    spaceComplexity: 'O(n) for parent and rank arrays',
    javaTemplate: `// Union Find Template
class UnionFind {
    private int[] parent;
    private int[] rank;
    private int components;
    
    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        components = n;
        
        for (int i = 0; i < n; i++) {
            parent[i] = i;  // Each node is its own parent initially
            rank[i] = 0;
        }
    }
    
    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);  // Path compression
        }
        return parent[x];
    }
    
    public boolean union(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        
        if (rootX == rootY) {
            return false;  // Already connected
        }
        
        // Union by rank
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }
        
        components--;
        return true;
    }
    
    public boolean connected(int x, int y) {
        return find(x) == find(y);
    }
    
    public int getComponents() {
        return components;
    }
}

// Usage example: Connected Components
public int countComponents(int n, int[][] edges) {
    UnionFind uf = new UnionFind(n);
    
    for (int[] edge : edges) {
        uf.union(edge[0], edge[1]);
    }
    
    return uf.getComponents();
}`,
    steps: [
      'Initialize: each element is its own parent',
      'Find: follow parent pointers to root, compress path',
      'Union: connect roots of different components',
      'Use rank to keep trees shallow',
      'Path compression speeds up future finds',
      'Track component count for queries',
    ],
    relatedProblems: [
      { id: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/' },
      { id: 'redundant-connection', title: 'Redundant Connection', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/redundant-connection/' },
      { id: 'graph-valid-tree', title: 'Graph Valid Tree', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/graph-valid-tree/' },
      { id: 'connected-components', title: 'Number of Connected Components', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/' },
    ],
  },

  // ─── Dynamic Programming ───────────────────────────────────────────
  {
    id: '1d-dp',
    name: '1D DP (Linear Recurrence)',
    category: 'Dynamic Programming',
    description: 'Linear DP problems where state depends on previous elements. Classic examples include Fibonacci, climbing stairs, house robber, and coin change.',
    shortDescription: 'Linear recurrence relations',
    keyInsight: 'State dp[i] depends on previous states dp[i-1], dp[i-2], etc. Build solution bottom-up from base cases. Often space can be optimized to O(1).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n), can optimize to O(1) for many problems',
    javaTemplate: `// 1D DP Templates
// Problem: Climbing Stairs (Fibonacci pattern)
public int climbStairs(int n) {
    if (n <= 2) return n;
    
    int prev2 = 1;  // dp[i-2]
    int prev1 = 2;  // dp[i-1]
    
    for (int i = 3; i <= n; i++) {
        int current = prev1 + prev2;  // dp[i] = dp[i-1] + dp[i-2]
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// Problem: House Robber (choice pattern)
public int rob(int[] nums) {
    if (nums.length == 0) return 0;
    if (nums.length == 1) return nums[0];
    
    int prev2 = 0;         // dp[i-2]: max money up to i-2
    int prev1 = nums[0];   // dp[i-1]: max money up to i-1
    
    for (int i = 1; i < nums.length; i++) {
        int current = Math.max(prev1, prev2 + nums[i]); // rob or skip
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// Problem: Coin Change (unbounded knapsack)
public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);  // Initialize to impossible value
    dp[0] = 0;  // Base case
    
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    
    return dp[amount] > amount ? -1 : dp[amount];
}`,
    steps: [
      'Identify the recurrence relation',
      'Define base cases',
      'Choose between tabulation (bottom-up) or memoization',
      'For tabulation: fill dp array from base cases forward',
      'For space optimization: use variables instead of array',
      'Handle edge cases and invalid states',
    ],
    relatedProblems: [
      { id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/' },
      { id: 'house-robber', title: 'House Robber', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber/' },
      { id: 'coin-change', title: 'Coin Change', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change/' },
      { id: 'decode-ways', title: 'Decode Ways', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/decode-ways/' },
      { id: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
    ],
  },
  {
    id: '2d-dp',
    name: '2D DP (Grid Problems)',
    category: 'Dynamic Programming',
    description: 'Two-dimensional DP problems involving grids, matrices, or two sequences. State depends on two parameters, often representing position or indices.',
    shortDescription: 'Grid-based or two-sequence problems',
    keyInsight: 'State dp[i][j] typically depends on dp[i-1][j], dp[i][j-1], and dp[i-1][j-1]. Fill row by row or use memoization. Space can often be optimized to O(n).',
    timeComplexity: 'O(m × n)',
    spaceComplexity: 'O(m × n), can optimize to O(min(m, n))',
    javaTemplate: `// 2D DP Templates
// Problem: Unique Paths
public int uniquePaths(int m, int n) {
    int[] dp = new int[n];
    Arrays.fill(dp, 1);  // First row all 1s
    
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] += dp[j - 1];  // dp[i][j] = dp[i-1][j] + dp[i][j-1]
        }
    }
    
    return dp[n - 1];
}

// Problem: Longest Common Subsequence
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length();
    int n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

// Problem: Edit Distance
public int minDistance(String word1, String word2) {
    int m = word1.length();
    int n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    
    // Initialize base cases
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // delete
                    Math.min(
                        dp[i][j - 1], // insert
                        dp[i - 1][j - 1] // replace
                    )
                );
            }
        }
    }
    
    return dp[m][n];
}`,
    steps: [
      'Identify two dimensions (usually positions/indices)',
      'Define state: what does dp[i][j] represent?',
      'Establish base cases (boundaries)',
      'Find recurrence relation between adjacent cells',
      'Fill table systematically (row by row)',
      'Consider space optimization using rolling array',
    ],
    relatedProblems: [
      { id: 'unique-paths', title: 'Unique Paths', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/unique-paths/' },
      { id: 'longest-common-subsequence', title: 'Longest Common Subsequence', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/' },
      { id: 'edit-distance', title: 'Edit Distance', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/edit-distance/' },
      { id: 'minimum-path-sum', title: 'Minimum Path Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/minimum-path-sum/' },
      { id: 'interleaving-string', title: 'Interleaving String', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/interleaving-string/' },
    ],
  },
  {
    id: 'knapsack-pattern',
    name: 'Knapsack Pattern',
    category: 'Dynamic Programming',
    description: 'Choose items to maximize/minimize value while staying within constraints. Includes 0/1 knapsack, unbounded knapsack, and partition problems.',
    shortDescription: 'Item selection with constraints',
    keyInsight: 'For each item, decide whether to take it or not. State typically involves current capacity and items considered. Unbounded allows multiple uses of same item.',
    timeComplexity: 'O(n × capacity)',
    spaceComplexity: 'O(n × capacity), can optimize to O(capacity)',
    javaTemplate: `// Knapsack Pattern Templates
// 0/1 Knapsack (each item used at most once)
public int knapsack01(int[] weights, int[] values, int capacity) {
    int n = weights.length;
    int[] dp = new int[capacity + 1];
    
    for (int i = 0; i < n; i++) {
        // Iterate backwards to avoid using same item multiple times
        for (int w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    
    return dp[capacity];
}

// Unbounded Knapsack (each item can be used multiple times)
public int knapsackUnbounded(int[] weights, int[] values, int capacity) {
    int[] dp = new int[capacity + 1];
    
    for (int w = 1; w <= capacity; w++) {
        for (int i = 0; i < weights.length; i++) {
            if (weights[i] <= w) {
                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }
    }
    
    return dp[capacity];
}

// Problem: Partition Equal Subset Sum
public boolean canPartition(int[] nums) {
    int sum = Arrays.stream(nums).sum();
    if (sum % 2 != 0) return false;
    
    int target = sum / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    
    for (int num : nums) {
        for (int j = target; j >= num; j--) {
            dp[j] = dp[j] || dp[j - num];
        }
    }
    
    return dp[target];
}

// Problem: Coin Change 2 (count ways)
public int change(int amount, int[] coins) {
    int[] dp = new int[amount + 1];
    dp[0] = 1;
    
    for (int coin : coins) {
        for (int i = coin; i <= amount; i++) {
            dp[i] += dp[i - coin];
        }
    }
    
    return dp[amount];
}`,
    steps: [
      'Identify if it\'s 0/1 or unbounded knapsack',
      'Define state: dp[capacity] = maximum value/count',
      'For 0/1: iterate items outer, capacity backwards',
      'For unbounded: iterate capacity outer, items inner',
      'Base case: dp[0] = 0 (or 1 for counting problems)',
      'Consider capacity constraint in transitions',
    ],
    relatedProblems: [
      { id: 'partition-equal-subset-sum', title: 'Partition Equal Subset Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
      { id: 'coin-change', title: 'Coin Change', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change/' },
      { id: 'coin-change-ii', title: 'Coin Change II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change-ii/' },
      { id: 'target-sum', title: 'Target Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/target-sum/' },
      { id: 'combination-sum-iv', title: 'Combination Sum IV', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum-iv/' },
    ],
  },
  {
    id: 'lcs-lis-pattern',
    name: 'LCS/LIS Pattern',
    category: 'Dynamic Programming',
    description: 'Longest Common Subsequence and Longest Increasing Subsequence patterns. Finding optimal subsequences with specific properties.',
    shortDescription: 'Subsequence optimization problems',
    keyInsight: 'LCS: match characters from two sequences. LIS: for each element, find best subsequence ending at that element. Both use comparison-based transitions.',
    timeComplexity: 'O(n × m) for LCS, O(n²) or O(n log n) for LIS',
    spaceComplexity: 'O(n × m) for LCS, O(n) for LIS',
    javaTemplate: `// LCS/LIS Pattern Templates
// Longest Common Subsequence
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[] dp = new int[n + 1];
    
    for (int i = 1; i <= m; i++) {
        int prev = 0;
        for (int j = 1; j <= n; j++) {
            int temp = dp[j];
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[j] = prev + 1;
            } else {
                dp[j] = Math.max(dp[j], dp[j - 1]);
            }
            prev = temp;
        }
    }
    
    return dp[n];
}

// Longest Increasing Subsequence (O(n²) solution)
public int lengthOfLIS(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    
    return Arrays.stream(dp).max().orElse(0);
}

// Longest Increasing Subsequence (O(n log n) with binary search)
public int lengthOfLISOptimal(int[] nums) {
    List<Integer> tails = new ArrayList<>();
    
    for (int num : nums) {
        int left = 0, right = tails.size();
        
        // Binary search for insertion point
        while (left < right) {
            int mid = (left + right) / 2;
            if (tails.get(mid) < num) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        // Replace existing element or append new one
        if (left == tails.size()) {
            tails.add(num);
        } else {
            tails.set(left, num);
        }
    }
    
    return tails.size();
}

// Problem: Maximum Length of Pair Chain
public int findLongestChain(int[][] pairs) {
    Arrays.sort(pairs, (a, b) -> a[1] - b[1]);  // Sort by end time
    
    int count = 1;
    int end = pairs[0][1];
    
    for (int i = 1; i < pairs.length; i++) {
        if (pairs[i][0] > end) {
            count++;
            end = pairs[i][1];
        }
    }
    
    return count;
}`,
    steps: [
      'LCS: compare characters at each position',
      'If match: take diagonal + 1',
      'If no match: take max of left and top',
      'LIS: for each element, extend best subsequence',
      'O(n²): check all previous elements',
      'O(n log n): maintain sorted array with binary search',
    ],
    relatedProblems: [
      { id: 'longest-common-subsequence', title: 'Longest Common Subsequence', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/' },
      { id: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
      { id: 'edit-distance', title: 'Edit Distance', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/edit-distance/' },
      { id: 'distinct-subsequences', title: 'Distinct Subsequences', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/distinct-subsequences/' },
      { id: 'maximum-length-of-pair-chain', title: 'Maximum Length of Pair Chain', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/maximum-length-of-pair-chain/' },
    ],
  },
  {
    id: 'state-machine-dp',
    name: 'State Machine DP',
    category: 'Dynamic Programming',
    description: 'DP problems with explicit states and transitions between them. Common in stock problems, game theory, and problems with multiple phases.',
    shortDescription: 'Explicit states with transitions',
    keyInsight: 'Model the problem as a finite state machine. Each state represents a different situation, and transitions have costs/benefits. Track best way to reach each state.',
    timeComplexity: 'O(n × states)',
    spaceComplexity: 'O(states), can optimize with rolling array',
    javaTemplate: `// State Machine DP Templates
// Problem: Best Time to Buy and Sell Stock with Cooldown
public int maxProfitWithCooldown(int[] prices) {
    if (prices.length <= 1) return 0;
    
    int held = -prices[0];     // State: holding stock
    int sold = 0;              // State: just sold (cooldown)
    int rest = 0;              // State: resting (can buy)
    
    for (int i = 1; i < prices.length; i++) {
        int prevHeld = held;
        int prevSold = sold;
        int prevRest = rest;
        
        held = Math.max(prevHeld, prevRest - prices[i]); // keep holding or buy
        sold = prevHeld + prices[i];                     // sell stock
        rest = Math.max(prevRest, prevSold);             // rest or recover from cooldown
    }
    
    return Math.max(sold, rest);  // Can't end in held state
}

// Problem: Best Time to Buy and Sell Stock with Transaction Fee
public int maxProfitWithFee(int[] prices, int fee) {
    int hold = -prices[0];  // Max profit when holding stock
    int cash = 0;           // Max profit when not holding stock
    
    for (int i = 1; i < prices.length; i++) {
        hold = Math.max(hold, cash - prices[i]);
        cash = Math.max(cash, hold + prices[i] - fee);
    }
    
    return cash;
}

// Problem: Paint House (3 colors)
public int minCost(int[][] costs) {
    if (costs.length == 0) return 0;
    
    int red = costs[0][0];
    int blue = costs[0][1];
    int green = costs[0][2];
    
    for (int i = 1; i < costs.length; i++) {
        int newRed = costs[i][0] + Math.min(blue, green);
        int newBlue = costs[i][1] + Math.min(red, green);
        int newGreen = costs[i][2] + Math.min(red, blue);
        
        red = newRed;
        blue = newBlue;
        green = newGreen;
    }
    
    return Math.min(red, Math.min(blue, green));
}

// Problem: House Robber II (circular array)
public int robCircular(int[] nums) {
    if (nums.length == 1) return nums[0];
    
    // Case 1: Rob houses 0 to n-2
    int max1 = robLinear(Arrays.copyOfRange(nums, 0, nums.length - 1));
    
    // Case 2: Rob houses 1 to n-1
    int max2 = robLinear(Arrays.copyOfRange(nums, 1, nums.length));
    
    return Math.max(max1, max2);
}

private int robLinear(int[] nums) {
    int prev2 = 0, prev1 = 0;
    for (int num : nums) {
        int current = Math.max(prev1, prev2 + num);
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}`,
    steps: [
      'Identify different states in the problem',
      'Define what each state represents',
      'Determine valid transitions between states',
      'Initialize base states',
      'For each step, update all states based on transitions',
      'Return optimal final state',
    ],
    relatedProblems: [
      { id: 'best-time-to-buy-sell-stock-with-cooldown', title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/' },
      { id: 'best-time-to-buy-sell-stock-with-fee', title: 'Best Time to Buy and Sell Stock with Transaction Fee', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/' },
      { id: 'paint-house', title: 'Paint House', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/paint-house/' },
      { id: 'house-robber-ii', title: 'House Robber II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/' },
    ],
  },

  // ─── Backtracking ──────────────────────────────────────────────────
  {
    id: 'subsets-pattern',
    name: 'Subsets Pattern',
    category: 'Backtracking',
    description: 'Generate all possible subsets of a given set. Each element can be included or excluded. Handles duplicates by sorting and skipping consecutive duplicates.',
    shortDescription: 'Generate all possible subsets',
    keyInsight: 'For each element, you have two choices: include it or skip it. Use backtracking to explore both paths. For duplicates, sort first and skip consecutive identical elements.',
    timeComplexity: 'O(2ⁿ × n) - 2ⁿ subsets, each taking O(n) to copy',
    spaceComplexity: 'O(n) recursion depth',
    javaTemplate: `// Subsets Pattern Templates
// Basic Subsets (no duplicates)
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
    result.add(new ArrayList<>(current));  // Add current subset
    
    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);              // Include nums[i]
        backtrack(nums, i + 1, current, result);
        current.remove(current.size() - 1); // Backtrack
    }
}

// Subsets II (with duplicates)
public List<List<Integer>> subsetsWithDup(int[] nums) {
    Arrays.sort(nums);  // Sort to group duplicates
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
    result.add(new ArrayList<>(current));
    
    for (int i = start; i < nums.length; i++) {
        // Skip duplicates: if not the first element in this level and same as previous
        if (i > start && nums[i] == nums[i - 1]) continue;
        
        current.add(nums[i]);
        backtrack(nums, i + 1, current, result);
        current.remove(current.size() - 1);
    }
}

// Alternative: Include/Exclude approach
public List<List<Integer>> subsetsIncludeExclude(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int index, List<Integer> current, List<List<Integer>> result) {
    if (index == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }
    
    // Exclude current element
    backtrack(nums, index + 1, current, result);
    
    // Include current element
    current.add(nums[index]);
    backtrack(nums, index + 1, current, result);
    current.remove(current.size() - 1);
}`,
    steps: [
      'Sort array if duplicates need to be handled',
      'Use backtracking with start index',
      'Add current subset to result',
      'Try including each remaining element',
      'Recurse with incremented start index',
      'Backtrack by removing last element',
      'Skip duplicates by checking i > start && nums[i] == nums[i-1]',
    ],
    relatedProblems: [
      { id: 'subsets', title: 'Subsets', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets/' },
      { id: 'subsets-ii', title: 'Subsets II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets-ii/' },
      { id: 'combination-sum', title: 'Combination Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum/' },
      { id: 'combination-sum-ii', title: 'Combination Sum II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum-ii/' },
    ],
  },
  {
    id: 'permutations-pattern',
    name: 'Permutations Pattern',
    category: 'Backtracking',
    description: 'Generate all possible arrangements (permutations) of elements. Uses swapping or visited array to ensure each element appears exactly once in each permutation.',
    shortDescription: 'All possible arrangements',
    keyInsight: 'Each permutation uses all elements exactly once. Use a visited array or swap elements to track usage. For duplicates, sort and skip when appropriate.',
    timeComplexity: 'O(n! × n) - n! permutations, each taking O(n) to copy',
    spaceComplexity: 'O(n) for recursion and visited array',
    javaTemplate: `// Permutations Pattern Templates
// Basic Permutations (no duplicates)
public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, List<Integer> current, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }
    
    for (int i = 0; i < nums.length; i++) {
        if (current.contains(nums[i])) continue;  // Skip used elements
        
        current.add(nums[i]);
        backtrack(nums, current, result);
        current.remove(current.size() - 1);
    }
}

// Optimized with visited array
public List<List<Integer>> permuteOptimized(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    boolean[] used = new boolean[nums.length];
    backtrack(nums, new ArrayList<>(), used, result);
    return result;
}

private void backtrack(int[] nums, List<Integer> current, boolean[] used, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }
    
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        
        used[i] = true;
        current.add(nums[i]);
        backtrack(nums, current, used, result);
        current.remove(current.size() - 1);
        used[i] = false;
    }
}

// Permutations II (with duplicates)
public List<List<Integer>> permuteUnique(int[] nums) {
    Arrays.sort(nums);  // Sort to group duplicates
    List<List<Integer>> result = new ArrayList<>();
    boolean[] used = new boolean[nums.length];
    backtrack(nums, new ArrayList<>(), used, result);
    return result;
}

private void backtrack(int[] nums, List<Integer> current, boolean[] used, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }
    
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        
        // Skip duplicates: if previous identical element is not used
        if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
        
        used[i] = true;
        current.add(nums[i]);
        backtrack(nums, current, used, result);
        current.remove(current.size() - 1);
        used[i] = false;
    }
}

// Swap-based approach (in-place)
public List<List<Integer>> permuteSwap(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, result);
    return result;
}

private void backtrack(int[] nums, int start, List<List<Integer>> result) {
    if (start == nums.length) {
        result.add(Arrays.stream(nums).boxed().collect(Collectors.toList()));
        return;
    }
    
    for (int i = start; i < nums.length; i++) {
        swap(nums, start, i);
        backtrack(nums, start + 1, result);
        swap(nums, start, i);  // Backtrack
    }
}

private void swap(int[] nums, int i, int j) {
    int temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
}`,
    steps: [
      'Base case: when permutation is complete (length = n)',
      'Try each unused element in current position',
      'Mark element as used, add to current permutation',
      'Recurse to fill next position',
      'Backtrack: remove element and mark as unused',
      'For duplicates: sort first and skip consecutive duplicates appropriately',
    ],
    relatedProblems: [
      { id: 'permutations', title: 'Permutations', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutations/' },
      { id: 'permutations-ii', title: 'Permutations II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutations-ii/' },
      { id: 'next-permutation', title: 'Next Permutation', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/next-permutation/' },
      { id: 'permutation-sequence', title: 'Permutation Sequence', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/permutation-sequence/' },
    ],
  },
  {
    id: 'combinations-pattern',
    name: 'Combinations Pattern',
    category: 'Backtracking',
    description: 'Choose exactly k elements from n elements, or find combinations that sum to a target. Order doesn\'t matter, so use start index to avoid duplicates.',
    shortDescription: 'Choose k elements or sum to target',
    keyInsight: 'Unlike permutations, order doesn\'t matter. Use start index to ensure combinations are generated in lexicographic order and avoid duplicates like [1,2] and [2,1].',
    timeComplexity: 'O(C(n,k) × k) for combinations, O(2ⁿ) for sum problems',
    spaceComplexity: 'O(k) for recursion depth',
    javaTemplate: `// Combinations Pattern Templates
// Basic Combinations: choose k elements
public List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(1, n, k, new ArrayList<>(), result);
    return result;
}

private void backtrack(int start, int n, int k, List<Integer> current, List<List<Integer>> result) {
    if (current.size() == k) {
        result.add(new ArrayList<>(current));
        return;
    }
    
    // Pruning: if we can't possibly reach k elements
    int needed = k - current.size();
    if (n - start + 1 < needed) return;
    
    for (int i = start; i <= n; i++) {
        current.add(i);
        backtrack(i + 1, n, k, current, result);
        current.remove(current.size() - 1);
    }
}

// Combination Sum: unlimited use, sum to target
public List<List<Integer>> combinationSum(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(candidates);  // Optional: helps with pruning
    backtrack(candidates, 0, target, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] candidates, int start, int target, List<Integer> current, List<List<Integer>> result) {
    if (target == 0) {
        result.add(new ArrayList<>(current));
        return;
    }
    
    for (int i = start; i < candidates.length; i++) {
        if (candidates[i] > target) break;  // Pruning
        
        current.add(candidates[i]);
        backtrack(candidates, i, target - candidates[i], current, result);  // i, not i+1 (reuse allowed)
        current.remove(current.size() - 1);
    }
}

// Combination Sum II: each element used once, sum to target
public List<List<Integer>> combinationSum2(int[] candidates, int target) {
    Arrays.sort(candidates);  // Required for duplicate handling
    List<List<Integer>> result = new ArrayList<>();
    backtrack(candidates, 0, target, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] candidates, int start, int target, List<Integer> current, List<List<Integer>> result) {
    if (target == 0) {
        result.add(new ArrayList<>(current));
        return;
    }
    
    for (int i = start; i < candidates.length; i++) {
        if (candidates[i] > target) break;
        
        // Skip duplicates at the same level
        if (i > start && candidates[i] == candidates[i - 1]) continue;
        
        current.add(candidates[i]);
        backtrack(candidates, i + 1, target - candidates[i], current, result);  // i+1 (no reuse)
        current.remove(current.size() - 1);
    }
}

// Letter Combinations: map digits to letters
public List<String> letterCombinations(String digits) {
    if (digits.length() == 0) return new ArrayList<>();
    
    String[] mapping = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    List<String> result = new ArrayList<>();
    backtrack(digits, 0, new StringBuilder(), mapping, result);
    return result;
}

private void backtrack(String digits, int index, StringBuilder current, String[] mapping, List<String> result) {
    if (index == digits.length()) {
        result.add(current.toString());
        return;
    }
    
    String letters = mapping[digits.charAt(index) - '0'];
    for (char letter : letters.toCharArray()) {
        current.append(letter);
        backtrack(digits, index + 1, current, mapping, result);
        current.deleteCharAt(current.length() - 1);
    }
}`,
    steps: [
      'Use start index to maintain order and avoid duplicates',
      'Base case: when target reached or k elements chosen',
      'Try each element from start index onward',
      'Add element to current combination',
      'Recurse with updated start index (i+1 for no reuse, i for reuse)',
      'Backtrack by removing last element',
      'Add pruning to avoid unnecessary exploration',
    ],
    relatedProblems: [
      { id: 'combinations', title: 'Combinations', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combinations/' },
      { id: 'combination-sum', title: 'Combination Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum/' },
      { id: 'combination-sum-ii', title: 'Combination Sum II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum-ii/' },
      { id: 'letter-combinations', title: 'Letter Combinations of a Phone Number', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/' },
    ],
  },
  {
    id: 'constraint-satisfaction',
    name: 'Constraint Satisfaction',
    category: 'Backtracking',
    description: 'Solve problems with multiple constraints that must all be satisfied. Examples include N-Queens, Sudoku, and word search. Requires constraint checking at each step.',
    shortDescription: 'Multiple constraints must be satisfied',
    keyInsight: 'Check constraints early and often. Prune branches as soon as a constraint is violated. Use efficient constraint checking to avoid redundant work.',
    timeComplexity: 'Exponential, but pruning reduces actual complexity significantly',
    spaceComplexity: 'O(solution_depth) for recursion',
    javaTemplate: `// Constraint Satisfaction Templates
// N-Queens Problem
public List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    char[][] board = new char[n][n];
    
    // Initialize board
    for (int i = 0; i < n; i++) {
        Arrays.fill(board[i], '.');
    }
    
    backtrack(board, 0, result);
    return result;
}

private void backtrack(char[][] board, int row, List<List<String>> result) {
    if (row == board.length) {
        result.add(constructSolution(board));
        return;
    }
    
    for (int col = 0; col < board.length; col++) {
        if (isValid(board, row, col)) {
            board[row][col] = 'Q';
            backtrack(board, row + 1, result);
            board[row][col] = '.';  // Backtrack
        }
    }
}

private boolean isValid(char[][] board, int row, int col) {
    // Check column
    for (int i = 0; i < row; i++) {
        if (board[i][col] == 'Q') return false;
    }
    
    // Check diagonal (top-left)
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] == 'Q') return false;
    }
    
    // Check diagonal (top-right)
    for (int i = row - 1, j = col + 1; i >= 0 && j < board.length; i--, j++) {
        if (board[i][j] == 'Q') return false;
    }
    
    return true;
}

// Word Search in 2D Grid
public boolean wordSearch(char[][] board, String word) {
    for (int i = 0; i < board.length; i++) {
        for (int j = 0; j < board[0].length; j++) {
            if (dfs(board, word, 0, i, j)) {
                return true;
            }
        }
    }
    return false;
}

private boolean dfs(char[][] board, String word, int index, int row, int col) {
    if (index == word.length()) return true;
    
    if (row < 0 || row >= board.length || 
        col < 0 || col >= board[0].length || 
        board[row][col] != word.charAt(index)) {
        return false;
    }
    
    char temp = board[row][col];
    board[row][col] = '#';  // Mark as visited
    
    boolean found = dfs(board, word, index + 1, row + 1, col) ||
                   dfs(board, word, index + 1, row - 1, col) ||
                   dfs(board, word, index + 1, row, col + 1) ||
                   dfs(board, word, index + 1, row, col - 1);
    
    board[row][col] = temp;  // Restore
    return found;
}

// Sudoku Solver
public boolean solveSudoku(char[][] board) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (board[i][j] == '.') {
                for (char digit = '1'; digit <= '9'; digit++) {
                    if (isValidSudoku(board, i, j, digit)) {
                        board[i][j] = digit;
                        
                        if (solveSudoku(board)) {
                            return true;
                        }
                        
                        board[i][j] = '.';  // Backtrack
                    }
                }
                return false;  // No valid digit found
            }
        }
    }
    return true;  // All cells filled
}

private boolean isValidSudoku(char[][] board, int row, int col, char digit) {
    for (int i = 0; i < 9; i++) {
        // Check row
        if (board[row][i] == digit) return false;
        
        // Check column
        if (board[i][col] == digit) return false;
        
        // Check 3x3 box
        int boxRow = 3 * (row / 3) + i / 3;
        int boxCol = 3 * (col / 3) + i % 3;
        if (board[boxRow][boxCol] == digit) return false;
    }
    return true;
}`,
    steps: [
      'Identify all constraints that must be satisfied',
      'Check constraints before making a choice',
      'Make a choice (place queen, digit, etc.)',
      'Recursively solve remaining problem',
      'If solution found, return true',
      'If no solution, backtrack (undo choice)',
      'Try next possibility',
      'Return false if no possibilities work',
    ],
    relatedProblems: [
      { id: 'n-queens', title: 'N-Queens', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/n-queens/' },
      { id: 'word-search', title: 'Word Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/word-search/' },
      { id: 'sudoku-solver', title: 'Sudoku Solver', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/sudoku-solver/' },
      { id: 'palindrome-partitioning', title: 'Palindrome Partitioning', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/' },
    ],
  },

  // ─── Intervals ─────────────────────────────────────────────────────
  {
    id: 'merge-intervals',
    name: 'Merge Intervals Pattern',
    category: 'Intervals',
    description: 'Merge overlapping intervals by sorting first by start time, then merging consecutive overlapping intervals. Key for scheduling and range problems.',
    shortDescription: 'Merge overlapping intervals',
    keyInsight: 'Sort intervals by start time first. Then iterate through sorted intervals, merging current with previous if they overlap. Two intervals [a,b] and [c,d] overlap if b >= c.',
    timeComplexity: 'O(n log n) for sorting + O(n) for merging',
    spaceComplexity: 'O(1) if modifying input, O(n) for result',
    javaTemplate: `// Merge Intervals Pattern Templates
// Basic Merge Intervals
public int[][] merge(int[][] intervals) {
    if (intervals.length <= 1) return intervals;
    
    // Sort by start time
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    
    List<int[]> merged = new ArrayList<>();
    merged.add(intervals[0]);
    
    for (int i = 1; i < intervals.length; i++) {
        int[] current = intervals[i];
        int[] lastMerged = merged.get(merged.size() - 1);
        
        if (current[0] <= lastMerged[1]) {
            // Overlapping intervals - merge them
            lastMerged[1] = Math.max(lastMerged[1], current[1]);
        } else {
            // Non-overlapping - add as new interval
            merged.add(current);
        }
    }
    
    return merged.toArray(new int[merged.size()][]);
}

// Insert Interval
public int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> result = new ArrayList<>();
    int i = 0;
    
    // Add all intervals that end before newInterval starts
    while (i < intervals.length && intervals[i][1] < newInterval[0]) {
        result.add(intervals[i]);
        i++;
    }
    
    // Merge overlapping intervals
    while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.add(newInterval);
    
    // Add remaining intervals
    while (i < intervals.length) {
        result.add(intervals[i]);
        i++;
    }
    
    return result.toArray(new int[result.size()][]);
}

// Non-overlapping Intervals (minimum removals)
public int eraseOverlapIntervals(int[][] intervals) {
    if (intervals.length <= 1) return 0;
    
    // Sort by end time (greedy approach)
    Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
    
    int count = 0;
    int end = intervals[0][1];
    
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < end) {
            // Overlapping - remove current interval
            count++;
        } else {
            // Non-overlapping - update end
            end = intervals[i][1];
        }
    }
    
    return count;
}

// Interval List Intersections
public int[][] intervalIntersection(int[][] firstList, int[][] secondList) {
    List<int[]> result = new ArrayList<>();
    int i = 0, j = 0;
    
    while (i < firstList.length && j < secondList.length) {
        // Find intersection
        int start = Math.max(firstList[i][0], secondList[j][0]);
        int end = Math.min(firstList[i][1], secondList[j][1]);
        
        if (start <= end) {
            result.add(new int[]{start, end});
        }
        
        // Move pointer for interval that ends first
        if (firstList[i][1] < secondList[j][1]) {
            i++;
        } else {
            j++;
        }
    }
    
    return result.toArray(new int[result.size()][]);
}`,
    steps: [
      'Sort intervals by start time (or end time for some problems)',
      'Initialize result with first interval',
      'For each subsequent interval:',
      '  Check if it overlaps with last interval in result',
      '  If overlapping: merge by updating end time',
      '  If non-overlapping: add as new interval',
      'Return merged intervals',
    ],
    relatedProblems: [
      { id: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/' },
      { id: 'insert-interval', title: 'Insert Interval', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/insert-interval/' },
      { id: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/' },
      { id: 'interval-list-intersections', title: 'Interval List Intersections', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/interval-list-intersections/' },
    ],
  },
  {
    id: 'meeting-rooms',
    name: 'Meeting Rooms Pattern',
    category: 'Intervals',
    description: 'Determine if meetings can be scheduled without conflicts, or find minimum rooms needed. Uses sorting and greedy algorithms or heap for room assignment.',
    shortDescription: 'Schedule meetings optimally',
    keyInsight: 'Meeting Rooms I: sort by start time, check if any meeting starts before previous ends. Meeting Rooms II: use min-heap to track room end times, assign to earliest available room.',
    timeComplexity: 'O(n log n) for sorting and heap operations',
    spaceComplexity: 'O(n) for heap in Meeting Rooms II',
    javaTemplate: `// Meeting Rooms Pattern Templates
// Meeting Rooms I: Can attend all meetings?
public boolean canAttendMeetings(int[][] intervals) {
    // Sort by start time
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    
    for (int i = 1; i < intervals.length; i++) {
        // If current meeting starts before previous ends
        if (intervals[i][0] < intervals[i - 1][1]) {
            return false;
        }
    }
    
    return true;
}

// Meeting Rooms II: Minimum rooms needed
public int minMeetingRooms(int[][] intervals) {
    if (intervals.length == 0) return 0;
    
    // Sort by start time
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    
    // Min-heap to track end times of ongoing meetings
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    
    for (int[] meeting : intervals) {
        // Remove meetings that have ended
        while (!heap.isEmpty() && heap.peek() <= meeting[0]) {
            heap.poll();
        }
        
        // Add current meeting's end time
        heap.offer(meeting[1]);
    }
    
    return heap.size(); // Number of ongoing meetings = rooms needed
}

// Alternative approach using events
public int minMeetingRoomsEvents(int[][] intervals) {
    List<int[]> events = new ArrayList<>();
    
    // Create start and end events
    for (int[] interval : intervals) {
        events.add(new int[]{interval[0], 1});  // start event
        events.add(new int[]{interval[1], -1}); // end event
    }
    
    // Sort events: by time, then end events before start events
    events.sort((a, b) -> {
        if (a[0] == b[0]) return a[1] - b[1]; // end before start
        return a[0] - b[0]; // by time
    });
    
    int maxRooms = 0;
    int currentRooms = 0;
    
    for (int[] event : events) {
        currentRooms += event[1];
        maxRooms = Math.max(maxRooms, currentRooms);
    }
    
    return maxRooms;
}

// Car Fleet Problem (similar concept)
public int carFleet(int target, int[] position, int[] speed) {
    int n = position.length;
    if (n == 0) return 0;
    
    // Pair position with speed, sort by position (descending)
    int[][] cars = new int[n][2];
    for (int i = 0; i < n; i++) {
        cars[i] = new int[]{position[i], speed[i]};
    }
    Arrays.sort(cars, (a, b) -> b[0] - a[0]);
    
    Stack<Double> stack = new Stack<>();
    
    for (int[] car : cars) {
        double timeToTarget = (double)(target - car[0]) / car[1];
        
        // If this car takes longer than the car ahead, it forms a new fleet
        if (stack.isEmpty() || timeToTarget > stack.peek()) {
            stack.push(timeToTarget);
        }
        // Otherwise, it catches up and joins the fleet ahead
    }
    
    return stack.size();
}

// My Calendar I: Book meeting if no conflict
class MyCalendar {
    List<int[]> bookings;
    
    public MyCalendar() {
        bookings = new ArrayList<>();
    }
    
    public boolean book(int start, int end) {
        for (int[] booking : bookings) {
            // Check for overlap: start < booking.end && end > booking.start
            if (start < booking[1] && end > booking[0]) {
                return false;
            }
        }
        bookings.add(new int[]{start, end});
        return true;
    }
}`,
    steps: [
      'Meeting Rooms I:',
      '1. Sort meetings by start time',
      '2. Check if any meeting starts before previous ends',
      'Meeting Rooms II:',
      '1. Sort meetings by start time',
      '2. Use min-heap to track end times of active meetings',
      '3. For each meeting: remove ended meetings, add current',
      '4. Heap size = concurrent meetings = rooms needed',
    ],
    relatedProblems: [
      { id: 'meeting-rooms', title: 'Meeting Rooms', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms/' },
      { id: 'meeting-rooms-ii', title: 'Meeting Rooms II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/' },
      { id: 'my-calendar-i', title: 'My Calendar I', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/my-calendar-i/' },
      { id: 'car-fleet', title: 'Car Fleet', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/car-fleet/' },
    ],
  },

  // ─── Linked List ───────────────────────────────────────────────────
  {
    id: 'fast-slow-pointers',
    name: 'Fast-Slow Pointers',
    category: 'Linked List',
    description: 'Use two pointers moving at different speeds to detect cycles, find middle elements, or solve various linked list problems efficiently.',
    shortDescription: 'Two pointers at different speeds',
    keyInsight: 'Fast pointer moves 2 steps, slow moves 1. If there\'s a cycle, fast will eventually catch slow. For finding middle: when fast reaches end, slow is at middle.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    javaTemplate: `// Fast-Slow Pointers Templates
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

// Cycle Detection
public boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow == fast) {
            return true; // Cycle detected
        }
    }
    
    return false;
}

// Find Cycle Start
public ListNode detectCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    
    // Phase 1: Detect if cycle exists
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow == fast) {
            // Phase 2: Find cycle start
            slow = head;
            while (slow != fast) {
                slow = slow.next;
                fast = fast.next;
            }
            return slow;
        }
    }
    
    return null; // No cycle
}

// Find Middle of Linked List
public ListNode findMiddle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return slow; // Middle node
}

// Remove Nth Node from End
public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    
    ListNode slow = dummy;
    ListNode fast = dummy;
    
    // Move fast n+1 steps ahead
    for (int i = 0; i <= n; i++) {
        fast = fast.next;
    }
    
    // Move both until fast reaches end
    while (fast != null) {
        slow = slow.next;
        fast = fast.next;
    }
    
    // Remove nth node
    slow.next = slow.next.next;
    
    return dummy.next;
}

// Palindrome Linked List
public boolean isPalindrome(ListNode head) {
    if (head == null || head.next == null) return true;
    
    // Find middle
    ListNode slow = head;
    ListNode fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    // Reverse second half
    ListNode secondHalf = reverseList(slow.next);
    
    // Compare first and second half
    ListNode p1 = head;
    ListNode p2 = secondHalf;
    while (p2 != null) {
        if (p1.val != p2.val) return false;
        p1 = p1.next;
        p2 = p2.next;
    }
    
    return true;
}

private ListNode reverseList(ListNode head) {
    ListNode prev = null;
    while (head != null) {
        ListNode next = head.next;
        head.next = prev;
        prev = head;
        head = next;
    }
    return prev;
}

// Happy Number (using fast-slow to detect cycle)
public boolean isHappy(int n) {
    int slow = n;
    int fast = n;
    
    do {
        slow = getNext(slow);
        fast = getNext(getNext(fast));
    } while (slow != fast);
    
    return slow == 1;
}

private int getNext(int n) {
    int sum = 0;
    while (n > 0) {
        int digit = n % 10;
        sum += digit * digit;
        n /= 10;
    }
    return sum;
}`,
    steps: [
      'Initialize both pointers at head',
      'Move slow pointer 1 step, fast pointer 2 steps',
      'Continue until fast reaches null or meets slow',
      'For cycle detection: meeting means cycle exists',
      'For middle finding: when fast reaches end, slow is at middle',
      'For cycle start: reset slow to head, move both 1 step until they meet',
    ],
    relatedProblems: [
      { id: 'linked-list-cycle', title: 'Linked List Cycle', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: 'linked-list-cycle-ii', title: 'Linked List Cycle II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
      { id: 'middle-of-linked-list', title: 'Middle of the Linked List', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
      { id: 'remove-nth-node-from-end', title: 'Remove Nth Node From End of List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
      { id: 'palindrome-linked-list', title: 'Palindrome Linked List', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/palindrome-linked-list/' },
      { id: 'happy-number', title: 'Happy Number', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/happy-number/' },
    ],
  },
  {
    id: 'reverse-in-place',
    name: 'Reverse In-Place',
    category: 'Linked List',
    description: 'Reverse linked list or portions of it in-place using pointer manipulation. Fundamental technique for many linked list problems.',
    shortDescription: 'Reverse links using pointer manipulation',
    keyInsight: 'Use three pointers: prev, current, next. Break the link current->next, reverse it to current->prev, then advance all pointers.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    javaTemplate: `// Reverse In-Place Templates
// Basic Reverse Linked List
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode current = head;
    
    while (current != null) {
        ListNode next = current.next; // Store next
        current.next = prev;          // Reverse link
        prev = current;               // Move prev
        current = next;               // Move current
    }
    
    return prev; // New head
}

// Reverse Linked List II (between positions m and n)
public ListNode reverseBetween(ListNode head, int left, int right) {
    if (head == null || left == right) return head;
    
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    
    // Find the node before the reversal start
    ListNode prevStart = dummy;
    for (int i = 1; i < left; i++) {
        prevStart = prevStart.next;
    }
    
    // Start reversing from 'start'
    ListNode start = prevStart.next;
    ListNode then = start.next;
    
    // Reverse right - left times
    for (int i = 0; i < right - left; i++) {
        start.next = then.next;
        then.next = prevStart.next;
        prevStart.next = then;
        then = start.next;
    }
    
    return dummy.next;
}

// Reverse Nodes in k-Group
public ListNode reverseKGroup(ListNode head, int k) {
    // Check if we have k nodes to reverse
    ListNode current = head;
    for (int i = 0; i < k; i++) {
        if (current == null) return head;
        current = current.next;
    }
    
    // Reverse first k nodes
    ListNode prev = null;
    current = head;
    for (int i = 0; i < k; i++) {
        ListNode next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    // Recursively reverse remaining groups
    head.next = reverseKGroup(current, k);
    
    return prev;
}

// Swap Nodes in Pairs
public ListNode swapPairs(ListNode head) {
    if (head == null || head.next == null) return head;
    
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode prev = dummy;
    
    while (prev.next != null && prev.next.next != null) {
        ListNode first = prev.next;
        ListNode second = prev.next.next;
        
        // Swap
        prev.next = second;
        first.next = second.next;
        second.next = first;
        
        // Move prev to the end of swapped pair
        prev = first;
    }
    
    return dummy.next;
}

// Reorder List (L0 → L1 → ... → Ln-1 → Ln becomes L0 → Ln → L1 → Ln-1 → ...)
public void reorderList(ListNode head) {
    if (head == null || head.next == null) return;
    
    // Step 1: Find middle
    ListNode slow = head;
    ListNode fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    // Step 2: Reverse second half
    ListNode secondHalf = reverseList(slow.next);
    slow.next = null; // Cut the list
    
    // Step 3: Merge two halves
    ListNode first = head;
    ListNode second = secondHalf;
    
    while (second != null) {
        ListNode firstNext = first.next;
        ListNode secondNext = second.next;
        
        first.next = second;
        second.next = firstNext;
        
        first = firstNext;
        second = secondNext;
    }
}

// Palindrome Check (reverse second half and compare)
public boolean isPalindromeReverse(ListNode head) {
    if (head == null || head.next == null) return true;
    
    // Find middle
    ListNode slow = head;
    ListNode fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    // Reverse second half
    ListNode secondHalf = reverseList(slow.next);
    ListNode secondHalfCopy = secondHalf; // Keep copy to restore
    
    // Compare
    boolean result = true;
    while (secondHalf != null) {
        if (head.val != secondHalf.val) {
            result = false;
            break;
        }
        head = head.next;
        secondHalf = secondHalf.next;
    }
    
    // Restore list (optional)
    slow.next = reverseList(secondHalfCopy);
    
    return result;
}`,
    steps: [
      'Initialize three pointers: prev = null, current = head',
      'While current is not null:',
      '  Store next = current.next',
      '  Reverse the link: current.next = prev',
      '  Advance pointers: prev = current, current = next',
      'Return prev as new head',
      'For partial reversal: identify boundaries first',
    ],
    relatedProblems: [
      { id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 'reverse-linked-list-ii', title: 'Reverse Linked List II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list-ii/' },
      { id: 'reverse-nodes-in-k-group', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
      { id: 'swap-nodes-in-pairs', title: 'Swap Nodes in Pairs', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/swap-nodes-in-pairs/' },
      { id: 'reorder-list', title: 'Reorder List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/' },
    ],
  },
  {
    id: 'merge-pattern',
    name: 'Merge Pattern',
    category: 'Linked List',
    description: 'Merge multiple sorted linked lists or combine linked lists using specific patterns. Common in divide-and-conquer approaches.',
    shortDescription: 'Merge sorted lists efficiently',
    keyInsight: 'Compare heads of lists and always choose the smaller one. For multiple lists, use divide-and-conquer or priority queue for efficiency.',
    timeComplexity: 'O(n) for two lists, O(n log k) for k lists using heap',
    spaceComplexity: 'O(1) for iterative merge, O(log k) for divide-and-conquer',
    javaTemplate: `// Merge Pattern Templates
// Merge Two Sorted Lists
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode current = dummy;
    
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            current.next = l1;
            l1 = l1.next;
        } else {
            current.next = l2;
            l2 = l2.next;
        }
        current = current.next;
    }
    
    // Attach remaining nodes
    current.next = (l1 != null) ? l1 : l2;
    
    return dummy.next;
}

// Merge k Sorted Lists (Divide and Conquer)
public ListNode mergeKLists(ListNode[] lists) {
    if (lists == null || lists.length == 0) return null;
    return mergeHelper(lists, 0, lists.length - 1);
}

private ListNode mergeHelper(ListNode[] lists, int start, int end) {
    if (start == end) return lists[start];
    
    int mid = start + (end - start) / 2;
    ListNode left = mergeHelper(lists, start, mid);
    ListNode right = mergeHelper(lists, mid + 1, end);
    
    return mergeTwoLists(left, right);
}

// Merge k Sorted Lists (Priority Queue approach)
public ListNode mergeKListsPQ(ListNode[] lists) {
    PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
    
    // Add all non-null heads to priority queue
    for (ListNode list : lists) {
        if (list != null) {
            pq.offer(list);
        }
    }
    
    ListNode dummy = new ListNode(0);
    ListNode current = dummy;
    
    while (!pq.isEmpty()) {
        ListNode node = pq.poll();
        current.next = node;
        current = current.next;
        
        if (node.next != null) {
            pq.offer(node.next);
        }
    }
    
    return dummy.next;
}

// Add Two Numbers (represented as linked lists)
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode current = dummy;
    int carry = 0;
    
    while (l1 != null || l2 != null || carry != 0) {
        int sum = carry;
        
        if (l1 != null) {
            sum += l1.val;
            l1 = l1.next;
        }
        
        if (l2 != null) {
            sum += l2.val;
            l2 = l2.next;
        }
        
        carry = sum / 10;
        current.next = new ListNode(sum % 10);
        current = current.next;
    }
    
    return dummy.next;
}

// Merge In Between Linked Lists
public ListNode mergeInBetween(ListNode list1, int a, int b, ListNode list2) {
    // Find nodes at position a-1 and b+1
    ListNode nodeBeforeA = list1;
    for (int i = 0; i < a - 1; i++) {
        nodeBeforeA = nodeBeforeA.next;
    }
    
    ListNode nodeAfterB = nodeBeforeA;
    for (int i = 0; i < b - a + 2; i++) {
        nodeAfterB = nodeAfterB.next;
    }
    
    // Connect list1 (before a) with list2
    nodeBeforeA.next = list2;
    
    // Find end of list2 and connect to list1 (after b)
    while (list2.next != null) {
        list2 = list2.next;
    }
    list2.next = nodeAfterB;
    
    return list1;
}

// Sort List (merge sort on linked list)
public ListNode sortList(ListNode head) {
    if (head == null || head.next == null) return head;
    
    // Find middle and split
    ListNode mid = findMiddle(head);
    ListNode rightHead = mid.next;
    mid.next = null;
    
    // Recursively sort both halves
    ListNode left = sortList(head);
    ListNode right = sortList(rightHead);
    
    // Merge sorted halves
    return mergeTwoLists(left, right);
}

private ListNode findMiddle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    ListNode prev = null;
    
    while (fast != null && fast.next != null) {
        prev = slow;
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return prev; // Return node before middle for clean split
}`,
    steps: [
      'Merge Two Lists:',
      '1. Use dummy node to simplify edge cases',
      '2. Compare current nodes of both lists',
      '3. Choose smaller one and advance that pointer',
      '4. Attach remaining nodes when one list exhausts',
      'Merge K Lists:',
      '1. Use divide-and-conquer: merge pairs recursively',
      '2. Or use priority queue to always get minimum',
    ],
    relatedProblems: [
      { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { id: 'merge-k-sorted-lists', title: 'Merge k Sorted Lists', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { id: 'add-two-numbers', title: 'Add Two Numbers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/' },
      { id: 'sort-list', title: 'Sort List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/sort-list/' },
      { id: 'merge-in-between-linked-lists', title: 'Merge In Between Linked Lists', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/merge-in-between-linked-lists/' },
    ],
  },
];

export function getPatternsByCategory(category: PatternCategory): Pattern[] {
  return patterns.filter(p => p.category === category);
}

export function getPatternById(id: string): Pattern | undefined {
  return patterns.find(p => p.id === id);
}