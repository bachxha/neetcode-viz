import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface TreeNode {
  val: number | null;
  left: TreeNode | null;
  right: TreeNode | null;
  id: string;
}

interface Step {
  type: 'start' | 'compare' | 'match' | 'mismatch' | 'finish';
  currentNodeP: string | null;
  currentNodeQ: string | null;
  matchedNodes: string[];
  mismatchedNodes: string[];
  treeP: TreeNode | null;
  treeQ: TreeNode | null;
  description: string;
  result: boolean | null;
}

function createNode(val: number | null, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
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

// Example trees for demonstration
function buildExampleTrees(): { identical: TreeNode[], differentValues: TreeNode[], differentStructure: TreeNode[] } {
  // Identical trees
  const tree1a = createNode(1);
  tree1a.left = createNode(2);
  tree1a.right = createNode(3);
  
  const tree1b = createNode(1);
  tree1b.left = createNode(2);
  tree1b.right = createNode(3);

  // Different values
  const tree2a = createNode(1);
  tree2a.left = createNode(2);
  tree2a.right = createNode(1);
  
  const tree2b = createNode(1);
  tree2b.left = createNode(1);
  tree2b.right = createNode(2);

  // Different structure
  const tree3a = createNode(1);
  tree3a.left = createNode(2);
  
  const tree3b = createNode(1);
  tree3b.right = createNode(2);

  return {
    identical: [tree1a, tree1b],
    differentValues: [tree2a, tree2b],
    differentStructure: [tree3a, tree3b]
  };
}

function generateSteps(p: TreeNode | null, q: TreeNode | null): Step[] {
  const steps: Step[] = [];
  const matchedNodes: string[] = [];
  const mismatchedNodes: string[] = [];
  const treeP = cloneTree(p);
  const treeQ = cloneTree(q);
  let finalResult = true;
  
  steps.push({
    type: 'start',
    currentNodeP: null,
    currentNodeQ: null,
    matchedNodes: [],
    mismatchedNodes: [],
    treeP: cloneTree(treeP),
    treeQ: cloneTree(treeQ),
    description: 'Starting tree comparison. We\'ll recursively compare corresponding nodes in both trees.',
    result: null
  });
  
  function isSameTreeHelper(nodeP: TreeNode | null, nodeQ: TreeNode | null): boolean {
    // Base case: both null
    if (!nodeP && !nodeQ) {
      steps.push({
        type: 'match',
        currentNodeP: null,
        currentNodeQ: null,
        matchedNodes: [...matchedNodes],
        mismatchedNodes: [...mismatchedNodes],
        treeP: cloneTree(treeP),
        treeQ: cloneTree(treeQ),
        description: 'Both nodes are null - this is a match.',
        result: true
      });
      return true;
    }
    
    // Base case: one null, one not
    if (!nodeP || !nodeQ) {
      if (nodeP) {
        mismatchedNodes.push(nodeP.id);
      }
      if (nodeQ) {
        mismatchedNodes.push(nodeQ.id);
      }
      steps.push({
        type: 'mismatch',
        currentNodeP: nodeP?.id || null,
        currentNodeQ: nodeQ?.id || null,
        matchedNodes: [...matchedNodes],
        mismatchedNodes: [...mismatchedNodes],
        treeP: cloneTree(treeP),
        treeQ: cloneTree(treeQ),
        description: 'One node is null while the other is not - this is a mismatch.',
        result: false
      });
      finalResult = false;
      return false;
    }
    
    // Compare current nodes
    steps.push({
      type: 'compare',
      currentNodeP: nodeP.id,
      currentNodeQ: nodeQ.id,
      matchedNodes: [...matchedNodes],
      mismatchedNodes: [...mismatchedNodes],
      treeP: cloneTree(treeP),
      treeQ: cloneTree(treeQ),
      description: `Comparing nodes: ${nodeP.val} vs ${nodeQ.val}`,
      result: null
    });
    
    // Check if values are different
    if (nodeP.val !== nodeQ.val) {
      mismatchedNodes.push(nodeP.id, nodeQ.id);
      steps.push({
        type: 'mismatch',
        currentNodeP: nodeP.id,
        currentNodeQ: nodeQ.id,
        matchedNodes: [...matchedNodes],
        mismatchedNodes: [...mismatchedNodes],
        treeP: cloneTree(treeP),
        treeQ: cloneTree(treeQ),
        description: `Values don't match: ${nodeP.val} ≠ ${nodeQ.val}`,
        result: false
      });
      finalResult = false;
      return false;
    }
    
    // Values match
    matchedNodes.push(nodeP.id, nodeQ.id);
    steps.push({
      type: 'match',
      currentNodeP: nodeP.id,
      currentNodeQ: nodeQ.id,
      matchedNodes: [...matchedNodes],
      mismatchedNodes: [...mismatchedNodes],
      treeP: cloneTree(treeP),
      treeQ: cloneTree(treeQ),
      description: `Values match: ${nodeP.val} = ${nodeQ.val}. Now checking subtrees.`,
      result: null
    });
    
    // Recursively check left and right subtrees
    const leftSame = isSameTreeHelper(nodeP.left, nodeQ.left);
    const rightSame = isSameTreeHelper(nodeP.right, nodeQ.right);
    
    return leftSame && rightSame;
  }
  
  isSameTreeHelper(treeP, treeQ);
  
  steps.push({
    type: 'finish',
    currentNodeP: null,
    currentNodeQ: null,
    matchedNodes: [...matchedNodes],
    mismatchedNodes: [...mismatchedNodes],
    treeP: cloneTree(treeP),
    treeQ: cloneTree(treeQ),
    description: finalResult ? 'Trees are identical!' : 'Trees are different!',
    result: finalResult
  });
  
  return steps;
}

interface TreeVisualizationProps {
  tree: TreeNode | null;
  currentNode: string | null;
  matchedNodes: string[];
  mismatchedNodes: string[];
  title: string;
}

function TreeVisualization({ tree, currentNode, matchedNodes, mismatchedNodes, title }: TreeVisualizationProps) {
  if (!tree) {
    return (
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        <div className="w-80 h-60 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
          <span className="text-slate-500">Empty Tree</span>
        </div>
      </div>
    );
  }
  
  const renderNode = (node: TreeNode | null, x: number, y: number, level: number): React.ReactElement[] => {
    if (!node) return [];
    
    const elements: React.ReactElement[] = [];
    const nodeRadius = 20;
    const levelSpacing = 60;
    const horizontalSpacing = Math.max(80, 120 / (level + 1));
    
    // Determine node color based on state
    let nodeColor = 'bg-slate-700 border-slate-500';
    if (currentNode === node.id) {
      nodeColor = 'bg-yellow-500 border-yellow-400 text-black';
    } else if (matchedNodes.includes(node.id)) {
      nodeColor = 'bg-green-500 border-green-400';
    } else if (mismatchedNodes.includes(node.id)) {
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
          scale: currentNode === node.id ? 1.3 : 1,
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
          className="text-sm font-bold"
          style={{ 
            fill: currentNode === node.id || mismatchedNodes.includes(node.id) ? 'black' : 'white' 
          }}
        >
          {node.val}
        </text>
      </motion.g>
    );
    
    return elements;
  };
  
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <svg width="320" height="240" className="bg-slate-800 rounded-lg border border-slate-700">
        {renderNode(tree, 160, 35, 0)}
      </svg>
    </div>
  );
}

export function SameTreeVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [exampleType, setExampleType] = useState<'identical' | 'differentValues' | 'differentStructure'>('identical');
  
  const initializeSteps = useCallback(() => {
    const examples = buildExampleTrees();
    const [treeP, treeQ] = examples[exampleType];
    const newSteps = generateSteps(treeP, treeQ);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [exampleType]);
  
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Same Tree</h1>
        <p className="text-slate-400">
          Compare two binary trees to determine if they are identical in structure and values.
          This algorithm uses recursive depth-first traversal to compare corresponding nodes.
        </p>
      </div>
      
      {/* Example Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Example</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setExampleType('identical')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              exampleType === 'identical'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Identical Trees
          </button>
          <button
            onClick={() => setExampleType('differentValues')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              exampleType === 'differentValues'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Different Values
          </button>
          <button
            onClick={() => setExampleType('differentStructure')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              exampleType === 'differentStructure'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Different Structure
          </button>
        </div>
      </div>
      
      {/* Tree Visualizations */}
      <div className="mb-6">
        <div className="flex gap-8 justify-center">
          {currentStepData && (
            <>
              <TreeVisualization
                tree={currentStepData.treeP}
                currentNode={currentStepData.currentNodeP}
                matchedNodes={currentStepData.matchedNodes}
                mismatchedNodes={currentStepData.mismatchedNodes}
                title="Tree P"
              />
              <div className="flex items-center">
                <span className="text-2xl text-slate-400">⟷</span>
              </div>
              <TreeVisualization
                tree={currentStepData.treeQ}
                currentNode={currentStepData.currentNodeQ}
                matchedNodes={currentStepData.matchedNodes}
                mismatchedNodes={currentStepData.mismatchedNodes}
                title="Tree Q"
              />
            </>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Legend</h3>
        <div className="flex gap-6 flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-700 border-2 border-slate-500"></div>
            <span className="text-sm">Not Yet Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-yellow-500 border-2 border-yellow-400"></div>
            <span className="text-sm">Currently Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-400"></div>
            <span className="text-sm">Matched</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-400"></div>
            <span className="text-sm">Mismatched</span>
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`w-4 h-4 rounded-full ${
            currentStepData?.type === 'finish' ? 
              (currentStepData.result ? 'bg-green-500' : 'bg-red-500') :
            currentStepData?.type === 'match' ? 'bg-green-500' :
            currentStepData?.type === 'mismatch' ? 'bg-red-500' :
            currentStepData?.type === 'compare' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg flex-1">{currentStepData?.description || 'Ready to start'}</span>
          {currentStepData?.result !== null && (
            <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              currentStepData.result 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {currentStepData.result ? 'SAME' : 'DIFFERENT'}
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
      
      {/* Algorithm Analysis */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {/* Java Code */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Java Solution</h3>
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
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
public boolean isSameTree(TreeNode p, TreeNode q) {
    // Base case: both null
    if (p == null && q == null) {
        return true;
    }
    
    // Base case: one null, other not
    if (p == null || q == null) {
        return false;
    }
    
    // Check current values and recurse
    return (p.val == q.val) &&
           isSameTree(p.left, q.left) &&
           isSameTree(p.right, q.right);
}`}
          </pre>
        </div>
        
        {/* Algorithm Explanation */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Algorithm Analysis</h3>
          <div className="text-sm text-slate-300 space-y-3">
            <div>
              <p><strong>Time Complexity:</strong> O(min(m,n))</p>
              <p className="text-xs text-slate-400">Where m and n are the number of nodes in each tree. We only visit nodes until we find a mismatch.</p>
            </div>
            <div>
              <p><strong>Space Complexity:</strong> O(min(m,n))</p>
              <p className="text-xs text-slate-400">Recursion stack depth is limited by the height of the smaller tree.</p>
            </div>
            <div>
              <p><strong>Key Insight:</strong></p>
              <p className="text-xs text-slate-400">Two trees are identical if:</p>
              <ul className="list-disc list-inside ml-2 text-xs text-slate-400 space-y-1">
                <li>Both are null, OR</li>
                <li>Both have same value AND left subtrees are same AND right subtrees are same</li>
              </ul>
            </div>
            <div>
              <p><strong>Edge Cases:</strong></p>
              <ul className="list-disc list-inside ml-2 text-xs text-slate-400 space-y-1">
                <li>Both trees are empty → true</li>
                <li>One empty, one not → false</li>
                <li>Different structures → false</li>
                <li>Same structure, different values → false</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pattern Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Tree Comparison Pattern</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p>This problem demonstrates a fundamental tree traversal pattern:</p>
          <ol className="list-decimal list-inside ml-4 space-y-1">
            <li><strong>Handle base cases:</strong> Check if nodes are null</li>
            <li><strong>Compare current level:</strong> Check if values match</li>
            <li><strong>Recurse:</strong> Apply same logic to subtrees</li>
            <li><strong>Combine results:</strong> All comparisons must be true</li>
          </ol>
          <p className="mt-3 text-slate-400">
            <strong>Similar Problems:</strong> Symmetric Tree, Subtree of Another Tree, Path Sum
          </p>
        </div>
      </div>
    </div>
  );
}