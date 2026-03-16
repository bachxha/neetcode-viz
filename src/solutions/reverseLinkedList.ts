import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const REVERSE_LINKED_LIST_CODE: MultiLanguageCode = {
  java: `public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode current = head;
    
    while (current != null) {
        ListNode next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    return prev;
}
// Time: O(n)  |  Space: O(1)`,

  python: `def reverse_list(head):
    prev = None
    current = head
    
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    
    return prev
# Time: O(n)  |  Space: O(1)`,

  javascript: `function reverseList(head) {
    let prev = null;
    let current = head;
    
    while (current !== null) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    return prev;
}
// Time: O(n)  |  Space: O(1)`
};

// Line mappings for step synchronization across languages
export const REVERSE_LINKED_LIST_LINE_MAP = {
  java: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'initialize': { current: 2, highlighted: [1, 2, 3] },
    'process': { current: 6, highlighted: [5, 6] },
    'reverse': { current: 7, highlighted: [7] },
    'advance': { current: 8, highlighted: [8, 9] },
    'done': { current: 12, highlighted: [12] },
  },
  python: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'initialize': { current: 2, highlighted: [1, 2, 3] },
    'process': { current: 6, highlighted: [5, 6] },
    'reverse': { current: 7, highlighted: [7] },
    'advance': { current: 8, highlighted: [8, 9] },
    'done': { current: 11, highlighted: [11] },
  },
  javascript: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'initialize': { current: 2, highlighted: [1, 2, 3] },
    'process': { current: 6, highlighted: [5, 6] },
    'reverse': { current: 7, highlighted: [7] },
    'advance': { current: 8, highlighted: [8, 9] },
    'done': { current: 12, highlighted: [12] },
  },
};