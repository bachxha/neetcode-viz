import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Cell {
  row: number;
  col: number;
}

interface Step {
  type: 'start' | 'found-land' | 'explore' | 'mark-visited' | 'water' | 'already-visited' | 'island-complete' | 'done';
  grid: string[][];
  visited: boolean[][];
  islandMap: number[][]; // Maps cells to island numbers (-1 for water, 0 for unvisited land, 1+ for island number)
  currentCell: Cell | null;
  queue: Cell[];
  islandCount: number;
  currentIslandCells: Cell[];
  currentIslandNumber: number;
  description: string;
}

function generateSteps(initialGrid: string[][]): Step[] {
  const steps: Step[] = [];
  const rows = initialGrid.length;
  const cols = initialGrid[0].length;
  const grid = initialGrid.map(row => [...row]);
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const islandMap: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
  let islandCount = 0;
  
  // Initialize island map: -1 for water, 0 for unvisited land
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      islandMap[r][c] = grid[r][c] === '0' ? -1 : 0;
    }
  }
  
  steps.push({
    type: 'start',
    grid: grid.map(row => [...row]),
    visited: visited.map(row => [...row]),
    islandMap: islandMap.map(row => [...row]),
    currentCell: null,
    queue: [],
    islandCount: 0,
    currentIslandCells: [],
    currentIslandNumber: 0,
    description: 'Start scanning the grid for islands (connected land masses)',
  });
  
  function bfs(startRow: number, startCol: number) {
    const currentIslandId = islandCount + 1;
    const queue: Cell[] = [{ row: startRow, col: startCol }];
    const islandCells: Cell[] = [];
    visited[startRow][startCol] = true;
    islandMap[startRow][startCol] = currentIslandId;
    
    steps.push({
      type: 'found-land',
      grid: grid.map(row => [...row]),
      visited: visited.map(row => [...row]),
      islandMap: islandMap.map(row => [...row]),
      currentCell: { row: startRow, col: startCol },
      queue: [...queue],
      islandCount,
      currentIslandCells: [],
      currentIslandNumber: currentIslandId,
      description: `Found unvisited land at (${startRow},${startCol})! Starting BFS to explore island #${currentIslandId}`,
    });
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      islandCells.push(current);
      
      steps.push({
        type: 'explore',
        grid: grid.map(row => [...row]),
        visited: visited.map(row => [...row]),
        islandMap: islandMap.map(row => [...row]),
        currentCell: current,
        queue: [...queue],
        islandCount,
        currentIslandCells: [...islandCells],
        currentIslandNumber: currentIslandId,
        description: `Exploring (${current.row},${current.col}), checking 4 neighbors`,
      });
      
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dr, dc] of directions) {
        const newRow = current.row + dr;
        const newCol = current.col + dc;
        
        if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
          continue;
        }
        
        if (visited[newRow][newCol]) {
          steps.push({
            type: 'already-visited',
            grid: grid.map(row => [...row]),
            visited: visited.map(row => [...row]),
            islandMap: islandMap.map(row => [...row]),
            currentCell: { row: newRow, col: newCol },
            queue: [...queue],
            islandCount,
            currentIslandCells: [...islandCells],
            currentIslandNumber: currentIslandId,
            description: `(${newRow},${newCol}) already visited, skip`,
          });
          continue;
        }
        
        if (grid[newRow][newCol] === '0') {
          steps.push({
            type: 'water',
            grid: grid.map(row => [...row]),
            visited: visited.map(row => [...row]),
            islandMap: islandMap.map(row => [...row]),
            currentCell: { row: newRow, col: newCol },
            queue: [...queue],
            islandCount,
            currentIslandCells: [...islandCells],
            currentIslandNumber: currentIslandId,
            description: `(${newRow},${newCol}) is water, skip`,
          });
          continue;
        }
        
        visited[newRow][newCol] = true;
        islandMap[newRow][newCol] = currentIslandId;
        queue.push({ row: newRow, col: newCol });
        
        steps.push({
          type: 'mark-visited',
          grid: grid.map(row => [...row]),
          visited: visited.map(row => [...row]),
          islandMap: islandMap.map(row => [...row]),
          currentCell: { row: newRow, col: newCol },
          queue: [...queue],
          islandCount,
          currentIslandCells: [...islandCells],
          currentIslandNumber: currentIslandId,
          description: `(${newRow},${newCol}) is land! Mark visited and add to queue for island #${currentIslandId}`,
        });
      }
    }
    
    islandCount++;
    steps.push({
      type: 'island-complete',
      grid: grid.map(row => [...row]),
      visited: visited.map(row => [...row]),
      islandMap: islandMap.map(row => [...row]),
      currentCell: null,
      queue: [],
      islandCount,
      currentIslandCells: [...islandCells],
      currentIslandNumber: currentIslandId,
      description: `Island #${currentIslandId} fully explored! (${islandCells.length} cells)`,
    });
  }
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1' && !visited[r][c]) {
        bfs(r, c);
      }
    }
  }
  
  steps.push({
    type: 'done',
    grid: grid.map(row => [...row]),
    visited: visited.map(row => [...row]),
    islandMap: islandMap.map(row => [...row]),
    currentCell: null,
    queue: [],
    islandCount,
    currentIslandCells: [],
    currentIslandNumber: 0,
    description: `Done! Found ${islandCount} island${islandCount !== 1 ? 's' : ''}`,
  });
  
  return steps;
}

function parseGrid(input: string): string[][] {
  try {
    return JSON.parse(input);
  } catch {
    return [
      ['1', '1', '1', '1', '0'],
      ['1', '1', '0', '1', '0'],
      ['1', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
    ];
  }
}

const PRESETS = [
  {
    label: 'Example 1',
    grid: [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]
  },
  {
    label: 'Example 2',  
    grid: [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]
  },
  {
    label: 'Multiple Islands',
    grid: [["1","0","1","0","1"],["0","0","0","0","0"],["1","0","1","0","1"],["0","0","0","0","0"],["1","0","1","0","1"]]
  },
  {
    label: 'Single Island',
    grid: [["1","1","1"],["0","1","0"],["1","1","1"]]
  },
  {
    label: 'No Islands',
    grid: [["0","0","0"],["0","0","0"],["0","0","0"]]
  }
];

export function NumberOfIslandsVisualizer() {
  const [gridInput, setGridInput] = useState('[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]');
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
    }, 400 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  const grid = currentStepData?.grid || [];
  const visited = currentStepData?.visited || [];
  const islandMap = currentStepData?.islandMap || [];
  
  // Array of distinct colors for different islands
  const islandColors = [
    'bg-emerald-500',   // Island 1
    'bg-rose-500',      // Island 2  
    'bg-violet-500',    // Island 3
    'bg-cyan-500',      // Island 4
    'bg-orange-500',    // Island 5
    'bg-pink-500',      // Island 6
    'bg-indigo-500',    // Island 7
    'bg-lime-500',      // Island 8
  ];

  const getCellStyle = (row: number, col: number) => {
    if (!currentStepData) return 'bg-blue-900';
    
    const isLand = grid[row]?.[col] === '1';
    const isWater = grid[row]?.[col] === '0';
    const isVisited = visited[row]?.[col];
    const isCurrent = currentStepData.currentCell?.row === row && currentStepData.currentCell?.col === col;
    const isInQueue = currentStepData.queue.some(c => c.row === row && c.col === col);
    const islandNumber = islandMap[row]?.[col] || 0;
    
    // Current cell being examined gets highest priority
    if (isCurrent) {
      if (currentStepData.type === 'water') return 'bg-blue-400 ring-2 ring-white';
      if (currentStepData.type === 'already-visited') return 'bg-orange-400 ring-2 ring-white';
      return 'bg-yellow-400 ring-2 ring-white';
    }
    
    // Cells in BFS queue (frontier) are highlighted
    if (isInQueue) {
      return 'bg-purple-400';
    }
    
    // Completed islands get their distinct colors
    if (islandNumber > 0) {
      const colorIndex = (islandNumber - 1) % islandColors.length;
      return islandColors[colorIndex];
    }
    
    // Unvisited land is brown/amber
    if (isLand && !isVisited) {
      return 'bg-amber-600';
    }
    
    // Water is blue
    if (isWater) {
      return 'bg-blue-700';
    }
    
    return 'bg-blue-900';
  };
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Number of Islands (BFS)</h1>
        <p className="text-slate-400">
          Count connected land masses using BFS. Each island is a group of '1's connected horizontally/vertically.
        </p>
      </div>
      
      {/* Presets */}
      <div className="mb-4">
        <span className="text-sm text-slate-400 mb-2 block">Quick Examples:</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => {
                setGridInput(JSON.stringify(preset.grid));
                setTimeout(initializeSteps, 0);
              }}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm text-slate-400 block mb-1">Grid (2D array of '1' land and '0' water):</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={gridInput}
            onChange={(e) => setGridInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono text-sm"
          />
          <button
            onClick={initializeSteps}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm"
          >
            Apply
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Grid Visualization */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Grid</h3>
          <div className="flex flex-col gap-1 items-center">
            {grid.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((cell, c) => (
                  <motion.div
                    key={`${r}-${c}`}
                    className={`w-10 h-10 flex items-center justify-center rounded font-bold text-sm ${getCellStyle(r, c)}`}
                    animate={{
                      scale: currentStepData?.currentCell?.row === r && currentStepData?.currentCell?.col === c ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    {cell === '1' ? '🏝️' : '🌊'}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-700"></span> Water
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-600"></span> Unvisited Land
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-purple-400"></span> BFS Queue
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-400"></span> Current Cell
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500"></span> Island #1
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-rose-500"></span> Island #2
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-violet-500"></span> Island #3
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-400">+ more...</span>
            </span>
          </div>
        </div>
        
        {/* State Panel */}
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Islands Found</h3>
            <div className="text-4xl font-bold text-green-400">
              {currentStepData?.islandCount || 0}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">BFS Queue</h3>
            <div className="font-mono text-sm">
              {currentStepData?.queue.length === 0 ? (
                <span className="text-slate-500">Empty</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {currentStepData?.queue.map((cell, i) => (
                    <span key={i} className="bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">
                      ({cell.row},{cell.col})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Status</h3>
            <p className={`${
              currentStepData?.type === 'done' || currentStepData?.type === 'island-complete' ? 'text-green-400' :
              currentStepData?.type === 'water' ? 'text-blue-400' :
              currentStepData?.type === 'found-land' ? 'text-yellow-400' :
              'text-white'
            }`}>
              {currentStepData?.description || 'Ready'}
            </p>
            {currentStepData?.currentIslandNumber > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                Exploring Island #{currentStepData.currentIslandNumber}
              </p>
            )}
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Algorithm Insight</h3>
            <div className="text-sm text-slate-300 space-y-2">
              <p><strong>Key Idea:</strong> Each island is a connected component of land cells.</p>
              <p><strong>BFS Strategy:</strong> When we find unvisited land, BFS explores the entire island and marks it with a unique color/ID.</p>
              <p><strong>Why BFS?</strong> Systematically explores neighbors level by level, perfect for flood-fill operations.</p>
              <p><strong>Interview Tip:</strong> This pattern works for any "connected components" problem!</p>
            </div>
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
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code (BFS)</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int numIslands(char[][] grid) {
    int count = 0;
    int rows = grid.length, cols = grid[0].length;
    
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') {
                count++;
                bfs(grid, r, c);  // Mark entire island as visited
            }
        }
    }
    return count;
}

private void bfs(char[][] grid, int row, int col) {
    Queue<int[]> queue = new LinkedList<>();
    queue.offer(new int[]{row, col});
    grid[row][col] = '0';  // Mark as visited
    
    int[][] dirs = {{0,1}, {1,0}, {0,-1}, {-1,0}};
    
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        for (int[] dir : dirs) {
            int r = cell[0] + dir[0];
            int c = cell[1] + dir[1];
            if (r >= 0 && r < grid.length && 
                c >= 0 && c < grid[0].length && 
                grid[r][c] == '1') {
                queue.offer(new int[]{r, c});
                grid[r][c] = '0';  // Mark as visited
            }
        }
    }
}`}
        </pre>
      </div>
    </div>
  );
}
