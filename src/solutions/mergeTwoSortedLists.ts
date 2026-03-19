import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const MERGE_TWO_SORTED_LISTS_CODE: MultiLanguageCode = {
  java: `public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    ListNode dummy = new ListNode(0);
    ListNode current = dummy;
    
    while (list1 != null && list2 != null) {
        if (list1.val <= list2.val) {
            current.next = list1;
            list1 = list1.next;
        } else {
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }
    
    // Add remaining nodes
    if (list1 != null) current.next = list1;
    else if (list2 != null) current.next = list2;
    
    return dummy.next;
}
// Time: O(m + n)  |  Space: O(1)`,

  python: `def mergeTwoLists(list1, list2):
    dummy = ListNode(0)
    current = dummy
    
    while list1 and list2:
        if list1.val <= list2.val:
            current.next = list1
            list1 = list1.next
        else:
            current.next = list2
            list2 = list2.next
        current = current.next
    
    # Add remaining nodes
    if list1:
        current.next = list1
    elif list2:
        current.next = list2
    
    return dummy.next
# Time: O(m + n)  |  Space: O(1)`,

  javascript: `function mergeTwoLists(list1, list2) {
    const dummy = new ListNode(0);
    let current = dummy;
    
    while (list1 && list2) {
        if (list1.val <= list2.val) {
            current.next = list1;
            list1 = list1.next;
        } else {
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }
    
    // Add remaining nodes
    if (list1) current.next = list1;
    else if (list2) current.next = list2;
    
    return dummy.next;
}
// Time: O(m + n)  |  Space: O(1)`
};

// Line mappings for step synchronization across languages
export const MERGE_TWO_SORTED_LISTS_LINE_MAP = {
  java: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'compare': { current: 5, highlighted: [5, 6] },
    'take-from-list1': { current: 7, highlighted: [6, 7, 8] },
    'take-from-list2': { current: 10, highlighted: [9, 10, 11] },
    'advance-pointer': { current: 13, highlighted: [13] },
    'add-remaining': { current: 17, highlighted: [17, 18] },
    'done': { current: 20, highlighted: [20] },
  },
  python: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'compare': { current: 5, highlighted: [5, 6] },
    'take-from-list1': { current: 7, highlighted: [6, 7, 8] },
    'take-from-list2': { current: 10, highlighted: [9, 10, 11] },
    'advance-pointer': { current: 12, highlighted: [12] },
    'add-remaining': { current: 15, highlighted: [15, 16, 17, 18] },
    'done': { current: 20, highlighted: [20] },
  },
  javascript: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'compare': { current: 5, highlighted: [5, 6] },
    'take-from-list1': { current: 7, highlighted: [6, 7, 8] },
    'take-from-list2': { current: 10, highlighted: [9, 10, 11] },
    'advance-pointer': { current: 13, highlighted: [13] },
    'add-remaining': { current: 16, highlighted: [16, 17] },
    'done': { current: 19, highlighted: [19] },
  },
};