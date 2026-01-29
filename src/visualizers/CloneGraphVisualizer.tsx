import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface GraphNode {
  val: number;
  neighbors: GraphNode[];
}

interface Step {
  type: 'start' | 'visit' | 'create_clone' | 'connect_edge' | 'done';
  currentNodeVal: number | null;
  visitedNodes: Set<number>;
  cloneMap: Map<number, number>;
  currentCloneVal: number | null;
  description: string;
  visitingFrom?: number;
  connectingTo?: number;
}

// Create a sample graph with cycles
function createSampleGraph(): GraphNode {
  const node1: GraphNode = { val: 1, neighbors: [] };
  const node2: GraphNode = { val: 2, neighbors: [] };
  const node3: GraphNode = { val: 3, neighbors: [] };
  const node4: GraphNode = { val: 4, neighbors: [] };

  // Create connections: 1-2-4-3-1 (cycle) and 2-3 (additional edge)
  node1.neighbors = [node2, node4];
  node2.neighbors = [node1, node3];
  node3.neighbors = [node2, node4];
  node4.neighbors = [node1, node3];

  return node1;
}

function generateSteps(root: GraphNode | null): Step[] {
  if (!root) return [];

  const steps: Step[] = [];
  const visited = new Set<number>();
  const cloneMap = new Map<number, number>();
  const queue = [root];

  steps.push({
    type: 'start',
    currentNodeVal: null,
    visitedNodes: new Set(),
    cloneMap: new Map(),
    currentCloneVal: null,
    description: 'Starting BFS traversal to clone the graph using a HashMap to track original → clone mapping'
  });

  while (queue.length > 0) {
    const node = queue.shift()!;
    
    if (visited.has(node.val)) continue;
    
    // Visit current node
    visited.add(node.val);
    steps.push({
      type: 'visit',
      currentNodeVal: node.val,
      visitedNodes: new Set(visited),
      cloneMap: new Map(cloneMap),
      currentCloneVal: null,
      description: `Visiting node ${node.val}. Check if we've seen this node before.`
    });

    // Create clone if not exists
    if (!cloneMap.has(node.val)) {
      cloneMap.set(node.val, node.val); // For simplicity, clone value = original value
      steps.push({
        type: 'create_clone',
        currentNodeVal: node.val,
        visitedNodes: new Set(visited),
        cloneMap: new Map(cloneMap),
        currentCloneVal: node.val,
        description: `Node ${node.val} not cloned yet. Create clone node ${node.val} and add to HashMap.`
      });
    }

    // Process neighbors
    for (const neighbor of node.neighbors) {
      // Create neighbor clone if not exists
      if (!cloneMap.has(neighbor.val)) {
        cloneMap.set(neighbor.val, neighbor.val);
        steps.push({
          type: 'create_clone',
          currentNodeVal: neighbor.val,
          visitedNodes: new Set(visited),
          cloneMap: new Map(cloneMap),
          currentCloneVal: neighbor.val,
          description: `Neighbor ${neighbor.val} not cloned yet. Create clone node ${neighbor.val}.`
        });
      }

      // Connect edge in clone graph
      steps.push({
        type: 'connect_edge',
        currentNodeVal: node.val,
        visitedNodes: new Set(visited),
        cloneMap: new Map(cloneMap),
        currentCloneVal: null,
        visitingFrom: node.val,
        connectingTo: neighbor.val,
        description: `Connect edge from clone ${node.val} to clone ${neighbor.val} in the cloned graph.`
      });

      // Add to queue if not visited
      if (!visited.has(neighbor.val)) {
        queue.push(neighbor);
      }
    }
  }

  steps.push({
    type: 'done',
    currentNodeVal: null,
    visitedNodes: new Set(visited),
    cloneMap: new Map(cloneMap),
    currentCloneVal: null,
    description: 'Graph cloning complete! All nodes and edges have been copied to the new graph.'
  });

  return steps;
}

// Graph visualization component
function GraphDisplay({ 
  title, 
  isClone = false, 
  visitedNodes, 
  currentNode, 
  cloneMap, 
  connectingEdge 
}: {
  title: string;
  isClone?: boolean;
  visitedNodes: Set<number>;
  currentNode: number | null;
  cloneMap: Map<number, number>;
  connectingEdge?: { from: number; to: number } | null;
}) {
  const nodes = [
    { val: 1, x: 100, y: 50 },
    { val: 2, x: 200, y: 50 },
    { val: 3, x: 200, y: 150 },
    { val: 4, x: 100, y: 150 },
  ];

  const edges = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 1 },
    { from: 2, to: 3 },
  ];

  const getNodeColor = (nodeVal: number) => {
    if (currentNode === nodeVal) return 'bg-yellow-500';
    if (isClone && cloneMap.has(nodeVal)) return 'bg-green-500';
    if (!isClone && visitedNodes.has(nodeVal)) return 'bg-green-500';
    return 'bg-slate-600';
  };

  const getEdgeColor = (from: number, to: number) => {
    if (connectingEdge && connectingEdge.from === from && connectingEdge.to === to) {
      return 'stroke-yellow-400';
    }
    if (isClone && cloneMap.has(from) && cloneMap.has(to)) {
      return 'stroke-green-400';
    }
    if (!isClone && (visitedNodes.has(from) || visitedNodes.has(to))) {
      return 'stroke-blue-400';
    }
    return 'stroke-slate-500';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 flex-1">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 text-center">{title}</h3>
      <div className="relative">
        <svg width="300" height="200" className="mx-auto">
          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodes.find(n => n.val === edge.from)!;
            const toNode = nodes.find(n => n.val === edge.to)!;
            return (
              <motion.line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                strokeWidth={2}
                className={getEdgeColor(edge.from, edge.to)}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            );
          })}
          
          {/* Nodes */}
          {nodes.map((node) => (
            <motion.g key={node.val}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={20}
                className={`${getNodeColor(node.val)} stroke-white stroke-2`}
                initial={{ scale: 0 }}
                animate={{ scale: currentNode === node.val ? 1.3 : 1 }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                className="text-white font-bold text-sm fill-current"
              >
                {node.val}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// HashMap visualization
function HashMapDisplay({ cloneMap, currentCloneVal }: { cloneMap: Map<number, number>; currentCloneVal: number | null }) {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-slate-400 mb-4">
        HashMap <span className="text-slate-500">(original → clone)</span>
      </h3>
      <div className="space-y-2 min-h-[100px]">
        {cloneMap.size === 0 && (
          <span className="text-slate-500 italic">Empty HashMap</span>
        )}
        {Array.from(cloneMap.entries()).map(([original, clone]) => (
          <motion.div
            key={original}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              currentCloneVal === clone ? 'ring-2 ring-yellow-400' : ''
            } bg-slate-900/50`}
          >
            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-mono text-sm">
              {original}
            </span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 font-mono text-sm">
              {clone}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function CloneGraphVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const graph = createSampleGraph();
    const newSteps = generateSteps(graph);
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Clone Graph</h1>
        <p className="text-slate-400">
          Clone an undirected connected graph using BFS traversal and a HashMap to track 
          the mapping between original nodes and their clones.
        </p>
      </div>

      {/* Graph Visualization */}
      <div className="flex gap-6 mb-6">
        <GraphDisplay
          title="Original Graph"
          visitedNodes={step?.visitedNodes || new Set()}
          currentNode={step?.currentNodeVal || null}
          cloneMap={new Map()}
          connectingEdge={null}
        />
        <GraphDisplay
          title="Cloned Graph"
          isClone={true}
          visitedNodes={step?.visitedNodes || new Set()}
          currentNode={step?.currentCloneVal || null}
          cloneMap={step?.cloneMap || new Map()}
          connectingEdge={step?.visitingFrom && step?.connectingTo ? 
            { from: step.visitingFrom, to: step.connectingTo } : null}
        />
      </div>

      {/* HashMap Visualization */}
      <div className="mb-6">
        <HashMapDisplay
          cloneMap={step?.cloneMap || new Map()}
          currentCloneVal={step?.currentCloneVal || null}
        />
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'visit' ? 'bg-blue-500' :
            step?.type === 'create_clone' ? 'bg-yellow-500' :
            step?.type === 'connect_edge' ? 'bg-purple-500' :
            'bg-slate-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready to start'}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Currently visiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Visited/Cloned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
            <span>Not visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-yellow-400"></div>
            <span>Connecting edge</span>
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

      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code (BFS Approach)</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public Node cloneGraph(Node node) {
    if (node == null) return null;
    
    Map<Node, Node> map = new HashMap<>();
    Queue<Node> queue = new LinkedList<>();
    
    // Create clone of starting node and add to queue
    map.put(node, new Node(node.val));
    queue.offer(node);
    
    while (!queue.isEmpty()) {
        Node curr = queue.poll();
        
        for (Node neighbor : curr.neighbors) {
            // Create clone if it doesn't exist
            if (!map.containsKey(neighbor)) {
                map.put(neighbor, new Node(neighbor.val));
                queue.offer(neighbor);
            }
            
            // Connect the cloned nodes
            map.get(curr).neighbors.add(map.get(neighbor));
        }
    }
    
    return map.get(node);
}

// Time: O(N + M) where N = nodes, M = edges
// Space: O(N) for the HashMap and queue`}
        </pre>
      </div>

      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Key Insights</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>HashMap Usage:</strong> Maps original nodes to their clones to avoid creating duplicates and enable proper edge connections.</p>
          <p><strong>Two-step Process:</strong> (1) Create clone nodes, (2) Connect edges between clones using the HashMap lookup.</p>
          <p><strong>BFS vs DFS:</strong> Both work equally well. BFS uses a queue, DFS uses recursion with the same HashMap approach.</p>
          <p><strong>Edge Case:</strong> Handle null input and ensure you return the clone of the original starting node.</p>
        </div>
      </div>
    </div>
  );
}