import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const MAXIMUM_DEPTH_BINARY_TREE_CODE: MultiLanguageCode = {
  java: `public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    
    int leftDepth = maxDepth(root.left);
    int rightDepth = maxDepth(root.right);
    
    return Math.max(leftDepth, rightDepth) + 1;
}
// Time: O(n)  |  Space: O(h) where h is height`,

  python: `def maxDepth(root):
    if root is None:
        return 0
    
    left_depth = maxDepth(root.left)
    right_depth = maxDepth(root.right)
    
    return max(left_depth, right_depth) + 1
# Time: O(n)  |  Space: O(h) where h is height`,

  javascript: `function maxDepth(root) {
    if (!root) return 0;
    
    const leftDepth = maxDepth(root.left);
    const rightDepth = maxDepth(root.right);
    
    return Math.max(leftDepth, rightDepth) + 1;
}
// Time: O(n)  |  Space: O(h) where h is height`
};

// Line mappings for step synchronization across languages
export const MAXIMUM_DEPTH_BINARY_TREE_LINE_MAP = {
  java: {
    'start': { current: 1, highlighted: [1] },
    'visit': { current: 2, highlighted: [1, 2] },
    'calculate': { current: 4, highlighted: [4, 5] },
    'return': { current: 7, highlighted: [7] },
    'complete': { current: 7, highlighted: [1, 7] },
  },
  python: {
    'start': { current: 1, highlighted: [1] },
    'visit': { current: 2, highlighted: [1, 2] },
    'calculate': { current: 5, highlighted: [5, 6] },
    'return': { current: 8, highlighted: [8] },
    'complete': { current: 8, highlighted: [1, 8] },
  },
  javascript: {
    'start': { current: 1, highlighted: [1] },
    'visit': { current: 2, highlighted: [1, 2] },
    'calculate': { current: 4, highlighted: [4, 5] },
    'return': { current: 7, highlighted: [7] },
    'complete': { current: 7, highlighted: [1, 7] },
  },
};