import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'count-s' | 'count-t' | 'compare' | 'done';
  s: string;
  t: string;
  currentIndexS: number;
  currentIndexT: number;
  countMap: Record<string, number>;
  compareKey: string | null;
  isAnagram: boolean | null;
  description: string;
}

function generateSteps(s: string, t: string): Step[] {
  const steps: Step[] = [];

  steps.push({
    type: 'start',
    s, t,
    currentIndexS: -1,
    currentIndexT: -1,
    countMap: {},
    compareKey: null,
    isAnagram: null,
    description: `Check if "${t}" is an anagram of "${s}"`,
  });

  if (s.length !== t.length) {
    steps.push({
      type: 'done',
      s, t,
      currentIndexS: -1,
      currentIndexT: -1,
      countMap: {},
      compareKey: null,
      isAnagram: false,
      description: `Different lengths (${s.length} vs ${t.length}) → NOT an anagram`,
    });
    return steps;
  }

  const countMap: Record<string, number> = {};

  // Count characters in s (increment)
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    countMap[ch] = (countMap[ch] || 0) + 1;
    steps.push({
      type: 'count-s',
      s, t,
      currentIndexS: i,
      currentIndexT: -1,
      countMap: { ...countMap },
      compareKey: null,
      isAnagram: null,
      description: `Count '${ch}' from s → map['${ch}'] = ${countMap[ch]}`,
    });
  }

  // Decrement with characters in t
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    countMap[ch] = (countMap[ch] || 0) - 1;
    const isNegative = countMap[ch] < 0;
    steps.push({
      type: 'count-t',
      s, t,
      currentIndexS: s.length,
      currentIndexT: i,
      countMap: { ...countMap },
      compareKey: ch,
      isAnagram: isNegative ? false : null,
      description: isNegative
        ? `Decrement '${ch}' → map['${ch}'] = ${countMap[ch]} (NEGATIVE! → NOT anagram)`
        : `Decrement '${ch}' from t → map['${ch}'] = ${countMap[ch]}`,
    });
    if (isNegative) return steps;
  }

  // Check all counts are zero
  const allZero = Object.values(countMap).every(v => v === 0);
  steps.push({
    type: 'done',
    s, t,
    currentIndexS: s.length,
    currentIndexT: t.length,
    countMap: { ...countMap },
    compareKey: null,
    isAnagram: allZero,
    description: allZero
      ? `All counts are zero → "${t}" IS an anagram of "${s}" ✓`
      : `Some counts are non-zero → NOT an anagram`,
  });

  return steps;
}

const PRESETS = [
  { label: 'anagram / nagaram', s: 'anagram', t: 'nagaram' },
  { label: 'rat / car', s: 'rat', t: 'car' },
  { label: 'listen / silent', s: 'listen', t: 'silent' },
  { label: 'hello / world', s: 'hello', t: 'world' },
];

export function ValidAnagramVisualizer() {
  const [s, setS] = useState('anagram');
  const [t, setT] = useState('nagaram');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(s, t);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [s, t]);

  useEffect(() => { initializeSteps(); }, []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 800 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const handlePreset = (preset: { s: string; t: string }) => {
    setS(preset.s);
    setT(preset.t);
    const newSteps = generateSteps(preset.s, preset.t);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const newSteps = generateSteps(s, t);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Valid Anagram</h1>
        <p className="text-slate-400">
          Count character frequencies in s, then decrement for each character in t. 
          If all counts return to zero, it's an anagram.
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => handlePreset(p)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="mb-6 flex gap-3 items-center">
        <label className="text-sm text-slate-400">s:</label>
        <input value={s} onChange={e => setS(e.target.value.toLowerCase())}
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono w-40" />
        <label className="text-sm text-slate-400">t:</label>
        <input value={t} onChange={e => setT(e.target.value.toLowerCase())}
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono w-40" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* String s */}
      <div className="bg-slate-800 rounded-lg p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">String s: "{step?.s}"</h3>
        <div className="flex gap-1 justify-center flex-wrap">
          {step?.s.split('').map((ch, i) => {
            const isActive = step.type === 'count-s' && i === step.currentIndexS;
            const isProcessed = step.type === 'count-s' && i < step.currentIndexS;
            const isDone = step.currentIndexS >= step.s.length;
            return (
              <motion.div key={i} animate={{ scale: isActive ? 1.2 : 1 }}
                className={`w-10 h-10 rounded flex items-center justify-center font-bold text-lg ${
                  isActive ? 'bg-yellow-500 text-black' :
                  isProcessed || isDone ? 'bg-blue-500/60' :
                  'bg-slate-700'
                }`}>
                {ch}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* String t */}
      <div className="bg-slate-800 rounded-lg p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">String t: "{step?.t}"</h3>
        <div className="flex gap-1 justify-center flex-wrap">
          {step?.t.split('').map((ch, i) => {
            const isActive = step.type === 'count-t' && i === step.currentIndexT;
            const isProcessed = step.type === 'count-t' && i < step.currentIndexT;
            const isDone = step.currentIndexT >= step.t.length;
            return (
              <motion.div key={i} animate={{ scale: isActive ? 1.2 : 1 }}
                className={`w-10 h-10 rounded flex items-center justify-center font-bold text-lg ${
                  isActive ? 'bg-purple-500 text-white' :
                  isProcessed || isDone ? 'bg-purple-500/40' :
                  'bg-slate-700'
                }`}>
                {ch}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Character Count Map */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Character Count Map</h3>
        <div className="flex gap-3 flex-wrap justify-center min-h-[80px] items-end">
          {step && Object.entries(step.countMap).sort().map(([ch, count]) => {
            const isHighlighted = step.compareKey === ch;
            const isNegative = count < 0;
            const maxCount = Math.max(...Object.values(step.countMap).map(Math.abs), 1);
            const barHeight = Math.max(20, Math.abs(count) / maxCount * 60);

            return (
              <motion.div key={ch} className="flex flex-col items-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className={`text-sm font-bold mb-1 ${
                  isNegative ? 'text-red-400' :
                  count === 0 ? 'text-green-400' :
                  'text-blue-400'
                }`}>{count}</span>
                <div className={`w-10 rounded-t transition-all ${
                  isHighlighted ? 'bg-yellow-500' :
                  isNegative ? 'bg-red-500' :
                  count === 0 ? 'bg-green-500' :
                  'bg-blue-500'
                }`} style={{ height: barHeight }} />
                <span className={`text-sm font-mono mt-1 ${isHighlighted ? 'text-yellow-400' : 'text-slate-300'}`}>
                  '{ch}'
                </span>
              </motion.div>
            );
          })}
          {step && Object.keys(step.countMap).length === 0 && (
            <span className="text-slate-500 italic">Empty map</span>
          )}
        </div>
        <div className="mt-3 flex gap-4 justify-center text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Positive (from s)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Zero (balanced)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Negative (extra in t)</span>
        </div>
      </div>

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Two approaches:</strong> (1) Sort both strings and compare — O(n log n). 
          (2) Use a frequency count array/map — O(n). For lowercase English letters, 
          you can use <code className="text-blue-400">int[26]</code> instead of a HashMap for even better constants.
          The frequency counter technique appears in many problems (anagrams, permutation in string, etc.).
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.isAnagram === true ? 'bg-green-500' :
            step?.isAnagram === false ? 'bg-red-500' :
            step?.type === 'count-s' ? 'bg-yellow-500' :
            step?.type === 'count-t' ? 'bg-purple-500' :
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
{`public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    
    int[] count = new int[26];
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }
    
    for (int c : count) {
        if (c != 0) return false;
    }
    return true;
}
// Time: O(n)  |  Space: O(1) — fixed 26-char array`}
        </pre>
      </div>
    </div>
  );
}
