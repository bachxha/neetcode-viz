import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const CLIMBING_STAIRS_CODE: MultiLanguageCode = {
  java: `public int climbStairs(int n) {
    if (n <= 1) return 1;
    
    int prev1 = 1; // f(n-1)
    int prev2 = 1; // f(n-2)
    
    for (int i = 2; i <= n; i++) {
        int current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}
// Time: O(n)  |  Space: O(1)`,

  python: `def climb_stairs(n):
    if n <= 1:
        return 1
    
    prev1, prev2 = 1, 1  # f(n-1), f(n-2)
    
    for i in range(2, n + 1):
        current = prev1 + prev2
        prev2 = prev1
        prev1 = current
    
    return prev1
# Time: O(n)  |  Space: O(1)`,

  javascript: `function climbStairs(n) {
    if (n <= 1) return 1;
    
    let prev1 = 1; // f(n-1)
    let prev2 = 1; // f(n-2)
    
    for (let i = 2; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}
// Time: O(n)  |  Space: O(1)`
};

// Line mappings for step synchronization across languages
export const CLIMBING_STAIRS_LINE_MAP = {
  java: {
    'start': { current: 1, highlighted: [1, 2] },
    'base': { current: 4, highlighted: [4, 5] },
    'compute': { current: 8, highlighted: [7, 8, 9, 10] },
    'done': { current: 13, highlighted: [13] },
  },
  python: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'base': { current: 5, highlighted: [5] },
    'compute': { current: 8, highlighted: [7, 8, 9, 10] },
    'done': { current: 12, highlighted: [12] },
  },
  javascript: {
    'start': { current: 1, highlighted: [1, 2] },
    'base': { current: 4, highlighted: [4, 5] },
    'compute': { current: 8, highlighted: [7, 8, 9, 10] },
    'done': { current: 13, highlighted: [13] },
  },
};