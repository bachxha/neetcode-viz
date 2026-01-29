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

export type PatternCategory = 'Sliding Window' | 'Two Pointers' | 'Binary Search';

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
    icon: '👉👈',
    color: 'purple',
  },
  {
    name: 'Binary Search',
    description: 'Divide the search space in half each step to find targets or optimize values in O(log n) time.',
    icon: '🔍',
    color: 'green',
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
];

export function getPatternsByCategory(category: PatternCategory): Pattern[] {
  return patterns.filter(p => p.category === category);
}

export function getPatternById(id: string): Pattern | undefined {
  return patterns.find(p => p.id === id);
}
