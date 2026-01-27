import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'try' | 'skip-dup' | 'add' | 'exceed' | 'found' | 'backtrack';
  candidates: number[];
  path: number[];
  currentSum: number;
  target: number;
  index: number;
  solutions: number[][];
  description: string;
}

function generateSteps(candidates: number[], target: number): Step[] {
  const steps: Step[] = [];
  const sorted = [...candidates].sort((a, b) => a - b);
  const solutions: number[][] = [];
  
  steps.push({
    type: 'start',
    candidates: sorted,
    path: [],
    currentSum: 0,
    target,
    index: 0,
    solutions: [],
    description: `Find combinations summing to ${target}. Each number used ONCE. May have duplicates.`,
  });
  
  function backtrack(start: number, path: number[], currentSum: number) {
    if (currentSum === target) {
      solutions.push([...path]);
      steps.push({
        type: 'found',
        candidates: sorted,
        path: [...path],
        currentSum,
        target,
        index: -1,
        solutions: solutions.map(s => [...s]),
        description: `Found: [${path.join(', ')}] = ${target}!`,
      });
      return;
    }
    
    for (let i = start; i < sorted.length; i++) {
      const num = sorted[i];
      
      // Skip duplicates at the same level
      if (i > start && sorted[i] === sorted[i - 1]) {
        steps.push({
          type: 'skip-dup',
          candidates: sorted,
          path: [...path],
          currentSum,
          target,
          index: i,
          solutions: solutions.map(s => [...s]),
          description: `Skip duplicate ${num} (same as previous at this level)`,
        });
        continue;
      }
      
      // Pruning
      if (currentSum + num > target) {
        steps.push({
          type: 'exceed',
          candidates: sorted,
          path: [...path],
          currentSum,
          target,
          index: i,
          solutions: solutions.map(s => [...s]),
          description: `${currentSum} + ${num} = ${currentSum + num} > ${target}, prune rest`,
        });
        break;
      }
      
      steps.push({
        type: 'try',
        candidates: sorted,
        path: [...path],
        currentSum,
        target,
        index: i,
        solutions: solutions.map(s => [...s]),
        description: `Try ${num} (sum would be ${currentSum + num})`,
      });
      
      path.push(num);
      steps.push({
        type: 'add',
        candidates: sorted,
        path: [...path],
        currentSum: currentSum + num,
        target,
        index: i,
        solutions: solutions.map(s => [...s]),
        description: `Add ${num}, path = [${path.join(', ')}], sum = ${currentSum + num}`,
      });
      
      backtrack(i + 1, path, currentSum + num);  // i+1 because each number used once
      
      path.pop();
      steps.push({
        type: 'backtrack',
        candidates: sorted,
        path: [...path],
        currentSum,
        target,
        index: i,
        solutions: solutions.map(s => [...s]),
        description: `Backtrack, remove ${num}`,
      });
    }
  }
  
  backtrack(0, [], 0);
  return steps;
}

export function CombinationSumIIVisualizer() {
  const [candidatesInput, setCandidatesInput] = useState('10,1,2,7,6,1,5');
  const [targetInput, setTargetInput] = useState('8');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const candidates = candidatesInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    const target = parseInt(targetInput);
    if (candidates.length > 0 && !isNaN(target) && target > 0) {
      const newSteps = generateSteps(candidates, target);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [candidatesInput, targetInput]);
  
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
        <h1 className="text-3xl font-bold mb-2">Combination Sum II</h1>
        <p className="text-slate-400">
          Each number used <strong>at most once</strong>. Input may have duplicates.
          Combines pruning + duplicate skipping.
        </p>
      </div>
      
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-1">Candidates:</label>
          <input
            type="text"
            value={candidatesInput}
            onChange={(e) => setCandidatesInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-1">Target:</label>
          <input
            type="text"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          />
        </div>
      </div>
      
      {/* Candidates */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Sorted Candidates</h3>
        <div className="flex gap-2 flex-wrap justify-center">
          {currentStepData?.candidates.map((num, i) => {
            const isActive = i === currentStepData.index;
            const isSkipped = currentStepData.type === 'skip-dup' && i === currentStepData.index;
            const isPruned = currentStepData.type === 'exceed' && i >= currentStepData.index;
            return (
              <motion.div
                key={i}
                className={`px-3 py-2 rounded-lg font-mono font-bold ${
                  isSkipped ? 'bg-orange-500/50 line-through' :
                  isPruned ? 'bg-red-500/30 line-through' :
                  isActive ? 'bg-yellow-500 text-black' :
                  'bg-slate-700'
                }`}
                animate={{ scale: isActive ? 1.1 : 1 }}
              >
                {num}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Current Path & Sum */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Current Path</h3>
        <div className="flex items-center gap-4 justify-center">
          <div className="flex gap-2 min-w-[100px]">
            {currentStepData?.path.length ? (
              currentStepData.path.map((num, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-blue-500 rounded font-mono font-bold"
                >
                  {num}
                </motion.span>
              ))
            ) : (
              <span className="text-slate-500">Empty</span>
            )}
          </div>
          <span className="text-slate-400">=</span>
          <span className={`text-xl font-bold ${
            currentStepData?.currentSum === currentStepData?.target ? 'text-green-400' :
            (currentStepData?.currentSum || 0) > (currentStepData?.target || 0) ? 'text-red-400' :
            'text-white'
          }`}>
            {currentStepData?.currentSum || 0}
          </span>
          <span className="text-slate-400">/ {currentStepData?.target}</span>
        </div>
      </div>
      
      {/* Solutions Found */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Solutions ({currentStepData?.solutions.length || 0})
        </h3>
        <div className="flex gap-2 flex-wrap min-h-[40px]">
          <AnimatePresence>
            {currentStepData?.solutions.map((sol, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-2 bg-green-500/20 border border-green-500 rounded-lg font-mono text-green-400"
              >
                [{sol.join(', ')}]
              </motion.div>
            ))}
          </AnimatePresence>
          {(!currentStepData?.solutions.length) && (
            <span className="text-slate-500">None yet</span>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'found' ? 'bg-green-500' :
            currentStepData?.type === 'skip-dup' ? 'bg-orange-500' :
            currentStepData?.type === 'exceed' ? 'bg-red-500' :
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
{`public List<List<Integer>> combinationSum2(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(candidates);  // Sort for pruning + dedup
    backtrack(candidates, target, 0, new ArrayList<>(), 0, result);
    return result;
}

private void backtrack(int[] candidates, int target, int start,
                       List<Integer> path, int sum,
                       List<List<Integer>> result) {
    if (sum == target) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    for (int i = start; i < candidates.length; i++) {
        // Skip duplicates at same level
        if (i > start && candidates[i] == candidates[i - 1]) continue;
        
        // Pruning: if exceeds, skip rest (sorted)
        if (sum + candidates[i] > target) break;
        
        path.add(candidates[i]);
        backtrack(candidates, target, i + 1, path,  // i+1: use each once
                  sum + candidates[i], result);
        path.remove(path.size() - 1);
    }
}`}
        </pre>
      </div>
    </div>
  );
}
