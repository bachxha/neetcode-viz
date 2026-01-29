import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'expand' | 'duplicate-found' | 'shrink' | 'update-max' | 'done';
  str: string;
  left: number;
  right: number;
  charSet: Set<string>;
  currentLength: number;
  maxLength: number;
  maxStart: number;
  maxEnd: number;
  duplicateChar?: string;
  description: string;
}

function generateSteps(s: string): Step[] {
  const steps: Step[] = [];
  
  if (s.length === 0) {
    steps.push({
      type: 'done',
      str: '',
      left: 0,
      right: 0,
      charSet: new Set(),
      currentLength: 0,
      maxLength: 0,
      maxStart: 0,
      maxEnd: 0,
      description: 'Empty string - no characters to process',
    });
    return steps;
  }
  
  const charSet = new Set<string>();
  let left = 0;
  let maxLength = 0;
  let maxStart = 0;
  let maxEnd = 0;
  
  steps.push({
    type: 'start',
    str: s,
    left: 0,
    right: 0,
    charSet: new Set(),
    currentLength: 0,
    maxLength: 0,
    maxStart: 0,
    maxEnd: 0,
    description: 'Start with both pointers at the beginning. Use HashSet to track characters in current window.',
  });
  
  for (let right = 0; right < s.length; right++) {
    const currentChar = s[right];
    
    // If character is already in the set, we found a duplicate
    while (charSet.has(currentChar)) {
      const duplicateChar = currentChar;
      
      steps.push({
        type: 'duplicate-found',
        str: s,
        left,
        right,
        charSet: new Set(charSet),
        currentLength: right - left,
        maxLength,
        maxStart,
        maxEnd,
        duplicateChar,
        description: `Duplicate '${duplicateChar}' found! Character '${currentChar}' already exists in our window. Need to shrink from left.`,
      });
      
      // Remove leftmost character and move left pointer
      const leftChar = s[left];
      charSet.delete(leftChar);
      left++;
      
      steps.push({
        type: 'shrink',
        str: s,
        left,
        right,
        charSet: new Set(charSet),
        currentLength: right - left,
        maxLength,
        maxStart,
        maxEnd,
        description: `Removed '${leftChar}' from window and moved left pointer to ${left}. Window now: "${s.substring(left, right)}"`,
      });
    }
    
    // Add current character to the set
    charSet.add(currentChar);
    const currentLength = right - left + 1;
    
    steps.push({
      type: 'expand',
      str: s,
      left,
      right,
      charSet: new Set(charSet),
      currentLength,
      maxLength,
      maxStart,
      maxEnd,
      description: `Added '${currentChar}' to window. Current window: "${s.substring(left, right + 1)}" (length: ${currentLength})`,
    });
    
    // Update maximum if current window is larger
    if (currentLength > maxLength) {
      maxLength = currentLength;
      maxStart = left;
      maxEnd = right;
      
      steps.push({
        type: 'update-max',
        str: s,
        left,
        right,
        charSet: new Set(charSet),
        currentLength,
        maxLength,
        maxStart,
        maxEnd,
        description: `New maximum length found! "${s.substring(maxStart, maxEnd + 1)}" has length ${maxLength}`,
      });
    }
  }
  
  steps.push({
    type: 'done',
    str: s,
    left,
    right: s.length - 1,
    charSet: new Set(charSet),
    currentLength: s.length - left,
    maxLength,
    maxStart,
    maxEnd,
    description: `Algorithm complete! Longest substring without repeating characters is "${s.substring(maxStart, maxEnd + 1)}" with length ${maxLength}`,
  });
  
  return steps;
}

export function LongestSubstringWithoutRepeatingVisualizer() {
  const [inputStr, setInputStr] = useState('abcabcbb');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    if (inputStr.trim().length <= 50) { // Reasonable limit for visualization
      const newSteps = generateSteps(inputStr.trim());
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [inputStr]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  if (!currentStepData) return <div>Loading...</div>;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Longest Substring Without Repeating Characters</h1>
        <p className="text-slate-400">
          Use sliding window technique with a HashSet to find the longest substring without repeating characters.
          Expand the right pointer to grow the window, shrink from left when duplicates are found.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Input string:</label>
        <input
          type="text"
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          placeholder="abcabcbb"
        />
      </div>
      
      {/* String visualization with sliding window */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">String Characters & Sliding Window</h3>
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {currentStepData.str.split('').map((char, index) => {
            let bgColor = 'bg-slate-700'; // default
            let textColor = 'text-slate-300';
            let borderColor = 'border-slate-600';
            
            // Determine character color based on current state
            if (index >= currentStepData.left && index <= currentStepData.right) {
              // Character is in current window
              bgColor = 'bg-blue-500/30';
              borderColor = 'border-blue-400';
              textColor = 'text-blue-100';
            }
            
            if (currentStepData.duplicateChar === char && 
                currentStepData.type === 'duplicate-found' && 
                index === currentStepData.right) {
              // Duplicate character being processed
              bgColor = 'bg-red-500/30';
              borderColor = 'border-red-400';
              textColor = 'text-red-100';
            }
            
            // Highlight the longest substring found so far
            if (currentStepData.type === 'done' && 
                index >= currentStepData.maxStart && 
                index <= currentStepData.maxEnd) {
              bgColor = 'bg-green-500/30';
              borderColor = 'border-green-400';
              textColor = 'text-green-100';
            }
            
            // Pointer indicators
            const isLeftPointer = index === currentStepData.left && currentStepData.str.length > 0;
            const isRightPointer = index === currentStepData.right && currentStepData.str.length > 0;
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: (isLeftPointer || isRightPointer) ? 1.2 : 1,
                  y: (isLeftPointer || isRightPointer) ? -2 : 0
                }}
                transition={{ duration: 0.3 }}
                className={`relative w-12 h-12 ${bgColor} ${borderColor} border-2 rounded-lg flex items-center justify-center font-mono font-bold text-lg ${textColor}`}
              >
                {char}
                
                {/* Pointer labels */}
                {isLeftPointer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-400 font-semibold whitespace-nowrap"
                  >
                    L ({currentStepData.left})
                  </motion.div>
                )}
                
                {isRightPointer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-400 font-semibold whitespace-nowrap"
                  >
                    R ({currentStepData.right})
                  </motion.div>
                )}
                
                {/* Index labels */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-slate-500">
                  {index}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Window indicator */}
        {currentStepData.str.length > 0 && (
          <div className="text-center text-sm text-slate-400">
            Current window: <span className="text-blue-400 font-mono">
              "{currentStepData.str.substring(currentStepData.left, currentStepData.right + 1)}"
            </span> 
            (indices {currentStepData.left} to {currentStepData.right})
          </div>
        )}
      </div>
      
      {/* HashSet visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          HashSet - Characters in Current Window
        </h3>
        <div className="flex flex-wrap gap-2 min-h-[60px] items-center justify-center">
          {currentStepData.charSet.size > 0 ? (
            Array.from(currentStepData.charSet).map((char) => (
              <motion.div
                key={char}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.4 }}
                className="w-10 h-10 bg-green-500/30 border-2 border-green-400 rounded-lg flex items-center justify-center font-mono font-bold text-green-100"
              >
                {char}
              </motion.div>
            ))
          ) : (
            <div className="text-slate-500 italic">HashSet is empty</div>
          )}
        </div>
        <div className="text-center text-sm text-slate-400 mt-2">
          Set size: {currentStepData.charSet.size}
        </div>
      </div>
      
      {/* Current state display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Sliding Window</h3>
          <div className="text-lg font-bold text-blue-400 mb-1">
            Left: {currentStepData.left} → Right: {currentStepData.right}
          </div>
          <div className="text-sm text-slate-300">
            Window: "{currentStepData.str.substring(currentStepData.left, currentStepData.right + 1)}"
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Length</h3>
          <div className="text-2xl font-bold text-yellow-400">
            {currentStepData.currentLength}
          </div>
          <div className="text-sm text-slate-300">
            Characters in window
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Max Length</h3>
          <div className="text-2xl font-bold text-green-400">
            {currentStepData.maxLength}
          </div>
          {currentStepData.maxLength > 0 && (
            <div className="text-sm text-slate-300">
              "{currentStepData.str.substring(currentStepData.maxStart, currentStepData.maxEnd + 1)}"
            </div>
          )}
        </div>
      </div>
      
      {/* Algorithm explanation */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData.type === 'done' ? 'bg-green-500' :
            currentStepData.type === 'expand' ? 'bg-blue-500' :
            currentStepData.type === 'duplicate-found' ? 'bg-red-500' :
            currentStepData.type === 'shrink' ? 'bg-orange-500' :
            currentStepData.type === 'update-max' ? 'bg-green-500' :
            'bg-gray-500'
          }`} />
          <span className="text-sm font-semibold text-slate-400">
            {currentStepData.type === 'start' ? 'Initialize' :
             currentStepData.type === 'expand' ? 'Expand Window' :
             currentStepData.type === 'duplicate-found' ? 'Duplicate Found' :
             currentStepData.type === 'shrink' ? 'Shrink Window' :
             currentStepData.type === 'update-max' ? 'Update Maximum' :
             'Algorithm Complete'}
          </span>
        </div>
        <p className="text-slate-300">{currentStepData.description}</p>
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
      
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int lengthOfLongestSubstring(String s) {
    if (s.length() == 0) return 0;
    
    HashSet<Character> set = new HashSet<>();
    int left = 0, maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        char currentChar = s.charAt(right);
        
        // Shrink window from left while duplicate exists
        while (set.contains(currentChar)) {
            set.remove(s.charAt(left));
            left++;
        }
        
        // Add current character and update max length
        set.add(currentChar);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Sliding Window Approach</h3>
        <p className="text-slate-300">
          This problem demonstrates the <strong>classic sliding window pattern</strong>:
          <br />• <code className="text-blue-400">Right pointer</code> expands the window by adding new characters
          <br />• <code className="text-orange-400">Left pointer</code> shrinks the window when duplicates are found
          <br />• <code className="text-green-400">HashSet</code> tracks characters in the current window for O(1) lookups
          <br />• <code className="text-yellow-400">maxLength</code> keeps track of the best solution seen so far
          <br />
          <br />Time Complexity: <strong>O(n)</strong> - each character is added and removed at most once
          <br />Space Complexity: <strong>O(min(m,n))</strong> - where m is charset size, n is string length
        </p>
      </div>
    </div>
  );
}