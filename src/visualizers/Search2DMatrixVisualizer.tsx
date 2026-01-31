import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'convert-coordinates' | 'compare' | 'search-left' | 'search-right' | 'found' | 'not-found';
  matrix: number[][];
  left: number;
  right: number;
  mid: number;
  midRow: number;
  midCol: number;
  target: number;
  foundRow: number;
  foundCol: number;
  description: string;
}

function generateSteps(matrix: number[][], target: number): Step[] {
  const steps: Step[] = [];
  
  if (matrix.length === 0 || matrix[0].length === 0) {
    steps.push({
      type: 'not-found',
      matrix,
      left: -1,
      right: -1,
      mid: -1,
      midRow: -1,
      midCol: -1,
      target,
      foundRow: -1,
      foundCol: -1,
      description: 'Empty matrix - target not found',
    });
    return steps;
  }
  
  const m = matrix.length;
  const n = matrix[0].length;
  const totalElements = m * n;
  
  steps.push({
    type: 'start',
    matrix,
    left: 0,
    right: totalElements - 1,
    mid: Math.floor((0 + totalElements - 1) / 2),
    midRow: Math.floor(Math.floor((0 + totalElements - 1) / 2) / n),
    midCol: Math.floor((0 + totalElements - 1) / 2) % n,
    target,
    foundRow: -1,
    foundCol: -1,
    description: `Search for ${target} in ${m}×${n} matrix. Treat as 1D array with ${totalElements} elements. Set left=0, right=${totalElements - 1}`,
  });
  
  let left = 0;
  let right = totalElements - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midRow = Math.floor(mid / n);
    const midCol = mid % n;
    
    steps.push({
      type: 'convert-coordinates',
      matrix,
      left,
      right,
      mid,
      midRow,
      midCol,
      target,
      foundRow: -1,
      foundCol: -1,
      description: `Mid = (${left} + ${right}) / 2 = ${mid}. Convert to 2D: row = ${mid} / ${n} = ${midRow}, col = ${mid} % ${n} = ${midCol}`,
    });
    
    const midValue = matrix[midRow][midCol];
    
    steps.push({
      type: 'compare',
      matrix,
      left,
      right,
      mid,
      midRow,
      midCol,
      target,
      foundRow: -1,
      foundCol: -1,
      description: `Compare matrix[${midRow}][${midCol}] = ${midValue} with target ${target}`,
    });
    
    if (midValue === target) {
      steps.push({
        type: 'found',
        matrix,
        left,
        right,
        mid,
        midRow,
        midCol,
        target,
        foundRow: midRow,
        foundCol: midCol,
        description: `Found! matrix[${midRow}][${midCol}] = ${midValue} equals target ${target}. Return true.`,
      });
      return steps;
    } else if (midValue < target) {
      left = mid + 1;
      steps.push({
        type: 'search-right',
        matrix,
        left,
        right,
        mid,
        midRow,
        midCol,
        target,
        foundRow: -1,
        foundCol: -1,
        description: `${midValue} < ${target}. Target is in right half. Set left = ${mid} + 1 = ${left}`,
      });
    } else {
      right = mid - 1;
      steps.push({
        type: 'search-left',
        matrix,
        left,
        right,
        mid,
        midRow,
        midCol,
        target,
        foundRow: -1,
        foundCol: -1,
        description: `${midValue} > ${target}. Target is in left half. Set right = ${mid} - 1 = ${right}`,
      });
    }
  }
  
  steps.push({
    type: 'not-found',
    matrix,
    left,
    right,
    mid: -1,
    midRow: -1,
    midCol: -1,
    target,
    foundRow: -1,
    foundCol: -1,
    description: `left > right (${left} > ${right}). Target ${target} not found. Return false.`,
  });
  
  return steps;
}

export function Search2DMatrixVisualizer() {
  const [matrixInput, setMatrixInput] = useState('[[1,4,7,11],[2,5,8,12],[3,6,9,16]]');
  const [targetInput, setTargetInput] = useState('5');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    try {
      const matrix = JSON.parse(matrixInput) as number[][];
      const target = parseInt(targetInput.trim());
      
      if (!isNaN(target) && Array.isArray(matrix) && matrix.length > 0 && 
          Array.isArray(matrix[0]) && matrix.length <= 6 && matrix[0].length <= 6) {
        const newSteps = generateSteps(matrix, target);
        setSteps(newSteps);
        setCurrentStep(0);
        setIsPlaying(false);
      }
    } catch (e) {
      // Invalid JSON input
    }
  }, [matrixInput, targetInput]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    let interval: number;
    
    if (isPlaying && currentStep < steps.length - 1) {
      const delay = Math.max(100, 2000 / speed);
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      setIsPlaying(false);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  if (steps.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Search a 2D Matrix</h1>
          <p className="text-slate-400 mb-8">
            Enter a valid 2D matrix and target to visualize the search algorithm
          </p>
          
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-left">Matrix (JSON format):</label>
              <input
                type="text"
                value={matrixInput}
                onChange={(e) => setMatrixInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                placeholder="[[1,4,7,11],[2,5,8,12]]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-left">Target:</label>
              <input
                type="text"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                placeholder="5"
              />
            </div>
            <button
              onClick={initializeSteps}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Generate Visualization
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const step = steps[currentStep];
  
  const getCellColor = (row: number, col: number) => {
    if (step.foundRow === row && step.foundCol === col) {
      return 'bg-green-500 text-white';
    }
    if (step.midRow === row && step.midCol === col) {
      return 'bg-yellow-500 text-black font-bold';
    }
    if (step.type === 'search-left' || step.type === 'search-right') {
      // Show the search range
      const totalCols = step.matrix[0].length;
      const leftIndex = step.left;
      const rightIndex = step.right;
      const currentIndex = row * totalCols + col;
      
      if (currentIndex >= leftIndex && currentIndex <= rightIndex) {
        return 'bg-blue-500/30 border-blue-400';
      } else {
        return 'bg-slate-700/50 text-slate-400';
      }
    }
    
    // Default active range
    if (step.left !== -1 && step.right !== -1) {
      const totalCols = step.matrix[0].length;
      const leftIndex = step.left;
      const rightIndex = step.right;
      const currentIndex = row * totalCols + col;
      
      if (currentIndex >= leftIndex && currentIndex <= rightIndex) {
        return 'bg-blue-500/20 border-blue-400/50';
      }
    }
    
    return 'bg-slate-800 border-slate-700';
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Search a 2D Matrix</h1>
        <p className="text-slate-400">
          Visualizing binary search on a 2D matrix treated as a 1D sorted array
        </p>
      </div>
      
      {/* Input Controls */}
      <div className="flex gap-4 mb-6 max-w-2xl mx-auto">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Matrix:</label>
          <input
            type="text"
            value={matrixInput}
            onChange={(e) => setMatrixInput(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          />
        </div>
        <div className="w-24">
          <label className="block text-sm font-medium mb-2">Target:</label>
          <input
            type="text"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={initializeSteps}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Matrix Visualization */}
      <div className="flex justify-center mb-8">
        <div className="inline-grid gap-1 p-4 bg-slate-900/50 rounded-lg border border-slate-700"
             style={{ gridTemplateColumns: `repeat(${step.matrix[0]?.length || 1}, 1fr)` }}>
          {step.matrix.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 flex items-center justify-center rounded border text-sm font-medium
                  transition-all duration-300
                  ${getCellColor(rowIndex, colIndex)}
                `}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {value}
              </motion.div>
            ))
          )}
        </div>
      </div>
      
      {/* Algorithm Information */}
      <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Target:</span>
            <span className="ml-2 font-bold text-yellow-400">{step.target}</span>
          </div>
          <div>
            <span className="text-slate-400">Left:</span>
            <span className="ml-2 font-mono">{step.left >= 0 ? step.left : 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400">Right:</span>
            <span className="ml-2 font-mono">{step.right >= 0 ? step.right : 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400">Mid:</span>
            <span className="ml-2 font-mono">
              {step.mid >= 0 ? `${step.mid} → [${step.midRow}][${step.midCol}]` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Step Description */}
      <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <h3 className="font-medium mb-2">Step {currentStep + 1} of {steps.length}</h3>
        <p className="text-slate-300">{step.description}</p>
      </div>
      
      {/* Legend */}
      <div className="mb-6 flex justify-center">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Current Mid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/30 border border-blue-400/50 rounded"></div>
            <span>Search Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Found Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-700/50 rounded"></div>
            <span>Eliminated</span>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onStepBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
        onStepForward={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
        onReset={() => setCurrentStep(0)}
        currentStep={currentStep}
        totalSteps={steps.length}
        speed={speed}
        onSpeedChange={setSpeed}
        canStepBack={currentStep > 0}
        canStepForward={currentStep < steps.length - 1}
      />
    </div>
  );
}