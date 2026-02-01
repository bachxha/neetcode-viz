import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'init' | 'base' | 'compute' | 'done';
  m: number;
  n: number;
  dp: number[][];
  currentRow: number;
  currentCol: number;
  description: string;
  formula?: string;
}

function generateSteps(m: number, n: number): Step[] {
  const steps: Step[] = [];
  const dp: number[][] = Array(m).fill(null).map(() => Array(n).fill(0));
  
  steps.push({
    type: 'start',
    m, n, dp: dp.map(row => [...row]),
    currentRow: -1, currentCol: -1,
    description: `Find unique paths from top-left (0,0) to bottom-right (${m-1},${n-1})`,
  });
  
  steps.push({
    type: 'init',
    m, n, dp: dp.map(row => [...row]),
    currentRow: -1, currentCol: -1,
    description: `Initialize ${m}×${n} DP table. dp[i][j] = number of ways to reach position (i,j)`,
  });
  
  // Initialize first row (can only come from left)
  for (let j = 0; j < n; j++) {
    dp[0][j] = 1;
    steps.push({
      type: 'base',
      m, n, dp: dp.map(row => [...row]),
      currentRow: 0, currentCol: j,
      description: `Base case: dp[0][${j}] = 1 (only one way to reach first row - move right)`,
    });
  }
  
  // Initialize first column (can only come from top)
  for (let i = 1; i < m; i++) {
    dp[i][0] = 1;
    steps.push({
      type: 'base',
      m, n, dp: dp.map(row => [...row]),
      currentRow: i, currentCol: 0,
      description: `Base case: dp[${i}][0] = 1 (only one way to reach first column - move down)`,
    });
  }
  
  // Fill the rest of the table
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i-1][j] + dp[i][j-1];
      steps.push({
        type: 'compute',
        m, n, dp: dp.map(row => [...row]),
        currentRow: i, currentCol: j,
        description: `dp[${i}][${j}] = dp[${i-1}][${j}] + dp[${i}][${j-1}] = ${dp[i-1][j]} + ${dp[i][j-1]} = ${dp[i][j]}`,
        formula: `dp[${i}][${j}] = ${dp[i-1][j]} + ${dp[i][j-1]}`,
      });
    }
  }
  
  steps.push({
    type: 'done',
    m, n, dp: dp.map(row => [...row]),
    currentRow: m-1, currentCol: n-1,
    description: `Answer: ${dp[m-1][n-1]} unique paths from (0,0) to (${m-1},${n-1})`,
  });
  
  return steps;
}

export function UniquePathsVisualizer() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(3);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    if (m >= 1 && m <= 6 && n >= 1 && n <= 6) {
      const newSteps = generateSteps(m, n);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [m, n]);
  
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
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Unique Paths</h1>
        <p className="text-slate-400">
          A robot is located at the top-left corner of an m×n grid. The robot can only move either down or right. 
          How many possible unique paths are there to reach the bottom-right corner?
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center flex-wrap">
        <label className="text-sm text-slate-400">Grid dimensions:</label>
        <div className="flex items-center gap-2">
          <label className="text-sm">Rows (m):</label>
          <input
            type="number"
            min={1}
            max={6}
            value={m}
            onChange={(e) => setM(parseInt(e.target.value) || 1)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-16 px-2 py-1 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none font-mono text-center"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Cols (n):</label>
          <input
            type="number"
            min={1}
            max={6}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value) || 1)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-16 px-2 py-1 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none font-mono text-center"
          />
        </div>
      </div>
      
      {/* Grid Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Grid ({m} × {n})</h3>
        <div className="flex justify-center">
          <div className="inline-block">
            {currentStepData?.dp.map((row, i) => (
              <div key={i} className="flex gap-1 mb-1">
                {row.map((paths, j) => {
                  const isStart = i === 0 && j === 0;
                  const isEnd = i === m-1 && j === n-1;
                  const isCurrent = i === currentStepData.currentRow && j === currentStepData.currentCol;
                  const isFromTop = currentStepData.type === 'compute' && 
                    i-1 === currentStepData.currentRow && j === currentStepData.currentCol;
                  const isFromLeft = currentStepData.type === 'compute' && 
                    i === currentStepData.currentRow && j-1 === currentStepData.currentCol;
                  const isFilled = paths > 0;
                  
                  return (
                    <motion.div
                      key={`${i}-${j}`}
                      className={`w-16 h-16 border-2 rounded-lg flex flex-col items-center justify-center text-sm font-bold transition-all ${
                        isStart ? 'bg-green-500 border-green-400 text-white' :
                        isEnd ? 'bg-purple-500 border-purple-400 text-white' :
                        isCurrent ? 'bg-yellow-500 border-yellow-400 text-black' :
                        isFromTop || isFromLeft ? 'bg-blue-400 border-blue-300 text-white' :
                        isFilled ? 'bg-slate-600 border-slate-500 text-white' :
                        'bg-slate-700 border-slate-600 text-slate-400'
                      }`}
                      animate={{ 
                        scale: isCurrent ? 1.05 : 1,
                        rotateX: isCurrent ? [0, 5, 0] : 0,
                      }}
                    >
                      <div className="text-xs text-slate-300">({i},{j})</div>
                      <div className="text-lg">
                        {isFilled ? paths : (currentStepData?.type === 'start' ? '?' : '0')}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Start (0,0)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Target ({m-1},{n-1})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>Contributing</span>
          </div>
        </div>
      </div>
      
      {/* DP Formula */}
      {currentStepData?.type === 'compute' && (
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">DP Transition</h3>
          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 rounded-lg font-mono text-lg"
            >
              <span className="text-yellow-400">
                dp[{currentStepData.currentRow}][{currentStepData.currentCol}]
              </span>
              <span className="text-slate-400">=</span>
              <span className="text-blue-400">
                dp[{currentStepData.currentRow-1}][{currentStepData.currentCol}]
              </span>
              <span className="text-slate-400">+</span>
              <span className="text-blue-400">
                dp[{currentStepData.currentRow}][{currentStepData.currentCol-1}]
              </span>
              <span className="text-slate-400">=</span>
              <span className="text-green-400">
                {currentStepData.dp[currentStepData.currentRow][currentStepData.currentCol]}
              </span>
            </motion.div>
            <p className="text-sm text-slate-400 mt-2">
              Paths to current cell = Paths from top + Paths from left
            </p>
          </div>
        </div>
      )}
      
      {/* Algorithm Intuition */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Intuition</h3>
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            <strong>Key Insight:</strong> To reach any cell (i, j), the robot must come from either:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>The cell above: (i-1, j) - by moving down</li>
            <li>The cell to the left: (i, j-1) - by moving right</li>
          </ul>
          <p>
            Therefore: <code className="bg-slate-700 px-1 rounded">dp[i][j] = dp[i-1][j] + dp[i][j-1]</code>
          </p>
          <p>
            <strong>Base cases:</strong> First row and first column have only one way to reach (by going right or down only).
          </p>
        </div>
      </div>
      
      {/* Path Counting */}
      {currentStepData?.type === 'done' && (
        <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-green-400 mb-2">Result</h3>
          <p className="text-lg">
            There are <span className="font-bold text-purple-400">{currentStepData.dp[m-1][n-1]}</span> unique 
            paths from the top-left corner to the bottom-right corner of the {m}×{n} grid.
          </p>
        </div>
      )}
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'done' ? 'bg-green-500' :
            currentStepData?.type === 'compute' ? 'bg-yellow-500' :
            currentStepData?.type === 'base' ? 'bg-blue-500' :
            'bg-purple-500'
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
      
      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int uniquePaths(int m, int n) {
    // Create DP table
    int[][] dp = new int[m][n];
    
    // Initialize first row - only one way to reach (move right)
    for (int j = 0; j < n; j++) {
        dp[0][j] = 1;
    }
    
    // Initialize first column - only one way to reach (move down)
    for (int i = 0; i < m; i++) {
        dp[i][0] = 1;
    }
    
    // Fill the rest of the table
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }
    
    return dp[m-1][n-1];
}

// Space-optimized O(n) solution:
public int uniquePathsOptimized(int m, int n) {
    int[] dp = new int[n];
    Arrays.fill(dp, 1);  // Initialize with 1s
    
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] += dp[j-1];  // dp[j] already contains dp[i-1][j]
        }
    }
    
    return dp[n-1];
}`}
        </pre>
      </div>
    </div>
  );
}