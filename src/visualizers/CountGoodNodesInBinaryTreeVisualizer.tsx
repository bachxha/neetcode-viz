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
  type: 'start' | 'visit' | 'check' | 'good' | 'not-good' | 'return' | 'complete';
  currentNode: string | null;
  currentPath: string[];
  goodNodes: string[];
  notGoodNodes: string[];
  tree: TreeNode | null;
  description: string;
  currentMax: number;
  goodCount: number;
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
  // Build tree:       3
  //                 /   \
  //                1     4
  //               / \   / \
  //              3   1 1   5
  const root = createNode(3);
  root.left = createNode(1);
  root.right = createNode(4);
  root.left.left = createNode(3);
  root.left.right = createNode(1);
  root.right.left = createNode(1);
  root.right.right = createNode(5);
  return root;
}

function generateSteps(root: TreeNode | null): Step[] {
  if (!root) return [];
  
  const steps: Step[] = [];
  const goodNodes: string[] = [];
  const notGoodNodes: string[] = [];
  let goodCount = 0;
  
  steps.push({
    type: 'start',
    currentNode: null,
    currentPath: [],
    goodNodes: [],
    notGoodNodes: [],
    tree: cloneTree(root),
    description: 'Starting DFS traversal to count good nodes. A node is "good" if its value >= all values on the path from root to it.',
    currentMax: -Infinity,
    goodCount: 0
  });
  
  function dfs(node: TreeNode | null, maxSoFar: number, path: string[]): void {
    if (!node) return;
    
    const currentPath = [...path, node.id];
    
    // Visit current node
    steps.push({
      type: 'visit',
      currentNode: node.id,
      currentPath: [...currentPath],
      goodNodes: [...goodNodes],
      notGoodNodes: [...notGoodNodes],
      tree: cloneTree(root),
      description: `Visiting node ${node.val}. Current max on path from root: ${maxSoFar}`,
      currentMax: maxSoFar,
      goodCount
    });
    
    // Check if current node is good
    steps.push({
      type: 'check',
      currentNode: node.id,
      currentPath: [...currentPath],
      goodNodes: [...goodNodes],
      notGoodNodes: [...notGoodNodes],
      tree: cloneTree(root),
      description: `Checking: Is ${node.val} >= ${maxSoFar}? ${node.val >= maxSoFar ? 'YES' : 'NO'}`,
      currentMax: maxSoFar,
      goodCount
    });
    
    // Determine if node is good
    if (node.val >= maxSoFar) {
      goodNodes.push(node.id);
      goodCount++;
      steps.push({
        type: 'good',
        currentNode: node.id,
        currentPath: [...currentPath],
        goodNodes: [...goodNodes],
        notGoodNodes: [...notGoodNodes],
        tree: cloneTree(root),
        description: `Node ${node.val} is GOOD! It's >= max on path (${maxSoFar}). Good nodes count: ${goodCount}`,
        currentMax: Math.max(maxSoFar, node.val),
        goodCount
      });
    } else {
      notGoodNodes.push(node.id);
      steps.push({
        type: 'not-good',
        currentNode: node.id,
        currentPath: [...currentPath],
        goodNodes: [...goodNodes],
        notGoodNodes: [...notGoodNodes],
        tree: cloneTree(root),
        description: `Node ${node.val} is NOT good. It's < max on path (${maxSoFar}). Good nodes count: ${goodCount}`,
        currentMax: Math.max(maxSoFar, node.val),
        goodCount
      });
    }
    
    const newMax = Math.max(maxSoFar, node.val);
    
    // Recursively visit children
    dfs(node.left, newMax, currentPath);
    dfs(node.right, newMax, currentPath);
    
    // Return from current node
    steps.push({
      type: 'return',
      currentNode: node.id,
      currentPath: [...currentPath],
      goodNodes: [...goodNodes],
      notGoodNodes: [...notGoodNodes],
      tree: cloneTree(root),
      description: `Returning from node ${node.val}. Processed all subtrees.`,
      currentMax: newMax,
      goodCount
    });
  }
  
  dfs(root, -Infinity, []);
  
  steps.push({
    type: 'complete',
    currentNode: null,
    currentPath: [],
    goodNodes: [...goodNodes],
    notGoodNodes: [...notGoodNodes],
    tree: cloneTree(root),
    description: `Complete! Found ${goodCount} good nodes in the binary tree.`,
    currentMax: -Infinity,
    goodCount
  });
  
  return steps;
}

interface TreeVisualizationProps {
  tree: TreeNode | null;
  currentNode: string | null;
  currentPath: string[];
  goodNodes: string[];
  notGoodNodes: string[];
  currentMax: number;
  goodCount: number;
}

function TreeVisualization({ 
  tree, 
  currentNode, 
  currentPath, 
  goodNodes, 
  notGoodNodes,
  currentMax: _currentMax,
  goodCount: _goodCount 
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
    let borderWidth = 'border-2';
    
    if (currentNode === node.id) {
      nodeColor = 'bg-yellow-500 border-yellow-400';
      textColor = 'text-black';
      borderWidth = 'border-4';
    } else if (goodNodes.includes(node.id)) {
      nodeColor = 'bg-green-500 border-green-400';
      textColor = 'text-white';
    } else if (notGoodNodes.includes(node.id)) {
      nodeColor = 'bg-red-500 border-red-400';
      textColor = 'text-white';
    } else if (currentPath.includes(node.id)) {
      nodeColor = 'bg-blue-500 border-blue-400';
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
          className={`${nodeColor} ${borderWidth}`}
          style={{ fill: 'currentColor', stroke: 'currentColor' }}
        />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-lg font-bold ${textColor}`}
        >
          {node.val}
        </text>
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

export function CountGoodNodesInBinaryTreeVisualizer() {
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
        <h1 className="text-3xl font-bold mb-2">Count Good Nodes in Binary Tree</h1>
        <p className="text-slate-400">
          Count the number of "good" nodes in a binary tree. A node is good if its value is greater than 
          or equal to all values on the path from root to it. The root is always good.
        </p>
      </div>
      
      {/* Tree Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">DFS Traversal & Good Node Detection</h3>
        {currentStepData && (
          <TreeVisualization
            tree={currentStepData.tree}
            currentNode={currentStepData.currentNode}
            currentPath={currentStepData.currentPath}
            goodNodes={currentStepData.goodNodes}
            notGoodNodes={currentStepData.notGoodNodes}
            currentMax={currentStepData.currentMax}
            goodCount={currentStepData.goodCount}
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
            <div className="w-6 h-6 rounded-full bg-yellow-500 border-4 border-yellow-400"></div>
            <span className="text-sm">Currently Checking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-400"></div>
            <span className="text-sm">On Current Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-400"></div>
            <span className="text-sm">Good Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-400"></div>
            <span className="text-sm">Not Good Node</span>
          </div>
        </div>
      </div>
      
      {/* Current Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${
              currentStepData?.type === 'complete' ? 'bg-green-500' :
              currentStepData?.type === 'good' ? 'bg-green-500' :
              currentStepData?.type === 'not-good' ? 'bg-red-500' :
              currentStepData?.type === 'check' ? 'bg-yellow-500' :
              currentStepData?.type === 'visit' ? 'bg-blue-500' :
              'bg-blue-500'
            }`} />
            <span className="text-lg">{currentStepData?.description || 'Ready to start'}</span>
          </div>
          <div className="flex gap-4">
            {currentStepData?.currentMax !== -Infinity && currentStepData?.currentMax !== undefined && (
              <div className="bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                Max on Path: {currentStepData.currentMax}
              </div>
            )}
            {currentStepData?.goodCount !== undefined && (
              <div className="bg-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                Good Nodes: {currentStepData.goodCount}
              </div>
            )}
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
public int goodNodes(TreeNode root) {
    return dfs(root, Integer.MIN_VALUE);
}

private int dfs(TreeNode node, int maxSoFar) {
    // Base case: null node contributes 0 good nodes
    if (node == null) {
        return 0;
    }
    
    int count = 0;
    
    // Check if current node is good
    // A node is good if its value >= max value seen on path from root
    if (node.val >= maxSoFar) {
        count = 1; // This node is good
    }
    
    // Update max value for children (including current node's value)
    int newMax = Math.max(maxSoFar, node.val);
    
    // Recursively count good nodes in left and right subtrees
    count += dfs(node.left, newMax);
    count += dfs(node.right, newMax);
    
    return count;
}

// Alternative approach with helper method
public int goodNodesAlternative(TreeNode root) {
    return countGoodNodes(root, Integer.MIN_VALUE);
}

private int countGoodNodes(TreeNode node, int pathMax) {
    if (node == null) return 0;
    
    // Count current node if it's good
    int result = (node.val >= pathMax) ? 1 : 0;
    
    // Update path maximum and recurse
    pathMax = Math.max(pathMax, node.val);
    
    // Add counts from left and right subtrees
    result += countGoodNodes(node.left, pathMax);
    result += countGoodNodes(node.right, pathMax);
    
    return result;
}`}
        </pre>
      </div>
      
      {/* Algorithm Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>Time Complexity:</strong> O(n) - we visit each node exactly once</p>
          <p><strong>Space Complexity:</strong> O(h) - where h is the height of the tree (recursion stack)</p>
          <p><strong>Approach:</strong> DFS pre-order traversal with path maximum tracking</p>
          
          <div className="mt-4">
            <p><strong>Key Steps:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Start DFS from root with initial max = Integer.MIN_VALUE</li>
              <li>For each node, check if its value &gt;= current path maximum</li>
              <li>If yes, count it as a good node</li>
              <li>Update the path maximum to include current node's value</li>
              <li>Recursively process left and right subtrees with updated maximum</li>
              <li>Return total count of good nodes</li>
            </ol>
          </div>
          
          <div className="mt-4">
            <p><strong>Key Insight:</strong> A node is "good" if it's greater than or equal to all ancestors on the path from root. We maintain the maximum value seen so far on the current path and compare each node against this maximum.</p>
          </div>
          
          <div className="mt-4">
            <p><strong>Why Pre-order?</strong> We need to know the path maximum before processing children, making pre-order traversal (root → left → right) the natural choice. We process the current node, then pass the updated maximum down to children.</p>
          </div>
        </div>
      </div>
    </div>
  );
}