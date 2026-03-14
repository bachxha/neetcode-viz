import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const TWO_SUM_CODE: MultiLanguageCode = {
  java: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    
    return new int[] {}; // No solution
}
// Time: O(n)  |  Space: O(n)`,

  python: `def two_sum(nums, target):
    map = {}
    
    for i in range(len(nums)):
        complement = target - nums[i]
        if complement in map:
            return [map[complement], i]
        map[nums[i]] = i
    
    return []  # No solution
# Time: O(n)  |  Space: O(n)`,

  javascript: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return []; // No solution
}
// Time: O(n)  |  Space: O(n)`
};

// Line mappings for step synchronization across languages
export const TWO_SUM_LINE_MAP = {
  java: {
    'start': { current: 1, highlighted: [1, 2] },
    'check': { current: 5, highlighted: [4, 5, 6] },
    'found': { current: 7, highlighted: [6, 7] },
    'add': { current: 9, highlighted: [9] },
    'done': { current: 12, highlighted: [12] },
  },
  python: {
    'start': { current: 1, highlighted: [1, 2] },
    'check': { current: 5, highlighted: [4, 5, 6] },
    'found': { current: 6, highlighted: [5, 6] },
    'add': { current: 7, highlighted: [7] },
    'done': { current: 9, highlighted: [9] },
  },
  javascript: {
    'start': { current: 1, highlighted: [1, 2] },
    'check': { current: 5, highlighted: [4, 5, 6] },
    'found': { current: 6, highlighted: [5, 6] },
    'add': { current: 8, highlighted: [8] },
    'done': { current: 11, highlighted: [11] },
  },
};