import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const TWO_SUM_BRUTE_CODE: MultiLanguageCode = {
  java: `public int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[] { i, j };
            }
        }
    }
    return new int[] {}; // No solution
}
// Time: O(n²)  |  Space: O(1)`,

  python: `def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []  # No solution
# Time: O(n²)  |  Space: O(1)`,

  javascript: `function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return []; // No solution
}
// Time: O(n²)  |  Space: O(1)`
};

// Line mappings for step synchronization across languages
export const TWO_SUM_BRUTE_LINE_MAP = {
  java: {
    'start': { current: 1, highlighted: [1] },
    'outer-loop': { current: 2, highlighted: [2] },
    'inner-loop': { current: 3, highlighted: [3] },
    'check-pair': { current: 4, highlighted: [4] },
    'found': { current: 5, highlighted: [4, 5] },
    'done': { current: 9, highlighted: [9] },
  },
  python: {
    'start': { current: 1, highlighted: [1] },
    'outer-loop': { current: 2, highlighted: [2] },
    'inner-loop': { current: 3, highlighted: [3] },
    'check-pair': { current: 4, highlighted: [4] },
    'found': { current: 5, highlighted: [4, 5] },
    'done': { current: 6, highlighted: [6] },
  },
  javascript: {
    'start': { current: 1, highlighted: [1] },
    'outer-loop': { current: 2, highlighted: [2] },
    'inner-loop': { current: 3, highlighted: [3] },
    'check-pair': { current: 4, highlighted: [4] },
    'found': { current: 5, highlighted: [4, 5] },
    'done': { current: 9, highlighted: [9] },
  },
};