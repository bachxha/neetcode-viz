import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'compare' | 'search-left' | 'search-right' | 'found' | 'not-found';
  array: number[];
  left: number;
  right: number;
  mid: number;
  target: number;
  foundIndex: number;
  comparisons: number;
  description: string;
}

function generateSteps(array: number[], target: number): Step[] {
  const steps: Step[] = [];
  let comparisons = 0;
  
  if (array.length === 0) {
    steps.push({
      type: 'not-found',
      array,
      left: -1,
      right: -1,
      mid: -1,
      target,
      foundIndex: -1,
      comparisons: 0,
      description: 'Empty array - target not found',
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    array,
    left: 0,
    right: array.length - 1,
    mid: Math.floor((0 + array.length - 1) / 2),
    target,
    foundIndex: -1,
    comparisons: 0,
    description: `Binary search for ${target} in sorted array of ${array.length} elements`,
  });
  
  let left = 0;
  let right = array.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;
    
    steps.push({
      type: 'compare',
      array,
      left,
      right,
      mid,
      target,
      foundIndex: -1,
      comparisons,
      description: `Step ${comparisons}: Mid = ${mid}, array[${mid}] = ${array[mid]}. Compare with ${target}`,
    });
    
    if (array[mid] === target) {
      steps.push({
        type: 'found',
        array,
        left,
        right,
        mid,
        target,
        foundIndex: mid,
        comparisons,
        description: `Found! array[${mid}] = ${array[mid]} equals target ${target}. Return index ${mid}.`,
      });
      return steps;
    } else if (array[mid] < target) {
      left = mid + 1;
      steps.push({
        type: 'search-right',
        array,
        left,
        right,
        mid,
        target,
        foundIndex: -1,
        comparisons,
        description: `${array[mid]} < ${target}. Search right half: [${left}, ${right}]`,
      });
    } else {
      right = mid - 1;
      steps.push({
        type: 'search-left',
        array,
        left,
        right,
        mid,
        target,
        foundIndex: -1,
        comparisons,
        description: `${array[mid]} > ${target}. Search left half: [${left}, ${right}]`,
      });
    }
  }
  
  steps.push({
    type: 'not-found',
    array,
    left,
    right,
    mid: -1,
    target,
    foundIndex: -1,
    comparisons,
    description: `Search space exhausted. Target ${target} not found. Return -1.`,
  });
  
  return steps;
}

// Default preset for comparison mode - same as Linear Search
const DEFAULT_ARRAY = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31];
const DEFAULT_TARGET = 23;

export function BinarySearchComparisonVisualizer() {
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
          Binary Search - O(log n) Time
        </h3>
        
        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4 text-center">
          <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
            <div className="text-green-400 font-bold text-lg">{currentStepData.comparisons}</div>
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
        <div className="flex items-center justify-center gap-1 flex-wrap mb-4" style={{ minHeight: '120px' }}>
          {currentStepData.array.map((value, i) => {
            const isLeft = i === currentStepData.left;
            const isMid = i === currentStepData.mid;
            const isRight = i === currentStepData.right;
            const isFound = i === currentStepData.foundIndex;
            const inSearchSpace = i >= currentStepData.left && i <= currentStepData.right && currentStepData.left >= 0 && currentStepData.right >= 0;
            
            let bgColor = 'bg-slate-600';
            let textColor = 'text-white';
            let label = '';
            
            if (isFound) {
              bgColor = 'bg-green-500';
              label = '✓';
            } else if (isMid) {
              bgColor = 'bg-blue-500';
              label = 'M';
              textColor = 'text-white';
            } else if (isLeft) {
              bgColor = 'bg-yellow-500';
              label = 'L';
              textColor = 'text-black';
            } else if (isRight) {
              bgColor = 'bg-cyan-500';
              label = 'R';
              textColor = 'text-black';
            } else if (inSearchSpace || currentStepData.type === 'start') {
              bgColor = 'bg-slate-500';
            } else {
              bgColor = 'bg-slate-700';
              textColor = 'text-slate-400';
            }
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center relative"
                animate={{ 
                  scale: isMid ? 1.1 : isLeft || isRight ? 1.05 : 1,
                  opacity: inSearchSpace || currentStepData.type === 'start' || isFound ? 1 : 0.6
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Pointer labels */}
                {label && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`absolute -top-6 font-bold text-xs ${
                      label === 'L' ? 'text-yellow-400' :
                      label === 'R' ? 'text-cyan-400' :
                      label === 'M' ? 'text-blue-400' :
                      'text-green-400'
                    }`}
                  >
                    {label}
                  </motion.div>
                )}
                
                <span className="text-xs text-slate-500 mb-1">[{i}]</span>
                
                {/* Array element */}
                <motion.div
                  className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${bgColor} ${textColor}`}
                >
                  {value}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Search space indicator */}
        {currentStepData && currentStepData.type !== 'not-found' && currentStepData.left >= 0 && currentStepData.right >= 0 && (
          <div className="text-center mb-4">
            <span className="text-xs text-slate-400">
              Search space: [{currentStepData.left}, {currentStepData.right}] 
              ({currentStepData.right - currentStepData.left + 1} elements)
            </span>
          </div>
        )}
        
        {/* Current comparison */}
        {currentStepData.type === 'compare' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <span className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-mono text-sm">
              array[{currentStepData.mid}] = {currentStepData.array[currentStepData.mid]} 
              {currentStepData.array[currentStepData.mid] === currentStepData.target ? ' == ' : 
               currentStepData.array[currentStepData.mid] < currentStepData.target ? ' < ' : ' > '} 
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
            currentStepData.type === 'search-left' ? 'bg-yellow-500' :
            currentStepData.type === 'search-right' ? 'bg-cyan-500' :
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