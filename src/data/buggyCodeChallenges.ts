/**
 * Buggy Code Challenges for the Bug Hunter Trainer
 * Train users to find bugs in code - a different mental mode from writing code
 */

export type BugType =
  | 'off-by-one'
  | 'wrong-operator'
  | 'missing-edge-case'
  | 'wrong-variable'
  | 'infinite-loop'
  | 'wrong-return'
  | 'null-pointer'
  | 'logic-error';

export interface Bug {
  id: string;
  lineNumber: number;
  bugType: BugType;
  description: string;
  fix: string;
}

export interface BuggyCodeChallenge {
  id: string;
  problemId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  buggyCode: string;
  bugs: Bug[];
  hints: string[];
  correctCode: string;
}

export const bugTypeDescriptions: Record<BugType, { name: string; icon: string; color: string }> = {
  'off-by-one': { name: 'Off-by-One', icon: '🔢', color: 'blue' },
  'wrong-operator': { name: 'Wrong Operator', icon: '⚡', color: 'yellow' },
  'missing-edge-case': { name: 'Missing Edge Case', icon: '🎯', color: 'purple' },
  'wrong-variable': { name: 'Wrong Variable', icon: '📛', color: 'orange' },
  'infinite-loop': { name: 'Infinite Loop', icon: '🔄', color: 'red' },
  'wrong-return': { name: 'Wrong Return', icon: '↩️', color: 'green' },
  'null-pointer': { name: 'Null Pointer', icon: '💥', color: 'red' },
  'logic-error': { name: 'Logic Error', icon: '🧠', color: 'pink' },
};

export const buggyCodeChallenges: BuggyCodeChallenge[] = [
  // ===== EASY =====
  {
    id: 'two-sum-buggy-1',
    problemId: 'two-sum',
    title: 'Two Sum - HashMap Bug',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    buggyCode: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], complement);
    }
    return new int[] {};
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 8,
        bugType: 'wrong-variable',
        description: 'Storing complement instead of index in the map. Should store the index i, not the complement value.',
        fix: 'map.put(nums[i], i);',
      },
    ],
    hints: [
      'What should the map store? Key is the number, but what is the value?',
      'When we find a complement, we need to return indices. Where do indices come from?',
    ],
    correctCode: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    return new int[] {};
}`,
  },

  {
    id: 'contains-duplicate-buggy-1',
    problemId: 'contains-duplicate',
    title: 'Contains Duplicate - Set Bug',
    difficulty: 'Easy',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array.',
    buggyCode: `public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) {
        seen.add(num);
        if (seen.contains(num)) {
            return true;
        }
    }
    return false;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 4,
        bugType: 'logic-error',
        description: 'Adding to set before checking. Should check if already exists first, then add.',
        fix: 'Move seen.add(num) after the if check, or use !seen.add(num) which returns false if element already exists.',
      },
    ],
    hints: [
      'When does Set.add() return false?',
      'Think about the order of operations - check first or add first?',
    ],
    correctCode: `public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) {
        if (seen.contains(num)) {
            return true;
        }
        seen.add(num);
    }
    return false;
}`,
  },

  {
    id: 'valid-palindrome-buggy-1',
    problemId: 'valid-palindrome',
    title: 'Valid Palindrome - Pointer Bug',
    difficulty: 'Easy',
    description: 'Given a string s, return true if it is a palindrome (reads the same backward as forward), considering only alphanumeric characters and ignoring case.',
    buggyCode: `public boolean isPalindrome(String s) {
    int left = 0;
    int right = s.length();
    while (left < right) {
        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
            left++;
        }
        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
            right--;
        }
        if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 3,
        bugType: 'off-by-one',
        description: 'right should start at s.length() - 1, not s.length(). Array/string indices are 0-based.',
        fix: 'int right = s.length() - 1;',
      },
    ],
    hints: [
      'What is the valid index range for a string of length n?',
      'Where should the right pointer start?',
    ],
    correctCode: `public boolean isPalindrome(String s) {
    int left = 0;
    int right = s.length() - 1;
    while (left < right) {
        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
            left++;
        }
        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
            right--;
        }
        if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
  },

  {
    id: 'reverse-linked-list-buggy-1',
    problemId: 'reverse-linked-list',
    title: 'Reverse Linked List - Pointer Bug',
    difficulty: 'Easy',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    buggyCode: `public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = prev;
    }
    return prev;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 8,
        bugType: 'wrong-variable',
        description: 'Setting curr = prev causes infinite loop. Should be curr = next to move forward.',
        fix: 'curr = next;',
      },
    ],
    hints: [
      'After reversing the pointer, how do we move to the next node?',
      'What happens if curr = prev? Where does curr point after that?',
    ],
    correctCode: `public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
  },

  {
    id: 'max-depth-binary-tree-buggy-1',
    problemId: 'maximum-depth-of-binary-tree',
    title: 'Max Depth Binary Tree - Return Bug',
    difficulty: 'Easy',
    description: 'Given the root of a binary tree, return its maximum depth.',
    buggyCode: `public int maxDepth(TreeNode root) {
    if (root == null) {
        return 1;
    }
    int leftDepth = maxDepth(root.left);
    int rightDepth = maxDepth(root.right);
    return Math.max(leftDepth, rightDepth) + 1;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 3,
        bugType: 'wrong-return',
        description: 'Base case should return 0, not 1. An empty tree has depth 0.',
        fix: 'return 0;',
      },
    ],
    hints: [
      'What is the depth of an empty tree (null)?',
      'If root is null, have we counted any nodes?',
    ],
    correctCode: `public int maxDepth(TreeNode root) {
    if (root == null) {
        return 0;
    }
    int leftDepth = maxDepth(root.left);
    int rightDepth = maxDepth(root.right);
    return Math.max(leftDepth, rightDepth) + 1;
}`,
  },

  {
    id: 'valid-parentheses-buggy-1',
    problemId: 'valid-parentheses',
    title: 'Valid Parentheses - Stack Bug',
    difficulty: 'Easy',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    buggyCode: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c);
        } else {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return true;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 14,
        bugType: 'missing-edge-case',
        description: 'Should check if stack is empty at the end. String like "(((" would incorrectly return true.',
        fix: 'return stack.isEmpty();',
      },
    ],
    hints: [
      'What if there are more opening brackets than closing brackets?',
      'After processing all characters, what should be true about the stack?',
    ],
    correctCode: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c);
        } else {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return stack.isEmpty();
}`,
  },

  {
    id: 'binary-search-buggy-1',
    problemId: 'binary-search',
    title: 'Binary Search - Boundary Bug',
    difficulty: 'Easy',
    description: 'Given an array of integers nums sorted in ascending order, and an integer target, write a function to search target in nums. Return -1 if not found.',
    buggyCode: `public int search(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 4,
        bugType: 'off-by-one',
        description: 'Condition should be left <= right. With left < right, when array has one element or target is at boundary, it may not be found.',
        fix: 'while (left <= right) {',
      },
    ],
    hints: [
      'What happens when left equals right? Is that a valid state to check?',
      'Test with a single element array - does it work?',
    ],
    correctCode: `public int search(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
  },

  {
    id: 'climbing-stairs-buggy-1',
    problemId: 'climbing-stairs',
    title: 'Climbing Stairs - DP Bug',
    difficulty: 'Easy',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    buggyCode: `public int climbStairs(int n) {
    if (n <= 2) return n;
    int[] dp = new int[n + 1];
    dp[0] = 1;
    dp[1] = 1;
    for (int i = 2; i < n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 6,
        bugType: 'off-by-one',
        description: 'Loop should go to i <= n or i < n+1. Currently dp[n] is never computed.',
        fix: 'for (int i = 2; i <= n; i++) {',
      },
    ],
    hints: [
      'What indices of dp array do we need to fill?',
      'If we return dp[n], have we computed it?',
    ],
    correctCode: `public int climbStairs(int n) {
    if (n <= 2) return n;
    int[] dp = new int[n + 1];
    dp[0] = 1;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}`,
  },

  {
    id: 'merge-sorted-lists-buggy-1',
    problemId: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists - Pointer Bug',
    difficulty: 'Easy',
    description: 'Merge two sorted linked lists and return it as a sorted list.',
    buggyCode: `public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    while (list1 != null && list2 != null) {
        if (list1.val <= list2.val) {
            curr.next = list1;
            list1 = list1.next;
        } else {
            curr.next = list2;
            list2 = list2.next;
        }
    }
    curr.next = list1 != null ? list1 : list2;
    return dummy.next;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 7,
        bugType: 'wrong-variable',
        description: 'Missing curr = curr.next to advance the pointer. Need to move curr forward after each append.',
        fix: 'Add curr = curr.next; after assigning curr.next',
      },
    ],
    hints: [
      'After appending a node, where does curr point?',
      'How do we move to build the next part of the result?',
    ],
    correctCode: `public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    while (list1 != null && list2 != null) {
        if (list1.val <= list2.val) {
            curr.next = list1;
            list1 = list1.next;
        } else {
            curr.next = list2;
            list2 = list2.next;
        }
        curr = curr.next;
    }
    curr.next = list1 != null ? list1 : list2;
    return dummy.next;
}`,
  },

  {
    id: 'best-time-buy-sell-buggy-1',
    problemId: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock - Logic Bug',
    difficulty: 'Easy',
    description: 'Find the maximum profit you can achieve from buying on one day and selling on a later day.',
    buggyCode: `public int maxProfit(int[] prices) {
    int minPrice = prices[0];
    int maxProfit = 0;
    for (int i = 0; i < prices.length; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        }
        maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    }
    return maxProfit;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 2,
        bugType: 'missing-edge-case',
        description: 'No check for empty array. If prices is empty, prices[0] throws ArrayIndexOutOfBoundsException.',
        fix: 'Add: if (prices.length == 0) return 0; at the start',
      },
    ],
    hints: [
      'What happens if the input array is empty?',
      'What does prices[0] do when prices has no elements?',
    ],
    correctCode: `public int maxProfit(int[] prices) {
    if (prices.length == 0) return 0;
    int minPrice = prices[0];
    int maxProfit = 0;
    for (int i = 0; i < prices.length; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        }
        maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    }
    return maxProfit;
}`,
  },

  // ===== MEDIUM =====
  {
    id: 'three-sum-buggy-1',
    problemId: '3sum',
    title: '3Sum - Skip Duplicates Bug',
    difficulty: 'Medium',
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    buggyCode: `public List<List<Integer>> threeSum(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);
    for (int i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int left = i + 1, right = nums.length - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return result;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 11,
        bugType: 'missing-edge-case',
        description: 'After finding a triplet, need to skip duplicate values for left and right to avoid duplicate triplets.',
        fix: 'Add: while (left < right && nums[left] == nums[left - 1]) left++; and while (left < right && nums[right] == nums[right + 1]) right--;',
      },
    ],
    hints: [
      'After finding a valid triplet, could there be duplicates with same values?',
      'How do we skip over duplicate elements when moving pointers?',
    ],
    correctCode: `public List<List<Integer>> threeSum(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);
    for (int i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int left = i + 1, right = nums.length - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                left++;
                right--;
                while (left < right && nums[left] == nums[left - 1]) left++;
                while (left < right && nums[right] == nums[right + 1]) right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return result;
}`,
  },

  {
    id: 'longest-substring-buggy-1',
    problemId: 'longest-substring-without-repeating',
    title: 'Longest Substring - Window Bug',
    difficulty: 'Medium',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    buggyCode: `public int lengthOfLongestSubstring(String s) {
    Set<Character> set = new HashSet<>();
    int maxLen = 0;
    int left = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        while (set.contains(c)) {
            set.remove(s.charAt(left++));
        }
        set.add(c);
        maxLen = Math.max(maxLen, right - left);
    }
    return maxLen;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 11,
        bugType: 'off-by-one',
        description: 'Window length calculation is wrong. Should be right - left + 1 since both ends are inclusive.',
        fix: 'maxLen = Math.max(maxLen, right - left + 1);',
      },
    ],
    hints: [
      'If left = 0 and right = 2, how many characters are in the window?',
      'Is the window inclusive on both ends?',
    ],
    correctCode: `public int lengthOfLongestSubstring(String s) {
    Set<Character> set = new HashSet<>();
    int maxLen = 0;
    int left = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        while (set.contains(c)) {
            set.remove(s.charAt(left++));
        }
        set.add(c);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
  },

  {
    id: 'merge-intervals-buggy-1',
    problemId: 'merge-intervals',
    title: 'Merge Intervals - Comparison Bug',
    difficulty: 'Medium',
    description: 'Given an array of intervals, merge all overlapping intervals.',
    buggyCode: `public int[][] merge(int[][] intervals) {
    if (intervals.length <= 1) return intervals;
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    List<int[]> result = new ArrayList<>();
    int[] current = intervals[0];
    result.add(current);
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < current[1]) {
            current[1] = Math.max(current[1], intervals[i][1]);
        } else {
            current = intervals[i];
            result.add(current);
        }
    }
    return result.toArray(new int[result.size()][]);
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 8,
        bugType: 'wrong-operator',
        description: 'Overlap check should be <=, not <. Intervals [1,2] and [2,3] should merge because they touch.',
        fix: 'if (intervals[i][0] <= current[1]) {',
      },
    ],
    hints: [
      'When do two intervals overlap? What about [1,2] and [2,3]?',
      'Should touching intervals be merged?',
    ],
    correctCode: `public int[][] merge(int[][] intervals) {
    if (intervals.length <= 1) return intervals;
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    List<int[]> result = new ArrayList<>();
    int[] current = intervals[0];
    result.add(current);
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] <= current[1]) {
            current[1] = Math.max(current[1], intervals[i][1]);
        } else {
            current = intervals[i];
            result.add(current);
        }
    }
    return result.toArray(new int[result.size()][]);
}`,
  },

  {
    id: 'number-of-islands-buggy-1',
    problemId: 'number-of-islands',
    title: 'Number of Islands - DFS Bug',
    difficulty: 'Medium',
    description: 'Given a 2D grid of \'1\'s (land) and \'0\'s (water), count the number of islands.',
    buggyCode: `public int numIslands(char[][] grid) {
    if (grid == null || grid.length == 0) return 0;
    int count = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == '1') {
                dfs(grid, i, j);
            }
            count++;
        }
    }
    return count;
}

private void dfs(char[][] grid, int i, int j) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] != '1') {
        return;
    }
    grid[i][j] = '0';
    dfs(grid, i + 1, j);
    dfs(grid, i - 1, j);
    dfs(grid, i, j + 1);
    dfs(grid, i, j - 1);
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 9,
        bugType: 'logic-error',
        description: 'count++ is outside the if block, incrementing for every cell. Should only increment when we find an island (inside the if).',
        fix: 'Move count++ inside the if block after dfs call.',
      },
    ],
    hints: [
      'When should we increment the island count?',
      'Look at the placement of count++ - is it inside the right scope?',
    ],
    correctCode: `public int numIslands(char[][] grid) {
    if (grid == null || grid.length == 0) return 0;
    int count = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == '1') {
                dfs(grid, i, j);
                count++;
            }
        }
    }
    return count;
}

private void dfs(char[][] grid, int i, int j) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] != '1') {
        return;
    }
    grid[i][j] = '0';
    dfs(grid, i + 1, j);
    dfs(grid, i - 1, j);
    dfs(grid, i, j + 1);
    dfs(grid, i, j - 1);
}`,
  },

  {
    id: 'coin-change-buggy-1',
    problemId: 'coin-change',
    title: 'Coin Change - DP Initialization Bug',
    difficulty: 'Medium',
    description: 'Given an integer array coins representing coin denominations and an integer amount, return the fewest number of coins needed to make up that amount.',
    buggyCode: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i && dp[i - coin] != Integer.MAX_VALUE) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
}`,
    bugs: [],
    hints: ['This code is actually correct! Sometimes the bug is thinking there is one when there isn\'t.'],
    correctCode: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i && dp[i - coin] != Integer.MAX_VALUE) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
}`,
  },

  {
    id: 'validate-bst-buggy-1',
    problemId: 'validate-bst',
    title: 'Validate BST - Range Bug',
    difficulty: 'Medium',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree.',
    buggyCode: `public boolean isValidBST(TreeNode root) {
    return isValid(root, Integer.MIN_VALUE, Integer.MAX_VALUE);
}

private boolean isValid(TreeNode node, int min, int max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValid(node.left, min, node.val) && 
           isValid(node.right, node.val, max);
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 2,
        bugType: 'missing-edge-case',
        description: 'Using Integer.MIN_VALUE and MAX_VALUE as bounds fails for nodes with these exact values. Should use Long or null for bounds.',
        fix: 'Use Long.MIN_VALUE and Long.MAX_VALUE, or use Integer objects with null checks.',
      },
    ],
    hints: [
      'What if a node\'s value is Integer.MIN_VALUE or Integer.MAX_VALUE?',
      'How can we represent "no bound" for the range check?',
    ],
    correctCode: `public boolean isValidBST(TreeNode root) {
    return isValid(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private boolean isValid(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValid(node.left, min, node.val) && 
           isValid(node.right, node.val, max);
}`,
  },

  {
    id: 'lru-cache-buggy-1',
    problemId: 'lru-cache',
    title: 'LRU Cache - Update Bug',
    difficulty: 'Medium',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
    buggyCode: `class LRUCache {
    private int capacity;
    private Map<Integer, Integer> cache;
    private LinkedList<Integer> order;
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.cache = new HashMap<>();
        this.order = new LinkedList<>();
    }
    
    public int get(int key) {
        if (!cache.containsKey(key)) return -1;
        return cache.get(key);
    }
    
    public void put(int key, int value) {
        if (cache.containsKey(key)) {
            cache.put(key, value);
            return;
        }
        if (cache.size() >= capacity) {
            int lru = order.removeFirst();
            cache.remove(lru);
        }
        cache.put(key, value);
        order.addLast(key);
    }
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 13,
        bugType: 'logic-error',
        description: 'get() should update the key to be most recently used by moving it to the end of the order list.',
        fix: 'Add: order.remove((Integer) key); order.addLast(key);',
      },
      {
        id: 'bug-2',
        lineNumber: 18,
        bugType: 'logic-error',
        description: 'When updating an existing key, should also move it to the end of the order list.',
        fix: 'Add: order.remove((Integer) key); order.addLast(key);',
      },
    ],
    hints: [
      'What does "recently used" mean? Does get() count as using?',
      'When we access or update a key, where should it be in the order?',
    ],
    correctCode: `class LRUCache {
    private int capacity;
    private Map<Integer, Integer> cache;
    private LinkedList<Integer> order;
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.cache = new HashMap<>();
        this.order = new LinkedList<>();
    }
    
    public int get(int key) {
        if (!cache.containsKey(key)) return -1;
        order.remove((Integer) key);
        order.addLast(key);
        return cache.get(key);
    }
    
    public void put(int key, int value) {
        if (cache.containsKey(key)) {
            cache.put(key, value);
            order.remove((Integer) key);
            order.addLast(key);
            return;
        }
        if (cache.size() >= capacity) {
            int lru = order.removeFirst();
            cache.remove(lru);
        }
        cache.put(key, value);
        order.addLast(key);
    }
}`,
  },

  {
    id: 'subsets-buggy-1',
    problemId: 'subsets',
    title: 'Subsets - Reference Bug',
    difficulty: 'Medium',
    description: 'Given an integer array nums of unique elements, return all possible subsets (the power set).',
    buggyCode: `public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(result, new ArrayList<>(), nums, 0);
    return result;
}

private void backtrack(List<List<Integer>> result, List<Integer> current, int[] nums, int start) {
    result.add(current);
    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);
        backtrack(result, current, nums, i + 1);
        current.remove(current.size() - 1);
    }
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 8,
        bugType: 'logic-error',
        description: 'Adding current directly adds a reference. All subsets will point to the same (empty) list. Need to add a copy.',
        fix: 'result.add(new ArrayList<>(current));',
      },
    ],
    hints: [
      'What happens when you add an ArrayList to another list - is it a copy or reference?',
      'After the recursion completes, what does current contain?',
    ],
    correctCode: `public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(result, new ArrayList<>(), nums, 0);
    return result;
}

private void backtrack(List<List<Integer>> result, List<Integer> current, int[] nums, int start) {
    result.add(new ArrayList<>(current));
    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);
        backtrack(result, current, nums, i + 1);
        current.remove(current.size() - 1);
    }
}`,
  },

  {
    id: 'word-search-buggy-1',
    problemId: 'word-search',
    title: 'Word Search - Visited Reset Bug',
    difficulty: 'Medium',
    description: 'Given a 2D board of characters and a word, determine if the word exists in the grid.',
    buggyCode: `public boolean exist(char[][] board, String word) {
    for (int i = 0; i < board.length; i++) {
        for (int j = 0; j < board[0].length; j++) {
            if (dfs(board, word, i, j, 0)) return true;
        }
    }
    return false;
}

private boolean dfs(char[][] board, String word, int i, int j, int k) {
    if (k == word.length()) return true;
    if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) return false;
    if (board[i][j] != word.charAt(k)) return false;
    
    char temp = board[i][j];
    board[i][j] = '#';
    
    boolean found = dfs(board, word, i + 1, j, k + 1) ||
                   dfs(board, word, i - 1, j, k + 1) ||
                   dfs(board, word, i, j + 1, k + 1) ||
                   dfs(board, word, i, j - 1, k + 1);
    
    return found;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 22,
        bugType: 'logic-error',
        description: 'Missing reset of board[i][j] = temp after DFS. Without restoring, future paths can\'t use this cell.',
        fix: 'Add: board[i][j] = temp; before return found;',
      },
    ],
    hints: [
      'What happens to the board state after DFS completes?',
      'If one path fails, can another path reuse the same cell?',
    ],
    correctCode: `public boolean exist(char[][] board, String word) {
    for (int i = 0; i < board.length; i++) {
        for (int j = 0; j < board[0].length; j++) {
            if (dfs(board, word, i, j, 0)) return true;
        }
    }
    return false;
}

private boolean dfs(char[][] board, String word, int i, int j, int k) {
    if (k == word.length()) return true;
    if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) return false;
    if (board[i][j] != word.charAt(k)) return false;
    
    char temp = board[i][j];
    board[i][j] = '#';
    
    boolean found = dfs(board, word, i + 1, j, k + 1) ||
                   dfs(board, word, i - 1, j, k + 1) ||
                   dfs(board, word, i, j + 1, k + 1) ||
                   dfs(board, word, i, j - 1, k + 1);
    
    board[i][j] = temp;
    return found;
}`,
  },

  {
    id: 'product-except-self-buggy-1',
    problemId: 'product-of-array-except-self',
    title: 'Product Except Self - Index Bug',
    difficulty: 'Medium',
    description: 'Given an array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].',
    buggyCode: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    
    result[0] = 1;
    for (int i = 1; i <= n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    
    int right = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= right;
        right *= nums[i];
    }
    
    return result;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 6,
        bugType: 'off-by-one',
        description: 'Loop goes to i <= n which causes ArrayIndexOutOfBoundsException. Should be i < n.',
        fix: 'for (int i = 1; i < n; i++) {',
      },
    ],
    hints: [
      'What is the valid index range for result array of length n?',
      'What happens when i equals n?',
    ],
    correctCode: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    
    result[0] = 1;
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    
    int right = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= right;
        right *= nums[i];
    }
    
    return result;
}`,
  },

  {
    id: 'course-schedule-buggy-1',
    problemId: 'course-schedule',
    title: 'Course Schedule - Cycle Detection Bug',
    difficulty: 'Medium',
    description: 'Determine if you can finish all courses given their prerequisites (detect cycle in directed graph).',
    buggyCode: `public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] pre : prerequisites) {
        graph.get(pre[1]).add(pre[0]);
    }
    
    boolean[] visited = new boolean[numCourses];
    for (int i = 0; i < numCourses; i++) {
        if (!dfs(graph, visited, i)) return false;
    }
    return true;
}

private boolean dfs(List<List<Integer>> graph, boolean[] visited, int node) {
    if (visited[node]) return false;
    visited[node] = true;
    for (int neighbor : graph.get(node)) {
        if (!dfs(graph, visited, neighbor)) return false;
    }
    return true;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 21,
        bugType: 'logic-error',
        description: 'Need to reset visited[node] = false after DFS to allow other paths. Current approach marks nodes permanently visited.',
        fix: 'Add: visited[node] = false; before return true;',
      },
    ],
    hints: [
      'What\'s the difference between "currently in path" and "already processed"?',
      'If we visit node A from path 1, can we visit it again from path 2?',
    ],
    correctCode: `public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] pre : prerequisites) {
        graph.get(pre[1]).add(pre[0]);
    }
    
    boolean[] visited = new boolean[numCourses];
    for (int i = 0; i < numCourses; i++) {
        if (!dfs(graph, visited, i)) return false;
    }
    return true;
}

private boolean dfs(List<List<Integer>> graph, boolean[] visited, int node) {
    if (visited[node]) return false;
    visited[node] = true;
    for (int neighbor : graph.get(node)) {
        if (!dfs(graph, visited, neighbor)) return false;
    }
    visited[node] = false;
    return true;
}`,
  },

  {
    id: 'level-order-traversal-buggy-1',
    problemId: 'binary-tree-level-order-traversal',
    title: 'Level Order Traversal - Queue Bug',
    difficulty: 'Medium',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values.',
    buggyCode: `public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    
    return result;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 16,
        bugType: 'wrong-return',
        description: 'Missing result.add(level) after processing each level. The level list is created but never added to result.',
        fix: 'Add: result.add(level); after the for loop',
      },
    ],
    hints: [
      'After building the level list, what do we do with it?',
      'Why is result empty when we return?',
    ],
    correctCode: `public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    
    return result;
}`,
  },

  {
    id: 'daily-temperatures-buggy-1',
    problemId: 'daily-temperatures',
    title: 'Daily Temperatures - Stack Value Bug',
    difficulty: 'Medium',
    description: 'Given an array of temperatures, return an array answer where answer[i] is the number of days until a warmer temperature.',
    buggyCode: `public int[] dailyTemperatures(int[] temperatures) {
    int n = temperatures.length;
    int[] result = new int[n];
    Stack<Integer> stack = new Stack<>();
    
    for (int i = 0; i < n; i++) {
        while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
            int prevIndex = stack.pop();
            result[prevIndex] = i;
        }
        stack.push(i);
    }
    
    return result;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 8,
        bugType: 'logic-error',
        description: 'result should store the number of days (difference), not the index. Should be i - prevIndex.',
        fix: 'result[prevIndex] = i - prevIndex;',
      },
    ],
    hints: [
      'What should result[prevIndex] contain - an index or a count?',
      'How many days between index 2 and index 5?',
    ],
    correctCode: `public int[] dailyTemperatures(int[] temperatures) {
    int n = temperatures.length;
    int[] result = new int[n];
    Stack<Integer> stack = new Stack<>();
    
    for (int i = 0; i < n; i++) {
        while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
            int prevIndex = stack.pop();
            result[prevIndex] = i - prevIndex;
        }
        stack.push(i);
    }
    
    return result;
}`,
  },

  {
    id: 'koko-bananas-buggy-1',
    problemId: 'koko-eating-bananas',
    title: 'Koko Eating Bananas - Binary Search Bug',
    difficulty: 'Medium',
    description: 'Koko loves bananas. Find the minimum eating speed k such that she can eat all bananas within h hours.',
    buggyCode: `public int minEatingSpeed(int[] piles, int h) {
    int left = 1;
    int right = Arrays.stream(piles).max().getAsInt();
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (canFinish(piles, mid, h)) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return left;
}

private boolean canFinish(int[] piles, int k, int h) {
    int hours = 0;
    for (int pile : piles) {
        hours += (pile + k - 1) / k;
    }
    return hours <= h;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 8,
        bugType: 'logic-error',
        description: 'When canFinish is true, mid could be the answer. Should be right = mid, not right = mid - 1.',
        fix: 'right = mid;',
      },
    ],
    hints: [
      'If we can finish with speed mid, should we exclude mid from the search?',
      'What if mid is actually the minimum valid speed?',
    ],
    correctCode: `public int minEatingSpeed(int[] piles, int h) {
    int left = 1;
    int right = Arrays.stream(piles).max().getAsInt();
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (canFinish(piles, mid, h)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}

private boolean canFinish(int[] piles, int k, int h) {
    int hours = 0;
    for (int pile : piles) {
        hours += (pile + k - 1) / k;
    }
    return hours <= h;
}`,
  },

  {
    id: 'rotting-oranges-buggy-1',
    problemId: 'rotting-oranges',
    title: 'Rotting Oranges - BFS Timing Bug',
    difficulty: 'Medium',
    description: 'Return the minimum number of minutes until no cell has a fresh orange. Return -1 if impossible.',
    buggyCode: `public int orangesRotting(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    Queue<int[]> queue = new LinkedList<>();
    int fresh = 0;
    
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 2) queue.offer(new int[]{i, j});
            else if (grid[i][j] == 1) fresh++;
        }
    }
    
    if (fresh == 0) return 0;
    
    int minutes = 0;
    int[][] dirs = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    
    while (!queue.isEmpty()) {
        minutes++;
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            int[] curr = queue.poll();
            for (int[] dir : dirs) {
                int x = curr[0] + dir[0], y = curr[1] + dir[1];
                if (x >= 0 && x < m && y >= 0 && y < n && grid[x][y] == 1) {
                    grid[x][y] = 2;
                    fresh--;
                    queue.offer(new int[]{x, y});
                }
            }
        }
    }
    
    return fresh == 0 ? minutes : -1;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 19,
        bugType: 'off-by-one',
        description: 'minutes++ happens before processing, causing off-by-one. The last iteration may increment minutes but add no new oranges.',
        fix: 'Move minutes++ to after the for loop, or check if any oranges were rotted before incrementing.',
      },
    ],
    hints: [
      'After the last batch of oranges rot, do we process another round?',
      'When does minutes increment vs when do oranges actually rot?',
    ],
    correctCode: `public int orangesRotting(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    Queue<int[]> queue = new LinkedList<>();
    int fresh = 0;
    
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 2) queue.offer(new int[]{i, j});
            else if (grid[i][j] == 1) fresh++;
        }
    }
    
    if (fresh == 0) return 0;
    
    int minutes = -1;
    int[][] dirs = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    
    while (!queue.isEmpty()) {
        minutes++;
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            int[] curr = queue.poll();
            for (int[] dir : dirs) {
                int x = curr[0] + dir[0], y = curr[1] + dir[1];
                if (x >= 0 && x < m && y >= 0 && y < n && grid[x][y] == 1) {
                    grid[x][y] = 2;
                    fresh--;
                    queue.offer(new int[]{x, y});
                }
            }
        }
    }
    
    return fresh == 0 ? minutes : -1;
}`,
  },

  {
    id: 'group-anagrams-buggy-1',
    problemId: 'group-anagrams',
    title: 'Group Anagrams - Key Generation Bug',
    difficulty: 'Medium',
    description: 'Given an array of strings strs, group the anagrams together.',
    buggyCode: `public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    
    for (String s : strs) {
        int[] count = new int[26];
        for (char c : s.toCharArray()) {
            count[c - 'a']++;
        }
        String key = count.toString();
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    
    return new ArrayList<>(map.values());
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 9,
        bugType: 'logic-error',
        description: 'count.toString() returns memory address, not array contents. Use Arrays.toString(count) or build a custom key.',
        fix: 'String key = Arrays.toString(count);',
      },
    ],
    hints: [
      'What does .toString() return for an array in Java?',
      'Try printing count.toString() - does it look like the array contents?',
    ],
    correctCode: `public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    
    for (String s : strs) {
        int[] count = new int[26];
        for (char c : s.toCharArray()) {
            count[c - 'a']++;
        }
        String key = Arrays.toString(count);
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    
    return new ArrayList<>(map.values());
}`,
  },

  // ===== HARD =====
  {
    id: 'trapping-rain-water-buggy-1',
    problemId: 'trapping-rain-water',
    title: 'Trapping Rain Water - Max Height Bug',
    difficulty: 'Hard',
    description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.',
    buggyCode: `public int trap(int[] height) {
    if (height.length == 0) return 0;
    
    int n = height.length;
    int[] leftMax = new int[n];
    int[] rightMax = new int[n];
    
    leftMax[0] = height[0];
    for (int i = 1; i < n; i++) {
        leftMax[i] = Math.max(leftMax[i - 1], height[i - 1]);
    }
    
    rightMax[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) {
        rightMax[i] = Math.max(rightMax[i + 1], height[i + 1]);
    }
    
    int water = 0;
    for (int i = 0; i < n; i++) {
        int level = Math.min(leftMax[i], rightMax[i]);
        water += Math.max(0, level - height[i]);
    }
    
    return water;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 10,
        bugType: 'logic-error',
        description: 'leftMax[i] should include height[i] itself in the max calculation, not just height[i-1]. Same issue with rightMax.',
        fix: 'leftMax[i] = Math.max(leftMax[i - 1], height[i]);',
      },
    ],
    hints: [
      'What is the maximum height to the left of index i, including i?',
      'Should the current bar be considered in the max height?',
    ],
    correctCode: `public int trap(int[] height) {
    if (height.length == 0) return 0;
    
    int n = height.length;
    int[] leftMax = new int[n];
    int[] rightMax = new int[n];
    
    leftMax[0] = height[0];
    for (int i = 1; i < n; i++) {
        leftMax[i] = Math.max(leftMax[i - 1], height[i]);
    }
    
    rightMax[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) {
        rightMax[i] = Math.max(rightMax[i + 1], height[i]);
    }
    
    int water = 0;
    for (int i = 0; i < n; i++) {
        int level = Math.min(leftMax[i], rightMax[i]);
        water += Math.max(0, level - height[i]);
    }
    
    return water;
}`,
  },

  {
    id: 'merge-k-sorted-lists-buggy-1',
    problemId: 'merge-k-sorted-lists',
    title: 'Merge K Sorted Lists - PQ Comparator Bug',
    difficulty: 'Hard',
    description: 'Merge k sorted linked lists and return it as one sorted list.',
    buggyCode: `public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> b.val - a.val);
    
    for (ListNode node : lists) {
        if (node != null) pq.offer(node);
    }
    
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    
    while (!pq.isEmpty()) {
        ListNode node = pq.poll();
        curr.next = node;
        curr = curr.next;
        if (node.next != null) {
            pq.offer(node.next);
        }
    }
    
    return dummy.next;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 2,
        bugType: 'wrong-operator',
        description: 'Comparator is reversed (b - a gives max heap). For sorted ascending order, need min heap (a - b).',
        fix: '(a, b) -> a.val - b.val',
      },
    ],
    hints: [
      'What type of heap do we need for ascending order - min or max?',
      'Does b.val - a.val give min heap or max heap behavior?',
    ],
    correctCode: `public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
    
    for (ListNode node : lists) {
        if (node != null) pq.offer(node);
    }
    
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    
    while (!pq.isEmpty()) {
        ListNode node = pq.poll();
        curr.next = node;
        curr = curr.next;
        if (node.next != null) {
            pq.offer(node.next);
        }
    }
    
    return dummy.next;
}`,
  },

  {
    id: 'median-two-sorted-arrays-buggy-1',
    problemId: 'median-of-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays - Partition Bug',
    difficulty: 'Hard',
    description: 'Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.',
    buggyCode: `public double findMedianSortedArrays(int[] nums1, int[] nums2) {
    if (nums1.length > nums2.length) {
        return findMedianSortedArrays(nums2, nums1);
    }
    
    int m = nums1.length, n = nums2.length;
    int left = 0, right = m;
    
    while (left < right) {
        int i = (left + right) / 2;
        int j = (m + n + 1) / 2 - i;
        
        if (nums1[i] < nums2[j - 1]) {
            left = i + 1;
        } else {
            right = i;
        }
    }
    
    int i = left, j = (m + n + 1) / 2 - left;
    
    int maxLeft1 = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
    int maxLeft2 = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
    int minRight1 = (i == m) ? Integer.MAX_VALUE : nums1[i];
    int minRight2 = (j == n) ? Integer.MAX_VALUE : nums2[j];
    
    if ((m + n) % 2 == 1) {
        return Math.max(maxLeft1, maxLeft2);
    }
    return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 9,
        bugType: 'off-by-one',
        description: 'While condition should be left <= right to handle edge cases properly.',
        fix: 'while (left <= right) {',
      },
      {
        id: 'bug-2',
        lineNumber: 29,
        bugType: 'logic-error',
        description: 'Need to cast to double for correct division. Integer division will truncate.',
        fix: 'return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2.0;',
      },
    ],
    hints: [
      'For finding median, do we need integer or floating point division?',
      'What happens at the boundary when left equals right?',
    ],
    correctCode: `public double findMedianSortedArrays(int[] nums1, int[] nums2) {
    if (nums1.length > nums2.length) {
        return findMedianSortedArrays(nums2, nums1);
    }
    
    int m = nums1.length, n = nums2.length;
    int left = 0, right = m;
    
    while (left <= right) {
        int i = (left + right) / 2;
        int j = (m + n + 1) / 2 - i;
        
        if (i < m && nums1[i] < nums2[j - 1]) {
            left = i + 1;
        } else if (i > 0 && nums1[i - 1] > nums2[j]) {
            right = i - 1;
        } else {
            int maxLeft = 0;
            if (i == 0) maxLeft = nums2[j - 1];
            else if (j == 0) maxLeft = nums1[i - 1];
            else maxLeft = Math.max(nums1[i - 1], nums2[j - 1]);
            
            if ((m + n) % 2 == 1) return maxLeft;
            
            int minRight = 0;
            if (i == m) minRight = nums2[j];
            else if (j == n) minRight = nums1[i];
            else minRight = Math.min(nums1[i], nums2[j]);
            
            return (maxLeft + minRight) / 2.0;
        }
    }
    return 0.0;
}`,
  },

  {
    id: 'sliding-window-max-buggy-1',
    problemId: 'sliding-window-maximum',
    title: 'Sliding Window Maximum - Deque Bug',
    difficulty: 'Hard',
    description: 'Given an array nums and a sliding window of size k, return the max in each window.',
    buggyCode: `public int[] maxSlidingWindow(int[] nums, int k) {
    int n = nums.length;
    int[] result = new int[n - k + 1];
    Deque<Integer> deque = new ArrayDeque<>();
    
    for (int i = 0; i < n; i++) {
        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
            deque.pollFirst();
        }
        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
            deque.pollLast();
        }
        deque.offerLast(i);
        if (i >= k - 1) {
            result[i - k + 1] = nums[deque.peekFirst()];
        }
    }
    
    return result;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 7,
        bugType: 'off-by-one',
        description: 'Window boundary check is wrong. Should be i - k (exclusive) not i - k + 1. Elements at index i - k are outside window.',
        fix: 'while (!deque.isEmpty() && deque.peekFirst() <= i - k) {',
      },
    ],
    hints: [
      'If window is [i-k+1, i], which indices are outside?',
      'When i = k, what is the valid window range?',
    ],
    correctCode: `public int[] maxSlidingWindow(int[] nums, int k) {
    int n = nums.length;
    int[] result = new int[n - k + 1];
    Deque<Integer> deque = new ArrayDeque<>();
    
    for (int i = 0; i < n; i++) {
        while (!deque.isEmpty() && deque.peekFirst() <= i - k) {
            deque.pollFirst();
        }
        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
            deque.pollLast();
        }
        deque.offerLast(i);
        if (i >= k - 1) {
            result[i - k + 1] = nums[deque.peekFirst()];
        }
    }
    
    return result;
}`,
  },

  {
    id: 'n-queens-buggy-1',
    problemId: 'n-queens',
    title: 'N-Queens - Diagonal Check Bug',
    difficulty: 'Hard',
    description: 'Place n queens on an n×n chessboard such that no two queens attack each other.',
    buggyCode: `public List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    char[][] board = new char[n][n];
    for (int i = 0; i < n; i++) Arrays.fill(board[i], '.');
    backtrack(result, board, 0);
    return result;
}

private void backtrack(List<List<String>> result, char[][] board, int row) {
    if (row == board.length) {
        List<String> solution = new ArrayList<>();
        for (char[] r : board) solution.add(new String(r));
        result.add(solution);
        return;
    }
    for (int col = 0; col < board.length; col++) {
        if (isValid(board, row, col)) {
            board[row][col] = 'Q';
            backtrack(result, board, row + 1);
            board[row][col] = '.';
        }
    }
}

private boolean isValid(char[][] board, int row, int col) {
    for (int i = 0; i < row; i++) {
        if (board[i][col] == 'Q') return false;
    }
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] == 'Q') return false;
    }
    for (int i = row - 1, j = col + 1; i >= 0 && j >= board.length; i--, j++) {
        if (board[i][j] == 'Q') return false;
    }
    return true;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 31,
        bugType: 'wrong-operator',
        description: 'Upper-right diagonal check condition is wrong. j >= board.length should be j < board.length.',
        fix: 'for (int i = row - 1, j = col + 1; i >= 0 && j < board.length; i--, j++) {',
      },
    ],
    hints: [
      'What is the valid range for column index j?',
      'Should the condition be j >= or j < board.length?',
    ],
    correctCode: `public List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    char[][] board = new char[n][n];
    for (int i = 0; i < n; i++) Arrays.fill(board[i], '.');
    backtrack(result, board, 0);
    return result;
}

private void backtrack(List<List<String>> result, char[][] board, int row) {
    if (row == board.length) {
        List<String> solution = new ArrayList<>();
        for (char[] r : board) solution.add(new String(r));
        result.add(solution);
        return;
    }
    for (int col = 0; col < board.length; col++) {
        if (isValid(board, row, col)) {
            board[row][col] = 'Q';
            backtrack(result, board, row + 1);
            board[row][col] = '.';
        }
    }
}

private boolean isValid(char[][] board, int row, int col) {
    for (int i = 0; i < row; i++) {
        if (board[i][col] == 'Q') return false;
    }
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] == 'Q') return false;
    }
    for (int i = row - 1, j = col + 1; i >= 0 && j < board.length; i--, j++) {
        if (board[i][j] == 'Q') return false;
    }
    return true;
}`,
  },

  {
    id: 'word-ladder-buggy-1',
    problemId: 'word-ladder',
    title: 'Word Ladder - BFS Level Bug',
    difficulty: 'Hard',
    description: 'Find the length of shortest transformation sequence from beginWord to endWord.',
    buggyCode: `public int ladderLength(String beginWord, String endWord, List<String> wordList) {
    Set<String> wordSet = new HashSet<>(wordList);
    if (!wordSet.contains(endWord)) return 0;
    
    Queue<String> queue = new LinkedList<>();
    queue.offer(beginWord);
    int level = 0;
    
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            String word = queue.poll();
            if (word.equals(endWord)) return level;
            
            char[] chars = word.toCharArray();
            for (int j = 0; j < chars.length; j++) {
                char original = chars[j];
                for (char c = 'a'; c <= 'z'; c++) {
                    chars[j] = c;
                    String newWord = new String(chars);
                    if (wordSet.contains(newWord)) {
                        queue.offer(newWord);
                        wordSet.remove(newWord);
                    }
                }
                chars[j] = original;
            }
        }
        level++;
    }
    
    return 0;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 7,
        bugType: 'off-by-one',
        description: 'level should start at 1 (beginWord counts as the first word in the sequence), and level++ should happen before checking.',
        fix: 'int level = 1; and move level++ before checking word.equals(endWord), or increment at start of while loop.',
      },
    ],
    hints: [
      'The problem asks for the length of the sequence, not the number of transformations.',
      'Does beginWord count in the sequence length?',
    ],
    correctCode: `public int ladderLength(String beginWord, String endWord, List<String> wordList) {
    Set<String> wordSet = new HashSet<>(wordList);
    if (!wordSet.contains(endWord)) return 0;
    
    Queue<String> queue = new LinkedList<>();
    queue.offer(beginWord);
    int level = 1;
    
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            String word = queue.poll();
            if (word.equals(endWord)) return level;
            
            char[] chars = word.toCharArray();
            for (int j = 0; j < chars.length; j++) {
                char original = chars[j];
                for (char c = 'a'; c <= 'z'; c++) {
                    chars[j] = c;
                    String newWord = new String(chars);
                    if (wordSet.contains(newWord)) {
                        queue.offer(newWord);
                        wordSet.remove(newWord);
                    }
                }
                chars[j] = original;
            }
        }
        level++;
    }
    
    return 0;
}`,
  },

  {
    id: 'minimum-window-substring-buggy-1',
    problemId: 'minimum-window-substring',
    title: 'Minimum Window Substring - Count Bug',
    difficulty: 'Hard',
    description: 'Given two strings s and t, return the minimum window substring of s that contains all characters of t.',
    buggyCode: `public String minWindow(String s, String t) {
    Map<Character, Integer> need = new HashMap<>();
    Map<Character, Integer> window = new HashMap<>();
    for (char c : t.toCharArray()) {
        need.put(c, need.getOrDefault(c, 0) + 1);
    }
    
    int left = 0, right = 0;
    int valid = 0;
    int start = 0, minLen = Integer.MAX_VALUE;
    
    while (right < s.length()) {
        char c = s.charAt(right);
        right++;
        if (need.containsKey(c)) {
            window.put(c, window.getOrDefault(c, 0) + 1);
            if (window.get(c) == need.get(c)) valid++;
        }
        
        while (valid == need.size()) {
            if (right - left < minLen) {
                start = left;
                minLen = right - left;
            }
            char d = s.charAt(left);
            left++;
            if (need.containsKey(d)) {
                if (window.get(d) == need.get(d)) valid--;
                window.put(d, window.get(d) - 1);
            }
        }
    }
    
    return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 17,
        bugType: 'logic-error',
        description: 'Integer comparison using == instead of .equals(). For Integer values > 127, == compares references, not values.',
        fix: 'if (window.get(c).equals(need.get(c))) valid++;',
      },
      {
        id: 'bug-2',
        lineNumber: 27,
        bugType: 'logic-error',
        description: 'Same issue: Integer comparison should use .equals() instead of ==.',
        fix: 'if (window.get(d).equals(need.get(d))) valid--;',
      },
    ],
    hints: [
      'How does == work for Integer objects in Java?',
      'What happens when the count exceeds 127?',
    ],
    correctCode: `public String minWindow(String s, String t) {
    Map<Character, Integer> need = new HashMap<>();
    Map<Character, Integer> window = new HashMap<>();
    for (char c : t.toCharArray()) {
        need.put(c, need.getOrDefault(c, 0) + 1);
    }
    
    int left = 0, right = 0;
    int valid = 0;
    int start = 0, minLen = Integer.MAX_VALUE;
    
    while (right < s.length()) {
        char c = s.charAt(right);
        right++;
        if (need.containsKey(c)) {
            window.put(c, window.getOrDefault(c, 0) + 1);
            if (window.get(c).equals(need.get(c))) valid++;
        }
        
        while (valid == need.size()) {
            if (right - left < minLen) {
                start = left;
                minLen = right - left;
            }
            char d = s.charAt(left);
            left++;
            if (need.containsKey(d)) {
                if (window.get(d).equals(need.get(d))) valid--;
                window.put(d, window.get(d) - 1);
            }
        }
    }
    
    return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
}`,
  },

  {
    id: 'serialize-deserialize-bt-buggy-1',
    problemId: 'serialize-and-deserialize-binary-tree',
    title: 'Serialize/Deserialize Binary Tree - Index Bug',
    difficulty: 'Hard',
    description: 'Design an algorithm to serialize and deserialize a binary tree.',
    buggyCode: `public class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        serializeHelper(root, sb);
        return sb.toString();
    }
    
    private void serializeHelper(TreeNode node, StringBuilder sb) {
        if (node == null) {
            sb.append("null,");
            return;
        }
        sb.append(node.val).append(",");
        serializeHelper(node.left, sb);
        serializeHelper(node.right, sb);
    }
    
    public TreeNode deserialize(String data) {
        String[] nodes = data.split(",");
        int[] index = {0};
        return deserializeHelper(nodes, index);
    }
    
    private TreeNode deserializeHelper(String[] nodes, int[] index) {
        if (index[0] >= nodes.length || nodes[index[0]].equals("null")) {
            index[0]++;
            return null;
        }
        TreeNode node = new TreeNode(Integer.parseInt(nodes[index[0]]));
        node.left = deserializeHelper(nodes, index);
        node.right = deserializeHelper(nodes, index);
        return node;
    }
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 27,
        bugType: 'logic-error',
        description: 'Missing index[0]++ after creating the node. The index should advance before recursing to children.',
        fix: 'Add index[0]++; after creating the node, before recursing.',
      },
    ],
    hints: [
      'After processing a node value, does the index move forward?',
      'What index does the left child try to read?',
    ],
    correctCode: `public class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        serializeHelper(root, sb);
        return sb.toString();
    }
    
    private void serializeHelper(TreeNode node, StringBuilder sb) {
        if (node == null) {
            sb.append("null,");
            return;
        }
        sb.append(node.val).append(",");
        serializeHelper(node.left, sb);
        serializeHelper(node.right, sb);
    }
    
    public TreeNode deserialize(String data) {
        String[] nodes = data.split(",");
        int[] index = {0};
        return deserializeHelper(nodes, index);
    }
    
    private TreeNode deserializeHelper(String[] nodes, int[] index) {
        if (index[0] >= nodes.length || nodes[index[0]].equals("null")) {
            index[0]++;
            return null;
        }
        TreeNode node = new TreeNode(Integer.parseInt(nodes[index[0]]));
        index[0]++;
        node.left = deserializeHelper(nodes, index);
        node.right = deserializeHelper(nodes, index);
        return node;
    }
}`,
  },

  {
    id: 'alien-dictionary-buggy-1',
    problemId: 'alien-dictionary',
    title: 'Alien Dictionary - Graph Construction Bug',
    difficulty: 'Hard',
    description: 'Given a list of words from the alien language\'s dictionary, derive the order of letters in this language.',
    buggyCode: `public String alienOrder(String[] words) {
    Map<Character, Set<Character>> graph = new HashMap<>();
    Map<Character, Integer> inDegree = new HashMap<>();
    
    for (String word : words) {
        for (char c : word.toCharArray()) {
            graph.putIfAbsent(c, new HashSet<>());
            inDegree.putIfAbsent(c, 0);
        }
    }
    
    for (int i = 0; i < words.length - 1; i++) {
        String w1 = words[i], w2 = words[i + 1];
        for (int j = 0; j < Math.min(w1.length(), w2.length()); j++) {
            if (w1.charAt(j) != w2.charAt(j)) {
                if (!graph.get(w1.charAt(j)).contains(w2.charAt(j))) {
                    graph.get(w1.charAt(j)).add(w2.charAt(j));
                    inDegree.put(w2.charAt(j), inDegree.get(w2.charAt(j)) + 1);
                }
                break;
            }
        }
    }
    
    Queue<Character> queue = new LinkedList<>();
    for (char c : inDegree.keySet()) {
        if (inDegree.get(c) == 0) queue.offer(c);
    }
    
    StringBuilder result = new StringBuilder();
    while (!queue.isEmpty()) {
        char c = queue.poll();
        result.append(c);
        for (char next : graph.get(c)) {
            inDegree.put(next, inDegree.get(next) - 1);
            if (inDegree.get(next) == 0) queue.offer(next);
        }
    }
    
    return result.length() == inDegree.size() ? result.toString() : "";
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 21,
        bugType: 'missing-edge-case',
        description: 'Missing check for invalid input: if w1 is longer than w2 and w2 is a prefix of w1 (e.g., ["abc", "ab"]), the order is invalid.',
        fix: 'Add before the for loop: if (w1.length() > w2.length() && w1.startsWith(w2)) return "";',
      },
    ],
    hints: [
      'What if "abc" comes before "ab" in the dictionary?',
      'Is that a valid ordering?',
    ],
    correctCode: `public String alienOrder(String[] words) {
    Map<Character, Set<Character>> graph = new HashMap<>();
    Map<Character, Integer> inDegree = new HashMap<>();
    
    for (String word : words) {
        for (char c : word.toCharArray()) {
            graph.putIfAbsent(c, new HashSet<>());
            inDegree.putIfAbsent(c, 0);
        }
    }
    
    for (int i = 0; i < words.length - 1; i++) {
        String w1 = words[i], w2 = words[i + 1];
        if (w1.length() > w2.length() && w1.startsWith(w2)) {
            return "";
        }
        for (int j = 0; j < Math.min(w1.length(), w2.length()); j++) {
            if (w1.charAt(j) != w2.charAt(j)) {
                if (!graph.get(w1.charAt(j)).contains(w2.charAt(j))) {
                    graph.get(w1.charAt(j)).add(w2.charAt(j));
                    inDegree.put(w2.charAt(j), inDegree.get(w2.charAt(j)) + 1);
                }
                break;
            }
        }
    }
    
    Queue<Character> queue = new LinkedList<>();
    for (char c : inDegree.keySet()) {
        if (inDegree.get(c) == 0) queue.offer(c);
    }
    
    StringBuilder result = new StringBuilder();
    while (!queue.isEmpty()) {
        char c = queue.poll();
        result.append(c);
        for (char next : graph.get(c)) {
            inDegree.put(next, inDegree.get(next) - 1);
            if (inDegree.get(next) == 0) queue.offer(next);
        }
    }
    
    return result.length() == inDegree.size() ? result.toString() : "";
}`,
  },

  {
    id: 'longest-increasing-path-buggy-1',
    problemId: 'longest-increasing-path-in-a-matrix',
    title: 'Longest Increasing Path - Memoization Bug',
    difficulty: 'Hard',
    description: 'Find the longest increasing path in a matrix.',
    buggyCode: `public int longestIncreasingPath(int[][] matrix) {
    if (matrix == null || matrix.length == 0) return 0;
    int m = matrix.length, n = matrix[0].length;
    int[][] memo = new int[m][n];
    int maxPath = 0;
    
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            maxPath = Math.max(maxPath, dfs(matrix, memo, i, j));
        }
    }
    
    return maxPath;
}

private int dfs(int[][] matrix, int[][] memo, int i, int j) {
    if (memo[i][j] != 0) return memo[i][j];
    
    int[][] dirs = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    int maxLen = 1;
    
    for (int[] dir : dirs) {
        int x = i + dir[0], y = j + dir[1];
        if (x >= 0 && x < matrix.length && y >= 0 && y < matrix[0].length 
            && matrix[x][y] > matrix[i][j]) {
            maxLen = Math.max(maxLen, dfs(matrix, memo, x, y));
        }
    }
    
    memo[i][j] = maxLen;
    return maxLen;
}`,
    bugs: [
      {
        id: 'bug-1',
        lineNumber: 26,
        bugType: 'logic-error',
        description: 'When extending the path, should add 1 to the recursive result. Currently just taking max, not adding current cell.',
        fix: 'maxLen = Math.max(maxLen, 1 + dfs(matrix, memo, x, y));',
      },
    ],
    hints: [
      'If neighbor has path length 3, what is our path length including current cell?',
      'Are we counting the current cell in the path?',
    ],
    correctCode: `public int longestIncreasingPath(int[][] matrix) {
    if (matrix == null || matrix.length == 0) return 0;
    int m = matrix.length, n = matrix[0].length;
    int[][] memo = new int[m][n];
    int maxPath = 0;
    
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            maxPath = Math.max(maxPath, dfs(matrix, memo, i, j));
        }
    }
    
    return maxPath;
}

private int dfs(int[][] matrix, int[][] memo, int i, int j) {
    if (memo[i][j] != 0) return memo[i][j];
    
    int[][] dirs = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    int maxLen = 1;
    
    for (int[] dir : dirs) {
        int x = i + dir[0], y = j + dir[1];
        if (x >= 0 && x < matrix.length && y >= 0 && y < matrix[0].length 
            && matrix[x][y] > matrix[i][j]) {
            maxLen = Math.max(maxLen, 1 + dfs(matrix, memo, x, y));
        }
    }
    
    memo[i][j] = maxLen;
    return maxLen;
}`,
  },
];

// Helper function to get challenges by difficulty
export function getChallengesByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): BuggyCodeChallenge[] {
  return buggyCodeChallenges.filter(c => c.difficulty === difficulty);
}

// Helper function to get challenges by bug type
export function getChallengesByBugType(bugType: BugType): BuggyCodeChallenge[] {
  return buggyCodeChallenges.filter(c => c.bugs.some(b => b.bugType === bugType));
}

// Helper to get all bug types present in challenges
export function getAllBugTypes(): BugType[] {
  const types = new Set<BugType>();
  buggyCodeChallenges.forEach(c => c.bugs.forEach(b => types.add(b.bugType)));
  return Array.from(types);
}
