import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'check' | 'add' | 'found' | 'done';
  array: number[];
  currentIndex: number;
  hashSet: Set<number>;
  highlightIndices: number[];
  duplicateValue: number | null;
  description: string;
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  const hashSet = new Set<number>();

  steps.push({
    type: 'start',
    array: nums,
    currentIndex: -1,
    hashSet: new Set(),
    highlightIndices: [],
    duplicateValue: null,
    description: `Check if array [${nums.join(', ')}] contains any duplicates using a HashSet`,
  });

  for (let i = 0; i < nums.length; i++) {
    // Check step
    steps.push({
      type: 'check',
      array: nums,
      currentIndex: i,
      hashSet: new Set(hashSet),
      highlightIndices: [i],
      duplicateValue: null,
      description: `Check: is ${nums[i]} already in the HashSet?`,
    });

    if (hashSet.has(nums[i])) {
      steps.push({
        type: 'found',
        array: nums,
        currentIndex: i,
        hashSet: new Set(hashSet),
        highlightIndices: [i],
        duplicateValue: nums[i],
        description: `Found duplicate! ${nums[i]} is already in the HashSet → return true`,
      });
      return steps;
    }

    hashSet.add(nums[i]);
    steps.push({
      type: 'add',
      array: nums,
      currentIndex: i,
      hashSet: new Set(hashSet),
      highlightIndices: [i],
      duplicateValue: null,
      description: `${nums[i]} not in HashSet → add it. Set: {${[...hashSet].join(', ')}}`,
    });
  }

  steps.push({
    type: 'done',
    array: nums,
    currentIndex: nums.length,
    hashSet: new Set(hashSet),
    highlightIndices: [],
    duplicateValue: null,
    description: `No duplicates found → return false`,
  });

  return steps;
}

const PRESETS = [
  { label: '[1, 2, 3, 1]', value: [1, 2, 3, 1] },
  { label: '[1, 2, 3, 4]', value: [1, 2, 3, 4] },
  { label: '[3, 1, 4, 1, 5, 9]', value: [3, 1, 4, 1, 5, 9] },
  { label: '[1, 1, 1, 3, 3, 4]', value: [1, 1, 1, 3, 3, 4] },
];

export function ContainsDuplicateVisualizer() {
  const [nums, setNums] = useState<number[]>([1, 2, 3, 1]);
  const [inputValue, setInputValue] = useState('1, 2, 3, 1');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(nums);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [nums]);

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

  const step = steps[currentStep];

  const handlePreset = (preset: number[]) => {
    setNums(preset);
    setInputValue(preset.join(', '));
    const newSteps = generateSteps(preset);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleInputApply = () => {
    const parsed = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length > 0) {
      setNums(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Contains Duplicate</h1>
        <p className="text-slate-400">
          Use a HashSet for O(1) lookups. For each element, check if it's already in the set.
          If yes → duplicate found. If no → add it and move on.
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => handlePreset(p.value)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            {p.label}
          </button>
        ))}
        <div className="flex gap-2 ml-2">
          <input value={inputValue} onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInputApply()}
            className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono w-48"
            placeholder="e.g. 1, 2, 3, 1" />
          <button onClick={handleInputApply}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">
            Apply
          </button>
        </div>
      </div>

      {/* Array Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Input Array</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {step?.array.map((val, i) => {
            const isActive = step.highlightIndices.includes(i);
            const isProcessed = i < step.currentIndex;
            const isDuplicate = step.type === 'found' && val === step.duplicateValue;

            return (
              <motion.div key={i} className="flex flex-col items-center"
                animate={{ scale: isActive ? 1.15 : 1 }}>
                <span className="text-xs text-slate-500 mb-1">[{i}]</span>
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg transition-colors ${
                  isDuplicate ? 'bg-red-500 text-white' :
                  isActive ? 'bg-yellow-500 text-black' :
                  isProcessed ? 'bg-blue-500/60' :
                  'bg-slate-700'
                }`}>
                  {val}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* HashSet Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          HashSet <span className="text-slate-500">({step ? step.hashSet.size : 0} elements)</span>
        </h3>
        <div className="flex gap-2 flex-wrap justify-center min-h-[60px] items-center">
          {step && step.hashSet.size === 0 && (
            <span className="text-slate-500 italic">Empty</span>
          )}
          {step && [...step.hashSet].map((val) => {
            return (
              <motion.div key={val}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  step.duplicateValue === val ? 'bg-red-500 ring-2 ring-red-300' :
                  'bg-green-500/80'
                }`}>
                {val}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Algorithm Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Key idea:</strong> A HashSet gives O(1) average-time lookups. We trade O(n) space 
          for O(n) time instead of O(n²) brute force. This is the most fundamental hash table pattern — 
          "have I seen this before?" Always think HashSet when checking for existence.
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'found' ? 'bg-red-500' :
            step?.type === 'done' ? 'bg-green-500' :
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

      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) {
        if (seen.contains(num)) {
            return true;  // Duplicate found!
        }
        seen.add(num);
    }
    return false;  // No duplicates
}
// Time: O(n)  |  Space: O(n)`}
        </pre>
      </div>
    </div>
  );
}
