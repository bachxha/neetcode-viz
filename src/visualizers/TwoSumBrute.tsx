import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';
import { Hints } from '../components/Hints';
import { CodeWalkthrough, type Language } from '../components/CodeWalkthrough';
import { TWO_SUM_BRUTE_CODE, TWO_SUM_BRUTE_LINE_MAP } from '../solutions/twoSumBrute';

interface Step {
  type: 'start' | 'outer-loop' | 'inner-loop' | 'check-pair' | 'found' | 'done';
  nums: number[];
  target: number;
  outerIndex: number;
  innerIndex: number;
  comparisons: number;
  foundPair: [number, number] | null;
  description: string;
  currentPair?: [number, number];
}

function generateSteps(nums: number[], target: number): Step[] {
  const steps: Step[] = [];
  let comparisons = 0;

  steps.push({
    type: 'start',
    nums, target,
    outerIndex: -1,
    innerIndex: -1,
    comparisons: 0,
    foundPair: null,
    description: `Find two numbers in [${nums.join(', ')}] that add up to ${target} using brute force`,
  });

  for (let i = 0; i < nums.length; i++) {
    steps.push({
      type: 'outer-loop',
      nums, target,
      outerIndex: i,
      innerIndex: -1,
      comparisons,
      foundPair: null,
      description: `Outer loop: i = ${i}, nums[${i}] = ${nums[i]}`,
    });

    for (let j = i + 1; j < nums.length; j++) {
      steps.push({
        type: 'inner-loop',
        nums, target,
        outerIndex: i,
        innerIndex: j,
        comparisons,
        foundPair: null,
        description: `Inner loop: j = ${j}, nums[${j}] = ${nums[j]}`,
      });

      comparisons++;
      const sum = nums[i] + nums[j];
      
      steps.push({
        type: 'check-pair',
        nums, target,
        outerIndex: i,
        innerIndex: j,
        comparisons,
        foundPair: null,
        currentPair: [nums[i], nums[j]],
        description: `Check: nums[${i}] + nums[${j}] = ${nums[i]} + ${nums[j]} = ${sum}. Target = ${target}`,
      });

      if (sum === target) {
        steps.push({
          type: 'found',
          nums, target,
          outerIndex: i,
          innerIndex: j,
          comparisons,
          foundPair: [i, j],
          description: `Found! nums[${i}] + nums[${j}] = ${target} → return [${i}, ${j}]`,
        });
        return steps;
      }
    }
  }

  steps.push({
    type: 'done',
    nums, target,
    outerIndex: nums.length,
    innerIndex: -1,
    comparisons,
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

export function TwoSumBruteVisualizer() {
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

  // Get current language from localStorage for line mapping
  const currentLanguage = useMemo(() => {
    try {
      const saved = localStorage.getItem('codeWalkthrough-language');
      return (saved as Language) || 'java';
    } catch {
      return 'java';
    }
  }, []);

  // Map step types to code line numbers based on current language
  const { currentCodeLine, highlightedCodeLines } = useMemo(() => {
    if (!step) return { currentCodeLine: undefined, highlightedCodeLines: [] };
    
    const mapping = TWO_SUM_BRUTE_LINE_MAP[currentLanguage][step.type];
    return mapping 
      ? { currentCodeLine: mapping.current, highlightedCodeLines: mapping.highlighted }
      : { currentCodeLine: undefined, highlightedCodeLines: [] };
  }, [step, currentLanguage]);

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
        <h1 className="text-3xl font-bold mb-2">Two Sum - Brute Force</h1>
        <p className="text-slate-400">
          Check every possible pair using nested loops. Simple but inefficient - O(n²) time complexity.
          Compare each element with every element that comes after it.
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
          <span className="ml-4 text-red-400">Comparisons: {step?.comparisons || 0}</span>
        </h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {step?.nums.map((val, i) => {
            const isOuter = i === step.outerIndex;
            const isInner = i === step.innerIndex;
            const isPartOfPair = step.foundPair && (i === step.foundPair[0] || i === step.foundPair[1]);
            const isProcessed = i < step.outerIndex;

            return (
              <motion.div key={i} className="flex flex-col items-center"
                animate={{ scale: isOuter || isInner || isPartOfPair ? 1.15 : 1 }}>
                <span className="text-xs text-slate-500 mb-1">[{i}]</span>
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg ${
                  isPartOfPair ? 'bg-green-500 text-white ring-2 ring-green-300' :
                  isOuter ? 'bg-yellow-500 text-black' :
                  isInner ? 'bg-orange-500 text-black' :
                  isProcessed ? 'bg-slate-600' :
                  'bg-slate-700'
                }`}>
                  {val}
                </div>
                {isOuter && (
                  <span className="text-xs text-yellow-400 mt-1">i</span>
                )}
                {isInner && (
                  <span className="text-xs text-orange-400 mt-1">j</span>
                )}
              </motion.div>
            );
          })}
        </div>
        {step?.currentPair && !step.foundPair && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center">
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-mono">
              Checking: {step.currentPair[0]} + {step.currentPair[1]} = {step.currentPair[0] + step.currentPair[1]}
            </span>
          </motion.div>
        )}
        {step?.foundPair && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center">
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-mono">
              {step.nums[step.foundPair[0]]} + {step.nums[step.foundPair[1]]} = {step.target} ✓
            </span>
          </motion.div>
        )}
      </div>

      {/* Performance Analysis */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Performance Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="text-red-400 font-bold text-lg">O(n²)</div>
            <div className="text-xs text-slate-400">Time Complexity</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="text-green-400 font-bold text-lg">O(1)</div>
            <div className="text-xs text-slate-400">Space Complexity</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="text-orange-400 font-bold text-lg">{step?.comparisons || 0}</div>
            <div className="text-xs text-slate-400">Comparisons Made</div>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Why This Is Inefficient</h3>
        <p className="text-sm text-slate-300">
          <strong>Problem:</strong> We're checking every possible pair, which means for n elements we do 
          n×(n-1)/2 comparisons. This quadratic growth becomes very slow for large inputs. 
          For an array of 1000 elements, that's nearly 500,000 comparisons!
        </p>
      </div>

      {/* AI Hints */}
      <Hints problemId="two-sum" className="mb-6" />

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'found' ? 'bg-green-500' :
            step?.type === 'check-pair' ? 'bg-orange-500' :
            step?.type === 'outer-loop' || step?.type === 'inner-loop' ? 'bg-yellow-500' :
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

      <CodeWalkthrough
        multiLanguageCode={TWO_SUM_BRUTE_CODE}
        currentLine={currentCodeLine}
        highlightedLines={highlightedCodeLines}
        title="Code Walkthrough"
        className="mt-6"
      />
    </div>
  );
}