import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface BubbleSortStep {
  type: 'start' | 'compare' | 'swap' | 'no-swap' | 'pass-complete' | 'done';
  array: number[];
  i: number;
  j: number;
  swaps: number;
  comparisons: number;
  description: string;
  passNumber: number;
  sorted: boolean[];
}

interface MergeSortStep {
  type: 'start' | 'divide' | 'merge' | 'compare' | 'place' | 'done';
  array: number[];
  left: number;
  right: number;
  mid: number;
  leftArray: number[];
  rightArray: number[];
  leftIndex: number;
  rightIndex: number;
  merging: number[];
  comparisons: number;
  description: string;
  depth: number;
}

function generateBubbleSortSteps(array: number[]): BubbleSortStep[] {
  const steps: BubbleSortStep[] = [];
  const arr = [...array];
  const n = arr.length;
  let swaps = 0;
  let comparisons = 0;
  const sorted = new Array(n).fill(false);
  
  steps.push({
    type: 'start',
    array: [...arr],
    i: -1,
    j: -1,
    swaps,
    comparisons,
    description: `Bubble Sort: Compare adjacent elements and bubble largest to end`,
    passNumber: 0,
    sorted: [...sorted]
  });
  
  for (let i = 0; i < n - 1; i++) {
    let hasSwapped = false;
    
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      
      steps.push({
        type: 'compare',
        array: [...arr],
        i,
        j,
        swaps,
        comparisons,
        description: `Pass ${i + 1}: Compare ${arr[j]} and ${arr[j + 1]}`,
        passNumber: i + 1,
        sorted: [...sorted]
      });
      
      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        hasSwapped = true;
        
        steps.push({
          type: 'swap',
          array: [...arr],
          i,
          j,
          swaps,
          comparisons,
          description: `${arr[j + 1]} < ${arr[j]}, swap them`,
          passNumber: i + 1,
          sorted: [...sorted]
        });
      } else {
        steps.push({
          type: 'no-swap',
          array: [...arr],
          i,
          j,
          swaps,
          comparisons,
          description: `${arr[j]} ≤ ${arr[j + 1]}, no swap needed`,
          passNumber: i + 1,
          sorted: [...sorted]
        });
      }
    }
    
    // Mark the last element as sorted
    sorted[n - i - 1] = true;
    
    steps.push({
      type: 'pass-complete',
      array: [...arr],
      i,
      j: n - i - 1,
      swaps,
      comparisons,
      description: `Pass ${i + 1} complete. ${arr[n - i - 1]} is in final position`,
      passNumber: i + 1,
      sorted: [...sorted]
    });
    
    if (!hasSwapped) {
      // Array is sorted early
      sorted.fill(true);
      break;
    }
  }
  
  sorted[0] = true; // First element is also sorted
  
  steps.push({
    type: 'done',
    array: [...arr],
    i: -1,
    j: -1,
    swaps,
    comparisons,
    description: `Bubble Sort complete! ${swaps} swaps, ${comparisons} comparisons`,
    passNumber: 0,
    sorted: [...sorted]
  });
  
  return steps;
}

function generateMergeSortSteps(array: number[]): MergeSortStep[] {
  const steps: MergeSortStep[] = [];
  let comparisons = 0;
  
  steps.push({
    type: 'start',
    array: [...array],
    left: 0,
    right: array.length - 1,
    mid: -1,
    leftArray: [],
    rightArray: [],
    leftIndex: -1,
    rightIndex: -1,
    merging: [],
    comparisons,
    description: `Merge Sort: Divide array into subarrays and merge them back sorted`,
    depth: 0
  });
  
  function mergeSort(arr: number[], left: number, right: number, depth: number): number[] {
    if (left >= right) {
      return [arr[left]];
    }
    
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      type: 'divide',
      array: [...arr],
      left,
      right,
      mid,
      leftArray: [],
      rightArray: [],
      leftIndex: -1,
      rightIndex: -1,
      merging: [],
      comparisons,
      description: `Divide: Split [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}]`,
      depth
    });
    
    const leftSorted = mergeSort(arr, left, mid, depth + 1);
    const rightSorted = mergeSort(arr, mid + 1, right, depth + 1);
    
    steps.push({
      type: 'merge',
      array: [...arr],
      left,
      right,
      mid,
      leftArray: [...leftSorted],
      rightArray: [...rightSorted],
      leftIndex: 0,
      rightIndex: 0,
      merging: [],
      comparisons,
      description: `Merge: Combine [${leftSorted.join(',')}] and [${rightSorted.join(',')}]`,
      depth
    });
    
    const merged = [];
    let i = 0, j = 0;
    
    while (i < leftSorted.length && j < rightSorted.length) {
      comparisons++;
      
      steps.push({
        type: 'compare',
        array: [...arr],
        left,
        right,
        mid,
        leftArray: [...leftSorted],
        rightArray: [...rightSorted],
        leftIndex: i,
        rightIndex: j,
        merging: [...merged],
        comparisons,
        description: `Compare ${leftSorted[i]} and ${rightSorted[j]}`,
        depth
      });
      
      if (leftSorted[i] <= rightSorted[j]) {
        merged.push(leftSorted[i]);
        steps.push({
          type: 'place',
          array: [...arr],
          left,
          right,
          mid,
          leftArray: [...leftSorted],
          rightArray: [...rightSorted],
          leftIndex: i,
          rightIndex: j,
          merging: [...merged],
          comparisons,
          description: `${leftSorted[i]} ≤ ${rightSorted[j]}, take ${leftSorted[i]}`,
          depth
        });
        i++;
      } else {
        merged.push(rightSorted[j]);
        steps.push({
          type: 'place',
          array: [...arr],
          left,
          right,
          mid,
          leftArray: [...leftSorted],
          rightArray: [...rightSorted],
          leftIndex: i,
          rightIndex: j,
          merging: [...merged],
          comparisons,
          description: `${leftSorted[i]} > ${rightSorted[j]}, take ${rightSorted[j]}`,
          depth
        });
        j++;
      }
    }
    
    // Add remaining elements
    while (i < leftSorted.length) {
      merged.push(leftSorted[i]);
      i++;
    }
    while (j < rightSorted.length) {
      merged.push(rightSorted[j]);
      j++;
    }
    
    return merged;
  }
  
  mergeSort([...array], 0, array.length - 1, 0);
  
  steps.push({
    type: 'done',
    array: [...array].sort((a, b) => a - b),
    left: 0,
    right: array.length - 1,
    mid: -1,
    leftArray: [],
    rightArray: [],
    leftIndex: -1,
    rightIndex: -1,
    merging: [],
    comparisons,
    description: `Merge Sort complete! ${comparisons} comparisons`,
    depth: 0
  });
  
  return steps;
}

const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10];

function BubbleSortPanel() {
  const [steps, setSteps] = useState<BubbleSortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const initializeSteps = useCallback(() => {
    const newSteps = generateBubbleSortSteps(DEFAULT_ARRAY);
    setSteps(newSteps);
    setCurrentStep(0);
  }, []);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  const step = steps[currentStep];
  
  if (!step) return <div>Loading...</div>;
  
  const maxValue = Math.max(...DEFAULT_ARRAY);
  const barHeight = 100;
  
  return (
    <div className="bg-slate-900 rounded-lg p-4 flex-1">
      <h3 className="text-lg font-semibold text-amber-400 mb-3">
        Bubble Sort - O(n²)
      </h3>
      
      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2">
          <div className="text-amber-400 font-bold">{step.comparisons}</div>
          <div className="text-xs text-slate-400">Comparisons</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
          <div className="text-red-400 font-bold">{step.swaps}</div>
          <div className="text-xs text-slate-400">Swaps</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
          <div className="text-blue-400 font-bold">{step.passNumber}</div>
          <div className="text-xs text-slate-400">Pass</div>
        </div>
      </div>
      
      {/* Array Visualization */}
      <div className="flex items-end justify-center gap-1 mb-4" style={{ height: barHeight + 40 }}>
        {step.array.map((value, idx) => {
          const isComparing = idx === step.j || idx === step.j + 1;
          const isSwapping = step.type === 'swap' && (idx === step.j || idx === step.j + 1);
          const isSorted = step.sorted[idx];
          const heightPx = (value / maxValue) * barHeight;
          
          let bgColor = 'bg-slate-600';
          if (isSorted) {
            bgColor = 'bg-emerald-500';
          } else if (isSwapping) {
            bgColor = 'bg-green-500';
          } else if (isComparing) {
            bgColor = 'bg-red-500';
          }
          
          return (
            <motion.div
              key={idx}
              className="flex flex-col items-center"
              animate={{ scale: isComparing ? 1.1 : 1 }}
            >
              <span className="text-xs text-slate-500 mb-1">[{idx}]</span>
              <motion.div
                className={`w-8 rounded-t flex items-end justify-center text-xs font-bold text-white ${bgColor}`}
                style={{ height: heightPx }}
              >
                {value}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Current operation */}
      <div className="text-center mb-4">
        <div className="text-sm text-slate-300 min-h-[1.5rem]">
          {step.description}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-slate-400">Comparing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-slate-400">Swapping</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <span className="text-slate-400">Sorted</span>
        </div>
      </div>
    </div>
  );
}

function MergeSortPanel() {
  const [steps, setSteps] = useState<MergeSortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const initializeSteps = useCallback(() => {
    const newSteps = generateMergeSortSteps(DEFAULT_ARRAY);
    setSteps(newSteps);
    setCurrentStep(0);
  }, []);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  const step = steps[currentStep];
  
  if (!step) return <div>Loading...</div>;
  
  const maxValue = Math.max(...DEFAULT_ARRAY);
  const barHeight = 100;
  
  return (
    <div className="bg-slate-900 rounded-lg p-4 flex-1">
      <h3 className="text-lg font-semibold text-emerald-400 mb-3">
        Merge Sort - O(n log n)
      </h3>
      
      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-2 text-center">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2">
          <div className="text-emerald-400 font-bold">{step.comparisons}</div>
          <div className="text-xs text-slate-400">Comparisons</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
          <div className="text-purple-400 font-bold">{step.depth}</div>
          <div className="text-xs text-slate-400">Depth</div>
        </div>
      </div>
      
      {/* Array Visualization */}
      <div className="flex items-end justify-center gap-1 mb-4" style={{ height: barHeight + 40 }}>
        {step.array.map((value, idx) => {
          const isInLeftArray = step.leftArray.length > 0 && step.leftIndex >= 0 && 
            idx >= step.left && idx <= step.mid;
          const isInRightArray = step.rightArray.length > 0 && step.rightIndex >= 0 && 
            idx >= step.mid + 1 && idx <= step.right;
          const isCurrentLeft = step.leftIndex >= 0 && step.leftArray[step.leftIndex] === value && isInLeftArray;
          const isCurrentRight = step.rightIndex >= 0 && step.rightArray[step.rightIndex] === value && isInRightArray;
          const heightPx = (value / maxValue) * barHeight;
          
          let bgColor = 'bg-slate-600';
          if (step.type === 'done') {
            bgColor = 'bg-emerald-500';
          } else if (isCurrentLeft || isCurrentRight) {
            bgColor = 'bg-red-500';
          } else if (isInLeftArray) {
            bgColor = 'bg-blue-500';
          } else if (isInRightArray) {
            bgColor = 'bg-purple-500';
          }
          
          return (
            <motion.div
              key={idx}
              className="flex flex-col items-center"
              animate={{ scale: (isCurrentLeft || isCurrentRight) ? 1.1 : 1 }}
            >
              <span className="text-xs text-slate-500 mb-1">[{idx}]</span>
              <motion.div
                className={`w-8 rounded-t flex items-end justify-center text-xs font-bold text-white ${bgColor}`}
                style={{ height: heightPx }}
              >
                {value}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Merge visualization */}
      {step.type === 'merge' || step.type === 'compare' || step.type === 'place' ? (
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">Merging:</div>
          <div className="flex justify-center gap-4">
            <div className="flex gap-1">
              <span className="text-blue-400 text-xs">Left: </span>
              {step.leftArray.map((val, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-xs ${
                    i === step.leftIndex ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {val}
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <span className="text-purple-400 text-xs">Right: </span>
              {step.rightArray.map((val, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-xs ${
                    i === step.rightIndex ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
          {step.merging.length > 0 && (
            <div className="flex justify-center gap-1 mt-2">
              <span className="text-green-400 text-xs">Merged: </span>
              {step.merging.map((val, i) => (
                <span key={i} className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                  {val}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}
      
      {/* Current operation */}
      <div className="text-center mb-4">
        <div className="text-sm text-slate-300 min-h-[1.5rem]">
          {step.description}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-slate-400">Comparing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-slate-400">Left Array</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span className="text-slate-400">Right Array</span>
        </div>
      </div>
    </div>
  );
}

export function SortingComparisonVisualizer() {
  const [bubbleSteps, setBubbleSteps] = useState<BubbleSortStep[]>([]);
  const [mergeSteps, setMergeSteps] = useState<MergeSortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  
  const initializeSteps = useCallback(() => {
    const newBubbleSteps = generateBubbleSortSteps(DEFAULT_ARRAY);
    const newMergeSteps = generateMergeSortSteps(DEFAULT_ARRAY);
    setBubbleSteps(newBubbleSteps);
    setMergeSteps(newMergeSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    const maxSteps = Math.max(bubbleSteps.length, mergeSteps.length);
    if (!isPlaying || currentStep >= maxSteps - 1) {
      if (currentStep >= maxSteps - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, bubbleSteps.length, mergeSteps.length, speed]);
  
  const maxSteps = Math.max(bubbleSteps.length, mergeSteps.length);
  const bubbleStep = bubbleSteps[Math.min(currentStep, bubbleSteps.length - 1)];
  const mergeStep = mergeSteps[Math.min(currentStep, mergeSteps.length - 1)];
  
  if (!bubbleStep || !mergeStep) return <div>Loading...</div>;
  
  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <h2 className="text-xl font-bold mb-2 text-center">Sorting Algorithms Comparison</h2>
        <p className="text-slate-400 text-center text-sm mb-3">
          Watch how O(n²) Bubble Sort compares to O(n log n) Merge Sort on the same data
        </p>
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-amber-400">
            <span className="font-bold">Bubble Sort:</span> {bubbleStep.comparisons} comparisons, {bubbleStep.swaps} swaps
          </div>
          <div className="text-emerald-400">
            <span className="font-bold">Merge Sort:</span> {mergeStep.comparisons} comparisons
          </div>
        </div>
      </div>
      
      {/* Side-by-side panels */}
      <div className="flex gap-4 flex-1">
        <BubbleSortPanel />
        <MergeSortPanel />
      </div>
      
      {/* Controls */}
      <div className="mt-4">
        <Controls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onStepBack={() => setCurrentStep(s => Math.max(0, s - 1))}
          onStepForward={() => setCurrentStep(s => Math.min(maxSteps - 1, s + 1))}
          onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
          currentStep={currentStep + 1}
          totalSteps={maxSteps}
          speed={speed}
          onSpeedChange={setSpeed}
          canStepBack={currentStep > 0}
          canStepForward={currentStep < maxSteps - 1}
        />
      </div>
    </div>
  );
}