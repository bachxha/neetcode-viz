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
  type: 'start' | 'check' | 'go_left' | 'go_right' | 'found_lca' | 'complete';
  currentNode: string | null;
  p: number;
  q: number;
  pNodeId: string;
  qNodeId: string;
  path: string[];
  tree: TreeNode | null;
  description: string;
  lcaNodeId: string | null;
  reason: string;
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

function findNodeByVal(tree: TreeNode | null, val: number): TreeNode | null {
  if (!tree) return null;
  if (tree.val === val) return tree;
  return findNodeByVal(tree.left, val) || findNodeByVal(tree.right, val);
}

function buildSampleBST(): TreeNode {
  // BST:        6
  //           /   \
  //          2     8
  //         / \   / \
  //        0   4 7   9
  //           / \
  //          3   5
  const root = createNode(6);
  root.left = createNode(2);
  root.right = createNode(8);
  root.left.left = createNode(0);
  root.left.right = createNode(4);
  root.right.left = createNode(7);
  root.right.right = createNode(9);
  root.left.right.left = createNode(3);
  root.left.right.right = createNode(5);
  return root;
}

interface PQPair {
  p: number;
  q: number;
  description: string;
}

const samplePairs: PQPair[] = [
  { p: 2, q: 8, description: "p and q in different subtrees → LCA = 6" },
  { p: 2, q: 4, description: "p is ancestor of q → LCA = 2" },
  { p: 3, q: 5, description: "p and q have common ancestor → LCA = 4" },
  { p: 7, q: 9, description: "p and q in same subtree → LCA = 8" },
  { p: 0, q: 5, description: "Deep nodes in left subtree → LCA = 2" },
];

function generateSteps(root: TreeNode | null, p: number, q: number): Step[] {
  if (!root) return [];
  
  const steps: Step[] = [];
  const tree = cloneTree(root);
  const path: string[] = [];
  
  const pNode = findNodeByVal(tree, p);
  const qNode = findNodeByVal(tree, q);
  
  if (!pNode || !qNode) return [];
  
  steps.push({
    type: 'start',
    currentNode: null,
    p,
    q,
    pNodeId: pNode!.id,
    qNodeId: qNode!.id,
    path: [],
    tree: cloneTree(tree),
    description: `Finding LCA of nodes ${p} and ${q}. Using BST property to navigate efficiently.`,
    lcaNodeId: null,
    reason: ''
  });
  
  function findLCA(node: TreeNode | null): TreeNode | null {
    if (!node) return null;
    
    path.push(node.id);
    
    steps.push({
      type: 'check',
      currentNode: node.id,
      p,
      q,
      pNodeId: pNode!.id,
      qNodeId: qNode!.id,
      path: [...path],
      tree: cloneTree(tree),
      description: `At node ${node.val}: Checking if both ${p} and ${q} can be found in different subtrees`,
      lcaNodeId: null,
      reason: ''
    });
    
    // If both p and q are smaller than current node, go left
    if (p < node.val && q < node.val) {
      steps.push({
        type: 'go_left',
        currentNode: node.id,
        p,
        q,
        pNodeId: pNode!.id,
        qNodeId: qNode!.id,
        path: [...path],
        tree: cloneTree(tree),
        description: `Both ${p} and ${q} are smaller than ${node.val}, so both must be in the left subtree`,
        lcaNodeId: null,
        reason: ''
      });
      return findLCA(node.left);
    }
    
    // If both p and q are greater than current node, go right
    if (p > node.val && q > node.val) {
      steps.push({
        type: 'go_right',
        currentNode: node.id,
        p,
        q,
        pNodeId: pNode!.id,
        qNodeId: qNode!.id,
        path: [...path],
        tree: cloneTree(tree),
        description: `Both ${p} and ${q} are greater than ${node.val}, so both must be in the right subtree`,
        lcaNodeId: null,
        reason: ''
      });
      return findLCA(node.right);
    }
    
    // Otherwise, current node is the LCA
    let reason = '';
    if (node.val === p || node.val === q) {
      const other = node.val === p ? q : p;
      reason = `Node ${node.val} is one of the target nodes, and ${other} is in its subtree`;
    } else {
      reason = `${p} and ${q} split here: one goes left (${Math.min(p, q)} < ${node.val}), one goes right (${Math.max(p, q)} > ${node.val})`;
    }
    
    steps.push({
      type: 'found_lca',
      currentNode: node.id,
      p,
      q,
      pNodeId: pNode!.id,
      qNodeId: qNode!.id,
      path: [...path],
      tree: cloneTree(tree),
      description: `Found LCA: Node ${node.val}`,
      lcaNodeId: node.id,
      reason
    });
    
    return node;
  }
  
  const lca = findLCA(tree);
  
  steps.push({
    type: 'complete',
    currentNode: lca?.id || null,
    p,
    q,
    pNodeId: pNode!.id,
    qNodeId: qNode!.id,
    path: [...path],
    tree: cloneTree(tree),
    description: `Algorithm complete! LCA of ${p} and ${q} is ${lca?.val}`,
    lcaNodeId: lca?.id || null,
    reason: ''
  });
  
  return steps;
}

interface TreeVisualizationProps {
  tree: TreeNode | null;
  currentNode: string | null;
  pNodeId: string;
  qNodeId: string;
  path: string[];
  lcaNodeId: string | null;
}

function TreeVisualization({ tree, currentNode, pNodeId, qNodeId, path, lcaNodeId }: TreeVisualizationProps) {
  if (!tree) return null;
  
  const renderNode = (node: TreeNode | null, x: number, y: number, level: number): React.ReactElement[] => {
    if (!node) return [];
    
    const elements: React.ReactElement[] = [];
    const nodeRadius = 35;
    const levelSpacing = 100;
    const horizontalSpacing = Math.max(120, 200 / (level + 1));
    
    // Determine node color based on state
    let nodeColor = 'bg-slate-700 border-slate-500 text-white';
    if (lcaNodeId === node.id) {
      nodeColor = 'bg-purple-500 border-purple-400 text-white';
    } else if (currentNode === node.id) {
      nodeColor = 'bg-yellow-500 border-yellow-400 text-black';
    } else if (pNodeId === node.id) {
      nodeColor = 'bg-blue-500 border-blue-400 text-white';
    } else if (qNodeId === node.id) {
      nodeColor = 'bg-green-500 border-green-400 text-white';
    } else if (path.includes(node.id)) {
      nodeColor = 'bg-orange-500 border-orange-400 text-white';
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
    
    // Draw node with animation
    elements.push(
      <motion.g
        key={`node-${node.id}`}
        animate={{ 
          scale: currentNode === node.id ? 1.3 : lcaNodeId === node.id ? 1.2 : 1 
        }}
        transition={{ duration: 0.4, type: "spring" }}
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
          className="text-lg font-bold pointer-events-none"
          style={{ 
            fill: nodeColor.includes('yellow') || nodeColor.includes('black') ? 'black' : 'white' 
          }}
        >
          {node.val}
        </text>
      </motion.g>
    );
    
    return elements;
  };
  
  return (
    <div className="flex justify-center">
      <svg width="1000" height="600" className="bg-slate-900 rounded-lg border border-slate-700">
        {renderNode(tree, 500, 80, 0)}
      </svg>
    </div>
  );
}

export function LowestCommonAncestorBSTVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedPair, setSelectedPair] = useState(0);
  const [tree] = useState(() => buildSampleBST());
  
  const initializeSteps = useCallback(() => {
    const pair = samplePairs[selectedPair];
    const newSteps = generateSteps(tree, pair.p, pair.q);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [selectedPair, tree]);
  
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
  const currentPair = samplePairs[selectedPair];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Lowest Common Ancestor of a Binary Search Tree</h1>
        <p className="text-slate-400">
          Find the lowest common ancestor (LCA) of two nodes in a BST. The LCA is the deepest node 
          that has both p and q as descendants (where we allow a node to be a descendant of itself).
        </p>
      </div>
      
      {/* Sample Pairs Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Choose p and q values:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {samplePairs.map((pair, index) => (
            <button
              key={index}
              onClick={() => setSelectedPair(index)}
              className={`p-3 rounded-lg text-left transition-colors border ${
                selectedPair === index 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500'
              }`}
            >
              <div className="font-mono font-bold">p = {pair.p}, q = {pair.q}</div>
              <div className="text-sm opacity-75 mt-1">{pair.description}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 text-center text-sm text-slate-400">
          Currently: p = <span className="text-blue-400 font-bold">{currentPair?.p}</span>, 
          q = <span className="text-green-400 font-bold">{currentPair?.q}</span>
        </div>
      </div>
      
      {/* Tree Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">BST Traversal for LCA</h3>
        {currentStepData && (
          <TreeVisualization
            tree={currentStepData.tree}
            currentNode={currentStepData.currentNode}
            pNodeId={currentStepData.pNodeId}
            qNodeId={currentStepData.qNodeId}
            path={currentStepData.path}
            lcaNodeId={currentStepData.lcaNodeId}
          />
        )}
      </div>
      
      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Legend</h3>
        <div className="flex gap-6 flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-500"></div>
            <span className="text-sm">Regular Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-400"></div>
            <span className="text-sm">Node p</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-400"></div>
            <span className="text-sm">Node q</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-yellow-400"></div>
            <span className="text-sm">Currently Visiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-orange-400"></div>
            <span className="text-sm">Visited in Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-purple-400"></div>
            <span className="text-sm">LCA Found</span>
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              currentStepData?.type === 'complete' ? 'bg-purple-500' :
              currentStepData?.type === 'found_lca' ? 'bg-purple-500' :
              currentStepData?.type === 'go_left' ? 'bg-orange-500' :
              currentStepData?.type === 'go_right' ? 'bg-orange-500' :
              currentStepData?.type === 'check' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />
            <span className="text-lg">{currentStepData?.description || 'Ready to start'}</span>
          </div>
          {currentStepData?.reason && (
            <div className="ml-5 text-sm text-slate-400 bg-slate-900/50 p-3 rounded">
              <span className="text-purple-400 font-semibold">Why this is the LCA:</span> {currentStepData.reason}
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
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code - Iterative Approach</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */

public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    TreeNode current = root;
    
    while (current != null) {
        // If both p and q are smaller, go left
        if (p.val < current.val && q.val < current.val) {
            current = current.left;
        }
        // If both p and q are larger, go right  
        else if (p.val > current.val && q.val > current.val) {
            current = current.right;
        }
        // Otherwise, we found the LCA
        else {
            return current;
        }
    }
    
    return null; // This should never happen if p and q exist in the tree
}

// Recursive approach (also valid)
public TreeNode lowestCommonAncestorRecursive(TreeNode root, TreeNode p, TreeNode q) {
    // Base case
    if (root == null) return null;
    
    // If both p and q are smaller than root, LCA is in left subtree
    if (p.val < root.val && q.val < root.val) {
        return lowestCommonAncestorRecursive(root.left, p, q);
    }
    
    // If both p and q are larger than root, LCA is in right subtree
    if (p.val > root.val && q.val > root.val) {
        return lowestCommonAncestorRecursive(root.right, p, q);
    }
    
    // Otherwise, current node is the LCA
    return root;
}`}
        </pre>
      </div>
      
      {/* Algorithm Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>Time Complexity:</strong> O(log n) average, O(n) worst case - we traverse at most one path from root to leaf</p>
          <p><strong>Space Complexity:</strong> O(1) for iterative, O(log n) for recursive (due to call stack)</p>
          
          <div className="mt-4">
            <p><strong>Key BST Property:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>In a BST, all nodes in left subtree are smaller than root</li>
              <li>All nodes in right subtree are larger than root</li>
              <li>This allows us to efficiently determine which direction to go</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <p><strong>LCA Detection:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>If both p and q are smaller than current node → go left</li>
              <li>If both p and q are larger than current node → go right</li>
              <li>If p and q are on different sides (or one equals current) → found LCA</li>
              <li>The LCA is where the paths to p and q first diverge</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <p><strong>Why This Works:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>LCA is the deepest node that has both p and q in its subtree</li>
              <li>Once p and q split to different subtrees, we've found the split point</li>
              <li>BST property guarantees we take the optimal path</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}