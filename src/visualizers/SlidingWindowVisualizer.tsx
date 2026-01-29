import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'expand' | 'shrink' | 'update-best' | 'done';
  s: string;
  left: number;
  right: number;
  charSet: Set<string>;
  bestStart: number;
  bestLength: number;
  description: string;
}

function generateSteps(s: string): Step[] {
  const steps: Step[] = [];
  
  if (s.length === 0) {
    steps.push({
      type: 'done',
      s: '',
      left: 0,
      right: 0,
      charSet: new Set(),
      bestStart: 0,
      bestLength: 0,
      description: 'Empty string - no substring possible',
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    s,
    left: 0,
    right: 0,
    charSet: new Set(),
    bestStart: 0,
    bestLength: 0,
    description: 'Find longest substring without repeating characters',
  });
  
  const charSet = new Set<string>();
  let left = 0;
  let bestStart = 0;
  let bestLength = 0;
  
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    
    // Shrink window while we have a duplicate
    while (charSet.has(char)) {
      const leftChar = s[left];
      charSet.delete(leftChar);
      left++;
      
      steps.push({
        type: 'shrink',
        s,
        left,
        right,
        charSet: new Set(charSet),
        bestStart,
        bestLength,
        description: `Duplicate '${char}' found! Remove '${leftChar}' and shrink window`,
      });
    }
    
    // Add current character
    charSet.add(char);
    
    steps.push({
      type: 'expand',
      s,
      left,
      right,
      charSet: new Set(charSet),
      bestStart,
      bestLength,
      description: `Add '${char}' to window. Current window: "${s.substring(left, right + 1)}" (length ${right - left + 1})`,
    });
    
    // Update best if current is longer
    if (right - left + 1 > bestLength) {
      bestLength = right - left + 1;
      bestStart = left;
      
      steps.push({
        type: 'update-best',
        s,
        left,
        right,
        charSet: new Set(charSet),
        bestStart,
        bestLength,
        description: `New best! "${s.substring(bestStart, bestStart + bestLength)}" with length ${bestLength}`,
      });
    }
  }
  
  steps.push({
    type: 'done',
    s,
    left,
    right: s.length - 1,
    charSet: new Set(charSet),
    bestStart,
    bestLength,
    description: `Answer: "${s.substring(bestStart, bestStart + bestLength)}" with length ${bestLength}`,
  });
  
  return steps;
}

export function SlidingWindowVisualizer() {
  const [input, setInput] = useState('abcabcbb');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const s = input.trim();
    if (s.length <= 20) {
      const newSteps = generateSteps(s);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [input]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 800 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Longest Substring Without Repeating Characters</h1>
        <p className="text-slate-400">
          Use sliding window to track the longest substring with all unique characters.
          Expand right, shrink left when duplicates found.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Input string:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          maxLength={20}
        />
      </div>
      
      {/* String visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">String (Sliding Window)</h3>
        <div className="flex gap-1 justify-center flex-wrap mb-4">
          {currentStepData?.s.split('').map((char, i) => {
            const inWindow = i >= currentStepData.left && i <= currentStepData.right;
            const isBest = i >= currentStepData.bestStart && i < currentStepData.bestStart + currentStepData.bestLength;
            const isLeft = i === currentStepData.left;
            const isRight = i === currentStepData.right;
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                animate={{ scale: inWindow ? 1.1 : 1 }}
              >
                <div className="text-xs text-slate-500 mb-1">{i}</div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg relative ${
                  inWindow ? 'bg-blue-500 text-white' :
                  isBest && currentStepData.type === 'done' ? 'bg-green-500 text-white' :
                  'bg-slate-700'
                }`}>
                  {char}
                  {isLeft && inWindow && (
                    <div className="absolute -top-6 text-xs text-yellow-400 font-normal">L</div>
                  )}
                  {isRight && inWindow && (
                    <div className="absolute -bottom-6 text-xs text-yellow-400 font-normal">R</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Window bracket visualization */}
        {currentStepData && currentStepData.s.length > 0 && (
          <div className="flex justify-center mt-2">
            <div className="text-center">
              <span className="text-slate-400">Current window: </span>
              <span className="font-mono text-blue-400 text-lg">
                "{currentStepData.s.substring(currentStepData.left, currentStepData.right + 1)}"
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Character set */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Character Set (unique chars in window)</h3>
        <div className="flex gap-2 justify-center flex-wrap min-h-[40px]">
          {currentStepData && Array.from(currentStepData.charSet).map((char) => (
            <motion.div
              key={char}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center font-bold"
            >
              {char}
            </motion.div>
          ))}
          {currentStepData?.charSet.size === 0 && (
            <span className="text-slate-500 italic">Empty</span>
          )}
        </div>
      </div>
      
      {/* Best substring */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Best Substring Found</h3>
        <div className="flex items-center justify-center gap-4">
          <span className="font-mono text-green-400 text-2xl">
            "{currentStepData?.s.substring(currentStepData.bestStart, currentStepData.bestStart + currentStepData.bestLength) || ''}"
          </span>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg">
            Length: {currentStepData?.bestLength || 0}
          </span>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'done' ? 'bg-green-500' :
            currentStepData?.type === 'shrink' ? 'bg-red-500' :
            currentStepData?.type === 'update-best' ? 'bg-green-500' :
            'bg-yellow-500'
          }`} />
          <span className="text-lg">{currentStepData?.description || 'Ready'}</span>
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
      
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int lengthOfLongestSubstring(String s) {
    Set<Character> charSet = new HashSet<>();
    int left = 0;
    int maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        // Shrink window while duplicate exists
        while (charSet.contains(s.charAt(right))) {
            charSet.remove(s.charAt(left));
            left++;
        }
        
        // Add current char and update max
        charSet.add(s.charAt(right));
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Key Insight</h3>
        <p className="text-slate-300">
          The sliding window pattern uses two pointers (left and right) to define a "window" 
          that expands and contracts. We expand by moving <code className="text-blue-400">right</code>, 
          and shrink by moving <code className="text-yellow-400">left</code> when our constraint 
          is violated (duplicate character in this case).
        </p>
      </div>
    </div>
  );
}
