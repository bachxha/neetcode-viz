import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  id: string;
  depth?: number;
}

interface Step {
  type: 'start' | 'visit' | 'calculate' | 'return' | 'complete';
  currentNode: string | null;
  calculatingNodes: string[];
  completedNodes: string[];
  tree: TreeNode | null;
  description: string;
  nodeDepths: { [key: string]: number };
  maxDepth: number;
}

function createNode(val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return {
    val,
    left,
    right,
    id: Math.random().toString(36).substr(2, 9)
  };
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    val: node.val,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    id: node.id,
    depth: node.depth
  };
}

function buildSampleTree(): TreeNode {
  // Build tree:       3
  //                 /   \
  //                9     20
  //                     /  \
  //                    15   7
  //                   /
  //                  1
  const root = createNode(3);
  root.left = createNode(9);
  root.right = createNode(20);
  root.right.left = createNode(15);
  root.right.right = createNode(7);
  root.right.left.left = createNode(1);
  return root;
}

function generateSteps(root: TreeNode | null): Step[] {
  if (!root) return [];
  
  const steps: Step[] = [];
  const completedNodes: string[] = [];
  const nodeDepths: { [key: string]: number } = {};
  let maxDepth = 0;
  
  steps.push({
    type: 'start',
    currentNode: null,
    calculatingNodes: [],
    completedNodes: [],
    tree: cloneTree(root),
    description: 'Starting DFS traversal to find maximum depth. We\'ll calculate depth bottom-up.',
    nodeDepths: {},
    maxDepth: 0
  });
  
  function maxDepthHelper(node: TreeNode | null): number {
    if (!node) return 0;
    
    // Visit current node
    steps.push({
      type: 'visit',
      currentNode: node.id,
      calculatingNodes: [],
      completedNodes: [...completedNodes],
      tree: cloneTree(root),
      description: `Visiting node ${node.val}. Will recursively find depth of left and right subtrees.`,
      nodeDepths: { ...nodeDepths },
      maxDepth
    });
    
    // Mark as calculating
    steps.push({
      type: 'calculate',
      currentNode: node.id,
      calculatingNodes: [node.id],
      completedNodes: [...completedNodes],
      tree: cloneTree(root),
      description: `Calculating depth for node ${node.val}. Processing left and right children first.`,
      nodeDepths: { ...nodeDepths },
      maxDepth
    });
    
    // Recursively find depths of left and right subtrees
    const leftDepth = maxDepthHelper(node.left);
    const rightDepth = maxDepthHelper(node.right);
    
    // Calculate current depth
    const currentDepth = Math.max(leftDepth, rightDepth) + 1;
    nodeDepths[node.id] = currentDepth;
    maxDepth = Math.max(maxDepth, currentDepth);
    
    // Mark as completed
    completedNodes.push(node.id);
    
    steps.push({
      type: 'return',
      currentNode: node.id,
      calculatingNodes: [],
      completedNodes: [...completedNodes],
      tree: cloneTree(root),
      description: `Node ${node.val}: max(left=${leftDepth}, right=${rightDepth}) + 1 = ${currentDepth}. Returning ${currentDepth}.`,
      nodeDepths: { ...nodeDepths },
      maxDepth
    });
    
    return currentDepth;
  }
  
  maxDepthHelper(root);
  
  steps.push({
    type: 'complete',
    currentNode: null,
    calculatingNodes: [],
    completedNodes: [...completedNodes],
    tree: cloneTree(root),
    description: `Complete! The maximum depth of the binary tree is ${maxDepth}.`,
    nodeDepths: { ...nodeDepths },
    maxDepth
  });
  
  return steps;
}

interface TreeVisualizationProps {
  tree: TreeNode | null;
  currentNode: string | null;
  calculatingNodes: string[];
  completedNodes: string[];
  nodeDepths: { [key: string]: number };
  maxDepth: number;
}

function TreeVisualization({ 
  tree, 
  currentNode, 
  calculatingNodes, 
  completedNodes, 
  nodeDepths, 
  maxDepth 
}: TreeVisualizationProps) {
  if (!tree) return null;
  
  const renderNode = (node: TreeNode | null, x: number, y: number, level: number): React.ReactElement[] => {
    if (!node) return [];
    
    const elements: React.ReactElement[] = [];
    const nodeRadius = 30;
    const levelSpacing = 80;
    const horizontalSpacing = Math.max(100, 180 / (level + 1));
    
    // Determine node color based on state
    let nodeColor = 'bg-slate-700 border-slate-500';
    let textColor = 'text-white';
    
    if (currentNode === node.id) {
      nodeColor = 'bg-yellow-500 border-yellow-400';
      textColor = 'text-black';
    } else if (calculatingNodes.includes(node.id)) {
      nodeColor = 'bg-blue-500 border-blue-400';
      textColor = 'text-white';
    } else if (completedNodes.includes(node.id)) {
      const depth = nodeDepths[node.id];
      if (depth === maxDepth) {
        nodeColor = 'bg-green-500 border-green-400';
      } else {
        nodeColor = 'bg-purple-500 border-purple-400';
      }
      textColor = 'text-white';
    }
    
    // Draw edges to children
    if (node.left) {
      const leftX = x - horizontalSpacing;
      const leftY = y + levelSpacing;
      elements.push(
        <line
          key={`edge-${node.id}-left`}
          x1={x}
          y1={y + nodeRadius}
          x2={leftX}
          y2={leftY - nodeRadius}
          stroke="rgba(148, 163, 184, 0.5)"
          strokeWidth="2"
        />
      );
      elements.push(...renderNode(node.left, leftX, leftY, level + 1));
    }
    
    if (node.right) {
      const rightX = x + horizontalSpacing;
      const rightY = y + levelSpacing;
      elements.push(
        <line
          key={`edge-${node.id}-right`}
          x1={x}
          y1={y + nodeRadius}
          x2={rightX}
          y2={rightY - nodeRadius}
          stroke="rgba(148, 163, 184, 0.5)"
          strokeWidth="2"
        />
      );
      elements.push(...renderNode(node.right, rightX, rightY, level + 1));
    }
    
    // Draw node
    elements.push(
      <motion.g
        key={`node-${node.id}`}
        animate={{ 
          scale: currentNode === node.id ? 1.3 : 1,
          rotate: currentNode === node.id ? [0, 5, -5, 0] : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <circle
          cx={x}
          cy={y}
          r={nodeRadius}
          className={`${nodeColor} stroke-2`}
          style={{ fill: 'currentColor', stroke: 'currentColor' }}
        />
        <text
          x={x}
          y={y - 3}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-lg font-bold ${textColor}`}
        >
          {node.val}
        </text>
        
        {/* Show depth when calculated */}
        {nodeDepths[node.id] && (
          <motion.text
            x={x}
            y={y + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-xs font-semibold ${textColor}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            d={nodeDepths[node.id]}
          </motion.text>
        )}
      </motion.g>
    );
    
    return elements;
  };
  
  return (
    <div className="flex justify-center">
      <svg width="900" height="500" className="bg-slate-900 rounded-lg border border-slate-700">
        {renderNode(tree, 450, 60, 0)}
      </svg>
    </div>
  );
}

export function MaximumDepthOfBinaryTreeVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const tree = buildSampleTree();
    const newSteps = generateSteps(tree);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);
  
  useEffect(() => {
    initializeSteps();
  }, [initializeSteps]);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, 1200 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Maximum Depth of Binary Tree</h1>
        <p className="text-slate-400">
          Find the maximum depth (height) of a binary tree using recursive DFS. 
          The depth is calculated bottom-up, with each node's depth being 1 + max(left_depth, right_depth).
        </p>
      </div>
      
      {/* Tree Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Tree Traversal & Depth Calculation</h3>
        {currentStepData && (
          <TreeVisualization
            tree={currentStepData.tree}
            currentNode={currentStepData.currentNode}
            calculatingNodes={currentStepData.calculatingNodes}
            completedNodes={currentStepData.completedNodes}
            nodeDepths={currentStepData.nodeDepths}
            maxDepth={currentStepData.maxDepth}
          />
        )}
      </div>
      
      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Legend</h3>
        <div className="flex gap-6 flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-500"></div>
            <span className="text-sm">Unvisited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-yellow-400"></div>
            <span className="text-sm">Currently Visiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-400"></div>
            <span className="text-sm">Calculating Depth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-purple-400"></div>
            <span className="text-sm">Depth Calculated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-400"></div>
            <span className="text-sm">Max Depth Path</span>
          </div>
        </div>
      </div>
      
      {/* Current Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${
              currentStepData?.type === 'complete' ? 'bg-green-500' :
              currentStepData?.type === 'return' ? 'bg-purple-500' :
              currentStepData?.type === 'calculate' ? 'bg-blue-500' :
              currentStepData?.type === 'visit' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />
            <span className="text-lg">{currentStepData?.description || 'Ready to start'}</span>
          </div>
          {currentStepData?.maxDepth > 0 && (
            <div className="bg-green-600 px-3 py-1 rounded-full text-sm font-semibold">
              Max Depth: {currentStepData.maxDepth}
            </div>
          )}
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
{`/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
public int maxDepth(TreeNode root) {
    // Base case: empty tree has depth 0
    if (root == null) {
        return 0;
    }
    
    // Recursively find depth of left and right subtrees
    int leftDepth = maxDepth(root.left);
    int rightDepth = maxDepth(root.right);
    
    // Current depth = max of children depths + 1 (for current node)
    return Math.max(leftDepth, rightDepth) + 1;
}

// Alternative iterative approach using level-order traversal
public int maxDepthIterative(TreeNode root) {
    if (root == null) return 0;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    int depth = 0;
    
    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        depth++;
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    
    return depth;
}`}
        </pre>
      </div>
      
      {/* Algorithm Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>Time Complexity:</strong> O(n) - we visit each node exactly once</p>
          <p><strong>Space Complexity:</strong> O(h) - where h is the height of the tree (recursion stack)</p>
          <p><strong>Approach:</strong> Post-order DFS traversal to calculate depth bottom-up</p>
          
          <div className="mt-4">
            <p><strong>Key Steps:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Base case: if node is null, return depth 0</li>
              <li>Recursively find depth of left subtree</li>
              <li>Recursively find depth of right subtree</li>
              <li>Return max(left_depth, right_depth) + 1</li>
            </ol>
          </div>
          
          <div className="mt-4">
            <p><strong>Why Post-order?</strong> We need to know the depths of child subtrees before we can calculate the current node's depth. This naturally leads to a post-order traversal where we process children first, then the parent.</p>
          </div>
        </div>
      </div>
    </div>
  );
}