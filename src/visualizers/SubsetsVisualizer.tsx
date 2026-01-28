import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface TreeNode {
  id: string;
  value: number | null;
  included: boolean | null;
  subset: number[];
  children: TreeNode[];
  x: number;
  y: number;
  isLeaf: boolean;
}

interface Step {
  type: 'visit' | 'include' | 'exclude' | 'collect' | 'backtrack';
  nodeId: string;
  path: string[];
  currentSubset: number[];
  collected: number[][];
  description: string;
}

function generateTree(nums: number[]): TreeNode {
  let nodeCounter = 0;
  
  function buildNode(index: number, subset: number[], depth: number, xOffset: number, width: number): TreeNode {
    const id = `node-${nodeCounter++}`;
    const isLeaf = index === nums.length;
    
    const node: TreeNode = {
      id,
      value: index > 0 ? nums[index - 1] : null,
      included: index > 0 ? subset.includes(nums[index - 1]) : null,
      subset: [...subset],
      children: [],
      x: xOffset + width / 2,
      y: depth * 80 + 40,
      isLeaf,
    };
    
    if (!isLeaf) {
      // Exclude branch (left)
      node.children.push(buildNode(index + 1, subset, depth + 1, xOffset, width / 2));
      // Include branch (right)
      node.children.push(buildNode(index + 1, [...subset, nums[index]], depth + 1, xOffset + width / 2, width / 2));
    }
    
    return node;
  }
  
  return buildNode(0, [], 0, 0, 800);
}

function generateSteps(nums: number[]): Step[] {
  const steps: Step[] = [];
  const collected: number[][] = [];
  
  function backtrack(index: number, current: number[], path: string[], nodeId: string) {
    steps.push({
      type: 'visit',
      nodeId,
      path: [...path],
      currentSubset: [...current],
      collected: collected.map(s => [...s]),
      description: index === 0 
        ? 'Start at root' 
        : `Visiting node for nums[${index - 1}] = ${nums[index - 1]}`,
    });
    
    if (index === nums.length) {
      collected.push([...current]);
      steps.push({
        type: 'collect',
        nodeId,
        path: [...path],
        currentSubset: [...current],
        collected: collected.map(s => [...s]),
        description: `Collect subset: [${current.join(', ')}]`,
      });
      return;
    }
    
    // Explore exclude branch
    const excludeNodeId = `node-${parseInt(nodeId.split('-')[1]) * 2 + 1}`;
    steps.push({
      type: 'exclude',
      nodeId: excludeNodeId,
      path: [...path, excludeNodeId],
      currentSubset: [...current],
      collected: collected.map(s => [...s]),
      description: `Exclude ${nums[index]} - don't add to subset`,
    });
    backtrack(index + 1, current, [...path, excludeNodeId], excludeNodeId);
    
    steps.push({
      type: 'backtrack',
      nodeId,
      path: [...path],
      currentSubset: [...current],
      collected: collected.map(s => [...s]),
      description: 'Backtrack - try including instead',
    });
    
    // Explore include branch
    const includeNodeId = `node-${parseInt(nodeId.split('-')[1]) * 2 + 2}`;
    current.push(nums[index]);
    steps.push({
      type: 'include',
      nodeId: includeNodeId,
      path: [...path, includeNodeId],
      currentSubset: [...current],
      collected: collected.map(s => [...s]),
      description: `Include ${nums[index]} - add to subset`,
    });
    backtrack(index + 1, current, [...path, includeNodeId], includeNodeId);
    current.pop();
    
    if (index > 0) {
      steps.push({
        type: 'backtrack',
        nodeId,
        path: [...path],
        currentSubset: [...current],
        collected: collected.map(s => [...s]),
        description: 'Backtrack to parent',
      });
    }
  }
  
  backtrack(0, [], ['node-0'], 'node-0');
  return steps;
}

function flattenTree(node: TreeNode): TreeNode[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

export function SubsetsVisualizer() {
  const [nums, setNums] = useState([1, 2, 3]);
  const [inputValue, setInputValue] = useState('1, 2, 3');
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  useEffect(() => {
    const newTree = generateTree(nums);
    const newSteps = generateSteps(nums);
    setTree(newTree);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [nums]);
  
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
  
  const handleInputChange = useCallback(() => {
    const parsed = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length > 0 && parsed.length <= 4) {
      setNums(parsed);
    }
  }, [inputValue]);
  
  const currentStepData = steps[currentStep];
  const allNodes = tree ? flattenTree(tree) : [];
  
  const getNodeColor = (nodeId: string) => {
    if (!currentStepData) return 'fill-slate-600';
    if (currentStepData.nodeId === nodeId) {
      switch (currentStepData.type) {
        case 'visit': return 'fill-blue-500';
        case 'include': return 'fill-green-500';
        case 'exclude': return 'fill-yellow-500';
        case 'collect': return 'fill-purple-500';
        case 'backtrack': return 'fill-orange-500';
      }
    }
    if (currentStepData.path.includes(nodeId)) return 'fill-blue-400/50';
    return 'fill-slate-600';
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Subsets (Backtracking)</h1>
        <p className="text-slate-400">
          Generate all subsets of an array using backtracking. Watch how we explore 
          include/exclude decisions for each element.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Input array:</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleInputChange()}
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
          placeholder="1, 2, 3"
        />
        <span className="text-xs text-slate-500">(max 4 elements for visibility)</span>
      </div>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Decision Tree */}
        <div className="col-span-2 bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Decision Tree</h3>
          <svg viewBox="0 0 800 400" className="w-full h-80">
            {/* Draw edges first */}
            {allNodes.map(node => 
              node.children.map((child, _i) => (
                <line
                  key={`edge-${node.id}-${child.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={child.x}
                  y2={child.y}
                  className={
                    currentStepData?.path.includes(child.id)
                      ? 'stroke-blue-400 stroke-2'
                      : 'stroke-slate-600'
                  }
                />
              ))
            )}
            
            {/* Draw nodes */}
            {allNodes.map(node => (
              <g key={node.id}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.isLeaf ? 16 : 20}
                  className={`${getNodeColor(node.id)} transition-colors duration-200`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
                {node.isLeaf && (
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    className="fill-white text-xs font-mono"
                  >
                    [{node.subset.join(',')}]
                  </text>
                )}
                {!node.isLeaf && node.value !== null && (
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    className="fill-white text-sm font-bold"
                  >
                    {node.value}
                  </text>
                )}
                {node.value === null && (
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    className="fill-white text-xs"
                  >
                    start
                  </text>
                )}
              </g>
            ))}
          </svg>
          
          <div className="flex gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> Visiting
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span> Include
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Exclude
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span> Collect
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span> Backtrack
            </span>
          </div>
        </div>
        
        {/* State Panel */}
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Subset</h3>
            <div className="font-mono text-lg">
              [{currentStepData?.currentSubset.join(', ') || ''}]
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Collected Subsets</h3>
            <div className="font-mono text-sm space-y-1 max-h-40 overflow-y-auto">
              <AnimatePresence>
                {currentStepData?.collected.map((subset, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-green-400"
                  >
                    [{subset.join(', ')}]
                  </motion.div>
                ))}
              </AnimatePresence>
              {(!currentStepData?.collected.length) && (
                <span className="text-slate-500">None yet</span>
              )}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Action</h3>
            <p className="text-sm">{currentStepData?.description || 'Ready to start'}</p>
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
{`public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int index, List<Integer> current, 
                       List<List<Integer>> result) {
    if (index == nums.length) {
        result.add(new ArrayList<>(current));  // Collect subset
        return;
    }
    
    // Exclude nums[index]
    backtrack(nums, index + 1, current, result);
    
    // Include nums[index]
    current.add(nums[index]);
    backtrack(nums, index + 1, current, result);
    current.remove(current.size() - 1);  // Backtrack
}`}
        </pre>
      </div>
    </div>
  );
}
