import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'check' | 'update-reach' | 'success' | 'failure' | 'done';
  nums: number[];
  currentIndex: number;
  maxReach: number;
  jumpValue: number;
  newReach: number;
  description: string;
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  
  if (nums.length <= 1) {
    steps.push({
      type: 'done',
      nums,
      currentIndex: 0,
      maxReach: 0,
      jumpValue: nums[0] || 0,
      newReach: 0,
      description: nums.length === 0 ? 'Empty array - cannot reach end' : 'Array has only one element - already at the end!',
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    nums,
    currentIndex: 0,
    maxReach: 0,
    jumpValue: nums[0],
    newReach: 0 + nums[0],
    description: `Start at index 0. We can jump up to ${nums[0]} steps, so our initial max reach is ${Math.min(0 + nums[0], nums.length - 1)}.`,
  });
  
  let maxReach = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // Check if current position is reachable
    if (i > maxReach) {
      steps.push({
        type: 'failure',
        nums,
        currentIndex: i,
        maxReach,
        jumpValue: nums[i],
        newReach: maxReach,
        description: `Cannot reach index ${i}! Our max reach is ${maxReach}, but we need to reach at least ${i}. Game over!`,
      });
      
      steps.push({
        type: 'done',
        nums,
        currentIndex: i,
        maxReach,
        jumpValue: nums[i],
        newReach: maxReach,
        description: 'Cannot reach the last index. Return false.',
      });
      return steps;
    }
    
    steps.push({
      type: 'check',
      nums,
      currentIndex: i,
      maxReach,
      jumpValue: nums[i],
      newReach: maxReach,
      description: `At index ${i}, value is ${nums[i]}. Current max reach is ${maxReach}. Can we extend our reach?`,
    });
    
    const newReach = i + nums[i];
    if (newReach > maxReach) {
      const oldMaxReach = maxReach;
      maxReach = newReach;
      
      steps.push({
        type: 'update-reach',
        nums,
        currentIndex: i,
        maxReach: newReach,
        jumpValue: nums[i],
        newReach,
        description: `Yes! From index ${i}, we can jump ${nums[i]} steps to reach index ${newReach}. Max reach updated from ${oldMaxReach} to ${newReach}.`,
      });
      
      // Check if we can reach the end
      if (newReach >= nums.length - 1) {
        steps.push({
          type: 'success',
          nums,
          currentIndex: i,
          maxReach: newReach,
          jumpValue: nums[i],
          newReach,
          description: `Success! We can now reach index ${newReach}, which covers the last index ${nums.length - 1}. We can reach the end!`,
        });
        
        steps.push({
          type: 'done',
          nums,
          currentIndex: i,
          maxReach: newReach,
          jumpValue: nums[i],
          newReach,
          description: 'We can reach the last index. Return true.',
        });
        return steps;
      }
    }
  }
  
  // If we get here, check if we reached the end
  if (maxReach >= nums.length - 1) {
    steps.push({
      type: 'success',
      nums,
      currentIndex: nums.length - 1,
      maxReach,
      jumpValue: 0,
      newReach: maxReach,
      description: `We've checked all positions and our max reach ${maxReach} covers the last index ${nums.length - 1}. Success!`,
    });
  }
  
  steps.push({
    type: 'done',
    nums,
    currentIndex: nums.length - 1,
    maxReach,
    jumpValue: 0,
    newReach: maxReach,
    description: maxReach >= nums.length - 1 ? 'We can reach the last index. Return true.' : 'Cannot reach the last index. Return false.',
  });
  
  return steps;
}

export function JumpGameVisualizer() {
  const [nums, setNums] = useState([2, 3, 1, 1, 4]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Generate steps when nums changes
  useEffect(() => {
    const newSteps = generateSteps(nums);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [nums]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentStep(s => Math.min(steps.length - 1, s + 1));
    }, 2000 / speed);

    return () => clearTimeout(timeout);
  }, [currentStep, isPlaying, steps.length, speed]);

  const handleInputChange = useCallback((value: string) => {
    try {
      const newNums = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0);
      if (newNums.length > 0) {
        setNums(newNums);
      }
    } catch (error) {
      // Invalid input, ignore
    }
  }, []);

  if (steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const canReachEnd = currentStepData.maxReach >= nums.length - 1;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Jump Game</h1>
        <p className="text-slate-300">
          Determine if you can reach the last index using a greedy approach
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800 rounded-lg p-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Input Array (comma-separated non-negative integers):
        </label>
        <input
          type="text"
          value={nums.join(', ')}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:border-blue-500"
          placeholder="2, 3, 1, 1, 4"
        />
      </div>

      {/* Visualization */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Array Visualization</h3>
          <div className="text-right">
            <div className={`text-sm font-semibold ${
              currentStepData.type === 'success' || (currentStepData.type === 'done' && canReachEnd) 
                ? 'text-green-400' 
                : currentStepData.type === 'failure' 
                ? 'text-red-400' 
                : 'text-slate-400'
            }`}>
              Result: {
                currentStepData.type === 'success' || (currentStepData.type === 'done' && canReachEnd)
                  ? 'TRUE - Can reach end!'
                  : currentStepData.type === 'failure' || (currentStepData.type === 'done' && !canReachEnd)
                  ? 'FALSE - Cannot reach end!'
                  : 'In progress...'
              }
            </div>
            <div className="text-xs text-slate-500">
              Max Reach: {currentStepData.maxReach} | Target: {nums.length - 1}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {nums.map((num, index) => {
            let bgColor = 'bg-slate-700';
            let textColor = 'text-white';
            let borderColor = 'border-slate-600';
            
            // Current position
            if (index === currentStepData.currentIndex) {
              bgColor = 'bg-blue-600';
              borderColor = 'border-blue-400';
            }
            // Reachable positions
            else if (index <= currentStepData.maxReach) {
              bgColor = 'bg-green-600/30';
              borderColor = 'border-green-400';
              textColor = 'text-green-100';
            }
            // Unreachable positions
            else if (currentStepData.type === 'failure' && index > currentStepData.maxReach) {
              bgColor = 'bg-red-600/30';
              borderColor = 'border-red-400';
              textColor = 'text-red-100';
            }
            // Last index (target)
            if (index === nums.length - 1) {
              borderColor = 'border-yellow-400';
              if (index <= currentStepData.maxReach) {
                bgColor = 'bg-yellow-600/40';
                textColor = 'text-yellow-100';
              }
            }
            
            return (
              <motion.div
                key={index}
                className={`relative flex flex-col items-center p-3 rounded-lg border-2 ${bgColor} ${borderColor} min-w-[60px]`}
                initial={{ scale: 0.9 }}
                animate={{ scale: index === currentStepData.currentIndex ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`text-lg font-bold ${textColor}`}>{num}</div>
                <div className="text-xs text-slate-400">i={index}</div>
                {index === currentStepData.currentIndex && (
                  <motion.div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-blue-400"></div>
                  </motion.div>
                )}
                {index === nums.length - 1 && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-semibold">
                    TARGET
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Jump Range Visualization */}
        {currentStepData.type === 'check' || currentStepData.type === 'update-reach' ? (
          <div className="mb-4">
            <div className="text-sm text-slate-400 mb-2">
              From index {currentStepData.currentIndex}, we can jump {currentStepData.jumpValue} steps:
            </div>
            <div className="flex gap-1 h-6">
              {nums.map((_, index) => {
                const isInJumpRange = index > currentStepData.currentIndex && 
                                    index <= currentStepData.currentIndex + currentStepData.jumpValue;
                return (
                  <div
                    key={index}
                    className={`flex-1 rounded ${
                      isInJumpRange 
                        ? 'bg-orange-500/60' 
                        : index === currentStepData.currentIndex 
                        ? 'bg-blue-600/80' 
                        : 'bg-slate-600/30'
                    }`}
                  />
                );
              })}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Orange areas show possible jump destinations
            </div>
          </div>
        ) : null}
      </div>

      {/* Step Description */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            currentStepData.type === 'start' ? 'bg-blue-500' :
            currentStepData.type === 'check' ? 'bg-yellow-500' :
            currentStepData.type === 'update-reach' ? 'bg-green-500' :
            currentStepData.type === 'success' ? 'bg-green-500' :
            currentStepData.type === 'failure' ? 'bg-red-500' :
            'bg-gray-500'
          }`} />
          <span className="text-sm font-semibold text-slate-400">
            {currentStepData.type === 'start' ? 'Initialization' :
             currentStepData.type === 'check' ? 'Checking Position' :
             currentStepData.type === 'update-reach' ? 'Updating Max Reach' :
             currentStepData.type === 'success' ? 'Success!' :
             currentStepData.type === 'failure' ? 'Failed!' :
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
{`public boolean canJump(int[] nums) {
    int maxReach = 0;
    
    for (int i = 0; i < nums.length; i++) {
        // If current index is beyond our reach, return false
        if (i > maxReach) {
            return false;
        }
        
        // Update the maximum reachable index
        maxReach = Math.max(maxReach, i + nums[i]);
        
        // Early termination: if we can reach the last index
        if (maxReach >= nums.length - 1) {
            return true;
        }
    }
    
    return true;
}`}
        </pre>
      </div>
    </div>
  );
}