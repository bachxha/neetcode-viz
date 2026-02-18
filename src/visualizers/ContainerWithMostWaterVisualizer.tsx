import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'calculate' | 'move-left' | 'move-right' | 'update-max' | 'done';
  heights: number[];
  left: number;
  right: number;
  currentArea: number;
  maxArea: number;
  description: string;
  moveReason?: string;
}

function generateSteps(heights: number[]): Step[] {
  const steps: Step[] = [];
  
  if (heights.length < 2) {
    steps.push({
      type: 'done',
      heights,
      left: -1,
      right: -1,
      currentArea: 0,
      maxArea: 0,
      description: 'Need at least 2 heights to form a container.',
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    heights,
    left: 0,
    right: heights.length - 1,
    currentArea: 0,
    maxArea: 0,
    description: 'Start with two pointers at both ends. We\'ll move the pointer at the shorter line inward to potentially find a larger area.',
  });
  
  let left = 0;
  let right = heights.length - 1;
  let maxArea = 0;
  
  while (left < right) {
    // Calculate current area
    const width = right - left;
    const height = Math.min(heights[left], heights[right]);
    const currentArea = width * height;
    
    steps.push({
      type: 'calculate',
      heights,
      left,
      right,
      currentArea,
      maxArea,
      description: `Calculate area: width = ${width}, height = min(${heights[left]}, ${heights[right]}) = ${height}, area = ${currentArea}`,
    });
    
    // Update max area if current is larger
    if (currentArea > maxArea) {
      maxArea = currentArea;
      steps.push({
        type: 'update-max',
        heights,
        left,
        right,
        currentArea,
        maxArea,
        description: `New maximum area found: ${maxArea}!`,
      });
    }
    
    // Move the pointer at the shorter line
    if (heights[left] < heights[right]) {
      const oldLeft = left;
      left++;
      steps.push({
        type: 'move-left',
        heights,
        left,
        right,
        currentArea: 0,
        maxArea,
        description: `Move left pointer from ${oldLeft} to ${left}`,
        moveReason: `Height[${oldLeft}] = ${heights[oldLeft]} < Height[${right}] = ${heights[right]}. Move the shorter line to potentially find a taller one.`,
      });
    } else {
      const oldRight = right;
      right--;
      steps.push({
        type: 'move-right',
        heights,
        left,
        right,
        currentArea: 0,
        maxArea,
        description: `Move right pointer from ${oldRight} to ${right}`,
        moveReason: `Height[${oldRight}] = ${heights[oldRight]} <= Height[${left}] = ${heights[left]}. Move the shorter line to potentially find a taller one.`,
      });
    }
  }
  
  steps.push({
    type: 'done',
    heights,
    left,
    right,
    currentArea: 0,
    maxArea,
    description: `Algorithm complete! Maximum water area is ${maxArea}.`,
  });
  
  return steps;
}

export function ContainerWithMostWaterVisualizer() {
  const [input, setInput] = useState('1,8,6,2,5,4,8,3,7');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const heights = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0);
    if (heights.length >= 2 && heights.length <= 15) {
      const newSteps = generateSteps(heights);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [input]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1500 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  if (!currentStepData) return null;
  
  const maxHeight = Math.max(...currentStepData.heights);
  const containerHeight = 300;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Container With Most Water</h1>
        <p className="text-slate-400">
          Find two lines that together with the x-axis form a container that holds the most water.
          Use two pointers starting from both ends, always move the pointer at the shorter line.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Heights (comma-separated):</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
        />
      </div>
      
      {/* Container visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Container Visualization</h3>
        <div className="flex items-end justify-center gap-1 mb-4" style={{ height: containerHeight + 50 }}>
          {currentStepData.heights.map((height, idx) => {
            const isLeft = idx === currentStepData.left;
            const isRight = idx === currentStepData.right;
            const isInContainer = currentStepData.left !== -1 && currentStepData.right !== -1 && 
                                 idx >= currentStepData.left && idx <= currentStepData.right;
            const barHeight = (height / maxHeight) * containerHeight;
            
            return (
              <div key={idx} className="flex flex-col items-center relative">
                {/* Pointer labels */}
                {isLeft && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-8 text-blue-300 font-bold text-sm z-10"
                  >
                    L
                  </motion.div>
                )}
                {isRight && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-8 text-orange-300 font-bold text-sm z-10"
                  >
                    R
                  </motion.div>
                )}
                
                {/* Water area visualization */}
                {isInContainer && currentStepData.type === 'calculate' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="absolute bg-blue-400 bottom-0 rounded-t"
                    style={{ 
                      height: (Math.min(currentStepData.heights[currentStepData.left], currentStepData.heights[currentStepData.right]) / maxHeight) * containerHeight,
                      width: '100%',
                      zIndex: 1
                    }}
                  />
                )}
                
                {/* Height bars */}
                <motion.div
                  className={`relative rounded-t min-w-[40px] ${
                    isLeft ? 'bg-blue-500' :
                    isRight ? 'bg-orange-500' :
                    'bg-slate-600'
                  }`}
                  style={{ height: barHeight }}
                  animate={{
                    scale: isLeft || isRight ? 1.05 : 1,
                  }}
                >
                  {/* Height label */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-slate-300">
                    {height}
                  </div>
                </motion.div>
                
                {/* Index label */}
                <span className="text-xs text-slate-500 mt-2">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current calculation and stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Calculation</h3>
          {currentStepData.type === 'calculate' && currentStepData.left !== -1 && currentStepData.right !== -1 && (
            <div className="space-y-2">
              <div className="text-sm space-y-1">
                <div>Width: <span className="text-cyan-400 font-mono">{currentStepData.right - currentStepData.left}</span></div>
                <div>Height: <span className="text-green-400 font-mono">min({currentStepData.heights[currentStepData.left]}, {currentStepData.heights[currentStepData.right]}) = {Math.min(currentStepData.heights[currentStepData.left], currentStepData.heights[currentStepData.right])}</span></div>
                <div className="border-t border-slate-600 pt-2">
                  Area: <span className="text-yellow-400 font-bold text-lg">{currentStepData.currentArea}</span>
                </div>
              </div>
            </div>
          )}
          {currentStepData.type !== 'calculate' && (
            <span className="text-slate-500">-</span>
          )}
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Pointers</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-400">Left:</span>
              <span className="font-mono">{currentStepData.left !== -1 ? `${currentStepData.left} (h=${currentStepData.heights[currentStepData.left]})` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400">Right:</span>
              <span className="font-mono">{currentStepData.right !== -1 ? `${currentStepData.right} (h=${currentStepData.heights[currentStepData.right]})` : '-'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Maximum Area</h3>
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-green-400"
              animate={{ 
                scale: currentStepData.type === 'update-max' ? [1, 1.2, 1] : 1 
              }}
            >
              {currentStepData.maxArea}
            </motion.div>
            <div className="text-sm text-slate-400 mt-1">Best so far</div>
          </div>
        </div>
      </div>
      
      {/* Status and reasoning */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
            currentStepData.type === 'done' ? 'bg-green-500' :
            currentStepData.type === 'update-max' ? 'bg-green-500' :
            currentStepData.type === 'calculate' ? 'bg-yellow-500' :
            currentStepData.type === 'move-left' ? 'bg-blue-500' :
            currentStepData.type === 'move-right' ? 'bg-orange-500' :
            'bg-cyan-500'
          }`} />
          <div className="space-y-2">
            <div className="text-lg">{currentStepData.description}</div>
            {currentStepData.moveReason && (
              <div className="text-sm text-slate-400 italic">
                💡 {currentStepData.moveReason}
              </div>
            )}
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
      
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int maxArea(int[] height) {
    int left = 0;
    int right = height.length - 1;
    int maxArea = 0;
    
    while (left < right) {
        // Calculate current area
        int width = right - left;
        int currentHeight = Math.min(height[left], height[right]);
        int currentArea = width * currentHeight;
        
        // Update maximum area
        maxArea = Math.max(maxArea, currentArea);
        
        // Move the pointer at the shorter line
        if (height[left] < height[right]) {
            left++;  // Move left pointer inward
        } else {
            right--; // Move right pointer inward
        }
    }
    
    return maxArea;
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="space-y-2 text-slate-300">
          <p><strong>🔑 Key Insight:</strong> Always move the pointer at the shorter line inward.</p>
          <p><strong>📐 Why this works:</strong> The area is limited by the shorter line. Moving the taller line inward can only decrease the area (width decreases, height stays same or gets smaller).</p>
          <p><strong>📈 Strategy:</strong> By moving the shorter line, we might find a taller line that compensates for the reduced width.</p>
          <p><strong>⏱️ Time complexity:</strong> O(n) - single pass with two pointers.</p>
          <p><strong>💾 Space complexity:</strong> O(1) - only using a few variables.</p>
          <p><strong>🎯 Greedy choice:</strong> At each step, we eliminate the less promising option (shorter line) and explore the potentially better one.</p>
        </div>
      </div>
    </div>
  );
}