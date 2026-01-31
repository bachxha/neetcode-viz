import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Cell {
  row: number;
  col: number;
}

interface Step {
  type: 'start' | 'check-border' | 'found-border-o' | 'dfs-mark' | 'mark-safe' | 'scanning-interior' | 'found-surrounded' | 'capture' | 'restore-safe' | 'done';
  board: string[][];
  visited: boolean[][];
  currentCell: Cell | null;
  safeOs: Set<string>; // Set of "row,col" strings for O's connected to border
  currentPath: Cell[];
  description: string;
  capturedCount: number;
}

function generateSteps(initialBoard: string[][]): Step[] {
  const steps: Step[] = [];
  const rows = initialBoard.length;
  const cols = initialBoard[0].length;
  const board = initialBoard.map(row => [...row]);
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const safeOs = new Set<string>();
  let capturedCount = 0;

  steps.push({
    type: 'start',
    board: board.map(row => [...row]),
    visited: visited.map(row => [...row]),
    currentCell: null,
    safeOs: new Set(safeOs),
    currentPath: [],
    description: 'Start by finding all O\'s connected to the border. These are "safe" and cannot be captured.',
    capturedCount: 0
  });

  // Phase 1: Mark all O's connected to border as safe using DFS
  function markSafeOs(row: number, col: number, path: Cell[] = []) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    if (board[row][col] !== 'O' || visited[row][col]) return;

    visited[row][col] = true;
    const cellKey = `${row},${col}`;
    safeOs.add(cellKey);
    path.push({ row, col });

    steps.push({
      type: 'dfs-mark',
      board: board.map(row => [...row]),
      visited: visited.map(row => [...row]),
      currentCell: { row, col },
      safeOs: new Set(safeOs),
      currentPath: [...path],
      description: `DFS exploring (${row},${col}). This O is connected to border, so it's safe from capture.`,
      capturedCount: 0
    });

    // Explore all 4 directions
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dr, dc] of directions) {
      markSafeOs(row + dr, col + dc, path);
    }

    steps.push({
      type: 'mark-safe',
      board: board.map(row => [...row]),
      visited: visited.map(row => [...row]),
      currentCell: { row, col },
      safeOs: new Set(safeOs),
      currentPath: [...path],
      description: `Marked (${row},${col}) as safe. Total safe O's: ${safeOs.size}`,
      capturedCount: 0
    });

    path.pop();
  }

  // Check all border cells
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const isBorder = i === 0 || i === rows - 1 || j === 0 || j === cols - 1;
      if (isBorder) {
        steps.push({
          type: 'check-border',
          board: board.map(row => [...row]),
          visited: visited.map(row => [...row]),
          currentCell: { row: i, col: j },
          safeOs: new Set(safeOs),
          currentPath: [],
          description: `Checking border cell (${i},${j})`,
          capturedCount: 0
        });

        if (board[i][j] === 'O' && !visited[i][j]) {
          steps.push({
            type: 'found-border-o',
            board: board.map(row => [...row]),
            visited: visited.map(row => [...row]),
            currentCell: { row: i, col: j },
            safeOs: new Set(safeOs),
            currentPath: [],
            description: `Found O at border (${i},${j})! Starting DFS to mark all connected O's as safe.`,
            capturedCount: 0
          });

          markSafeOs(i, j);
        }
      }
    }
  }

  // Phase 2: Scan interior and capture surrounded O's
  steps.push({
    type: 'scanning-interior',
    board: board.map(row => [...row]),
    visited: visited.map(row => [...row]),
    currentCell: null,
    safeOs: new Set(safeOs),
    currentPath: [],
    description: 'Now scanning all interior cells. Any O not marked as safe will be captured (converted to X).',
    capturedCount: 0
  });

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cellKey = `${i},${j}`;
      
      if (board[i][j] === 'O' && !safeOs.has(cellKey)) {
        steps.push({
          type: 'found-surrounded',
          board: board.map(row => [...row]),
          visited: visited.map(row => [...row]),
          currentCell: { row: i, col: j },
          safeOs: new Set(safeOs),
          currentPath: [],
          description: `Found surrounded O at (${i},${j})! This O is not connected to border, so it gets captured.`,
          capturedCount
        });

        board[i][j] = 'X';
        capturedCount++;

        steps.push({
          type: 'capture',
          board: board.map(row => [...row]),
          visited: visited.map(row => [...row]),
          currentCell: { row: i, col: j },
          safeOs: new Set(safeOs),
          currentPath: [],
          description: `Captured O at (${i},${j}) → X. Total captured: ${capturedCount}`,
          capturedCount
        });
      }
    }
  }

  steps.push({
    type: 'done',
    board: board.map(row => [...row]),
    visited: visited.map(row => [...row]),
    currentCell: null,
    safeOs: new Set(safeOs),
    currentPath: [],
    description: `Algorithm complete! Captured ${capturedCount} surrounded regions. All O's connected to border remain safe.`,
    capturedCount
  });

  return steps;
}

export function SurroundedRegionsVisualizer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Sample board - can be customized
  const initialBoard = [
    ['X', 'X', 'X', 'X'],
    ['X', 'O', 'O', 'X'],
    ['X', 'X', 'O', 'X'],
    ['X', 'O', 'X', 'X']
  ];

  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    setSteps(generateSteps(initialBoard));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  if (steps.length === 0) return <div>Loading...</div>;

  const currentStepData = steps[currentStep];
  const { board, currentCell, safeOs, currentPath, description, capturedCount } = currentStepData;

  function getCellColor(row: number, col: number) {
    const cellKey = `${row},${col}`;
    const isCurrentCell = currentCell?.row === row && currentCell?.col === col;
    const isInPath = currentPath.some(cell => cell.row === row && cell.col === col);
    const isSafe = safeOs.has(cellKey);
    const cellValue = board[row][col];

    if (isCurrentCell) return 'bg-yellow-400 border-yellow-600';
    if (isInPath) return 'bg-blue-400 border-blue-600';
    if (cellValue === 'X') return 'bg-gray-700 border-gray-600 text-white';
    if (cellValue === 'O') {
      if (isSafe) return 'bg-green-400 border-green-600 text-black';
      return 'bg-red-400 border-red-600 text-white';
    }
    return 'bg-gray-200 border-gray-400';
  }

  function getCellText(row: number, col: number) {
    return board[row][col];
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Surrounded Regions</h1>
        <p className="text-slate-400 mb-4">
          Capture all regions surrounded by X's using border-connected DFS
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 border border-green-600 rounded"></div>
            <span>Safe O (border-connected)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 border border-red-600 rounded"></div>
            <span>Surrounded O</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 border border-gray-600 rounded"></div>
            <span>X (wall)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 border border-yellow-600 rounded"></div>
            <span>Current cell</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Board State</h3>
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              {board.map((row, rowIndex) =>
                row.map((_, colIndex) => (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-lg ${getCellColor(rowIndex, colIndex)}`}
                    initial={{ scale: 1 }}
                    animate={{
                      scale: currentCell?.row === rowIndex && currentCell?.col === colIndex ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {getCellText(rowIndex, colIndex)}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Algorithm Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Safe O's found:</span>
                <span className="font-mono text-green-400">{safeOs.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Regions captured:</span>
                <span className="font-mono text-red-400">{capturedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Current step:</span>
                <span className="font-mono">{currentStep + 1} / {steps.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Current Step</h3>
            <p className="text-slate-300 leading-relaxed">{description}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Algorithm Overview</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Start from all border cells containing 'O'</span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Use DFS to mark all O's connected to border as "safe"</span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Scan entire board for O's not marked safe</span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold">4.</span>
                <span>Convert surrounded O's to X's (capture them)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Complexity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-mono text-blue-400">O(m × n)</span>
              </div>
              <div className="flex justify-between">
                <span>Space:</span>
                <span className="font-mono text-blue-400">O(m × n)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Controls
        currentStep={currentStep}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        speed={speed}
        onStepBack={prevStep}
        onStepForward={nextStep}
        onReset={reset}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onSpeedChange={setSpeed}
        canStepBack={currentStep > 0}
        canStepForward={currentStep < steps.length - 1}
      />
    </div>
  );
}