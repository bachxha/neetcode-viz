import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'process' | 'pop' | 'final' | 'done';
  currentIndex?: number;
  heights: number[];
  stack: { index: number; height: number }[];
  currentRect?: {
    leftIndex: number;
    rightIndex: number;
    height: number;
    area: number;
  };
  maxArea: number;
  bestRect?: {
    leftIndex: number;
    rightIndex: number;
    height: number;
    area: number;
  };
  description: string;
  highlightBar?: number;
  poppedElement?: { index: number; height: number };
}

function generateSteps(heights: number[]): Step[] {
  const steps: Step[] = [];
  const stack: { index: number; height: number }[] = [];
  let maxArea = 0;
  let bestRect: { leftIndex: number; rightIndex: number; height: number; area: number } | undefined;
  
  steps.push({
    type: 'start',
    heights: [...heights],
    stack: [],
    maxArea: 0,
    description: 'Initialize empty stack and start processing histogram bars. Stack stores indices of bars in increasing height order.',
  });
  
  for (let i = 0; i < heights.length; i++) {
    const currentHeight = heights[i];
    
    // Pop elements while current height is smaller than stack top
    while (stack.length > 0 && stack[stack.length - 1].height > currentHeight) {
      const popped = stack.pop()!;
      const width = stack.length === 0 ? i : i - stack[stack.length - 1].index - 1;
      const area = popped.height * width;
      
      const leftIndex = stack.length === 0 ? 0 : stack[stack.length - 1].index + 1;
      const rightIndex = i - 1;
      
      const currentRect = {
        leftIndex,
        rightIndex,
        height: popped.height,
        area,
      };
      
      if (area > maxArea) {
        maxArea = area;
        bestRect = { ...currentRect };
      }
      
      steps.push({
        type: 'pop',
        currentIndex: i,
        heights: [...heights],
        stack: [...stack],
        currentRect,
        maxArea,
        bestRect: bestRect ? { ...bestRect } : undefined,
        poppedElement: popped,
        description: `Pop bar at index ${popped.index} (height ${popped.height}). Calculate area: height=${popped.height} × width=${width} = ${area}. ${area > (steps[steps.length - 1]?.maxArea || 0) ? 'New max area!' : ''}`,
        highlightBar: popped.index,
      });
    }
    
    // Push current bar to stack
    stack.push({ index: i, height: currentHeight });
    
    steps.push({
      type: 'process',
      currentIndex: i,
      heights: [...heights],
      stack: [...stack],
      maxArea,
      bestRect: bestRect ? { ...bestRect } : undefined,
      description: `Push bar at index ${i} (height ${currentHeight}) to stack. Stack maintains increasing height order.`,
      highlightBar: i,
    });
  }
  
  // Process remaining elements in stack
  while (stack.length > 0) {
    const popped = stack.pop()!;
    const width = stack.length === 0 ? heights.length : heights.length - stack[stack.length - 1].index - 1;
    const area = popped.height * width;
    
    const leftIndex = stack.length === 0 ? 0 : stack[stack.length - 1].index + 1;
    const rightIndex = heights.length - 1;
    
    const currentRect = {
      leftIndex,
      rightIndex,
      height: popped.height,
      area,
    };
    
    if (area > maxArea) {
      maxArea = area;
      bestRect = { ...currentRect };
    }
    
    steps.push({
      type: 'final',
      heights: [...heights],
      stack: [...stack],
      currentRect,
      maxArea,
      bestRect: bestRect ? { ...bestRect } : undefined,
      poppedElement: popped,
      description: `Final cleanup: Pop bar at index ${popped.index} (height ${popped.height}). Calculate area: height=${popped.height} × width=${width} = ${area}. ${area > (steps[steps.length - 1]?.maxArea || 0) ? 'New max area!' : ''}`,
      highlightBar: popped.index,
    });
  }
  
  steps.push({
    type: 'done',
    heights: [...heights],
    stack: [],
    maxArea,
    bestRect: bestRect ? { ...bestRect } : undefined,
    description: `Algorithm complete! Maximum rectangle area is ${maxArea}.`,
  });
  
  return steps;
}

const testCases = [
  {
    heights: [2, 1, 5, 6, 2, 3],
    description: 'LeetCode Example'
  },
  {
    heights: [2, 4],
    description: 'Simple Case'
  },
  {
    heights: [6, 7, 5, 2, 4, 5, 9, 3],
    description: 'Mixed Heights'
  },
  {
    heights: [1, 2, 3, 4, 5],
    description: 'Increasing'
  },
  {
    heights: [5, 4, 3, 2, 1],
    description: 'Decreasing'
  },
];

export function LargestRectangleInHistogramVisualizer() {
  const [heights, setHeights] = useState(testCases[0].heights);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    if (heights.length > 0 && heights.length <= 10) {
      const newSteps = generateSteps(heights);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [heights]);
  
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
    }, 1200 / speed);
    
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
  const maxHeight = Math.max(...heights);
  
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Largest Rectangle in Histogram</h1>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Find the area of the largest rectangle that can be formed in a histogram. 
          We use a stack to efficiently track bars in increasing height order.
        </p>
      </div>
      
      {/* Test Cases */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {testCases.map((testCase, index) => (
          <button
            key={index}
            onClick={() => {
              setHeights(testCase.heights);
              setIsPlaying(false);
            }}
            className={`p-3 rounded-lg border text-left transition-all ${
              JSON.stringify(heights) === JSON.stringify(testCase.heights)
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="font-medium text-sm mb-1">{testCase.description}</div>
            <div className="text-xs text-slate-400">
              [{testCase.heights.join(', ')}]
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
      
      {/* Current Step Info */}
      {currentStepData && (
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-blue-400">
              {currentStepData.type === 'start' && 'Initialize'}
              {currentStepData.type === 'process' && `Processing Bar ${currentStepData.currentIndex}`}
              {currentStepData.type === 'pop' && 'Calculating Rectangle'}
              {currentStepData.type === 'final' && 'Final Cleanup'}
              {currentStepData.type === 'done' && 'Complete'}
            </span>
            <span className="text-green-400 font-mono text-lg">
              Max Area: {currentStepData.maxArea}
            </span>
          </div>
          <p className="text-slate-300">{currentStepData.description}</p>
          {currentStepData.currentRect && (
            <div className="mt-2 text-sm text-yellow-400">
              Current rectangle: height={currentStepData.currentRect.height}, 
              width={(currentStepData.currentRect.rightIndex - currentStepData.currentRect.leftIndex + 1)}, 
              area={currentStepData.currentRect.area}
            </div>
          )}
        </div>
      )}
      
      {/* Visualization */}
      {currentStepData && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Histogram */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 text-white text-center">Histogram</h3>
            <div className="bg-slate-900 p-6 rounded-lg">
              <div className="flex items-end justify-center gap-2 h-80">
                {heights.map((height, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <motion.div
                      className={`w-12 border-2 relative ${
                        currentStepData.highlightBar === index
                          ? 'border-yellow-400 bg-yellow-500/30'
                          : currentStepData.bestRect &&
                            index >= currentStepData.bestRect.leftIndex &&
                            index <= currentStepData.bestRect.rightIndex
                          ? 'border-green-400 bg-green-500/30'
                          : currentStepData.currentRect &&
                            index >= currentStepData.currentRect.leftIndex &&
                            index <= currentStepData.currentRect.rightIndex
                          ? 'border-blue-400 bg-blue-500/30'
                          : 'border-slate-500 bg-slate-700'
                      }`}
                      style={{
                        height: `${(height / maxHeight) * 250}px`,
                      }}
                      animate={{
                        scale: currentStepData.highlightBar === index ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium">
                        {height}
                      </span>
                    </motion.div>
                    <span className="text-xs text-slate-400 mt-1">{index}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Stack Visualization */}
          <div className="lg:w-80">
            <h3 className="text-lg font-semibold mb-4 text-white text-center">Stack (Index, Height)</h3>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="flex flex-col-reverse items-center gap-2 min-h-[300px] justify-end">
                <div className="w-32 h-3 bg-slate-600 rounded-b-lg" />
                <AnimatePresence mode="popLayout">
                  {currentStepData.stack.map((item, index) => (
                    <motion.div
                      key={`stack-${index}-${item.index}`}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        backgroundColor: 
                          currentStepData.poppedElement && 
                          currentStepData.poppedElement.index === item.index
                            ? '#ef4444' // red for popped element
                            : index === currentStepData.stack.length - 1
                            ? '#eab308' // yellow for top element
                            : '#374151', // default gray
                      }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.5, 
                        y: -20,
                        backgroundColor: '#ef4444'
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-28 h-16 rounded border-2 border-slate-500 flex flex-col items-center justify-center text-white font-bold text-sm"
                    >
                      <span>i: {item.index}</span>
                      <span>h: {item.height}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentStepData.stack.length === 0 && (
                  <div className="text-slate-500 text-sm italic pt-8">Empty</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Color Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm">Current Processing / Stack Top</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">Current Rectangle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Best Rectangle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">Popped Element</span>
          </div>
        </div>
      </div>
      
      {/* Algorithm Explanation */}
      <div className="bg-slate-900 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-white">Algorithm Steps</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p>1. <strong>Use a stack</strong> to store indices of bars in increasing height order</p>
          <p>2. <strong>For each bar:</strong> Pop stack while current height &lt; stack top height</p>
          <p>3. <strong>When popping:</strong> Calculate rectangle area with popped height as minimum</p>
          <p>4. <strong>Width calculation:</strong> Current index - previous stack element index - 1</p>
          <p>5. <strong>After processing all bars:</strong> Pop remaining stack elements</p>
        </div>
      </div>
      
      {/* Java Code Example */}
      <div className="bg-slate-900 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-white">Java Implementation</h3>
        <pre className="text-sm text-slate-300 overflow-x-auto">
{`public int largestRectangleArea(int[] heights) {
    Stack<Integer> stack = new Stack<>();
    int maxArea = 0;
    
    for (int i = 0; i < heights.length; i++) {
        // Pop while current height is smaller
        while (!stack.isEmpty() && heights[stack.peek()] > heights[i]) {
            int height = heights[stack.pop()];
            int width = stack.isEmpty() ? i : i - stack.peek() - 1;
            maxArea = Math.max(maxArea, height * width);
        }
        stack.push(i);
    }
    
    // Process remaining bars
    while (!stack.isEmpty()) {
        int height = heights[stack.pop()];
        int width = stack.isEmpty() ? heights.length : heights.length - stack.peek() - 1;
        maxArea = Math.max(maxArea, height * width);
    }
    
    return maxArea;
}

// Time Complexity: O(n) - each bar pushed/popped once
// Space Complexity: O(n) - stack storage`}
        </pre>
      </div>
    </div>
  );
}