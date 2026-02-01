import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'traverse' | 'turn' | 'done';
  matrix: number[][];
  currentRow: number;
  currentCol: number;
  direction: 'right' | 'down' | 'left' | 'up';
  result: number[];
  visited: boolean[][];
  bounds: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  description: string;
}

function generateSteps(matrix: number[][]): Step[] {
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) return [];
  
  const steps: Step[] = [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[] = [];
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
  let row = 0, col = 0;
  let direction: 'right' | 'down' | 'left' | 'up' = 'right';

  steps.push({
    type: 'start',
    matrix,
    currentRow: 0,
    currentCol: 0,
    direction: 'right',
    result: [],
    visited: visited.map(row => [...row]),
    bounds: { top, bottom, left, right },
    description: `Start spiral traversal from top-left (0,0) moving right. Bounds: top=${top}, bottom=${bottom}, left=${left}, right=${right}`,
  });

  while (top <= bottom && left <= right) {
    // Traverse right
    if (direction === 'right') {
      for (col = left; col <= right; col++) {
        visited[row][col] = true;
        result.push(matrix[row][col]);
        
        steps.push({
          type: col === right ? 'turn' : 'traverse',
          matrix,
          currentRow: row,
          currentCol: col,
          direction,
          result: [...result],
          visited: visited.map(r => [...r]),
          bounds: { top, bottom, left, right },
          description: col === right 
            ? `Reached right boundary at (${row},${col}) = ${matrix[row][col]}. Turn down and shrink top boundary to ${top + 1}`
            : `Move right to (${row},${col}) = ${matrix[row][col]}`,
        });
      }
      top++;
      direction = 'down';
      row = top;
      col = right;
    }
    // Traverse down
    else if (direction === 'down') {
      for (row = top; row <= bottom; row++) {
        if (!visited[row][col]) {
          visited[row][col] = true;
          result.push(matrix[row][col]);
          
          steps.push({
            type: row === bottom ? 'turn' : 'traverse',
            matrix,
            currentRow: row,
            currentCol: col,
            direction,
            result: [...result],
            visited: visited.map(r => [...r]),
            bounds: { top, bottom, left, right },
            description: row === bottom 
              ? `Reached bottom boundary at (${row},${col}) = ${matrix[row][col]}. Turn left and shrink right boundary to ${right - 1}`
              : `Move down to (${row},${col}) = ${matrix[row][col]}`,
          });
        }
      }
      right--;
      direction = 'left';
      row = bottom;
      col = right;
    }
    // Traverse left
    else if (direction === 'left') {
      for (col = right; col >= left; col--) {
        if (!visited[row][col]) {
          visited[row][col] = true;
          result.push(matrix[row][col]);
          
          steps.push({
            type: col === left ? 'turn' : 'traverse',
            matrix,
            currentRow: row,
            currentCol: col,
            direction,
            result: [...result],
            visited: visited.map(r => [...r]),
            bounds: { top, bottom, left, right },
            description: col === left 
              ? `Reached left boundary at (${row},${col}) = ${matrix[row][col]}. Turn up and shrink bottom boundary to ${bottom - 1}`
              : `Move left to (${row},${col}) = ${matrix[row][col]}`,
          });
        }
      }
      bottom--;
      direction = 'up';
      row = bottom;
      col = left;
    }
    // Traverse up
    else if (direction === 'up') {
      for (row = bottom; row >= top; row--) {
        if (!visited[row][col]) {
          visited[row][col] = true;
          result.push(matrix[row][col]);
          
          steps.push({
            type: row === top ? 'turn' : 'traverse',
            matrix,
            currentRow: row,
            currentCol: col,
            direction,
            result: [...result],
            visited: visited.map(r => [...r]),
            bounds: { top, bottom, left, right },
            description: row === top 
              ? `Reached top boundary at (${row},${col}) = ${matrix[row][col]}. Turn right and shrink left boundary to ${left + 1}`
              : `Move up to (${row},${col}) = ${matrix[row][col]}`,
          });
        }
      }
      left++;
      direction = 'right';
      row = top;
      col = left;
    }
  }

  if (steps.length > 1) {
    steps.push({
      type: 'done',
      matrix,
      currentRow: -1,
      currentCol: -1,
      direction: 'right',
      result: [...result],
      visited: visited.map(r => [...r]),
      bounds: { top, bottom, left, right },
      description: `Spiral traversal complete! Result: [${result.join(', ')}]`,
    });
  }

  return steps;
}

const PRESETS = [
  { 
    label: '3×3 Matrix', 
    value: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ] 
  },
  { 
    label: '3×4 Matrix', 
    value: [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12]
    ] 
  },
  { 
    label: '4×3 Matrix', 
    value: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12]
    ] 
  },
  { 
    label: '1×4 Matrix', 
    value: [
      [1, 2, 3, 4]
    ] 
  },
  { 
    label: '4×1 Matrix', 
    value: [
      [1],
      [2],
      [3],
      [4]
    ] 
  },
];

function DirectionArrow({ direction }: { direction: string }) {
  const arrows = {
    right: '→',
    down: '↓',
    left: '←',
    up: '↑',
  };
  
  const colors = {
    right: 'text-blue-400',
    down: 'text-green-400',
    left: 'text-orange-400',
    up: 'text-purple-400',
  };

  return (
    <span className={`text-2xl font-bold ${colors[direction as keyof typeof colors]}`}>
      {arrows[direction as keyof typeof arrows]}
    </span>
  );
}

export function SpiralMatrixVisualizer() {
  const [matrix, setMatrix] = useState<number[][]>([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]);
  const [inputValue, setInputValue] = useState('[[1,2,3],[4,5,6],[7,8,9]]');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(matrix);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [matrix]);

  useEffect(() => {
    initializeSteps();
  }, []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const handlePreset = (preset: number[][]) => {
    setMatrix(preset);
    setInputValue(JSON.stringify(preset));
    const newSteps = generateSteps(preset);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const parseMatrixInput = (input: string): number[][] | null => {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed) && parsed.every(row => 
        Array.isArray(row) && row.every(cell => typeof cell === 'number')
      )) {
        return parsed;
      }
    } catch {
      // Try simple format like "1 2 3, 4 5 6, 7 8 9"
      try {
        const rows = input.split(',').map(row => 
          row.trim().split(/\s+/).map(cell => parseInt(cell.trim()))
        );
        if (rows.every(row => row.every(cell => !isNaN(cell)))) {
          return rows;
        }
      } catch {}
    }
    return null;
  };

  const handleInputApply = () => {
    const parsed = parseMatrixInput(inputValue);
    if (parsed && parsed.length > 0 && parsed[0].length > 0) {
      setMatrix(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    } else {
      alert('Invalid matrix format. Use JSON like [[1,2,3],[4,5,6]] or simple format like "1 2 3, 4 5 6"');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Spiral Matrix</h1>
        <p className="text-slate-400">
          Traverse a matrix in spiral order: right → down → left → up, shrinking boundaries after each direction.
          Perfect example of boundary manipulation and direction control.
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => handlePreset(p.value)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            {p.label}
          </button>
        ))}
        <div className="flex gap-2 ml-2">
          <input value={inputValue} onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInputApply()}
            className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono w-60"
            placeholder="[[1,2,3],[4,5,6],[7,8,9]]" />
          <button onClick={handleInputApply}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">
            Apply
          </button>
        </div>
      </div>

      {/* Matrix Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-400">Matrix Traversal</h3>
          {step && step.type !== 'start' && step.type !== 'done' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">Direction:</span>
              <DirectionArrow direction={step.direction} />
              <span className="text-sm text-slate-300 capitalize">{step.direction}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="inline-block border-2 border-slate-600 rounded-lg overflow-hidden">
            {step?.matrix.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((val, colIndex) => {
                  const isCurrentPos = step.currentRow === rowIndex && step.currentCol === colIndex;
                  const isVisited = step.visited[rowIndex][colIndex];
                  const isWithinBounds = (
                    rowIndex >= step.bounds.top && 
                    rowIndex <= step.bounds.bottom && 
                    colIndex >= step.bounds.left && 
                    colIndex <= step.bounds.right
                  );

                  return (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-16 h-16 flex items-center justify-center font-bold text-lg border border-slate-600 relative transition-all duration-300 ${
                        isCurrentPos 
                          ? 'bg-yellow-500 text-black ring-2 ring-yellow-300' 
                          : isVisited 
                          ? 'bg-green-500/80 text-white' 
                          : isWithinBounds
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                      animate={{ 
                        scale: isCurrentPos ? 1.1 : 1,
                        rotateZ: isCurrentPos ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {val}
                      {isCurrentPos && (
                        <motion.div
                          className="absolute -top-8"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <DirectionArrow direction={step.direction} />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Current Position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/80 rounded"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/20 border border-blue-500 rounded"></div>
            <span>Within Bounds</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-700 rounded"></div>
            <span>Out of Bounds</span>
          </div>
        </div>
      </div>

      {/* Current Bounds Display */}
      {step && step.type !== 'done' && (
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Boundaries</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-300">Top: </span>
              <span className="font-mono text-blue-400">{step.bounds.top}</span>
            </div>
            <div>
              <span className="text-slate-300">Bottom: </span>
              <span className="font-mono text-blue-400">{step.bounds.bottom}</span>
            </div>
            <div>
              <span className="text-slate-300">Left: </span>
              <span className="font-mono text-blue-400">{step.bounds.left}</span>
            </div>
            <div>
              <span className="text-slate-300">Right: </span>
              <span className="font-mono text-blue-400">{step.bounds.right}</span>
            </div>
          </div>
        </div>
      )}

      {/* Result Array */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          Result Array <span className="text-slate-500">({step ? step.result.length : 0} elements)</span>
        </h3>
        <div className="flex gap-2 flex-wrap justify-center min-h-[60px] items-center">
          {step && step.result.length === 0 && (
            <span className="text-slate-500 italic">Empty</span>
          )}
          <AnimatePresence>
            {step?.result.map((val, index) => (
              <motion.div
                key={`${val}-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="w-12 h-12 rounded-lg flex items-center justify-center font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
              >
                {val}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Algorithm Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Key pattern:</strong> Spiral traversal uses 4 boundaries (top, bottom, left, right) and 4 directions. 
          After completing each side, shrink the corresponding boundary and turn to the next direction. 
          This pattern appears in many matrix problems — always think about boundary management!
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'turn' ? 'bg-orange-500' :
            step?.type === 'traverse' ? 'bg-blue-500' :
            'bg-purple-500'
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

      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public List<Integer> spiralOrder(int[][] matrix) {
    List<Integer> result = new ArrayList<>();
    if (matrix.length == 0) return result;
    
    int top = 0, bottom = matrix.length - 1;
    int left = 0, right = matrix[0].length - 1;
    
    while (top <= bottom && left <= right) {
        // Traverse right
        for (int col = left; col <= right; col++) {
            result.add(matrix[top][col]);
        }
        top++;
        
        // Traverse down  
        for (int row = top; row <= bottom; row++) {
            result.add(matrix[row][right]);
        }
        right--;
        
        // Traverse left (if we still have rows)
        if (top <= bottom) {
            for (int col = right; col >= left; col--) {
                result.add(matrix[bottom][col]);
            }
            bottom--;
        }
        
        // Traverse up (if we still have columns)
        if (left <= right) {
            for (int row = bottom; row >= top; row--) {
                result.add(matrix[row][left]);
            }
            left++;
        }
    }
    
    return result;
}
// Time: O(m×n)  |  Space: O(1) excluding result`}
        </pre>
      </div>
    </div>
  );
}