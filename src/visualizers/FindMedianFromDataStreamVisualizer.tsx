import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'add-to-max' | 'add-to-min' | 'balance' | 'find-median' | 'complete';
  num: number | null;
  maxHeap: number[];
  minHeap: number[];
  median: number | null;
  description: string;
  highlightElement?: number;
}

// Simple heap implementation for visualization
class MaxHeap {
  heap: number[];

  constructor() {
    this.heap = [];
  }

  insert(val: number) {
    this.heap.push(val);
    this.heapifyUp();
  }

  extractMax(): number | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();
    
    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown();
    return max;
  }

  peek(): number | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  private heapifyUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex] >= this.heap[index]) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private heapifyDown() {
    let index = 0;
    while (2 * index + 1 < this.heap.length) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let largest = index;

      if (leftChild < this.heap.length && this.heap[leftChild] > this.heap[largest]) {
        largest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild] > this.heap[largest]) {
        largest = rightChild;
      }

      if (largest === index) break;
      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

class MinHeap {
  heap: number[];

  constructor() {
    this.heap = [];
  }

  insert(val: number) {
    this.heap.push(val);
    this.heapifyUp();
  }

  extractMin(): number | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();
    
    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown();
    return min;
  }

  peek(): number | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  private heapifyUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex] <= this.heap[index]) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private heapifyDown() {
    let index = 0;
    while (2 * index + 1 < this.heap.length) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.heap.length && this.heap[leftChild] < this.heap[smallest]) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild] < this.heap[smallest]) {
        smallest = rightChild;
      }

      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

function generateSteps(numbers: number[]): Step[] {
  const steps: Step[] = [];
  const maxHeap = new MaxHeap(); // stores smaller half
  const minHeap = new MinHeap(); // stores larger half
  
  steps.push({
    type: 'start',
    num: null,
    maxHeap: [],
    minHeap: [],
    median: null,
    description: 'Starting with empty data stream. We\'ll use two heaps: MaxHeap for smaller half, MinHeap for larger half.'
  });

  for (const num of numbers) {
    // Add number
    if (maxHeap.size() === 0 || num <= maxHeap.peek()!) {
      maxHeap.insert(num);
      steps.push({
        type: 'add-to-max',
        num,
        maxHeap: [...maxHeap.heap].sort((a, b) => b - a),
        minHeap: [...minHeap.heap].sort((a, b) => a - b),
        median: null,
        description: `Adding ${num} to MaxHeap (smaller half) since it's ≤ ${maxHeap.size() === 1 ? num : maxHeap.heap[0]}.`,
        highlightElement: num
      });
    } else {
      minHeap.insert(num);
      steps.push({
        type: 'add-to-min',
        num,
        maxHeap: [...maxHeap.heap].sort((a, b) => b - a),
        minHeap: [...minHeap.heap].sort((a, b) => a - b),
        median: null,
        description: `Adding ${num} to MinHeap (larger half) since it's > ${maxHeap.peek()}.`,
        highlightElement: num
      });
    }

    // Balance heaps
    if (maxHeap.size() > minHeap.size() + 1) {
      const moved = maxHeap.extractMax()!;
      minHeap.insert(moved);
      steps.push({
        type: 'balance',
        num,
        maxHeap: [...maxHeap.heap].sort((a, b) => b - a),
        minHeap: [...minHeap.heap].sort((a, b) => a - b),
        median: null,
        description: `MaxHeap too large! Moving ${moved} to MinHeap to balance.`,
        highlightElement: moved
      });
    } else if (minHeap.size() > maxHeap.size() + 1) {
      const moved = minHeap.extractMin()!;
      maxHeap.insert(moved);
      steps.push({
        type: 'balance',
        num,
        maxHeap: [...maxHeap.heap].sort((a, b) => b - a),
        minHeap: [...minHeap.heap].sort((a, b) => a - b),
        median: null,
        description: `MinHeap too large! Moving ${moved} to MaxHeap to balance.`,
        highlightElement: moved
      });
    }

    // Find median
    let median: number;
    if (maxHeap.size() === minHeap.size()) {
      median = (maxHeap.peek()! + minHeap.peek()!) / 2;
    } else {
      median = maxHeap.size() > minHeap.size() ? maxHeap.peek()! : minHeap.peek()!;
    }

    steps.push({
      type: 'find-median',
      num,
      maxHeap: [...maxHeap.heap].sort((a, b) => b - a),
      minHeap: [...minHeap.heap].sort((a, b) => a - b),
      median,
      description: maxHeap.size() === minHeap.size() ? 
        `Heaps balanced! Median = (${maxHeap.peek()} + ${minHeap.peek()}) / 2 = ${median}` :
        `Odd count! Median = ${median} (top of ${maxHeap.size() > minHeap.size() ? 'MaxHeap' : 'MinHeap'})`
    });
  }

  steps.push({
    type: 'complete',
    num: null,
    maxHeap: [...maxHeap.heap].sort((a, b) => b - a),
    minHeap: [...minHeap.heap].sort((a, b) => a - b),
    median: maxHeap.size() === minHeap.size() ? 
      (maxHeap.peek()! + minHeap.peek()!) / 2 :
      (maxHeap.size() > minHeap.size() ? maxHeap.peek()! : minHeap.peek()!),
    description: 'Stream processed! We can find median in O(1) time using the two-heap approach.'
  });

  return steps;
}

interface HeapVisualizationProps {
  maxHeap: number[];
  minHeap: number[];
  median: number | null;
  highlightElement?: number;
}

function HeapVisualization({ 
  maxHeap, 
  minHeap, 
  median, 
  highlightElement
}: HeapVisualizationProps) {
  const renderHeap = (heap: number[], type: 'max' | 'min', x: number, y: number) => {
    if (heap.length === 0) {
      return (
        <g>
          <rect
            x={x - 60}
            y={y - 20}
            width={120}
            height={40}
            rx={8}
            className="fill-slate-700 stroke-slate-600"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-500 text-sm"
          >
            Empty
          </text>
        </g>
      );
    }

    const elements: React.ReactElement[] = [];
    
    heap.forEach((val, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const positionInLevel = index - (Math.pow(2, level) - 1);
      const maxInLevel = Math.pow(2, level);
      
      const nodeX = x + (positionInLevel - maxInLevel / 2 + 0.5) * 60;
      const nodeY = y + level * 50;
      
      const isHighlighted = highlightElement === val;
      const isTop = index === 0;
      
      elements.push(
        <motion.g
          key={`${type}-${index}-${val}`}
          animate={{ 
            scale: isHighlighted ? 1.2 : (isTop ? 1.1 : 1),
            y: isHighlighted ? -5 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <circle
            cx={nodeX}
            cy={nodeY}
            r={20}
            className={`${
              isTop ? (type === 'max' ? 'fill-red-500' : 'fill-blue-500') :
              isHighlighted ? 'fill-yellow-500' :
              type === 'max' ? 'fill-red-400/80' : 'fill-blue-400/80'
            } stroke-2 ${
              isTop ? (type === 'max' ? 'stroke-red-400' : 'stroke-blue-400') :
              isHighlighted ? 'stroke-yellow-400' :
              type === 'max' ? 'stroke-red-300' : 'stroke-blue-300'
            }`}
          />
          <text
            x={nodeX}
            y={nodeY}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-bold ${
              isTop || isHighlighted ? 'fill-white' : 'fill-white/90'
            }`}
          >
            {val}
          </text>
          
          {isTop && (
            <text
              x={nodeX}
              y={nodeY + 35}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xs font-semibold ${
                type === 'max' ? 'fill-red-300' : 'fill-blue-300'
              }`}
            >
              {type === 'max' ? 'MAX' : 'MIN'}
            </text>
          )}
        </motion.g>
      );

      // Draw parent connections
      if (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        const parentLevel = Math.floor(Math.log2(parentIndex + 1));
        const parentPositionInLevel = parentIndex - (Math.pow(2, parentLevel) - 1);
        const parentMaxInLevel = Math.pow(2, parentLevel);
        
        const parentX = x + (parentPositionInLevel - parentMaxInLevel / 2 + 0.5) * 60;
        const parentY = y + parentLevel * 50;
        
        elements.push(
          <line
            key={`${type}-edge-${index}`}
            x1={parentX}
            y1={parentY + 20}
            x2={nodeX}
            y2={nodeY - 20}
            className={type === 'max' ? 'stroke-red-300/50' : 'stroke-blue-300/50'}
            strokeWidth={2}
          />
        );
      }
    });

    return <g>{elements}</g>;
  };

  return (
    <div className="flex justify-center">
      <svg width="800" height="400" className="bg-slate-900 rounded-lg border border-slate-700">
        {/* MaxHeap (left side) */}
        <g>
          <text
            x={200}
            y={30}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-red-400 text-lg font-bold"
          >
            MaxHeap (Smaller Half)
          </text>
          <text
            x={200}
            y={50}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-red-300 text-sm"
          >
            Size: {maxHeap.length}
          </text>
          {renderHeap(maxHeap, 'max', 200, 100)}
        </g>

        {/* MinHeap (right side) */}
        <g>
          <text
            x={600}
            y={30}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-blue-400 text-lg font-bold"
          >
            MinHeap (Larger Half)
          </text>
          <text
            x={600}
            y={50}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-blue-300 text-sm"
          >
            Size: {minHeap.length}
          </text>
          {renderHeap(minHeap, 'min', 600, 100)}
        </g>

        {/* Median indicator */}
        {median !== null && (
          <motion.g
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <rect
              x={350}
              y={320}
              width={100}
              height={50}
              rx={8}
              className="fill-green-500/20 stroke-green-400"
              strokeWidth={2}
            />
            <text
              x={400}
              y={335}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-green-300 text-xs font-semibold"
            >
              MEDIAN
            </text>
            <text
              x={400}
              y={355}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-green-400 text-lg font-bold"
            >
              {median}
            </text>
          </motion.g>
        )}

        {/* Legend */}
        <g transform="translate(20, 350)">
          <rect x="0" y="0" width="300" height="45" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(71, 85, 105, 0.5)" strokeWidth="1" rx="4"/>
          <text x="8" y="15" className="text-xs fill-slate-300 font-semibold">Property: MaxHeap.size ≈ MinHeap.size (±1)</text>
          <text x="8" y="28" className="text-xs fill-slate-400">Median = balanced heaps ensure O(1) retrieval</text>
        </g>
      </svg>
    </div>
  );
}

export function FindMedianFromDataStreamVisualizer() {
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [customNumbers, setCustomNumbers] = useState('1,2,3,4,5');

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(numbers);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [numbers]);

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
    }, 1500 / speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const handleNumbersChange = (input: string) => {
    setCustomNumbers(input);
    try {
      const parsed = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) {
        setNumbers(parsed);
      }
    } catch (e) {
      // Invalid input, keep existing numbers
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Find Median from Data Stream</h1>
        <p className="text-slate-400">
          Use two heaps to maintain the median of a stream of numbers in real-time. 
          MaxHeap stores the smaller half, MinHeap stores the larger half.
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <label className="text-sm text-slate-400">Data Stream: </label>
        <input
          type="text"
          value={customNumbers}
          onChange={(e) => handleNumbersChange(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm"
          placeholder="Enter numbers separated by commas"
        />
        <button
          onClick={initializeSteps}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
        >
          Update Stream
        </button>
        <div className="text-sm text-slate-400">
          {numbers.length} numbers: [{numbers.join(', ')}]
        </div>
      </div>

      {/* Heap Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Two-Heap Data Structure</h3>
        {currentStepData && (
          <HeapVisualization
            maxHeap={currentStepData.maxHeap}
            minHeap={currentStepData.minHeap}
            median={currentStepData.median}
            highlightElement={currentStepData.highlightElement}
          />
        )}
      </div>

      {/* Current Step Info */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${
              currentStepData?.type === 'complete' ? 'bg-green-500' :
              currentStepData?.type === 'find-median' ? 'bg-green-500' :
              currentStepData?.type === 'balance' ? 'bg-orange-500' :
              currentStepData?.type === 'add-to-max' ? 'bg-red-500' :
              currentStepData?.type === 'add-to-min' ? 'bg-blue-500' :
              'bg-slate-500'
            }`} />
            <span className="text-lg">{currentStepData?.description || 'Ready to start'}</span>
          </div>
          {currentStepData?.median !== null && (
            <div className="bg-green-600 px-3 py-1 rounded-full text-sm font-semibold">
              Current Median: {currentStepData.median}
            </div>
          )}
        </div>
      </div>

      {/* Algorithm Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-400 mb-2">MaxHeap (Smaller Half)</h3>
          <div className="text-2xl font-bold text-red-300">{currentStepData?.maxHeap.length || 0}</div>
          <div className="text-sm text-slate-400">elements</div>
          <div className="text-xs text-red-300 mt-1">
            Top: {currentStepData?.maxHeap[0] || 'none'}
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">MinHeap (Larger Half)</h3>
          <div className="text-2xl font-bold text-blue-300">{currentStepData?.minHeap.length || 0}</div>
          <div className="text-sm text-slate-400">elements</div>
          <div className="text-xs text-blue-300 mt-1">
            Top: {currentStepData?.minHeap[0] || 'none'}
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-400 mb-2">Balance Check</h3>
          <div className="text-lg font-bold text-green-300">
            {currentStepData ? Math.abs(currentStepData.maxHeap.length - currentStepData.minHeap.length) <= 1 ? '✓' : '✗' : '⋯'}
          </div>
          <div className="text-xs text-slate-400">
            |maxSize - minSize| ≤ 1
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

      {/* Code Implementation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Implementation</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`class MedianFinder {
    private PriorityQueue<Integer> maxHeap; // smaller half
    private PriorityQueue<Integer> minHeap; // larger half
    
    public MedianFinder() {
        maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        minHeap = new PriorityQueue<>();
    }
    
    public void addNum(int num) {
        // Add to appropriate heap
        if (maxHeap.isEmpty() || num <= maxHeap.peek()) {
            maxHeap.offer(num);
        } else {
            minHeap.offer(num);
        }
        
        // Balance the heaps (sizes should differ by at most 1)
        if (maxHeap.size() > minHeap.size() + 1) {
            minHeap.offer(maxHeap.poll());
        } else if (minHeap.size() > maxHeap.size() + 1) {
            maxHeap.offer(minHeap.poll());
        }
    }
    
    public double findMedian() {
        if (maxHeap.size() == minHeap.size()) {
            return (maxHeap.peek() + minHeap.peek()) / 2.0;
        } else {
            return maxHeap.size() > minHeap.size() ? 
                   maxHeap.peek() : minHeap.peek();
        }
    }
}

// Time: O(log n) for addNum, O(1) for findMedian
// Space: O(n) for storing all numbers`}
        </pre>
      </div>

      {/* Algorithm Explanation */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Algorithm Explanation</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>Two-Heap Approach:</strong> Split numbers into two halves using heaps</p>
          <p><strong>Time Complexity:</strong> O(log n) insertion, O(1) median retrieval</p>
          <p><strong>Space Complexity:</strong> O(n) to store all numbers</p>
          
          <div className="mt-4">
            <p><strong>Key Insights:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>MaxHeap stores smaller half (largest element at top)</li>
              <li>MinHeap stores larger half (smallest element at top)</li>
              <li>Maintain heap size balance: |maxSize - minSize| ≤ 1</li>
              <li>Median is either average of tops or top of larger heap</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <p><strong>Why This Works:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>If balanced: median = (maxHeap.top + minHeap.top) / 2</li>
              <li>If unbalanced: median = top of larger heap</li>
              <li>Heaps maintain sorted order for their halves</li>
              <li>O(1) median access vs O(n log n) sorting each time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}