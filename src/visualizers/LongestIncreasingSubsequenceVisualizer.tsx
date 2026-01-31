import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'compute' | 'done';
  nums: number[];
  dp: number[];
  currentIndex: number;
  bestSequence: number[];
  maxLength: number;
  description: string;
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  const n = nums.length;
  const dp: number[] = new Array(n).fill(1);
  const parent: number[] = new Array(n).fill(-1);
  
  steps.push({
    type: 'start',
    nums,
    dp: [...dp],
    currentIndex: -1,
    bestSequence: [],
    maxLength: 0,
    description: `Find the length of the longest increasing subsequence`,
  });
  
  if (n === 0) return steps;
  
  // DP computation
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        parent[i] = j;
      }
    }
    
    steps.push({
      type: 'compute',
      nums,
      dp: [...dp],
      currentIndex: i,
      bestSequence: [],
      maxLength: Math.max(...dp),
      description: `Processing nums[${i}] = ${nums[i]}. LIS ending at index ${i} has length ${dp[i]}`,
    });
  }
  
  // Find the best sequence
  const maxLen = Math.max(...dp);
  const maxIndex = dp.indexOf(maxLen);
  const sequence: number[] = [];
  
  let current = maxIndex;
  while (current !== -1) {
    sequence.unshift(nums[current]);
    current = parent[current];
  }
  
  steps.push({
    type: 'done',
    nums,
    dp: [...dp],
    currentIndex: n - 1,
    bestSequence: sequence,
    maxLength: maxLen,
    description: `Longest Increasing Subsequence: [${sequence.join(', ')}] with length ${maxLen}`,
  });
  
  return steps;
}

export function LongestIncreasingSubsequenceVisualizer() {
  const [input, setInput] = useState('10,22,9,33,21,50,41,60');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Longest Increasing Subsequence</h1>
        <p className="text-slate-400">
          Find the length of the longest strictly increasing subsequence in an array.
          Classic DP: dp[i] = length of LIS ending at index i.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Array:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
        />
      </div>
      
      {/* Array Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Input Array</h3>
        <div className="flex gap-3 justify-center flex-wrap">
          {currentStepData?.nums.map((val, i) => {
            const isActive = i === currentStepData.currentIndex;
            const isInBestSequence = currentStepData.bestSequence.includes(val) && 
                                   currentStepData.type === 'done';
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                animate={{ scale: isActive ? 1.1 : 1 }}
              >
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-lg font-bold ${
                  isActive ? 'bg-yellow-500 text-black' :
                  isInBestSequence ? 'bg-green-500 text-white' :
                  'bg-slate-700 text-white'
                }`}>
                  {val}
                </div>
                <span className="text-xs text-slate-500 mt-1">i={i}</span>
                {isInBestSequence && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-400 text-xs mt-1"
                  >
                    ✓ In LIS
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* DP Array */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">DP Array (LIS length ending at index i)</h3>
        <div className="flex gap-3 justify-center flex-wrap">
          {currentStepData?.dp.map((val, i) => {
            const isActive = i === currentStepData.currentIndex;
            const isMax = val === currentStepData.maxLength && currentStepData.maxLength > 0;
            
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-xs text-slate-500 mb-1">dp[{i}]</span>
                <motion.div
                  className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold ${
                    isActive ? 'bg-yellow-500 text-black' :
                    isMax && currentStepData.type === 'done' ? 'bg-green-500 text-white' :
                    val > 1 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white'
                  }`}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                >
                  {val}
                </motion.div>
              </div>
            );
          })}
        </div>
        
        {currentStepData?.type === 'compute' && (
          <div className="mt-6 space-y-2">
            <div className="text-center text-sm text-slate-300">
              For each j &lt; {currentStepData.currentIndex}, if nums[j] &lt; nums[{currentStepData.currentIndex}]:
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg font-mono text-sm">
                <span className="text-yellow-400">dp[{currentStepData.currentIndex}]</span>
                <span className="text-slate-400">= max(dp[{currentStepData.currentIndex}], dp[j] + 1)</span>
              </div>
            </div>
          </div>
        )}
        
        {currentStepData?.type === 'done' && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900 rounded-lg">
              <span className="text-green-400 font-semibold">
                Maximum LIS Length: {currentStepData.maxLength}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Best Sequence Display */}
      {currentStepData?.type === 'done' && currentStepData.bestSequence.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Longest Increasing Subsequence</h3>
          <div className="flex gap-3 justify-center flex-wrap">
            {currentStepData.bestSequence.map((val, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-lg flex items-center justify-center text-lg font-bold bg-green-500 text-white">
                  {val}
                </div>
                {i < currentStepData.bestSequence.length - 1 && (
                  <div className="text-slate-400 text-sm mt-1">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
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
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int lengthOfLIS(int[] nums) {
    if (nums.length == 0) return 0;
    
    int[] dp = new int[nums.length];
    Arrays.fill(dp, 1); // Each element forms LIS of length 1
    
    for (int i = 1; i < nums.length; i++) {
        for (int j = 0; j < i; j++) {
            // If we can extend LIS ending at j
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    
    return Arrays.stream(dp).max().getAsInt();
}`}
        </pre>
        
        <div className="mt-4 text-sm text-slate-400">
          <p><strong>Time Complexity:</strong> O(n²) - nested loops</p>
          <p><strong>Space Complexity:</strong> O(n) - dp array</p>
          <p><strong>Key Insight:</strong> dp[i] = length of LIS ending at index i</p>
        </div>
      </div>
    </div>
  );
}