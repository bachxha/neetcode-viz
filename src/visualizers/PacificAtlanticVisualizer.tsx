import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Cell {
  row: number;
  col: number;
}

interface Step {
  type: 'start' | 'pacific-start' | 'atlantic-start' | 'dfs-explore' | 'can-flow' | 'cannot-flow' | 'phase-complete' | 'find-intersection' | 'done';
  heights: number[][];
  pacificReachable: boolean[][];
  atlanticReachable: boolean[][];
  currentCell: Cell | null;
  stack: Cell[];
  phase: 'pacific' | 'atlantic' | 'intersection';
  result: Cell[];
  description: string;
}

function generateSteps(heights: number[][]): Step[] {
  const steps: Step[] = [];
  const rows = heights.length;
  const cols = heights[0].length;
  const pacificReachable: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const atlanticReachable: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  
  steps.push({
    type: 'start',
    heights,
    pacificReachable: pacificReachable.map(row => [...row]),
    atlanticReachable: atlanticReachable.map(row => [...row]),
    currentCell: null,
    stack: [],
    phase: 'pacific',
    result: [],
    description: 'Key insight: Instead of checking if water flows FROM each cell TO oceans, we reverse it — start from oceans and see which cells water can flow FROM.',
  });
  
  function dfs(row: number, col: number, reachable: boolean[][], ocean: string) {
    const stack: Cell[] = [{ row, col }];
    reachable[row][col] = true;
    
    steps.push({
      type: ocean === 'pacific' ? 'pacific-start' : 'atlantic-start',
      heights,
      pacificReachable: pacificReachable.map(row => [...row]),
      atlanticReachable: atlanticReachable.map(row => [...row]),
      currentCell: { row, col },
      stack: [...stack],
      phase: ocean as 'pacific' | 'atlantic',
      result: [],
      description: `Start DFS from ${ocean.charAt(0).toUpperCase() + ocean.slice(1)} edge at (${row},${col}) height=${heights[row][col]}`,
    });
    
    while (stack.length > 0) {
      const current = stack.pop()!;
      
      steps.push({
        type: 'dfs-explore',
        heights,
        pacificReachable: pacificReachable.map(row => [...row]),
        atlanticReachable: atlanticReachable.map(row => [...row]),
        currentCell: current,
        stack: [...stack],
        phase: ocean as 'pacific' | 'atlantic',
        result: [],
        description: `Exploring (${current.row},${current.col}) height=${heights[current.row][current.col]}, checking neighbors`,
      });
      
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dr, dc] of directions) {
        const newRow = current.row + dr;
        const newCol = current.col + dc;
        
        if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
          continue;
        }
        
        if (reachable[newRow][newCol]) {
          continue;
        }
        
        // Water can flow FROM neighbor TO current if neighbor height >= current height
        // (Reversed: we're going uphill from ocean)
        if (heights[newRow][newCol] < heights[current.row][current.col]) {
          steps.push({
            type: 'cannot-flow',
            heights,
            pacificReachable: pacificReachable.map(row => [...row]),
            atlanticReachable: atlanticReachable.map(row => [...row]),
            currentCell: { row: newRow, col: newCol },
            stack: [...stack],
            phase: ocean as 'pacific' | 'atlantic',
            result: [],
            description: `(${newRow},${newCol}) height=${heights[newRow][newCol]} < ${heights[current.row][current.col]}, water can't flow uphill to here`,
          });
          continue;
        }
        
        reachable[newRow][newCol] = true;
        stack.push({ row: newRow, col: newCol });
        
        steps.push({
          type: 'can-flow',
          heights,
          pacificReachable: pacificReachable.map(row => [...row]),
          atlanticReachable: atlanticReachable.map(row => [...row]),
          currentCell: { row: newRow, col: newCol },
          stack: [...stack],
          phase: ocean as 'pacific' | 'atlantic',
          result: [],
          description: `(${newRow},${newCol}) height=${heights[newRow][newCol]} >= ${heights[current.row][current.col]}, water CAN flow from here to ${ocean}!`,
        });
      }
    }
  }
  
  // Pacific Ocean: top row and left column
  steps.push({
    type: 'pacific-start',
    heights,
    pacificReachable: pacificReachable.map(row => [...row]),
    atlanticReachable: atlanticReachable.map(row => [...row]),
    currentCell: null,
    stack: [],
    phase: 'pacific',
    result: [],
    description: 'Phase 1: Find all cells that can reach PACIFIC (top & left edges)',
  });
  
  for (let c = 0; c < cols; c++) {
    if (!pacificReachable[0][c]) dfs(0, c, pacificReachable, 'pacific');
  }
  for (let r = 1; r < rows; r++) {
    if (!pacificReachable[r][0]) dfs(r, 0, pacificReachable, 'pacific');
  }
  
  steps.push({
    type: 'phase-complete',
    heights,
    pacificReachable: pacificReachable.map(row => [...row]),
    atlanticReachable: atlanticReachable.map(row => [...row]),
    currentCell: null,
    stack: [],
    phase: 'pacific',
    result: [],
    description: 'Pacific reachability complete! Blue cells can flow to Pacific.',
  });
  
  // Atlantic Ocean: bottom row and right column
  steps.push({
    type: 'atlantic-start',
    heights,
    pacificReachable: pacificReachable.map(row => [...row]),
    atlanticReachable: atlanticReachable.map(row => [...row]),
    currentCell: null,
    stack: [],
    phase: 'atlantic',
    result: [],
    description: 'Phase 2: Find all cells that can reach ATLANTIC (bottom & right edges)',
  });
  
  for (let c = 0; c < cols; c++) {
    if (!atlanticReachable[rows - 1][c]) dfs(rows - 1, c, atlanticReachable, 'atlantic');
  }
  for (let r = 0; r < rows - 1; r++) {
    if (!atlanticReachable[r][cols - 1]) dfs(r, cols - 1, atlanticReachable, 'atlantic');
  }
  
  steps.push({
    type: 'phase-complete',
    heights,
    pacificReachable: pacificReachable.map(row => [...row]),
    atlanticReachable: atlanticReachable.map(row => [...row]),
    currentCell: null,
    stack: [],
    phase: 'atlantic',
    result: [],
    description: 'Atlantic reachability complete! Orange cells can flow to Atlantic.',
  });
  
  // Find intersection
  const result: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pacificReachable[r][c] && atlanticReachable[r][c]) {
        result.push({ row: r, col: c });
      }
    }
  }
  
  steps.push({
    type: 'find-intersection',
    heights,
    pacificReachable: pacificReachable.map(row => [...row]),
    atlanticReachable: atlanticReachable.map(row => [...row]),
    currentCell: null,
    stack: [],
    phase: 'intersection',
    result,
    description: 'Phase 3: Find intersection — cells that can reach BOTH oceans!',
  });
  
  steps.push({
    type: 'done',
    heights,
    pacificReachable: pacificReachable.map(row => [...row]),
    atlanticReachable: atlanticReachable.map(row => [...row]),
    currentCell: null,
    stack: [],
    phase: 'intersection',
    result,
    description: `Found ${result.length} cells that can flow to both oceans!`,
  });
  
  return steps;
}

function parseHeights(input: string): number[][] {
  try {
    return JSON.parse(input);
  } catch {
    return [
      [1, 2, 2, 3, 5],
      [3, 2, 3, 4, 4],
      [2, 4, 5, 3, 1],
      [6, 7, 1, 4, 5],
      [5, 1, 1, 2, 4],
    ];
  }
}

export function PacificAtlanticVisualizer() {
  const [heightsInput, setHeightsInput] = useState('[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const heights = parseHeights(heightsInput);
    if (heights.length > 0) {
      const newSteps = generateSteps(heights);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [heightsInput]);
  
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
  const heights = currentStepData?.heights || [];
  const pacificReachable = currentStepData?.pacificReachable || [];
  const atlanticReachable = currentStepData?.atlanticReachable || [];
  
  const getCellStyle = (row: number, col: number) => {
    if (!currentStepData) return 'bg-slate-700';
    
    const isCurrent = currentStepData.currentCell?.row === row && currentStepData.currentCell?.col === col;
    const isPacific = pacificReachable[row]?.[col];
    const isAtlantic = atlanticReachable[row]?.[col];
    const isResult = currentStepData.result.some(c => c.row === row && c.col === col);
    
    if (isCurrent) {
      return 'bg-yellow-500 ring-2 ring-white';
    }
    
    if (currentStepData.phase === 'intersection' || currentStepData.type === 'done') {
      if (isResult) return 'bg-green-500';
      if (isPacific && isAtlantic) return 'bg-green-500';
      if (isPacific) return 'bg-blue-500';
      if (isAtlantic) return 'bg-orange-500';
    } else if (currentStepData.phase === 'pacific') {
      if (isPacific) return 'bg-blue-500';
    } else if (currentStepData.phase === 'atlantic') {
      if (isPacific && isAtlantic) return 'bg-purple-500';
      if (isAtlantic) return 'bg-orange-500';
      if (isPacific) return 'bg-blue-500/50';
    }
    
    return 'bg-slate-700';
  };
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Pacific Atlantic Water Flow</h1>
        <p className="text-slate-400">
          Find cells where water can flow to both Pacific (top/left) and Atlantic (bottom/right) oceans.
          <span className="text-yellow-400 font-medium"> Key insight: Reverse thinking — start from oceans and go uphill!</span>
        </p>
      </div>
      
      <div className="mb-6">
        <label className="text-sm text-slate-400 block mb-1">Heights matrix (water flows to equal or lower height):</label>
        <input
          type="text"
          value={heightsInput}
          onChange={(e) => setHeightsInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono text-sm"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Grid Visualization */}
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-400">Height Map</h3>
            <span className="text-xs text-slate-500">
              {currentStepData?.phase === 'pacific' && '🌊 Pacific Phase'}
              {currentStepData?.phase === 'atlantic' && '🌊 Atlantic Phase'}
              {currentStepData?.phase === 'intersection' && '✨ Finding Intersection'}
            </span>
          </div>
          
          {/* Ocean labels */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-blue-400 mb-1">← Pacific Ocean (Top) →</div>
            <div className="flex">
              <div className="text-xs text-blue-400 mr-1 flex items-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                Pacific
              </div>
              <div className="flex flex-col gap-1">
                {heights.map((row, r) => (
                  <div key={r} className="flex gap-1">
                    {row.map((height, c) => (
                      <motion.div
                        key={`${r}-${c}`}
                        className={`w-10 h-10 flex items-center justify-center rounded font-bold text-sm ${getCellStyle(r, c)}`}
                        animate={{
                          scale: currentStepData?.currentCell?.row === r && currentStepData?.currentCell?.col === c ? 1.15 : 1,
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        {height}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="text-xs text-orange-400 ml-1 flex items-center" style={{ writingMode: 'vertical-rl' }}>
                Atlantic
              </div>
            </div>
            <div className="text-xs text-orange-400 mt-1">← Atlantic Ocean (Bottom) →</div>
          </div>
          
          <div className="flex gap-3 mt-4 text-xs justify-center flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-500"></span> Pacific
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-orange-500"></span> Atlantic
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500"></span> Both!
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-500"></span> Current
            </span>
          </div>
        </div>
        
        {/* State Panel */}
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Result Cells</h3>
            <div className="font-mono text-sm">
              {currentStepData?.result.length === 0 ? (
                <span className="text-slate-500">Finding...</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {currentStepData?.result.map((cell, i) => (
                    <span key={i} className="bg-green-500/30 text-green-300 px-2 py-0.5 rounded">
                      [{cell.row},{cell.col}]
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Status</h3>
            <p className={`${
              currentStepData?.type === 'done' ? 'text-green-400' :
              currentStepData?.type === 'can-flow' ? 'text-green-400' :
              currentStepData?.type === 'cannot-flow' ? 'text-red-400' :
              'text-white'
            }`}>
              {currentStepData?.description || 'Ready'}
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 The Reverse Thinking Trick</h3>
            <p className="text-sm text-slate-300">
              Instead of checking each cell: "Can I reach both oceans?"
              <br /><br />
              We flip it: Start from each ocean's edge and DFS <strong>uphill</strong> (to cells with height ≥ current).
              Any cell reachable from both oceans is our answer!
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
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code (Reverse DFS)</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public List<List<Integer>> pacificAtlantic(int[][] heights) {
    int rows = heights.length, cols = heights[0].length;
    boolean[][] pacific = new boolean[rows][cols];
    boolean[][] atlantic = new boolean[rows][cols];
    
    // DFS from Pacific edges (top row, left col)
    for (int c = 0; c < cols; c++) dfs(heights, 0, c, pacific, Integer.MIN_VALUE);
    for (int r = 0; r < rows; r++) dfs(heights, r, 0, pacific, Integer.MIN_VALUE);
    
    // DFS from Atlantic edges (bottom row, right col)
    for (int c = 0; c < cols; c++) dfs(heights, rows-1, c, atlantic, Integer.MIN_VALUE);
    for (int r = 0; r < rows; r++) dfs(heights, r, cols-1, atlantic, Integer.MIN_VALUE);
    
    // Find intersection
    List<List<Integer>> result = new ArrayList<>();
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (pacific[r][c] && atlantic[r][c]) {
                result.add(Arrays.asList(r, c));
            }
        }
    }
    return result;
}

// Reverse DFS: go UPHILL from ocean
private void dfs(int[][] heights, int r, int c, 
                 boolean[][] reachable, int prevHeight) {
    if (r < 0 || r >= heights.length || 
        c < 0 || c >= heights[0].length ||
        reachable[r][c] || heights[r][c] < prevHeight) {
        return;  // Out of bounds, visited, or water can't flow uphill
    }
    
    reachable[r][c] = true;
    int[][] dirs = {{0,1}, {1,0}, {0,-1}, {-1,0}};
    for (int[] d : dirs) {
        dfs(heights, r + d[0], c + d[1], reachable, heights[r][c]);
    }
}`}
        </pre>
      </div>
    </div>
  );
}
