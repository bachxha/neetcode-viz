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
  type: 'start' | 'validate' | 'valid' | 'invalid' | 'complete';
  currentNode: string | null;
  validNodes: string[];
  invalidNode: string | null;
  bounds: { [nodeId: string]: { min: number, max: number } };
  tree: TreeNode | null;
  description: string;
  isValid?: boolean;
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

function buildValidBST(): TreeNode {
  // Valid BST:    5
  //             /   \
  //            3     8
  //           / \   / \
  //          2   4 7   9
  const root = createNode(5);
  root.left = createNode(3);
  root.right = createNode(8);
  root.left.left = createNode(2);
  root.left.right = createNode(4);
  root.right.left = createNode(7);
  root.right.right = createNode(9);
  return root;
}

function buildInvalidBST(): TreeNode {
  // Invalid BST:  5
  //             /   \
  //            3     8
  //           / \   / \
  //          2   6 7   9
  // (6 is in left subtree but > 5)
  const root = createNode(5);
  root.left = createNode(3);
  root.right = createNode(8);
  root.left.left = createNode(2);
  root.left.right = createNode(6); // This violates BST property!
  root.right.left = createNode(7);
  root.right.right = createNode(9);
  return root;
}

function generateSteps(root: TreeNode | null): Step[] {
  if (!root) return [];
  
  const steps: Step[] = [];
  const tree = cloneTree(root);
  const validNodes: string[] = [];
  const bounds: { [nodeId: string]: { min: number, max: number } } = {};
  let invalidNode: string | null = null;
  
  steps.push({
    type: 'start',
    currentNode: null,
    validNodes: [],
    invalidNode: null,
    bounds: {},
    tree: cloneTree(tree),
    description: 'Starting BST validation. Each node must be within its valid range [min, max].'
  });
  
  function validateHelper(node: TreeNode | null, min: number, max: number): boolean {
    if (!node) return true;
    
    // Store bounds for this node
    bounds[node.id] = { min, max };
    
    // Check current node
    steps.push({
      type: 'validate',
      currentNode: node.id,
      validNodes: [...validNodes],
      invalidNode: invalidNode,
      bounds: { ...bounds },
      tree: cloneTree(tree),
      description: `Checking node ${node.val} with bounds [${min === -Infinity ? '-∞' : min}, ${max === Infinity ? '+∞' : max}]`
    });
    
    // Check if current node violates BST property
    if (node.val <= min || node.val >= max) {
      invalidNode = node.id;
      steps.push({
        type: 'invalid',
        currentNode: node.id,
        validNodes: [...validNodes],
        invalidNode: invalidNode,
        bounds: { ...bounds },
        tree: cloneTree(tree),
        description: `Node ${node.val} violates BST property! ${node.val} is not within [${min === -Infinity ? '-∞' : min}, ${max === Infinity ? '+∞' : max}]`,
        isValid: false
      });
      return false;
    }
    
    // Node is valid so far
    validNodes.push(node.id);
    steps.push({
      type: 'valid',
      currentNode: node.id,
      validNodes: [...validNodes],
      invalidNode: invalidNode,
      bounds: { ...bounds },
      tree: cloneTree(tree),
      description: `Node ${node.val} is valid within bounds [${min === -Infinity ? '-∞' : min}, ${max === Infinity ? '+∞' : max}]`
    });
    
    // Recursively validate left subtree with updated max bound
    if (!validateHelper(node.left, min, node.val)) {
      return false;
    }
    
    // Recursively validate right subtree with updated min bound
    if (!validateHelper(node.right, node.val, max)) {
      return false;
    }
    
    return true;
  }
  
  const isValid = validateHelper(tree, -Infinity, Infinity);
  
  steps.push({
    type: 'complete',
    currentNode: null,
    validNodes: [...validNodes],
    invalidNode: invalidNode,
    bounds: { ...bounds },
    tree: cloneTree(tree),
    description: isValid ? 
      'BST validation complete! All nodes satisfy the BST property.' :
      'BST validation complete! Tree is NOT a valid BST.',
    isValid
  });
  
  return steps;
}

interface TreeVisualizationProps {
  tree: TreeNode | null;
  currentNode: string | null;
  validNodes: string[];
  invalidNode: string | null;
  bounds: { [nodeId: string]: { min: number, max: number } };
}

function TreeVisualization({ tree, currentNode, validNodes, invalidNode, bounds }: TreeVisualizationProps) {
  if (!tree) return null;
  
  const renderNode = (node: TreeNode | null, x: number, y: number, level: number): React.ReactElement[] => {
    if (!node) return [];
    
    const elements: React.ReactElement[] = [];
    const nodeRadius = 30;
    const levelSpacing = 100;
    const horizontalSpacing = Math.max(140, 240 / (level + 1));
    
    // Determine node color based on state
    let nodeColor = 'bg-slate-700 border-slate-500';
    if (currentNode === node.id) {
      nodeColor = 'bg-yellow-500 border-yellow-400 text-black';
    } else if (invalidNode === node.id) {
      nodeColor = 'bg-red-500 border-red-400';
    } else if (validNodes.includes(node.id)) {
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
          className="text-lg font-bold"
          style={{ fill: currentNode === node.id ? 'black' : 'white' }}
        >
          {node.val}
        </text>
      </motion.g>
    );
    
    // Draw bounds label if this node has bounds
    if (bounds[node.id]) {
      const bound = bounds[node.id];
      const minText = bound.min === -Infinity ? '-∞' : bound.min.toString();
      const maxText = bound.max === Infinity ? '+∞' : bound.max.toString();
      
      elements.push(
        <text
          key={`bounds-${node.id}`}
          x={x}
          y={y + nodeRadius + 20}
          textAnchor="middle"
          className="text-xs fill-slate-400 font-mono"
        >
          [{minText}, {maxText}]
        </text>
      );
    }
    
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

export function ValidateBinarySearchTreeVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [useValidBST, setUseValidBST] = useState(true);
  
  const initializeSteps = useCallback(() => {
    const tree = useValidBST ? buildValidBST() : buildInvalidBST();
    const newSteps = generateSteps(tree);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [useValidBST]);
  
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
        <h1 className="text-3xl font-bold mb-2">Validate Binary Search Tree</h1>
        <p className="text-slate-400">
          Determine if a binary tree is a valid BST. Each node must be within its valid range based on ancestors.
          We pass down min/max bounds to ensure the BST property is maintained at every level.
        </p>
      </div>
      
      {/* BST Type Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="bg-slate-800 rounded-lg p-1 flex">
          <button
            onClick={() => setUseValidBST(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              useValidBST 
                ? 'bg-green-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Valid BST
          </button>
          <button
            onClick={() => setUseValidBST(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !useValidBST 
                ? 'bg-red-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Invalid BST
          </button>
        </div>
      </div>
      
      {/* Tree Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">BST Validation with Bounds</h3>
        {currentStepData && (
          <TreeVisualization
            tree={currentStepData.tree}
            currentNode={currentStepData.currentNode}
            validNodes={currentStepData.validNodes}
            invalidNode={currentStepData.invalidNode}
            bounds={currentStepData.bounds}
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
            <span className="text-sm">Currently Checking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-400"></div>
            <span className="text-sm">Valid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-400"></div>
            <span className="text-sm">Invalid (Violates BST)</span>
          </div>
        </div>
        <div className="mt-3 text-center text-sm text-slate-400">
          <span className="font-mono">[min, max]</span> bounds show the valid range for each node
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'complete' ? 
              (currentStepData.isValid ? 'bg-green-500' : 'bg-red-500') :
            currentStepData?.type === 'invalid' ? 'bg-red-500' :
            currentStepData?.type === 'valid' ? 'bg-green-500' :
            currentStepData?.type === 'validate' ? 'bg-yellow-500' :
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
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code - Bounds Passing Approach</h3>
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

public boolean isValidBST(TreeNode root) {
    return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private boolean validate(TreeNode node, long min, long max) {
    // Base case: null nodes are valid
    if (node == null) {
        return true;
    }
    
    // Check if current node violates BST property
    if (node.val <= min || node.val >= max) {
        return false;
    }
    
    // Recursively validate left and right subtrees with updated bounds
    return validate(node.left, min, node.val) && 
           validate(node.right, node.val, max);
}

// Alternative approach using Integer bounds (handles edge cases)
public boolean isValidBSTAlt(TreeNode root) {
    return validateAlt(root, null, null);
}

private boolean validateAlt(TreeNode node, Integer min, Integer max) {
    if (node == null) return true;
    
    if ((min != null && node.val <= min) || 
        (max != null && node.val >= max)) {
        return false;
    }
    
    return validateAlt(node.left, min, node.val) &&
           validateAlt(node.right, node.val, max);
}`}
        </pre>
      </div>
      
      {/* Algorithm Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>Time Complexity:</strong> O(n) - we visit each node exactly once</p>
          <p><strong>Space Complexity:</strong> O(h) - where h is the height of the tree (recursion stack)</p>
          <p><strong>Key Insight:</strong> It's not enough to check if left child &lt; parent &lt; right child. We need to ensure each node is within its valid range based on ALL ancestors.</p>
          
          <div className="mt-4">
            <p><strong>Bounds Passing Strategy:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Start with bounds (-∞, +∞) for root</li>
              <li>For left child: inherit min bound, use parent value as new max bound</li>
              <li>For right child: use parent value as new min bound, inherit max bound</li>
              <li>If any node violates its bounds, the tree is not a valid BST</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <p><strong>Edge Cases:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Use <code>Long.MIN_VALUE/MAX_VALUE</code> to handle <code>Integer.MIN_VALUE/MAX_VALUE</code> nodes</li>
              <li>Alternatively, use <code>null</code> to represent unbounded limits</li>
              <li>Empty tree (null root) is considered a valid BST</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}