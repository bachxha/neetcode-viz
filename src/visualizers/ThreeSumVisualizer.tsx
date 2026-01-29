import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'sort' | 'fix-i' | 'set-pointers' | 'calculate' | 'found-triplet' | 'move-left' | 'move-right' | 'skip-duplicate-i' | 'skip-duplicate-left' | 'skip-duplicate-right' | 'done';
  array: number[];
  originalArray?: number[];
  i: number;
  left: number;
  right: number;
  currentSum: number;
  target: number;
  triplets: number[][];
  description: string;
  skipType?: 'i' | 'left' | 'right';
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  const originalArray = [...nums];
  
  if (nums.length < 3) {
    steps.push({
      type: 'done',
      array: nums,
      i: -1,
      left: -1,
      right: -1,
      currentSum: 0,
      target: 0,
      triplets: [],
      description: 'Need at least 3 numbers to find triplets',
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    array: [...nums],
    originalArray,
    i: -1,
    left: -1,
    right: -1,
    currentSum: 0,
    target: 0,
    triplets: [],
    description: 'Find all unique triplets that sum to 0. First, we need to sort the array.',
  });
  
  // Sort the array
  const sortedArray = [...nums].sort((a, b) => a - b);
  steps.push({
    type: 'sort',
    array: sortedArray,
    originalArray,
    i: -1,
    left: -1,
    right: -1,
    currentSum: 0,
    target: 0,
    triplets: [],
    description: 'Array sorted! Now we can use three pointers: fix i, then use left/right pointers.',
  });
  
  const result: number[][] = [];
  const n = sortedArray.length;
  
  for (let i = 0; i < n - 2; i++) {
    // Skip duplicates for i
    if (i > 0 && sortedArray[i] === sortedArray[i - 1]) {
      steps.push({
        type: 'skip-duplicate-i',
        array: sortedArray,
        originalArray,
        i,
        left: -1,
        right: -1,
        currentSum: 0,
        target: 0,
        triplets: [...result],
        description: `Skip duplicate: ${sortedArray[i]} (already processed in previous iteration)`,
        skipType: 'i',
      });
      continue;
    }
    
    steps.push({
      type: 'fix-i',
      array: sortedArray,
      originalArray,
      i,
      left: -1,
      right: -1,
      currentSum: 0,
      target: 0,
      triplets: [...result],
      description: `Fix first element: nums[${i}] = ${sortedArray[i]}. Need to find two numbers that sum to ${-sortedArray[i]}.`,
    });
    
    let left = i + 1;
    let right = n - 1;
    
    steps.push({
      type: 'set-pointers',
      array: sortedArray,
      originalArray,
      i,
      left,
      right,
      currentSum: 0,
      target: -sortedArray[i],
      triplets: [...result],
      description: `Set left = ${left}, right = ${right}. Look for sum = ${-sortedArray[i]}.`,
    });
    
    while (left < right) {
      const sum = sortedArray[i] + sortedArray[left] + sortedArray[right];
      
      steps.push({
        type: 'calculate',
        array: sortedArray,
        originalArray,
        i,
        left,
        right,
        currentSum: sum,
        target: 0,
        triplets: [...result],
        description: `Sum = ${sortedArray[i]} + ${sortedArray[left]} + ${sortedArray[right]} = ${sum}`,
      });
      
      if (sum === 0) {
        result.push([sortedArray[i], sortedArray[left], sortedArray[right]]);
        
        steps.push({
          type: 'found-triplet',
          array: sortedArray,
          originalArray,
          i,
          left,
          right,
          currentSum: sum,
          target: 0,
          triplets: [...result],
          description: `Found triplet: [${sortedArray[i]}, ${sortedArray[left]}, ${sortedArray[right]}]`,
        });
        
        // Skip duplicates for left
        const oldLeft = left;
        while (left < right && sortedArray[left] === sortedArray[oldLeft]) {
          left++;
          if (left <= right && sortedArray[left - 1] === sortedArray[oldLeft]) {
            steps.push({
              type: 'skip-duplicate-left',
              array: sortedArray,
              originalArray,
              i,
              left,
              right,
              currentSum: 0,
              target: -sortedArray[i],
              triplets: [...result],
              description: `Skip duplicate left: ${sortedArray[left - 1]}`,
              skipType: 'left',
            });
          }
        }
        
        // Skip duplicates for right
        const oldRight = right;
        while (left < right && sortedArray[right] === sortedArray[oldRight]) {
          right--;
          if (left <= right && sortedArray[right + 1] === sortedArray[oldRight]) {
            steps.push({
              type: 'skip-duplicate-right',
              array: sortedArray,
              originalArray,
              i,
              left,
              right,
              currentSum: 0,
              target: -sortedArray[i],
              triplets: [...result],
              description: `Skip duplicate right: ${sortedArray[right + 1]}`,
              skipType: 'right',
            });
          }
        }
      } else if (sum < 0) {
        left++;
        steps.push({
          type: 'move-left',
          array: sortedArray,
          originalArray,
          i,
          left,
          right,
          currentSum: 0,
          target: -sortedArray[i],
          triplets: [...result],
          description: `Sum ${sum} < 0, need larger sum. Move left pointer →`,
        });
      } else {
        right--;
        steps.push({
          type: 'move-right',
          array: sortedArray,
          originalArray,
          i,
          left,
          right,
          currentSum: 0,
          target: -sortedArray[i],
          triplets: [...result],
          description: `Sum ${sum} > 0, need smaller sum. Move right pointer ←`,
        });
      }
    }
  }
  
  steps.push({
    type: 'done',
    array: sortedArray,
    originalArray,
    i: -1,
    left: -1,
    right: -1,
    currentSum: 0,
    target: 0,
    triplets: [...result],
    description: `Algorithm complete! Found ${result.length} unique triplet${result.length !== 1 ? 's' : ''}.`,
  });
  
  return steps;
}

export function ThreeSumVisualizer() {
  const [input, setInput] = useState('-1,0,1,2,-1,-4');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length >= 3 && nums.length <= 15) {
      const newSteps = generateSteps(nums);
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1200 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">3Sum</h1>
        <p className="text-slate-400">
          Find all unique triplets that sum to zero. Sort first, then fix one element 
          and use two pointers on the remaining array.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Numbers (comma-separated):</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
        />
      </div>
      
      {/* Array visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Array Visualization</h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          {currentStepData?.array.map((num, idx) => {
            const isI = idx === currentStepData.i;
            const isLeft = idx === currentStepData.left;
            const isRight = idx === currentStepData.right;
            const isSkipped = (
              (currentStepData.skipType === 'i' && idx === currentStepData.i) ||
              (currentStepData.skipType === 'left' && idx === currentStepData.left - 1) ||
              (currentStepData.skipType === 'right' && idx === currentStepData.right + 1)
            );
            
            return (
              <motion.div
                key={`${idx}-${num}`}
                className={`relative flex flex-col items-center p-3 rounded-lg min-w-[60px] ${
                  isI ? 'bg-blue-500 text-white' :
                  isLeft ? 'bg-green-500 text-white' :
                  isRight ? 'bg-orange-500 text-white' :
                  isSkipped ? 'bg-red-500/30 text-red-400' :
                  'bg-slate-700 text-slate-300'
                }`}
                animate={{
                  scale: isI || isLeft || isRight ? 1.1 : isSkipped ? 0.9 : 1,
                  opacity: isSkipped ? 0.6 : 1,
                }}
              >
                {/* Pointer labels */}
                {isI && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-6 text-blue-300 font-bold text-xs"
                  >
                    i
                  </motion.div>
                )}
                {isLeft && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-6 text-green-300 font-bold text-xs"
                  >
                    L
                  </motion.div>
                )}
                {isRight && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-6 text-orange-300 font-bold text-xs"
                  >
                    R
                  </motion.div>
                )}
                
                <span className="font-mono font-bold">{num}</span>
                <span className="text-xs opacity-60">{idx}</span>
              </motion.div>
            );
          })}
        </div>
        
        {/* Original array reference */}
        {currentStepData?.originalArray && currentStepData.type !== 'start' && (
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Original: [{currentStepData.originalArray.join(', ')}]</div>
          </div>
        )}
      </div>
      
      {/* Current calculation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Sum</h3>
          {currentStepData?.type === 'calculate' && (
            <div className="space-y-2">
              <div className="text-center font-mono text-sm">
                <span className="text-blue-400">{currentStepData.array[currentStepData.i]}</span>
                <span className="text-slate-400"> + </span>
                <span className="text-green-400">{currentStepData.array[currentStepData.left]}</span>
                <span className="text-slate-400"> + </span>
                <span className="text-orange-400">{currentStepData.array[currentStepData.right]}</span>
              </div>
              <div className="text-center text-2xl font-bold">
                <span className={`${
                  currentStepData.currentSum === 0 ? 'text-green-400' :
                  currentStepData.currentSum < 0 ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {currentStepData.currentSum}
                </span>
              </div>
              <div className="text-center text-sm text-slate-400">
                Target: {currentStepData.target}
              </div>
            </div>
          )}
          {currentStepData?.type !== 'calculate' && (
            <span className="text-slate-500">-</span>
          )}
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Target Sum</h3>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">0</div>
            <div className="text-sm text-slate-400">Find triplets that sum to zero</div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Found Triplets</h3>
          <div className="text-2xl font-bold text-green-400 mb-2">{currentStepData?.triplets.length || 0}</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {currentStepData?.triplets.map((triplet, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-xs font-mono text-slate-300 bg-slate-700 px-2 py-1 rounded"
              >
                [{triplet.join(', ')}]
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'done' ? 'bg-green-500' :
            currentStepData?.type === 'found-triplet' ? 'bg-green-500' :
            currentStepData?.type === 'sort' ? 'bg-purple-500' :
            currentStepData?.type === 'fix-i' ? 'bg-blue-500' :
            currentStepData?.type === 'set-pointers' ? 'bg-cyan-500' :
            currentStepData?.skipType ? 'bg-red-500' :
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
{`public List<List<Integer>> threeSum(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums); // Sort the array first
    
    for (int i = 0; i < nums.length - 2; i++) {
        // Skip duplicates for the first element
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        
        int left = i + 1;
        int right = nums.length - 1;
        
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            
            if (sum == 0) {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                
                // Skip duplicates for left and right pointers
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < 0) {
                left++;  // Need larger sum
            } else {
                right--; // Need smaller sum  
            }
        }
    }
    
    return result;
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="space-y-2 text-slate-300">
          <p><strong>1. Sort the array:</strong> Enables two-pointer technique and easy duplicate handling.</p>
          <p><strong>2. Fix first element (i):</strong> For each i, find pairs that sum to -nums[i].</p>
          <p><strong>3. Two pointers (left, right):</strong> Search remaining array for target sum.</p>
          <p><strong>4. Skip duplicates:</strong> Avoid duplicate triplets by skipping repeated values.</p>
          <p><strong>Time complexity:</strong> O(n²) - O(n log n) for sorting + O(n²) for two pointers.</p>
          <p><strong>Space complexity:</strong> O(1) excluding output array.</p>
        </div>
      </div>
    </div>
  );
}