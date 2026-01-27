import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'base' | 'compute' | 'done';
  n: number;
  dp: number[];
  currentIndex: number;
  description: string;
}

function generateSteps(n: number): Step[] {
  const steps: Step[] = [];
  const dp: number[] = new Array(n + 1).fill(0);
  
  steps.push({
    type: 'start',
    n,
    dp: [...dp],
    currentIndex: -1,
    description: `Find number of ways to climb ${n} stairs (1 or 2 steps at a time)`,
  });
  
  // Base cases
  dp[0] = 1;
  steps.push({
    type: 'base',
    n,
    dp: [...dp],
    currentIndex: 0,
    description: `Base case: dp[0] = 1 (one way to stay at ground)`,
  });
  
  dp[1] = 1;
  steps.push({
    type: 'base',
    n,
    dp: [...dp],
    currentIndex: 1,
    description: `Base case: dp[1] = 1 (one way to reach step 1)`,
  });
  
  // Fill the rest
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({
      type: 'compute',
      n,
      dp: [...dp],
      currentIndex: i,
      description: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`,
    });
  }
  
  steps.push({
    type: 'done',
    n,
    dp: [...dp],
    currentIndex: n,
    description: `Answer: ${dp[n]} ways to climb ${n} stairs`,
  });
  
  return steps;
}

export function ClimbingStairsVisualizer() {
  const [n, setN] = useState(5);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    if (n >= 2 && n <= 10) {
      const newSteps = generateSteps(n);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [n]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, 800 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Climbing Stairs</h1>
        <p className="text-slate-400">
          Classic DP problem. Each step can be reached from the previous step (1 step) 
          or from two steps back (2 steps). This is essentially Fibonacci!
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Number of stairs (n):</label>
        <input
          type="number"
          min={2}
          max={10}
          value={n}
          onChange={(e) => setN(parseInt(e.target.value) || 2)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="w-20 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
        />
      </div>
      
      {/* Staircase Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Staircase</h3>
        <div className="flex items-end justify-center gap-1" style={{ minHeight: 200 }}>
          {currentStepData?.dp.map((ways, i) => {
            const isActive = i === currentStepData.currentIndex;
            const isFilled = ways > 0;
            const height = 30 + i * 25;
            
            return (
              <motion.div
                key={i}
                className={`w-14 rounded-t-lg flex flex-col items-center justify-end pb-2 ${
                  isActive ? 'bg-yellow-500' :
                  isFilled ? 'bg-blue-500' :
                  'bg-slate-700'
                }`}
                style={{ height }}
                animate={{ scale: isActive ? 1.05 : 1 }}
              >
                <span className="text-xs opacity-70">step {i}</span>
                {isFilled && (
                  <motion.span 
                    className="text-lg font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {ways}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* DP Array */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">DP Array</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {currentStepData?.dp.map((val, i) => {
            const isActive = i === currentStepData.currentIndex;
            const isPrev1 = currentStepData.type === 'compute' && i === currentStepData.currentIndex - 1;
            const isPrev2 = currentStepData.type === 'compute' && i === currentStepData.currentIndex - 2;
            
            return (
              <motion.div
                key={i}
                className={`flex flex-col items-center`}
                animate={{ scale: isActive ? 1.1 : 1 }}
              >
                <span className="text-xs text-slate-500 mb-1">dp[{i}]</span>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                  isActive ? 'bg-yellow-500 text-black' :
                  isPrev1 || isPrev2 ? 'bg-green-500' :
                  val > 0 ? 'bg-blue-500' :
                  'bg-slate-700'
                }`}>
                  {val || '?'}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Formula visualization */}
        {currentStepData?.type === 'compute' && (
          <div className="mt-4 text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg font-mono"
            >
              <span className="text-yellow-400">dp[{currentStepData.currentIndex}]</span>
              <span className="text-slate-400">=</span>
              <span className="text-green-400">dp[{currentStepData.currentIndex - 1}]</span>
              <span className="text-slate-400">+</span>
              <span className="text-green-400">dp[{currentStepData.currentIndex - 2}]</span>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Intuition */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Intuition</h3>
        <p className="text-sm text-slate-300">
          To reach step <strong>i</strong>, you either came from step <strong>i-1</strong> (took 1 step) 
          or from step <strong>i-2</strong> (took 2 steps). So the number of ways to reach step i 
          is the sum of ways to reach i-1 and i-2. This is the Fibonacci recurrence!
        </p>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'done' ? 'bg-green-500' :
            currentStepData?.type === 'compute' ? 'bg-yellow-500' :
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
      
      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int climbStairs(int n) {
    if (n <= 2) return n;
    
    int[] dp = new int[n + 1];
    dp[0] = 1;  // Base case: 1 way to stay at ground
    dp[1] = 1;  // Base case: 1 way to reach step 1
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];  // Fibonacci!
    }
    
    return dp[n];
}

// Space-optimized version (O(1) space):
public int climbStairsOptimized(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`}
        </pre>
      </div>
    </div>
  );
}
