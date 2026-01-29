import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'prefix' | 'suffix' | 'done';
  nums: number[];
  prefix: number[];
  suffix: number[];
  result: number[];
  currentIndex: number;
  phase: 'prefix' | 'suffix' | 'none';
  description: string;
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  const n = nums.length;
  const prefix = new Array(n).fill(0);
  const suffix = new Array(n).fill(0);
  const result = new Array(n).fill(0);

  steps.push({
    type: 'start',
    nums,
    prefix: [...prefix],
    suffix: [...suffix],
    result: [...result],
    currentIndex: -1,
    phase: 'none',
    description: `Compute product of all elements except self for [${nums.join(', ')}]`,
  });

  // Prefix pass (left products)
  prefix[0] = 1;
  steps.push({
    type: 'prefix',
    nums,
    prefix: [...prefix],
    suffix: [...suffix],
    result: [...result],
    currentIndex: 0,
    phase: 'prefix',
    description: `prefix[0] = 1 (no elements to the left)`,
  });

  for (let i = 1; i < n; i++) {
    prefix[i] = prefix[i - 1] * nums[i - 1];
    steps.push({
      type: 'prefix',
      nums,
      prefix: [...prefix],
      suffix: [...suffix],
      result: [...result],
      currentIndex: i,
      phase: 'prefix',
      description: `prefix[${i}] = prefix[${i-1}] × nums[${i-1}] = ${prefix[i-1]} × ${nums[i-1]} = ${prefix[i]}`,
    });
  }

  // Suffix pass (right products)
  suffix[n - 1] = 1;
  steps.push({
    type: 'suffix',
    nums,
    prefix: [...prefix],
    suffix: [...suffix],
    result: [...result],
    currentIndex: n - 1,
    phase: 'suffix',
    description: `suffix[${n-1}] = 1 (no elements to the right)`,
  });

  for (let i = n - 2; i >= 0; i--) {
    suffix[i] = suffix[i + 1] * nums[i + 1];
    steps.push({
      type: 'suffix',
      nums,
      prefix: [...prefix],
      suffix: [...suffix],
      result: [...result],
      currentIndex: i,
      phase: 'suffix',
      description: `suffix[${i}] = suffix[${i+1}] × nums[${i+1}] = ${suffix[i+1]} × ${nums[i+1]} = ${suffix[i]}`,
    });
  }

  // Result
  for (let i = 0; i < n; i++) {
    result[i] = prefix[i] * suffix[i];
  }

  steps.push({
    type: 'done',
    nums,
    prefix: [...prefix],
    suffix: [...suffix],
    result: [...result],
    currentIndex: -1,
    phase: 'none',
    description: `Result: [${result.join(', ')}] — each result[i] = prefix[i] × suffix[i]`,
  });

  return steps;
}

const PRESETS = [
  { label: '[1, 2, 3, 4]', value: [1, 2, 3, 4] },
  { label: '[-1, 1, 0, -3, 3]', value: [-1, 1, 0, -3, 3] },
  { label: '[2, 3, 4, 5]', value: [2, 3, 4, 5] },
];

export function ProductExceptSelfVisualizer() {
  const [nums, setNums] = useState<number[]>([1, 2, 3, 4]);
  const [inputValue, setInputValue] = useState('1, 2, 3, 4');
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

  const handlePreset = (preset: number[]) => {
    setNums(preset);
    setInputValue(preset.join(', '));
    const newSteps = generateSteps(preset);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length >= 2) {
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
        <h1 className="text-3xl font-bold mb-2">Product of Array Except Self</h1>
        <p className="text-slate-400">
          Two-pass approach: build prefix products (left to right) and suffix products (right to left).
          Result[i] = prefix[i] × suffix[i]. No division needed!
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => handlePreset(p.value)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="mb-6 flex gap-3 items-center">
        <input value={inputValue} onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono w-48" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Phase indicator */}
      <div className="flex gap-4 mb-6">
        <div className={`flex-1 p-3 rounded-lg text-center font-semibold ${
          step?.phase === 'prefix' ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500' : 'bg-slate-800 text-slate-500'
        }`}>→ Prefix Pass (left products)</div>
        <div className={`flex-1 p-3 rounded-lg text-center font-semibold ${
          step?.phase === 'suffix' ? 'bg-purple-500/20 text-purple-400 ring-2 ring-purple-500' : 'bg-slate-800 text-slate-500'
        }`}>← Suffix Pass (right products)</div>
      </div>

      {/* Arrays visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <div className="space-y-4">
          {/* Input array */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">nums</h3>
            <div className="flex gap-2 justify-center">
              {step?.nums.map((val, i) => {
                const isActive = i === step.currentIndex;
                const isLeft = step.phase === 'prefix' && i < step.currentIndex;
                const isRight = step.phase === 'suffix' && i > step.currentIndex;
                return (
                  <motion.div key={i} animate={{ scale: isActive ? 1.1 : 1 }}
                    className={`w-16 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                      isActive ? 'bg-yellow-500 text-black' :
                      isLeft ? 'bg-blue-500/40' :
                      isRight ? 'bg-purple-500/40' :
                      'bg-slate-700'
                    }`}>
                    {val}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Prefix array */}
          <div>
            <h3 className="text-sm font-semibold text-blue-400 mb-2">prefix (left products)</h3>
            <div className="flex gap-2 justify-center">
              {step?.prefix.map((val, i) => {
                const isActive = step.phase === 'prefix' && i === step.currentIndex;
                const isFilled = val !== 0 || (step.phase !== 'prefix' || i <= step.currentIndex);
                return (
                  <motion.div key={i} animate={{ scale: isActive ? 1.1 : 1 }}
                    className={`w-16 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                      isActive ? 'bg-blue-500' :
                      isFilled && val !== 0 ? 'bg-blue-500/40' :
                      'bg-slate-700/50'
                    }`}>
                    {(step.phase === 'prefix' && i > step.currentIndex) ? '?' : val}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Suffix array */}
          <div>
            <h3 className="text-sm font-semibold text-purple-400 mb-2">suffix (right products)</h3>
            <div className="flex gap-2 justify-center">
              {step?.suffix.map((val, i) => {
                const isActive = step.phase === 'suffix' && i === step.currentIndex;
                const isFilled = step.phase === 'suffix' ? i >= step.currentIndex : step.type === 'done';
                return (
                  <motion.div key={i} animate={{ scale: isActive ? 1.1 : 1 }}
                    className={`w-16 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                      isActive ? 'bg-purple-500' :
                      isFilled && val !== 0 ? 'bg-purple-500/40' :
                      'bg-slate-700/50'
                    }`}>
                    {(!isFilled && step.type !== 'done') ? '?' : val}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Result array */}
          {step?.type === 'done' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-sm font-semibold text-green-400 mb-2">result (prefix × suffix)</h3>
              <div className="flex gap-2 justify-center">
                {step.result.map((val, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-16 h-12 rounded-lg flex items-center justify-center font-bold text-lg bg-green-500">
                    {val}
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-2 justify-center mt-2">
                {step.result.map((_, i) => (
                  <div key={i} className="w-16 text-center text-xs text-slate-500 font-mono">
                    {step.prefix[i]}×{step.suffix[i]}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Key constraint:</strong> Can't use division (what if there's a zero?). 
          The trick: product of everything except nums[i] = (product of everything left of i) × (product of everything right of i).
          <strong> Space optimization:</strong> You can use the output array for prefix, then accumulate suffix in a single variable. O(1) extra space!
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.phase === 'prefix' ? 'bg-blue-500' :
            step?.phase === 'suffix' ? 'bg-purple-500' :
            'bg-slate-500'
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
{`public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    
    // Prefix pass: result[i] = product of all nums[0..i-1]
    result[0] = 1;
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    
    // Suffix pass: multiply by product of all nums[i+1..n-1]
    int suffix = 1;
    for (int i = n - 2; i >= 0; i--) {
        suffix *= nums[i + 1];
        result[i] *= suffix;
    }
    
    return result;
}
// Time: O(n)  |  Space: O(1) extra (output array doesn't count)`}
        </pre>
      </div>
    </div>
  );
}
