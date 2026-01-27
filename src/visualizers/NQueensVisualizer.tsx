import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'try' | 'place' | 'conflict' | 'backtrack' | 'solution';
  board: (boolean | null)[][];  // true = queen, false = attacked, null = empty
  row: number;
  col: number;
  queens: [number, number][];
  description: string;
  solutionCount: number;
}

function generateSteps(n: number): Step[] {
  const steps: Step[] = [];
  const queens: [number, number][] = [];
  let solutionCount = 0;
  
  function createBoard(): (boolean | null)[][] {
    const board: (boolean | null)[][] = Array(n).fill(null).map(() => Array(n).fill(null));
    // Mark queen positions
    for (const [r, c] of queens) {
      board[r][c] = true;
    }
    return board;
  }
  
  function isValid(row: number, col: number): boolean {
    for (const [r, c] of queens) {
      if (c === col) return false;  // Same column
      if (Math.abs(r - row) === Math.abs(c - col)) return false;  // Diagonal
    }
    return true;
  }
  
  function markAttacked(board: (boolean | null)[][], row: number, col: number) {
    // Mark the cell being tried
    if (board[row][col] === null) {
      board[row][col] = false;
    }
  }
  
  function solve(row: number) {
    if (row === n) {
      solutionCount++;
      steps.push({
        type: 'solution',
        board: createBoard(),
        row: -1,
        col: -1,
        queens: [...queens],
        description: `Found solution #${solutionCount}!`,
        solutionCount,
      });
      return;
    }
    
    for (let col = 0; col < n; col++) {
      const board = createBoard();
      markAttacked(board, row, col);
      
      steps.push({
        type: 'try',
        board,
        row,
        col,
        queens: [...queens],
        description: `Try placing queen at row ${row}, col ${col}`,
        solutionCount,
      });
      
      if (isValid(row, col)) {
        queens.push([row, col]);
        const boardWithQueen = createBoard();
        
        steps.push({
          type: 'place',
          board: boardWithQueen,
          row,
          col,
          queens: [...queens],
          description: `Place queen at row ${row}, col ${col} ✓`,
          solutionCount,
        });
        
        solve(row + 1);
        
        queens.pop();
        
        if (row < n - 1 || col < n - 1) {
          steps.push({
            type: 'backtrack',
            board: createBoard(),
            row,
            col,
            queens: [...queens],
            description: `Backtrack from row ${row}, col ${col}`,
            solutionCount,
          });
        }
      } else {
        steps.push({
          type: 'conflict',
          board,
          row,
          col,
          queens: [...queens],
          description: `Conflict at row ${row}, col ${col} - attacked by existing queen`,
          solutionCount,
        });
      }
    }
  }
  
  // Initial state
  steps.push({
    type: 'try',
    board: createBoard(),
    row: 0,
    col: -1,
    queens: [],
    description: `Solving ${n}-Queens problem...`,
    solutionCount: 0,
  });
  
  solve(0);
  
  return steps;
}

export function NQueensVisualizer() {
  const [n, setN] = useState(4);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  useEffect(() => {
    const newSteps = generateSteps(n);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [n]);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, 600 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  const cellSize = Math.min(60, 400 / n);
  
  const getCellColor = (row: number, col: number) => {
    if (!currentStepData) return '';
    
    const isQueen = currentStepData.board[row]?.[col] === true;
    const isTrying = currentStepData.row === row && currentStepData.col === col;
    const baseColor = (row + col) % 2 === 0 ? 'bg-slate-600' : 'bg-slate-700';
    
    if (isQueen) return 'bg-green-500';
    if (isTrying) {
      if (currentStepData.type === 'conflict') return 'bg-red-500';
      if (currentStepData.type === 'place') return 'bg-green-500';
      return 'bg-yellow-500';
    }
    return baseColor;
  };
  
  const isAttacked = (row: number, col: number): boolean => {
    if (!currentStepData) return false;
    for (const [qr, qc] of currentStepData.queens) {
      if (qc === col || Math.abs(qr - row) === Math.abs(qc - col)) {
        return true;
      }
    }
    return false;
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">N-Queens (Backtracking)</h1>
        <p className="text-slate-400">
          Place N queens on an N×N board so no two queens attack each other.
          Watch the backtracking algorithm explore and prune the search space.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Board size (N):</label>
        <select
          value={n}
          onChange={(e) => setN(parseInt(e.target.value))}
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
        >
          {[4, 5, 6, 7, 8].map(size => (
            <option key={size} value={size}>{size} × {size}</option>
          ))}
        </select>
        <span className="text-sm text-slate-500">
          Solutions found: {currentStepData?.solutionCount || 0}
        </span>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Chess Board */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Board</h3>
          <div 
            className="inline-grid gap-0.5 p-2 bg-slate-900 rounded-lg"
            style={{ gridTemplateColumns: `repeat(${n}, ${cellSize}px)` }}
          >
            {Array(n).fill(0).map((_, row) =>
              Array(n).fill(0).map((_, col) => (
                <motion.div
                  key={`${row}-${col}`}
                  className={`flex items-center justify-center rounded-sm ${getCellColor(row, col)}`}
                  style={{ width: cellSize, height: cellSize }}
                  animate={{
                    scale: currentStepData?.row === row && currentStepData?.col === col ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {currentStepData?.board[row]?.[col] === true && (
                    <motion.span 
                      className="text-2xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ♛
                    </motion.span>
                  )}
                  {currentStepData?.row === row && currentStepData?.col === col && 
                   currentStepData?.type === 'try' && (
                    <span className="text-xl opacity-50">♛</span>
                  )}
                  {currentStepData?.board[row]?.[col] !== true && 
                   isAttacked(row, col) && 
                   currentStepData?.row === row && currentStepData?.col === col && (
                    <span className="text-red-300 text-lg">✕</span>
                  )}
                </motion.div>
              ))
            )}
          </div>
          
          <div className="flex gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500"></span> Queen placed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-500"></span> Trying
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500"></span> Conflict
            </span>
          </div>
        </div>
        
        {/* State Panel */}
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Action</h3>
            <div className={`text-lg font-medium ${
              currentStepData?.type === 'solution' ? 'text-green-400' :
              currentStepData?.type === 'conflict' ? 'text-red-400' :
              currentStepData?.type === 'backtrack' ? 'text-orange-400' :
              'text-white'
            }`}>
              {currentStepData?.description || 'Ready'}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Queens Placed</h3>
            <div className="font-mono text-sm">
              {currentStepData?.queens.length === 0 ? (
                <span className="text-slate-500">None yet</span>
              ) : (
                currentStepData?.queens.map(([r, c], i) => (
                  <span key={i} className="inline-block mr-2 px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    ({r}, {c})
                  </span>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Insight</h3>
            <p className="text-sm text-slate-300">
              {currentStepData?.type === 'try' && 'Checking if this position is safe (not attacked by any placed queen)'}
              {currentStepData?.type === 'place' && 'Position is safe! Place queen and move to next row'}
              {currentStepData?.type === 'conflict' && 'This position is attacked by an existing queen - skip it'}
              {currentStepData?.type === 'backtrack' && 'No valid positions in this row - backtrack and try next column in previous row'}
              {currentStepData?.type === 'solution' && 'All queens placed successfully! This is a valid solution'}
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
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    char[][] board = new char[n][n];
    for (char[] row : board) Arrays.fill(row, '.');
    backtrack(board, 0, result);
    return result;
}

private void backtrack(char[][] board, int row, List<List<String>> result) {
    if (row == board.length) {
        result.add(construct(board));  // Found a solution
        return;
    }
    
    for (int col = 0; col < board.length; col++) {
        if (isValid(board, row, col)) {
            board[row][col] = 'Q';           // Place queen
            backtrack(board, row + 1, result);
            board[row][col] = '.';           // Backtrack
        }
    }
}

private boolean isValid(char[][] board, int row, int col) {
    // Check column and diagonals above current row
    for (int i = 0; i < row; i++) {
        if (board[i][col] == 'Q') return false;
        int diff = row - i;
        if (col - diff >= 0 && board[i][col - diff] == 'Q') return false;
        if (col + diff < board.length && board[i][col + diff] == 'Q') return false;
    }
    return true;
}`}
        </pre>
      </div>
    </div>
  );
}
