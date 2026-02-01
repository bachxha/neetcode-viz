import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  distance: number;
  state: 'unvisited' | 'visited' | 'current' | 'unreachable';
}

interface Edge {
  from: number;
  to: number;
  weight: number;
  state: 'normal' | 'exploring' | 'shortest' | 'relaxed';
}

interface Step {
  type: 'start' | 'visit' | 'explore' | 'relax' | 'complete' | 'result';
  currentNode: number | null;
  distances: Map<number, number>;
  nodeStates: Map<number, 'unvisited' | 'visited' | 'current' | 'unreachable'>;
  edgeStates: Map<string, 'normal' | 'exploring' | 'shortest' | 'relaxed'>;
  priorityQueue: Array<{ node: number; distance: number }>;
  description: string;
  maxTime?: number;
  reachableNodes?: number;
}

interface Example {
  name: string;
  nodes: Node[];
  edges: Edge[];
  sourceNode: number;
  nodeCount: number;
  description: string;
}

const examples: Example[] = [
  {
    name: "Simple Network",
    description: "A simple network where signal can reach all nodes",
    sourceNode: 2,
    nodeCount: 4,
    nodes: [
      { id: 1, label: "1", x: 100, y: 100, distance: Infinity, state: 'unvisited' },
      { id: 2, label: "2", x: 200, y: 50, distance: 0, state: 'current' },
      { id: 3, label: "3", x: 300, y: 100, distance: Infinity, state: 'unvisited' },
      { id: 4, label: "4", x: 200, y: 150, distance: Infinity, state: 'unvisited' },
    ],
    edges: [
      { from: 2, to: 1, weight: 1, state: 'normal' },
      { from: 2, to: 3, weight: 1, state: 'normal' },
      { from: 1, to: 3, weight: 3, state: 'normal' },
      { from: 3, to: 4, weight: 1, state: 'normal' },
    ]
  },
  {
    name: "Disconnected Network",
    description: "A network where not all nodes are reachable",
    sourceNode: 1,
    nodeCount: 4,
    nodes: [
      { id: 1, label: "1", x: 100, y: 100, distance: 0, state: 'current' },
      { id: 2, label: "2", x: 250, y: 50, distance: Infinity, state: 'unvisited' },
      { id: 3, label: "3", x: 100, y: 200, distance: Infinity, state: 'unvisited' },
      { id: 4, label: "4", x: 300, y: 200, distance: Infinity, state: 'unvisited' },
    ],
    edges: [
      { from: 1, to: 2, weight: 2, state: 'normal' },
      { from: 1, to: 3, weight: 4, state: 'normal' },
      // Node 4 is disconnected - signal can't reach it
    ]
  },
  {
    name: "Complex Network",
    description: "A more complex network with multiple paths",
    sourceNode: 1,
    nodeCount: 6,
    nodes: [
      { id: 1, label: "1", x: 50, y: 120, distance: 0, state: 'current' },
      { id: 2, label: "2", x: 180, y: 60, distance: Infinity, state: 'unvisited' },
      { id: 3, label: "3", x: 180, y: 180, distance: Infinity, state: 'unvisited' },
      { id: 4, label: "4", x: 310, y: 60, distance: Infinity, state: 'unvisited' },
      { id: 5, label: "5", x: 310, y: 180, distance: Infinity, state: 'unvisited' },
      { id: 6, label: "6", x: 430, y: 120, distance: Infinity, state: 'unvisited' },
    ],
    edges: [
      { from: 1, to: 2, weight: 1, state: 'normal' },
      { from: 1, to: 3, weight: 4, state: 'normal' },
      { from: 2, to: 3, weight: 2, state: 'normal' },
      { from: 2, to: 4, weight: 5, state: 'normal' },
      { from: 3, to: 5, weight: 3, state: 'normal' },
      { from: 4, to: 6, weight: 2, state: 'normal' },
      { from: 5, to: 6, weight: 1, state: 'normal' },
    ]
  }
];

function generateSteps(nodes: Node[], edges: Edge[], sourceNode: number, nodeCount: number): Step[] {
  const steps: Step[] = [];
  const distances = new Map<number, number>();
  const nodeStates = new Map<number, 'unvisited' | 'visited' | 'current' | 'unreachable'>();
  const edgeStates = new Map<string, 'normal' | 'exploring' | 'shortest' | 'relaxed'>();
  const priorityQueue: Array<{ node: number; distance: number }> = [];

  // Initialize distances and states
  nodes.forEach(node => {
    distances.set(node.id, node.id === sourceNode ? 0 : Infinity);
    nodeStates.set(node.id, node.id === sourceNode ? 'current' : 'unvisited');
  });

  edges.forEach(edge => {
    edgeStates.set(`${edge.from}-${edge.to}`, 'normal');
  });

  // Build adjacency list
  const adjList = new Map<number, Array<{ to: number; weight: number }>>();
  nodes.forEach(node => adjList.set(node.id, []));
  edges.forEach(edge => {
    const neighbors = adjList.get(edge.from) || [];
    neighbors.push({ to: edge.to, weight: edge.weight });
    adjList.set(edge.from, neighbors);
  });

  // Initialize priority queue with source
  priorityQueue.push({ node: sourceNode, distance: 0 });

  steps.push({
    type: 'start',
    currentNode: sourceNode,
    distances: new Map(distances),
    nodeStates: new Map(nodeStates),
    edgeStates: new Map(edgeStates),
    priorityQueue: [...priorityQueue],
    description: `Starting Dijkstra's algorithm from node ${sourceNode}. All nodes start with distance ∞ except source (distance 0).`
  });

  // Dijkstra's algorithm
  while (priorityQueue.length > 0) {
    // Sort priority queue by distance (min-heap simulation)
    priorityQueue.sort((a, b) => a.distance - b.distance);
    const current = priorityQueue.shift()!;

    // Skip if we've already visited with a better distance
    if (current.distance > (distances.get(current.node) || Infinity)) {
      continue;
    }

    // Skip if already visited
    if (nodeStates.get(current.node) === 'visited') {
      continue;
    }

    // Visit current node
    nodeStates.set(current.node, 'current');
    steps.push({
      type: 'visit',
      currentNode: current.node,
      distances: new Map(distances),
      nodeStates: new Map(nodeStates),
      edgeStates: new Map(edgeStates),
      priorityQueue: [...priorityQueue],
      description: `Visiting node ${current.node} with current shortest distance ${current.distance === Infinity ? '∞' : current.distance}.`
    });

    // Explore neighbors
    const neighbors = adjList.get(current.node) || [];
    for (const neighbor of neighbors) {
      const edgeKey = `${current.node}-${neighbor.to}`;
      edgeStates.set(edgeKey, 'exploring');
      
      steps.push({
        type: 'explore',
        currentNode: current.node,
        distances: new Map(distances),
        nodeStates: new Map(nodeStates),
        edgeStates: new Map(edgeStates),
        priorityQueue: [...priorityQueue],
        description: `Exploring edge from node ${current.node} to node ${neighbor.to} with weight ${neighbor.weight}.`
      });

      const newDistance = current.distance + neighbor.weight;
      const currentDistance = distances.get(neighbor.to) || Infinity;

      if (newDistance < currentDistance) {
        // Relax the edge
        distances.set(neighbor.to, newDistance);
        priorityQueue.push({ node: neighbor.to, distance: newDistance });
        edgeStates.set(edgeKey, 'relaxed');
        
        steps.push({
          type: 'relax',
          currentNode: current.node,
          distances: new Map(distances),
          nodeStates: new Map(nodeStates),
          edgeStates: new Map(edgeStates),
          priorityQueue: [...priorityQueue],
          description: `Relaxing edge! New shorter path to node ${neighbor.to}: ${newDistance} < ${currentDistance === Infinity ? '∞' : currentDistance}.`
        });
      } else {
        edgeStates.set(edgeKey, 'normal');
        steps.push({
          type: 'explore',
          currentNode: current.node,
          distances: new Map(distances),
          nodeStates: new Map(nodeStates),
          edgeStates: new Map(edgeStates),
          priorityQueue: [...priorityQueue],
          description: `No improvement: distance ${newDistance} ≥ current distance ${currentDistance === Infinity ? '∞' : currentDistance} to node ${neighbor.to}.`
        });
      }
    }

    // Mark as visited
    nodeStates.set(current.node, 'visited');
  }

  // Mark unreachable nodes
  nodes.forEach(node => {
    if (distances.get(node.id) === Infinity) {
      nodeStates.set(node.id, 'unreachable');
    }
  });

  steps.push({
    type: 'complete',
    currentNode: null,
    distances: new Map(distances),
    nodeStates: new Map(nodeStates),
    edgeStates: new Map(edgeStates),
    priorityQueue: [],
    description: 'Algorithm complete! All reachable nodes have been processed.'
  });

  // Calculate result
  let maxTime = -1;
  let reachableNodes = 0;
  
  for (let i = 1; i <= nodeCount; i++) {
    const dist = distances.get(i);
    if (dist !== undefined && dist !== Infinity) {
      maxTime = Math.max(maxTime, dist);
      reachableNodes++;
    }
  }

  const finalMaxTime = reachableNodes === nodeCount ? maxTime : -1;

  steps.push({
    type: 'result',
    currentNode: null,
    distances: new Map(distances),
    nodeStates: new Map(nodeStates),
    edgeStates: new Map(edgeStates),
    priorityQueue: [],
    maxTime: finalMaxTime,
    reachableNodes,
    description: reachableNodes === nodeCount 
      ? `Success! All ${nodeCount} nodes are reachable. Maximum delay time: ${maxTime}`
      : `Failed! Only ${reachableNodes}/${nodeCount} nodes are reachable. Some nodes cannot receive the signal.`
  });

  return steps;
}

export function NetworkDelayTimeVisualizer() {
  const [currentExample, setCurrentExample] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const example = examples[currentExample];
  const steps = generateSteps(example.nodes, example.edges, example.sourceNode, example.nodeCount);
  const step = steps[currentStep];

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    let timeout: number;
    if (isPlaying && currentStep < steps.length - 1) {
      timeout = setTimeout(nextStep, 1000 / speed);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, currentStep, steps.length, speed, nextStep]);

  useEffect(() => {
    reset();
  }, [currentExample, reset]);

  const getNodeColor = (state: string) => {
    switch (state) {
      case 'current': return 'bg-blue-500 border-blue-400';
      case 'visited': return 'bg-green-500 border-green-400';
      case 'unreachable': return 'bg-red-500 border-red-400';
      default: return 'bg-gray-500 border-gray-400';
    }
  };

  const getNodeTextColor = (state: string) => {
    switch (state) {
      case 'current': return 'text-blue-100';
      case 'visited': return 'text-green-100';
      case 'unreachable': return 'text-red-100';
      default: return 'text-gray-100';
    }
  };

  const getEdgeColor = (state: string) => {
    switch (state) {
      case 'exploring': return 'stroke-yellow-400';
      case 'relaxed': return 'stroke-green-400';
      case 'shortest': return 'stroke-blue-400';
      default: return 'stroke-gray-400';
    }
  };

  const getEdgeWidth = (state: string) => {
    switch (state) {
      case 'exploring': return '3';
      case 'relaxed': return '4';
      case 'shortest': return '3';
      default: return '2';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Network Delay Time</h1>
        <p className="text-slate-400 mb-4">
          Find the minimum time for a signal to reach all nodes in a network using Dijkstra's algorithm.
        </p>
        
        {/* Example Selector */}
        <div className="flex gap-2 mb-4">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentExample(idx)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                idx === currentExample
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>
        
        <p className="text-slate-300 text-sm">{example.description}</p>
        <p className="text-slate-400 text-xs mt-1">
          Source node: {example.sourceNode} | Total nodes: {example.nodeCount}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-lg p-6 h-96">
            <svg width="100%" height="100%" viewBox="0 0 500 300">
              {/* Edges */}
              {example.edges.map((edge, idx) => {
                const fromNode = example.nodes.find(n => n.id === edge.from)!;
                const toNode = example.nodes.find(n => n.id === edge.to)!;
                const edgeState = step.edgeStates.get(`${edge.from}-${edge.to}`) || 'normal';
                
                // Calculate arrow position
                const dx = toNode.x - fromNode.x;
                const dy = toNode.y - fromNode.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const unitX = dx / length;
                const unitY = dy / length;
                const arrowX = toNode.x - unitX * 25;
                const arrowY = toNode.y - unitY * 25;
                
                return (
                  <g key={idx}>
                    <motion.line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={arrowX}
                      y2={arrowY}
                      className={getEdgeColor(edgeState)}
                      strokeWidth={getEdgeWidth(edgeState)}
                      animate={{ 
                        strokeWidth: getEdgeWidth(edgeState),
                        opacity: edgeState === 'exploring' ? 0.8 : 0.6 
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    {/* Arrow head */}
                    <motion.polygon
                      points={`${arrowX},${arrowY} ${arrowX - unitX * 8 + unitY * 4},${arrowY - unitY * 8 - unitX * 4} ${arrowX - unitX * 8 - unitY * 4},${arrowY - unitY * 8 + unitX * 4}`}
                      className={getEdgeColor(edgeState)}
                      fill="currentColor"
                      animate={{ opacity: edgeState === 'exploring' ? 0.8 : 0.6 }}
                    />
                    {/* Weight label */}
                    <text
                      x={fromNode.x + (toNode.x - fromNode.x) * 0.5}
                      y={fromNode.y + (toNode.y - fromNode.y) * 0.5 - 8}
                      className="text-xs fill-slate-300 text-center"
                      textAnchor="middle"
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {example.nodes.map((node) => {
                const nodeState = step.nodeStates.get(node.id) || 'unvisited';
                const distance = step.distances.get(node.id) || Infinity;
                
                return (
                  <g key={node.id}>
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r="20"
                      className={getNodeColor(nodeState)}
                      animate={{ scale: nodeState === 'current' ? 1.2 : 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <text
                      x={node.x}
                      y={node.y - 2}
                      className={`text-sm font-bold ${getNodeTextColor(nodeState)} text-center`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {node.label}
                    </text>
                    {/* Distance label */}
                    <text
                      x={node.x}
                      y={node.y + 35}
                      className="text-xs fill-slate-300 text-center"
                      textAnchor="middle"
                    >
                      d: {distance === Infinity ? '∞' : distance}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500 border border-gray-400"></div>
              <span className="text-slate-300">Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border border-blue-400"></div>
              <span className="text-slate-300">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border border-green-400"></div>
              <span className="text-slate-300">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border border-red-400"></div>
              <span className="text-slate-300">Unreachable</span>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Algorithm Status</h3>
            <div className="space-y-2 text-sm">
              <div>Step: {currentStep + 1} / {steps.length}</div>
              <div>Type: {step.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
              {step.currentNode !== null && (
                <div>Current Node: {step.currentNode}</div>
              )}
              {step.priorityQueue.length > 0 && (
                <div className="mt-2">
                  <div className="text-slate-400">Priority Queue:</div>
                  <div className="text-xs space-y-1 mt-1">
                    {step.priorityQueue.slice(0, 3).map((item, idx) => (
                      <div key={idx}>Node {item.node}: {item.distance}</div>
                    ))}
                    {step.priorityQueue.length > 3 && (
                      <div className="text-slate-500">...and {step.priorityQueue.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          {step.type === 'result' && (
            <div className={`p-4 rounded-lg ${
              (step.maxTime ?? -1) >= 0 ? 'bg-green-900 border border-green-500' : 'bg-red-900 border border-red-500'
            }`}>
              <h3 className="font-semibold mb-2">Result</h3>
              <div className="text-sm space-y-1">
                <div>Max Delay Time: {step.maxTime ?? 'N/A'}</div>
                <div>Reachable Nodes: {step.reachableNodes}/{example.nodeCount}</div>
              </div>
            </div>
          )}

          {/* Current Distances */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Current Distances</h3>
            <div className="space-y-1 text-sm">
              {Array.from(step.distances.entries()).map(([nodeId, distance]) => (
                <div key={nodeId} className="flex justify-between">
                  <span>Node {nodeId}:</span>
                  <span className={distance === Infinity ? 'text-red-400' : 'text-green-400'}>
                    {distance === Infinity ? '∞' : distance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Current Step</h3>
            <p className="text-sm text-slate-300">{step.description}</p>
          </div>
        </div>
      </div>

      <Controls
        onStepBack={prevStep}
        onStepForward={nextStep}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onReset={reset}
        isPlaying={isPlaying}
        canStepBack={currentStep > 0}
        canStepForward={currentStep < steps.length - 1}
        currentStep={currentStep + 1}
        totalSteps={steps.length}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}