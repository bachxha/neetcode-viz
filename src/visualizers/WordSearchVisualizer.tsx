import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Cell {
  row: number;
  col: number;
}

interface Step {
  type: 'start' | 'try' | 'match' | 'no-match' | 'visited' | 'found' | 'backtrack' | 'not-found';
  board: string[][];
  word: string;
  path: Cell[];
  currentCell: Cell | null;
  charIndex: number;
  description: string;
  found: boolean;
}

function generateSteps(board: string[][], word: string): Step[] {
  const steps: Step[] = [];
  const rows = board.length;
  const cols = board[0].length;
  let found = false;
  
  steps.push({
    type: 'start',
    board,
    word,
    path: [],
    currentCell: null,
    charIndex: 0,
    description: `Search for "${word}" in the grid`,
    found: false,
  });
  
  function backtrack(row: number, col: number, index: number, path: Cell[], visited: Set<string>): boolean {
    if (index === word.length) {
      found = true;
      steps.push({
        type: 'found',
        board,
        word,
        path: [...path],
        currentCell: null,
        charIndex: index,
        description: `Found "${word}"!`,
        found: true,
      });
      return true;
    }
    
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      return false;
    }
    
    const key = `${row},${col}`;
    if (visited.has(key)) {
      steps.push({
        type: 'visited',
        board,
        word,
        path: [...path],
        currentCell: { row, col },
        charIndex: index,
        description: `(${row},${col}) already visited, skip`,
        found: false,
      });
      return false;
    }
    
    steps.push({
      type: 'try',
      board,
      word,
      path: [...path],
      currentCell: { row, col },
      charIndex: index,
      description: `Try (${row},${col}): "${board[row][col]}" vs "${word[index]}"`,
      found: false,
    });
    
    if (board[row][col] !== word[index]) {
      steps.push({
        type: 'no-match',
        board,
        word,
        path: [...path],
        currentCell: { row, col },
        charIndex: index,
        description: `"${board[row][col]}" ≠ "${word[index]}", no match`,
        found: false,
      });
      return false;
    }
    
    // Match found
    const newPath = [...path, { row, col }];
    visited.add(key);
    
    steps.push({
      type: 'match',
      board,
      word,
      path: newPath,
      currentCell: { row, col },
      charIndex: index,
      description: `Match! "${board[row][col]}" = "${word[index]}", explore neighbors`,
      found: false,
    });
    
    // Explore 4 directions
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dr, dc] of directions) {
      if (backtrack(row + dr, col + dc, index + 1, newPath, visited)) {
        return true;
      }
    }
    
    // Backtrack
    visited.delete(key);
    if (path.length > 0) {
      steps.push({
        type: 'backtrack',
        board,
        word,
        path: [...path],
        currentCell: { row, col },
        charIndex: index,
        description: `Backtrack from (${row},${col})`,
        found: false,
      });
    }
    
    return false;
  }
  
  // Try starting from each cell
  outer:
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === word[0]) {
        if (backtrack(r, c, 0, [], new Set())) {
          break outer;
        }
      }
    }
  }
  
  if (!found) {
    steps.push({
      type: 'not-found',
      board,
      word,
      path: [],
      currentCell: null,
      charIndex: 0,
      description: `"${word}" not found in the grid`,
      found: false,
    });
  }
  
  return steps;
}

function parseBoard(input: string): string[][] {
  try {
    return JSON.parse(input);
  } catch {
    return [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']];
  }
}

export function WordSearchVisualizer() {
  const [boardInput, setBoardInput] = useState('[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]');
  const [wordInput, setWordInput] = useState('ABCCED');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const board = parseBoard(boardInput);
    if (board.length > 0 && wordInput.length > 0) {
      const newSteps = generateSteps(board, wordInput);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [boardInput, wordInput]);
  
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
  const board = currentStepData?.board || [];
  
  const getCellStyle = (row: number, col: number) => {
    if (!currentStepData) return 'bg-slate-700';
    
    const isInPath = currentStepData.path.some(c => c.row === row && c.col === col);
    const isCurrent = currentStepData.currentCell?.row === row && currentStepData.currentCell?.col === col;
    
    if (currentStepData.found && isInPath) {
      return 'bg-green-500';
    }
    if (isCurrent) {
      if (currentStepData.type === 'match') return 'bg-green-500';
      if (currentStepData.type === 'no-match') return 'bg-red-500';
      if (currentStepData.type === 'visited') return 'bg-orange-500';
      return 'bg-yellow-500';
    }
    if (isInPath) {
      return 'bg-blue-500';
    }
    return 'bg-slate-700';
  };
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Word Search (Backtracking)</h1>
        <p className="text-slate-400">
          Search for a word in a grid. Move horizontally or vertically, no cell reuse.
        </p>
      </div>
      
      <div className="mb-6 grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-1">Board (2D array):</label>
          <input
            type="text"
            value={boardInput}
            onChange={(e) => setBoardInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-1">Word to find:</label>
          <input
            type="text"
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value.toUpperCase())}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Grid */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Grid</h3>
          <div className="flex flex-col gap-1 items-center">
            {board.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((cell, c) => (
                  <motion.div
                    key={`${r}-${c}`}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-xl ${getCellStyle(r, c)}`}
                    animate={{
                      scale: currentStepData?.currentCell?.row === r && currentStepData?.currentCell?.col === c ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    {cell}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 mt-4 text-xs justify-center flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-500"></span> Path
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-500"></span> Checking
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500"></span> Match
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500"></span> No match
            </span>
          </div>
        </div>
        
        {/* Word Progress */}
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Word Progress</h3>
            <div className="flex gap-1 flex-wrap">
              {currentStepData?.word.split('').map((char, i) => {
                const isMatched = i < currentStepData.path.length;
                const isCurrent = i === currentStepData.charIndex;
                return (
                  <motion.div
                    key={i}
                    className={`w-10 h-10 flex items-center justify-center rounded font-bold text-lg ${
                      isMatched ? 'bg-green-500' :
                      isCurrent ? 'bg-yellow-500' :
                      'bg-slate-700'
                    }`}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                  >
                    {char}
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Path</h3>
            <div className="font-mono text-sm">
              {currentStepData?.path.length === 0 ? (
                <span className="text-slate-500">Empty</span>
              ) : (
                currentStepData?.path.map((cell, i) => (
                  <span key={i}>
                    <span className="text-blue-400">({cell.row},{cell.col})</span>
                    {i < currentStepData.path.length - 1 && <span className="text-slate-500"> → </span>}
                  </span>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Status</h3>
            <p className={`${
              currentStepData?.type === 'found' ? 'text-green-400' :
              currentStepData?.type === 'not-found' ? 'text-red-400' :
              currentStepData?.type === 'match' ? 'text-green-400' :
              currentStepData?.type === 'no-match' ? 'text-red-400' :
              'text-white'
            }`}>
              {currentStepData?.description || 'Ready'}
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
{`public boolean exist(char[][] board, String word) {
    int rows = board.length, cols = board[0].length;
    
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (backtrack(board, word, r, c, 0)) {
                return true;
            }
        }
    }
    return false;
}

private boolean backtrack(char[][] board, String word, 
                          int row, int col, int index) {
    if (index == word.length()) return true;  // Found!
    
    if (row < 0 || row >= board.length || 
        col < 0 || col >= board[0].length ||
        board[row][col] != word.charAt(index)) {
        return false;
    }
    
    char temp = board[row][col];
    board[row][col] = '#';  // Mark as visited
    
    int[][] dirs = {{0,1}, {1,0}, {0,-1}, {-1,0}};
    for (int[] dir : dirs) {
        if (backtrack(board, word, row + dir[0], col + dir[1], index + 1)) {
            return true;
        }
    }
    
    board[row][col] = temp;  // Backtrack
    return false;
}`}
        </pre>
      </div>
    </div>
  );
}
