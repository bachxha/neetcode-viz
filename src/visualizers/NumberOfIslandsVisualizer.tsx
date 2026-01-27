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
  currentCell: Cell | null;
  queue: Cell[];
  islandCount: number;
  currentIslandCells: Cell[];
  description: string;
}

function generateSteps(initialGrid: string[][]): Step[] {
  const steps: Step[] = [];
  const rows = initialGrid.length;
  const cols = initialGrid[0].length;
  const grid = initialGrid.map(row => [...row]);
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  let islandCount = 0;
  
  steps.push({
    type: 'start',
    grid: grid.map(row => [...row]),
    visited: visited.map(row => [...row]),
    currentCell: null,
    queue: [],
    islandCount: 0,
    currentIslandCells: [],
    description: 'Start scanning the grid for islands (connected land masses)',
  });
  
  function bfs(startRow: number, startCol: number) {
    const queue: Cell[] = [{ row: startRow, col: startCol }];
    const islandCells: Cell[] = [];
    visited[startRow][startCol] = true;
    
    steps.push({
      type: 'found-land',
      grid: grid.map(row => [...row]),
      visited: visited.map(row => [...row]),
      currentCell: { row: startRow, col: startCol },
      queue: [...queue],
      islandCount,
      currentIslandCells: [],
      description: `Found unvisited land at (${startRow},${startCol})! Starting BFS to explore island #${islandCount + 1}`,
    });
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      islandCells.push(current);
      
      steps.push({
        type: 'explore',
        grid: grid.map(row => [...row]),
        visited: visited.map(row => [...row]),
        currentCell: current,
        queue: [...queue],
        islandCount,
        currentIslandCells: [...islandCells],
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
            currentCell: { row: newRow, col: newCol },
            queue: [...queue],
            islandCount,
            currentIslandCells: [...islandCells],
            description: `(${newRow},${newCol}) already visited, skip`,
          });
          continue;
        }
        
        if (grid[newRow][newCol] === '0') {
          steps.push({
            type: 'water',
            grid: grid.map(row => [...row]),
            visited: visited.map(row => [...row]),
            currentCell: { row: newRow, col: newCol },
            queue: [...queue],
            islandCount,
            currentIslandCells: [...islandCells],
            description: `(${newRow},${newCol}) is water, skip`,
          });
          continue;
        }
        
        visited[newRow][newCol] = true;
        queue.push({ row: newRow, col: newCol });
        
        steps.push({
          type: 'mark-visited',
          grid: grid.map(row => [...row]),
          visited: visited.map(row => [...row]),
          currentCell: { row: newRow, col: newCol },
          queue: [...queue],
          islandCount,
          currentIslandCells: [...islandCells],
          description: `(${newRow},${newCol}) is land! Mark visited and add to queue`,
        });
      }
    }
    
    islandCount++;
    steps.push({
      type: 'island-complete',
      grid: grid.map(row => [...row]),
      visited: visited.map(row => [...row]),
      currentCell: null,
      queue: [],
      islandCount,
      currentIslandCells: [...islandCells],
      description: `Island #${islandCount} fully explored! (${islandCells.length} cells)`,
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
    currentCell: null,
    queue: [],
    islandCount,
    currentIslandCells: [],
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
  
  const getCellStyle = (row: number, col: number) => {
    if (!currentStepData) return 'bg-blue-900';
    
    const isLand = grid[row]?.[col] === '1';
    const isVisited = visited[row]?.[col];
    const isCurrent = currentStepData.currentCell?.row === row && currentStepData.currentCell?.col === col;
    const isInQueue = currentStepData.queue.some(c => c.row === row && c.col === col);
    const isInCurrentIsland = currentStepData.currentIslandCells.some(c => c.row === row && c.col === col);
    
    if (isCurrent) {
      if (currentStepData.type === 'water') return 'bg-blue-500 ring-2 ring-white';
      if (currentStepData.type === 'already-visited') return 'bg-orange-500 ring-2 ring-white';
      return 'bg-yellow-500 ring-2 ring-white';
    }
    
    if (isInQueue) {
      return 'bg-purple-500';
    }
    
    if (isInCurrentIsland && currentStepData.type === 'island-complete') {
      return 'bg-green-500';
    }
    
    if (isVisited && isLand) {
      return 'bg-green-600';
    }
    
    if (isLand) {
      return 'bg-amber-700';
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
      
      <div className="mb-6">
        <label className="text-sm text-slate-400 block mb-1">Grid (2D array of '1' land and '0' water):</label>
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
          
          <div className="flex gap-3 mt-4 text-xs justify-center flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-700"></span> Unvisited Land
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-600"></span> Visited Land
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-purple-500"></span> In Queue
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-500"></span> Current
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
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Insight</h3>
            <p className="text-sm text-slate-300">
              BFS explores all neighbors level by level. When we find unvisited land, 
              we start BFS and mark all connected land as visited — that's one island!
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
