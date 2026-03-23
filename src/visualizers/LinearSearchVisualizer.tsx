import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'checking' | 'found' | 'not-found';
  array: number[];
  currentIndex: number;
  target: number;
  foundIndex: number;
  comparisons: number;
  description: string;
}

function generateSteps(array: number[], target: number): Step[] {
  const steps: Step[] = [];
  let comparisons = 0;
  
  steps.push({
    type: 'start',
    array,
    currentIndex: -1,
    target,
    foundIndex: -1,
    comparisons: 0,
    description: `Linear search for ${target} in array of ${array.length} elements`,
  });
  
  for (let i = 0; i < array.length; i++) {
    comparisons++;
    steps.push({
      type: 'checking',
      array,
      currentIndex: i,
      target,
      foundIndex: -1,
      comparisons,
      description: `Step ${comparisons}: Check array[${i}] = ${array[i]}. Is ${array[i]} == ${target}?`,
    });
    
    if (array[i] === target) {
      steps.push({
        type: 'found',
        array,
        currentIndex: i,
        target,
        foundIndex: i,
        comparisons,
        description: `Found! array[${i}] = ${array[i]} equals target ${target}. Return index ${i}.`,
      });
      return steps;
    }
  }
  
  steps.push({
    type: 'not-found',
    array,
    currentIndex: array.length,
    target,
    foundIndex: -1,
    comparisons,
    description: `Finished searching. Target ${target} not found in array. Return -1.`,
  });
  
  return steps;
}

// Default preset for comparison mode
const DEFAULT_ARRAY = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31];
const DEFAULT_TARGET = 23;

export function LinearSearchVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  
  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(DEFAULT_ARRAY, DEFAULT_TARGET);
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  if (!currentStepData) return <div>Loading...</div>;
  
  return (
    <div className="p-4 h-full flex flex-col">
      {/* Array visualization */}
      <div className="bg-slate-900 rounded-lg p-4 mb-4 flex-1">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Linear Search - O(n) Time
        </h3>
        
        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4 text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
            <div className="text-red-400 font-bold text-lg">{currentStepData.comparisons}</div>
            <div className="text-xs text-slate-400">Comparisons</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
            <div className="text-blue-400 font-bold text-lg">
              {currentStepData.foundIndex >= 0 ? currentStepData.foundIndex : 
               currentStepData.type === 'not-found' ? '-1' : '?'}
            </div>
            <div className="text-xs text-slate-400">Result Index</div>
          </div>
        </div>
        
        {/* Array Elements */}
        <div className="flex items-center justify-center gap-1 flex-wrap mb-4" style={{ minHeight: '80px' }}>
          {currentStepData.array.map((value, i) => {
            const isCurrent = i === currentStepData.currentIndex;
            const isFound = i === currentStepData.foundIndex;
            const isChecked = i < currentStepData.currentIndex;
            
            let bgColor = 'bg-slate-600';
            let textColor = 'text-white';
            
            if (isFound) {
              bgColor = 'bg-green-500';
              textColor = 'text-white';
            } else if (isCurrent) {
              bgColor = 'bg-orange-500';
              textColor = 'text-black';
            } else if (isChecked) {
              bgColor = 'bg-slate-500';
              textColor = 'text-slate-300';
            }
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                animate={{ 
                  scale: isCurrent || isFound ? 1.1 : 1,
                  opacity: isChecked && !isFound ? 0.6 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xs text-slate-500 mb-1">[{i}]</span>
                <motion.div
                  className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${bgColor} ${textColor}`}
                >
                  {value}
                </motion.div>
                {isCurrent && !isFound && (
                  <span className="text-xs text-orange-400 mt-1">↑</span>
                )}
                {isFound && (
                  <span className="text-xs text-green-400 mt-1">✓</span>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* Current comparison */}
        {currentStepData.type === 'checking' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <span className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg font-mono text-sm">
              array[{currentStepData.currentIndex}] = {currentStepData.array[currentStepData.currentIndex]} 
              {currentStepData.array[currentStepData.currentIndex] === currentStepData.target ? ' == ' : ' ≠ '} 
              {currentStepData.target}
            </span>
          </motion.div>
        )}
        
        {/* Found indicator */}
        {currentStepData.foundIndex >= 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-4"
          >
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-mono">
              Found {currentStepData.target} at index {currentStepData.foundIndex}!
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            currentStepData.type === 'found' ? 'bg-green-500' :
            currentStepData.type === 'not-found' ? 'bg-red-500' :
            currentStepData.type === 'checking' ? 'bg-orange-500' :
            'bg-blue-500'
          }`} />
          <span className="text-sm">{currentStepData.description}</span>
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