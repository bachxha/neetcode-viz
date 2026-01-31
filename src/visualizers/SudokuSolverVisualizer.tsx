import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'try' | 'valid' | 'conflict' | 'backtrack' | 'solved';
  board: (number | null)[][];
  row: number;
  col: number;
  value: number | null;
  description: string;
  conflictCells?: { row: number; col: number }[];
}

interface SudokuCellProps {
  value: number | null;
  isEditing?: boolean;
  hasConflict?: boolean;
  row: number;
  col: number;
  isRecentChange?: boolean;
}

function SudokuCell({ value, isEditing, hasConflict, row, col, isRecentChange }: SudokuCellProps) {
  const isThickBorder = row % 3 === 0 || col % 3 === 0;
  
  return (
    <motion.div
      className={`
        w-12 h-12 border flex items-center justify-center font-bold text-lg
        ${isThickBorder ? 'border-2 border-slate-600' : 'border border-slate-700'}
        ${isEditing ? 'bg-blue-500/20 border-blue-400' : ''}
        ${hasConflict ? 'bg-red-500/20 border-red-400' : ''}
        ${isRecentChange ? 'bg-green-500/20 border-green-400' : ''}
        ${value ? 'bg-slate-800' : 'bg-slate-900'}
      `}
      animate={{
        scale: isEditing ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {value && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`
            ${hasConflict ? 'text-red-400' : ''}
            ${isRecentChange ? 'text-green-400' : 'text-white'}
          `}
        >
          {value}
        </motion.span>
      )}
    </motion.div>
  );
}

function isValidMove(board: (number | null)[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  
  return true;
}

function findConflicts(board: (number | null)[][], row: number, col: number, num: number): { row: number; col: number }[] {
  const conflicts: { row: number; col: number }[] = [];
  
  // Check row conflicts
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) conflicts.push({ row, col: x });
  }
  
  // Check column conflicts
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) conflicts.push({ row: x, col });
  }
  
  // Check 3x3 box conflicts
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) {
        conflicts.push({ row: boxRow + i, col: boxCol + j });
      }
    }
  }
  
  return conflicts;
}

function generateSteps(initialBoard: (number | null)[][]): Step[] {
  const steps: Step[] = [];
  const board = initialBoard.map(row => [...row]);
  
  steps.push({
    type: 'start',
    board: board.map(row => [...row]),
    row: 0,
    col: 0,
    value: null,
    description: 'Starting Sudoku solver using backtracking algorithm',
  });
  
  function findNextEmpty(): { row: number; col: number } | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) {
          return { row, col };
        }
      }
    }
    return null;
  }
  
  function solve(): boolean {
    const emptyCell = findNextEmpty();
    if (!emptyCell) {
      steps.push({
        type: 'solved',
        board: board.map(row => [...row]),
        row: -1,
        col: -1,
        value: null,
        description: 'Sudoku solved! No more empty cells.',
      });
      return true;
    }
    
    const { row, col } = emptyCell;
    
    for (let num = 1; num <= 9; num++) {
      steps.push({
        type: 'try',
        board: board.map(row => [...row]),
        row,
        col,
        value: num,
        description: `Trying to place ${num} at position (${row + 1}, ${col + 1})`,
      });
      
      if (isValidMove(board, row, col, num)) {
        board[row][col] = num;
        steps.push({
          type: 'valid',
          board: board.map(row => [...row]),
          row,
          col,
          value: num,
          description: `✓ ${num} is valid at (${row + 1}, ${col + 1}). Continue with next empty cell.`,
        });
        
        if (solve()) {
          return true;
        }
        
        // Backtrack
        board[row][col] = null;
        steps.push({
          type: 'backtrack',
          board: board.map(row => [...row]),
          row,
          col,
          value: null,
          description: `✗ Dead end reached. Backtrack: remove ${num} from (${row + 1}, ${col + 1})`,
        });
      } else {
        const conflicts = findConflicts(board, row, col, num);
        steps.push({
          type: 'conflict',
          board: board.map(row => [...row]),
          row,
          col,
          value: num,
          description: `✗ ${num} conflicts with existing numbers. Try next value.`,
          conflictCells: conflicts,
        });
      }
    }
    
    return false;
  }
  
  solve();
  return steps;
}

const SAMPLE_PUZZLES = [
  {
    name: 'Easy',
    board: [
      [5, 3, null, null, 7, null, null, null, null],
      [6, null, null, 1, 9, 5, null, null, null],
      [null, 9, 8, null, null, null, null, 6, null],
      [8, null, null, null, 6, null, null, null, 3],
      [4, null, null, 8, null, 3, null, null, 1],
      [7, null, null, null, 2, null, null, null, 6],
      [null, 6, null, null, null, null, 2, 8, null],
      [null, null, null, 4, 1, 9, null, null, 5],
      [null, null, null, null, 8, null, null, 7, 9],
    ]
  },
  {
    name: 'Medium',
    board: [
      [null, null, null, 6, null, null, 4, null, null],
      [7, null, null, null, null, 3, 6, null, null],
      [null, null, null, null, 9, 1, null, 8, null],
      [null, null, null, null, null, null, null, null, null],
      [null, 5, null, 1, 8, null, null, null, 3],
      [null, null, null, 3, null, 6, null, 4, 5],
      [null, 4, null, 2, null, null, null, 6, null],
      [9, null, 3, null, null, null, null, null, null],
      [null, 2, null, null, null, null, 1, null, null],
    ]
  }
];

export function SudokuSolverVisualizer() {
  const [selectedPuzzle, setSelectedPuzzle] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const generateVisualization = useCallback(() => {
    const puzzle = SAMPLE_PUZZLES[selectedPuzzle];
    const generatedSteps = generateSteps(puzzle.board);
    setSteps(generatedSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [selectedPuzzle]);

  useEffect(() => {
    generateVisualization();
  }, [generateVisualization]);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }, 1000 / speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStepBack = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const handleStepForward = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  const handleSpeedChange = (newSpeed: number) => setSpeed(newSpeed);

  const currentStepData = steps[currentStep];

  if (!currentStepData) return null;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Sudoku Solver</h1>
          <p className="text-slate-400 text-lg mb-4">
            Watch how backtracking systematically solves a Sudoku puzzle
          </p>
          
          <div className="flex justify-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Puzzle Difficulty</label>
              <select
                value={selectedPuzzle}
                onChange={(e) => setSelectedPuzzle(Number(e.target.value))}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
              >
                {SAMPLE_PUZZLES.map((puzzle, i) => (
                  <option key={i} value={i}>{puzzle.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateVisualization}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Reset Puzzle
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Sudoku Board</h3>
                <p className="text-sm text-slate-400">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
              
              <div className="grid grid-cols-9 gap-0 w-fit mx-auto bg-slate-600 p-2 rounded-lg">
                {currentStepData.board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isEditing = rowIndex === currentStepData.row && colIndex === currentStepData.col;
                    const hasConflict = currentStepData.conflictCells?.some(
                      c => c.row === rowIndex && c.col === colIndex
                    );
                    const isRecentChange = 
                      currentStepData.type === 'valid' && 
                      rowIndex === currentStepData.row && 
                      colIndex === currentStepData.col;
                    
                    return (
                      <SudokuCell
                        key={`${rowIndex}-${colIndex}`}
                        value={cell}
                        isEditing={isEditing}
                        hasConflict={hasConflict}
                        row={rowIndex}
                        col={colIndex}
                        isRecentChange={isRecentChange}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Algorithm Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    currentStepData.type === 'try' ? 'bg-blue-500' :
                    currentStepData.type === 'valid' ? 'bg-green-500' :
                    currentStepData.type === 'conflict' ? 'bg-red-500' :
                    currentStepData.type === 'backtrack' ? 'bg-yellow-500' :
                    currentStepData.type === 'solved' ? 'bg-green-500' :
                    'bg-slate-500'
                  }`} />
                  <span className="text-sm font-medium">
                    {currentStepData.type === 'try' ? 'Trying Value' :
                     currentStepData.type === 'valid' ? 'Valid Move' :
                     currentStepData.type === 'conflict' ? 'Conflict Found' :
                     currentStepData.type === 'backtrack' ? 'Backtracking' :
                     currentStepData.type === 'solved' ? 'Solved!' :
                     'Starting'}
                  </span>
                </div>
                
                {currentStepData.row >= 0 && (
                  <div className="text-sm text-slate-300">
                    Position: ({currentStepData.row + 1}, {currentStepData.col + 1})
                  </div>
                )}
                
                {currentStepData.value && (
                  <div className="text-sm text-slate-300">
                    Trying value: {currentStepData.value}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Description</h3>
              <p className="text-sm text-slate-300">
                {currentStepData.description}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-400 bg-blue-500/20 rounded flex items-center justify-center text-xs">9</div>
                  <span>Current cell</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-red-400 bg-red-500/20 rounded flex items-center justify-center text-xs text-red-400">5</div>
                  <span>Conflict detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-green-400 bg-green-500/20 rounded flex items-center justify-center text-xs text-green-400">7</div>
                  <span>Valid placement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border border-slate-700 bg-slate-800 rounded flex items-center justify-center text-xs">3</div>
                  <span>Given number</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Controls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onStepBack={handleStepBack}
            onStepForward={handleStepForward}
            onReset={handleReset}
            currentStep={currentStep + 1}
            totalSteps={steps.length}
            speed={speed}
            onSpeedChange={handleSpeedChange}
            canStepBack={currentStep > 0}
            canStepForward={currentStep < steps.length - 1}
          />
        </div>

        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">How Sudoku Backtracking Works</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <h4 className="font-medium text-white mb-2">Algorithm Steps:</h4>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Find the next empty cell</li>
                <li>Try numbers 1-9 in that cell</li>
                <li>Check if the number is valid (no conflicts)</li>
                <li>If valid, place the number and recurse</li>
                <li>If no valid numbers work, backtrack</li>
                <li>Repeat until solved or no solution exists</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Sudoku Rules:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Each row must contain digits 1-9</li>
                <li>Each column must contain digits 1-9</li>
                <li>Each 3×3 box must contain digits 1-9</li>
                <li>No repeats allowed in any constraint</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}