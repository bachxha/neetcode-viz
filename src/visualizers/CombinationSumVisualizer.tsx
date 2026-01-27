import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'try' | 'add' | 'exceed' | 'found' | 'backtrack';
  path: number[];
  currentSum: number;
  target: number;
  candidateIndex: number;
  candidates: number[];
  solutions: number[][];
  description: string;
}

function generateSteps(candidates: number[], target: number): Step[] {
  const steps: Step[] = [];
  const solutions: number[][] = [];
  const sorted = [...candidates].sort((a, b) => a - b);
  
  steps.push({
    type: 'start',
    path: [],
    currentSum: 0,
    target,
    candidateIndex: -1,
    candidates: sorted,
    solutions: [],
    description: `Find combinations that sum to ${target}. Can reuse numbers.`,
  });
  
  function backtrack(start: number, path: number[], currentSum: number) {
    if (currentSum === target) {
      solutions.push([...path]);
      steps.push({
        type: 'found',
        path: [...path],
        currentSum,
        target,
        candidateIndex: -1,
        candidates: sorted,
        solutions: solutions.map(s => [...s]),
        description: `Found solution: [${path.join(', ')}] = ${target}!`,
      });
      return;
    }
    
    if (currentSum > target) {
      steps.push({
        type: 'exceed',
        path: [...path],
        currentSum,
        target,
        candidateIndex: -1,
        candidates: sorted,
        solutions: solutions.map(s => [...s]),
        description: `Sum ${currentSum} exceeds target ${target}, backtrack`,
      });
      return;
    }
    
    for (let i = start; i < sorted.length; i++) {
      const num = sorted[i];
      
      // Pruning: if adding this number exceeds target, skip rest (sorted)
      if (currentSum + num > target) {
        steps.push({
          type: 'exceed',
          path: [...path],
          currentSum,
          target,
          candidateIndex: i,
          candidates: sorted,
          solutions: solutions.map(s => [...s]),
          description: `${currentSum} + ${num} = ${currentSum + num} > ${target}, prune remaining`,
        });
        break;
      }
      
      steps.push({
        type: 'try',
        path: [...path],
        currentSum,
        target,
        candidateIndex: i,
        candidates: sorted,
        solutions: solutions.map(s => [...s]),
        description: `Try adding ${num} (sum would be ${currentSum + num})`,
      });
      
      path.push(num);
      steps.push({
        type: 'add',
        path: [...path],
        currentSum: currentSum + num,
        target,
        candidateIndex: i,
        candidates: sorted,
        solutions: solutions.map(s => [...s]),
        description: `Add ${num}, current path: [${path.join(', ')}], sum: ${currentSum + num}`,
      });
      
      backtrack(i, path, currentSum + num); // i, not i+1, since we can reuse
      
      path.pop();
      if (path.length > 0 || i < sorted.length - 1) {
        steps.push({
          type: 'backtrack',
          path: [...path],
          currentSum,
          target,
          candidateIndex: i,
          candidates: sorted,
          solutions: solutions.map(s => [...s]),
          description: `Backtrack, remove ${num}`,
        });
      }
    }
  }
  
  backtrack(0, [], 0);
  
  return steps;
}

export function CombinationSumVisualizer() {
  const [candidatesInput, setCandidatesInput] = useState('2,3,6,7');
  const [targetInput, setTargetInput] = useState('7');
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
    }, 700 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Combination Sum (Backtracking)</h1>
        <p className="text-slate-400">
          Find all unique combinations where the candidate numbers sum to target.
          Each number can be used <strong>unlimited times</strong>.
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
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Candidates */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Candidates (sorted)</h3>
          <div className="flex gap-2 flex-wrap">
            {currentStepData?.candidates.map((num, i) => (
              <motion.div
                key={i}
                className={`px-4 py-2 rounded-lg font-mono font-bold ${
                  currentStepData.candidateIndex === i
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-700'
                }`}
                animate={{
                  scale: currentStepData.candidateIndex === i ? 1.1 : 1,
                }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Current Path */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Current Path</h3>
          <div className="flex gap-2 items-center flex-wrap">
            {currentStepData?.path.length === 0 ? (
              <span className="text-slate-500">Empty</span>
            ) : (
              <>
                {currentStepData?.path.map((num, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 bg-blue-500 rounded font-mono font-bold"
                  >
                    {num}
                  </motion.span>
                ))}
                <span className="text-slate-400 mx-2">=</span>
                <span className={`font-bold ${
                  currentStepData?.currentSum === currentStepData?.target
                    ? 'text-green-400'
                    : currentStepData?.currentSum > currentStepData?.target
                    ? 'text-red-400'
                    : 'text-white'
                }`}>
                  {currentStepData?.currentSum}
                </span>
                <span className="text-slate-400">/ {currentStepData?.target}</span>
              </>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                currentStepData?.currentSum === currentStepData?.target
                  ? 'bg-green-500'
                  : currentStepData?.currentSum > currentStepData?.target
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              animate={{
                width: `${Math.min(100, ((currentStepData?.currentSum || 0) / (currentStepData?.target || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Solutions Found */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Solutions Found ({currentStepData?.solutions.length || 0})
        </h3>
        <div className="flex gap-2 flex-wrap min-h-[40px]">
          <AnimatePresence>
            {currentStepData?.solutions.map((solution, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-2 bg-green-500/20 border border-green-500 rounded-lg font-mono text-green-400"
              >
                [{solution.join(', ')}]
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
            currentStepData?.type === 'exceed' ? 'bg-red-500' :
            currentStepData?.type === 'backtrack' ? 'bg-orange-500' :
            currentStepData?.type === 'add' ? 'bg-blue-500' :
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
      
      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public List<List<Integer>> combinationSum(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(candidates);  // Sort for pruning
    backtrack(candidates, target, 0, new ArrayList<>(), 0, result);
    return result;
}

private void backtrack(int[] candidates, int target, int start,
                       List<Integer> path, int currentSum,
                       List<List<Integer>> result) {
    if (currentSum == target) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    for (int i = start; i < candidates.length; i++) {
        // Pruning: if this candidate exceeds remaining, skip rest
        if (currentSum + candidates[i] > target) break;
        
        path.add(candidates[i]);
        // Pass i (not i+1) because we can reuse same element
        backtrack(candidates, target, i, path,
                  currentSum + candidates[i], result);
        path.remove(path.size() - 1);  // Backtrack
    }
}`}
        </pre>
      </div>
    </div>
  );
}
