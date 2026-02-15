export interface Hint {
  level: 'nudge' | 'approach' | 'near-solution';
  title: string;
  content: string;
  icon: string;
}

export interface ProblemHints {
  problemId: string;
  problemName: string;
  hints: [Hint, Hint, Hint]; // Always 3 hints: nudge, approach, near-solution
}

export const hintsData: ProblemHints[] = [
  {
    problemId: 'two-sum',
    problemName: 'Two Sum',
    hints: [
      {
        level: 'nudge',
        title: 'Think about complements',
        content: 'For each number, what other number would you need to reach the target? Can you find a way to remember what numbers you\'ve already seen?',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'HashMap for O(1) lookup',
        content: 'Use a HashMap to store numbers you\'ve seen with their indices. For each number, calculate the complement (target - current number) and check if it exists in your map.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'One-pass algorithm',
        content: 'While iterating through the array: (1) Calculate complement = target - nums[i], (2) Check if complement exists in HashMap, (3) If yes, return [map[complement], i], (4) If no, add nums[i] and index i to HashMap.',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'valid-parentheses',
    problemName: 'Valid Parentheses',
    hints: [
      {
        level: 'nudge',
        title: 'Last in, first out',
        content: 'What data structure is perfect for handling "last in, first out" scenarios? Think about how you would manually check if parentheses are balanced.',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'Stack with matching pairs',
        content: 'Use a stack to keep track of opening brackets. When you see a closing bracket, check if it matches the most recent opening bracket (top of stack).',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'Push opens, pop and match closes',
        content: 'For each character: (1) If opening bracket (\'(\', \'[\', \'{\'), push to stack, (2) If closing bracket, check if stack is empty or top doesn\'t match - return false, (3) Pop the matching opening bracket, (4) Return true if stack is empty at the end.',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'binary-search',
    problemName: 'Binary Search',
    hints: [
      {
        level: 'nudge',
        title: 'Divide and conquer',
        content: 'The array is sorted! How can you eliminate half of the remaining elements with each comparison? Think about how you might look up a word in a dictionary.',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'Two pointers with midpoint',
        content: 'Maintain left and right pointers. Calculate the middle index. Compare the middle element with your target to decide which half to search next.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'Narrow the search space',
        content: 'While left <= right: (1) mid = (left + right) // 2, (2) if nums[mid] == target: return mid, (3) if nums[mid] < target: left = mid + 1, (4) else: right = mid - 1. Return -1 if not found.',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'best-time-buy-sell-stock',
    problemName: 'Best Time to Buy and Sell Stock',
    hints: [
      {
        level: 'nudge',
        title: 'Track the minimum so far',
        content: 'You want to buy low and sell high. As you go through the prices, what\'s the key information you need to remember? What if you tracked the lowest price you\'ve seen so far?',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'One pass with running minimum',
        content: 'Keep track of the minimum price seen so far and the maximum profit. For each price, calculate profit if you sold today, and update your maximum profit.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'Update min price and max profit',
        content: 'Initialize minPrice = prices[0], maxProfit = 0. For each price: (1) Update minPrice = min(minPrice, currentPrice), (2) Calculate currentProfit = currentPrice - minPrice, (3) Update maxProfit = max(maxProfit, currentProfit).',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'contains-duplicate',
    problemName: 'Contains Duplicate',
    hints: [
      {
        level: 'nudge',
        title: 'Check if you\'ve seen it before',
        content: 'How can you keep track of what numbers you\'ve already encountered? What data structure gives you fast lookup to check if something exists?',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'HashSet for O(1) membership test',
        content: 'Use a HashSet to store numbers you\'ve seen. For each number, check if it\'s already in the set before adding it.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'Add to set and check duplicates',
        content: 'Create an empty HashSet. For each number in the array: (1) If the number is already in the set, return true (duplicate found), (2) Otherwise, add the number to the set. Return false if no duplicates found.',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'longest-substring-without-repeating',
    problemName: 'Longest Substring Without Repeating Characters',
    hints: [
      {
        level: 'nudge',
        title: 'Sliding window approach',
        content: 'Think about maintaining a "window" of characters. When you encounter a duplicate, how should you adjust your window? What if you used two pointers?',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'Two pointers with character tracking',
        content: 'Use left and right pointers to maintain a sliding window. Use a HashSet to track characters in the current window. When you find a duplicate, move the left pointer.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'Expand right, contract left on duplicates',
        content: 'Use HashSet and two pointers (left=0, right=0). Expand right: if s[right] not in set, add it and update maxLength. If s[right] is in set, remove s[left] from set and increment left until no duplicate.',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'group-anagrams',
    problemName: 'Group Anagrams',
    hints: [
      {
        level: 'nudge',
        title: 'What makes anagrams similar?',
        content: 'Anagrams contain the same characters in different orders. How could you create a "signature" or "key" that would be identical for all anagrams of each other?',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'Sort characters as grouping key',
        content: 'Sort the characters in each string to create a key. All anagrams will have the same sorted key. Use a HashMap where the key is the sorted string and the value is a list of anagrams.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'HashMap with sorted string keys',
        content: 'Create HashMap<String, List<String>>. For each string: (1) Sort its characters to get the key, (2) If key exists in map, add string to its list, (3) Otherwise, create new list with this string. Return all values from the map.',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'house-robber',
    problemName: 'House Robber',
    hints: [
      {
        level: 'nudge',
        title: 'Decision at each house',
        content: 'At each house, you have a choice: rob it or skip it. If you rob a house, what constraint does that create? This sounds like it might benefit from dynamic programming.',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'Track max money with/without current house',
        content: 'For each house, calculate the maximum money if you include this house vs. if you exclude it. If you rob this house, you can\'t rob the previous one.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'DP: max(prev2 + current, prev1)',
        content: 'Use two variables: prev1 (max money up to previous house) and prev2 (max money up to house before previous). For each house: current_max = max(prev1, prev2 + nums[i]). Update: prev2 = prev1, prev1 = current_max.',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'course-schedule',
    problemName: 'Course Schedule',
    hints: [
      {
        level: 'nudge',
        title: 'Detect circular dependencies',
        content: 'This is about prerequisite relationships. What graph concept helps detect if there\'s a circular dependency? Think about what would make it impossible to complete all courses.',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'Graph cycle detection with DFS',
        content: 'Model this as a directed graph where edges represent prerequisites. Use DFS with three states for each node: unvisited, visiting (in current path), and visited. A cycle exists if you visit a "visiting" node.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'DFS with three-state tracking',
        content: 'Build adjacency list from prerequisites. For each unvisited course, run DFS: (1) Mark as "visiting", (2) Recursively visit all prerequisites, (3) If any prerequisite is "visiting", cycle detected, (4) Mark as "visited". Return false if cycle found.',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'word-search',
    problemName: 'Word Search',
    hints: [
      {
        level: 'nudge',
        title: 'Explore all possible paths',
        content: 'You need to find a path through the grid that spells your word. What algorithm helps you explore all possible paths? Think about trying different directions from each starting position.',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'DFS with backtracking',
        content: 'For each cell that matches the first letter, start a DFS. Mark cells as visited during the search, then unmark them when backtracking to allow other paths to use them.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'Mark visited, explore 4 directions, backtrack',
        content: 'For each cell matching word[0]: run DFS(row, col, index). In DFS: (1) Check bounds and if cell matches word[index], (2) Mark cell as visited (modify in-place), (3) Recursively check 4 directions with index+1, (4) Restore cell value (backtrack).',
        icon: '🎯'
      }
    ]
  },
  {
    problemId: 'lru-cache',
    problemName: 'LRU Cache',
    hints: [
      {
        level: 'nudge',
        title: 'Fast access + ordering by usage',
        content: 'You need O(1) access to any element AND you need to track which items were used most/least recently. What combination of data structures could give you both capabilities?',
        icon: '🤔'
      },
      {
        level: 'approach',
        title: 'HashMap + Doubly Linked List',
        content: 'Use a HashMap for O(1) key lookup and a doubly linked list to maintain usage order. The HashMap points to linked list nodes, allowing O(1) removal and insertion.',
        icon: '💡'
      },
      {
        level: 'near-solution',
        title: 'Move to head on access, remove tail when full',
        content: 'HashMap<key, ListNode> + doubly linked list with dummy head/tail. Get: move node to head. Put: if exists, update and move to head; if new and at capacity, remove tail; add new node at head.',
        icon: '🎯'
      }
    ]
  }
];

// Helper function to get hints for a specific problem
export function getHintsForProblem(problemId: string): ProblemHints | undefined {
  return hintsData.find(h => h.problemId === problemId);
}

// Helper function to get all available problem IDs with hints
export function getAvailableHintProblems(): string[] {
  return hintsData.map(h => h.problemId);
}