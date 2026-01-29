import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface ListNode {
  val: number;
  next: number | null; // index of next node, null means end
}

interface Step {
  type: 'start' | 'initialize-dummy' | 'advance-fast' | 'move-together' | 'remove-node' | 'relink' | 'done';
  nodes: ListNode[];
  fast: number | null;
  slow: number | null;
  nodeToDelete: number | null;
  description: string;
  // Visual state for nodes
  visualNodes: {
    val: number;
    originalIndex: number;
    isDeleted: boolean;
    nextPointer: number | null;
  }[];
  dummyNode: boolean; // whether dummy node is present
  gap: number; // the gap between fast and slow
}

function generateSteps(values: number[], n: number): Step[] {
  const steps: Step[] = [];
  
  if (values.length === 0 || n <= 0) {
    steps.push({
      type: 'done',
      nodes: [],
      fast: null,
      slow: null,
      nodeToDelete: null,
      description: 'Invalid input - empty list or invalid n',
      visualNodes: [],
      dummyNode: false,
      gap: 0,
    });
    return steps;
  }
  
  if (n > values.length) {
    steps.push({
      type: 'done',
      nodes: [],
      fast: null,
      slow: null,
      nodeToDelete: null,
      description: 'n is larger than list length - nothing to remove',
      visualNodes: [],
      dummyNode: false,
      gap: 0,
    });
    return steps;
  }
  
  // Build initial linked list (we'll use index 0 for dummy, 1+ for actual nodes)
  const initialNodes: ListNode[] = [
    { val: 0, next: 1 }, // dummy node
    ...values.map((val, i) => ({
      val,
      next: i < values.length - 1 ? i + 2 : null, // +2 because dummy takes index 0
    }))
  ];
  
  const initialVisualNodes = [
    { val: 0, originalIndex: 0, isDeleted: false, nextPointer: 1 }, // dummy
    ...values.map((val, i) => ({
      val,
      originalIndex: i + 1,
      isDeleted: false,
      nextPointer: i < values.length - 1 ? i + 2 : null,
    }))
  ];
  
  steps.push({
    type: 'start',
    nodes: [...initialNodes],
    fast: null,
    slow: null,
    nodeToDelete: null,
    description: `Remove the ${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} node from the end. Using two-pointer technique.`,
    visualNodes: [...initialVisualNodes],
    dummyNode: true,
    gap: 0,
  });
  
  steps.push({
    type: 'initialize-dummy',
    nodes: [...initialNodes],
    fast: 0, // start both at dummy
    slow: 0,
    nodeToDelete: null,
    description: 'Add dummy node pointing to head. Both fast and slow start at dummy.',
    visualNodes: [...initialVisualNodes],
    dummyNode: true,
    gap: 0,
  });
  
  // Advance fast pointer n steps ahead
  let fast: number | null = 0;
  let currentNodes = [...initialNodes];
  let currentVisualNodes = [...initialVisualNodes];
  
  for (let i = 0; i < n; i++) {
    if (fast !== null && currentNodes[fast].next !== null) {
      fast = currentNodes[fast].next;
    }
    steps.push({
      type: 'advance-fast',
      nodes: [...currentNodes],
      fast,
      slow: 0,
      nodeToDelete: null,
      description: `Advance fast pointer ${i + 1}/${n} steps to create gap of ${n}`,
      visualNodes: [...currentVisualNodes],
      dummyNode: true,
      gap: i + 1,
    });
  }
  
  // Now move both pointers until fast reaches the end
  let slow: number | null = 0;
  while (fast !== null && currentNodes[fast].next !== null) {
    fast = currentNodes[fast].next;
    slow = currentNodes[slow!].next;
    
    steps.push({
      type: 'move-together',
      nodes: [...currentNodes],
      fast,
      slow,
      nodeToDelete: null,
      description: `Move both pointers together. Fast at end means slow is ${n} nodes from end.`,
      visualNodes: [...currentVisualNodes],
      dummyNode: true,
      gap: n,
    });
  }
  
  // Identify node to delete (slow.next)
  const nodeToDeleteIndex = slow !== null ? currentNodes[slow].next : null;
  
  steps.push({
    type: 'remove-node',
    nodes: [...currentNodes],
    fast,
    slow,
    nodeToDelete: nodeToDeleteIndex,
    description: `Fast reached end! Slow points to node before the ${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} from end.`,
    visualNodes: [...currentVisualNodes],
    dummyNode: true,
    gap: n,
  });
  
  // Remove the node by relinking
  if (slow !== null && nodeToDeleteIndex !== null) {
    const nodeAfterDelete = currentNodes[nodeToDeleteIndex].next;
    currentNodes[slow].next = nodeAfterDelete;
    currentVisualNodes[slow].nextPointer = nodeAfterDelete;
    currentVisualNodes[nodeToDeleteIndex].isDeleted = true;
    
    steps.push({
      type: 'relink',
      nodes: [...currentNodes],
      fast,
      slow,
      nodeToDelete: nodeToDeleteIndex,
      description: 'Relink: slow.next = nodeToDelete.next, effectively removing the node.',
      visualNodes: [...currentVisualNodes],
      dummyNode: true,
      gap: n,
    });
  }
  
  steps.push({
    type: 'done',
    nodes: [...currentNodes],
    fast: null,
    slow: null,
    nodeToDelete: nodeToDeleteIndex,
    description: `Complete! Node ${nodeToDeleteIndex !== null ? values[nodeToDeleteIndex - 1] : 'N/A'} removed. Return dummy.next as new head.`,
    visualNodes: [...currentVisualNodes],
    dummyNode: true,
    gap: 0,
  });
  
  return steps;
}

const PRESETS = [
  { label: 'Example 1', values: [1, 2, 3, 4, 5], n: 2 },
  { label: 'Example 2', values: [1], n: 1 },
  { label: 'Example 3', values: [1, 2], n: 1 },
  { label: 'Remove Head', values: [1, 2, 3, 4], n: 4 },
  { label: 'Remove Tail', values: [1, 2, 3, 4], n: 1 },
  { label: 'Middle Node', values: [1, 2, 3, 4, 5], n: 3 },
];

export function RemoveNthNodeFromEndVisualizer() {
  const [inputValue, setInputValue] = useState('1, 2, 3, 4, 5');
  const [nValue, setNValue] = useState('2');
  const [values, setValues] = useState([1, 2, 3, 4, 5]);
  const [n, setN] = useState(2);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(values, n);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [values, n]);

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
    setN(preset.n);
    setInputValue(preset.values.join(', '));
    setNValue(preset.n.toString());
    const newSteps = generateSteps(preset.values, preset.n);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const parsedN = parseInt(nValue);
    if (parsed.length > 0 && parsed.length <= 8 && parsedN > 0) {
      setValues(parsed);
      setN(parsedN);
      const newSteps = generateSteps(parsed, parsedN);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  // Calculate node positions for visualization
  const getNodePosition = (index: number, total: number, isDummy: boolean = false) => {
    const spacing = Math.min(120, Math.max(80, 700 / total));
    const startX = Math.max(60, (800 - (total - 1) * spacing) / 2);
    return {
      x: isDummy ? startX - 80 : startX + (index - (step?.dummyNode ? 1 : 0)) * spacing,
      y: 150,
    };
  };

  const renderNode = (visualNode: typeof step.visualNodes[0], index: number, total: number) => {
    const isDummy = index === 0 && step?.dummyNode;
    const pos = getNodePosition(index, total, isDummy);
    const isFast = index === step?.fast;
    const isSlow = index === step?.slow;
    const isToDelete = index === step?.nodeToDelete;
    
    return (
      <motion.g key={`node-${index}`}>
        {/* Node circle */}
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r={isDummy ? "20" : "25"}
          fill={
            visualNode.isDeleted ? '#6b7280' :
            isToDelete ? '#ef4444' :
            isFast ? '#3b82f6' :
            isSlow ? '#10b981' :
            isDummy ? '#f59e0b' :
            '#475569'
          }
          stroke={
            visualNode.isDeleted ? '#4b5563' :
            isToDelete ? '#dc2626' :
            isFast ? '#2563eb' :
            isSlow ? '#059669' :
            isDummy ? '#d97706' :
            '#64748b'
          }
          strokeWidth="2"
          animate={{
            scale: isFast || isSlow || isToDelete ? 1.1 : 1,
          }}
          opacity={visualNode.isDeleted ? 0.5 : 1}
        />
        
        {/* Strikethrough for deleted nodes */}
        {visualNode.isDeleted && (
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
            x1={pos.x - 25}
            y1={pos.y}
            x2={pos.x + 25}
            y2={pos.y}
            stroke="#ef4444"
            strokeWidth="3"
          />
        )}
        
        {/* Node value */}
        <text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="central"
          className={`text-lg font-bold fill-white ${visualNode.isDeleted ? 'opacity-50' : ''}`}
        >
          {isDummy ? 'D' : visualNode.val}
        </text>
        
        {/* Pointer labels */}
        <AnimatePresence>
          {isFast && (
            <motion.text
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              x={pos.x}
              y={pos.y - 45}
              textAnchor="middle"
              className="text-sm font-bold fill-blue-400"
            >
              fast
            </motion.text>
          )}
          {isSlow && (
            <motion.text
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              x={pos.x}
              y={pos.y - (isFast ? 60 : 45)} // Offset if both labels present
              textAnchor="middle"
              className="text-sm font-bold fill-green-400"
            >
              slow
            </motion.text>
          )}
          {isToDelete && !visualNode.isDeleted && (
            <motion.text
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              x={pos.x}
              y={pos.y + 60}
              textAnchor="middle"
              className="text-sm font-bold fill-red-400"
            >
              to delete
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
          {isDummy ? 'dummy' : `idx: ${index - 1}`}
        </text>
      </motion.g>
    );
  };

  const renderArrow = (fromIndex: number, toIndex: number | null, total: number) => {
    if (toIndex === null) return null;
    
    const isDummyFrom = fromIndex === 0 && step?.dummyNode;
    const isDummyTo = toIndex === 0 && step?.dummyNode;
    
    const fromPos = getNodePosition(fromIndex, total, isDummyFrom);
    const toPos = getNodePosition(toIndex, total, isDummyTo);
    
    const startX = fromPos.x + (toIndex > fromIndex ? (isDummyFrom ? 20 : 25) : -(isDummyFrom ? 20 : 25));
    const endX = toPos.x + (toIndex > fromIndex ? -(isDummyTo ? 20 : 25) : (isDummyTo ? 20 : 25));
    const y = fromPos.y;
    
    return (
      <motion.g key={`arrow-${fromIndex}-${toIndex}`}>
        <motion.line
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke="#64748b"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
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

  const renderNullPointer = (fromIndex: number, total: number) => {
    const isDummy = fromIndex === 0 && step?.dummyNode;
    const fromPos = getNodePosition(fromIndex, total, isDummy);
    const startX = fromPos.x + (isDummy ? 20 : 25);
    const endX = startX + 40;
    const y = fromPos.y;
    
    return (
      <motion.g key={`null-${fromIndex}`}>
        <motion.line
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke="#64748b"
          strokeWidth="2"
        />
        <text
          x={endX + 10}
          y={y + 4}
          className="text-xs font-mono fill-slate-400"
        >
          null
        </text>
      </motion.g>
    );
  };

  // Show gap visualization
  const renderGapIndicator = () => {
    if (!step || step.gap === 0 || step.fast === null || step.slow === null) return null;
    
    const slowPos = getNodePosition(step.slow, step.visualNodes.length, step.slow === 0 && step.dummyNode);
    const fastPos = getNodePosition(step.fast, step.visualNodes.length, step.fast === 0 && step.dummyNode);
    
    return (
      <motion.g key="gap-indicator">
        <motion.line
          x1={slowPos.x}
          y1={slowPos.y + 35}
          x2={fastPos.x}
          y2={fastPos.y + 35}
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
        />
        <text
          x={(slowPos.x + fastPos.x) / 2}
          y={slowPos.y + 50}
          textAnchor="middle"
          className="text-xs fill-purple-400 font-bold"
        >
          gap: {step.gap}
        </text>
      </motion.g>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Remove Nth Node From End of List</h1>
        <p className="text-slate-400">
          Use the two-pointer technique: fast pointer advances n steps first, then both move together.
          When fast reaches the end, slow is positioned at the node before the one to delete.
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
        <label className="text-sm text-slate-400">n:</label>
        <input value={nValue} onChange={e => setNValue(e.target.value)}
          placeholder="2"
          type="number"
          min="1"
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono w-16" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Linked List Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Linked List - Two Pointer Technique</h3>
        <div className="flex justify-center">
          {step && step.visualNodes.length > 0 ? (
            <svg width="900" height="250" className="overflow-visible">
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
              {step.visualNodes.map((visualNode, i) => {
                if (!visualNode.isDeleted && visualNode.nextPointer !== null) {
                  return renderArrow(i, visualNode.nextPointer, step.visualNodes.length);
                } else if (!visualNode.isDeleted && visualNode.nextPointer === null && i > 0) {
                  return renderNullPointer(i, step.visualNodes.length);
                }
                return null;
              })}
              
              {/* Render gap indicator */}
              {renderGapIndicator()}
              
              {/* Render nodes */}
              {step.visualNodes.map((visualNode, i) => 
                renderNode(visualNode, i, step.visualNodes.length)
              )}
            </svg>
          ) : (
            <div className="py-20 text-center text-slate-500">
              Invalid input
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex gap-6 justify-center mt-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="text-slate-400">Dummy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
            <span className="text-slate-400">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-slate-400">slow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">fast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-slate-400">To Delete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500 opacity-50"></div>
            <span className="text-slate-400">Deleted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-purple-500" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-slate-400">Gap</span>
          </div>
        </div>
      </div>

      {/* Pointer State */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Pointer State</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="text-green-400 font-bold text-lg">
              {step?.slow !== null ? (step.slow === 0 && step.dummyNode ? 'Dummy' : `Node ${step.slow === 0 ? 'D' : step.slow - 1}`) : 'null'}
            </div>
            <div className="text-sm text-slate-400">slow</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-blue-400 font-bold text-lg">
              {step?.fast !== null ? (step.fast === 0 && step.dummyNode ? 'Dummy' : `Node ${step.fast === 0 ? 'D' : step.fast - 1}`) : 'null'}
            </div>
            <div className="text-sm text-slate-400">fast</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="text-purple-400 font-bold text-lg">
              {step?.gap || 0}
            </div>
            <div className="text-sm text-slate-400">gap</div>
          </div>
        </div>
      </div>

      {/* Algorithm Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Algorithm Pattern</h3>
        <p className="text-sm text-slate-300">
          <strong>The gap technique:</strong> Advance fast pointer n steps first to create a gap of n nodes. 
          Then move both pointers together until fast reaches the end. Now slow is exactly n positions 
          from the end, pointing to the node before the one we need to delete! The dummy head handles the edge case of removing the first node.
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'remove-node' || step?.type === 'relink' ? 'bg-red-500' :
            step?.type === 'advance-fast' || step?.type === 'move-together' ? 'bg-blue-500' :
            'bg-yellow-500'
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
{`public ListNode removeNthFromEnd(ListNode head, int n) {
    // Add dummy head to handle edge case of removing first node
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    
    ListNode fast = dummy;
    ListNode slow = dummy;
    
    // Advance fast pointer n steps to create gap
    for (int i = 0; i < n; i++) {
        fast = fast.next;
    }
    
    // Move both pointers until fast reaches end
    while (fast.next != null) {
        fast = fast.next;
        slow = slow.next;
    }
    
    // slow.next is the node to remove
    slow.next = slow.next.next;
    
    return dummy.next;  // Return new head
}
// Time: O(L) - single pass  |  Space: O(1) - only pointers`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Interview Tips</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Dummy head:</strong> Always use it to handle removing the first node cleanly</li>
          <li>• <strong>One pass:</strong> This technique does it in one pass, much better than two-pass solutions</li>
          <li>• <strong>Edge cases:</strong> Empty list, single node, removing head, n &gt; length</li>
          <li>• <strong>Gap visualization:</strong> Think "maintain a window/gap of exactly n nodes"</li>
          <li>• <strong>Pattern reuse:</strong> This two-pointer gap technique appears in many problems</li>
        </ul>
      </div>
    </div>
  );
}