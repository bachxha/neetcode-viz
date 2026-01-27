import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'swap' | 'recurse' | 'found' | 'unswap';
  nums: number[];
  index: number;
  swapWith: number;
  permutations: number[][];
  description: string;
  fixed: number;  // How many positions are fixed
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  const permutations: number[][] = [];
  const arr = [...nums];
  
  steps.push({
    type: 'start',
    nums: [...arr],
    index: 0,
    swapWith: 0,
    permutations: [],
    description: `Generate all permutations of [${arr.join(', ')}]`,
    fixed: 0,
  });
  
  function backtrack(start: number) {
    if (start === arr.length) {
      permutations.push([...arr]);
      steps.push({
        type: 'found',
        nums: [...arr],
        index: start,
        swapWith: start,
        permutations: permutations.map(p => [...p]),
        description: `Found permutation: [${arr.join(', ')}]`,
        fixed: arr.length,
      });
      return;
    }
    
    for (let i = start; i < arr.length; i++) {
      if (i !== start) {
        steps.push({
          type: 'swap',
          nums: [...arr],
          index: start,
          swapWith: i,
          permutations: permutations.map(p => [...p]),
          description: `Swap position ${start} (${arr[start]}) with position ${i} (${arr[i]})`,
          fixed: start,
        });
      }
      
      // Swap
      [arr[start], arr[i]] = [arr[i], arr[start]];
      
      steps.push({
        type: 'recurse',
        nums: [...arr],
        index: start,
        swapWith: i,
        permutations: permutations.map(p => [...p]),
        description: i === start 
          ? `Fix position ${start} as ${arr[start]}, recurse`
          : `After swap: [${arr.join(', ')}], fix position ${start}`,
        fixed: start + 1,
      });
      
      backtrack(start + 1);
      
      // Unswap
      [arr[start], arr[i]] = [arr[i], arr[start]];
      
      if (i !== start) {
        steps.push({
          type: 'unswap',
          nums: [...arr],
          index: start,
          swapWith: i,
          permutations: permutations.map(p => [...p]),
          description: `Backtrack: unswap position ${start} and ${i}`,
          fixed: start,
        });
      }
    }
  }
  
  backtrack(0);
  
  return steps;
}

export function PermutationsVisualizer() {
  const [input, setInput] = useState('1,2,3');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 0 && nums.length <= 4) {
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
    
    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, 700 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  const getBoxColor = (index: number) => {
    if (!currentStepData) return 'bg-slate-700';
    
    if (index < currentStepData.fixed) {
      return 'bg-green-600'; // Fixed position
    }
    if (index === currentStepData.index || index === currentStepData.swapWith) {
      if (currentStepData.type === 'swap' || currentStepData.type === 'unswap') {
        return 'bg-yellow-500';
      }
    }
    return 'bg-slate-600';
  };
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Permutations (Backtracking)</h1>
        <p className="text-slate-400">
          Generate all permutations using the swap approach. Fix each position one by one
          by swapping elements.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Numbers:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          placeholder="1, 2, 3"
        />
        <span className="text-xs text-slate-500">(max 4 for visibility)</span>
      </div>
      
      {/* Current Array State */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Current Array State</h3>
        
        <div className="flex justify-center gap-2 mb-4">
          {currentStepData?.nums.map((num, i) => (
            <motion.div
              key={i}
              className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg ${getBoxColor(i)}`}
              animate={{
                scale: (currentStepData.type === 'swap' || currentStepData.type === 'unswap') &&
                       (i === currentStepData.index || i === currentStepData.swapWith)
                  ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-2xl font-bold">{num}</span>
              <span className="text-xs text-slate-300">idx {i}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Swap arrows */}
        {(currentStepData?.type === 'swap') && currentStepData.index !== currentStepData.swapWith && (
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-yellow-400 text-center"
            >
              ↔ Swapping positions {currentStepData.index} and {currentStepData.swapWith}
            </motion.div>
          </div>
        )}
        
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-600"></span> Fixed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-500"></span> Swapping
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-600"></span> Unfixed
          </span>
        </div>
      </div>
      
      {/* Permutations Found */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Permutations Found ({currentStepData?.permutations.length || 0} / {currentStepData ? 
            Array.from({length: currentStepData.nums.length}, (_, i) => i + 1).reduce((a, b) => a * b, 1) : 0})
        </h3>
        <div className="flex gap-2 flex-wrap min-h-[40px]">
          <AnimatePresence>
            {currentStepData?.permutations.map((perm, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-2 bg-green-500/20 border border-green-500 rounded-lg font-mono text-green-400"
              >
                [{perm.join(', ')}]
              </motion.div>
            ))}
          </AnimatePresence>
          {(!currentStepData?.permutations.length) && (
            <span className="text-slate-500">None yet</span>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'found' ? 'bg-green-500' :
            currentStepData?.type === 'swap' ? 'bg-yellow-500' :
            currentStepData?.type === 'unswap' ? 'bg-orange-500' :
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
{`public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, result);
    return result;
}

private void backtrack(int[] nums, int start, List<List<Integer>> result) {
    if (start == nums.length) {
        // Convert array to list and add to result
        List<Integer> perm = new ArrayList<>();
        for (int num : nums) perm.add(num);
        result.add(perm);
        return;
    }
    
    for (int i = start; i < nums.length; i++) {
        swap(nums, start, i);        // Swap to fix position 'start'
        backtrack(nums, start + 1, result);  // Recurse
        swap(nums, start, i);        // Backtrack (unswap)
    }
}

private void swap(int[] nums, int i, int j) {
    int temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
}`}
        </pre>
      </div>
    </div>
  );
}
