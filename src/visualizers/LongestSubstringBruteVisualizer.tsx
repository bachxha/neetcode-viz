import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'outer-loop' | 'inner-loop' | 'check-duplicates' | 'no-duplicates' | 'has-duplicates' | 'update-max' | 'done';
  str: string;
  i: number;  // start of substring
  j: number;  // end of substring  
  checkIndex: number;  // current character being checked for duplicates
  currentSubstring: string;
  duplicateChar?: string;
  isDuplicate: boolean;
  currentLength: number;
  maxLength: number;
  maxSubstring: string;
  operations: number;
  description: string;
}

function generateSteps(s: string): Step[] {
  const steps: Step[] = [];
  let operations = 0;
  let maxLength = 0;
  let maxSubstring = '';
  
  if (s.length === 0) {
    steps.push({
      type: 'done',
      str: '',
      i: -1,
      j: -1,
      checkIndex: -1,
      currentSubstring: '',
      isDuplicate: false,
      currentLength: 0,
      maxLength: 0,
      maxSubstring: '',
      operations: 0,
      description: 'Empty string - no substrings to check',
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    str: s,
    i: -1,
    j: -1,
    checkIndex: -1,
    currentSubstring: '',
    isDuplicate: false,
    currentLength: 0,
    maxLength: 0,
    maxSubstring: '',
    operations: 0,
    description: `Brute force: Check ALL ${(s.length * (s.length + 1)) / 2} substrings, verify each for duplicates`,
  });
  
  // Generate all possible substrings
  for (let i = 0; i < s.length; i++) {
    steps.push({
      type: 'outer-loop',
      str: s,
      i,
      j: -1,
      checkIndex: -1,
      currentSubstring: '',
      isDuplicate: false,
      currentLength: 0,
      maxLength,
      maxSubstring,
      operations,
      description: `Outer loop: start index i = ${i}`,
    });
    
    for (let j = i; j < s.length; j++) {
      const currentSubstring = s.substring(i, j + 1);
      operations++;
      
      steps.push({
        type: 'inner-loop',
        str: s,
        i,
        j,
        checkIndex: -1,
        currentSubstring,
        isDuplicate: false,
        currentLength: j - i + 1,
        maxLength,
        maxSubstring,
        operations,
        description: `Substring "${currentSubstring}" (${i},${j}) - checking for duplicates...`,
      });
      
      // Check for duplicates in this substring
      const charSet = new Set<string>();
      let hasDuplicate = false;
      let duplicateChar = '';
      
      for (let k = 0; k < currentSubstring.length; k++) {
        const char = currentSubstring[k];
        operations++;
        
        steps.push({
          type: 'check-duplicates',
          str: s,
          i,
          j,
          checkIndex: k,
          currentSubstring,
          isDuplicate: false,
          currentLength: j - i + 1,
          maxLength,
          maxSubstring,
          operations,
          description: `Checking character '${char}' at position ${k}...`,
        });
        
        if (charSet.has(char)) {
          hasDuplicate = true;
          duplicateChar = char;
          
          steps.push({
            type: 'has-duplicates',
            str: s,
            i,
            j,
            checkIndex: k,
            currentSubstring,
            duplicateChar,
            isDuplicate: true,
            currentLength: j - i + 1,
            maxLength,
            maxSubstring,
            operations,
            description: `Duplicate '${char}' found! Substring "${currentSubstring}" is invalid.`,
          });
          break;
        }
        
        charSet.add(char);
      }
      
      if (!hasDuplicate) {
        steps.push({
          type: 'no-duplicates',
          str: s,
          i,
          j,
          checkIndex: -1,
          currentSubstring,
          isDuplicate: false,
          currentLength: j - i + 1,
          maxLength,
          maxSubstring,
          operations,
          description: `✓ "${currentSubstring}" has no duplicates (length: ${j - i + 1})`,
        });
        
        // Update maximum if this is longer
        if (j - i + 1 > maxLength) {
          maxLength = j - i + 1;
          maxSubstring = currentSubstring;
          
          steps.push({
            type: 'update-max',
            str: s,
            i,
            j,
            checkIndex: -1,
            currentSubstring,
            isDuplicate: false,
            currentLength: j - i + 1,
            maxLength,
            maxSubstring,
            operations,
            description: `New maximum! "${maxSubstring}" with length ${maxLength}`,
          });
        }
      }
    }
  }
  
  steps.push({
    type: 'done',
    str: s,
    i: -1,
    j: -1,
    checkIndex: -1,
    currentSubstring: '',
    isDuplicate: false,
    currentLength: 0,
    maxLength,
    maxSubstring,
    operations,
    description: `Done! Maximum substring: "${maxSubstring}" with length ${maxLength}. Total operations: ${operations}`,
  });
  
  return steps;
}

// Fixed preset for comparison mode
const DEFAULT_STRING = 'abcabcbb';

export function LongestSubstringBruteVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 400 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const step = steps[currentStep];
  
  if (!step) return <div>Loading...</div>;
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="bg-slate-900 rounded-lg p-4 mb-4 flex-1">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Brute Force - O(n³) Time
        </h3>
        
        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
            <div className="text-red-400 font-bold text-lg">{step.operations}</div>
            <div className="text-xs text-slate-400">Operations</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
            <div className="text-blue-400 font-bold text-lg">{step.currentLength}</div>
            <div className="text-xs text-slate-400">Current Length</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
            <div className="text-green-400 font-bold text-lg">{step.maxLength}</div>
            <div className="text-xs text-slate-400">Max Length</div>
          </div>
        </div>
        
        {/* String visualization */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {step.str.split('').map((char, index) => {
            let bgColor = 'bg-slate-700';
            let textColor = 'text-slate-300';
            let borderColor = 'border-slate-600';
            
            // Highlight current substring
            if (step.i >= 0 && step.j >= 0 && index >= step.i && index <= step.j) {
              bgColor = 'bg-blue-500/30';
              borderColor = 'border-blue-400';
              textColor = 'text-blue-100';
            }
            
            // Highlight current character being checked for duplicates
            if (step.checkIndex >= 0 && index === step.i + step.checkIndex) {
              bgColor = 'bg-yellow-500/30';
              borderColor = 'border-yellow-400';
              textColor = 'text-yellow-100';
            }
            
            // Highlight duplicate character
            if (step.isDuplicate && step.duplicateChar === char && index === step.i + step.checkIndex) {
              bgColor = 'bg-red-500/30';
              borderColor = 'border-red-400';
              textColor = 'text-red-100';
            }
            
            // Highlight maximum substring if done
            if (step.type === 'done' && step.maxSubstring && step.str.indexOf(step.maxSubstring) <= index && 
                index < step.str.indexOf(step.maxSubstring) + step.maxSubstring.length) {
              bgColor = 'bg-green-500/30';
              borderColor = 'border-green-400';
              textColor = 'text-green-100';
            }
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: (step.i >= 0 && index >= step.i && index <= step.j) ? 1.1 : 1,
                  y: (step.checkIndex >= 0 && index === step.i + step.checkIndex) ? -2 : 0
                }}
                transition={{ duration: 0.3 }}
                className={`relative w-10 h-10 ${bgColor} ${borderColor} border-2 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${textColor}`}
              >
                {char}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-500">
                  {index}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Current substring info */}
        {step.currentSubstring && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3"
          >
            <span className={`px-3 py-1.5 rounded-lg font-mono text-sm ${
              step.type === 'update-max' ? 'bg-green-500/20 text-green-400' :
              step.isDuplicate ? 'bg-red-500/20 text-red-400' :
              step.type === 'no-duplicates' ? 'bg-green-500/20 text-green-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              Substring: "{step.currentSubstring}" ({step.i},{step.j})
              {step.duplicateChar && ` - Duplicate: '${step.duplicateChar}'`}
            </span>
          </motion.div>
        )}
        
        {/* Loop indicators */}
        {(step.i >= 0 || step.j >= 0) && (
          <div className="text-center text-xs text-slate-400 mb-3">
            {step.i >= 0 && <span className="mr-4">i = {step.i}</span>}
            {step.j >= 0 && <span className="mr-4">j = {step.j}</span>}
            {step.checkIndex >= 0 && <span>checking position {step.checkIndex}</span>}
          </div>
        )}
        
        {/* Max found so far */}
        {step.maxSubstring && (
          <div className="text-center text-sm text-green-400 mb-3">
            Best so far: "{step.maxSubstring}" (length {step.maxLength})
          </div>
        )}
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            step.type === 'done' ? 'bg-green-500' :
            step.type === 'update-max' ? 'bg-green-500' :
            step.type === 'has-duplicates' ? 'bg-red-500' :
            step.type === 'no-duplicates' ? 'bg-green-500' :
            step.type === 'check-duplicates' ? 'bg-yellow-500' :
            'bg-blue-500'
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