import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const BINARY_SEARCH_CODE: MultiLanguageCode = {
  java: `public int search(int[] nums, int target) {
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
    
    return -1; // Not found
}
// Time: O(log n)  |  Space: O(1)`,

  python: `def search(nums, target):
    left = 0
    right = len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Not found
# Time: O(log n)  |  Space: O(1)`,

  javascript: `function search(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1; // Not found
}
// Time: O(log n)  |  Space: O(1)`
};

// Line mappings for step synchronization across languages
export const BINARY_SEARCH_LINE_MAP = {
  java: {
    'start': { current: 2, highlighted: [1, 2, 3] },
    'compare': { current: 8, highlighted: [6, 7, 8] },
    'found': { current: 9, highlighted: [8, 9] },
    'search-right': { current: 11, highlighted: [10, 11] },
    'search-left': { current: 13, highlighted: [12, 13] },
    'not-found': { current: 17, highlighted: [17] },
  },
  python: {
    'start': { current: 2, highlighted: [1, 2, 3] },
    'compare': { current: 8, highlighted: [6, 7, 8] },
    'found': { current: 9, highlighted: [8, 9] },
    'search-right': { current: 11, highlighted: [10, 11] },
    'search-left': { current: 13, highlighted: [12, 13] },
    'not-found': { current: 15, highlighted: [15] },
  },
  javascript: {
    'start': { current: 2, highlighted: [1, 2, 3] },
    'compare': { current: 8, highlighted: [6, 7, 8] },
    'found': { current: 9, highlighted: [8, 9] },
    'search-right': { current: 11, highlighted: [10, 11] },
    'search-left': { current: 13, highlighted: [12, 13] },
    'not-found': { current: 17, highlighted: [17] },
  },
};