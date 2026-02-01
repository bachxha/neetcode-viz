import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'calculate' | 'use_dp' | 'done';
  n: number;
  currentIndex: number;
  result: number[];
  binaryRepresentation: string;
  oneCount: number;
  dpFormula: string | null;
  description: string;
}

function generateSteps(n: number): Step[] {
  const steps: Step[] = [];
  const result: number[] = new Array(n + 1).fill(0);

  steps.push({
    type: 'start',
    n,
    currentIndex: -1,
    result: [...result],
    binaryRepresentation: '',
    oneCount: 0,
    dpFormula: null,
    description: `Calculate number of 1 bits for each number from 0 to ${n}`,
  });

  for (let i = 0; i <= n; i++) {
    const binary = i.toString(2);
    
    if (i === 0) {
      result[i] = 0;
      steps.push({
        type: 'calculate',
        n,
        currentIndex: i,
        result: [...result],
        binaryRepresentation: binary,
        oneCount: 0,
        dpFormula: null,
        description: `${i} in binary: ${binary} → 0 ones`,
      });
    } else if (i === 1) {
      result[i] = 1;
      steps.push({
        type: 'calculate',
        n,
        currentIndex: i,
        result: [...result],
        binaryRepresentation: binary,
        oneCount: 1,
        dpFormula: null,
        description: `${i} in binary: ${binary} → 1 one`,
      });
    } else {
      // Use DP formula: dp[i] = dp[i >> 1] + (i & 1)
      const rightShift = i >> 1;
      const lastBit = i & 1;
      const calculatedOnes = result[rightShift] + lastBit;
      
      result[i] = calculatedOnes;
      steps.push({
        type: 'use_dp',
        n,
        currentIndex: i,
        result: [...result],
        binaryRepresentation: binary,
        oneCount: calculatedOnes,
        dpFormula: `dp[${i}] = dp[${rightShift}] + (${i} & 1) = ${result[rightShift]} + ${lastBit} = ${calculatedOnes}`,
        description: `${i} in binary: ${binary} → Using DP: dp[${i >> 1}] + last bit`,
      });
    }
  }

  steps.push({
    type: 'done',
    n,
    currentIndex: n + 1,
    result: [...result],
    binaryRepresentation: '',
    oneCount: 0,
    dpFormula: null,
    description: `Complete! Result array: [${result.join(', ')}]`,
  });

  return steps;
}

const PRESETS = [
  { label: 'n = 2', n: 2 },
  { label: 'n = 5', n: 5 },
  { label: 'n = 8', n: 8 },
  { label: 'n = 15', n: 15 },
];

export function CountingBitsVisualizer() {
  const [n, setN] = useState<number>(5);
  const [inputValue, setInputValue] = useState('5');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(n);
    setSteps(newSteps);
    setCurrentStep(0);
  }, [n]);

  useEffect(() => {
    initializeSteps();
  }, [initializeSteps]);

  useEffect(() => {
    let interval: number;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 / speed);
    } else {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 20) {
      setN(numValue);
    }
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setN(preset.n);
    setInputValue(preset.n.toString());
    setIsPlaying(false);
  };

  const step = steps[currentStep];

  if (!step) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Counting Bits</h1>
        <p className="text-slate-300 mb-4">
          Given an integer n, return an array where result[i] is the number of 1's in the binary representation of i.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-slate-300">n:</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="bg-slate-700 text-white px-2 py-1 rounded w-20"
              placeholder="Enter n"
            />
          </div>
          
          <div className="flex gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
                className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <Controls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onStepBack={() => setCurrentStep(Math.max(currentStep - 1, 0))}
          onStepForward={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
          onReset={() => {
            setCurrentStep(0);
            setIsPlaying(false);
          }}
          currentStep={currentStep}
          totalSteps={steps.length}
          speed={speed}
          onSpeedChange={setSpeed}
          canStepBack={currentStep > 0}
          canStepForward={currentStep < steps.length - 1}
        />
      </div>

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">{step.description}</h3>
        
        {step.currentIndex >= 0 && step.currentIndex <= step.n && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Current Number Analysis */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">
                Current Number: {step.currentIndex}
              </h4>
              <div className="space-y-2">
                <div className="text-slate-300">
                  <span className="font-mono">Binary: {step.binaryRepresentation}</span>
                </div>
                <div className="text-slate-300">
                  <span>Number of 1's: {step.oneCount}</span>
                </div>
                {step.dpFormula && (
                  <div className="text-blue-400 font-mono text-sm">
                    {step.dpFormula}
                  </div>
                )}
              </div>
            </div>

            {/* Binary Representation Visual */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Binary Visualization</h4>
              <div className="flex gap-1 items-center">
                {step.binaryRepresentation.split('').map((bit, idx) => (
                  <motion.div
                    key={idx}
                    className={`w-8 h-8 flex items-center justify-center rounded font-mono font-bold ${
                      bit === '1' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-500 text-slate-300'
                    }`}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {bit}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Result Array */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">
            Result Array [0...{step.n}]
          </h4>
          <div className="grid grid-cols-auto gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(step.n + 1, 16)}, minmax(0, 1fr))` }}>
            {step.result.map((value, idx) => (
              <motion.div
                key={idx}
                className={`p-3 rounded text-center font-mono ${
                  idx === step.currentIndex
                    ? 'bg-blue-500 text-white'
                    : idx < step.currentIndex || step.type === 'done'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-600 text-slate-400'
                }`}
                initial={{ scale: 0.9 }}
                animate={{ 
                  scale: idx === step.currentIndex ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-xs opacity-75">{idx}</div>
                <div className="font-bold">{idx <= step.currentIndex || step.type === 'done' ? value : '?'}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Algorithm Explanation */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Dynamic Programming Approach</h3>
        <div className="text-slate-300 space-y-2">
          <p>
            <strong>Key Insight:</strong> For any number i, we can calculate its bit count using previously computed values.
          </p>
          <p>
            <strong>Formula:</strong> <code className="bg-slate-700 px-2 py-1 rounded">dp[i] = dp[i {'>'}{'>'} 1] + (i &amp; 1)</code>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><code>i {'>'}{'>'} 1</code> is i divided by 2 (removing the last bit)</li>
            <li><code>i &amp; 1</code> gives us the last bit (0 or 1)</li>
            <li>The count for i equals the count for i/2 plus the last bit</li>
          </ul>
          <p>
            <strong>Time Complexity:</strong> O(n) | <strong>Space Complexity:</strong> O(n)
          </p>
        </div>
      </div>
    </div>
  );
}