import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'outer-loop' | 'inner-loop' | 'calculate' | 'update-max' | 'done';
  heights: number[];
  i: number;
  j: number;
  currentArea: number;
  maxArea: number;
  comparisons: number;
  description: string;
}

function generateSteps(heights: number[]): Step[] {
  const steps: Step[] = [];
  let comparisons = 0;
  let maxArea = 0;
  
  if (heights.length < 2) {
    steps.push({
      type: 'done',
      heights,
      i: -1,
      j: -1,
      currentArea: 0,
      maxArea: 0,
      comparisons: 0,
      description: 'Need at least 2 heights.',
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    heights,
    i: -1,
    j: -1,
    currentArea: 0,
    maxArea: 0,
    comparisons: 0,
    description: `Brute force: Check ALL ${(heights.length * (heights.length - 1)) / 2} pairs`,
  });
  
  for (let i = 0; i < heights.length - 1; i++) {
    steps.push({
      type: 'outer-loop',
      heights,
      i,
      j: -1,
      currentArea: 0,
      maxArea,
      comparisons,
      description: `Outer loop: i = ${i}`,
    });
    
    for (let j = i + 1; j < heights.length; j++) {
      comparisons++;
      
      const width = j - i;
      const height = Math.min(heights[i], heights[j]);
      const area = width * height;
      
      steps.push({
        type: 'calculate',
        heights,
        i,
        j,
        currentArea: area,
        maxArea,
        comparisons,
        description: `Pair (${i},${j}): area = ${width} × ${height} = ${area}`,
      });
      
      if (area > maxArea) {
        maxArea = area;
        steps.push({
          type: 'update-max',
          heights,
          i,
          j,
          currentArea: area,
          maxArea,
          comparisons,
          description: `New max: ${maxArea}`,
        });
      }
    }
  }
  
  steps.push({
    type: 'done',
    heights,
    i: -1,
    j: -1,
    currentArea: 0,
    maxArea,
    comparisons,
    description: `Done! Max area = ${maxArea}. Checked ${comparisons} pairs.`,
  });
  
  return steps;
}

// Fixed preset for comparison mode
const DEFAULT_HEIGHTS = [1, 8, 6, 2, 5, 4, 8, 3, 7];

export function ContainerBruteForceVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  
  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(DEFAULT_HEIGHTS);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 600 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const step = steps[currentStep];
  
  if (!step) return <div>Loading...</div>;
  
  const maxHeight = Math.max(...step.heights);
  const barHeight = 120;
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="bg-slate-900 rounded-lg p-4 mb-4 flex-1">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Brute Force - O(n²) Time
        </h3>
        
        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
            <div className="text-red-400 font-bold text-lg">{step.comparisons}</div>
            <div className="text-xs text-slate-400">Pairs Checked</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
            <div className="text-green-400 font-bold text-lg">{step.maxArea}</div>
            <div className="text-xs text-slate-400">Max Area</div>
          </div>
        </div>
        
        {/* Container Visualization */}
        <div className="flex items-end justify-center gap-1 mb-4" style={{ height: barHeight + 30 }}>
          {step.heights.map((h, idx) => {
            const isI = idx === step.i;
            const isJ = idx === step.j;
            const inRange = step.i >= 0 && step.j >= 0 && idx >= step.i && idx <= step.j;
            const heightPx = (h / maxHeight) * barHeight;
            
            // Show water fill when calculating
            const showWater = step.type === 'calculate' || step.type === 'update-max';
            const waterHeight = showWater && inRange 
              ? (Math.min(step.heights[step.i], step.heights[step.j]) / maxHeight) * barHeight 
              : 0;
            
            return (
              <div key={idx} className="flex flex-col items-center relative">
                {/* Pointer labels */}
                {isI && (
                  <motion.div 
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-5 text-yellow-400 font-bold text-xs"
                  >
                    i
                  </motion.div>
                )}
                {isJ && (
                  <motion.div 
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-5 text-orange-400 font-bold text-xs"
                  >
                    j
                  </motion.div>
                )}
                
                {/* Water fill */}
                {showWater && inRange && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="absolute bg-blue-400 bottom-0 rounded-t"
                    style={{ 
                      height: waterHeight,
                      width: '100%',
                      zIndex: 1
                    }}
                  />
                )}
                
                {/* Bar */}
                <motion.div
                  className={`w-6 rounded-t relative ${
                    isI ? 'bg-yellow-500' :
                    isJ ? 'bg-orange-500' :
                    'bg-slate-600'
                  }`}
                  style={{ height: heightPx }}
                  animate={{ scale: isI || isJ ? 1.05 : 1 }}
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">
                    {h}
                  </div>
                </motion.div>
                
                <span className="text-xs text-slate-500 mt-1">{idx}</span>
              </div>
            );
          })}
        </div>
        
        {/* Current calculation */}
        {(step.type === 'calculate' || step.type === 'update-max') && step.i >= 0 && step.j >= 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3"
          >
            <span className={`px-3 py-1.5 rounded-lg font-mono text-sm ${
              step.type === 'update-max' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              Area = {step.j - step.i} × {Math.min(step.heights[step.i], step.heights[step.j])} = {step.currentArea}
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            step.type === 'done' ? 'bg-green-500' :
            step.type === 'update-max' ? 'bg-green-500' :
            step.type === 'calculate' ? 'bg-blue-500' :
            'bg-yellow-500'
          }`} />
          <span className="text-sm">{step.description}</span>
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
    </div>
  );
}
