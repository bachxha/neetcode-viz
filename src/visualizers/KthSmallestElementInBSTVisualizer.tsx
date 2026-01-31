import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  id: string;
  x?: number;
  y?: number;
}

interface Step {
  type: 'start' | 'visit' | 'add-to-result' | 'found' | 'complete';
  currentNode: string | null;
  visitedNodes: string[];
  stack: string[];
  inOrderResult: number[];
  k: number;
  targetK: number;
  result: number | null;
  description: string;
  tree: TreeNode | null;
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
    x: node.x,
    y: node.y
  };
}

function buildSampleBST(): TreeNode {
  // Build BST:        5
  //                 /   \
  //                3     7
  //               / \   / \
  //              2   4 6   8
  //             /
  //            1
  const root = createNode(5);
  root.left = createNode(3);
  root.right = createNode(7);
  root.left.left = createNode(2);
  root.left.right = createNode(4);
  root.right.left = createNode(6);
  root.right.right = createNode(8);
  root.left.left.left = createNode(1);
  
  calculatePositions(root);
  return root;
}

function calculatePositions(root: TreeNode | null): void {
  if (!root) return;
  
  const positionNode = (node: TreeNode | null, x: number, y: number, spacing: number): void => {
    if (!node) return;
    
    node.x = x;
    node.y = y;
    
    const nextY = y + 80;
    const nextSpacing = spacing * 0.7;
    
    if (node.left) {
      positionNode(node.left, x - spacing, nextY, nextSpacing);
    }
    if (node.right) {
      positionNode(node.right, x + spacing, nextY, nextSpacing);
    }
  };
  
  positionNode(root, 400, 60, 150);
}

function generateSteps(root: TreeNode | null, k: number): Step[] {
  if (!root) return [];
  
  const steps: Step[] = [];
  const visitedNodes: string[] = [];
  const inOrderResult: number[] = [];
  let result: number | null = null;
  let count = 0;
  
  steps.push({
    type: 'start',
    currentNode: null,
    visitedNodes: [],
    stack: [],
    inOrderResult: [],
    k: 0,
    targetK: k,
    result: null,
    description: `Starting in-order traversal to find ${k}${getOrdinalSuffix(k)} smallest element in BST. In-order traversal of BST gives sorted sequence.`,
    tree: cloneTree(root)
  });
  
  // Iterative in-order traversal using stack
  const stack: TreeNode[] = [];
  let current: TreeNode | null = root;
  const stackIds: string[] = [];
  
  while (current || stack.length > 0) {
    // Go to leftmost node
    while (current) {
      stack.push(current);
      stackIds.push(current.id);
      current = current.left;
      
      if (current) {
        steps.push({
          type: 'visit',
          currentNode: current.id,
          visitedNodes: [...visitedNodes],
          stack: [...stackIds, current.id],
          inOrderResult: [...inOrderResult],
          k: count,
          targetK: k,
          result: result,
          description: `Moving to left child ${current.val}. In-order: Left → Node → Right`,
          tree: cloneTree(root)
        });
      }
    }
    
    // Current must be null and stack non-empty
    if (stack.length > 0) {
      current = stack.pop()!;
      stackIds.pop();
      visitedNodes.push(current.id);
      count++;
      
      steps.push({
        type: 'visit',
        currentNode: current.id,
        visitedNodes: [...visitedNodes],
        stack: [...stackIds],
        inOrderResult: [...inOrderResult],
        k: count - 1,
        targetK: k,
        result: result,
        description: `Processing node ${current.val}. This is the ${count}${getOrdinalSuffix(count)} smallest element.`,
        tree: cloneTree(root)
      });
      
      inOrderResult.push(current.val);
      
      steps.push({
        type: 'add-to-result',
        currentNode: current.id,
        visitedNodes: [...visitedNodes],
        stack: [...stackIds],
        inOrderResult: [...inOrderResult],
        k: count,
        targetK: k,
        result: result,
        description: `Added ${current.val} to in-order result. Sequence so far: [${inOrderResult.join(', ')}]`,
        tree: cloneTree(root)
      });
      
      if (count === k) {
        result = current.val;
        steps.push({
          type: 'found',
          currentNode: current.id,
          visitedNodes: [...visitedNodes],
          stack: [...stackIds],
          inOrderResult: [...inOrderResult],
          k: count,
          targetK: k,
          result: result,
          description: `Found it! The ${k}${getOrdinalSuffix(k)} smallest element is ${result}. We can stop here.`,
          tree: cloneTree(root)
        });
        break;
      }
      
      // Move to right subtree
      current = current.right;
    }
  }
  
  steps.push({
    type: 'complete',
    currentNode: null,
    visitedNodes: [...visitedNodes],
    stack: [],
    inOrderResult: [...inOrderResult],
    k: count,
    targetK: k,
    result: result,
    description: `Complete! In-order traversal gives sorted sequence: [${inOrderResult.join(', ')}]. The ${k}${getOrdinalSuffix(k)} smallest element is ${result}.`,
    tree: cloneTree(root)
  });
  
  return steps;
}

function getOrdinalSuffix(n: number): string {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }
  
  switch (lastDigit) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

interface TreeVisualizationProps {
  tree: TreeNode | null;
  currentNode: string | null;
  visitedNodes: string[];
  stack: string[];
  targetK: number;
  k: number;
}

function TreeVisualization({ 
  tree, 
  currentNode, 
  visitedNodes, 
  stack,
  targetK,
  k
}: TreeVisualizationProps) {
  if (!tree) return null;
  
  const renderNode = (node: TreeNode | null): React.ReactElement[] => {
    if (!node) return [];
    
    const elements: React.ReactElement[] = [];
    
    // Determine node color and styling
    let nodeColor = 'bg-slate-700 border-slate-500';
    let textColor = 'text-white';
    let isTarget = false;
    
    if (currentNode === node.id) {
      nodeColor = 'bg-yellow-500 border-yellow-400';
      textColor = 'text-black';
    } else if (stack.includes(node.id)) {
      nodeColor = 'bg-blue-500 border-blue-400';
      textColor = 'text-white';
    } else if (visitedNodes.includes(node.id)) {
      const nodePosition = visitedNodes.indexOf(node.id) + 1;
      if (nodePosition === targetK) {
        nodeColor = 'bg-green-500 border-green-400';
        textColor = 'text-white';
        isTarget = true;
      } else {
        nodeColor = 'bg-purple-500 border-purple-400';
        textColor = 'text-white';
      }
    }
    
    // Draw edges to children
    if (node.left && node.left.x && node.left.y && node.x && node.y) {
      elements.push(
        <line
          key={`edge-${node.id}-left`}
          x1={node.x}
          y1={node.y + 25}
          x2={node.left.x}
          y2={node.left.y - 25}
          stroke="rgba(148, 163, 184, 0.5)"
          strokeWidth="2"
        />
      );
    }
    
    if (node.right && node.right.x && node.right.y && node.x && node.y) {
      elements.push(
        <line
          key={`edge-${node.id}-right`}
          x1={node.x}
          y1={node.y + 25}
          x2={node.right.x}
          y2={node.right.y - 25}
          stroke="rgba(148, 163, 184, 0.5)"
          strokeWidth="2"
        />
      );
    }
    
    // Draw node
    if (node.x && node.y) {
      elements.push(
        <motion.g
          key={`node-${node.id}`}
          animate={{ 
            scale: currentNode === node.id ? 1.3 : isTarget ? 1.2 : 1,
            rotate: currentNode === node.id ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <circle
            cx={node.x}
            cy={node.y}
            r={25}
            className={`${nodeColor} stroke-2`}
            style={{ fill: 'currentColor', stroke: 'currentColor' }}
          />
          <text
            x={node.x}
            y={node.y - 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-lg font-bold ${textColor}`}
          >
            {node.val}
          </text>
          
          {/* Show order number when visited */}
          {visitedNodes.includes(node.id) && (
            <motion.text
              x={node.x}
              y={node.y + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xs font-semibold ${textColor}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              #{visitedNodes.indexOf(node.id) + 1}
            </motion.text>
          )}
        </motion.g>
      );
    }
    
    // Recursively render children
    if (node.left) elements.push(...renderNode(node.left));
    if (node.right) elements.push(...renderNode(node.right));
    
    return elements;
  };
  
  return (
    <div className="flex justify-center">
      <svg width="800" height="400" className="bg-slate-900 rounded-lg border border-slate-700">
        {renderNode(tree)}
        
        {/* Legend */}
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="200" height="120" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(71, 85, 105, 0.5)" strokeWidth="1" rx="6"/>
          <text x="10" y="18" className="text-xs fill-slate-400 font-semibold">In-order Traversal:</text>
          <text x="10" y="35" className="text-xs fill-white">Left → Node → Right</text>
          <text x="10" y="50" className="text-xs fill-slate-300">Gives sorted sequence</text>
          <text x="10" y="65" className="text-xs fill-slate-300">for BST</text>
          
          {k > 0 && (
            <>
              <text x="10" y="85" className="text-xs fill-green-400 font-semibold">Target: {targetK}{getOrdinalSuffix(targetK)} smallest</text>
              <text x="10" y="100" className="text-xs fill-yellow-400">Found: {k} so far</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

export function KthSmallestElementInBSTVisualizer() {
  const [k, setK] = useState(3);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const tree = buildSampleBST();
    const newSteps = generateSteps(tree, k);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [k]);
  
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
        <h1 className="text-3xl font-bold mb-2">Kth Smallest Element in a BST</h1>
        <p className="text-slate-400">
          Find the kth smallest element in a Binary Search Tree using in-order traversal. 
          In-order traversal of a BST visits nodes in sorted order, so the kth node visited is the answer.
        </p>
      </div>
      
      {/* Input Control */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm text-slate-400">k = </label>
        <input
          type="number"
          min="1"
          max="8"
          value={k}
          onChange={(e) => setK(Number(e.target.value))}
          className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center"
        />
        <span className="text-sm text-slate-400">
          Find the {k}{getOrdinalSuffix(k)} smallest element
        </span>
        <button
          onClick={initializeSteps}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
        >
          Update
        </button>
      </div>
      
      {/* Tree Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">BST In-order Traversal</h3>
        {currentStepData && (
          <TreeVisualization
            tree={currentStepData.tree}
            currentNode={currentStepData.currentNode}
            visitedNodes={currentStepData.visitedNodes}
            stack={currentStepData.stack}
            targetK={currentStepData.targetK}
            k={currentStepData.k}
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
            <span className="text-sm">Currently Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-400"></div>
            <span className="text-sm">In Stack</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-purple-400"></div>
            <span className="text-sm">Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-400"></div>
            <span className="text-sm">Kth Element</span>
          </div>
        </div>
      </div>
      
      {/* In-order Result */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">In-order Traversal Result</h3>
        <div className="flex items-center justify-center gap-2 min-h-[60px]">
          {currentStepData?.inOrderResult.length === 0 ? (
            <span className="text-slate-500 italic">No elements visited yet</span>
          ) : (
            currentStepData?.inOrderResult.map((val, index) => (
              <motion.div
                key={`result-${index}-${val}`}
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                  index + 1 === currentStepData.targetK ? 'bg-green-500 text-white ring-2 ring-green-300' :
                  'bg-blue-500 text-white'
                }`}
              >
                {val}
              </motion.div>
            ))
          )}
        </div>
        {currentStepData?.inOrderResult.length > 0 && (
          <p className="text-center text-sm text-slate-400 mt-3">
            Sorted sequence: [{currentStepData.inOrderResult.join(', ')}]
            {currentStepData.result && (
              <span className="text-green-400 ml-2">
                → {currentStepData.targetK}{getOrdinalSuffix(currentStepData.targetK)} smallest = {currentStepData.result}
              </span>
            )}
          </p>
        )}
      </div>
      
      {/* Current Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${
              currentStepData?.type === 'complete' ? 'bg-green-500' :
              currentStepData?.type === 'found' ? 'bg-green-500' :
              currentStepData?.type === 'add-to-result' ? 'bg-purple-500' :
              currentStepData?.type === 'visit' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />
            <span className="text-lg">{currentStepData?.description || 'Ready to start'}</span>
          </div>
          {currentStepData?.result !== null && (
            <div className="bg-green-600 px-3 py-1 rounded-full text-sm font-semibold">
              Answer: {currentStepData.result}
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

// Approach 1: Iterative In-order Traversal (Optimal)
public int kthSmallest(TreeNode root, int k) {
    Stack<TreeNode> stack = new Stack<>();
    TreeNode current = root;
    int count = 0;
    
    while (current != null || !stack.isEmpty()) {
        // Go to leftmost node
        while (current != null) {
            stack.push(current);
            current = current.left;
        }
        
        // Process current node
        current = stack.pop();
        count++;
        
        // Found the kth smallest element
        if (count == k) {
            return current.val;
        }
        
        // Move to right subtree
        current = current.right;
    }
    
    return -1; // Should never reach here if k is valid
}

// Approach 2: Recursive In-order Traversal
class Solution {
    private int count = 0;
    private int result = -1;
    
    public int kthSmallest(TreeNode root, int k) {
        inOrder(root, k);
        return result;
    }
    
    private void inOrder(TreeNode node, int k) {
        if (node == null || count >= k) return;
        
        inOrder(node.left, k);  // Left
        
        count++;                // Process current node
        if (count == k) {
            result = node.val;
            return;
        }
        
        inOrder(node.right, k); // Right
    }
}

// Time: O(H + k) where H is tree height | Space: O(H) for recursion/stack`}
        </pre>
      </div>
      
      {/* Algorithm Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>Key Insight:</strong> In-order traversal of BST visits nodes in sorted order (ascending)</p>
          <p><strong>Time Complexity:</strong> O(H + k) where H is tree height</p>
          <p><strong>Space Complexity:</strong> O(H) for recursion stack or explicit stack</p>
          
          <div className="mt-4">
            <p><strong>In-order Traversal Steps:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Traverse left subtree completely</li>
              <li>Process current node (visit/count)</li>
              <li>Traverse right subtree</li>
            </ol>
          </div>
          
          <div className="mt-4">
            <p><strong>Why it works for BST:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>BST property: left ≤ root ≤ right</li>
              <li>In-order gives: [all left values] → root → [all right values]</li>
              <li>This naturally produces sorted sequence</li>
              <li>Kth element in sorted sequence = kth smallest</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <p><strong>Optimization:</strong> We can stop as soon as we find the kth element, no need to traverse the entire tree!</p>
          </div>
        </div>
      </div>
    </div>
  );
}