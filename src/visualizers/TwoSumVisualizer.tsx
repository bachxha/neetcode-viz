import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'check' | 'add' | 'found' | 'done';
  nums: number[];
  target: number;
  currentIndex: number;
  hashMap: Record<number, number>; // value -> index
  complement: number | null;
  foundPair: [number, number] | null;
  description: string;
}

function generateSteps(nums: number[], target: number): Step[] {
  const steps: Step[] = [];
  const hashMap: Record<number, number> = {};

  steps.push({
    type: 'start',
    nums, target,
    currentIndex: -1,
    hashMap: {},
    complement: null,
    foundPair: null,
    description: `Find two numbers in [${nums.join(', ')}] that add up to ${target}`,
  });

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    steps.push({
      type: 'check',
      nums, target,
      currentIndex: i,
      hashMap: { ...hashMap },
      complement,
      foundPair: null,
      description: `nums[${i}] = ${nums[i]}, complement = ${target} - ${nums[i]} = ${complement}. Is ${complement} in map?`,
    });

    if (complement in hashMap) {
      steps.push({
        type: 'found',
        nums, target,
        currentIndex: i,
        hashMap: { ...hashMap },
        complement,
        foundPair: [hashMap[complement], i],
        description: `Found! map[${complement}] = ${hashMap[complement]} → return [${hashMap[complement]}, ${i}]`,
      });
      return steps;
    }

    hashMap[nums[i]] = i;
    steps.push({
      type: 'add',
      nums, target,
      currentIndex: i,
      hashMap: { ...hashMap },
      complement: null,
      foundPair: null,
      description: `${complement} not in map → store map[${nums[i]}] = ${i}`,
    });
  }

  steps.push({
    type: 'done',
    nums, target,
    currentIndex: nums.length,
    hashMap: { ...hashMap },
    complement: null,
    foundPair: null,
    description: 'No solution found',
  });

  return steps;
}

const PRESETS = [
  { label: '[2,7,11,15] t=9', nums: [2, 7, 11, 15], target: 9 },
  { label: '[3,2,4] t=6', nums: [3, 2, 4], target: 6 },
  { label: '[1,5,3,7,2] t=9', nums: [1, 5, 3, 7, 2], target: 9 },
  { label: '[3,3] t=6', nums: [3, 3], target: 6 },
];

export function TwoSumVisualizer() {
  const [nums, setNums] = useState<number[]>([2, 7, 11, 15]);
  const [target, setTarget] = useState(9);
  const [inputValue, setInputValue] = useState('2, 7, 11, 15');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(nums, target);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [nums, target]);

  useEffect(() => { initializeSteps(); }, []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 800 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const handlePreset = (p: typeof PRESETS[0]) => {
    setNums(p.nums);
    setTarget(p.target);
    setInputValue(p.nums.join(', '));
    const newSteps = generateSteps(p.nums, p.target);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length >= 2) {
      setNums(parsed);
      const newSteps = generateSteps(parsed, target);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Two Sum</h1>
        <p className="text-slate-400">
          For each element, compute its complement (target − num). Use a HashMap to check if the 
          complement was seen before. One pass, O(n) time.
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => handlePreset(p)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="mb-6 flex gap-3 items-center flex-wrap">
        <label className="text-sm text-slate-400">Array:</label>
        <input value={inputValue} onChange={e => setInputValue(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono w-48" />
        <label className="text-sm text-slate-400">Target:</label>
        <input type="number" value={target} onChange={e => setTarget(parseInt(e.target.value) || 0)}
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono w-20" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Array Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          Array <span className="text-blue-400">(target = {step?.target})</span>
        </h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {step?.nums.map((val, i) => {
            const isActive = i === step.currentIndex;
            const isPartOfPair = step.foundPair && (i === step.foundPair[0] || i === step.foundPair[1]);
            const isProcessed = i < step.currentIndex && !isPartOfPair;

            return (
              <motion.div key={i} className="flex flex-col items-center"
                animate={{ scale: isActive || isPartOfPair ? 1.15 : 1 }}>
                <span className="text-xs text-slate-500 mb-1">[{i}]</span>
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg ${
                  isPartOfPair ? 'bg-green-500 text-white ring-2 ring-green-300' :
                  isActive ? 'bg-yellow-500 text-black' :
                  isProcessed ? 'bg-blue-500/50' :
                  'bg-slate-700'
                }`}>
                  {val}
                </div>
                {isActive && step.complement !== null && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-yellow-400 mt-1">
                    need {step.complement}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
        {step?.foundPair && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center">
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-mono">
              {step.nums[step.foundPair[0]]} + {step.nums[step.foundPair[1]]} = {step.target} ✓
            </span>
          </motion.div>
        )}
      </div>

      {/* HashMap Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          HashMap <span className="text-slate-500">(value → index)</span>
        </h3>
        <div className="flex gap-3 flex-wrap justify-center min-h-[60px] items-center">
          {step && Object.keys(step.hashMap).length === 0 && (
            <span className="text-slate-500 italic">Empty</span>
          )}
          {step && Object.entries(step.hashMap).map(([val, idx]) => {
            const isComplement = step.complement !== null && parseInt(val) === step.complement;
            return (
              <motion.div key={val}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className={`px-3 py-2 rounded-lg font-mono text-sm ${
                  isComplement ? 'bg-green-500 ring-2 ring-green-300' :
                  'bg-slate-700'
                }`}>
                <span className="text-blue-400">{val}</span>
                <span className="text-slate-500"> → </span>
                <span className="text-slate-300">idx {idx}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Pattern:</strong> "Complement lookup" — instead of checking all pairs O(n²), 
          store what you've seen and look up what you need. This one-pass HashMap approach is 
          the #1 most asked coding interview technique. The key insight: for each number, 
          you know exactly what value would complete the pair.
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'found' ? 'bg-green-500' :
            step?.type === 'check' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready'}</span>
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
{`public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>(); // value -> index
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    
    return new int[] {}; // No solution
}
// Time: O(n)  |  Space: O(n)`}
        </pre>
      </div>
    </div>
  );
}
