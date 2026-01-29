import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'compare' | 'decision' | 'search-left' | 'search-right' | 'found';
  array: number[];
  left: number;
  right: number;
  mid: number;
  minIndex: number;
  description: string;
  decision: string;
  rotationPoint: number;
}

function findRotationPoint(array: number[]): number {
  // Find the actual rotation point for visualization
  let min = array[0];
  let rotationPoint = 0;
  
  for (let i = 1; i < array.length; i++) {
    if (array[i] < min) {
      min = array[i];
      rotationPoint = i;
      break; // In rotated sorted array, first decrease is the rotation point
    }
  }
  
  return rotationPoint;
}

function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const rotationPoint = findRotationPoint(array);
  
  if (array.length === 0) {
    steps.push({
      type: 'found',
      array,
      left: -1,
      right: -1,
      mid: -1,
      minIndex: -1,
      description: 'Empty array',
      decision: '',
      rotationPoint: -1
    });
    return steps;
  }
  
  if (array.length === 1) {
    steps.push({
      type: 'found',
      array,
      left: 0,
      right: 0,
      mid: 0,
      minIndex: 0,
      description: `Single element array. Minimum is ${array[0]} at index 0.`,
      decision: 'Found minimum!',
      rotationPoint: 0
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    array,
    left: 0,
    right: array.length - 1,
    mid: Math.floor((0 + array.length - 1) / 2),
    minIndex: -1,
    description: `Find minimum in rotated sorted array. The rotation point is at index ${rotationPoint}. Set left=0, right=${array.length - 1}`,
    decision: 'Initialize pointers',
    rotationPoint
  });
  
  let left = 0;
  let right = array.length - 1;
  
  while (left < right) {
    // Check if array is not rotated
    if (array[left] < array[right]) {
      steps.push({
        type: 'found',
        array,
        left,
        right,
        mid: left,
        minIndex: left,
        description: `Array is not rotated: array[${left}] = ${array[left]} < array[${right}] = ${array[right]}. Minimum is at index ${left}.`,
        decision: 'Array not rotated - minimum at left!',
        rotationPoint
      });
      return steps;
    }
    
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      type: 'compare',
      array,
      left,
      right,
      mid,
      minIndex: -1,
      description: `Mid = (${left} + ${right}) / 2 = ${mid}. Compare array[${mid}] = ${array[mid]} with array[${right}] = ${array[right]}`,
      decision: 'Calculate midpoint',
      rotationPoint
    });
    
    if (array[mid] > array[right]) {
      steps.push({
        type: 'decision',
        array,
        left,
        right,
        mid,
        minIndex: -1,
        description: `${array[mid]} > ${array[right]}: Mid is greater than right. The minimum must be in the right half (rotation point is to the right).`,
        decision: 'mid > right → minimum in right half',
        rotationPoint
      });
      
      left = mid + 1;
      steps.push({
        type: 'search-right',
        array,
        left,
        right,
        mid,
        minIndex: -1,
        description: `Search right half. Set left = ${mid} + 1 = ${left}`,
        decision: '',
        rotationPoint
      });
    } else {
      steps.push({
        type: 'decision',
        array,
        left,
        right,
        mid,
        minIndex: -1,
        description: `${array[mid]} ≤ ${array[right]}: Mid is less than or equal to right. The minimum is in the left half (including mid).`,
        decision: 'mid ≤ right → minimum in left half',
        rotationPoint
      });
      
      right = mid;
      steps.push({
        type: 'search-left',
        array,
        left,
        right,
        mid,
        minIndex: -1,
        description: `Search left half including mid. Set right = ${mid}`,
        decision: '',
        rotationPoint
      });
    }
  }
  
  steps.push({
    type: 'found',
    array,
    left,
    right,
    mid: left,
    minIndex: left,
    description: `left == right (${left}). Found minimum! array[${left}] = ${array[left]} is the minimum value.`,
    decision: `Found minimum: ${array[left]} at index ${left}`,
    rotationPoint
  });
  
  return steps;
}

export function FindMinimumInRotatedSortedArrayVisualizer() {
  const [arrayInput, setArrayInput] = useState('3,4,5,1,2');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const array = arrayInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
    if (array.length <= 20 && array.length > 0) {
      const newSteps = generateSteps(array);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [arrayInput]);
  
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
        <h1 className="text-3xl font-bold mb-2">Find Minimum in Rotated Sorted Array</h1>
        <p className="text-slate-400">
          Find the minimum element in a sorted array that has been rotated. The key insight is to compare 
          the middle element with the rightmost element to determine which half contains the minimum.
        </p>
      </div>
      
      <div className="mb-6">
        <label className="text-sm text-slate-400 block mb-2">Rotated Array (comma-separated):</label>
        <input
          type="text"
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          placeholder="e.g., 3,4,5,1,2"
        />
      </div>
      
      {/* Array visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Array Visualization</h3>
        <div className="flex items-center justify-center gap-2 flex-wrap" style={{ minHeight: '120px' }}>
          {currentStepData?.array.map((value, i) => {
            const isLeft = i === currentStepData.left;
            const isMid = i === currentStepData.mid;
            const isRight = i === currentStepData.right;
            const isMinimum = i === currentStepData.minIndex;
            const isRotationPoint = i === currentStepData.rotationPoint;
            const inSearchSpace = currentStepData.left >= 0 && currentStepData.right >= 0 && 
                                 i >= currentStepData.left && i <= currentStepData.right;
            const isEliminated = !inSearchSpace && currentStepData.type !== 'start' && currentStepData.left >= 0;
            
            let bgColor = 'bg-slate-600';
            let textColor = 'text-white';
            let label = '';
            
            if (isMinimum) {
              bgColor = 'bg-green-500';
              label = '✓';
              textColor = 'text-white';
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
            } else if (isRotationPoint && currentStepData.type === 'start') {
              bgColor = 'bg-purple-500';
              textColor = 'text-white';
            } else if (isEliminated) {
              bgColor = 'bg-slate-700';
              textColor = 'text-slate-400';
            } else if (inSearchSpace) {
              bgColor = 'bg-slate-500';
            } else {
              bgColor = 'bg-slate-600';
            }
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center relative"
                animate={{ 
                  scale: isMid ? 1.2 : isLeft || isRight ? 1.1 : isMinimum ? 1.15 : isRotationPoint && currentStepData.type === 'start' ? 1.05 : 1,
                  opacity: isEliminated ? 0.4 : 1
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
                {isRotationPoint && currentStepData.type === 'start' && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-8 font-bold text-xs text-purple-400"
                  >
                    MIN
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
        
        {/* Search space indicator */}
        {currentStepData && currentStepData.type !== 'found' && currentStepData.left >= 0 && currentStepData.right >= 0 && (
          <div className="mt-4 text-center">
            <div className="text-sm text-slate-400">
              Current search space: [{currentStepData.left}, {currentStepData.right}]
              {currentStepData.type !== 'start' && ` (${currentStepData.right - currentStepData.left + 1} elements)`}
            </div>
          </div>
        )}
        
        {/* Show the rotation point info */}
        {currentStepData && currentStepData.rotationPoint >= 0 && currentStepData.type === 'start' && (
          <div className="mt-2 text-center">
            <div className="text-sm text-purple-400">
              Actual minimum at index {currentStepData.rotationPoint} (value: {currentStepData.array[currentStepData.rotationPoint]})
            </div>
          </div>
        )}
      </div>
      
      {/* Decision logic and current state */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current State</h3>
          {currentStepData && (
            <div className="space-y-2">
              {currentStepData.left >= 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Left:</span>
                    <span className="font-mono text-blue-400">{currentStepData.left}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Right:</span>
                    <span className="font-mono text-cyan-400">{currentStepData.right}</span>
                  </div>
                  {currentStepData.mid >= 0 && currentStepData.type !== 'found' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mid:</span>
                        <span className="font-mono text-yellow-400">{currentStepData.mid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mid Value:</span>
                        <span className="font-mono">{currentStepData.array[currentStepData.mid]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Right Value:</span>
                        <span className="font-mono">{currentStepData.array[currentStepData.right]}</span>
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
            <div className="space-y-2">
              {currentStepData.decision && (
                <div className={`font-semibold text-sm ${
                  currentStepData.decision.includes('right half') ? 'text-cyan-400' :
                  currentStepData.decision.includes('left half') ? 'text-blue-400' :
                  currentStepData.decision.includes('Found') ? 'text-green-400' :
                  currentStepData.decision.includes('not rotated') ? 'text-green-400' :
                  'text-yellow-400'
                }`}>
                  {currentStepData.decision}
                </div>
              )}
              
              {/* Key insight explanation */}
              {currentStepData.type === 'decision' && (
                <div className="text-xs text-slate-400 mt-2 space-y-1">
                  <p><strong>Key Insight:</strong></p>
                  <p>• If mid &gt; right: rotation point is in right half</p>
                  <p>• If mid &le; right: rotation point is in left half (or no rotation)</p>
                  <p>The minimum is always at the rotation point!</p>
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
              currentStepData?.type === 'found' ? 'text-green-400' : 'text-slate-500'
            }`}>
              {currentStepData?.minIndex >= 0 ? currentStepData.array[currentStepData.minIndex] : '?'}
            </div>
            {currentStepData?.type === 'found' && currentStepData.minIndex >= 0 && (
              <div className="text-sm text-slate-400 mt-1">
                Minimum value at index {currentStepData.minIndex}
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-slate-400">Mid (M)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-slate-400">Left (L)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded"></div>
              <span className="text-slate-400">Right (R)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-slate-400">Minimum</span>
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
            currentStepData?.type === 'decision' ? 'bg-yellow-500' :
            currentStepData?.type === 'search-left' ? 'bg-blue-500' :
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
{`public int findMin(int[] nums) {
    int left = 0;
    int right = nums.length - 1;
    
    while (left < right) {
        // If array is not rotated, minimum is at left
        if (nums[left] < nums[right]) {
            return nums[left];
        }
        
        int mid = left + (right - left) / 2;
        
        if (nums[mid] > nums[right]) {
            // Minimum is in right half
            left = mid + 1;
        } else {
            // Minimum is in left half (including mid)
            right = mid;
        }
    }
    
    return nums[left];
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Key Insight: Compare Mid with Right</h3>
        <div className="space-y-3 text-slate-300">
          <p>
            <strong>Why compare mid with right (not left)?</strong> In a rotated sorted array, 
            the rotation point (minimum) creates a specific pattern that we can detect by comparing mid with right.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Case 1: mid &gt; right</h4>
              <div className="text-sm text-slate-400 space-y-1">
                <p><strong>Example:</strong> [4,5,6,7,0,1,2], mid=7, right=2</p>
                <p>Since 7 &gt; 2, we know there's a "drop" between mid and right.</p>
                <p><strong>Conclusion:</strong> Minimum is in right half.</p>
                <p className="text-cyan-400">→ Search right: left = mid + 1</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Case 2: mid &le; right</h4>
              <div className="text-sm text-slate-400 space-y-1">
                <p><strong>Example:</strong> [6,7,0,1,2,4,5], mid=1, right=5</p>
                <p>Since 1 &le; 5, the right half is sorted.</p>
                <p><strong>Conclusion:</strong> Minimum is in left half (or at mid).</p>
                <p className="text-blue-400">→ Search left: right = mid</p>
              </div>
            </div>
          </div>
          
          <p className="text-blue-400">
            ⚡ <strong>Time Complexity:</strong> O(log n) - we eliminate half the search space each step!
          </p>
        </div>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Why This Algorithm Works</h3>
        <div className="space-y-3 text-slate-300">
          <p>
            <strong>The Rotation Property:</strong> When a sorted array is rotated, there's exactly one point 
            where a larger number is followed by a smaller number. This is the minimum element.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
            <div>
              <h4 className="font-semibold text-white mb-1">No Rotation</h4>
              <div className="text-slate-400">
                <p><code>[1,2,3,4,5]</code></p>
                <p>left &lt; right → minimum at left</p>
                <p>Return immediately</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Rotation in Left Half</h4>
              <div className="text-slate-400">
                <p><code>[3,4,5,1,2]</code></p>
                <p>mid &le; right → search left</p>
                <p>Include mid in search</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Rotation in Right Half</h4>
              <div className="text-slate-400">
                <p><code>[4,5,1,2,3]</code></p>
                <p>mid &gt; right → search right</p>
                <p>Exclude mid from search</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-700 rounded p-3 mt-4">
            <h4 className="font-semibold text-yellow-400 mb-2">🔑 Critical Insight</h4>
            <p className="text-sm text-slate-300">
              We use <code>left &lt; right</code> (not &le;) because when left == right, 
              we've found the minimum! This prevents infinite loops and handles the case 
              where the minimum is at the boundary perfectly.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Common Edge Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-white mb-2">Input Variations</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• Single element: <code>[1]</code> → return the element</li>
              <li>• Two elements: <code>[2,1]</code> → compare and return smaller</li>
              <li>• No rotation: <code>[1,2,3,4,5]</code> → return first</li>
              <li>• All same elements: <code>[1,1,1,1]</code> → return any</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Boundary Conditions</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• Minimum at start: <code>[1,2,3,4,5]</code></li>
              <li>• Minimum at end: <code>[2,3,4,5,1]</code></li>
              <li>• Minimum in middle: <code>[3,4,1,2]</code></li>
              <li>• Large rotation: <code>[5,1,2,3,4]</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}