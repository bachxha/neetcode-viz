import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'compare' | 'move-left' | 'move-right' | 'update-max' | 'done';
  heights: number[];
  left: number;
  right: number;
  currentArea: number;
  maxArea: number;
  maxLeft: number;
  maxRight: number;
  description: string;
}

function generateSteps(heights: number[]): Step[] {
  const steps: Step[] = [];
  
  if (heights.length < 2) {
    steps.push({
      type: 'done',
      heights,
      left: 0,
      right: 0,
      currentArea: 0,
      maxArea: 0,
      maxLeft: 0,
      maxRight: 0,
      description: 'Need at least 2 bars to form a container',
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
    maxLeft: 0,
    maxRight: heights.length - 1,
    description: 'Find two lines that form container with most water. Start with widest.',
  });
  
  let left = 0;
  let right = heights.length - 1;
  let maxArea = 0;
  let maxLeft = 0;
  let maxRight = heights.length - 1;
  
  while (left < right) {
    const width = right - left;
    const height = Math.min(heights[left], heights[right]);
    const area = width * height;
    
    steps.push({
      type: 'compare',
      heights,
      left,
      right,
      currentArea: area,
      maxArea,
      maxLeft,
      maxRight,
      description: `Area = min(${heights[left]}, ${heights[right]}) × ${width} = ${height} × ${width} = ${area}`,
    });
    
    if (area > maxArea) {
      maxArea = area;
      maxLeft = left;
      maxRight = right;
      
      steps.push({
        type: 'update-max',
        heights,
        left,
        right,
        currentArea: area,
        maxArea,
        maxLeft,
        maxRight,
        description: `New maximum! Area = ${maxArea}`,
      });
    }
    
    // Move the shorter pointer inward
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
        maxLeft,
        maxRight,
        description: `Left bar (${heights[oldLeft]}) is shorter. Move left pointer → to find taller bar.`,
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
        maxLeft,
        maxRight,
        description: `Right bar (${heights[oldRight]}) is shorter/equal. Move right pointer ← to find taller bar.`,
      });
    }
  }
  
  steps.push({
    type: 'done',
    heights,
    left: maxLeft,
    right: maxRight,
    currentArea: maxArea,
    maxArea,
    maxLeft,
    maxRight,
    description: `Maximum water: ${maxArea} (between indices ${maxLeft} and ${maxRight})`,
  });
  
  return steps;
}

export function TwoPointersVisualizer() {
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 800 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  const maxHeight = currentStepData ? Math.max(...currentStepData.heights, 1) : 1;
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Container With Most Water</h1>
        <p className="text-slate-400">
          Use two pointers starting from edges. Move the shorter pointer inward 
          to potentially find a taller bar and more water.
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
        <div className="flex items-end justify-center gap-2" style={{ minHeight: '240px' }}>
          {currentStepData?.heights.map((h, i) => {
            const isLeft = i === currentStepData.left;
            const isRight = i === currentStepData.right;
            const isMaxLeft = i === currentStepData.maxLeft && currentStepData.type === 'done';
            const isMaxRight = i === currentStepData.maxRight && currentStepData.type === 'done';
            const inContainer = i >= currentStepData.left && i <= currentStepData.right;
            const barHeight = (h / maxHeight) * 200;
            
            // Calculate water level for current container
            const waterHeight = inContainer && currentStepData.type === 'compare' 
              ? (Math.min(currentStepData.heights[currentStepData.left], currentStepData.heights[currentStepData.right]) / maxHeight) * 200
              : 0;
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center relative"
                animate={{ scale: isLeft || isRight ? 1.05 : 1 }}
              >
                {/* Pointer labels */}
                {isLeft && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-8 text-yellow-400 font-bold text-sm"
                  >
                    L
                  </motion.div>
                )}
                {isRight && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-8 text-cyan-400 font-bold text-sm"
                  >
                    R
                  </motion.div>
                )}
                
                {/* Bar */}
                <div className="relative">
                  {/* Water level indicator */}
                  {inContainer && waterHeight > 0 && i > currentStepData.left && i < currentStepData.right && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: waterHeight }}
                      className="absolute bottom-0 left-0 right-0 bg-blue-500/40 rounded-t"
                      style={{ height: waterHeight }}
                    />
                  )}
                  
                  <motion.div
                    className={`w-8 rounded-t-sm ${
                      isMaxLeft || isMaxRight ? 'bg-green-500' :
                      isLeft ? 'bg-yellow-500' :
                      isRight ? 'bg-cyan-500' :
                      'bg-slate-600'
                    }`}
                    style={{ height: barHeight }}
                    animate={{ height: barHeight }}
                  />
                </div>
                
                <span className="text-xs text-slate-400 mt-1">{h}</span>
                <span className="text-xs text-slate-500">{i}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Current calculation */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Calculation</h3>
          {currentStepData?.type === 'compare' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Width:</span>
                <span className="font-mono">{currentStepData.right} - {currentStepData.left} = {currentStepData.right - currentStepData.left}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Height:</span>
                <span className="font-mono">min({currentStepData.heights[currentStepData.left]}, {currentStepData.heights[currentStepData.right]}) = {Math.min(currentStepData.heights[currentStepData.left], currentStepData.heights[currentStepData.right])}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-blue-400">Area:</span>
                <span className="font-bold text-blue-400">{currentStepData.currentArea}</span>
              </div>
            </div>
          )}
          {currentStepData?.type !== 'compare' && (
            <span className="text-slate-500">-</span>
          )}
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Maximum Area</h3>
          <div className="text-3xl font-bold text-green-400">{currentStepData?.maxArea || 0}</div>
          {currentStepData && currentStepData.maxArea > 0 && (
            <div className="text-sm text-slate-400 mt-1">
              Between indices {currentStepData.maxLeft} and {currentStepData.maxRight}
            </div>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'done' ? 'bg-green-500' :
            currentStepData?.type === 'update-max' ? 'bg-green-500' :
            currentStepData?.type === 'move-left' ? 'bg-yellow-500' :
            currentStepData?.type === 'move-right' ? 'bg-cyan-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg">{currentStepData?.description || 'Ready'}</span>
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
        // Calculate area with current pointers
        int width = right - left;
        int h = Math.min(height[left], height[right]);
        int area = width * h;
        maxArea = Math.max(maxArea, area);
        
        // Move the shorter pointer inward
        // (moving taller one can only decrease area)
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxArea;
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Key Insight</h3>
        <p className="text-slate-300">
          Why move the shorter pointer? The area is limited by the shorter bar. 
          If we move the taller bar inward, we can only make width smaller while 
          height stays the same (or gets smaller). Moving the shorter bar gives us 
          a chance to find a taller bar that could increase the area.
        </p>
      </div>
    </div>
  );
}
