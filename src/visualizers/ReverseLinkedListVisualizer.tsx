import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface ListNode {
  val: number;
  next: number | null; // index of next node, null means end
}

interface Step {
  type: 'start' | 'initialize' | 'process' | 'reverse' | 'advance' | 'done';
  nodes: ListNode[];
  prev: number | null;
  current: number | null;
  next: number | null;
  description: string;
  // Visual state for nodes
  visualNodes: {
    val: number;
    originalIndex: number;
    isReversed: boolean; // whether this connection has been reversed
    nextPointer: number | null; // what this node currently points to
  }[];
}

function generateSteps(values: number[]): Step[] {
  const steps: Step[] = [];
  
  if (values.length === 0) {
    steps.push({
      type: 'done',
      nodes: [],
      prev: null,
      current: null,
      next: null,
      description: 'Empty list - nothing to reverse',
      visualNodes: [],
    });
    return steps;
  }
  
  if (values.length === 1) {
    steps.push({
      type: 'start',
      nodes: [{ val: values[0], next: null }],
      prev: null,
      current: 0,
      next: null,
      description: 'Single node - already reversed',
      visualNodes: [{ val: values[0], originalIndex: 0, isReversed: false, nextPointer: null }],
    });
    
    steps.push({
      type: 'done',
      nodes: [{ val: values[0], next: null }],
      prev: null,
      current: null,
      next: null,
      description: 'Single node list is already reversed!',
      visualNodes: [{ val: values[0], originalIndex: 0, isReversed: false, nextPointer: null }],
    });
    return steps;
  }
  
  // Build initial linked list
  const initialNodes: ListNode[] = values.map((val, i) => ({
    val,
    next: i < values.length - 1 ? i + 1 : null,
  }));
  
  const initialVisualNodes = values.map((val, i) => ({
    val,
    originalIndex: i,
    isReversed: false,
    nextPointer: i < values.length - 1 ? i + 1 : null,
  }));
  
  steps.push({
    type: 'start',
    nodes: [...initialNodes],
    prev: null,
    current: null,
    next: null,
    description: 'Original linked list - we want to reverse all the pointers',
    visualNodes: [...initialVisualNodes],
  });
  
  steps.push({
    type: 'initialize',
    nodes: [...initialNodes],
    prev: null,
    current: 0,
    next: 0 < initialNodes.length - 1 ? initialNodes[0].next : null,
    description: 'Initialize: prev=null, current=head, next=current.next',
    visualNodes: [...initialVisualNodes],
  });
  
  // Simulate the reversal algorithm
  let prev: number | null = null;
  let current: number | null = 0;
  let currentNodes = [...initialNodes];
  let currentVisualNodes = [...initialVisualNodes];
  
  while (current !== null) {
    const next: number | null = currentNodes[current].next;
    
    steps.push({
      type: 'process',
      nodes: [...currentNodes],
      prev,
      current,
      next,
      description: `Store next pointer: next = current.next (${next !== null ? `node ${next}` : 'null'})`,
      visualNodes: [...currentVisualNodes],
    });
    
    // Reverse the current connection
    currentNodes[current].next = prev;
    currentVisualNodes[current].nextPointer = prev;
    currentVisualNodes[current].isReversed = true;
    
    steps.push({
      type: 'reverse',
      nodes: [...currentNodes],
      prev,
      current,
      next,
      description: `Reverse pointer: current.next = prev (${prev !== null ? `node ${prev}` : 'null'})`,
      visualNodes: [...currentVisualNodes],
    });
    
    // Advance pointers
    prev = current;
    current = next;
    
    if (current !== null) {
      steps.push({
        type: 'advance',
        nodes: [...currentNodes],
        prev,
        current,
        next: current !== null ? currentNodes[current].next : null,
        description: `Advance pointers: prev = ${prev}, current = ${current !== null ? current : 'null'}`,
        visualNodes: [...currentVisualNodes],
      });
    }
  }
  
  steps.push({
    type: 'done',
    nodes: [...currentNodes],
    prev,
    current: null,
    next: null,
    description: `Complete! New head is node ${prev}. All pointers have been reversed.`,
    visualNodes: [...currentVisualNodes],
  });
  
  return steps;
}

const PRESETS = [
  { label: 'Example 1', values: [1, 2, 3, 4, 5] },
  { label: 'Example 2', values: [1, 2] },
  { label: 'Example 3', values: [1] },
  { label: 'Short List', values: [1, 2, 3] },
  { label: 'Longer List', values: [1, 2, 3, 4, 5, 6, 7] },
];

export function ReverseLinkedListVisualizer() {
  const [inputValue, setInputValue] = useState('1, 2, 3, 4, 5');
  const [values, setValues] = useState([1, 2, 3, 4, 5]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(values);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [values]);

  useEffect(() => { initializeSteps(); }, [initializeSteps]);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1500 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setValues(preset.values);
    setInputValue(preset.values.join(', '));
    const newSteps = generateSteps(preset.values);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length > 0 && parsed.length <= 8) {
      setValues(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  // Calculate node positions for visualization
  const getNodePosition = (index: number, total: number) => {
    const spacing = Math.min(120, Math.max(80, 600 / total));
    const startX = Math.max(60, (800 - (total - 1) * spacing) / 2);
    return {
      x: startX + index * spacing,
      y: 150,
    };
  };

  const renderNode = (visualNode: typeof step.visualNodes[0], index: number, total: number) => {
    const pos = getNodePosition(index, total);
    const isPrev = index === step?.prev;
    const isCurrent = index === step?.current;
    const isNext = index === step?.next;
    
    return (
      <motion.g key={`node-${index}`}>
        {/* Node circle */}
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r="25"
          fill={
            isCurrent ? '#facc15' :
            isPrev ? '#06d6a0' :
            isNext ? '#f97316' :
            visualNode.isReversed ? '#8b5cf6' :
            '#475569'
          }
          stroke={
            isCurrent ? '#eab308' :
            isPrev ? '#048268' :
            isNext ? '#ea580c' :
            visualNode.isReversed ? '#7c3aed' :
            '#64748b'
          }
          strokeWidth="2"
          animate={{
            scale: isCurrent || isPrev || isNext ? 1.1 : 1,
          }}
        />
        
        {/* Node value */}
        <text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-lg font-bold fill-white"
        >
          {visualNode.val}
        </text>
        
        {/* Pointer labels */}
        <AnimatePresence>
          {isPrev && (
            <motion.text
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              x={pos.x}
              y={pos.y - 45}
              textAnchor="middle"
              className="text-sm font-bold fill-green-400"
            >
              prev
            </motion.text>
          )}
          {isCurrent && (
            <motion.text
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              x={pos.x}
              y={pos.y - 45}
              textAnchor="middle"
              className="text-sm font-bold fill-yellow-400"
            >
              current
            </motion.text>
          )}
          {isNext && (
            <motion.text
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              x={pos.x}
              y={pos.y - 45}
              textAnchor="middle"
              className="text-sm font-bold fill-orange-400"
            >
              next
            </motion.text>
          )}
        </AnimatePresence>
        
        {/* Index label */}
        <text
          x={pos.x}
          y={pos.y + 45}
          textAnchor="middle"
          className="text-xs fill-slate-500"
        >
          idx: {index}
        </text>
      </motion.g>
    );
  };

  const renderArrow = (fromIndex: number, toIndex: number | null, total: number, isReversed: boolean = false) => {
    if (toIndex === null) return null;
    
    const fromPos = getNodePosition(fromIndex, total);
    const toPos = getNodePosition(toIndex, total);
    
    const startX = fromPos.x + (toIndex > fromIndex ? 25 : -25);
    const endX = toPos.x + (toIndex > fromIndex ? -25 : 25);
    const y = fromPos.y + (isReversed ? 15 : -15); // Offset reversed arrows
    
    return (
      <motion.g key={`arrow-${fromIndex}-${toIndex}-${isReversed}`}>
        <motion.line
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke={isReversed ? '#8b5cf6' : '#64748b'}
          strokeWidth={isReversed ? '3' : '2'}
          strokeDasharray={isReversed ? '5,5' : 'none'}
          markerEnd={`url(#arrowhead${isReversed ? '-purple' : ''})`}
          animate={{
            pathLength: 1,
          }}
          initial={{
            pathLength: 0,
          }}
        />
      </motion.g>
    );
  };

  const renderNullPointer = (fromIndex: number, total: number, isReversed: boolean = false) => {
    const fromPos = getNodePosition(fromIndex, total);
    const startX = fromPos.x + 25;
    const endX = startX + 40;
    const y = fromPos.y + (isReversed ? 15 : -15);
    
    return (
      <motion.g key={`null-${fromIndex}-${isReversed}`}>
        <motion.line
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke={isReversed ? '#8b5cf6' : '#64748b'}
          strokeWidth={isReversed ? '3' : '2'}
          strokeDasharray={isReversed ? '5,5' : 'none'}
        />
        <text
          x={endX + 10}
          y={y + 4}
          className={`text-xs font-mono ${isReversed ? 'fill-purple-400' : 'fill-slate-400'}`}
        >
          null
        </text>
      </motion.g>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reverse Linked List</h1>
        <p className="text-slate-400">
          Use three pointers (prev, current, next) to reverse all connections in-place. 
          This is THE fundamental linked list manipulation pattern!
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
      <div className="mb-6 flex gap-3 items-center flex-wrap">
        <label className="text-sm text-slate-400">Node values:</label>
        <input value={inputValue} onChange={e => setInputValue(e.target.value)}
          placeholder="1, 2, 3, 4, 5"
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono flex-1 min-w-[200px]" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Linked List Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Linked List - Pointer Reversal</h3>
        <div className="flex justify-center">
          {step && step.visualNodes.length > 0 ? (
            <svg width="800" height="250" className="overflow-visible">
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
                <marker
                  id="arrowhead-purple"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                </marker>
              </defs>
              
              {/* Render original arrows (above nodes) */}
              {step.visualNodes.map((visualNode, i) => {
                if (!visualNode.isReversed && i < step.visualNodes.length - 1) {
                  return renderArrow(i, i + 1, step.visualNodes.length, false);
                }
                return null;
              })}
              
              {/* Render reversed arrows (below nodes) */}
              {step.visualNodes.map((visualNode, i) => {
                if (visualNode.isReversed) {
                  if (visualNode.nextPointer !== null) {
                    return renderArrow(i, visualNode.nextPointer, step.visualNodes.length, true);
                  } else {
                    return renderNullPointer(i, step.visualNodes.length, true);
                  }
                }
                return null;
              })}
              
              {/* Render nodes */}
              {step.visualNodes.map((visualNode, i) => 
                renderNode(visualNode, i, step.visualNodes.length)
              )}
            </svg>
          ) : (
            <div className="py-20 text-center text-slate-500">
              Empty list
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex gap-6 justify-center mt-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
            <span className="text-slate-400">Unprocessed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-slate-400">prev</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-slate-400">current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-slate-400">next</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-slate-400">Reversed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-purple-500" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-slate-400">Reversed pointer</span>
          </div>
        </div>
      </div>

      {/* Pointer State */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Pointer State</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="text-green-400 font-bold text-lg">
              {step?.prev !== null ? `Node ${step.prev}` : 'null'}
            </div>
            <div className="text-sm text-slate-400">prev</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="text-yellow-400 font-bold text-lg">
              {step?.current !== null ? `Node ${step.current}` : 'null'}
            </div>
            <div className="text-sm text-slate-400">current</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="text-orange-400 font-bold text-lg">
              {step?.next !== null ? `Node ${step.next}` : 'null'}
            </div>
            <div className="text-sm text-slate-400">next</div>
          </div>
        </div>
      </div>

      {/* Algorithm Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Algorithm Pattern</h3>
        <p className="text-sm text-slate-300">
          <strong>The 3-pointer technique:</strong> Before changing current.next, store current.next in 'next'. 
          Then set current.next = prev. Finally, advance prev and current. This pattern reverses connections 
          one by one without losing any nodes. Master this and you've mastered linked list manipulation!
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'reverse' ? 'bg-purple-500' :
            step?.type === 'process' || step?.type === 'advance' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready'}</span>
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
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode current = head;
    
    while (current != null) {
        ListNode next = current.next;  // Store next before we lose it
        current.next = prev;           // Reverse the pointer
        
        // Advance pointers
        prev = current;
        current = next;
    }
    
    return prev;  // prev is the new head
}
// Time: O(n) - visit each node once  |  Space: O(1) - only 3 pointers`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Interview Tips</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Draw it out:</strong> Always sketch the 3 pointers on the whiteboard</li>
          <li>• <strong>Edge cases:</strong> Empty list, single node - both return as-is</li>
          <li>• <strong>Pattern recognition:</strong> Any "reverse" linked list problem uses this technique</li>
          <li>• <strong>Common follow-up:</strong> "Reverse first K nodes" or "Reverse in groups of K"</li>
        </ul>
      </div>
    </div>
  );
}