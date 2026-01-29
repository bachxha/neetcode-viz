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
  type: 'start' | 'check-node' | 'start-comparison' | 'compare-node' | 'match' | 'mismatch' | 'found' | 'not-found' | 'finish';
  currentMainNode: string | null;
  currentSubNode: string | null;
  compareMainNode: string | null;
  compareSubNode: string | null;
  matchingNodes: string[];
  mismatchNodes: string[];
  foundAt: string | null;
  description: string;
}

interface Example {
  name: string;
  mainTree: TreeNode;
  subTree: TreeNode;
  shouldMatch: boolean;
}

function createNode(val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return {
    val,
    left,
    right,
    id: Math.random().toString(36).substr(2, 9)
  };
}

function createExamples(): Example[] {
  // Example 1: Successful match
  // Main tree:    3
  //             /   \
  //            4     5
  //           / \
  //          1   2
  // Sub tree: 4
  //          / \
  //         1   2
  const mainTree1 = createNode(3);
  mainTree1.left = createNode(4);
  mainTree1.right = createNode(5);
  mainTree1.left.left = createNode(1);
  mainTree1.left.right = createNode(2);
  
  const subTree1 = createNode(4);
  subTree1.left = createNode(1);
  subTree1.right = createNode(2);

  // Example 2: Failed match
  // Main tree:    3
  //             /   \
  //            4     5
  //           / \
  //          1   2
  //             /
  //            0
  // Sub tree: 4
  //          / \
  //         1   2
  const mainTree2 = createNode(3);
  mainTree2.left = createNode(4);
  mainTree2.right = createNode(5);
  mainTree2.left.left = createNode(1);
  mainTree2.left.right = createNode(2);
  mainTree2.left.right.left = createNode(0);
  
  const subTree2 = createNode(4);
  subTree2.left = createNode(1);
  subTree2.right = createNode(2);

  return [
    { name: 'Successful Match', mainTree: mainTree1, subTree: subTree1, shouldMatch: true },
    { name: 'Failed Match', mainTree: mainTree2, subTree: subTree2, shouldMatch: false }
  ];
}

function generateSteps(mainTree: TreeNode, subTree: TreeNode): Step[] {
  const steps: Step[] = [];
  
  steps.push({
    type: 'start',
    currentMainNode: null,
    currentSubNode: null,
    compareMainNode: null,
    compareSubNode: null,
    matchingNodes: [],
    mismatchNodes: [],
    foundAt: null,
    description: 'Starting subtree search. We will check each node in the main tree to see if it could be the root of the subtree.'
  });

  function isSameTree(node1: TreeNode | null, node2: TreeNode | null, parentStepType: 'start-comparison' | 'compare-node'): boolean {
    if (!node1 && !node2) return true;
    if (!node1 || !node2) {
      if (parentStepType === 'start-comparison') {
        steps.push({
          type: 'mismatch',
          currentMainNode: node1?.id || null,
          currentSubNode: node2?.id || null,
          compareMainNode: node1?.id || null,
          compareSubNode: node2?.id || null,
          matchingNodes: [],
          mismatchNodes: node1?.id ? [node1.id] : (node2?.id ? [node2.id] : []),
          foundAt: null,
          description: `Structural mismatch: one tree has a node (${node1?.val || 'null'}) while the other doesn't (${node2?.val || 'null'}).`
        });
      }
      return false;
    }
    
    if (node1.val !== node2.val) {
      steps.push({
        type: 'mismatch',
        currentMainNode: node1.id,
        currentSubNode: node2.id,
        compareMainNode: node1.id,
        compareSubNode: node2.id,
        matchingNodes: [],
        mismatchNodes: [node1.id, node2.id],
        foundAt: null,
        description: `Value mismatch: main tree node ${node1.val} ≠ subtree node ${node2.val}.`
      });
      return false;
    }
    
    steps.push({
      type: 'match',
      currentMainNode: node1.id,
      currentSubNode: node2.id,
      compareMainNode: node1.id,
      compareSubNode: node2.id,
      matchingNodes: [node1.id, node2.id],
      mismatchNodes: [],
      foundAt: null,
      description: `Match found: main tree node ${node1.val} = subtree node ${node2.val}. Checking children...`
    });
    
    const leftMatch = isSameTree(node1.left, node2.left, 'compare-node');
    const rightMatch = isSameTree(node1.right, node2.right, 'compare-node');
    
    return leftMatch && rightMatch;
  }
  
  function traverse(node: TreeNode | null): boolean {
    if (!node) return false;
    
    steps.push({
      type: 'check-node',
      currentMainNode: node.id,
      currentSubNode: null,
      compareMainNode: null,
      compareSubNode: null,
      matchingNodes: [],
      mismatchNodes: [],
      foundAt: null,
      description: `Checking if subtree matches starting at node ${node.val} in the main tree.`
    });
    
    steps.push({
      type: 'start-comparison',
      currentMainNode: node.id,
      currentSubNode: subTree.id,
      compareMainNode: node.id,
      compareSubNode: subTree.id,
      matchingNodes: [],
      mismatchNodes: [],
      foundAt: null,
      description: `Comparing subtree structure starting from main tree node ${node.val} and subtree root ${subTree.val}.`
    });
    
    if (isSameTree(node, subTree, 'start-comparison')) {
      steps.push({
        type: 'found',
        currentMainNode: node.id,
        currentSubNode: subTree.id,
        compareMainNode: null,
        compareSubNode: null,
        matchingNodes: [node.id],
        mismatchNodes: [],
        foundAt: node.id,
        description: `Subtree found! The subtree matches perfectly starting at node ${node.val}.`
      });
      return true;
    }
    
    steps.push({
      type: 'not-found',
      currentMainNode: node.id,
      currentSubNode: null,
      compareMainNode: null,
      compareSubNode: null,
      matchingNodes: [],
      mismatchNodes: [node.id],
      foundAt: null,
      description: `No match at node ${node.val}. Continuing search...`
    });
    
    return traverse(node.left) || traverse(node.right);
  }
  
  const found = traverse(mainTree);
  
  steps.push({
    type: 'finish',
    currentMainNode: null,
    currentSubNode: null,
    compareMainNode: null,
    compareSubNode: null,
    matchingNodes: [],
    mismatchNodes: [],
    foundAt: null,
    description: found ? 'Search complete! Subtree was found in the main tree.' : 'Search complete! Subtree was not found in the main tree.'
  });
  
  return steps;
}

interface TreeVisualizationProps {
  tree: TreeNode;
  title: string;
  currentNode: string | null;
  compareNode: string | null;
  matchingNodes: string[];
  mismatchNodes: string[];
  foundAt: string | null;
  isSubtree?: boolean;
}

function TreeVisualization({
  tree,
  title,
  currentNode,
  compareNode,
  matchingNodes,
  mismatchNodes,
  foundAt,
  isSubtree = false
}: TreeVisualizationProps) {
  const renderNode = (node: TreeNode | null, x: number, y: number, level: number): React.ReactElement[] => {
    if (!node) return [];
    
    const elements: React.ReactElement[] = [];
    const nodeRadius = 25;
    const levelSpacing = 70;
    const horizontalSpacing = Math.max(80, 140 / (level + 1));
    
    // Determine node color based on state
    let nodeColor = 'bg-slate-700 border-slate-500';
    let textColor = 'white';
    
    if (foundAt === node.id && !isSubtree) {
      nodeColor = 'bg-green-500 border-green-400';
    } else if (compareNode === node.id) {
      nodeColor = 'bg-blue-500 border-blue-400';
    } else if (currentNode === node.id) {
      nodeColor = 'bg-yellow-500 border-yellow-400';
      textColor = 'black';
    } else if (matchingNodes.includes(node.id)) {
      nodeColor = 'bg-green-500 border-green-400';
    } else if (mismatchNodes.includes(node.id)) {
      nodeColor = 'bg-red-500 border-red-400';
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
          scale: currentNode === node.id || compareNode === node.id ? 1.2 : 1,
          y: currentNode === node.id || compareNode === node.id ? -5 : 0 
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
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg font-bold"
          style={{ fill: textColor }}
        >
          {node.val}
        </text>
      </motion.g>
    );
    
    return elements;
  };
  
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <svg width="400" height="300" className="bg-slate-900 rounded-lg border border-slate-700">
        {renderNode(tree, 200, 50, 0)}
      </svg>
    </div>
  );
}

export function SubtreeOfAnotherTreeVisualizer() {
  const [examples] = useState<Example[]>(createExamples());
  const [currentExample, setCurrentExample] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const example = examples[currentExample];
    const newSteps = generateSteps(example.mainTree, example.subTree);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [examples, currentExample]);
  
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
  const currentExampleData = examples[currentExample];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Subtree of Another Tree</h1>
        <p className="text-slate-400">
          Check if a binary tree is a subtree of another binary tree. A subtree means 
          it contains a node with the same value and structure, including all descendants.
        </p>
      </div>
      
      {/* Example Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="bg-slate-800 rounded-lg p-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentExample(index);
                setIsPlaying(false);
              }}
              className={`px-4 py-2 rounded-lg mr-2 transition-colors ${
                currentExample === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Trees Visualization */}
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
          {currentStepData && (
            <>
              <TreeVisualization
                tree={currentExampleData.mainTree}
                title="Main Tree"
                currentNode={currentStepData.currentMainNode}
                compareNode={currentStepData.compareMainNode}
                matchingNodes={currentStepData.matchingNodes}
                mismatchNodes={currentStepData.mismatchNodes}
                foundAt={currentStepData.foundAt}
                isSubtree={false}
              />
              <TreeVisualization
                tree={currentExampleData.subTree}
                title="Subtree to Find"
                currentNode={currentStepData.currentSubNode}
                compareNode={currentStepData.compareSubNode}
                matchingNodes={currentStepData.matchingNodes}
                mismatchNodes={currentStepData.mismatchNodes}
                foundAt={null}
                isSubtree={true}
              />
            </>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-500"></div>
            <span className="text-sm">Unvisited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-yellow-400"></div>
            <span className="text-sm">Checking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-400"></div>
            <span className="text-sm">Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-400"></div>
            <span className="text-sm">Match/Found</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-400"></div>
            <span className="text-sm">Mismatch</span>
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'found' ? 'bg-green-500' :
            currentStepData?.type === 'mismatch' ? 'bg-red-500' :
            currentStepData?.type === 'match' ? 'bg-green-500' :
            currentStepData?.type === 'start-comparison' || currentStepData?.type === 'compare-node' ? 'bg-blue-500' :
            currentStepData?.type === 'check-node' ? 'bg-yellow-500' :
            'bg-slate-500'
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
public boolean isSubtree(TreeNode root, TreeNode subRoot) {
    // Base case: if main tree is null, subtree cannot be found
    if (root == null) {
        return false;
    }
    
    // Check if current node could be the root of matching subtree
    if (isSameTree(root, subRoot)) {
        return true;
    }
    
    // Recursively check left and right subtrees
    return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}

// Helper method to check if two trees are identical
private boolean isSameTree(TreeNode p, TreeNode q) {
    // Both null - trees are the same
    if (p == null && q == null) {
        return true;
    }
    
    // One null, one not - trees are different
    if (p == null || q == null) {
        return false;
    }
    
    // Values different - trees are different
    if (p.val != q.val) {
        return false;
    }
    
    // Values same - check left and right subtrees recursively
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`}
        </pre>
      </div>
      
      {/* Algorithm Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>Time Complexity:</strong> O(m × n) - where m is nodes in main tree, n is nodes in subtree</p>
          <p><strong>Space Complexity:</strong> O(max(h₁, h₂)) - height of the trees due to recursion stack</p>
          <p><strong>Approach:</strong> For each node in the main tree, check if it could be the root of the matching subtree</p>
          <div className="ml-4">
            <p><strong>1. Main Function (isSubtree):</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Try each node in the main tree as a potential subtree root</li>
              <li>Use helper function to check if trees match starting from that node</li>
              <li>Return true if any position matches, false if none do</li>
            </ul>
            <p className="mt-2"><strong>2. Helper Function (isSameTree):</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Compare two trees node by node for exact structural match</li>
              <li>Both null → same; one null → different; values differ → different</li>
              <li>Recursively check left and right subtrees</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}