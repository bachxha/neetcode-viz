import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'base' | 'compute' | 'done';
  nums: number[];
  dp: number[];
  currentIndex: number;
  robbed: boolean[];
  description: string;
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  const n = nums.length;
  const dp: number[] = new Array(n).fill(0);
  const robbed: boolean[] = new Array(n).fill(false);
  
  steps.push({
    type: 'start',
    nums,
    dp: [...dp],
    currentIndex: -1,
    robbed: [...robbed],
    description: `Maximize robbery without hitting adjacent houses`,
  });
  
  if (n === 0) return steps;
  
  dp[0] = nums[0];
  robbed[0] = true;
  steps.push({
    type: 'base',
    nums,
    dp: [...dp],
    currentIndex: 0,
    robbed: [...robbed],
    description: `Base: dp[0] = ${nums[0]} (rob first house)`,
  });
  
  if (n === 1) {
    steps.push({
      type: 'done',
      nums,
      dp: [...dp],
      currentIndex: 0,
      robbed: [...robbed],
      description: `Answer: $${dp[0]}`,
    });
    return steps;
  }
  
  dp[1] = Math.max(nums[0], nums[1]);
  robbed[1] = nums[1] > nums[0];
  steps.push({
    type: 'base',
    nums,
    dp: [...dp],
    currentIndex: 1,
    robbed: [...robbed],
    description: `Base: dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}`,
  });
  
  for (let i = 2; i < n; i++) {
    const robCurrent = dp[i - 2] + nums[i];
    const skipCurrent = dp[i - 1];
    dp[i] = Math.max(robCurrent, skipCurrent);
    robbed[i] = robCurrent > skipCurrent;
    
    steps.push({
      type: 'compute',
      nums,
      dp: [...dp],
      currentIndex: i,
      robbed: [...robbed],
      description: `dp[${i}] = max(rob: ${dp[i-2]}+${nums[i]}=${robCurrent}, skip: ${skipCurrent}) = ${dp[i]}`,
    });
  }
  
  steps.push({
    type: 'done',
    nums,
    dp: [...dp],
    currentIndex: n - 1,
    robbed: [...robbed],
    description: `Maximum loot: $${dp[n - 1]}`,
  });
  
  return steps;
}

export function HouseRobberVisualizer() {
  const [input, setInput] = useState('2,7,9,3,1');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0);
    if (nums.length > 0 && nums.length <= 10) {
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 800 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">House Robber</h1>
        <p className="text-slate-400">
          Rob houses for maximum money, but can't rob adjacent houses. 
          Classic "take or skip" DP pattern.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">House values:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
        />
      </div>
      
      {/* Houses */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Houses</h3>
        <div className="flex gap-3 justify-center flex-wrap">
          {currentStepData?.nums.map((val, i) => {
            const isActive = i === currentStepData.currentIndex;
            const wouldRob = currentStepData.robbed[i];
            const isPrev1 = currentStepData.type === 'compute' && i === currentStepData.currentIndex - 1;
            const isPrev2 = currentStepData.type === 'compute' && i === currentStepData.currentIndex - 2;
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                animate={{ scale: isActive ? 1.1 : 1 }}
              >
                <div className={`w-16 h-20 rounded-lg flex flex-col items-center justify-center ${
                  isActive ? 'bg-yellow-500 text-black' :
                  isPrev2 ? 'bg-green-500' :
                  isPrev1 ? 'bg-orange-500' :
                  'bg-slate-700'
                }`}>
                  <span className="text-2xl">🏠</span>
                  <span className="font-bold">${val}</span>
                </div>
                <span className="text-xs text-slate-500 mt-1">House {i}</span>
                {currentStepData.type === 'done' && wouldRob && i <= currentStepData.currentIndex && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-400 text-xs"
                  >
                    💰 Robbed
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* DP Array */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">DP Array (max money up to house i)</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {currentStepData?.dp.map((val, i) => {
            const isActive = i === currentStepData.currentIndex;
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-xs text-slate-500 mb-1">dp[{i}]</span>
                <motion.div
                  className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold ${
                    isActive ? 'bg-yellow-500 text-black' :
                    val > 0 ? 'bg-blue-500' : 'bg-slate-700'
                  }`}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                >
                  ${val}
                </motion.div>
              </div>
            );
          })}
        </div>
        
        {currentStepData?.type === 'compute' && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg font-mono text-sm">
              <span className="text-yellow-400">dp[{currentStepData.currentIndex}]</span>
              <span className="text-slate-400">= max(</span>
              <span className="text-green-400">dp[{currentStepData.currentIndex-2}] + nums[{currentStepData.currentIndex}]</span>
              <span className="text-slate-400">,</span>
              <span className="text-orange-400">dp[{currentStepData.currentIndex-1}]</span>
              <span className="text-slate-400">)</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'done' ? 'bg-green-500' : 'bg-yellow-500'
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
{`public int rob(int[] nums) {
    if (nums.length == 0) return 0;
    if (nums.length == 1) return nums[0];
    
    int[] dp = new int[nums.length];
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);
    
    for (int i = 2; i < nums.length; i++) {
        // Either rob this house (dp[i-2] + nums[i])
        // Or skip it (dp[i-1])
        dp[i] = Math.max(dp[i - 2] + nums[i], dp[i - 1]);
    }
    
    return dp[nums.length - 1];
}`}
        </pre>
      </div>
    </div>
  );
}
