import type { MultiLanguageCode } from '../components/CodeWalkthrough';

export const VALID_PARENTHESES_CODE: MultiLanguageCode = {
  java: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    Map<Character, Character> map = new HashMap<>();
    map.put(')', '(');
    map.put(']', '[');
    map.put('}', '{');
    
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (stack.isEmpty() || stack.pop() != map.get(c)) {
                return false;
            }
        }
    }
    
    return stack.isEmpty();
}
// Time: O(n)  |  Space: O(n)`,

  python: `def is_valid(s):
    stack = []
    mapping = {')': '(', ']': '[', '}': '{'}
    
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    
    return not stack
# Time: O(n)  |  Space: O(n)`,

  javascript: `function isValid(s) {
    const stack = [];
    const mapping = {'(': ')', '[': ']', '{': '}'};
    
    for (let char of s) {
        if (mapping[char]) {
            stack.push(char);
        } else {
            const top = stack.pop();
            if (mapping[top] !== char) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}
// Time: O(n)  |  Space: O(n)`
};

// Line mappings for step synchronization across languages
export const VALID_PARENTHESES_LINE_MAP = {
  java: {
    'start': { current: 1, highlighted: [1, 2, 3, 4, 5, 6] },
    'push': { current: 10, highlighted: [9, 10] },
    'pop': { current: 12, highlighted: [11, 12, 13] },
    'match': { current: 13, highlighted: [12, 13] },
    'mismatch': { current: 13, highlighted: [12, 13] },
    'done': { current: 18, highlighted: [18] },
    'empty': { current: 18, highlighted: [18] },
  },
  python: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'push': { current: 10, highlighted: [10] },
    'pop': { current: 6, highlighted: [6, 7, 8] },
    'match': { current: 8, highlighted: [7, 8] },
    'mismatch': { current: 8, highlighted: [7, 8] },
    'done': { current: 12, highlighted: [12] },
    'empty': { current: 12, highlighted: [12] },
  },
  javascript: {
    'start': { current: 1, highlighted: [1, 2, 3] },
    'push': { current: 7, highlighted: [6, 7] },
    'pop': { current: 9, highlighted: [9, 10, 11] },
    'match': { current: 10, highlighted: [9, 10] },
    'mismatch': { current: 10, highlighted: [9, 10] },
    'done': { current: 15, highlighted: [15] },
    'empty': { current: 15, highlighted: [15] },
  },
};