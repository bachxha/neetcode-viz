import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'compare' | 'search-left' | 'search-right' | 'found' | 'not-found';
  array: number[];
  left: number;
  right: number;
  mid: number;
  target: number;
  foundIndex: number;
  description: string;
}

function generateSteps(array: number[], target: number): Step[] {
  const steps: Step[] = [];
  
  if (array.length === 0) {
    steps.push({
      type: 'not-found',
      array,
      left: -1,
      right: -1,
      mid: -1,
      target,
      foundIndex: -1,
      description: 'Empty array - target not found',
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    array,
    left: 0,
    right: array.length - 1,
    mid: Math.floor((0 + array.length - 1) / 2),
    target,
    foundIndex: -1,
    description: `Search for ${target} in sorted array. Set left=0, right=${array.length - 1}`,
  });
  
  let left = 0;
  let right = array.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      type: 'compare',
      array,
      left,
      right,
      mid,
      target,
      foundIndex: -1,
      description: `Mid = (${left} + ${right}) / 2 = ${mid}. Compare array[${mid}] = ${array[mid]} with target ${target}`,
    });
    
    if (array[mid] === target) {
      steps.push({
        type: 'found',
        array,
        left,
        right,
        mid,
        target,
        foundIndex: mid,
        description: `Found! array[${mid}] = ${array[mid]} equals target ${target}. Return index ${mid}.`,
      });
      return steps;
    } else if (array[mid] < target) {
      const oldLeft = left;
      left = mid + 1;
      steps.push({
        type: 'search-right',
        array,
        left,
        right,
        mid,
        target,
        foundIndex: -1,
        description: `${array[mid]} < ${target}. Target is in right half. Set left = ${mid} + 1 = ${left}`,
      });
    } else {
      const oldRight = right;
      right = mid - 1;
      steps.push({
        type: 'search-left',
        array,
        left,
        right,
        mid,
        target,
        foundIndex: -1,
        description: `${array[mid]} > ${target}. Target is in left half. Set right = ${mid} - 1 = ${right}`,
      });
    }
  }
  
  steps.push({
    type: 'not-found',
    array,
    left,
    right,
    mid: -1,
    target,
    foundIndex: -1,
    description: `left > right (${left} > ${right}). Target ${target} not found. Return -1.`,
  });
  
  return steps;
}

export function BinarySearchVisualizer() {
  const [arrayInput, setArrayInput] = useState('-1,0,3,5,9,12');
  const [targetInput, setTargetInput] = useState('9');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const array = arrayInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const target = parseInt(targetInput.trim());
    
    if (!isNaN(target) && array.length <= 20) {
      // Sort the array to ensure it's sorted for binary search
      const sortedArray = [...array].sort((a, b) => a - b);
      const newSteps = generateSteps(sortedArray, target);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [arrayInput, targetInput]);
  
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
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Binary Search</h1>
        <p className="text-slate-400">
          Search for a target value in a sorted array by repeatedly dividing the search space in half.
          Time complexity: O(log n)
        </p>
      </div>
      
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-2">Array (comma-separated):</label>
          <input
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            placeholder="e.g., -1,0,3,5,9,12"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-2">Target:</label>
          <input
            type="text"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            placeholder="e.g., 9"
          />
        </div>
      </div>
      
      {/* Array visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Array Visualization</h3>
        <div className="flex items-center justify-center gap-2 flex-wrap" style={{ minHeight: '120px' }}>
          {currentStepData?.array.map((value, i) => {
            const isLeft = i === currentStepData.left;
            const isMid = i === currentStepData.mid;
            const isRight = i === currentStepData.right;
            const isFound = i === currentStepData.foundIndex;
            const inSearchSpace = i >= currentStepData.left && i <= currentStepData.right;
            
            let bgColor = 'bg-slate-600';
            let textColor = 'text-white';
            let label = '';
            
            if (isFound) {
              bgColor = 'bg-green-500';
              label = '✓';
            } else if (isMid) {
              bgColor = 'bg-blue-500';
              label = 'M';
              textColor = 'text-white';
            } else if (isLeft) {
              bgColor = 'bg-yellow-500';
              label = 'L';
              textColor = 'text-black';
            } else if (isRight) {
              bgColor = 'bg-cyan-500';
              label = 'R';
              textColor = 'text-black';
            } else if (inSearchSpace) {
              bgColor = 'bg-slate-500';
            } else {
              bgColor = 'bg-slate-700';
              textColor = 'text-slate-400';
            }
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center relative"
                animate={{ 
                  scale: isMid ? 1.1 : isLeft || isRight ? 1.05 : 1,
                  opacity: inSearchSpace || currentStepData.type === 'start' ? 1 : 0.6
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Pointer labels */}
                {label && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`absolute -top-8 font-bold text-sm ${
                      label === 'L' ? 'text-yellow-400' :
                      label === 'R' ? 'text-cyan-400' :
                      label === 'M' ? 'text-blue-400' :
                      'text-green-400'
                    }`}
                  >
                    {label}
                  </motion.div>
                )}
                
                {/* Array element */}
                <motion.div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${bgColor} ${textColor}`}
                  animate={{ backgroundColor: bgColor.replace('bg-', '') }}
                >
                  {value}
                </motion.div>
                
                <span className="text-xs text-slate-400 mt-1">[{i}]</span>
              </motion.div>
            );
          })}
        </div>
        
        {/* Search space indicator */}
        {currentStepData && currentStepData.type !== 'not-found' && currentStepData.left >= 0 && currentStepData.right >= 0 && (
          <div className="mt-4 text-center">
            <span className="text-sm text-slate-400">
              Current search space: [{currentStepData.left}, {currentStepData.right}]
              {currentStepData.type !== 'start' && ` (${currentStepData.right - currentStepData.left + 1} elements)`}
            </span>
          </div>
        )}
      </div>
      
      {/* Current calculation */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current State</h3>
          {currentStepData && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Target:</span>
                <span className="font-mono text-blue-400">{currentStepData.target}</span>
              </div>
              {currentStepData.type !== 'start' && currentStepData.left >= 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Left:</span>
                    <span className="font-mono text-yellow-400">{currentStepData.left}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Right:</span>
                    <span className="font-mono text-cyan-400">{currentStepData.right}</span>
                  </div>
                  {currentStepData.mid >= 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mid:</span>
                        <span className="font-mono text-blue-400">{currentStepData.mid}</span>
                      </div>
                      {currentStepData.type === 'compare' && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Value:</span>
                          <span className="font-mono">{currentStepData.array[currentStepData.mid]}</span>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Result</h3>
          <div className={`text-3xl font-bold ${
            currentStepData?.type === 'found' ? 'text-green-400' :
            currentStepData?.type === 'not-found' ? 'text-red-400' :
            'text-slate-500'
          }`}>
            {currentStepData?.foundIndex >= 0 ? currentStepData.foundIndex :
             currentStepData?.type === 'not-found' ? '-1' : '?'}
          </div>
          {currentStepData?.type === 'found' && (
            <div className="text-sm text-slate-400 mt-1">
              Found at index {currentStepData.foundIndex}
            </div>
          )}
          {currentStepData?.type === 'not-found' && (
            <div className="text-sm text-slate-400 mt-1">
              Target not found
            </div>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'found' ? 'bg-green-500' :
            currentStepData?.type === 'not-found' ? 'bg-red-500' :
            currentStepData?.type === 'search-left' ? 'bg-yellow-500' :
            currentStepData?.type === 'search-right' ? 'bg-cyan-500' :
            'bg-blue-500'
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
{`public int search(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    
    while (left <= right) {
        // Calculate mid point to avoid overflow
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            return mid; // Found target
        } else if (nums[mid] < target) {
            left = mid + 1; // Search right half
        } else {
            right = mid - 1; // Search left half
        }
    }
    
    return -1; // Target not found
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">How Binary Search Works</h3>
        <div className="space-y-2 text-slate-300">
          <p>
            <strong>1. Divide:</strong> Calculate the middle index of the current search space.
          </p>
          <p>
            <strong>2. Compare:</strong> Check if the middle element equals the target.
          </p>
          <p>
            <strong>3. Conquer:</strong> If not equal, eliminate half of the search space:
          </p>
          <ul className="ml-4 space-y-1 text-slate-400">
            <li>• If middle &lt; target → search right half (target is larger)</li>
            <li>• If middle &gt; target → search left half (target is smaller)</li>
          </ul>
          <p>
            <strong>4. Repeat:</strong> Continue until target is found or search space is empty.
          </p>
          <p className="text-blue-400">
            ⚡ <strong>Time Complexity:</strong> O(log n) - we halve the search space each step!
          </p>
        </div>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Edge Cases to Remember</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-white mb-1">Input Validation</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• Empty array → return -1</li>
              <li>• Array must be sorted</li>
              <li>• Handle integer overflow in mid calculation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Boundary Conditions</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• Target at first index</li>
              <li>• Target at last index</li>
              <li>• Single element array</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}