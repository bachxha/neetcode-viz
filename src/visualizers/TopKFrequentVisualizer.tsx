import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'count' | 'bucket-build' | 'bucket-collect' | 'done';
  nums: number[];
  k: number;
  currentIndex: number;
  freqMap: Record<number, number>;
  buckets: number[][];
  result: number[];
  collectBucketIndex: number;
  description: string;
}

function generateSteps(nums: number[], k: number): Step[] {
  const steps: Step[] = [];
  const freqMap: Record<number, number> = {};

  steps.push({
    type: 'start',
    nums, k,
    currentIndex: -1,
    freqMap: {},
    buckets: [],
    result: [],
    collectBucketIndex: -1,
    description: `Find the top ${k} most frequent elements in [${nums.join(', ')}]`,
  });

  // Phase 1: Count frequencies
  for (let i = 0; i < nums.length; i++) {
    freqMap[nums[i]] = (freqMap[nums[i]] || 0) + 1;
    steps.push({
      type: 'count',
      nums, k,
      currentIndex: i,
      freqMap: { ...freqMap },
      buckets: [],
      result: [],
      collectBucketIndex: -1,
      description: `Count nums[${i}] = ${nums[i]} → freq[${nums[i]}] = ${freqMap[nums[i]]}`,
    });
  }

  // Phase 2: Build bucket sort (index = frequency)
  const buckets: number[][] = new Array(nums.length + 1).fill(null).map(() => []);
  for (const [num, freq] of Object.entries(freqMap)) {
    buckets[freq].push(parseInt(num));
  }

  steps.push({
    type: 'bucket-build',
    nums, k,
    currentIndex: nums.length,
    freqMap: { ...freqMap },
    buckets: buckets.map(b => [...b]),
    result: [],
    collectBucketIndex: -1,
    description: `Build bucket array: index = frequency, value = elements with that frequency`,
  });

  // Phase 3: Collect from highest bucket down
  const result: number[] = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    if (buckets[i].length > 0) {
      for (const num of buckets[i]) {
        if (result.length < k) {
          result.push(num);
          steps.push({
            type: 'bucket-collect',
            nums, k,
            currentIndex: nums.length,
            freqMap: { ...freqMap },
            buckets: buckets.map(b => [...b]),
            result: [...result],
            collectBucketIndex: i,
            description: `Bucket[${i}]: collect ${num} (freq=${i}) → result: [${result.join(', ')}]`,
          });
        }
      }
    }
  }

  steps.push({
    type: 'done',
    nums, k,
    currentIndex: nums.length,
    freqMap: { ...freqMap },
    buckets: buckets.map(b => [...b]),
    result: [...result],
    collectBucketIndex: -1,
    description: `Top ${k} frequent: [${result.join(', ')}]`,
  });

  return steps;
}

const PRESETS = [
  { label: '[1,1,1,2,2,3] k=2', nums: [1, 1, 1, 2, 2, 3], k: 2 },
  { label: '[1,2,2,3,3,3] k=2', nums: [1, 2, 2, 3, 3, 3], k: 2 },
  { label: '[4,4,4,1,1,2,2,2,3] k=3', nums: [4, 4, 4, 1, 1, 2, 2, 2, 3], k: 3 },
  { label: '[1] k=1', nums: [1], k: 1 },
];

export function TopKFrequentVisualizer() {
  const [nums, setNums] = useState<number[]>([1, 1, 1, 2, 2, 3]);
  const [k, setK] = useState(2);
  const [inputValue, setInputValue] = useState('1, 1, 1, 2, 2, 3');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(nums, k);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [nums, k]);

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
    setK(p.k);
    setInputValue(p.nums.join(', '));
    const newSteps = generateSteps(p.nums, p.k);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length > 0) {
      setNums(parsed);
      const newSteps = generateSteps(parsed, k);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Top K Frequent Elements</h1>
        <p className="text-slate-400">
          Count frequencies with a HashMap, then use bucket sort (index = frequency) to collect 
          top k elements in O(n) time — no heap needed!
        </p>
      </div>

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
        <label className="text-sm text-slate-400">k:</label>
        <input type="number" value={k} onChange={e => setK(parseInt(e.target.value) || 1)} min={1}
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono w-16" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Array */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Input Array</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {step?.nums.map((val, i) => {
            const isActive = step.type === 'count' && i === step.currentIndex;
            const isProcessed = step.type === 'count' && i < step.currentIndex;
            const isResult = step.result.includes(val);
            return (
              <motion.div key={i} animate={{ scale: isActive ? 1.15 : 1 }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                  isActive ? 'bg-yellow-500 text-black' :
                  step.type !== 'count' && isResult ? 'bg-green-500' :
                  isProcessed ? 'bg-blue-500/50' :
                  'bg-slate-700'
                }`}>
                {val}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Frequency Map */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Frequency Map</h3>
        <div className="flex gap-4 flex-wrap justify-center min-h-[60px] items-end">
          {step && Object.entries(step.freqMap).map(([num, freq]) => {
            const isResult = step.result.includes(parseInt(num));
            const barHeight = Math.max(20, freq * 30);
            return (
              <motion.div key={num} className="flex flex-col items-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="text-sm font-bold text-blue-400 mb-1">{freq}×</span>
                <div className={`w-12 rounded-t transition-colors ${
                  isResult ? 'bg-green-500' : 'bg-blue-500'
                }`} style={{ height: barHeight }} />
                <span className="text-sm font-mono mt-1">{num}</span>
              </motion.div>
            );
          })}
          {step && Object.keys(step.freqMap).length === 0 && (
            <span className="text-slate-500 italic">Empty</span>
          )}
        </div>
      </div>

      {/* Bucket Sort */}
      {step && step.buckets.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">
            Bucket Sort <span className="text-slate-500">(index = frequency)</span>
          </h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {step.buckets.map((bucket, freq) => {
              if (freq === 0) return null;
              const isCollecting = step.collectBucketIndex === freq;
              const hasElements = bucket.length > 0;
              if (!hasElements && freq > Math.max(...Object.values(step.freqMap))) return null;

              return (
                <motion.div key={freq}
                  animate={{ scale: isCollecting ? 1.1 : 1 }}
                  className={`flex flex-col items-center p-2 rounded-lg min-w-[50px] ${
                    isCollecting ? 'ring-2 ring-yellow-400 bg-slate-700' :
                    hasElements ? 'bg-slate-700' :
                    'bg-slate-800/50'
                  }`}>
                  <span className="text-xs text-slate-500 mb-1">freq={freq}</span>
                  <div className="flex gap-1">
                    {bucket.map((num, ni) => (
                      <span key={ni} className={`px-2 py-1 rounded text-sm font-bold ${
                        step.result.includes(num) ? 'bg-green-500' : 'bg-blue-500'
                      }`}>{num}</span>
                    ))}
                    {bucket.length === 0 && <span className="text-slate-600 text-xs">—</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-2 text-center text-xs text-slate-500">
            ← lower frequency | higher frequency →
          </div>
        </div>
      )}

      {/* Result */}
      {step && step.result.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Result (top {step.k})</h3>
          <div className="flex gap-2 justify-center">
            {step.result.map((num, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center font-bold text-lg">
                {num}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Three approaches:</strong> (1) Sort by frequency — O(n log n). 
          (2) Min-heap of size k — O(n log k). (3) <strong>Bucket sort</strong> — O(n)! 
          The bucket sort trick: since max frequency ≤ n, create an array where index = frequency. 
          Then walk backwards to collect top k. This is the optimal O(n) solution interviewers love.
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'bucket-collect' ? 'bg-yellow-500' :
            step?.type === 'count' ? 'bg-blue-500' :
            'bg-purple-500'
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
{`public int[] topKFrequent(int[] nums, int k) {
    // Step 1: Count frequencies
    Map<Integer, Integer> freq = new HashMap<>();
    for (int num : nums) {
        freq.merge(num, 1, Integer::sum);
    }
    
    // Step 2: Bucket sort (index = frequency)
    List<Integer>[] buckets = new List[nums.length + 1];
    for (int i = 0; i < buckets.length; i++) {
        buckets[i] = new ArrayList<>();
    }
    for (var entry : freq.entrySet()) {
        buckets[entry.getValue()].add(entry.getKey());
    }
    
    // Step 3: Collect top k from highest bucket
    int[] result = new int[k];
    int idx = 0;
    for (int i = buckets.length - 1; i >= 0 && idx < k; i--) {
        for (int num : buckets[i]) {
            if (idx < k) result[idx++] = num;
        }
    }
    return result;
}
// Time: O(n)  |  Space: O(n)`}
        </pre>
      </div>
    </div>
  );
}
