import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface TreeNode {
  val: number;
  left?: TreeNode;
  right?: TreeNode;
  x?: number; // Position for rendering
  y?: number; // Position for rendering
}

interface Step {
  type: 'start' | 'enqueue' | 'dequeue' | 'process-level' | 'find-rightmost' | 'add-to-result' | 'done';
  tree: TreeNode | null;
  queue: TreeNode[];
  currentNode: TreeNode | null;
  currentLevel: number;
  result: number[];
  levelNodes: TreeNode[];
  rightmostNode: TreeNode | null;
  processedLevels: Set<number>;
  description: string;
}

// Helper to build tree from array representation
function buildTree(nodes: (number | null)[]): TreeNode | null {
  if (!nodes.length || nodes[0] === null) return null;
  
  const root: TreeNode = { val: nodes[0]! };
  const queue: TreeNode[] = [root];
  let i = 1;
  
  while (queue.length && i < nodes.length) {
    const current = queue.shift()!;
    
    if (i < nodes.length && nodes[i] !== null) {
      current.left = { val: nodes[i]! };
      queue.push(current.left);
    }
    i++;
    
    if (i < nodes.length && nodes[i] !== null) {
      current.right = { val: nodes[i]! };
      queue.push(current.right);
    }
    i++;
  }
  
  return root;
}

// Helper to calculate node positions for rendering
function calculatePositions(root: TreeNode | null): void {
  if (!root) return;
  
  // Simple positioning algorithm
  const levels: TreeNode[][] = [];
  const queue: { node: TreeNode; level: number }[] = [{ node: root, level: 0 }];
  
  while (queue.length) {
    const { node, level } = queue.shift()!;
    
    if (!levels[level]) levels[level] = [];
    levels[level].push(node);
    
    if (node.left) queue.push({ node: node.left, level: level + 1 });
    if (node.right) queue.push({ node: node.right, level: level + 1 });
  }
  
  // Calculate positions
  levels.forEach((levelNodes, level) => {
    levelNodes.forEach((node, index) => {
      node.x = (index + 1) * (800 / (levelNodes.length + 1));
      node.y = level * 80 + 50;
    });
  });
}

function generateSteps(treeArray: (number | null)[]): Step[] {
  const steps: Step[] = [];
  const root = buildTree(treeArray);
  
  if (!root) {
    steps.push({
      type: 'done',
      tree: null,
      queue: [],
      currentNode: null,
      currentLevel: 0,
      result: [],
      levelNodes: [],
      rightmostNode: null,
      processedLevels: new Set(),
      description: 'Empty tree - return empty result',
    });
    return steps;
  }
  
  calculatePositions(root);
  
  steps.push({
    type: 'start',
    tree: root,
    queue: [],
    currentNode: null,
    currentLevel: 0,
    result: [],
    levelNodes: [],
    rightmostNode: null,
    processedLevels: new Set(),
    description: 'Initialize BFS to find rightmost node at each level',
  });
  
  const queue: TreeNode[] = [root];
  const result: number[] = [];
  let currentLevel = 0;
  const processedLevels = new Set<number>();
  
  steps.push({
    type: 'enqueue',
    tree: root,
    queue: [...queue],
    currentNode: null,
    currentLevel,
    result: [...result],
    levelNodes: [],
    rightmostNode: null,
    processedLevels: new Set(processedLevels),
    description: 'Add root to queue to start BFS traversal',
  });
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevelNodes: TreeNode[] = [];
    
    steps.push({
      type: 'process-level',
      tree: root,
      queue: [...queue],
      currentNode: null,
      currentLevel,
      result: [...result],
      levelNodes: [...queue.slice(0, levelSize)],
      rightmostNode: null,
      processedLevels: new Set(processedLevels),
      description: `Process level ${currentLevel}: ${levelSize} node(s) - find the rightmost one`,
    });
    
    let rightmostNode: TreeNode | null = null;
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevelNodes.push(node);
      
      // The last node in the level (rightmost)
      if (i === levelSize - 1) {
        rightmostNode = node;
      }
      
      steps.push({
        type: 'dequeue',
        tree: root,
        queue: [...queue],
        currentNode: node,
        currentLevel,
        result: [...result],
        levelNodes: currentLevelNodes,
        rightmostNode: i === levelSize - 1 ? node : null,
        processedLevels: new Set(processedLevels),
        description: `Process node ${node.val}${i === levelSize - 1 ? ' (rightmost in this level!)' : ''}`,
      });
      
      // Add children to queue for next level
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
    
    // Highlight the rightmost node discovery
    steps.push({
      type: 'find-rightmost',
      tree: root,
      queue: [...queue],
      currentNode: null,
      currentLevel,
      result: [...result],
      levelNodes: currentLevelNodes,
      rightmostNode,
      processedLevels: new Set(processedLevels),
      description: `Found rightmost node at level ${currentLevel}: ${rightmostNode?.val}`,
    });
    
    // Add rightmost to result
    if (rightmostNode) {
      result.push(rightmostNode.val);
      processedLevels.add(currentLevel);
      
      steps.push({
        type: 'add-to-result',
        tree: root,
        queue: [...queue],
        currentNode: null,
        currentLevel,
        result: [...result],
        levelNodes: currentLevelNodes,
        rightmostNode,
        processedLevels: new Set(processedLevels),
        description: `Add ${rightmostNode.val} to right side view result`,
      });
    }
    
    currentLevel++;
  }
  
  steps.push({
    type: 'done',
    tree: root,
    queue: [],
    currentNode: null,
    currentLevel: currentLevel - 1,
    result: [...result],
    levelNodes: [],
    rightmostNode: null,
    processedLevels: new Set(processedLevels),
    description: `Right side view complete! Result: [${result.join(', ')}]`,
  });
  
  return steps;
}

const PRESETS = [
  { label: 'Example 1', nodes: [1, 2, 3, null, 5, null, 4] },
  { label: 'Example 2', nodes: [1, null, 3] },
  { label: 'Example 3', nodes: [1] },
  { label: 'Full Tree', nodes: [1, 2, 3, 4, 5, 6, 7] },
  { label: 'Right Skewed', nodes: [1, null, 2, null, 3, null, 4] },
  { label: 'Left Skewed', nodes: [1, 2, null, 3, null, 4] },
];

export function BinaryTreeRightSideViewVisualizer() {
  const [treeArray, setTreeArray] = useState<(number | null)[]>([1, 2, 3, null, 5, null, 4]);
  const [inputValue, setInputValue] = useState('1, 2, 3, null, 5, null, 4');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(treeArray);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [treeArray]);

  useEffect(() => { initializeSteps(); }, [initializeSteps]);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1500 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setTreeArray(preset.nodes);
    setInputValue(preset.nodes.map(n => n === null ? 'null' : n.toString()).join(', '));
    const newSteps = generateSteps(preset.nodes);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed = inputValue.split(',').map(s => {
      const trimmed = s.trim();
      return trimmed === 'null' ? null : parseInt(trimmed);
    }).filter(n => n !== undefined);
    
    setTreeArray(parsed);
    const newSteps = generateSteps(parsed);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const getNodeColor = (node: TreeNode) => {
    const isInQueue = step?.queue.includes(node) || false;
    const isCurrentNode = step?.currentNode === node;
    const isInLevel = step?.levelNodes.includes(node) || false;
    const isRightmost = step?.rightmostNode === node;
    const nodeLevel = getNodeLevel(step?.tree, node);
    const isInProcessedLevel = step?.processedLevels.has(nodeLevel) || false;
    
    if (isRightmost) return '#f59e0b'; // Amber - rightmost node
    if (isCurrentNode) return '#facc15'; // Yellow - currently processing
    if (isInLevel && !isInProcessedLevel) return '#06d6a0'; // Green - current level
    if (isInProcessedLevel) return '#8b5cf6'; // Purple - processed level
    if (isInQueue) return '#3b82f6'; // Blue - in queue
    return '#475569'; // Gray - unprocessed
  };

  const getNodeStrokeColor = (node: TreeNode) => {
    const isRightmost = step?.rightmostNode === node;
    const isCurrentNode = step?.currentNode === node;
    
    if (isRightmost) return '#d97706';
    if (isCurrentNode) return '#eab308';
    return '#64748b';
  };

  const getNodeLevel = (tree: TreeNode | null, target: TreeNode): number => {
    if (!tree) return -1;
    
    const queue: { node: TreeNode; level: number }[] = [{ node: tree, level: 0 }];
    
    while (queue.length) {
      const { node, level } = queue.shift()!;
      
      if (node === target) return level;
      
      if (node.left) queue.push({ node: node.left, level: level + 1 });
      if (node.right) queue.push({ node: node.right, level: level + 1 });
    }
    
    return -1;
  };

  const renderNode = (node: TreeNode) => {
    const isRightmost = step?.rightmostNode === node;
    const isCurrentNode = step?.currentNode === node;
    
    return (
      <g key={`node-${node.val}-${node.x}-${node.y}`}>
        <motion.circle
          cx={node.x}
          cy={node.y}
          r="20"
          fill={getNodeColor(node)}
          stroke={getNodeStrokeColor(node)}
          strokeWidth="2"
          animate={{
            scale: isRightmost ? 1.3 : (isCurrentNode ? 1.2 : 1),
          }}
        />
        {isRightmost && (
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="28"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="4 4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          />
        )}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-sm font-bold fill-white"
        >
          {node.val}
        </text>
      </g>
    );
  };

  const renderEdge = (from: TreeNode, to: TreeNode) => {
    return (
      <line
        key={`edge-${from.val}-${to.val}`}
        x1={from.x}
        y1={from.y! + 20}
        x2={to.x}
        y2={to.y! - 20}
        stroke="#64748b"
        strokeWidth="2"
      />
    );
  };

  const renderTree = (root: TreeNode | null): React.ReactElement[] => {
    if (!root) return [];
    
    const elements: React.ReactElement[] = [];
    const queue: TreeNode[] = [root];
    
    // Render edges first (so they appear behind nodes)
    while (queue.length) {
      const node = queue.shift()!;
      
      if (node.left) {
        elements.push(renderEdge(node, node.left));
        queue.push(node.left);
      }
      if (node.right) {
        elements.push(renderEdge(node, node.right));
        queue.push(node.right);
      }
    }
    
    // Then render nodes
    const nodeQueue: TreeNode[] = [root];
    while (nodeQueue.length) {
      const node = nodeQueue.shift()!;
      elements.push(renderNode(node));
      
      if (node.left) nodeQueue.push(node.left);
      if (node.right) nodeQueue.push(node.right);
    }
    
    return elements;
  };

  // Render the "view from right" visualization
  const renderRightSideView = () => {
    if (!step?.tree) return null;
    
    const viewHeight = 300;
    const nodeRadius = 20;
    const spacing = 60;
    
    return (
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          View from Right Side 👁️
        </h3>
        <div className="flex justify-center">
          <svg width="300" height={viewHeight} className="overflow-visible">
            {step.result.map((val, index) => {
              const y = index * spacing + 40;
              const isNewlyAdded = step.type === 'add-to-result' && index === step.result.length - 1;
              
              return (
                <g key={`view-${val}-${index}`}>
                  <motion.circle
                    cx={50}
                    cy={y}
                    r={nodeRadius}
                    fill={isNewlyAdded ? '#f59e0b' : '#8b5cf6'}
                    stroke={isNewlyAdded ? '#d97706' : '#7c3aed'}
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                  <text
                    x={50}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-sm font-bold fill-white"
                  >
                    {val}
                  </text>
                  <text
                    x={90}
                    y={y}
                    dominantBaseline="central"
                    className="text-xs text-slate-400 fill-current"
                  >
                    Level {index}
                  </text>
                </g>
              );
            })}
            
            {/* Eye icon to show "view" */}
            <g transform={`translate(150, ${Math.max(40, (step.result.length - 1) * spacing / 2 + 40)})`}>
              <circle cx="0" cy="0" r="15" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
              <circle cx="0" cy="0" r="6" fill="#3b82f6"/>
              <circle cx="2" cy="-2" r="2" fill="#60a5fa"/>
            </g>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Binary Tree Right Side View</h1>
        <p className="text-slate-400">
          Use BFS (Breadth-First Search) to traverse level by level, collecting the rightmost node 
          at each level. This simulates viewing the tree from the right side.
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((preset, i) => (
          <button key={i} onClick={() => handlePreset(preset)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            {preset.label}
          </button>
        ))}
      </div>
      <div className="mb-6 flex gap-3 items-center flex-wrap">
        <label className="text-sm text-slate-400">Tree (level-order):</label>
        <input value={inputValue} onChange={e => setInputValue(e.target.value)}
          placeholder="1, 2, 3, null, 5, null, 4"
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono flex-1 min-w-[300px]" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Tree Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Binary Tree</h3>
        <div className="flex justify-center">
          {step?.tree ? (
            <svg width="800" height="400" className="overflow-visible">
              {renderTree(step.tree)}
            </svg>
          ) : (
            <div className="py-20 text-center text-slate-500">
              Empty tree
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex gap-6 justify-center mt-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
            <span className="text-slate-400">Unprocessed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">In Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-slate-400">Current Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-slate-400">Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-600 border-dashed"></div>
            <span className="text-slate-400">Rightmost (Visible)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-slate-400">Processed Level</span>
          </div>
        </div>
      </div>

      {/* Right Side View */}
      {renderRightSideView()}

      {/* Queue Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          Queue State <span className="text-blue-400">(Front → Back)</span>
        </h3>
        <div className="flex gap-2 justify-center min-h-[60px] items-center">
          {step && step.queue.length === 0 && (
            <span className="text-slate-500 italic">Empty</span>
          )}
          {step && step.queue.map((node, index) => (
            <motion.div
              key={`queue-${node.val}-${index}`}
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg ${
                index === 0 ? 'bg-yellow-500 text-black ring-2 ring-yellow-300' :
                'bg-blue-500 text-white'
              }`}
            >
              {node.val}
            </motion.div>
          ))}
        </div>
        {step && step.queue.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-2">
            Next to process: {step.queue[0]?.val}
          </p>
        )}
      </div>

      {/* Result Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          Right Side View Result
        </h3>
        <div className="flex gap-2 justify-center min-h-[60px] items-center">
          {step && step.result.length === 0 && (
            <span className="text-slate-500 italic">No nodes in result yet</span>
          )}
          {step && step.result.map((val, index) => {
            const isNewlyAdded = step.type === 'add-to-result' && index === step.result.length - 1;
            return (
              <motion.div
                key={`result-${val}-${index}`}
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg ${
                  isNewlyAdded ? 'bg-orange-500 text-white ring-2 ring-orange-300' :
                  'bg-purple-500 text-white'
                }`}
              >
                {val}
              </motion.div>
            );
          })}
        </div>
        {step && step.result.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-2">
            Array: [{step.result.join(', ')}]
          </p>
        )}
      </div>

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Key Pattern:</strong> BFS level-by-level processing where we only care about the 
          last node in each level. Track level sizes to know when we've reached the rightmost node. 
          Alternative: DFS with level tracking (root-right-left order). This pattern appears in 
          "view" problems at FAANG companies.
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'find-rightmost' || step?.type === 'add-to-result' ? 'bg-orange-500' :
            step?.type === 'process-level' || step?.type === 'dequeue' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready'}</span>
        </div>
        {step && step.currentLevel >= 0 && (
          <div className="mt-2 text-sm text-slate-400">
            Current Level: {step.currentLevel}
            {step.rightmostNode && (
              <span className="ml-4">Rightmost: {step.rightmostNode.val}</span>
            )}
          </div>
        )}
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
{`public List<Integer> rightSideView(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        int levelSize = queue.size();  // Current level's node count
        
        // Process all nodes in current level
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            
            // If this is the rightmost node (last in level)
            if (i == levelSize - 1) {
                result.add(node.val);  // Add to right side view
            }
            
            // Add children for next level (left first, then right)
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    
    return result;
}
// Time: O(n) - visit each node once  |  Space: O(w) - max width of tree`}
        </pre>
      </div>
    </div>
  );
}