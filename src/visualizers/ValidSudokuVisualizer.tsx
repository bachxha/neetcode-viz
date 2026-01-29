import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'check-row' | 'check-col' | 'check-box' | 'conflict' | 'done';
  board: string[][];
  currentRow: number;
  currentCol: number;
  currentValue: string;
  rowSets: Set<string>[];
  colSets: Set<string>[];
  boxSets: Set<string>[];
  highlightCells: [number, number][];
  conflictCells: [number, number][];
  checkType: 'row' | 'col' | 'box' | null;
  isValid: boolean | null;
  description: string;
}

const SAMPLE_BOARD: string[][] = [
  ['5','3','.','.','7','.','.','.','.'],
  ['6','.','.','1','9','5','.','.','.'],
  ['.','9','8','.','.','.','.','6','.'],
  ['8','.','.','.','6','.','.','.','3'],
  ['4','.','.','8','.','3','.','.','1'],
  ['7','.','.','.','2','.','.','.','6'],
  ['.','6','.','.','.','.','2','8','.'],
  ['.','.','.','4','1','9','.','.','5'],
  ['.','.','.','.','8','.','.','7','9'],
];

const INVALID_BOARD: string[][] = [
  ['8','3','.','.','7','.','.','.','.'],
  ['6','.','.','1','9','5','.','.','.'],
  ['.','9','8','.','.','.','.','6','.'],
  ['8','.','.','.','6','.','.','.','3'],
  ['4','.','.','8','.','3','.','.','1'],
  ['7','.','.','.','2','.','.','.','6'],
  ['.','6','.','.','.','.','2','8','.'],
  ['.','.','.','4','1','9','.','.','5'],
  ['.','.','.','.','8','.','.','7','9'],
];

function generateSteps(board: string[][]): Step[] {
  const steps: Step[] = [];
  const rowSets: Set<string>[] = Array.from({ length: 9 }, () => new Set());
  const colSets: Set<string>[] = Array.from({ length: 9 }, () => new Set());
  const boxSets: Set<string>[] = Array.from({ length: 9 }, () => new Set());

  steps.push({
    type: 'start',
    board,
    currentRow: -1, currentCol: -1, currentValue: '',
    rowSets: rowSets.map(s => new Set(s)),
    colSets: colSets.map(s => new Set(s)),
    boxSets: boxSets.map(s => new Set(s)),
    highlightCells: [],
    conflictCells: [],
    checkType: null,
    isValid: null,
    description: 'Validate Sudoku: check each row, column, and 3×3 box for duplicates',
  });

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val === '.') continue;

      const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);

      // Check row
      if (rowSets[r].has(val)) {
        // Find conflict cell
        const conflictCol = board[r].findIndex((v, ci) => ci !== c && v === val);
        steps.push({
          type: 'conflict',
          board,
          currentRow: r, currentCol: c, currentValue: val,
          rowSets: rowSets.map(s => new Set(s)),
          colSets: colSets.map(s => new Set(s)),
          boxSets: boxSets.map(s => new Set(s)),
          highlightCells: [[r, c]],
          conflictCells: [[r, conflictCol]],
          checkType: 'row',
          isValid: false,
          description: `CONFLICT! '${val}' already in row ${r} → NOT valid`,
        });
        return steps;
      }

      // Check col
      if (colSets[c].has(val)) {
        const conflictRow = board.findIndex((row, ri) => ri !== r && row[c] === val);
        steps.push({
          type: 'conflict',
          board,
          currentRow: r, currentCol: c, currentValue: val,
          rowSets: rowSets.map(s => new Set(s)),
          colSets: colSets.map(s => new Set(s)),
          boxSets: boxSets.map(s => new Set(s)),
          highlightCells: [[r, c]],
          conflictCells: [[conflictRow, c]],
          checkType: 'col',
          isValid: false,
          description: `CONFLICT! '${val}' already in col ${c} → NOT valid`,
        });
        return steps;
      }

      // Check box
      if (boxSets[boxIdx].has(val)) {
        steps.push({
          type: 'conflict',
          board,
          currentRow: r, currentCol: c, currentValue: val,
          rowSets: rowSets.map(s => new Set(s)),
          colSets: colSets.map(s => new Set(s)),
          boxSets: boxSets.map(s => new Set(s)),
          highlightCells: [[r, c]],
          conflictCells: [],
          checkType: 'box',
          isValid: false,
          description: `CONFLICT! '${val}' already in box ${boxIdx} → NOT valid`,
        });
        return steps;
      }

      // Add to all sets
      rowSets[r].add(val);
      colSets[c].add(val);
      boxSets[boxIdx].add(val);

      // Only add a step for every couple of cells to keep step count manageable
      if ((r * 9 + c) % 3 === 0 || r === 8) {
        steps.push({
          type: 'check-row',
          board,
          currentRow: r, currentCol: c, currentValue: val,
          rowSets: rowSets.map(s => new Set(s)),
          colSets: colSets.map(s => new Set(s)),
          boxSets: boxSets.map(s => new Set(s)),
          highlightCells: [[r, c]],
          conflictCells: [],
          checkType: 'row',
          isValid: null,
          description: `Check '${val}' at (${r},${c}): row ${r} ✓, col ${c} ✓, box ${boxIdx} ✓ — no conflict`,
        });
      }
    }
  }

  steps.push({
    type: 'done',
    board,
    currentRow: -1, currentCol: -1, currentValue: '',
    rowSets: rowSets.map(s => new Set(s)),
    colSets: colSets.map(s => new Set(s)),
    boxSets: boxSets.map(s => new Set(s)),
    highlightCells: [],
    conflictCells: [],
    checkType: null,
    isValid: true,
    description: 'All cells checked — Sudoku is VALID ✓',
  });

  return steps;
}

export function ValidSudokuVisualizer() {
  const [board, setBoard] = useState<string[][]>(SAMPLE_BOARD);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(board);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [board]);

  useEffect(() => { initializeSteps(); }, []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 800 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const isHighlighted = (r: number, c: number) =>
    step?.highlightCells.some(([hr, hc]) => hr === r && hc === c) || false;
  const isConflict = (r: number, c: number) =>
    step?.conflictCells.some(([cr, cc]) => cr === r && cc === c) || false;
  const isCurrentRow = (r: number) => step?.currentRow === r;
  const isCurrentCol = (c: number) => step?.currentCol === c;
  const isCurrentBox = (r: number, c: number) => {
    if (step?.currentRow === undefined || step?.currentRow < 0) return false;
    const boxR = Math.floor(step.currentRow / 3);
    const boxC = Math.floor(step.currentCol / 3);
    return Math.floor(r / 3) === boxR && Math.floor(c / 3) === boxC;
  };
  const isProcessed = (r: number, c: number) => {
    if (!step || step.currentRow < 0) return false;
    return r < step.currentRow || (r === step.currentRow && c <= step.currentCol);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Valid Sudoku</h1>
        <p className="text-slate-400">
          Use three sets of HashSets: one per row, one per column, one per 3×3 box.
          For each number, check all three sets for duplicates.
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <button onClick={() => { setBoard(SAMPLE_BOARD); const s = generateSteps(SAMPLE_BOARD); setSteps(s); setCurrentStep(0); setIsPlaying(false); }}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">Valid Board</button>
        <button onClick={() => { setBoard(INVALID_BOARD); const s = generateSteps(INVALID_BOARD); setSteps(s); setCurrentStep(0); setIsPlaying(false); }}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">Invalid Board (dup 8)</button>
      </div>

      {/* Sudoku Board */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Sudoku Board</h3>
        <div className="flex justify-center">
          <div className="grid grid-cols-9 gap-0 border-2 border-slate-400">
            {board.map((row, r) =>
              row.map((val, c) => {
                const highlighted = isHighlighted(r, c);
                const conflict = isConflict(r, c);
                const inRow = isCurrentRow(r) && !highlighted && !conflict;
                const inCol = isCurrentCol(c) && !highlighted && !conflict;
                const inBox = isCurrentBox(r, c) && !highlighted && !conflict;
                const processed = isProcessed(r, c) && !highlighted && !conflict;

                const borderRight = c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-slate-400' : 'border-r border-r-slate-700';
                const borderBottom = r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-slate-400' : 'border-b border-b-slate-700';

                return (
                  <motion.div key={`${r}-${c}`}
                    animate={{ scale: highlighted ? 1.1 : 1 }}
                    className={`w-10 h-10 flex items-center justify-center font-bold text-sm ${borderRight} ${borderBottom} ${
                      conflict ? 'bg-red-500 text-white' :
                      highlighted ? 'bg-yellow-500 text-black' :
                      inRow || inCol || inBox ? 'bg-blue-500/20' :
                      processed ? 'bg-slate-700/30' :
                      'bg-slate-900'
                    }`}>
                    {val !== '.' ? val : ''}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
        <div className="mt-3 flex gap-4 justify-center text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> Current cell</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500/40 inline-block" /> Same row/col/box</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Conflict!</span>
        </div>
      </div>

      {/* Tracking Sets */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className={`text-sm font-semibold mb-2 ${step?.checkType === 'row' ? 'text-yellow-400' : 'text-slate-400'}`}>
            Row Sets
          </h3>
          <div className="space-y-1 text-xs font-mono">
            {step?.rowSets.map((s, i) => s.size > 0 && (
              <div key={i} className={`${step.currentRow === i ? 'text-yellow-400' : 'text-slate-400'}`}>
                R{i}: {'{'}{[...s].join(',')}{'}'}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className={`text-sm font-semibold mb-2 ${step?.checkType === 'col' ? 'text-yellow-400' : 'text-slate-400'}`}>
            Col Sets
          </h3>
          <div className="space-y-1 text-xs font-mono">
            {step?.colSets.map((s, i) => s.size > 0 && (
              <div key={i} className={`${step.currentCol === i ? 'text-yellow-400' : 'text-slate-400'}`}>
                C{i}: {'{'}{[...s].join(',')}{'}'}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className={`text-sm font-semibold mb-2 ${step?.checkType === 'box' ? 'text-yellow-400' : 'text-slate-400'}`}>
            Box Sets
          </h3>
          <div className="space-y-1 text-xs font-mono">
            {step?.boxSets.map((s, i) => s.size > 0 && (
              <div key={i} className="text-slate-400">
                B{i}: {'{'}{[...s].join(',')}{'}'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Key trick:</strong> Map each cell to its 3×3 box using <code className="text-blue-400">(row/3)*3 + col/3</code>. 
          Use 27 HashSets (9 rows + 9 cols + 9 boxes) for O(1) duplicate checking. 
          Single pass through the board: O(81) = O(1) since board is fixed size.
          This is a pure hash set problem disguised as a 2D array problem.
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.isValid === true ? 'bg-green-500' :
            step?.isValid === false ? 'bg-red-500' :
            'bg-yellow-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready'}</span>
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

      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public boolean isValidSudoku(char[][] board) {
    Set<Character>[] rows = new HashSet[9];
    Set<Character>[] cols = new HashSet[9];
    Set<Character>[] boxes = new HashSet[9];
    
    for (int i = 0; i < 9; i++) {
        rows[i] = new HashSet<>();
        cols[i] = new HashSet<>();
        boxes[i] = new HashSet<>();
    }
    
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            char val = board[r][c];
            if (val == '.') continue;
            
            int boxIdx = (r / 3) * 3 + (c / 3);
            
            if (rows[r].contains(val) || 
                cols[c].contains(val) || 
                boxes[boxIdx].contains(val)) {
                return false;
            }
            
            rows[r].add(val);
            cols[c].add(val);
            boxes[boxIdx].add(val);
        }
    }
    return true;
}
// Time: O(81) = O(1)  |  Space: O(81) = O(1)`}
        </pre>
      </div>
    </div>
  );
}
