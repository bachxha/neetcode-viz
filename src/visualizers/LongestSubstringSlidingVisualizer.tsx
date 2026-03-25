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
  steps: number;
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
      steps: 0,
      description: 'Empty string - no characters to process',
    });
    return steps;
  }
  
  const charSet = new Set<string>();
  let left = 0;
  let maxLength = 0;
  let maxStart = 0;
  let maxEnd = 0;
  let stepCount = 0;
  
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
    steps: 0,
    description: 'Start with both pointers at beginning. Use Set to track characters in window.',
  });
  
  for (let right = 0; right < s.length; right++) {
    const currentChar = s[right];
    stepCount++;
    
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
        steps: stepCount,
        description: `Duplicate '${duplicateChar}' found! Need to shrink window from left.`,
      });
      
      // Remove leftmost character and move left pointer
      charSet.delete(s[left]);
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
        steps: stepCount,
        description: `Removed '${s[left - 1]}', moved left to ${left}. Window: "${s.substring(left, right)}"`,
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
      steps: stepCount,
      description: `Added '${currentChar}'. Window: "${s.substring(left, right + 1)}" (length: ${currentLength})`,
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
        steps: stepCount,
        description: `New maximum! "${s.substring(maxStart, maxEnd + 1)}" has length ${maxLength}`,
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
    steps: stepCount,
    description: `Done! Longest substring: "${s.substring(maxStart, maxEnd + 1)}" with length ${maxLength}. Only ${stepCount} steps!`,
  });
  
  return steps;
}

// Same preset as brute force for fair comparison
const DEFAULT_STRING = 'abcabcbb';

export function LongestSubstringSlidingVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  
  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(DEFAULT_STRING);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);
  
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
  
  const step = steps[currentStep];
  
  if (!step) return <div>Loading...</div>;
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="bg-slate-900 rounded-lg p-4 mb-4 flex-1">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Sliding Window - O(n) Time
        </h3>
        
        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
            <div className="text-green-400 font-bold text-lg">{step.steps}</div>
            <div className="text-xs text-slate-400">Steps</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
            <div className="text-blue-400 font-bold text-lg">{step.currentLength}</div>
            <div className="text-xs text-slate-400">Current Length</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
            <div className="text-purple-400 font-bold text-lg">{step.maxLength}</div>
            <div className="text-xs text-slate-400">Max Length</div>
          </div>
        </div>
        
        {/* String visualization with sliding window */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {step.str.split('').map((char, index) => {
            let bgColor = 'bg-slate-700';
            let textColor = 'text-slate-300';
            let borderColor = 'border-slate-600';
            
            // Current window
            if (index >= step.left && index <= step.right) {
              bgColor = 'bg-blue-500/30';
              borderColor = 'border-blue-400';
              textColor = 'text-blue-100';
            }
            
            // Duplicate character being processed
            if (step.duplicateChar === char && step.type === 'duplicate-found' && index === step.right) {
              bgColor = 'bg-red-500/30';
              borderColor = 'border-red-400';
              textColor = 'text-red-100';
            }
            
            // Best substring found (when done)
            if (step.type === 'done' && index >= step.maxStart && index <= step.maxEnd) {
              bgColor = 'bg-green-500/30';
              borderColor = 'border-green-400';
              textColor = 'text-green-100';
            }
            
            // Pointer indicators
            const isLeft = index === step.left && step.str.length > 0;
            const isRight = index === step.right && step.str.length > 0;
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: (isLeft || isRight) ? 1.1 : 1,
                  y: (isLeft || isRight) ? -2 : 0
                }}
                transition={{ duration: 0.3 }}
                className={`relative w-10 h-10 ${bgColor} ${borderColor} border-2 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${textColor}`}
              >
                {char}
                
                {/* Pointer labels */}
                {isLeft && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-blue-400 font-semibold"
                  >
                    L
                  </motion.div>
                )}
                
                {isRight && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-cyan-400 font-semibold"
                  >
                    R
                  </motion.div>
                )}
                
                {/* Index labels */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-slate-500">
                  {index}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Current window info */}
        <div className="text-center text-sm text-slate-400 mb-4">
          Current window: <span className="text-blue-400 font-mono">
            "{step.str.substring(step.left, step.right + 1)}"
          </span> 
          (L:{step.left} → R:{step.right})
        </div>
        
        {/* Set visualization */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-2 text-center">
            Character Set (O(1) lookup)
          </h4>
          <div className="flex flex-wrap gap-2 min-h-[40px] items-center justify-center">
            {step.charSet.size > 0 ? (
              Array.from(step.charSet).map((char) => (
                <motion.div
                  key={char}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 bg-green-500/20 border border-green-500/50 rounded flex items-center justify-center font-mono font-bold text-xs text-green-300"
                >
                  {char}
                </motion.div>
              ))
            ) : (
              <div className="text-slate-500 italic text-sm">Set is empty</div>
            )}
          </div>
          <div className="text-center text-xs text-slate-400 mt-1">
            Size: {step.charSet.size}
          </div>
        </div>
        
        {/* Best substring indicator */}
        {step.maxLength > 0 && (
          <div className="text-center text-sm text-green-400 mb-3">
            Best found: "{step.str.substring(step.maxStart, step.maxEnd + 1)}" (length {step.maxLength})
          </div>
        )}
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            step.type === 'done' ? 'bg-green-500' :
            step.type === 'update-max' ? 'bg-green-500' :
            step.type === 'duplicate-found' ? 'bg-red-500' :
            step.type === 'shrink' ? 'bg-orange-500' :
            step.type === 'expand' ? 'bg-blue-500' :
            'bg-yellow-500'
          }`} />
          <span className="text-sm">{step.description}</span>
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
    </div>
  );
}