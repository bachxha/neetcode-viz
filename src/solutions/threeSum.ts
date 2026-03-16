import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const THREE_SUM_CODE: MultiLanguageCode = {
  java: `public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> result = new ArrayList<>();
    
    for (int i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] == nums[i-1]) continue;
        
        int left = i + 1;
        int right = nums.length - 1;
        
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                while (left < right && nums[left] == nums[left+1]) left++;
                while (left < right && nums[right] == nums[right-1]) right--;
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
}
// Time: O(n²)  |  Space: O(1)`,

  python: `def three_sum(nums):
    nums.sort()
    result = []
    
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        left = i + 1
        right = len(nums) - 1
        
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    
    return result
# Time: O(n²)  |  Space: O(1)`,

  javascript: `function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const result = [];
    
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        let left = i + 1;
        let right = nums.length - 1;
        
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
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
}
// Time: O(n²)  |  Space: O(1)`
};

// Line mappings for step synchronization across languages
export const THREE_SUM_LINE_MAP = {
  java: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'sort': { current: 2, highlighted: [1, 2, 3] },
    'fix-i': { current: 5, highlighted: [5] },
    'set-pointers': { current: 8, highlighted: [8, 9] },
    'calculate': { current: 12, highlighted: [11, 12] },
    'found-triplet': { current: 14, highlighted: [13, 14] },
    'skip-duplicate-i': { current: 6, highlighted: [6] },
    'skip-duplicate-left': { current: 15, highlighted: [15] },
    'skip-duplicate-right': { current: 16, highlighted: [16] },
    'move-left': { current: 20, highlighted: [19, 20] },
    'move-right': { current: 22, highlighted: [21, 22] },
    'done': { current: 27, highlighted: [27] },
  },
  python: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'sort': { current: 2, highlighted: [1, 2, 3] },
    'fix-i': { current: 5, highlighted: [5] },
    'set-pointers': { current: 9, highlighted: [9, 10] },
    'calculate': { current: 13, highlighted: [12, 13] },
    'found-triplet': { current: 15, highlighted: [14, 15] },
    'skip-duplicate-i': { current: 6, highlighted: [6, 7] },
    'skip-duplicate-left': { current: 16, highlighted: [16, 17] },
    'skip-duplicate-right': { current: 18, highlighted: [18, 19] },
    'move-left': { current: 22, highlighted: [22, 23] },
    'move-right': { current: 24, highlighted: [24, 25] },
    'done': { current: 27, highlighted: [27] },
  },
  javascript: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'sort': { current: 2, highlighted: [1, 2, 3] },
    'fix-i': { current: 5, highlighted: [5] },
    'set-pointers': { current: 8, highlighted: [8, 9] },
    'calculate': { current: 12, highlighted: [11, 12] },
    'found-triplet': { current: 14, highlighted: [13, 14] },
    'skip-duplicate-i': { current: 6, highlighted: [6] },
    'skip-duplicate-left': { current: 15, highlighted: [15] },
    'skip-duplicate-right': { current: 16, highlighted: [16] },
    'move-left': { current: 19, highlighted: [19, 20] },
    'move-right': { current: 21, highlighted: [21, 22] },
    'done': { current: 27, highlighted: [27] },
  },
};