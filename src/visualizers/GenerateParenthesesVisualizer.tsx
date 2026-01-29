import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'try-open' | 'add-open' | 'try-close' | 'add-close' | 'complete' | 'prune-open' | 'prune-close' | 'backtrack';
  path: string;
  open: number;
  close: number;
  n: number;
  solutions: string[];
  treeDepth: number;
  description: string;
  isValidPath?: boolean;
  isPruned?: boolean;
}

interface TreeNode {
  id: string;
  path: string;
  open: number;
  close: number;
  level: number;
  x: number;
  y: number;
  status: 'exploring' | 'complete' | 'pruned' | 'backtracked';
}

function generateSteps(n: number): Step[] {
  const steps: Step[] = [];
  const solutions: string[] = [];
  
  steps.push({
    type: 'start',
    path: '',
    open: 0,
    close: 0,
    n,
    solutions: [],
    treeDepth: 0,
    description: `Generate all valid combinations of ${n} pairs of parentheses`,
  });
  
  function backtrack(path: string, open: number, close: number, depth: number) {
    if (path.length === 2 * n) {
      solutions.push(path);
      steps.push({
        type: 'complete',
        path,
        open,
        close,
        n,
        solutions: [...solutions],
        treeDepth: depth,
        description: `Found valid combination: "${path}"`,
        isValidPath: true,
      });
      return;
    }
    
    // Try adding '(' if we haven't reached the limit
    if (open < n) {
      steps.push({
        type: 'try-open',
        path,
        open,
        close,
        n,
        solutions: [...solutions],
        treeDepth: depth,
        description: `Try adding '(' (open=${open}, need ${n} total)`,
      });
      
      const newPath = path + '(';
      steps.push({
        type: 'add-open',
        path: newPath,
        open: open + 1,
        close,
        n,
        solutions: [...solutions],
        treeDepth: depth + 1,
        description: `Added '(' → "${newPath}" (open=${open + 1}, close=${close})`,
      });
      
      backtrack(newPath, open + 1, close, depth + 1);
      
      steps.push({
        type: 'backtrack',
        path,
        open,
        close,
        n,
        solutions: [...solutions],
        treeDepth: depth,
        description: `Backtrack from "${newPath}"`,
      });
    } else {
      steps.push({
        type: 'prune-open',
        path,
        open,
        close,
        n,
        solutions: [...solutions],
        treeDepth: depth,
        description: `Cannot add '(' (already have ${open} opens, max is ${n})`,
        isPruned: true,
      });
    }
    
    // Try adding ')' if it would create a valid substring
    if (close < open) {
      steps.push({
        type: 'try-close',
        path,
        open,
        close,
        n,
        solutions: [...solutions],
        treeDepth: depth,
        description: `Try adding ')' (close=${close}, open=${open})`,
      });
      
      const newPath = path + ')';
      steps.push({
        type: 'add-close',
        path: newPath,
        open,
        close: close + 1,
        n,
        solutions: [...solutions],
        treeDepth: depth + 1,
        description: `Added ')' → "${newPath}" (open=${open}, close=${close + 1})`,
      });
      
      backtrack(newPath, open, close + 1, depth + 1);
      
      steps.push({
        type: 'backtrack',
        path,
        open,
        close,
        n,
        solutions: [...solutions],
        treeDepth: depth,
        description: `Backtrack from "${newPath}"`,
      });
    } else if (close >= open && !(path.length === 2 * n)) {
      steps.push({
        type: 'prune-close',
        path,
        open,
        close,
        n,
        solutions: [...solutions],
        treeDepth: depth,
        description: `Cannot add ')' (close=${close}, open=${open}, would be invalid)`,
        isPruned: true,
      });
    }
  }
  
  backtrack('', 0, 0, 0);
  
  return steps;
}

function generateTreeNodes(steps: Step[], currentStep: number): TreeNode[] {
  const nodes: TreeNode[] = [];
  const positions = new Map<string, { x: number; y: number }>();
  
  // Track unique paths and their positions
  const pathCounts = new Map<number, number>(); // depth -> count of nodes at that depth
  
  for (let i = 0; i <= currentStep && i < steps.length; i++) {
    const step = steps[i];
    const key = `${step.path}-${step.open}-${step.close}`;
    
    if (!positions.has(key) && (step.type === 'add-open' || step.type === 'add-close' || step.type === 'start' || step.type === 'complete')) {
      const depth = step.treeDepth;
      const countAtDepth = pathCounts.get(depth) || 0;
      pathCounts.set(depth, countAtDepth + 1);
      
      const x = (countAtDepth * 120) - ((pathCounts.get(depth)! - 1) * 60);
      const y = depth * 80;
      
      positions.set(key, { x, y });
      
      let status: TreeNode['status'] = 'exploring';
      if (step.type === 'complete') status = 'complete';
      if (step.isValidPath) status = 'complete';
      if (step.isPruned) status = 'pruned';
      
      nodes.push({
        id: key,
        path: step.path,
        open: step.open,
        close: step.close,
        level: depth,
        x,
        y,
        status,
      });
    }
  }
  
  return nodes;
}

export function GenerateParenthesesVisualizer() {
  const [n, setN] = useState(3);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    if (n >= 1 && n <= 4) {
      const newSteps = generateSteps(n);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [n]);
  
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
    }, 800 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  const treeNodes = generateTreeNodes(steps, currentStep);
  
  const getPathCharStyle = (char: string) => {
    if (!currentStepData) return 'bg-slate-700';
    
    if (char === '(') {
      return 'bg-blue-500 text-white'; // Open parenthesis
    } else if (char === ')') {
      return 'bg-green-500 text-white'; // Close parenthesis
    }
    
    return 'bg-slate-700';
  };
  
  const getStepStatusColor = (stepType: Step['type'], isPruned?: boolean, isValid?: boolean) => {
    if (isValid) return 'bg-green-500';
    if (isPruned) return 'bg-red-500';
    
    switch (stepType) {
      case 'try-open':
      case 'try-close':
        return 'bg-yellow-500';
      case 'add-open':
      case 'add-close':
        return 'bg-blue-500';
      case 'complete':
        return 'bg-green-500';
      case 'prune-open':
      case 'prune-close':
        return 'bg-red-500';
      case 'backtrack':
        return 'bg-orange-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Generate Parentheses (Backtracking)</h1>
        <p className="text-slate-400">
          Generate all combinations of well-formed parentheses for n pairs.
          Each combination must have exactly n opening and n closing parentheses.
        </p>
      </div>
      
      <div className="mb-6">
        <label className="text-sm text-slate-400 block mb-1">Number of pairs (n):</label>
        <select
          value={n}
          onChange={(e) => setN(parseInt(e.target.value))}
          onBlur={initializeSteps}
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Current State */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Current Path</h3>
          <div className="flex gap-1 mb-4">
            {currentStepData?.path ? (
              currentStepData.path.split('').map((char, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-10 h-10 rounded flex items-center justify-center font-bold text-lg ${getPathCharStyle(char)}`}
                >
                  {char}
                </motion.div>
              ))
            ) : (
              <span className="text-slate-500 py-2">Empty</span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-slate-700 p-2 rounded">
              <span className="text-slate-400">Open: </span>
              <span className="font-bold text-blue-400">{currentStepData?.open || 0}</span>
              <span className="text-slate-400"> / {currentStepData?.n || n}</span>
            </div>
            <div className="bg-slate-700 p-2 rounded">
              <span className="text-slate-400">Close: </span>
              <span className="font-bold text-green-400">{currentStepData?.close || 0}</span>
              <span className="text-slate-400"> / {currentStepData?.n || n}</span>
            </div>
            <div className="bg-slate-700 p-2 rounded">
              <span className="text-slate-400">Length: </span>
              <span className="font-bold">{currentStepData?.path.length || 0}</span>
              <span className="text-slate-400"> / {2 * (currentStepData?.n || n)}</span>
            </div>
          </div>
        </div>
        
        {/* Rules */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Backtracking Rules</h3>
          <div className="space-y-2 text-sm">
            <div className={`p-2 rounded flex items-center gap-2 ${
              (currentStepData?.open || 0) < (currentStepData?.n || n) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <span className="font-mono">open &lt; n</span>
              <span>→ Can add '('</span>
            </div>
            <div className={`p-2 rounded flex items-center gap-2 ${
              (currentStepData?.close || 0) < (currentStepData?.open || 0) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <span className="font-mono">close &lt; open</span>
              <span>→ Can add ')'</span>
            </div>
            <div className={`p-2 rounded flex items-center gap-2 ${
              (currentStepData?.path.length || 0) === 2 * (currentStepData?.n || n) ? 'bg-green-500/20 text-green-400' : 'bg-slate-700'
            }`}>
              <span className="font-mono">length = 2n</span>
              <span>→ Valid solution!</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Backtracking Tree Visualization */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Backtracking Tree</h3>
        <div className="relative min-h-[300px] overflow-auto">
          <svg width="800" height="400" className="overflow-visible">
            {/* Tree Edges */}
            {treeNodes.map((node, i) => {
              if (node.level === 0) return null;
              
              // Find parent node
              const parentPath = node.path.slice(0, -1);
              const parent = treeNodes.find(p => p.path === parentPath && p.level === node.level - 1);
              if (!parent) return null;
              
              return (
                <motion.line
                  key={`edge-${i}`}
                  x1={parent.x + 400}
                  y1={parent.y + 40}
                  x2={node.x + 400}
                  y2={node.y + 40}
                  stroke="#475569"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              );
            })}
            
            {/* Tree Nodes */}
            {treeNodes.map((node, i) => (
              <g key={node.id} transform={`translate(${node.x + 400}, ${node.y + 20})`}>
                <motion.circle
                  r="20"
                  className={`${
                    node.status === 'complete' ? 'fill-green-500' :
                    node.status === 'pruned' ? 'fill-red-500' :
                    node.status === 'exploring' ? 'fill-yellow-500' :
                    'fill-slate-600'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
                
                {/* Node label */}
                <text
                  x="0"
                  y="-30"
                  className="text-xs fill-slate-300 text-center"
                  textAnchor="middle"
                >
                  {node.path || '""'}
                </text>
                
                {/* Open/Close counts */}
                <text
                  x="0"
                  y="5"
                  className="text-xs fill-white"
                  textAnchor="middle"
                >
                  {node.open},{node.close}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        <div className="flex gap-3 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Current path
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span> Valid solution
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span> Pruned/Invalid
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-600"></span> Backtracked
          </span>
        </div>
      </div>
      
      {/* Valid Solutions */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Valid Solutions ({currentStepData?.solutions.length || 0})
        </h3>
        <div className="flex gap-2 flex-wrap min-h-[40px]">
          <AnimatePresence>
            {currentStepData?.solutions.map((solution, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-2 bg-green-500/20 border border-green-500 rounded-lg font-mono text-green-400"
              >
                "{solution}"
              </motion.div>
            ))}
          </AnimatePresence>
          {(!currentStepData?.solutions.length) && (
            <span className="text-slate-500">None yet</span>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            getStepStatusColor(
              currentStepData?.type || 'start',
              currentStepData?.isPruned,
              currentStepData?.isValidPath
            )
          }`} />
          <span className="text-lg">{currentStepData?.description || 'Ready'}</span>
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
{`public List<String> generateParenthesis(int n) {
    List<String> result = new ArrayList<>();
    backtrack(result, "", 0, 0, n);
    return result;
}

private void backtrack(List<String> result, String path, 
                       int open, int close, int n) {
    if (path.length() == 2 * n) {
        result.add(path);
        return;
    }
    
    // Add opening parenthesis if we haven't reached the limit
    if (open < n) {
        backtrack(result, path + "(", open + 1, close, n);
    }
    
    // Add closing parenthesis if it creates a valid substring
    if (close < open) {
        backtrack(result, path + ")", open, close + 1, n);
    }
}`}
        </pre>
      </div>
    </div>
  );
}