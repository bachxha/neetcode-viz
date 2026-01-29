import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface CacheNode {
  key: number;
  value: number;
  prev: number | null; // index in nodes array
  next: number | null; // index in nodes array
}

interface CacheState {
  nodes: CacheNode[];
  hashMap: Map<number, number>; // key -> node index
  head: number | null; // most recently used
  tail: number | null; // least recently used
  capacity: number;
  size: number;
}

interface Step {
  type: 'start' | 'get-hit' | 'get-miss' | 'put-new' | 'put-update' | 'put-evict' | 'move-to-front' | 'done';
  operation: string;
  key?: number;
  value?: number;
  state: CacheState;
  description: string;
  highlightedNodes: number[];
  highlightColors: { [nodeIndex: number]: string };
  evictedNode?: { key: number; value: number };
}

class LRUCache {
  private capacity: number;
  private nodes: CacheNode[] = [];
  private hashMap = new Map<number, number>();
  private head: number | null = null;
  private tail: number | null = null;
  private nextIndex = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  private moveToHead(nodeIndex: number) {
    const node = this.nodes[nodeIndex];
    
    // Remove from current position
    if (node.prev !== null) {
      this.nodes[node.prev].next = node.next;
    } else {
      this.head = node.next;
    }
    
    if (node.next !== null) {
      this.nodes[node.next].prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    
    // Add to head
    node.prev = null;
    node.next = this.head;
    
    if (this.head !== null) {
      this.nodes[this.head].prev = nodeIndex;
    }
    
    this.head = nodeIndex;
    
    if (this.tail === null) {
      this.tail = nodeIndex;
    }
  }

  private addToHead(key: number, value: number): number {
    const nodeIndex = this.nextIndex++;
    const newNode: CacheNode = {
      key,
      value,
      prev: null,
      next: this.head,
    };
    
    this.nodes[nodeIndex] = newNode;
    
    if (this.head !== null) {
      this.nodes[this.head].prev = nodeIndex;
    }
    
    this.head = nodeIndex;
    
    if (this.tail === null) {
      this.tail = nodeIndex;
    }
    
    this.hashMap.set(key, nodeIndex);
    return nodeIndex;
  }

  private removeTail(): { key: number; value: number } {
    if (this.tail === null) {
      throw new Error('Cannot remove from empty cache');
    }
    
    const tailNode = this.nodes[this.tail];
    const result = { key: tailNode.key, value: tailNode.value };
    
    this.hashMap.delete(tailNode.key);
    
    if (tailNode.prev !== null) {
      this.nodes[tailNode.prev].next = null;
      this.tail = tailNode.prev;
    } else {
      this.head = null;
      this.tail = null;
    }
    
    return result;
  }

  getState(): CacheState {
    return {
      nodes: [...this.nodes],
      hashMap: new Map(this.hashMap),
      head: this.head,
      tail: this.tail,
      capacity: this.capacity,
      size: this.hashMap.size,
    };
  }

  get(key: number): number | null {
    const nodeIndex = this.hashMap.get(key);
    if (nodeIndex === undefined) {
      return null;
    }
    
    this.moveToHead(nodeIndex);
    return this.nodes[nodeIndex].value;
  }

  put(key: number, value: number): { evicted?: { key: number; value: number } } {
    const existingIndex = this.hashMap.get(key);
    
    if (existingIndex !== undefined) {
      // Update existing
      this.nodes[existingIndex].value = value;
      this.moveToHead(existingIndex);
      return {};
    }
    
    // Add new
    let evicted: { key: number; value: number } | undefined;
    
    if (this.hashMap.size >= this.capacity) {
      evicted = this.removeTail();
    }
    
    this.addToHead(key, value);
    
    return { evicted };
  }
}

function generateSteps(operations: { type: 'get' | 'put'; key: number; value?: number }[], capacity: number): Step[] {
  const steps: Step[] = [];
  const cache = new LRUCache(capacity);
  
  steps.push({
    type: 'start',
    operation: `LRUCache(${capacity})`,
    state: cache.getState(),
    description: `Initialize LRU Cache with capacity ${capacity}. Both doubly linked list and hashmap are empty.`,
    highlightedNodes: [],
    highlightColors: {},
  });
  
  for (const op of operations) {
    if (op.type === 'get') {
      const value = cache.get(op.key);
      const nodeIndex = cache.getState().hashMap.get(op.key);
      
      if (value !== null) {
        steps.push({
          type: 'get-hit',
          operation: `get(${op.key}) → ${value}`,
          key: op.key,
          state: cache.getState(),
          description: `Cache hit! Key ${op.key} found with value ${value}. Moving node to front (most recently used).`,
          highlightedNodes: nodeIndex !== undefined ? [nodeIndex] : [],
          highlightColors: nodeIndex !== undefined ? { [nodeIndex]: '#facc15' } : {},
        });
      } else {
        steps.push({
          type: 'get-miss',
          operation: `get(${op.key}) → -1`,
          key: op.key,
          state: cache.getState(),
          description: `Cache miss! Key ${op.key} not found in hashmap. Return -1.`,
          highlightedNodes: [],
          highlightColors: {},
        });
      }
    } else {
      const stateBefore = cache.getState();
      const existingIndex = stateBefore.hashMap.get(op.key);
      const result = cache.put(op.key, op.value!);
      const stateAfter = cache.getState();
      const newNodeIndex = stateAfter.hashMap.get(op.key);
      
      if (existingIndex !== undefined) {
        steps.push({
          type: 'put-update',
          operation: `put(${op.key}, ${op.value})`,
          key: op.key,
          value: op.value,
          state: stateAfter,
          description: `Key ${op.key} exists. Update value to ${op.value} and move to front (most recently used).`,
          highlightedNodes: newNodeIndex !== undefined ? [newNodeIndex] : [],
          highlightColors: newNodeIndex !== undefined ? { [newNodeIndex]: '#facc15' } : {},
        });
      } else {
        if (result.evicted) {
          steps.push({
            type: 'put-evict',
            operation: `put(${op.key}, ${op.value})`,
            key: op.key,
            value: op.value,
            state: stateAfter,
            description: `Capacity full! Evict least recently used key ${result.evicted.key} from tail, then add new key ${op.key} to head.`,
            highlightedNodes: newNodeIndex !== undefined ? [newNodeIndex] : [],
            highlightColors: newNodeIndex !== undefined ? { [newNodeIndex]: '#10b981' } : {},
            evictedNode: result.evicted,
          });
        } else {
          steps.push({
            type: 'put-new',
            operation: `put(${op.key}, ${op.value})`,
            key: op.key,
            value: op.value,
            state: stateAfter,
            description: `Add new key ${op.key} with value ${op.value} to head (most recently used position).`,
            highlightedNodes: newNodeIndex !== undefined ? [newNodeIndex] : [],
            highlightColors: newNodeIndex !== undefined ? { [newNodeIndex]: '#10b981' } : {},
          });
        }
      }
    }
  }
  
  steps.push({
    type: 'done',
    operation: 'Complete',
    state: cache.getState(),
    description: 'All operations completed. The LRU Cache maintains O(1) get and put operations using HashMap + Doubly Linked List.',
    highlightedNodes: [],
    highlightColors: {},
  });
  
  return steps;
}

const PRESETS = [
  {
    label: 'Basic Example',
    capacity: 2,
    operations: [
      { type: 'put' as const, key: 1, value: 1 },
      { type: 'put' as const, key: 2, value: 2 },
      { type: 'get' as const, key: 1 },
      { type: 'put' as const, key: 3, value: 3 },
      { type: 'get' as const, key: 2 },
      { type: 'get' as const, key: 3 },
    ]
  },
  {
    label: 'Update Existing',
    capacity: 3,
    operations: [
      { type: 'put' as const, key: 1, value: 10 },
      { type: 'put' as const, key: 2, value: 20 },
      { type: 'put' as const, key: 1, value: 100 },
      { type: 'get' as const, key: 1 },
    ]
  },
  {
    label: 'Cache Miss',
    capacity: 2,
    operations: [
      { type: 'put' as const, key: 1, value: 1 },
      { type: 'get' as const, key: 1 },
      { type: 'get' as const, key: 2 },
      { type: 'put' as const, key: 2, value: 2 },
    ]
  },
];

export function LRUCacheVisualizer() {
  const [capacity, setCapacity] = useState(2);
  const [operationsInput, setOperationsInput] = useState('put(1,1), put(2,2), get(1), put(3,3), get(2), get(3)');
  const [operations, setOperations] = useState<{ type: 'get' | 'put'; key: number; value?: number }[]>([
    { type: 'put', key: 1, value: 1 },
    { type: 'put', key: 2, value: 2 },
    { type: 'get', key: 1 },
    { type: 'put', key: 3, value: 3 },
    { type: 'get', key: 2 },
    { type: 'get', key: 3 },
  ]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const parseOperations = (input: string) => {
    const ops: { type: 'get' | 'put'; key: number; value?: number }[] = [];
    const matches = input.match(/(get|put)\([^)]+\)/g);
    
    if (matches) {
      for (const match of matches) {
        if (match.startsWith('get(')) {
          const key = parseInt(match.match(/get\((\d+)\)/)?.[1] || '0');
          ops.push({ type: 'get', key });
        } else if (match.startsWith('put(')) {
          const parts = match.match(/put\((\d+),\s*(\d+)\)/);
          if (parts) {
            const key = parseInt(parts[1]);
            const value = parseInt(parts[2]);
            ops.push({ type: 'put', key, value });
          }
        }
      }
    }
    
    return ops;
  };

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(operations, capacity);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [operations, capacity]);

  useEffect(() => { initializeSteps(); }, [initializeSteps]);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 2000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setCapacity(preset.capacity);
    setOperations(preset.operations);
    
    const opsString = preset.operations.map(op => 
      op.type === 'get' ? `get(${op.key})` : `put(${op.key},${op.value})`
    ).join(', ');
    setOperationsInput(opsString);
    
    const newSteps = generateSteps(preset.operations, preset.capacity);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed = parseOperations(operationsInput);
    if (parsed.length > 0 && capacity >= 1) {
      setOperations(parsed);
      const newSteps = generateSteps(parsed, capacity);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  const getLinkedListOrder = (state: CacheState) => {
    const order: number[] = [];
    let current = state.head;
    while (current !== null) {
      order.push(current);
      current = state.nodes[current].next;
    }
    return order;
  };

  const renderDoublyLinkedList = () => {
    if (!step) return null;
    
    const order = getLinkedListOrder(step.state);
    
    if (order.length === 0) {
      return (
        <div className="py-20 text-center text-slate-500">
          Empty doubly linked list
        </div>
      );
    }

    const nodeSpacing = Math.min(120, Math.max(80, 600 / order.length));
    const startX = Math.max(60, (800 - (order.length - 1) * nodeSpacing) / 2);

    return (
      <svg width="800" height="200" className="overflow-visible">
        {/* Arrow marker definitions */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
        </defs>
        
        {/* Render arrows */}
        {order.map((nodeIndex, i) => {
          if (i < order.length - 1) {
            const fromX = startX + i * nodeSpacing;
            const toX = startX + (i + 1) * nodeSpacing;
            return (
              <g key={`arrow-${nodeIndex}-${order[i + 1]}`}>
                {/* Forward arrow */}
                <line
                  x1={fromX + 35}
                  y1={85}
                  x2={toX - 35}
                  y2={85}
                  stroke="#64748b"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                {/* Backward arrow */}
                <line
                  x1={toX - 35}
                  y1={115}
                  x2={fromX + 35}
                  y2={115}
                  stroke="#64748b"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          }
          return null;
        })}
        
        {/* Render nodes */}
        {order.map((nodeIndex, i) => {
          const node = step.state.nodes[nodeIndex];
          const x = startX + i * nodeSpacing;
          const y = 100;
          const color = step.highlightColors[nodeIndex] || '#475569';
          
          return (
            <motion.g key={`node-${nodeIndex}`}>
              {/* Node rectangle */}
              <motion.rect
                x={x - 30}
                y={y - 25}
                width="60"
                height="50"
                rx="8"
                fill={color}
                stroke={color === '#475569' ? '#64748b' : color}
                strokeWidth="2"
                animate={{
                  scale: step.highlightedNodes.includes(nodeIndex) ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Key */}
              <text
                x={x}
                y={y - 5}
                textAnchor="middle"
                className="text-sm font-bold fill-white"
              >
                {node.key}
              </text>
              
              {/* Value */}
              <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                className="text-xs fill-white"
              >
                val:{node.value}
              </text>
              
              {/* Position label */}
              <text
                x={x}
                y={y + 45}
                textAnchor="middle"
                className="text-xs fill-slate-400"
              >
                {i === 0 ? 'head (MRU)' : i === order.length - 1 ? 'tail (LRU)' : `pos ${i}`}
              </text>
            </motion.g>
          );
        })}
      </svg>
    );
  };

  const renderHashMap = () => {
    if (!step) return null;
    
    const entries = Array.from(step.state.hashMap.entries());
    
    if (entries.length === 0) {
      return (
        <div className="py-10 text-center text-slate-500">
          Empty HashMap
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {entries.map(([key, nodeIndex]) => {
          const color = step.highlightColors[nodeIndex] || 'slate';
          return (
            <motion.div
              key={key}
              className={`p-3 rounded-lg border-2 text-center ${
                color === '#facc15' ? 'bg-yellow-500/20 border-yellow-500' :
                color === '#10b981' ? 'bg-green-500/20 border-green-500' :
                color === '#ef4444' ? 'bg-red-500/20 border-red-500' :
                'bg-slate-700 border-slate-600'
              }`}
              animate={{
                scale: step.highlightedNodes.includes(nodeIndex) ? 1.05 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm font-bold">key: {key}</div>
              <div className="text-xs text-slate-400">→ node {nodeIndex}</div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">LRU Cache</h1>
        <p className="text-slate-400">
          Least Recently Used Cache with O(1) get and put operations using HashMap + Doubly Linked List.
          Most recent items are at the head (left), least recent at the tail (right).
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((preset, i) => (
          <button key={i} onClick={() => handlePreset(preset)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            {preset.label}
          </button>
        ))}
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Capacity:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-slate-400 mb-2">Operations (put(key,value), get(key)):</label>
          <div className="flex gap-2">
            <input
              value={operationsInput}
              onChange={(e) => setOperationsInput(e.target.value)}
              placeholder="put(1,1), put(2,2), get(1), put(3,3)"
              className="flex-1 px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono"
            />
            <button
              onClick={handleApply}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Doubly Linked List Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Doubly Linked List (Most Recent ← → Least Recent)</h3>
        <div className="flex justify-center">
          {renderDoublyLinkedList()}
        </div>
      </div>

      {/* HashMap Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">HashMap (Key → Node Index)</h3>
        {renderHashMap()}
      </div>

      {/* Cache State */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Cache State</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-blue-400 font-bold text-lg">{step?.state.capacity || 0}</div>
            <div className="text-sm text-slate-400">Capacity</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="text-green-400 font-bold text-lg">{step?.state.size || 0}</div>
            <div className="text-sm text-slate-400">Current Size</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="text-purple-400 font-bold text-lg">
              {step?.state.head !== null ? `Key ${step.state.nodes[step.state.head].key}` : 'null'}
            </div>
            <div className="text-sm text-slate-400">Head (MRU)</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="text-orange-400 font-bold text-lg">
              {step?.state.tail !== null ? `Key ${step.state.nodes[step.state.tail].key}` : 'null'}
            </div>
            <div className="text-sm text-slate-400">Tail (LRU)</div>
          </div>
        </div>
        
        {step?.evictedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="text-red-400 font-bold">Evicted: Key {step.evictedNode.key}, Value {step.evictedNode.value}</div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Color Legend</h3>
        <div className="flex gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-600"></div>
            <span className="text-slate-400 text-sm">Normal node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-slate-400 text-sm">Accessed/Modified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-slate-400 text-sm">New node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-slate-400 text-sm">Evicted node</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type.includes('get') ? 'bg-blue-500' :
            step?.type.includes('put') ? 'bg-purple-500' :
            'bg-slate-500'
          }`} />
          <div>
            <div className="font-bold text-lg">{step?.operation || 'Ready'}</div>
            <div className="text-slate-400 text-sm">{step?.description || 'Initialize LRU Cache'}</div>
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

      {/* Algorithm Insight */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Algorithm Insight</h3>
        <p className="text-sm text-slate-300 mb-2">
          <strong>Why HashMap + Doubly Linked List?</strong> HashMap gives O(1) key lookup, 
          doubly linked list allows O(1) insertion/deletion at both ends. Together they enable 
          O(1) get and put operations.
        </p>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Get:</strong> HashMap lookup + move to head (mark as recently used)</li>
          <li>• <strong>Put:</strong> HashMap check + add to head + evict tail if capacity exceeded</li>
          <li>• <strong>Head:</strong> Most Recently Used (MRU) - newest additions go here</li>
          <li>• <strong>Tail:</strong> Least Recently Used (LRU) - eviction happens here</li>
        </ul>
      </div>

      {/* Java Code */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`class LRUCache {
    class Node {
        int key, value;
        Node prev, next;
        
        Node(int k, int v) {
            key = k;
            value = v;
        }
    }
    
    private HashMap<Integer, Node> map = new HashMap<>();
    private int capacity;
    private Node head = new Node(0, 0);  // dummy head
    private Node tail = new Node(0, 0);  // dummy tail
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }
    
    public int get(int key) {
        Node node = map.get(key);
        if (node == null) return -1;
        
        // Move to head (mark as recently used)
        moveToHead(node);
        return node.value;
    }
    
    public void put(int key, int value) {
        Node node = map.get(key);
        
        if (node == null) {
            // Add new node
            Node newNode = new Node(key, value);
            
            if (map.size() >= capacity) {
                // Remove LRU (tail)
                Node tail = removeTail();
                map.remove(tail.key);
            }
            
            map.put(key, newNode);
            addToHead(newNode);
        } else {
            // Update existing
            node.value = value;
            moveToHead(node);
        }
    }
    
    private void addToHead(Node node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }
    
    private void removeNode(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    private void moveToHead(Node node) {
        removeNode(node);
        addToHead(node);
    }
    
    private Node removeTail() {
        Node lastNode = tail.prev;
        removeNode(lastNode);
        return lastNode;
    }
}
// Time: O(1) for both get and put  |  Space: O(capacity)`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Interview Tips</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Key insight:</strong> HashMap for O(1) lookup + Doubly Linked List for O(1) reordering</li>
          <li>• <strong>Dummy nodes:</strong> Use dummy head/tail to simplify edge cases</li>
          <li>• <strong>Move to head:</strong> On both get() and put(), accessed nodes become most recent</li>
          <li>• <strong>Eviction:</strong> Always remove from tail (LRU position)</li>
          <li>• <strong>Common mistake:</strong> Forgetting to update HashMap when evicting nodes</li>
          <li>• <strong>Follow-up:</strong> "What if we needed LFU (Least Frequently Used) instead?"</li>
        </ul>
      </div>
    </div>
  );
}