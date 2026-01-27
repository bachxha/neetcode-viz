import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Cell {
  row: number;
  col: number;
}

interface Step {
  type: 'start' | 'init-queue' | 'process-level' | 'spread' | 'cannot-spread' | 'level-complete' | 'done' | 'impossible';
  grid: number[][];
  queue: Cell[];
  currentCell: Cell | null;
  spreadingTo: Cell | null;
  minute: number;
  freshCount: number;
  description: string;
}

function generateSteps(initialGrid: number[][]): Step[] {
  const steps: Step[] = [];
  const rows = initialGrid.length;
  const cols = initialGrid[0].length;
  const grid = initialGrid.map(row => [...row]);
  
  // Count fresh oranges and find rotten ones
  let freshCount = 0;
  const queue: Cell[] = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) freshCount++;
      if (grid[r][c] === 2) queue.push({ row: r, col: c });
    }
  }
  
  steps.push({
    type: 'start',
    grid: grid.map(row => [...row]),
    queue: [...queue],
    currentCell: null,
    spreadingTo: null,
    minute: 0,
    freshCount,
    description: `Found ${freshCount} fresh 🍊 and ${queue.length} rotten 🦠 oranges. Using multi-source BFS!`,
  });
  
  if (freshCount === 0) {
    steps.push({
      type: 'done',
      grid: grid.map(row => [...row]),
      queue: [],
      currentCell: null,
      spreadingTo: null,
      minute: 0,
      freshCount: 0,
      description: 'No fresh oranges to rot! Answer: 0 minutes',
    });
    return steps;
  }
  
  if (queue.length === 0) {
    steps.push({
      type: 'impossible',
      grid: grid.map(row => [...row]),
      queue: [],
      currentCell: null,
      spreadingTo: null,
      minute: -1,
      freshCount,
      description: `No rotten oranges to spread from! ${freshCount} oranges will never rot. Answer: -1`,
    });
    return steps;
  }
  
  steps.push({
    type: 'init-queue',
    grid: grid.map(row => [...row]),
    queue: [...queue],
    currentCell: null,
    spreadingTo: null,
    minute: 0,
    freshCount,
    description: `Initialize BFS queue with ALL ${queue.length} rotten oranges (multi-source BFS)`,
  });
  
  let minute = 0;
  
  while (queue.length > 0 && freshCount > 0) {
    minute++;
    const levelSize = queue.length;
    
    steps.push({
      type: 'process-level',
      grid: grid.map(row => [...row]),
      queue: [...queue],
      currentCell: null,
      spreadingTo: null,
      minute,
      freshCount,
      description: `⏱️ Minute ${minute}: Processing ${levelSize} rotten orange${levelSize > 1 ? 's' : ''} simultaneously`,
    });
    
    for (let i = 0; i < levelSize; i++) {
      const current = queue.shift()!;
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      
      for (const [dr, dc] of directions) {
        const newRow = current.row + dr;
        const newCol = current.col + dc;
        
        if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
          continue;
        }
        
        if (grid[newRow][newCol] === 0) {
          steps.push({
            type: 'cannot-spread',
            grid: grid.map(row => [...row]),
            queue: [...queue],
            currentCell: current,
            spreadingTo: { row: newRow, col: newCol },
            minute,
            freshCount,
            description: `(${newRow},${newCol}) is empty, rot can't spread there`,
          });
          continue;
        }
        
        if (grid[newRow][newCol] === 2) {
          continue; // Already rotten
        }
        
        // Fresh orange! Rot it!
        grid[newRow][newCol] = 2;
        freshCount--;
        queue.push({ row: newRow, col: newCol });
        
        steps.push({
          type: 'spread',
          grid: grid.map(row => [...row]),
          queue: [...queue],
          currentCell: current,
          spreadingTo: { row: newRow, col: newCol },
          minute,
          freshCount,
          description: `🦠 Rot spreads from (${current.row},${current.col}) to (${newRow},${newCol})! ${freshCount} fresh remaining`,
        });
      }
    }
    
    steps.push({
      type: 'level-complete',
      grid: grid.map(row => [...row]),
      queue: [...queue],
      currentCell: null,
      spreadingTo: null,
      minute,
      freshCount,
      description: `Minute ${minute} complete. ${freshCount} fresh oranges remaining, ${queue.length} in queue for next minute`,
    });
  }
  
  if (freshCount > 0) {
    steps.push({
      type: 'impossible',
      grid: grid.map(row => [...row]),
      queue: [],
      currentCell: null,
      spreadingTo: null,
      minute: -1,
      freshCount,
      description: `${freshCount} fresh orange${freshCount > 1 ? 's' : ''} can't be reached! Answer: -1`,
    });
  } else {
    steps.push({
      type: 'done',
      grid: grid.map(row => [...row]),
      queue: [],
      currentCell: null,
      spreadingTo: null,
      minute,
      freshCount: 0,
      description: `🎉 All oranges rotten in ${minute} minute${minute > 1 ? 's' : ''}!`,
    });
  }
  
  return steps;
}

function parseGrid(input: string): number[][] {
  try {
    return JSON.parse(input);
  } catch {
    return [
      [2, 1, 1],
      [1, 1, 0],
      [0, 1, 1],
    ];
  }
}

export function RottingOrangesVisualizer() {
  const [gridInput, setGridInput] = useState('[[2,1,1],[1,1,0],[0,1,1]]');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const grid = parseGrid(gridInput);
    if (grid.length > 0) {
      const newSteps = generateSteps(grid);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [gridInput]);
  
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
    }, 500 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  const grid = currentStepData?.grid || [];
  
  const getCellStyle = (row: number, col: number) => {
    if (!currentStepData) return 'bg-slate-700';
    
    const value = grid[row]?.[col];
    const isCurrent = currentStepData.currentCell?.row === row && currentStepData.currentCell?.col === col;
    const isSpreading = currentStepData.spreadingTo?.row === row && currentStepData.spreadingTo?.col === col;
    const isInQueue = currentStepData.queue.some(c => c.row === row && c.col === col);
    
    if (isSpreading) {
      if (currentStepData.type === 'spread') return 'bg-red-500 ring-2 ring-yellow-400';
      if (currentStepData.type === 'cannot-spread') return 'bg-slate-600 ring-2 ring-red-400';
    }
    
    if (isCurrent) {
      return 'bg-red-600 ring-2 ring-white';
    }
    
    if (value === 0) return 'bg-slate-800';
    if (value === 1) return 'bg-orange-400';
    if (value === 2) {
      if (isInQueue) return 'bg-red-500';
      return 'bg-red-700';
    }
    
    return 'bg-slate-700';
  };
  
  const getEmoji = (value: number) => {
    if (value === 0) return '';
    if (value === 1) return '🍊';
    if (value === 2) return '🦠';
    return '';
  };
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Rotting Oranges (Multi-Source BFS)</h1>
        <p className="text-slate-400">
          Find minimum time for all oranges to rot. Rot spreads to 4-directional neighbors each minute.
          <span className="text-yellow-400 font-medium"> Key: Process ALL rotten oranges at each time step!</span>
        </p>
      </div>
      
      <div className="mb-6">
        <label className="text-sm text-slate-400 block mb-1">Grid (0=empty, 1=fresh, 2=rotten):</label>
        <input
          type="text"
          value={gridInput}
          onChange={(e) => setGridInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono text-sm"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Grid Visualization */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Orange Grid</h3>
          <div className="flex flex-col gap-1 items-center">
            <AnimatePresence>
              {grid.map((row, r) => (
                <div key={r} className="flex gap-1">
                  {row.map((cell, c) => (
                    <motion.div
                      key={`${r}-${c}`}
                      className={`w-12 h-12 flex items-center justify-center rounded text-2xl ${getCellStyle(r, c)}`}
                      animate={{
                        scale: (currentStepData?.spreadingTo?.row === r && currentStepData?.spreadingTo?.col === c) ? 1.2 : 1,
                        rotate: (currentStepData?.type === 'spread' && currentStepData?.spreadingTo?.row === r && currentStepData?.spreadingTo?.col === c) ? [0, -10, 10, 0] : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {getEmoji(cell)}
                    </motion.div>
                  ))}
                </div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="flex gap-3 mt-4 text-xs justify-center flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-orange-400"></span> 🍊 Fresh
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500"></span> 🦠 Rotten (in queue)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-700"></span> 🦠 Rotten (processed)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-800"></span> Empty
            </span>
          </div>
        </div>
        
        {/* State Panel */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">⏱️ Minutes</h3>
              <div className={`text-4xl font-bold ${
                currentStepData?.minute === -1 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {currentStepData?.minute === -1 ? '-1' : currentStepData?.minute || 0}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">🍊 Fresh Left</h3>
              <div className={`text-4xl font-bold ${
                currentStepData?.freshCount === 0 ? 'text-green-400' : 'text-orange-400'
              }`}>
                {currentStepData?.freshCount ?? 0}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">BFS Queue</h3>
            <div className="font-mono text-sm">
              {currentStepData?.queue.length === 0 ? (
                <span className="text-slate-500">Empty</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {currentStepData?.queue.slice(0, 12).map((cell, i) => (
                    <span key={i} className="bg-red-500/30 text-red-300 px-2 py-0.5 rounded">
                      ({cell.row},{cell.col})
                    </span>
                  ))}
                  {(currentStepData?.queue.length || 0) > 12 && (
                    <span className="text-slate-400">+{currentStepData!.queue.length - 12} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Status</h3>
            <p className={`${
              currentStepData?.type === 'done' ? 'text-green-400' :
              currentStepData?.type === 'impossible' ? 'text-red-400' :
              currentStepData?.type === 'spread' ? 'text-yellow-400' :
              'text-white'
            }`}>
              {currentStepData?.description || 'Ready'}
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Multi-Source BFS</h3>
            <p className="text-sm text-slate-300">
              Unlike regular BFS with one start point, we add ALL rotten oranges to the queue initially.
              Each "level" of BFS = 1 minute, as all rotten oranges spread simultaneously.
            </p>
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
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code (Multi-Source BFS)</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int orangesRotting(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    Queue<int[]> queue = new LinkedList<>();
    int fresh = 0;
    
    // Initialize: add ALL rotten oranges to queue
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) queue.offer(new int[]{r, c});
            if (grid[r][c] == 1) fresh++;
        }
    }
    
    if (fresh == 0) return 0;  // No fresh oranges
    
    int minutes = 0;
    int[][] dirs = {{0,1}, {1,0}, {0,-1}, {-1,0}};
    
    while (!queue.isEmpty() && fresh > 0) {
        minutes++;
        int size = queue.size();  // Process entire level
        
        for (int i = 0; i < size; i++) {
            int[] curr = queue.poll();
            for (int[] d : dirs) {
                int r = curr[0] + d[0];
                int c = curr[1] + d[1];
                if (r >= 0 && r < rows && c >= 0 && c < cols 
                    && grid[r][c] == 1) {
                    grid[r][c] = 2;  // Rot it!
                    fresh--;
                    queue.offer(new int[]{r, c});
                }
            }
        }
    }
    
    return fresh == 0 ? minutes : -1;
}`}
        </pre>
      </div>
    </div>
  );
}
