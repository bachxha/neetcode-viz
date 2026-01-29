import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'push' | 'pop-and-resolve' | 'done';
  temperatures: number[];
  currentIndex: number;
  stack: number[]; // indices
  result: number[];
  description: string;
  poppedIndex?: number;
  daysToWait?: number;
}

function generateSteps(temperatures: number[]): Step[] {
  const steps: Step[] = [];
  const stack: number[] = [];
  const result = new Array(temperatures.length).fill(0);
  
  steps.push({
    type: 'start',
    temperatures,
    currentIndex: -1,
    stack: [...stack],
    result: [...result],
    description: `Starting with temperatures [${temperatures.join(', ')}]. We'll use a monotonic decreasing stack to find next warmer days.`,
  });
  
  for (let i = 0; i < temperatures.length; i++) {
    const currentTemp = temperatures[i];
    
    // Pop from stack while current temp is warmer
    while (stack.length > 0 && temperatures[stack[stack.length - 1]] < currentTemp) {
      const poppedIndex = stack.pop()!;
      const daysToWait = i - poppedIndex;
      result[poppedIndex] = daysToWait;
      
      steps.push({
        type: 'pop-and-resolve',
        temperatures,
        currentIndex: i,
        stack: [...stack],
        result: [...result],
        poppedIndex,
        daysToWait,
        description: `Day ${i} (${currentTemp}°) is warmer than day ${poppedIndex} (${temperatures[poppedIndex]}°). Pop from stack and set result[${poppedIndex}] = ${daysToWait} days.`,
      });
    }
    
    // Push current index to stack
    stack.push(i);
    steps.push({
      type: 'push',
      temperatures,
      currentIndex: i,
      stack: [...stack],
      result: [...result],
      description: `Push day ${i} (${currentTemp}°) onto stack. Still waiting for a warmer day.`,
    });
  }
  
  steps.push({
    type: 'done',
    temperatures,
    currentIndex: temperatures.length - 1,
    stack: [...stack],
    result: [...result],
    description: `Algorithm complete! Days remaining in stack have no warmer days ahead (result = 0).`,
  });
  
  return steps;
}

const testCases = [
  { temperatures: [73, 74, 75, 71, 69, 72, 76, 73], description: 'Classic example' },
  { temperatures: [30, 40, 50, 60], description: 'Always increasing' },
  { temperatures: [60, 50, 40, 30], description: 'Always decreasing' },
  { temperatures: [75, 70, 80, 69, 72], description: 'Mixed pattern' },
  { temperatures: [89, 62, 70, 58, 47, 47, 46, 76, 100, 70], description: 'Complex case' },
];

export function DailyTemperaturesVisualizer() {
  const [temperatures, setTemperatures] = useState([73, 74, 75, 71, 69, 72, 76, 73]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    if (temperatures.length > 0 && temperatures.length <= 12) {
      const newSteps = generateSteps(temperatures);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [temperatures]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, 1000 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);
  const tempRange = maxTemp - minTemp;
  
  const loadTestCase = (testCase: typeof testCases[0]) => {
    setTemperatures(testCase.temperatures);
    setIsPlaying(false);
    setTimeout(() => {
      const newSteps = generateSteps(testCase.temperatures);
      setSteps(newSteps);
      setCurrentStep(0);
    }, 100);
  };
  
  const handleTemperaturesInput = (input: string) => {
    try {
      const temps = input.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t));
      if (temps.length > 0 && temps.length <= 12) {
        setTemperatures(temps);
      }
    } catch (e) {
      // Invalid input, ignore
    }
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Daily Temperatures</h1>
        <p className="text-slate-400">
          Find how many days you have to wait for a warmer temperature! 
          This classic monotonic stack problem efficiently tracks pending temperatures.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center flex-wrap">
        <label className="text-sm text-slate-400">Temperatures (comma-separated):</label>
        <input
          type="text"
          value={temperatures.join(', ')}
          onChange={(e) => handleTemperaturesInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          placeholder="73, 74, 75, 71, 69..."
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
        />
        <button
          onClick={initializeSteps}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm"
        >
          Visualize
        </button>
      </div>
      
      {/* Test Cases */}
      <div className="mb-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Quick Test Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {testCases.map((testCase, i) => (
            <button
              key={i}
              onClick={() => loadTestCase(testCase)}
              className={`p-3 rounded-lg border text-sm transition-colors ${
                JSON.stringify(temperatures) === JSON.stringify(testCase.temperatures)
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-slate-600 hover:border-slate-500 bg-slate-700'
              }`}
            >
              <div className="font-mono text-xs mb-1">[{testCase.temperatures.join(', ')}]</div>
              <div className="text-slate-400 text-xs">{testCase.description}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Temperatures Bar Chart */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Daily Temperatures (Bar Chart)</h3>
        <div className="flex items-end justify-center gap-2 h-48">
          {temperatures.map((temp, i) => {
            const isActive = i === currentStepData?.currentIndex;
            const isPassed = i < (currentStepData?.currentIndex || 0);
            const isInStack = currentStepData?.stack.includes(i);
            const isResolved = currentStepData?.result[i] > 0;
            const wasJustPopped = i === currentStepData?.poppedIndex;
            
            let barColor = 'bg-slate-600'; // default
            let textColor = 'text-slate-300';
            
            if (wasJustPopped) {
              barColor = 'bg-green-500';
              textColor = 'text-white';
            } else if (isActive) {
              barColor = 'bg-yellow-500';
              textColor = 'text-black';
            } else if (isInStack) {
              barColor = 'bg-orange-500';
              textColor = 'text-white';
            } else if (isResolved) {
              barColor = 'bg-green-600';
              textColor = 'text-white';
            } else if (isPassed) {
              barColor = 'bg-slate-500';
            }
            
            const barHeight = tempRange > 0 ? ((temp - minTemp) / tempRange) * 120 + 30 : 50;
            
            return (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  className={`w-12 ${barColor} rounded-t-lg flex flex-col justify-end items-center p-1 ${textColor}`}
                  style={{ height: barHeight }}
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    opacity: wasJustPopped ? [1, 0.5, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-xs font-bold">{temp}°</span>
                </motion.div>
                <div className="text-xs text-slate-400 mt-1">Day {i}</div>
                {isResolved && currentStepData?.result[i] > 0 && (
                  <motion.div 
                    className="text-xs font-bold text-green-400 mt-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    +{currentStepData.result[i]}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Current Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>In Stack (Waiting)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-500 rounded"></div>
            <span>Processed</span>
          </div>
        </div>
      </div>
      
      {/* Stack Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Monotonic Decreasing Stack</h3>
        <div className="flex flex-col items-center" style={{ minHeight: 200 }}>
          <div className="text-xs text-slate-500 mb-2">Top (Most Recent)</div>
          <AnimatePresence mode="popLayout">
            {currentStepData?.stack.slice().reverse().map((dayIndex, stackPos) => {
              const temp = temperatures[dayIndex];
              const wasJustPopped = dayIndex === currentStepData?.poppedIndex;
              
              return (
                <motion.div
                  key={`${dayIndex}-${currentStep}-${stackPos}`}
                  className={`w-20 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-sm mb-1 ${
                    wasJustPopped ? 'border-red-400 bg-red-500/20 text-red-400' : 'border-orange-400 bg-orange-500/20 text-orange-400'
                  }`}
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: wasJustPopped ? [1, 1.2, 1] : 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center">
                    <div>Day {dayIndex}</div>
                    <div className="text-xs">{temp}°</div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {(!currentStepData?.stack.length || currentStepData.stack.length === 0) && (
            <div className="h-12 w-20 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-500 text-sm">
              Empty
            </div>
          )}
          <div className="text-xs text-slate-500 mt-2">Bottom (Oldest)</div>
          <div className="mt-2 text-sm text-slate-400">
            Stack Size: {currentStepData?.stack.length || 0}
          </div>
        </div>
      </div>
      
      {/* Result Array */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Result Array (Days to Wait)</h3>
        <div className="flex justify-center gap-2">
          {currentStepData?.result.map((days, i) => {
            const wasJustUpdated = i === currentStepData?.poppedIndex && currentStepData.type === 'pop-and-resolve';
            
            return (
              <motion.div
                key={i}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold ${
                  days > 0 ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'
                }`}
                animate={{ 
                  scale: wasJustUpdated ? [1, 1.3, 1] : 1,
                  boxShadow: wasJustUpdated ? ['0 0 0 0px rgba(34, 197, 94, 0.4)', '0 0 0 10px rgba(34, 197, 94, 0)', '0 0 0 0px rgba(34, 197, 94, 0)'] : 'none'
                }}
                transition={{ duration: 0.5 }}
              >
                {days}
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-center gap-2 mt-2">
          {temperatures.map((_, i) => (
            <div key={i} className="w-12 text-center text-xs text-slate-400">
              [{i}]
            </div>
          ))}
        </div>
      </div>
      
      {/* Current Step Description */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`w-4 h-4 rounded-full flex-shrink-0 ${
            currentStepData?.type === 'start' ? 'bg-blue-500' :
            currentStepData?.type === 'push' ? 'bg-orange-500' :
            currentStepData?.type === 'pop-and-resolve' ? 'bg-green-500' :
            currentStepData?.type === 'done' ? 'bg-purple-500' :
            'bg-gray-500'
          }`} />
          <span className="text-lg flex-1">{currentStepData?.description || 'Ready'}</span>
          {currentStepData?.daysToWait && (
            <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-green-500/20 text-green-400">
              {currentStepData.daysToWait} days
            </span>
          )}
        </div>
      </div>
      
      {/* Algorithm Steps */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Steps</h3>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'start' ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'start' ? 'bg-blue-400' : 'bg-slate-600'}`} />
            1. Initialize empty stack and result array
          </div>
          <div className={`flex items-center gap-2 ${['pop-and-resolve'].includes(currentStepData?.type || '') ? 'text-green-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${['pop-and-resolve'].includes(currentStepData?.type || '') ? 'bg-green-400' : 'bg-slate-600'}`} />
            2. While stack not empty and current temp {'>'} stack top temp: pop and calculate days
          </div>
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'push' ? 'text-orange-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'push' ? 'bg-orange-400' : 'bg-slate-600'}`} />
            3. Push current day index to stack
          </div>
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'done' ? 'text-purple-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'done' ? 'bg-purple-400' : 'bg-slate-600'}`} />
            4. Remaining indices in stack have no warmer days (result = 0)
          </div>
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
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Java Implementation</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int[] dailyTemperatures(int[] temperatures) {
    int[] result = new int[temperatures.length];
    Stack<Integer> stack = new Stack<>(); // Store indices
    
    for (int i = 0; i < temperatures.length; i++) {
        // Pop while current temp is warmer than stack top
        while (!stack.isEmpty() && 
               temperatures[i] {'>'} temperatures[stack.peek()]) {
            int prevIndex = stack.pop();
            result[prevIndex] = i - prevIndex; // Days to wait
        }
        
        // Push current index to stack
        stack.push(i);
    }
    
    // Remaining indices have no warmer days (already 0)
    return result;
}

// Time: O(n) - each element pushed/popped at most once
// Space: O(n) - stack can hold up to n elements`}
        </pre>
        
        <div className="mt-4 p-3 bg-slate-900 rounded-lg">
          <h4 className="text-xs font-semibold text-slate-400 mb-2">🎯 Key Insights</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• <strong>Monotonic Stack:</strong> Stack maintains indices in decreasing temperature order</li>
            <li>• <strong>Efficient:</strong> O(n) time - each element added/removed from stack exactly once</li>
            <li>• <strong>Store Indices:</strong> Stack stores day indices, not temperatures (for distance calculation)</li>
            <li>• <strong>Pop Condition:</strong> Current temp {'>'} stack top temp means we found answer for stack top</li>
            <li>• <strong>Next Greater Element:</strong> This is a variant of the classic "Next Greater Element" pattern</li>
            <li>• <strong>Applications:</strong> Stock prices, histogram problems, expression parsing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}