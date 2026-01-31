import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'init' | 'phase1' | 'phase1-done' | 'phase2-init' | 'phase2' | 'found';
  slowIndex: number;
  fastIndex: number;
  nums: number[];
  description: string;
  codeHighlight: number;
  phase: number; // 1 for finding cycle, 2 for finding start
  hasMet: boolean;
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  
  if (nums.length <= 1) {
    steps.push({
      type: 'found',
      slowIndex: 0,
      fastIndex: 0,
      nums,
      description: 'Array too small - no duplicates possible.',
      codeHighlight: 1,
      phase: 1,
      hasMet: false,
    });
    return steps;
  }

  // Initialize for Phase 1 - Find cycle
  let slow = nums[0];
  let fast = nums[0];

  steps.push({
    type: 'init',
    slowIndex: slow,
    fastIndex: fast,
    nums,
    description: 'Phase 1: Use Floyd\'s algorithm to detect cycle. Start both pointers at nums[0].',
    codeHighlight: 2,
    phase: 1,
    hasMet: false,
  });

  // Phase 1: Find the cycle
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];

    steps.push({
      type: 'phase1',
      slowIndex: slow,
      fastIndex: fast,
      nums,
      description: `Move slow one step (nums[${steps[steps.length-1]?.slowIndex || 0}] → ${slow}), fast two steps → ${fast}`,
      codeHighlight: 3,
      phase: 1,
      hasMet: slow === fast,
    });

  } while (slow !== fast);

  steps.push({
    type: 'phase1-done',
    slowIndex: slow,
    fastIndex: fast,
    nums,
    description: `Pointers met at index ${slow}! Cycle detected. Now find the cycle's start.`,
    codeHighlight: 4,
    phase: 1,
    hasMet: true,
  });

  // Phase 2: Find the start of the cycle (duplicate number)
  slow = nums[0];
  
  steps.push({
    type: 'phase2-init',
    slowIndex: slow,
    fastIndex: fast,
    nums,
    description: 'Phase 2: Reset slow to start, move both one step at a time until they meet.',
    codeHighlight: 5,
    phase: 2,
    hasMet: false,
  });

  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];

    steps.push({
      type: 'phase2',
      slowIndex: slow,
      fastIndex: fast,
      nums,
      description: `Both move one step: slow → ${slow}, fast → ${fast}`,
      codeHighlight: 6,
      phase: 2,
      hasMet: slow === fast,
    });
  }

  steps.push({
    type: 'found',
    slowIndex: slow,
    fastIndex: fast,
    nums,
    description: `Found duplicate! Both pointers meet at the duplicate number: ${slow}`,
    codeHighlight: 7,
    phase: 2,
    hasMet: true,
  });

  return steps;
}

function ArrayVisualization({ step }: { step: Step }) {
  return (
    <div className="space-y-6">
      {/* Array visualization */}
      <div className="bg-slate-800 p-6 rounded-xl">
        <h3 className="text-lg font-medium mb-4 text-center">
          Array (index → value mapping)
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {step.nums.map((value, index) => {
            const isSlowAt = index === step.slowIndex;
            const isFastAt = index === step.fastIndex;
            const isPointed = step.nums.includes(index) && index > 0; // Index is pointed to by some value
            
            return (
              <motion.div
                key={index}
                className={`relative p-3 rounded-lg border-2 min-w-16 text-center transition-all ${
                  isSlowAt && isFastAt
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                    : isSlowAt
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                    : isFastAt
                    ? 'bg-red-500/20 border-red-400 text-red-300'
                    : isPointed
                    ? 'bg-slate-700 border-slate-600 text-slate-300'
                    : 'bg-slate-700/50 border-slate-600 text-slate-400'
                }`}
                animate={{
                  scale: isSlowAt || isFastAt ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-xs mb-1 opacity-75">i={index}</div>
                <div className="font-bold text-lg">{value}</div>
                
                {/* Pointer labels */}
                {(isSlowAt || isFastAt) && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                    {isSlowAt && isFastAt ? (
                      <span className="text-purple-300">BOTH</span>
                    ) : isSlowAt ? (
                      <span className="text-blue-300">SLOW</span>
                    ) : (
                      <span className="text-red-300">FAST</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Graph visualization */}
      <div className="bg-slate-800 p-6 rounded-xl">
        <h3 className="text-lg font-medium mb-4 text-center">
          Linked List Interpretation (nums[i] → i)
        </h3>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {step.nums.map((value, index) => {
            const isSlowAt = index === step.slowIndex;
            const isFastAt = index === step.fastIndex;
            
            return (
              <div key={index} className="flex items-center">
                <motion.div
                  className={`relative p-3 rounded-lg border-2 min-w-16 text-center ${
                    isSlowAt && isFastAt
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                      : isSlowAt
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                      : isFastAt
                      ? 'bg-red-500/20 border-red-400 text-red-300'
                      : 'bg-slate-700 border-slate-600 text-slate-300'
                  }`}
                  animate={{
                    scale: isSlowAt || isFastAt ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="font-bold">{index}</div>
                  {(isSlowAt || isFastAt) && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                      {isSlowAt && isFastAt ? (
                        <span className="text-purple-300">BOTH</span>
                      ) : isSlowAt ? (
                        <span className="text-blue-300">SLOW</span>
                      ) : (
                        <span className="text-red-300">FAST</span>
                      )}
                    </div>
                  )}
                </motion.div>
                {index < step.nums.length - 1 && value < step.nums.length && (
                  <div className="mx-2 flex items-center">
                    <div className="w-8 h-0.5 bg-slate-500"></div>
                    <div className="w-2 h-2 bg-slate-500 rotate-45 transform origin-center"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase indicator */}
      <div className="bg-slate-800 p-4 rounded-xl text-center">
        <div className="text-sm text-slate-400 mb-2">Current Phase</div>
        <div className={`text-lg font-bold ${
          step.phase === 1 ? 'text-blue-400' : 'text-green-400'
        }`}>
          Phase {step.phase}: {step.phase === 1 ? 'Detect Cycle' : 'Find Duplicate'}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ highlightLine }: { highlightLine: number }) {
  const lines = [
    "function findDuplicate(nums) {",
    "    // Phase 1: Find cycle using Floyd's algorithm", 
    "    let slow = nums[0], fast = nums[0];",
    "    do {",
    "        slow = nums[slow];",
    "        fast = nums[nums[fast]];", 
    "    } while (slow !== fast);",
    "",
    "    // Phase 2: Find start of cycle (duplicate)",
    "    slow = nums[0];",
    "    while (slow !== fast) {",
    "        slow = nums[slow];",
    "        fast = nums[fast];",
    "    }",
    "    return slow;",
    "}"
  ];

  return (
    <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
      {lines.map((line, index) => (
        <div
          key={index}
          className={`py-1 px-2 ${
            index + 1 === highlightLine 
              ? 'bg-blue-500/20 border-l-2 border-blue-400' 
              : ''
          }`}
        >
          <span className="text-slate-500 mr-4">{(index + 1).toString().padStart(2)}</span>
          <span className={index + 1 === highlightLine ? 'text-white' : 'text-slate-300'}>
            {line}
          </span>
        </div>
      ))}
    </div>
  );
}

const defaultInput = [1, 3, 4, 2, 2];
const testCases = [
  { nums: [1, 3, 4, 2, 2], label: "Example 1" },
  { nums: [3, 1, 3, 4, 2], label: "Example 2" },
  { nums: [1, 1], label: "Simple case" },
  { nums: [2, 5, 9, 6, 9, 3, 8, 9, 7, 1], label: "Larger array" },
];

export function FindTheDuplicateNumberVisualizer() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000);
  const [input, setInput] = useState(defaultInput);
  const [steps, setSteps] = useState<Step[]>([]);

  const generateVisualization = useCallback((nums: number[]) => {
    const newSteps = generateSteps(nums);
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    generateVisualization(input);
  }, [input, generateVisualization]);

  const currentStep = steps[currentStepIndex] || steps[0];

  const handleInputChange = (value: string) => {
    try {
      const nums = value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      if (nums.length > 1) {
        setInput(nums);
      }
    } catch (error) {
      // Ignore invalid input
    }
  };

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
    }, playSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length, playSpeed]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Find the Duplicate Number</h2>
        <p className="text-slate-400 mb-4">
          Given an array of integers where each integer is in range [1, n] and there's exactly one duplicate,
          find the duplicate number using Floyd's Cycle Detection Algorithm (treating array as linked list).
        </p>
        
        {/* Input Controls */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Array (comma-separated):
          </label>
          <input
            type="text"
            value={input.join(', ')}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded"
            placeholder="e.g., 1,3,4,2,2"
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            {testCases.map((testCase, index) => (
              <button
                key={index}
                onClick={() => setInput(testCase.nums)}
                className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
              >
                {testCase.label}
              </button>
            ))}
          </div>
        </div>

        <Controls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onStepBack={() => setCurrentStepIndex(s => Math.max(0, s - 1))}
          onStepForward={() => setCurrentStepIndex(s => Math.min(steps.length - 1, s + 1))}
          onReset={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          speed={playSpeed}
          onSpeedChange={setPlaySpeed}
          canStepBack={currentStepIndex > 0}
          canStepForward={currentStepIndex < steps.length - 1}
        />
      </div>

      {/* Current step description */}
      <div className="mb-6 p-4 bg-slate-800 rounded-xl">
        <p className="text-lg">{currentStep?.description}</p>
      </div>

      {/* Main visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ArrayVisualization step={currentStep} />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Algorithm Code</h3>
          <CodeBlock highlightLine={currentStep?.codeHighlight} />
          
          {/* Key insight */}
          <div className="mt-4 p-4 bg-slate-800 rounded-lg">
            <h4 className="font-medium text-green-400 mb-2">💡 Key Insight</h4>
            <p className="text-sm text-slate-300">
              Treat the array as a linked list where nums[i] points to index nums[i].
              Since there's a duplicate number, multiple indices will point to the same value,
              creating a cycle in this "linked list". Floyd's algorithm finds this cycle!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}