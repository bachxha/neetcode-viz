import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';
import { Hints } from '../components/Hints';

interface Step {
  type: 'start' | 'push' | 'pop' | 'match' | 'mismatch' | 'done' | 'empty';
  input: string;
  currentIndex: number;
  stack: string[];
  currentChar: string;
  isValid: boolean | null;
  description: string;
  highlightedPair?: [number, number]; // For showing matching brackets
}

function generateSteps(input: string): Step[] {
  const steps: Step[] = [];
  const stack: string[] = [];
  const brackets: { [key: string]: string } = { ')': '(', '}': '{', ']': '[' };
  let isValid = true;
  
  steps.push({
    type: 'start',
    input,
    currentIndex: -1,
    stack: [...stack],
    currentChar: '',
    isValid: null,
    description: `Start processing string: "${input}". We'll use a stack to track opening brackets.`,
  });
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    
    if (char === '(' || char === '{' || char === '[') {
      // Opening bracket - push to stack
      stack.push(char);
      steps.push({
        type: 'push',
        input,
        currentIndex: i,
        stack: [...stack],
        currentChar: char,
        isValid: null,
        description: `Found opening bracket '${char}'. Push it onto the stack.`,
      });
    } else {
      // Closing bracket - check if it matches top of stack
      if (stack.length === 0) {
        // No opening bracket to match
        isValid = false;
        steps.push({
          type: 'mismatch',
          input,
          currentIndex: i,
          stack: [...stack],
          currentChar: char,
          isValid: false,
          description: `Found closing bracket '${char}' but stack is empty! No matching opening bracket.`,
        });
        break;
      } else {
        const top = stack[stack.length - 1];
        if (brackets[char] === top) {
          // Match found - pop from stack
          stack.pop();
          steps.push({
            type: 'pop',
            input,
            currentIndex: i,
            stack: [...stack],
            currentChar: char,
            isValid: null,
            description: `Found closing bracket '${char}'. It matches '${top}' from stack. Pop the stack.`,
          });
          
          steps.push({
            type: 'match',
            input,
            currentIndex: i,
            stack: [...stack],
            currentChar: char,
            isValid: null,
            description: `✓ Perfect match! '${top}' and '${char}' form a valid pair.`,
          });
        } else {
          // Mismatch
          isValid = false;
          steps.push({
            type: 'mismatch',
            input,
            currentIndex: i,
            stack: [...stack],
            currentChar: char,
            isValid: false,
            description: `Found closing bracket '${char}' but top of stack is '${top}'. Mismatch!`,
          });
          break;
        }
      }
    }
  }
  
  // Final check
  if (isValid && stack.length === 0) {
    steps.push({
      type: 'done',
      input,
      currentIndex: input.length - 1,
      stack: [...stack],
      currentChar: '',
      isValid: true,
      description: `✅ All brackets processed and stack is empty. String is VALID!`,
    });
  } else if (isValid && stack.length > 0) {
    steps.push({
      type: 'done',
      input,
      currentIndex: input.length - 1,
      stack: [...stack],
      currentChar: '',
      isValid: false,
      description: `❌ Stack still has ${stack.length} unmatched opening bracket(s). String is INVALID!`,
    });
  }
  
  return steps;
}

const testCases = [
  { input: '()', expected: true, description: 'Simple pair' },
  { input: '()[]{}', expected: true, description: 'Multiple types' },
  { input: '([{}])', expected: true, description: 'Nested brackets' },
  { input: '', expected: true, description: 'Empty string' },
  { input: '(]', expected: false, description: 'Mismatched types' },
  { input: '([)]', expected: false, description: 'Incorrect nesting' },
  { input: '((', expected: false, description: 'Unmatched opening' },
  { input: '))', expected: false, description: 'Unmatched closing' },
];

function getBracketColor(bracket: string): string {
  switch (bracket) {
    case '(':
    case ')':
      return 'text-blue-400 border-blue-400';
    case '[':
    case ']':
      return 'text-green-400 border-green-400';
    case '{':
    case '}':
      return 'text-purple-400 border-purple-400';
    default:
      return 'text-slate-400 border-slate-400';
  }
}

export function ValidParenthesesVisualizer() {
  const [inputString, setInputString] = useState('([{}])');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    if (inputString.length <= 20) {
      const newSteps = generateSteps(inputString);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [inputString]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, 1000 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  const loadTestCase = (testCase: typeof testCases[0]) => {
    setInputString(testCase.input);
    setIsPlaying(false);
    setTimeout(() => {
      const newSteps = generateSteps(testCase.input);
      setSteps(newSteps);
      setCurrentStep(0);
    }, 100);
  };
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Valid Parentheses</h1>
        <p className="text-slate-400">
          Classic stack problem! Use a stack to match opening brackets with closing brackets.
          Essential pattern for parsing expressions and validating syntax.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center flex-wrap">
        <label className="text-sm text-slate-400">Input string:</label>
        <input
          type="text"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          placeholder="Enter parentheses..."
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono text-lg"
          maxLength={20}
        />
        <button
          onClick={initializeSteps}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm"
        >
          Visualize
        </button>
      </div>
      
      {/* Test Cases */}
      <div className="mb-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Quick Test Cases</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {testCases.map((testCase, i) => (
            <button
              key={i}
              onClick={() => loadTestCase(testCase)}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                inputString === testCase.input
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-slate-600 hover:border-slate-500 bg-slate-700'
              }`}
            >
              <div className="font-mono text-sm">"{testCase.input}"</div>
              <div className="text-slate-400">{testCase.description}</div>
              <div className={`text-xs ${testCase.expected ? 'text-green-400' : 'text-red-400'}`}>
                {testCase.expected ? 'Valid' : 'Invalid'}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Input String Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Input String</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {currentStepData?.input.split('').map((char, i) => {
            const isActive = i === currentStepData?.currentIndex;
            const isPassed = i < (currentStepData?.currentIndex || 0);
            
            return (
              <motion.div
                key={i}
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl border-2 ${
                  isActive ? 'bg-yellow-500 text-black border-yellow-400' :
                  isPassed ? `bg-slate-600 ${getBracketColor(char)}` :
                  `bg-slate-700 ${getBracketColor(char)}`
                }`}
                animate={{ 
                  scale: isActive ? 1.2 : 1,
                  rotate: isActive ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 0.3 }}
              >
                {char}
              </motion.div>
            );
          })}
        </div>
        {currentStepData?.currentChar && (
          <div className="mt-4 text-center">
            <span className="text-lg text-slate-300">
              Processing: <span className={`font-bold ${getBracketColor(currentStepData.currentChar)}`}>
                '{currentStepData.currentChar}'
              </span>
            </span>
          </div>
        )}
      </div>
      
      {/* Stack Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Stack</h3>
        <div className="flex flex-col items-center" style={{ minHeight: 200 }}>
          <div className="text-xs text-slate-500 mb-2">Top</div>
          <AnimatePresence mode="popLayout">
            {currentStepData?.stack.map((bracket, i) => (
              <motion.div
                key={`${bracket}-${i}-${currentStep}`}
                className={`w-16 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-xl mb-1 ${getBracketColor(bracket)} bg-slate-700`}
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                style={{ zIndex: currentStepData.stack.length - i }}
              >
                {bracket}
              </motion.div>
            ))}
          </AnimatePresence>
          {(!currentStepData?.stack.length || currentStepData.stack.length === 0) && (
            <div className="h-12 w-16 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-500 text-sm">
              Empty
            </div>
          )}
          <div className="text-xs text-slate-500 mt-2">Bottom</div>
          <div className="mt-2 text-sm text-slate-400">
            Size: {currentStepData?.stack.length || 0}
          </div>
        </div>
      </div>
      
      {/* Algorithm Steps */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm</h3>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'start' ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'start' ? 'bg-blue-400' : 'bg-slate-600'}`} />
            1. Initialize empty stack
          </div>
          <div className={`flex items-center gap-2 ${['push', 'pop'].includes(currentStepData?.type || '') ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${['push', 'pop'].includes(currentStepData?.type || '') ? 'bg-blue-400' : 'bg-slate-600'}`} />
            2. For each character: opening → push, closing → check & pop
          </div>
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'match' ? 'text-green-400' : currentStepData?.type === 'mismatch' ? 'text-red-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'match' ? 'bg-green-400' : currentStepData?.type === 'mismatch' ? 'bg-red-400' : 'bg-slate-600'}`} />
            3. Check if brackets match (same type)
          </div>
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'done' ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'done' ? 'bg-blue-400' : 'bg-slate-600'}`} />
            4. Valid if stack is empty at the end
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`w-4 h-4 rounded-full flex-shrink-0 ${
            currentStepData?.isValid === true ? 'bg-green-500' :
            currentStepData?.isValid === false ? 'bg-red-500' :
            currentStepData?.type === 'match' ? 'bg-green-500' :
            currentStepData?.type === 'mismatch' ? 'bg-red-500' :
            currentStepData?.type === 'push' || currentStepData?.type === 'pop' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg flex-1">{currentStepData?.description || 'Ready'}</span>
          {currentStepData?.isValid !== null && (
            <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              currentStepData.isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {currentStepData.isValid ? 'VALID' : 'INVALID'}
            </span>
          )}
        </div>
      </div>
      
      <Controls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onStepBack={() => setCurrentStep(s => Math.max(0, s - 1))}
        onStepForward={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
        onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
        currentStep={currentStep + 1}
        totalSteps={steps.length}
        speed={speed}
        onSpeedChange={setSpeed}
        canStepBack={currentStep > 0}
        canStepForward={currentStep < steps.length - 1}
      />
      
      {/* AI Hints */}
      <Hints problemId="valid-parentheses" className="mt-6" />
      
      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Implementation</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    
    for (char c : s.toCharArray()) {
        // Opening brackets - push to stack
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        }
        // Closing brackets - check match
        else {
            if (stack.isEmpty()) return false;
            
            char top = stack.pop();
            if ((c == ')' && top != '(') ||
                (c == ']' && top != '[') ||
                (c == '}' && top != '{')) {
                return false;
            }
        }
    }
    
    return stack.isEmpty();  // Valid if all matched
}

// Time: O(n), Space: O(n) for stack`}
        </pre>
        
        <div className="mt-4 p-3 bg-slate-900 rounded-lg">
          <h4 className="text-xs font-semibold text-slate-400 mb-2">🎯 Interview Tips</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Stack is perfect for matching/pairing problems</li>
            <li>• Think "Last In, First Out" - most recent opening bracket should match first</li>
            <li>• Handle edge cases: empty string (valid), unmatched brackets</li>
            <li>• This pattern applies to expression parsing, compiler design, etc.</li>
            <li>• Can be optimized to O(1) space for simple parentheses only</li>
          </ul>
        </div>
      </div>
    </div>
  );
}