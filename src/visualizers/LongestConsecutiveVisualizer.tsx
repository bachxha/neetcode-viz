import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'build-set' | 'check-start' | 'skip' | 'extend' | 'update-best' | 'done';
  nums: number[];
  numSet: Set<number>;
  currentNum: number;
  sequenceStart: number;
  currentLength: number;
  bestLength: number;
  bestStart: number;
  currentSequence: number[];
  bestSequence: number[];
  description: string;
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  const numSet = new Set(nums);

  steps.push({
    type: 'start',
    nums,
    numSet: new Set(),
    currentNum: -Infinity,
    sequenceStart: -Infinity,
    currentLength: 0,
    bestLength: 0,
    bestStart: -Infinity,
    currentSequence: [],
    bestSequence: [],
    description: `Find the longest consecutive sequence in [${nums.join(', ')}]`,
  });

  steps.push({
    type: 'build-set',
    nums,
    numSet: new Set(numSet),
    currentNum: -Infinity,
    sequenceStart: -Infinity,
    currentLength: 0,
    bestLength: 0,
    bestStart: -Infinity,
    currentSequence: [],
    bestSequence: [],
    description: `Build HashSet: {${[...numSet].sort((a, b) => a - b).join(', ')}} for O(1) lookups`,
  });

  let bestLength = 0;
  let bestStart = -Infinity;
  let bestSequence: number[] = [];

  for (const num of nums) {
    // Check if this is the start of a sequence
    if (numSet.has(num - 1)) {
      steps.push({
        type: 'skip',
        nums,
        numSet: new Set(numSet),
        currentNum: num,
        sequenceStart: -Infinity,
        currentLength: 0,
        bestLength,
        bestStart,
        currentSequence: [],
        bestSequence: [...bestSequence],
        description: `${num}: has ${num - 1} in set → NOT a sequence start, skip`,
      });
      continue;
    }

    // This is a sequence start — extend it
    steps.push({
      type: 'check-start',
      nums,
      numSet: new Set(numSet),
      currentNum: num,
      sequenceStart: num,
      currentLength: 1,
      bestLength,
      bestStart,
      currentSequence: [num],
      bestSequence: [...bestSequence],
      description: `${num}: no ${num - 1} in set → this IS a sequence start!`,
    });

    let length = 1;
    const sequence = [num];
    let current = num;

    while (numSet.has(current + 1)) {
      current++;
      length++;
      sequence.push(current);
      steps.push({
        type: 'extend',
        nums,
        numSet: new Set(numSet),
        currentNum: current,
        sequenceStart: num,
        currentLength: length,
        bestLength,
        bestStart,
        currentSequence: [...sequence],
        bestSequence: [...bestSequence],
        description: `Extend: ${current} found in set → sequence: [${sequence.join(', ')}] (length=${length})`,
      });
    }

    if (length > bestLength) {
      bestLength = length;
      bestStart = num;
      bestSequence = [...sequence];
      steps.push({
        type: 'update-best',
        nums,
        numSet: new Set(numSet),
        currentNum: current,
        sequenceStart: num,
        currentLength: length,
        bestLength,
        bestStart,
        currentSequence: [...sequence],
        bestSequence: [...bestSequence],
        description: `New best! [${sequence.join(', ')}] length=${length} beats previous best`,
      });
    }
  }

  steps.push({
    type: 'done',
    nums,
    numSet: new Set(numSet),
    currentNum: -Infinity,
    sequenceStart: bestStart,
    currentLength: bestLength,
    bestLength,
    bestStart,
    currentSequence: [],
    bestSequence: [...bestSequence],
    description: `Longest consecutive sequence: [${bestSequence.join(', ')}] length = ${bestLength}`,
  });

  return steps;
}

const PRESETS = [
  { label: '[100, 4, 200, 1, 3, 2]', value: [100, 4, 200, 1, 3, 2] },
  { label: '[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]', value: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] },
  { label: '[9, 1, 4, 7, 3, -1, 0, 5, 8, -2, 6]', value: [9, 1, 4, 7, 3, -1, 0, 5, 8, -2, 6] },
];

export function LongestConsecutiveVisualizer() {
  const [nums, setNums] = useState<number[]>([100, 4, 200, 1, 3, 2]);
  const [inputValue, setInputValue] = useState('100, 4, 200, 1, 3, 2');
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 900 / speed);
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
        <h1 className="text-3xl font-bold mb-2">Longest Consecutive Sequence</h1>
        <p className="text-slate-400">
          Put all numbers in a HashSet. For each number, check if it's the start of a sequence 
          (num-1 not in set). If so, extend forward. O(n) time!
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
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono flex-1" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Array visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Input Array</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {step?.nums.map((val, i) => {
            const isActive = val === step.currentNum;
            const inCurrentSeq = step.currentSequence.includes(val);
            const inBestSeq = step.bestSequence.includes(val);
            const isSkipped = step.type === 'skip' && val === step.currentNum;

            return (
              <motion.div key={i} animate={{ scale: isActive ? 1.15 : 1 }}
                className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg ${
                  isSkipped ? 'bg-slate-600 text-slate-400' :
                  isActive ? 'bg-yellow-500 text-black' :
                  inCurrentSeq ? 'bg-orange-500' :
                  step.type === 'done' && inBestSeq ? 'bg-green-500' :
                  inBestSeq ? 'bg-green-500/40' :
                  'bg-slate-700'
                }`}>
                {val}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* HashSet */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">HashSet (sorted for display)</h3>
        <div className="flex gap-1.5 flex-wrap justify-center min-h-[40px] items-center">
          {step && step.numSet.size === 0 ? (
            <span className="text-slate-500 italic">Building...</span>
          ) : step && (
            [...step.numSet].sort((a, b) => a - b).map((val) => {
              const inCurrentSeq = step.currentSequence.includes(val);
              const inBestSeq = step.bestSequence.includes(val);
              const isActive = val === step.currentNum;
              return (
                <span key={val} className={`px-2 py-1 rounded text-sm font-mono font-bold ${
                  isActive ? 'bg-yellow-500 text-black' :
                  inCurrentSeq ? 'bg-orange-500' :
                  step.type === 'done' && inBestSeq ? 'bg-green-500' :
                  inBestSeq ? 'bg-green-500/40' :
                  'bg-slate-700'
                }`}>
                  {val}
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Current Sequence & Best */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-orange-400 mb-2">Current Sequence</h3>
          <div className="flex gap-1 flex-wrap min-h-[40px] items-center">
            {step?.currentSequence.length === 0 ? (
              <span className="text-slate-500 italic text-sm">—</span>
            ) : step?.currentSequence.map((val, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="px-3 py-1.5 bg-orange-500 rounded font-bold">
                {val}
              </motion.span>
            ))}
            {step && step.currentSequence.length > 0 && (
              <span className="text-sm text-slate-400 ml-2">len={step.currentLength}</span>
            )}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-400 mb-2">Best Sequence</h3>
          <div className="flex gap-1 flex-wrap min-h-[40px] items-center">
            {step?.bestSequence.length === 0 ? (
              <span className="text-slate-500 italic text-sm">None yet</span>
            ) : step?.bestSequence.map((val, i) => (
              <span key={i} className="px-3 py-1.5 bg-green-500 rounded font-bold">{val}</span>
            ))}
            {step && step.bestLength > 0 && (
              <span className="text-sm text-slate-400 ml-2">len={step.bestLength}</span>
            )}
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Why O(n)?</strong> Each number is visited at most twice — once as a potential 
          sequence start, and once during extension. The "is this a start?" check 
          (<code className="text-blue-400">!set.contains(num-1)</code>) ensures we never re-count 
          the middle of a sequence. This is a classic "intelligent iteration" problem — knowing 
          <em>when to skip</em> is as important as knowing what to compute. Common follow-up: 
          "Can you do this without sorting?" — Yes, that's the whole point!
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'update-best' ? 'bg-green-500' :
            step?.type === 'extend' ? 'bg-orange-500' :
            step?.type === 'skip' ? 'bg-slate-500' :
            step?.type === 'check-start' ? 'bg-yellow-500' :
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
{`public int longestConsecutive(int[] nums) {
    Set<Integer> numSet = new HashSet<>();
    for (int num : nums) numSet.add(num);
    
    int longest = 0;
    
    for (int num : numSet) {
        // Only start counting from sequence beginnings
        if (!numSet.contains(num - 1)) {
            int length = 1;
            while (numSet.contains(num + length)) {
                length++;
            }
            longest = Math.max(longest, length);
        }
    }
    
    return longest;
}
// Time: O(n)  |  Space: O(n)`}
        </pre>
      </div>
    </div>
  );
}
