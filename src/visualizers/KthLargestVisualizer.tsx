import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'init' | 'add' | 'bubble-up' | 'bubble-down' | 'remove' | 'result';
  heap: number[];
  k: number;
  newValue?: number;
  kthLargest?: number;
  description: string;
  highlightIndices?: number[];
  compareIndices?: [number, number];
  swapIndices?: [number, number];
  removedValue?: number;
}

class MinHeap {
  private heap: number[] = [];

  constructor(values?: number[]) {
    if (values) {
      this.heap = [...values];
      this.heapify();
    }
  }

  private heapify() {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  getHeap(): number[] {
    return [...this.heap];
  }

  size(): number {
    return this.heap.length;
  }

  peek(): number | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  add(value: number): { steps: Step[], kthLargest: number, k: number } {
    const steps: Step[] = [];
    const k = this.heap.length + 1; // k is the target size

    // Add the value to heap
    this.heap.push(value);
    steps.push({
      type: 'add',
      heap: [...this.heap],
      k,
      newValue: value,
      description: `Added ${value} to heap. Now bubble up to maintain min-heap property.`,
      highlightIndices: [this.heap.length - 1]
    });

    // Bubble up
    this.bubbleUpWithSteps(this.heap.length - 1, steps, k);

    const kthLargest = this.heap[0];
    steps.push({
      type: 'result',
      heap: [...this.heap],
      k,
      kthLargest,
      description: `Min-heap maintained! The root ${kthLargest} is the ${k}th largest element.`
    });

    return { steps, kthLargest, k };
  }

  addWithKLimit(value: number, k: number): { steps: Step[], kthLargest: number } {
    const steps: Step[] = [];

    if (this.heap.length < k) {
      // Heap not full yet, just add
      this.heap.push(value);
      steps.push({
        type: 'add',
        heap: [...this.heap],
        k,
        newValue: value,
        description: `Added ${value} to heap (size: ${this.heap.length}/${k}). Bubble up to maintain min-heap property.`,
        highlightIndices: [this.heap.length - 1]
      });

      this.bubbleUpWithSteps(this.heap.length - 1, steps, k);
    } else {
      // Heap is full
      if (value <= this.heap[0]) {
        // New value is not larger than current kth largest
        steps.push({
          type: 'add',
          heap: [...this.heap],
          k,
          newValue: value,
          description: `${value} ≤ ${this.heap[0]} (current kth largest). No need to add - it won't be in top ${k}.`,
          highlightIndices: [0]
        });
      } else {
        // Replace root with new value
        const oldRoot = this.heap[0];
        this.heap[0] = value;
        steps.push({
          type: 'add',
          heap: [...this.heap],
          k,
          newValue: value,
          removedValue: oldRoot,
          description: `${value} > ${oldRoot}. Replace root and bubble down to maintain heap property.`,
          highlightIndices: [0]
        });

        // Bubble down
        this.bubbleDownWithSteps(0, steps, k);
      }
    }

    const kthLargest = this.heap[0];
    steps.push({
      type: 'result',
      heap: [...this.heap],
      k,
      kthLargest,
      description: `The ${k}th largest element is ${kthLargest} (root of our min-heap of size ${k}).`
    });

    return { steps, kthLargest };
  }

  private bubbleUpWithSteps(index: number, steps: Step[], k: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      steps.push({
        type: 'bubble-up',
        heap: [...this.heap],
        k,
        description: `Compare ${this.heap[index]} at index ${index} with parent ${this.heap[parentIndex]} at index ${parentIndex}`,
        compareIndices: [index, parentIndex]
      });

      if (this.heap[index] < this.heap[parentIndex]) {
        // Swap
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        
        steps.push({
          type: 'bubble-up',
          heap: [...this.heap],
          k,
          description: `${this.heap[parentIndex]} < ${this.heap[index]}. Swap to maintain min-heap property.`,
          swapIndices: [index, parentIndex]
        });
        
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private bubbleDownWithSteps(index: number, steps: Step[], k: number) {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      // Find smallest among node and its children
      if (leftChild < this.heap.length) {
        steps.push({
          type: 'bubble-down',
          heap: [...this.heap],
          k,
          description: `Compare ${this.heap[index]} with left child ${this.heap[leftChild]}`,
          compareIndices: [index, leftChild]
        });

        if (this.heap[leftChild] < this.heap[smallest]) {
          smallest = leftChild;
        }
      }

      if (rightChild < this.heap.length) {
        steps.push({
          type: 'bubble-down',
          heap: [...this.heap],
          k,
          description: `Compare ${this.heap[smallest]} with right child ${this.heap[rightChild]}`,
          compareIndices: [smallest, rightChild]
        });

        if (this.heap[rightChild] < this.heap[smallest]) {
          smallest = rightChild;
        }
      }

      if (smallest !== index) {
        // Swap
        steps.push({
          type: 'bubble-down',
          heap: [...this.heap],
          k,
          description: `Swap ${this.heap[index]} with ${this.heap[smallest]} to maintain heap property`,
          swapIndices: [index, smallest]
        });

        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number) {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < this.heap.length && this.heap[leftChild] < this.heap[smallest]) {
        smallest = leftChild;
      }

      if (rightChild < this.heap.length && this.heap[rightChild] < this.heap[smallest]) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}

function generateSteps(k: number, values: number[]): Step[] {
  const steps: Step[] = [];
  const heap = new MinHeap();

  steps.push({
    type: 'init',
    heap: [],
    k,
    description: `Initialize KthLargest with k=${k}. We'll use a min-heap to maintain exactly ${k} largest elements.`
  });

  for (const value of values) {
    const { steps: addSteps } = heap.addWithKLimit(value, k);
    steps.push(...addSteps);
  }

  return steps;
}

// Helper function to get tree position for visualization
function getTreePosition(index: number, totalNodes: number) {
  const levels = Math.ceil(Math.log2(totalNodes + 1));
  const level = Math.floor(Math.log2(index + 1));
  const positionInLevel = index - (Math.pow(2, level) - 1);
  const nodesInLevel = Math.pow(2, level);
  
  const x = (positionInLevel + 0.5) / nodesInLevel;
  const y = level / Math.max(levels - 1, 1);
  
  return { x, y, level };
}

// Helper to get parent/child relationships
function getParentIndex(index: number): number {
  return Math.floor((index - 1) / 2);
}

export function KthLargestVisualizer() {
  const [kInput, setKInput] = useState('3');
  const [valuesInput, setValuesInput] = useState('4,5,8,2');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const k = parseInt(kInput.trim());
    const values = valuesInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
    if (!isNaN(k) && k > 0 && values.length > 0) {
      const newSteps = generateSteps(k, values);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [kInput, valuesInput]);

  useEffect(() => {
    initializeSteps();
  }, []);

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

  const handleQuickTest = (k: number, values: number[]) => {
    setKInput(k.toString());
    setValuesInput(values.join(','));
    setTimeout(() => {
      const newSteps = generateSteps(k, values);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }, 100);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kth Largest Element in a Stream</h1>
        <p className="text-slate-400">
          Efficiently track the kth largest element using a min-heap of size k. Perfect for Anduril's 
          task scheduling and priority queue problems! 🚁
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-2">k (find kth largest):</label>
          <input
            type="text"
            value={kInput}
            onChange={(e) => setKInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            placeholder="e.g., 3"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-2">Values to add (comma-separated):</label>
          <input
            type="text"
            value={valuesInput}
            onChange={(e) => setValuesInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            placeholder="e.g., 4,5,8,2"
          />
        </div>
      </div>

      {/* Quick test cases */}
      <div className="mb-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Quick Test Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { k: 3, values: [4,5,8,2], desc: 'Basic example' },
            { k: 1, values: [7,10,9,9], desc: 'Find maximum' },
            { k: 2, values: [3,5,3,6,7,6,8,5,7,6], desc: 'Many duplicates' }
          ].map((test, i) => (
            <button
              key={i}
              onClick={() => handleQuickTest(test.k, test.values)}
              className="p-3 rounded-lg border border-slate-600 hover:border-slate-500 bg-slate-700 text-left transition-colors"
            >
              <div className="font-mono text-sm">k={test.k}, values=[{test.values.join(',')}]</div>
              <div className="text-slate-400 text-xs">{test.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Heap Tree Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Min-Heap Tree (Size = {currentStepData?.heap.length || 0} / {currentStepData?.k || 0})</h3>
        <div className="relative min-h-[300px] flex items-center justify-center">
          {currentStepData?.heap && currentStepData.heap.length > 0 ? (
            <svg width="100%" height="300" viewBox="0 0 400 300" className="overflow-visible">
              {/* Draw edges first */}
              {currentStepData.heap.map((_, index) => {
                if (index === 0) return null;
                const parent = getParentIndex(index);
                const childPos = getTreePosition(index, currentStepData.heap.length);
                const parentPos = getTreePosition(parent, currentStepData.heap.length);
                
                return (
                  <line
                    key={`edge-${index}`}
                    x1={parentPos.x * 300 + 50}
                    y1={parentPos.y * 200 + 50}
                    x2={childPos.x * 300 + 50}
                    y2={childPos.y * 200 + 50}
                    stroke="#475569"
                    strokeWidth="2"
                  />
                );
              })}
              
              {/* Draw nodes */}
              {currentStepData.heap.map((value, index) => {
                const pos = getTreePosition(index, currentStepData.heap.length);
                const isHighlighted = currentStepData.highlightIndices?.includes(index);
                const isComparing = currentStepData.compareIndices?.includes(index);
                const isSwapping = currentStepData.swapIndices?.includes(index);
                const isRoot = index === 0;
                
                let nodeColor = 'fill-slate-600 stroke-slate-400';
                let textColor = 'fill-white';
                
                if (isRoot) {
                  nodeColor = 'fill-green-500 stroke-green-400';
                } else if (isSwapping) {
                  nodeColor = 'fill-purple-500 stroke-purple-400';
                } else if (isComparing) {
                  nodeColor = 'fill-yellow-500 stroke-yellow-400';
                  textColor = 'fill-black';
                } else if (isHighlighted) {
                  nodeColor = 'fill-blue-500 stroke-blue-400';
                }
                
                return (
                  <g key={index}>
                    <motion.circle
                      cx={pos.x * 300 + 50}
                      cy={pos.y * 200 + 50}
                      r="20"
                      className={nodeColor}
                      strokeWidth="2"
                      animate={{
                        scale: isHighlighted || isComparing || isSwapping ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <text
                      x={pos.x * 300 + 50}
                      y={pos.y * 200 + 55}
                      textAnchor="middle"
                      className={`text-sm font-bold ${textColor}`}
                    >
                      {value}
                    </text>
                    <text
                      x={pos.x * 300 + 50}
                      y={pos.y * 200 + 35}
                      textAnchor="middle"
                      className="fill-slate-400 text-xs"
                    >
                      [{index}]
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="text-slate-500 text-center">
              <div className="text-4xl mb-2">🌳</div>
              <div>Empty heap - add some values to see the tree!</div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Kth Largest (Root)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>New Element</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span>Swapping</span>
          </div>
        </div>
      </div>

      {/* Current State */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current State</h3>
          {currentStepData && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">k (target size):</span>
                <span className="font-mono text-blue-400">{currentStepData.k}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Heap size:</span>
                <span className="font-mono">{currentStepData.heap.length}</span>
              </div>
              {currentStepData.newValue !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Adding:</span>
                  <span className="font-mono text-blue-400">{currentStepData.newValue}</span>
                </div>
              )}
              {currentStepData.removedValue !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Removed:</span>
                  <span className="font-mono text-red-400">{currentStepData.removedValue}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Heap:</span>
                <span className="font-mono text-xs">[{currentStepData.heap.join(', ')}]</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Kth Largest Element</h3>
          <div className={`text-3xl font-bold ${
            currentStepData?.kthLargest !== undefined ? 'text-green-400' : 'text-slate-500'
          }`}>
            {currentStepData?.kthLargest !== undefined ? currentStepData.kthLargest : '?'}
          </div>
          {currentStepData?.kthLargest !== undefined && (
            <div className="text-sm text-slate-400 mt-1">
              Root of min-heap = {currentStepData.k}th largest
            </div>
          )}
        </div>
      </div>

      {/* Status Description */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${
            currentStepData?.type === 'init' ? 'bg-blue-500' :
            currentStepData?.type === 'add' ? 'bg-blue-500' :
            currentStepData?.type === 'bubble-up' ? 'bg-yellow-500' :
            currentStepData?.type === 'bubble-down' ? 'bg-purple-500' :
            currentStepData?.type === 'result' ? 'bg-green-500' :
            'bg-slate-500'
          }`} />
          <span className="text-lg flex-1">{currentStepData?.description || 'Ready to start'}</span>
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

      {/* Algorithm Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">How It Works</h3>
        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <strong className="text-blue-400">🎯 Key Insight:</strong> Use a min-heap of size k. 
            The root is always the kth largest element!
          </div>
          <div className="space-y-2">
            <div><strong>1. If heap size &lt; k:</strong> Simply add the new element</div>
            <div><strong>2. If heap size = k and new element ≤ root:</strong> Ignore it (not in top k)</div>
            <div><strong>3. If heap size = k and new element &gt; root:</strong> Replace root and heapify</div>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg">
            <strong className="text-purple-400">🚁 Anduril Applications:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Task scheduling: Track k highest priority tasks</li>
              <li>• Drone management: Monitor k most critical drones</li>  
              <li>• Resource allocation: Keep k most important requests</li>
              <li>• Alert systems: Track k most severe incidents</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Code Implementation */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Implementation</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`class KthLargest {
    private PriorityQueue<Integer> minHeap;
    private int k;
    
    public KthLargest(int k, int[] nums) {
        this.k = k;
        this.minHeap = new PriorityQueue<>();
        
        for (int num : nums) {
            add(num);
        }
    }
    
    public int add(int val) {
        minHeap.offer(val);
        
        // Keep heap size = k by removing smallest
        if (minHeap.size() > k) {
            minHeap.poll();
        }
        
        return minHeap.peek(); // kth largest
    }
}

// Time: O(log k) per add operation
// Space: O(k) for the heap`}
        </pre>
      </div>

      {/* Complexity Analysis */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Complexity Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-white mb-1">Time Complexity</h4>
            <ul className="text-slate-300 space-y-1">
              <li>• <strong>Constructor:</strong> O(n log k) where n = nums.length</li>
              <li>• <strong>Add:</strong> O(log k) per operation</li>
              <li>• <strong>Why?</strong> Heap operations are O(log k), heap size ≤ k</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Space Complexity</h4>
            <ul className="text-slate-300 space-y-1">
              <li>• <strong>Overall:</strong> O(k)</li>
              <li>• <strong>Why?</strong> We only store k elements maximum</li>
              <li>• <strong>Efficient:</strong> Much better than O(n) for all elements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}