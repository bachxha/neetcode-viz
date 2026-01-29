import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'update-left-max' | 'update-right-max' | 'fill-water-left' | 'fill-water-right' | 'move-left' | 'move-right' | 'done';
  heights: number[];
  left: number;
  right: number;
  leftMax: number;
  rightMax: number;
  waterLevels: number[];
  totalWater: number;
  currentlyFilling?: number;
  waterToAdd?: number;
  description: string;
}

function generateSteps(heights: number[]): Step[] {
  const steps: Step[] = [];
  
  if (heights.length < 3) {
    steps.push({
      type: 'done',
      heights,
      left: 0,
      right: heights.length - 1,
      leftMax: 0,
      rightMax: 0,
      waterLevels: new Array(heights.length).fill(0),
      totalWater: 0,
      description: 'Need at least 3 bars to trap water',
    });
    return steps;
  }
  
  const waterLevels = new Array(heights.length).fill(0);
  let left = 0;
  let right = heights.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalWater = 0;
  
  steps.push({
    type: 'start',
    heights,
    left,
    right,
    leftMax,
    rightMax,
    waterLevels: [...waterLevels],
    totalWater,
    description: 'Use two pointers from both ends. Track max heights seen so far.',
  });
  
  while (left < right) {
    if (heights[left] < heights[right]) {
      // Process left side
      if (heights[left] >= leftMax) {
        // Update left max
        leftMax = heights[left];
        steps.push({
          type: 'update-left-max',
          heights,
          left,
          right,
          leftMax,
          rightMax,
          waterLevels: [...waterLevels],
          totalWater,
          description: `New leftMax = ${leftMax} at position ${left}`,
        });
      } else {
        // Fill water at current position
        const waterToAdd = leftMax - heights[left];
        totalWater += waterToAdd;
        waterLevels[left] = waterToAdd;
        
        steps.push({
          type: 'fill-water-left',
          heights,
          left,
          right,
          leftMax,
          rightMax,
          waterLevels: [...waterLevels],
          totalWater,
          currentlyFilling: left,
          waterToAdd,
          description: `Fill water at position ${left}: ${leftMax} - ${heights[left]} = ${waterToAdd} units`,
        });
      }
      
      // Move left pointer
      left++;
      if (left < right) {
        steps.push({
          type: 'move-left',
          heights,
          left,
          right,
          leftMax,
          rightMax,
          waterLevels: [...waterLevels],
          totalWater,
          description: `Move left pointer to position ${left}`,
        });
      }
    } else {
      // Process right side
      if (heights[right] >= rightMax) {
        // Update right max
        rightMax = heights[right];
        steps.push({
          type: 'update-right-max',
          heights,
          left,
          right,
          leftMax,
          rightMax,
          waterLevels: [...waterLevels],
          totalWater,
          description: `New rightMax = ${rightMax} at position ${right}`,
        });
      } else {
        // Fill water at current position
        const waterToAdd = rightMax - heights[right];
        totalWater += waterToAdd;
        waterLevels[right] = waterToAdd;
        
        steps.push({
          type: 'fill-water-right',
          heights,
          left,
          right,
          leftMax,
          rightMax,
          waterLevels: [...waterLevels],
          totalWater,
          currentlyFilling: right,
          waterToAdd,
          description: `Fill water at position ${right}: ${rightMax} - ${heights[right]} = ${waterToAdd} units`,
        });
      }
      
      // Move right pointer
      right--;
      if (left < right) {
        steps.push({
          type: 'move-right',
          heights,
          left,
          right,
          leftMax,
          rightMax,
          waterLevels: [...waterLevels],
          totalWater,
          description: `Move right pointer to position ${right}`,
        });
      }
    }
  }
  
  steps.push({
    type: 'done',
    heights,
    left,
    right,
    leftMax,
    rightMax,
    waterLevels: [...waterLevels],
    totalWater,
    description: `Complete! Total trapped water: ${totalWater} units`,
  });
  
  return steps;
}

export function TrappingRainWaterVisualizer() {
  const [input, setInput] = useState('0,1,0,2,1,0,1,3,2,1,2,1');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const heights = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0);
    if (heights.length >= 3 && heights.length <= 20) {
      const newSteps = generateSteps(heights);
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  const maxHeight = currentStepData ? Math.max(...currentStepData.heights, 1) : 1;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Trapping Rain Water</h1>
        <p className="text-slate-400">
          Use two pointers approach to calculate trapped water. Water level at each position 
          is determined by min(leftMax, rightMax) - height.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Heights (comma-separated):</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          placeholder="e.g., 0,1,0,2,1,0,1,3,2,1,2,1"
        />
      </div>
      
      {/* Elevation map with water */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Elevation Map</h3>
        <div className="flex items-end justify-center gap-1" style={{ minHeight: '280px' }}>
          {currentStepData?.heights.map((h, i) => {
            const isLeft = i === currentStepData.left;
            const isRight = i === currentStepData.right;
            const isCurrentlyFilling = i === currentStepData.currentlyFilling;
            const isProcessed = i < currentStepData.left || i > currentStepData.right;
            const barHeight = (h / maxHeight) * 200;
            const waterLevel = currentStepData.waterLevels[i];
            const waterHeight = (waterLevel / maxHeight) * 200;
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center relative"
                animate={{ scale: isLeft || isRight || isCurrentlyFilling ? 1.05 : 1 }}
              >
                {/* Pointer labels */}
                {isLeft && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-8 text-yellow-400 font-bold text-sm z-10"
                  >
                    L
                  </motion.div>
                )}
                {isRight && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-8 text-cyan-400 font-bold text-sm z-10"
                  >
                    R
                  </motion.div>
                )}
                
                {/* Bar and water container */}
                <div className="relative" style={{ height: '200px', width: '20px' }}>
                  {/* Water level */}
                  {waterLevel > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ 
                        height: waterHeight,
                        backgroundColor: isCurrentlyFilling ? '#3b82f6' : '#1e40af'
                      }}
                      className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-sm"
                      style={{ 
                        bottom: barHeight,
                        height: waterHeight
                      }}
                    />
                  )}
                  
                  {/* Elevation bar */}
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-sm ${
                      isCurrentlyFilling ? 'bg-orange-500' :
                      isLeft ? 'bg-yellow-500' :
                      isRight ? 'bg-cyan-500' :
                      isProcessed ? 'bg-green-600' :
                      'bg-slate-600'
                    }`}
                    style={{ height: barHeight }}
                    animate={{ height: barHeight }}
                  />
                </div>
                
                <span className="text-xs text-slate-400 mt-1">{h}</span>
                <span className="text-xs text-slate-500">{i}</span>
                {waterLevel > 0 && (
                  <span className="text-xs text-blue-400">+{waterLevel}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Algorithm state */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Pointers & Max Values</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-yellow-400">Left:</span>
              <span className="font-mono">{currentStepData?.left}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-400">Right:</span>
              <span className="font-mono">{currentStepData?.right}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-300">leftMax:</span>
              <span className="font-mono text-yellow-300">{currentStepData?.leftMax}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-300">rightMax:</span>
              <span className="font-mono text-cyan-300">{currentStepData?.rightMax}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Step</h3>
          {currentStepData?.waterToAdd !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Position:</span>
                <span className="font-mono">{currentStepData.currentlyFilling}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Water Added:</span>
                <span className="font-mono text-blue-400">+{currentStepData.waterToAdd}</span>
              </div>
            </div>
          )}
          {currentStepData?.waterToAdd === undefined && (
            <span className="text-slate-500">-</span>
          )}
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Total Trapped Water</h3>
          <div className="text-3xl font-bold text-blue-400">{currentStepData?.totalWater || 0}</div>
          <div className="text-sm text-slate-400">units</div>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'done' ? 'bg-green-500' :
            currentStepData?.type === 'fill-water-left' || currentStepData?.type === 'fill-water-right' ? 'bg-blue-500' :
            currentStepData?.type === 'update-left-max' ? 'bg-yellow-500' :
            currentStepData?.type === 'update-right-max' ? 'bg-cyan-500' :
            'bg-slate-500'
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
{`public int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = 0, rightMax = 0;
    int waterTrapped = 0;
    
    while (left < right) {
        if (height[left] < height[right]) {
            // Process left side
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                // Water can be trapped here
                waterTrapped += leftMax - height[left];
            }
            left++;
        } else {
            // Process right side
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                // Water can be trapped here
                waterTrapped += rightMax - height[right];
            }
            right--;
        }
    }
    
    return waterTrapped;
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="space-y-2 text-slate-300">
          <p>
            <strong>Two-pointer approach:</strong> Start from both ends and move inward.
          </p>
          <p>
            <strong>Key insight:</strong> Water level at position i = min(leftMax, rightMax) - height[i]
          </p>
          <p>
            <strong>Why it works:</strong> Always process the side with smaller height, because 
            the water level is limited by the minimum of leftMax and rightMax.
          </p>
          <p>
            <strong>Time complexity:</strong> O(n) - single pass through the array
          </p>
          <p>
            <strong>Space complexity:</strong> O(1) - only using a few variables
          </p>
        </div>
      </div>
    </div>
  );
}