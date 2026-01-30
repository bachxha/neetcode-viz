import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface ListNode {
  val: number;
  index: number;
}

interface Step {
  type: 'init' | 'move' | 'cycle-detected' | 'no-cycle';
  slowIndex: number;
  fastIndex: number | null;
  description: string;
  codeHighlight: number;
  hasMet: boolean;
}

function generateSteps(nodes: ListNode[], cycleStart: number | null): Step[] {
  const steps: Step[] = [];
  
  if (nodes.length === 0) {
    steps.push({
      type: 'no-cycle',
      slowIndex: -1,
      fastIndex: null,
      description: 'Empty list - no cycle possible.',
      codeHighlight: 1,
      hasMet: false,
    });
    return steps;
  }

  // Initialize pointers
  let slow = 0;
  let fast: number | null = 0;

  steps.push({
    type: 'init',
    slowIndex: slow,
    fastIndex: fast,
    description: 'Initialize slow and fast pointers at the head of the list.',
    codeHighlight: 2,
    hasMet: false,
  });

  // Run Floyd's algorithm
  while (fast !== null) {
    // Move fast pointer first (2 steps)
    // Step 1 for fast
    const fast1Next = getNext(fast, nodes.length, cycleStart);
    if (fast1Next === null) {
      steps.push({
        type: 'no-cycle',
        slowIndex: slow,
        fastIndex: null,
        description: 'Fast pointer reached null. No cycle detected!',
        codeHighlight: 4,
        hasMet: false,
      });
      break;
    }
    
    // Step 2 for fast  
    const fast2Next = getNext(fast1Next, nodes.length, cycleStart);
    fast = fast2Next;
    
    // Move slow pointer (1 step)
    const slowNext = getNext(slow, nodes.length, cycleStart);
    slow = slowNext!;

    // Check if fast is null after moves
    if (fast === null) {
      steps.push({
        type: 'no-cycle',
        slowIndex: slow,
        fastIndex: null,
        description: 'Fast pointer reached null. No cycle detected!',
        codeHighlight: 4,
        hasMet: false,
      });
      break;
    }

    // Check if they meet
    if (slow === fast) {
      steps.push({
        type: 'cycle-detected',
        slowIndex: slow,
        fastIndex: fast,
        description: `Slow and fast pointers meet at node ${nodes[slow].val}! Cycle detected!`,
        codeHighlight: 6,
        hasMet: true,
      });
      break;
    }

    steps.push({
      type: 'move',
      slowIndex: slow,
      fastIndex: fast,
      description: `Move slow to node ${nodes[slow].val}, fast to node ${nodes[fast].val}.`,
      codeHighlight: 3,
      hasMet: false,
    });

    // Safety: prevent infinite loop in step generation
    if (steps.length > nodes.length * 3) break;
  }

  return steps;
}

function getNext(index: number, length: number, cycleStart: number | null): number | null {
  if (index === length - 1) {
    // Last node - points to cycleStart if cycle exists, otherwise null
    return cycleStart;
  }
  return index + 1;
}

const PRESETS = [
  { label: 'With Cycle (pos=1)', nodes: [3, 2, 0, -4], cycleStart: 1 },
  { label: 'With Cycle (pos=0)', nodes: [1, 2], cycleStart: 0 },
  { label: 'No Cycle', nodes: [1, 2, 3, 4, 5], cycleStart: null },
  { label: 'Single Node (No Cycle)', nodes: [1], cycleStart: null },
  { label: 'Single Node with Cycle', nodes: [1], cycleStart: 0 },
  { label: 'Longer Cycle', nodes: [1, 2, 3, 4, 5, 6], cycleStart: 2 },
];

export function LinkedListCycleVisualizer() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [nodes, setNodes] = useState<ListNode[]>(
    PRESETS[0].nodes.map((val, i) => ({ val, index: i }))
  );
  const [cycleStart, setCycleStart] = useState<number | null>(PRESETS[0].cycleStart);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(nodes, cycleStart);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [nodes, cycleStart]);

  useEffect(() => { initializeSteps(); }, [initializeSteps]);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1500 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const handlePreset = (index: number) => {
    setSelectedPreset(index);
    const preset = PRESETS[index];
    const newNodes = preset.nodes.map((val, i) => ({ val, index: i }));
    setNodes(newNodes);
    setCycleStart(preset.cycleStart);
    const newSteps = generateSteps(newNodes, preset.cycleStart);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const step = steps[currentStep];

  // Calculate node positions in a horizontal layout with cycle arrow going back
  const getNodePosition = (index: number, total: number) => {
    const spacing = Math.min(100, Math.max(70, 600 / total));
    const startX = Math.max(80, (700 - (total - 1) * spacing) / 2);
    return {
      x: startX + index * spacing,
      y: 150,
    };
  };

  const renderNode = (node: ListNode, total: number) => {
    const pos = getNodePosition(node.index, total);
    
    const isSlow = step?.slowIndex === node.index;
    const isFast = step?.fastIndex === node.index;
    const isMeetingPoint = step?.hasMet && isSlow && isFast;
    const isInCycle = cycleStart !== null && node.index >= cycleStart;
    
    let nodeColor = '#475569'; // default slate
    let strokeColor = '#64748b';
    
    if (isMeetingPoint) {
      nodeColor = '#eab308'; // yellow for meeting point
      strokeColor = '#ca8a04';
    } else if (isSlow && isFast) {
      // Both pointers on same node but not met yet (shouldn't happen normally)
      nodeColor = '#8b5cf6';
      strokeColor = '#7c3aed';
    } else if (isSlow) {
      nodeColor = '#22c55e'; // green for slow
      strokeColor = '#16a34a';
    } else if (isFast) {
      nodeColor = '#3b82f6'; // blue for fast
      strokeColor = '#2563eb';
    } else if (isInCycle) {
      nodeColor = '#6366f1'; // indigo for cycle portion
      strokeColor = '#4f46e5';
    }

    return (
      <motion.g key={`node-${node.index}`}>
        {/* Cycle highlight ring */}
        {isInCycle && !isSlow && !isFast && (
          <motion.circle
            cx={pos.x}
            cy={pos.y}
            r="32"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity={0.5}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
        
        {/* Node circle */}
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r="28"
          fill={nodeColor}
          stroke={strokeColor}
          strokeWidth="3"
          animate={{
            scale: isSlow || isFast ? 1.15 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
        
        {/* Meeting point glow */}
        {isMeetingPoint && (
          <motion.circle
            cx={pos.x}
            cy={pos.y}
            r="38"
            fill="none"
            stroke="#eab308"
            strokeWidth="3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
        
        {/* Node value */}
        <text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-lg font-bold fill-white"
        >
          {node.val}
        </text>
        
        {/* Pointer labels */}
        <AnimatePresence>
          {isSlow && !isFast && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <text
                x={pos.x}
                y={pos.y - 48}
                textAnchor="middle"
                className="text-sm font-bold fill-green-400"
              >
                slow
              </text>
            </motion.g>
          )}
          {isFast && !isSlow && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <text
                x={pos.x}
                y={pos.y - 48}
                textAnchor="middle"
                className="text-sm font-bold fill-blue-400"
              >
                fast
              </text>
            </motion.g>
          )}
          {isSlow && isFast && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <text
                x={pos.x - 25}
                y={pos.y - 48}
                textAnchor="middle"
                className="text-sm font-bold fill-green-400"
              >
                slow
              </text>
              <text
                x={pos.x + 25}
                y={pos.y - 48}
                textAnchor="middle"
                className="text-sm font-bold fill-blue-400"
              >
                fast
              </text>
            </motion.g>
          )}
        </AnimatePresence>
        
        {/* Index label */}
        <text
          x={pos.x}
          y={pos.y + 48}
          textAnchor="middle"
          className="text-xs fill-slate-500"
        >
          [{node.index}]
        </text>
      </motion.g>
    );
  };

  const renderArrows = () => {
    const arrows: React.ReactNode[] = [];
    const total = nodes.length;
    
    // Regular arrows between consecutive nodes
    for (let i = 0; i < total - 1; i++) {
      const fromPos = getNodePosition(i, total);
      const toPos = getNodePosition(i + 1, total);
      
      arrows.push(
        <motion.g key={`arrow-${i}`}>
          <line
            x1={fromPos.x + 30}
            y1={fromPos.y}
            x2={toPos.x - 35}
            y2={toPos.y}
            stroke="#64748b"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        </motion.g>
      );
    }
    
    // Cycle arrow (from last node back to cycleStart)
    if (cycleStart !== null && total > 0) {
      const fromPos = getNodePosition(total - 1, total);
      const toPos = getNodePosition(cycleStart, total);
      
      // Draw curved arrow going below the nodes
      const midY = fromPos.y + 70;
      const path = `M ${fromPos.x} ${fromPos.y + 30} 
                    Q ${fromPos.x} ${midY} ${(fromPos.x + toPos.x) / 2} ${midY}
                    Q ${toPos.x} ${midY} ${toPos.x} ${toPos.y + 30}`;
      
      arrows.push(
        <motion.g key="cycle-arrow">
          <motion.path
            d={path}
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeDasharray="6 3"
            markerEnd="url(#arrowhead-cycle)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
          <text
            x={(fromPos.x + toPos.x) / 2}
            y={midY + 20}
            textAnchor="middle"
            className="text-xs fill-orange-400 font-medium"
          >
            cycle
          </text>
        </motion.g>
      );
    }
    
    // Null pointer for no cycle
    if (cycleStart === null && total > 0) {
      const lastPos = getNodePosition(total - 1, total);
      arrows.push(
        <motion.g key="null-arrow">
          <line
            x1={lastPos.x + 30}
            y1={lastPos.y}
            x2={lastPos.x + 60}
            y2={lastPos.y}
            stroke="#64748b"
            strokeWidth="2"
          />
          <text
            x={lastPos.x + 75}
            y={lastPos.y + 5}
            className="text-sm fill-slate-500 font-mono"
          >
            null
          </text>
        </motion.g>
      );
    }
    
    return arrows;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Linked List Cycle</h1>
        <p className="text-slate-400">
          Detect if a linked list has a cycle using Floyd's Tortoise and Hare algorithm.
          <br />
          Slow pointer moves 1 step, fast pointer moves 2 steps. If they meet, there's a cycle!
        </p>
      </div>

      {/* Preset Toggles */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => handlePreset(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPreset === i
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          {cycleStart !== null ? `Linked List with Cycle (connects to index ${cycleStart})` : 'Linked List (No Cycle)'}
        </h3>
        <div className="flex justify-center">
          <svg width="750" height="280" className="overflow-visible">
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
                id="arrowhead-cycle"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
              </marker>
            </defs>
            
            {/* Render arrows first (below nodes) */}
            {renderArrows()}
            
            {/* Render nodes */}
            {nodes.map((node) => renderNode(node, nodes.length))}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex gap-6 justify-center mt-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-slate-400">Slow (1 step)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">Fast (2 steps)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-slate-400">Meeting Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
            <span className="text-slate-400">Cycle Portion</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'cycle-detected' ? 'bg-yellow-500 animate-pulse' :
            step?.type === 'no-cycle' ? 'bg-green-500' :
            step?.type === 'move' ? 'bg-blue-500' :
            'bg-slate-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready to start'}</span>
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

      {/* Java Code */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code - Floyd's Cycle Detection</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public boolean hasCycle(ListNode head) {
    if (head == null || head.next == null) {
        return false;
    }
    
    ListNode slow = head;
    ListNode fast = head;
    
    while (fast != null && fast.next != null) {
        slow = slow.next;        // Move slow 1 step
        fast = fast.next.next;   // Move fast 2 steps
        
        if (slow == fast) {
            return true;  // Cycle detected!
        }
    }
    
    return false;  // No cycle - fast reached end
}
// Time: O(n)  |  Space: O(1)`}
        </pre>
      </div>

      {/* Key Insights */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Key Algorithm Insights</h3>
        <div className="text-slate-300 text-sm space-y-2">
          <div><strong>Why does this work?</strong> If there's a cycle, fast will eventually "lap" slow inside the cycle. Think of it like two runners on a circular track.</div>
          <div><strong>Why 2 steps?</strong> Fast moving 2 steps means it gains 1 node per iteration on slow. They're guaranteed to meet within one cycle loop.</div>
          <div><strong>No cycle case:</strong> If fast reaches null, the list has an end, therefore no cycle.</div>
          <div><strong>Follow-up:</strong> To find where the cycle starts, reset one pointer to head and move both 1 step at a time - they meet at the cycle start!</div>
        </div>
      </div>

      {/* Interview Tips */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Tips</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Edge cases:</strong> Empty list, single node, single node pointing to itself</li>
          <li>• <strong>Don't use extra space:</strong> HashSet works but uses O(n) space - Floyd's is O(1)</li>
          <li>• <strong>Common follow-up:</strong> "Find where the cycle begins" (LeetCode 142)</li>
          <li>• <strong>Visualization tip:</strong> Draw the cycle clearly and trace both pointers</li>
          <li>• <strong>Mathematical proof:</strong> After they meet, distance from head to cycle start = distance from meeting point to cycle start</li>
        </ul>
      </div>
    </div>
  );
}
