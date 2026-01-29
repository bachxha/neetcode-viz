import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'push' | 'pop' | 'getMin' | 'done';
  operation: string;
  value?: number;
  mainStack: number[];
  minStack: number[];
  result?: number;
  description: string;
  highlightElement?: 'main' | 'min';
  poppedValue?: number;
}

function generateSteps(operations: Array<{op: string, val?: number}>): Step[] {
  const steps: Step[] = [];
  const mainStack: number[] = [];
  const minStack: number[] = [];
  
  steps.push({
    type: 'start',
    operation: 'Initialize',
    mainStack: [...mainStack],
    minStack: [...minStack],
    description: 'Initialize MinStack with two stacks: main stack for elements and min stack for tracking minimums.',
  });
  
  for (const { op, val } of operations) {
    if (op === 'push' && val !== undefined) {
      mainStack.push(val);
      const currentMin = minStack.length === 0 ? val : Math.min(val, minStack[minStack.length - 1]);
      minStack.push(currentMin);
      
      steps.push({
        type: 'push',
        operation: `push(${val})`,
        value: val,
        mainStack: [...mainStack],
        minStack: [...minStack],
        description: `Push ${val} to main stack. Min of ${val} and current min (${minStack.length > 1 ? minStack[minStack.length - 2] : 'none'}) = ${currentMin}. Push ${currentMin} to min stack.`,
        highlightElement: 'main',
      });
    } else if (op === 'pop') {
      if (mainStack.length > 0) {
        const poppedValue = mainStack.pop()!;
        minStack.pop();
        
        steps.push({
          type: 'pop',
          operation: 'pop()',
          mainStack: [...mainStack],
          minStack: [...minStack],
          poppedValue,
          description: `Pop ${poppedValue} from main stack and corresponding min from min stack.`,
          highlightElement: 'main',
        });
      }
    } else if (op === 'getMin') {
      const currentMin = minStack.length > 0 ? minStack[minStack.length - 1] : undefined;
      
      steps.push({
        type: 'getMin',
        operation: 'getMin()',
        mainStack: [...mainStack],
        minStack: [...minStack],
        result: currentMin,
        description: `Return top of min stack: ${currentMin}. This is the minimum element in O(1) time.`,
        highlightElement: 'min',
      });
    }
  }
  
  steps.push({
    type: 'done',
    operation: 'Complete',
    mainStack: [...mainStack],
    minStack: [...minStack],
    description: 'All operations completed successfully!',
  });
  
  return steps;
}

const testCases = [
  {
    operations: [
      {op: 'push', val: -2},
      {op: 'push', val: 0},
      {op: 'push', val: -3},
      {op: 'getMin'},
      {op: 'pop'},
      {op: 'getMin'},
    ],
    description: 'LeetCode Example'
  },
  {
    operations: [
      {op: 'push', val: 5},
      {op: 'push', val: 1},
      {op: 'push', val: 3},
      {op: 'getMin'},
      {op: 'pop'},
      {op: 'push', val: 0},
      {op: 'getMin'},
      {op: 'pop'},
      {op: 'getMin'},
    ],
    description: 'Mixed Operations'
  },
  {
    operations: [
      {op: 'push', val: 10},
      {op: 'push', val: 5},
      {op: 'push', val: 2},
      {op: 'push', val: 8},
      {op: 'getMin'},
      {op: 'pop'},
      {op: 'pop'},
      {op: 'getMin'},
    ],
    description: 'Decreasing then Mixed'
  },
  {
    operations: [
      {op: 'push', val: 1},
      {op: 'getMin'},
      {op: 'push', val: 1},
      {op: 'getMin'},
      {op: 'pop'},
      {op: 'getMin'},
    ],
    description: 'Duplicate Minimums'
  },
];

export function MinStackVisualizer() {
  const [operations, setOperations] = useState(testCases[0].operations);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    if (operations.length > 0 && operations.length <= 15) {
      const newSteps = generateSteps(operations);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [operations]);
  
  useEffect(() => {
    initializeSteps();
  }, [initializeSteps]);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);
    
    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Min Stack</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Design a stack that supports push, pop, and retrieving the minimum element in O(1) time.
          We use two stacks: one for elements and one for tracking minimums.
        </p>
      </div>
      
      {/* Test Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testCases.map((testCase, index) => (
          <button
            key={index}
            onClick={() => {
              setOperations(testCase.operations);
              setIsPlaying(false);
            }}
            className={`p-3 rounded-lg border text-left transition-all ${
              JSON.stringify(operations) === JSON.stringify(testCase.operations)
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="font-medium text-sm mb-1">{testCase.description}</div>
            <div className="text-xs text-slate-400">
              {testCase.operations.map(op => op.op + (op.val !== undefined ? `(${op.val})` : '()')).join(' → ')}
            </div>
          </button>
        ))}
      </div>
      
      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onStepBack={handleStepBack}
        onStepForward={handleStepForward}
        onReset={handleReset}
        currentStep={currentStep}
        totalSteps={steps.length}
        speed={speed}
        onSpeedChange={setSpeed}
        canStepBack={currentStep > 0}
        canStepForward={currentStep < steps.length - 1}
      />
      
      {/* Current Operation Display */}
      {currentStepData && (
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-blue-400">
              Operation: {currentStepData.operation}
            </span>
            {currentStepData.result !== undefined && (
              <span className="text-green-400 font-mono text-lg">
                Result: {currentStepData.result}
              </span>
            )}
          </div>
          <p className="text-slate-300">{currentStepData.description}</p>
        </div>
      )}
      
      {/* Stacks Visualization */}
      {currentStepData && (
        <div className="flex justify-center gap-12">
          {/* Main Stack */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4 text-white">Main Stack</h3>
            <div className="flex flex-col-reverse items-center gap-2 min-h-[300px] justify-end">
              <div className="w-24 h-3 bg-slate-600 rounded-b-lg" />
              <AnimatePresence mode="popLayout">
                {currentStepData.mainStack.map((value, index) => (
                  <motion.div
                    key={`main-${index}-${value}`}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      backgroundColor: 
                        currentStepData.type === 'push' && index === currentStepData.mainStack.length - 1
                          ? '#10b981' // green for new element
                          : currentStepData.type === 'pop' && currentStepData.poppedValue === value
                          ? '#ef4444' // red for popped element
                          : currentStepData.highlightElement === 'main' && index === currentStepData.mainStack.length - 1
                          ? '#eab308' // yellow for highlighted element
                          : '#374151', // default gray
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.5, 
                      y: -20,
                      backgroundColor: '#ef4444'
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-20 h-12 rounded border-2 border-slate-500 flex items-center justify-center text-white font-bold text-lg"
                  >
                    {value}
                  </motion.div>
                ))}
              </AnimatePresence>
              {currentStepData.mainStack.length === 0 && (
                <div className="text-slate-500 text-sm italic pt-8">Empty</div>
              )}
            </div>
          </div>
          
          {/* Min Stack */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4 text-white">Min Stack</h3>
            <div className="flex flex-col-reverse items-center gap-2 min-h-[300px] justify-end">
              <div className="w-24 h-3 bg-slate-600 rounded-b-lg" />
              <AnimatePresence mode="popLayout">
                {currentStepData.minStack.map((value, index) => (
                  <motion.div
                    key={`min-${index}-${value}`}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      backgroundColor: 
                        currentStepData.type === 'push' && index === currentStepData.minStack.length - 1
                          ? '#10b981' // green for new element
                          : currentStepData.type === 'getMin' && index === currentStepData.minStack.length - 1
                          ? '#eab308' // yellow for getMin highlight
                          : currentStepData.highlightElement === 'min' && index === currentStepData.minStack.length - 1
                          ? '#eab308' // yellow for highlighted element
                          : '#6366f1', // purple for min stack
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.5, 
                      y: -20,
                      backgroundColor: '#ef4444'
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-20 h-12 rounded border-2 border-purple-400 flex items-center justify-center text-white font-bold text-lg"
                  >
                    {value}
                  </motion.div>
                ))}
              </AnimatePresence>
              {currentStepData.minStack.length === 0 && (
                <div className="text-slate-500 text-sm italic pt-8">Empty</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Color Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">New Element</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">Popped Element</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm">Current Min / Highlighted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">Min Stack Element</span>
          </div>
        </div>
      </div>
      
      {/* Java Code Example */}
      <div className="bg-slate-900 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-white">Java Implementation (Two Stack Approach)</h3>
        <pre className="text-sm text-slate-300 overflow-x-auto">
{`class MinStack {
    private Stack<Integer> stack;
    private Stack<Integer> minStack;
    
    public MinStack() {
        stack = new Stack<>();
        minStack = new Stack<>();
    }
    
    public void push(int val) {
        stack.push(val);
        if (minStack.isEmpty() || val <= minStack.peek()) {
            minStack.push(val);
        } else {
            minStack.push(minStack.peek()); // Keep current min
        }
    }
    
    public void pop() {
        stack.pop();
        minStack.pop();
    }
    
    public int top() {
        return stack.peek();
    }
    
    public int getMin() {
        return minStack.peek();
    }
}

// Time Complexity: O(1) for all operations
// Space Complexity: O(n) for both stacks`}
        </pre>
      </div>
    </div>
  );
}