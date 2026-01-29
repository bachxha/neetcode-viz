import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'compare' | 'check-left-sorted' | 'check-right-sorted' | 'search-left' | 'search-right' | 'found' | 'not-found';
  array: number[];
  left: number;
  right: number;
  mid: number;
  target: number;
  foundIndex: number;
  description: string;
  rotationPoint: number;
  leftSorted: boolean;
  rightSorted: boolean;
  targetInSortedHalf: boolean;
  decision: string;
}

function findRotationPoint(array: number[]): number {
  // Find the rotation point (smallest element index)
  let min = array[0];
  let rotationPoint = 0;
  
  for (let i = 1; i < array.length; i++) {
    if (array[i] < min) {
      min = array[i];
      rotationPoint = i;
    }
  }
  
  return rotationPoint;
}

function generateSteps(array: number[], target: number): Step[] {
  const steps: Step[] = [];
  const rotationPoint = findRotationPoint(array);
  
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
      rotationPoint: -1,
      leftSorted: false,
      rightSorted: false,
      targetInSortedHalf: false,
      decision: ''
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
    description: `Search for ${target} in rotated sorted array. Rotation point at index ${rotationPoint}. Set left=0, right=${array.length - 1}`,
    rotationPoint,
    leftSorted: false,
    rightSorted: false,
    targetInSortedHalf: false,
    decision: ''
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
      rotationPoint,
      leftSorted: false,
      rightSorted: false,
      targetInSortedHalf: false,
      decision: ''
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
        rotationPoint,
        leftSorted: false,
        rightSorted: false,
        targetInSortedHalf: false,
        decision: 'Target found!'
      });
      return steps;
    }
    
    // Check which half is sorted
    const leftSorted = array[left] <= array[mid];
    
    if (leftSorted) {
      const targetInLeftHalf = array[left] <= target && target < array[mid];
      
      steps.push({
        type: 'check-left-sorted',
        array,
        left,
        right,
        mid,
        target,
        foundIndex: -1,
        description: `Left half is sorted: array[${left}] = ${array[left]} ≤ array[${mid}] = ${array[mid]}. Check if target ${target} is in range [${array[left]}, ${array[mid]}): ${targetInLeftHalf}`,
        rotationPoint,
        leftSorted: true,
        rightSorted: false,
        targetInSortedHalf: targetInLeftHalf,
        decision: targetInLeftHalf ? 'Target in sorted left half' : 'Target not in sorted left half'
      });
      
      if (targetInLeftHalf) {
        right = mid - 1;
        steps.push({
          type: 'search-left',
          array,
          left,
          right,
          mid,
          target,
          foundIndex: -1,
          description: `Target ${target} is in left sorted half. Set right = ${mid} - 1 = ${right}`,
          rotationPoint,
          leftSorted: false,
          rightSorted: false,
          targetInSortedHalf: false,
          decision: ''
        });
      } else {
        left = mid + 1;
        steps.push({
          type: 'search-right',
          array,
          left,
          right,
          mid,
          target,
          foundIndex: -1,
          description: `Target ${target} is not in left sorted half. Search right half. Set left = ${mid} + 1 = ${left}`,
          rotationPoint,
          leftSorted: false,
          rightSorted: false,
          targetInSortedHalf: false,
          decision: ''
        });
      }
    } else {
      // Right half is sorted
      const targetInRightHalf = array[mid] < target && target <= array[right];
      
      steps.push({
        type: 'check-right-sorted',
        array,
        left,
        right,
        mid,
        target,
        foundIndex: -1,
        description: `Right half is sorted: array[${mid}] = ${array[mid]} ≤ array[${right}] = ${array[right]}. Check if target ${target} is in range (${array[mid]}, ${array[right]}]: ${targetInRightHalf}`,
        rotationPoint,
        leftSorted: false,
        rightSorted: true,
        targetInSortedHalf: targetInRightHalf,
        decision: targetInRightHalf ? 'Target in sorted right half' : 'Target not in sorted right half'
      });
      
      if (targetInRightHalf) {
        left = mid + 1;
        steps.push({
          type: 'search-right',
          array,
          left,
          right,
          mid,
          target,
          foundIndex: -1,
          description: `Target ${target} is in right sorted half. Set left = ${mid} + 1 = ${left}`,
          rotationPoint,
          leftSorted: false,
          rightSorted: false,
          targetInSortedHalf: false,
          decision: ''
        });
      } else {
        right = mid - 1;
        steps.push({
          type: 'search-left',
          array,
          left,
          right,
          mid,
          target,
          foundIndex: -1,
          description: `Target ${target} is not in right sorted half. Search left half. Set right = ${mid} - 1 = ${right}`,
          rotationPoint,
          leftSorted: false,
          rightSorted: false,
          targetInSortedHalf: false,
          decision: ''
        });
      }
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
    rotationPoint,
    leftSorted: false,
    rightSorted: false,
    targetInSortedHalf: false,
    decision: 'Target not found'
  });
  
  return steps;
}

export function SearchInRotatedSortedArrayVisualizer() {
  const [arrayInput, setArrayInput] = useState('4,5,6,7,0,1,2');
  const [targetInput, setTargetInput] = useState('0');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const array = arrayInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const target = parseInt(targetInput.trim());
    
    if (!isNaN(target) && array.length <= 20 && array.length > 0) {
      const newSteps = generateSteps(array, target);
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1200 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Search in Rotated Sorted Array</h1>
        <p className="text-slate-400">
          Search for a target value in a sorted array that has been rotated. The key insight is to determine which half is sorted, 
          then check if the target is in that sorted half.
        </p>
      </div>
      
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-2">Rotated Array (comma-separated):</label>
          <input
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            placeholder="e.g., 4,5,6,7,0,1,2"
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
            placeholder="e.g., 0"
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
            const isRotationPoint = i === currentStepData.rotationPoint;
            const inSearchSpace = i >= currentStepData.left && i <= currentStepData.right;
            
            // Determine if this element is in the sorted half being considered
            const inSortedHalf = currentStepData.leftSorted && i >= currentStepData.left && i <= currentStepData.mid ||
                                currentStepData.rightSorted && i >= currentStepData.mid && i <= currentStepData.right;
            
            let bgColor = 'bg-slate-600';
            let textColor = 'text-white';
            let label = '';
            
            if (isFound) {
              bgColor = 'bg-green-500';
              label = '✓';
            } else if (isMid) {
              bgColor = 'bg-yellow-500';
              label = 'M';
              textColor = 'text-black';
            } else if (isLeft) {
              bgColor = 'bg-blue-500';
              label = 'L';
              textColor = 'text-white';
            } else if (isRight) {
              bgColor = 'bg-cyan-500';
              label = 'R';
              textColor = 'text-black';
            } else if (isRotationPoint) {
              bgColor = 'bg-purple-500';
              textColor = 'text-white';
            } else if (inSortedHalf && currentStepData.targetInSortedHalf) {
              bgColor = 'bg-green-600';
              textColor = 'text-white';
            } else if (inSortedHalf) {
              bgColor = 'bg-orange-600';
              textColor = 'text-white';
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
                  scale: isMid ? 1.2 : isLeft || isRight ? 1.1 : isRotationPoint ? 1.05 : 1,
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
                      label === 'L' ? 'text-blue-400' :
                      label === 'R' ? 'text-cyan-400' :
                      label === 'M' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}
                  >
                    {label}
                  </motion.div>
                )}
                
                {/* Rotation point indicator */}
                {isRotationPoint && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-8 font-bold text-xs text-purple-400"
                  >
                    ROT
                  </motion.div>
                )}
                
                {/* Array element */}
                <motion.div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${bgColor} ${textColor}`}
                  animate={{ backgroundColor: bgColor.replace('bg-', '').replace('-500', '').replace('-600', '').replace('-700', '') }}
                >
                  {value}
                </motion.div>
                
                <span className="text-xs text-slate-400 mt-1">[{i}]</span>
              </motion.div>
            );
          })}
        </div>
        
        {/* Search space and rotation indicator */}
        {currentStepData && (
          <div className="mt-4 text-center space-y-1">
            {currentStepData.rotationPoint >= 0 && (
              <div className="text-sm text-purple-400">
                Rotation point at index {currentStepData.rotationPoint} (value: {currentStepData.array[currentStepData.rotationPoint]})
              </div>
            )}
            {currentStepData.type !== 'not-found' && currentStepData.left >= 0 && currentStepData.right >= 0 && (
              <div className="text-sm text-slate-400">
                Current search space: [{currentStepData.left}, {currentStepData.right}]
                {currentStepData.type !== 'start' && ` (${currentStepData.right - currentStepData.left + 1} elements)`}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Decision logic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
                    <span className="font-mono text-blue-400">{currentStepData.left}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Right:</span>
                    <span className="font-mono text-cyan-400">{currentStepData.right}</span>
                  </div>
                  {currentStepData.mid >= 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mid:</span>
                        <span className="font-mono text-yellow-400">{currentStepData.mid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mid Value:</span>
                        <span className="font-mono">{currentStepData.array[currentStepData.mid]}</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Decision Logic</h3>
          {currentStepData && (
            <div className="space-y-2 text-sm">
              {currentStepData.leftSorted && (
                <div className="text-orange-400">
                  ✓ Left half sorted: [{currentStepData.left}..{currentStepData.mid}]
                </div>
              )}
              {currentStepData.rightSorted && (
                <div className="text-orange-400">
                  ✓ Right half sorted: [{currentStepData.mid}..{currentStepData.right}]
                </div>
              )}
              {currentStepData.decision && (
                <div className={`font-semibold ${
                  currentStepData.targetInSortedHalf ? 'text-green-400' :
                  currentStepData.decision.includes('not') ? 'text-red-400' :
                  'text-blue-400'
                }`}>
                  → {currentStepData.decision}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Result */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
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
          
          {/* Legend */}
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-slate-400">Rotation Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded"></div>
              <span className="text-slate-400">Sorted Half</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span className="text-slate-400">Target Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-700 rounded"></div>
              <span className="text-slate-400">Eliminated</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'found' ? 'bg-green-500' :
            currentStepData?.type === 'not-found' ? 'bg-red-500' :
            currentStepData?.type === 'check-left-sorted' ? 'bg-orange-500' :
            currentStepData?.type === 'check-right-sorted' ? 'bg-orange-500' :
            currentStepData?.type === 'search-left' ? 'bg-blue-500' :
            currentStepData?.type === 'search-right' ? 'bg-cyan-500' :
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
{`public int search(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            return mid;
        }
        
        // Check which half is sorted
        if (nums[left] <= nums[mid]) {
            // Left half is sorted
            if (nums[left] <= target && target < nums[mid]) {
                // Target is in the left sorted half
                right = mid - 1;
            } else {
                // Target is in the right half
                left = mid + 1;
            }
        } else {
            // Right half is sorted
            if (nums[mid] < target && target <= nums[right]) {
                // Target is in the right sorted half
                left = mid + 1;
            } else {
                // Target is in the left half
                right = mid - 1;
            }
        }
    }
    
    return -1; // Target not found
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Key Insight: Modified Binary Search</h3>
        <div className="space-y-3 text-slate-300">
          <p>
            <strong>The Problem:</strong> In a regular sorted array, we know which half contains the target. 
            In a rotated array, we first need to determine which half is properly sorted.
          </p>
          
          <p>
            <strong>The Solution:</strong> At each step:
          </p>
          <ol className="ml-4 space-y-1 text-slate-400 list-decimal">
            <li>Calculate mid point</li>
            <li>Check if target equals mid element</li>
            <li><strong>Identify which half is sorted:</strong>
              <ul className="ml-4 mt-1 space-y-1 list-disc">
                <li>If <code>array[left] ≤ array[mid]</code> → left half is sorted</li>
                <li>Otherwise → right half is sorted</li>
              </ul>
            </li>
            <li><strong>Check if target is in the sorted half:</strong>
              <ul className="ml-4 mt-1 space-y-1 list-disc">
                <li>If left sorted: <code>array[left] ≤ target &lt; array[mid]</code></li>
                <li>If right sorted: <code>array[mid] &lt; target ≤ array[right]</code></li>
              </ul>
            </li>
            <li>Search the appropriate half</li>
          </ol>
          
          <p className="text-blue-400">
            ⚡ <strong>Time Complexity:</strong> O(log n) - same as binary search!
          </p>
        </div>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Why This Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-white mb-2">Sorted Half Property</h4>
            <div className="text-slate-400 space-y-1">
              <p>In any rotation, at least one half of the array around the midpoint will be properly sorted.</p>
              <p><strong>Example:</strong> [4,5,6,7,0,1,2]</p>
              <p>• Left half [4,5,6,7] is sorted</p>
              <p>• We can use normal binary search logic on the sorted half</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Decision Making</h4>
            <div className="text-slate-400 space-y-1">
              <p>Once we identify the sorted half:</p>
              <p>• If target is in sorted half → search there</p>
              <p>• If target is NOT in sorted half → search the other half</p>
              <p>This guarantees we eliminate half the search space each step.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Common Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-white mb-1">No Rotation</h4>
            <div className="text-slate-400">
              <p><code>[0,1,2,4,5,6,7]</code></p>
              <p>Entire array is sorted</p>
              <p>Behaves like normal binary search</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Rotation in Middle</h4>
            <div className="text-slate-400">
              <p><code>[4,5,6,7,0,1,2]</code></p>
              <p>Left half sorted, right half sorted</p>
              <p>Classic case for the algorithm</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Single Rotation</h4>
            <div className="text-slate-400">
              <p><code>[2,1]</code> or <code>[1,2,0]</code></p>
              <p>Minimal rotation cases</p>
              <p>Algorithm still works correctly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}