import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'try' | 'skip-dup' | 'include' | 'collect' | 'backtrack';
  nums: number[];
  path: number[];
  index: number;
  subsets: number[][];
  description: string;
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  const sorted = [...nums].sort((a, b) => a - b);
  const subsets: number[][] = [];
  
  steps.push({
    type: 'start',
    nums: sorted,
    path: [],
    index: 0,
    subsets: [],
    description: `Generate subsets of [${sorted.join(', ')}] (sorted, may have duplicates)`,
  });
  
  function backtrack(start: number, path: number[]) {
    subsets.push([...path]);
    steps.push({
      type: 'collect',
      nums: sorted,
      path: [...path],
      index: start,
      subsets: subsets.map(s => [...s]),
      description: `Collect subset: [${path.join(', ') || 'empty'}]`,
    });
    
    for (let i = start; i < sorted.length; i++) {
      // Skip duplicates at the same level
      if (i > start && sorted[i] === sorted[i - 1]) {
        steps.push({
          type: 'skip-dup',
          nums: sorted,
          path: [...path],
          index: i,
          subsets: subsets.map(s => [...s]),
          description: `Skip duplicate: ${sorted[i]} (same as previous at this level)`,
        });
        continue;
      }
      
      steps.push({
        type: 'try',
        nums: sorted,
        path: [...path],
        index: i,
        subsets: subsets.map(s => [...s]),
        description: `Try including ${sorted[i]} at index ${i}`,
      });
      
      path.push(sorted[i]);
      steps.push({
        type: 'include',
        nums: sorted,
        path: [...path],
        index: i,
        subsets: subsets.map(s => [...s]),
        description: `Include ${sorted[i]}, path = [${path.join(', ')}]`,
      });
      
      backtrack(i + 1, path);
      
      path.pop();
      steps.push({
        type: 'backtrack',
        nums: sorted,
        path: [...path],
        index: i,
        subsets: subsets.map(s => [...s]),
        description: `Backtrack, remove ${sorted[i]}`,
      });
    }
  }
  
  backtrack(0, []);
  return steps;
}

export function SubsetsIIVisualizer() {
  const [input, setInput] = useState('1,2,2');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 0 && nums.length <= 5) {
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
    }, 600 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Subsets II (with Duplicates)</h1>
        <p className="text-slate-400">
          Generate all unique subsets. Key insight: <strong>sort first</strong>, then skip 
          duplicates at the same recursion level.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Numbers (can have duplicates):</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          placeholder="1, 2, 2"
        />
      </div>
      
      {/* Input Array */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Sorted Array</h3>
        <div className="flex gap-2 justify-center">
          {currentStepData?.nums.map((num, i) => {
            const isActive = i === currentStepData.index;
            const isSkipped = currentStepData.type === 'skip-dup' && i === currentStepData.index;
            return (
              <motion.div
                key={i}
                className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                  isSkipped ? 'bg-red-500/50 line-through' :
                  isActive ? 'bg-yellow-500 text-black' :
                  'bg-slate-700'
                }`}
                animate={{ scale: isActive ? 1.1 : 1 }}
              >
                <span className="text-xl font-bold">{num}</span>
                <span className="text-xs opacity-70">i={i}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Current Path */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Current Path</h3>
        <div className="flex gap-2 justify-center min-h-[48px] items-center">
          {currentStepData?.path.length ? (
            currentStepData.path.map((num, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-xl font-bold"
              >
                {num}
              </motion.div>
            ))
          ) : (
            <span className="text-slate-500">[empty]</span>
          )}
        </div>
      </div>
      
      {/* Subsets Found */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Unique Subsets ({currentStepData?.subsets.length || 0})
        </h3>
        <div className="flex gap-2 flex-wrap min-h-[40px]">
          <AnimatePresence>
            {currentStepData?.subsets.map((subset, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-2 bg-green-500/20 border border-green-500 rounded-lg font-mono text-green-400"
              >
                [{subset.join(', ')}]
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'collect' ? 'bg-green-500' :
            currentStepData?.type === 'skip-dup' ? 'bg-red-500' :
            currentStepData?.type === 'backtrack' ? 'bg-orange-500' :
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
{`public List<List<Integer>> subsetsWithDup(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);  // IMPORTANT: Sort first!
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start, 
                       List<Integer> path, List<List<Integer>> result) {
    result.add(new ArrayList<>(path));  // Collect current subset
    
    for (int i = start; i < nums.length; i++) {
        // Skip duplicates at the same recursion level
        if (i > start && nums[i] == nums[i - 1]) {
            continue;  // Key insight!
        }
        
        path.add(nums[i]);
        backtrack(nums, i + 1, path, result);
        path.remove(path.size() - 1);  // Backtrack
    }
}`}
        </pre>
      </div>
    </div>
  );
}
