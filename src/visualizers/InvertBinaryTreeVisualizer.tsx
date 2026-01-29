import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  id: string;
}

interface Step {
  type: 'start' | 'process' | 'swap' | 'complete' | 'finish';
  currentNode: string | null;
  swappedNodes: string[];
  completedNodes: string[];
  tree: TreeNode | null;
  description: string;
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
    id: node.id
  };
}

function buildSampleTree(): TreeNode {
  // Build tree:     4
  //               /   \
  //              2     7
  //             / \   / \
  //            1   3 6   9
  const root = createNode(4);
  root.left = createNode(2);
  root.right = createNode(7);
  root.left.left = createNode(1);
  root.left.right = createNode(3);
  root.right.left = createNode(6);
  root.right.right = createNode(9);
  return root;
}

function generateSteps(root: TreeNode | null): Step[] {
  if (!root) return [];
  
  const steps: Step[] = [];
  const tree = cloneTree(root);
  const completedNodes: string[] = [];
  
  steps.push({
    type: 'start',
    currentNode: null,
    swappedNodes: [],
    completedNodes: [],
    tree: cloneTree(tree),
    description: 'Starting tree inversion. We\'ll recursively swap left and right children of each node.'
  });
  
  function invertHelper(node: TreeNode | null): void {
    if (!node) return;
    
    // Process current node
    steps.push({
      type: 'process',
      currentNode: node.id,
      swappedNodes: [],
      completedNodes: [...completedNodes],
      tree: cloneTree(tree),
      description: `Processing node ${node.val}. Will swap its children and recurse.`
    });
    
    // Recursively invert left subtree
    if (node.left) {
      invertHelper(node.left);
    }
    
    // Recursively invert right subtree  
    if (node.right) {
      invertHelper(node.right);
    }
    
    // Swap left and right children
    const temp = node.left;
    node.left = node.right;
    node.right = temp;
    
    const swapped = [];
    if (node.left) swapped.push(node.left.id);
    if (node.right) swapped.push(node.right.id);
    
    steps.push({
      type: 'swap',
      currentNode: node.id,
      swappedNodes: swapped,
      completedNodes: [...completedNodes],
      tree: cloneTree(tree),
      description: `Swapped children of node ${node.val}. Subtree rooted at ${node.val} is now inverted.`
    });
    
    // Mark as completed
    completedNodes.push(node.id);
    steps.push({
      type: 'complete',
      currentNode: node.id,
      swappedNodes: [],
      completedNodes: [...completedNodes],
      tree: cloneTree(tree),
      description: `Node ${node.val} subtree inversion complete.`
    });
  }
  
  invertHelper(tree);
  
  steps.push({
    type: 'finish',
    currentNode: null,
    swappedNodes: [],
    completedNodes: [...completedNodes],
    tree: cloneTree(tree),
    description: 'Tree inversion complete! Every subtree has been inverted recursively.'
  });
  
  return steps;
}

interface TreeVisualizationProps {
  tree: TreeNode | null;
  currentNode: string | null;
  swappedNodes: string[];
  completedNodes: string[];
}

function TreeVisualization({ tree, currentNode, swappedNodes, completedNodes }: TreeVisualizationProps) {
  if (!tree) return null;
  
  const renderNode = (node: TreeNode | null, x: number, y: number, level: number): React.ReactElement[] => {
    if (!node) return [];
    
    const elements: React.ReactElement[] = [];
    const nodeRadius = 25;
    const levelSpacing = 80;
    const horizontalSpacing = Math.max(120, 200 / (level + 1));
    
    // Determine node color based on state
    let nodeColor = 'bg-slate-700 border-slate-500';
    if (currentNode === node.id) {
      nodeColor = 'bg-yellow-500 border-yellow-400 text-black';
    } else if (swappedNodes.includes(node.id)) {
      nodeColor = 'bg-purple-500 border-purple-400';
    } else if (completedNodes.includes(node.id)) {
      nodeColor = 'bg-green-500 border-green-400';
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
        animate={{ scale: currentNode === node.id ? 1.2 : 1 }}
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
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg font-bold fill-white"
          style={{ fill: currentNode === node.id ? 'black' : 'white' }}
        >
          {node.val}
        </text>
      </motion.g>
    );
    
    return elements;
  };
  
  return (
    <div className="flex justify-center">
      <svg width="800" height="400" className="bg-slate-900 rounded-lg border border-slate-700">
        {renderNode(tree, 400, 50, 0)}
      </svg>
    </div>
  );
}

export function InvertBinaryTreeVisualizer() {
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
    }, 1000 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Invert Binary Tree</h1>
        <p className="text-slate-400">
          Recursively swap the left and right children of every node in a binary tree.
          This classic problem demonstrates tree traversal and recursive thinking.
        </p>
      </div>
      
      {/* Tree Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Tree Structure</h3>
        {currentStepData && (
          <TreeVisualization
            tree={currentStepData.tree}
            currentNode={currentStepData.currentNode}
            swappedNodes={currentStepData.swappedNodes}
            completedNodes={currentStepData.completedNodes}
          />
        )}
      </div>
      
      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Legend</h3>
        <div className="flex gap-6 flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-500"></div>
            <span className="text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-yellow-400"></div>
            <span className="text-sm">Currently Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-purple-400"></div>
            <span className="text-sm">Just Swapped</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-400"></div>
            <span className="text-sm">Subtree Inverted</span>
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'finish' ? 'bg-green-500' :
            currentStepData?.type === 'swap' ? 'bg-purple-500' :
            currentStepData?.type === 'process' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg">{currentStepData?.description || 'Ready to start'}</span>
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
public TreeNode invertTree(TreeNode root) {
    if (root == null) {
        return null;
    }
    
    // Recursively invert left and right subtrees
    TreeNode left = invertTree(root.left);
    TreeNode right = invertTree(root.right);
    
    // Swap the children
    root.left = right;
    root.right = left;
    
    return root;
}

// Alternative approach - swap first, then recurse
public TreeNode invertTreeAlt(TreeNode root) {
    if (root == null) return null;
    
    // Swap children first
    TreeNode temp = root.left;
    root.left = root.right;
    root.right = temp;
    
    // Recurse on swapped children
    invertTree(root.left);
    invertTree(root.right);
    
    return root;
}`}
        </pre>
      </div>
      
      {/* Algorithm Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>Time Complexity:</strong> O(n) - we visit each node exactly once</p>
          <p><strong>Space Complexity:</strong> O(h) - where h is the height of the tree (recursion stack)</p>
          <p><strong>Key Insight:</strong> The problem can be solved recursively by swapping children and recurring on subtrees. Two approaches work:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Post-order:</strong> Recurse first, then swap (safer for concurrent access)</li>
            <li><strong>Pre-order:</strong> Swap first, then recurse (what this visualization shows)</li>
          </ul>
          <p><strong>Base Case:</strong> If node is null, return null (nothing to invert)</p>
        </div>
      </div>
    </div>
  );
}