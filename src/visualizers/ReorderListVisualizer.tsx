import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface ListNode {
  val: number;
  next: number | null; // index of next node, null means end
}

interface VisualNode {
  val: number;
  originalIndex: number;
  phase: 'original' | 'first-half' | 'second-half' | 'reversed' | 'merged';
  nextPointer: number | null;
  isHighlighted?: boolean;
  isSlow?: boolean;
  isFast?: boolean;
}

interface Step {
  type: 'start' | 'find-middle' | 'split' | 'reverse' | 'merge' | 'done';
  phase: 'phase1' | 'phase2' | 'phase3' | 'complete';
  nodes: ListNode[];
  visualNodes: VisualNode[];
  slow: number | null;
  fast: number | null;
  description: string;
  codeHighlight: number; // Which line to highlight in code
  splitPoint?: number;
  firstHalf?: VisualNode[];
  secondHalf?: VisualNode[];
  mergedNodes?: VisualNode[];
}

function generateSteps(values: number[]): Step[] {
  const steps: Step[] = [];
  
  if (values.length === 0 || values.length === 1) {
    const initialNodes: ListNode[] = values.map((val, i) => ({
      val,
      next: i < values.length - 1 ? i + 1 : null,
    }));
    
    const initialVisualNodes: VisualNode[] = values.map((val, i) => ({
      val,
      originalIndex: i,
      phase: 'original',
      nextPointer: i < values.length - 1 ? i + 1 : null,
    }));

    steps.push({
      type: 'start',
      phase: 'complete',
      nodes: initialNodes,
      visualNodes: initialVisualNodes,
      slow: null,
      fast: null,
      description: values.length === 0 ? 'Empty list - nothing to reorder' : 'Single node - already reordered',
      codeHighlight: 0,
    });

    return steps;
  }
  
  // Build initial linked list
  const initialNodes: ListNode[] = values.map((val, i) => ({
    val,
    next: i < values.length - 1 ? i + 1 : null,
  }));
  
  const initialVisualNodes: VisualNode[] = values.map((val, i) => ({
    val,
    originalIndex: i,
    phase: 'original',
    nextPointer: i < values.length - 1 ? i + 1 : null,
  }));
  
  steps.push({
    type: 'start',
    phase: 'phase1',
    nodes: [...initialNodes],
    visualNodes: [...initialVisualNodes],
    slow: null,
    fast: null,
    description: 'Original linked list. We\'ll reorder it in 3 phases.',
    codeHighlight: 1,
  });
  
  // Phase 1: Find middle using slow/fast pointers
  let slow = 0;
  let fast = 0;
  let currentVisualNodes = [...initialVisualNodes];
  
  // Initialize pointers
  currentVisualNodes = currentVisualNodes.map((node, i) => ({
    ...node,
    isSlow: i === slow,
    isFast: i === fast,
  }));
  
  steps.push({
    type: 'find-middle',
    phase: 'phase1',
    nodes: [...initialNodes],
    visualNodes: [...currentVisualNodes],
    slow,
    fast,
    description: 'Phase 1: Initialize slow and fast pointers to find the middle.',
    codeHighlight: 2,
  });
  
  // Move pointers to find middle
  while (fast !== null && initialNodes[fast].next !== null) {
    slow = initialNodes[slow].next!;
    fast = initialNodes[fast].next!;
    if (fast !== null) {
      fast = initialNodes[fast].next!;
    }
    
    currentVisualNodes = currentVisualNodes.map((node, i) => ({
      ...node,
      isSlow: i === slow,
      isFast: i === fast,
    }));
    
    steps.push({
      type: 'find-middle',
      phase: 'phase1',
      nodes: [...initialNodes],
      visualNodes: [...currentVisualNodes],
      slow,
      fast,
      description: `Move pointers: slow advances 1 step, fast advances 2 steps.`,
      codeHighlight: 3,
    });
  }
  
  // Split the list
  const splitPoint = slow;
  const firstHalf = currentVisualNodes.slice(0, splitPoint).map(node => ({
    ...node,
    phase: 'first-half' as const,
    isSlow: false,
    isFast: false,
  }));
  
  const secondHalf = currentVisualNodes.slice(splitPoint).map((node, i) => ({
    ...node,
    originalIndex: splitPoint + i,
    phase: 'second-half' as const,
    isSlow: false,
    isFast: false,
    nextPointer: i < currentVisualNodes.slice(splitPoint).length - 1 ? splitPoint + i + 1 : null,
  }));
  
  steps.push({
    type: 'split',
    phase: 'phase1',
    nodes: [...initialNodes],
    visualNodes: [...currentVisualNodes],
    slow: null,
    fast: null,
    description: `Split at middle: First half [${firstHalf.map(n => n.val).join(', ')}], Second half [${secondHalf.map(n => n.val).join(', ')}]`,
    codeHighlight: 4,
    splitPoint,
    firstHalf,
    secondHalf,
  });
  
  // Phase 2: Reverse the second half
  if (secondHalf.length > 0) {
    let reversedSecondHalf: VisualNode[] = [...secondHalf];
    
    steps.push({
      type: 'reverse',
      phase: 'phase2',
      nodes: [...initialNodes],
      visualNodes: [...firstHalf, ...reversedSecondHalf],
      slow: null,
      fast: null,
      description: 'Phase 2: Reverse the second half using the 3-pointer technique.',
      codeHighlight: 5,
      firstHalf,
      secondHalf: reversedSecondHalf,
    });
    
    // Simulate reversal (simplified for visualization)
    for (let i = 0; i < reversedSecondHalf.length; i++) {
      reversedSecondHalf[i] = {
        ...reversedSecondHalf[i],
        phase: 'reversed' as const,
        nextPointer: i > 0 ? reversedSecondHalf[i - 1].originalIndex : null,
      };
      
      steps.push({
        type: 'reverse',
        phase: 'phase2',
        nodes: [...initialNodes],
        visualNodes: [...firstHalf, ...reversedSecondHalf],
        slow: null,
        fast: null,
        description: `Reversing node ${reversedSecondHalf[i].val}: pointer now points to ${i > 0 ? reversedSecondHalf[i - 1].val : 'null'}`,
        codeHighlight: 6,
        firstHalf,
        secondHalf: [...reversedSecondHalf],
      });
    }
  }
  
  // Phase 3: Merge alternately
  const finalFirstHalf = firstHalf;
  const finalSecondHalf = secondHalf.map((node, i) => ({
    ...node,
    phase: 'reversed' as const,
    nextPointer: i > 0 ? secondHalf[i - 1].originalIndex : null,
  }));
  
  let mergedNodes: VisualNode[] = [];
  let i = 0, j = 0;
  
  steps.push({
    type: 'merge',
    phase: 'phase3',
    nodes: [...initialNodes],
    visualNodes: [...finalFirstHalf, ...finalSecondHalf],
    slow: null,
    fast: null,
    description: 'Phase 3: Merge first half and reversed second half alternately.',
    codeHighlight: 7,
    firstHalf: finalFirstHalf,
    secondHalf: finalSecondHalf,
    mergedNodes: [],
  });
  
  while (i < finalFirstHalf.length && j < finalSecondHalf.length) {
    // Add from first half
    mergedNodes.push({
      ...finalFirstHalf[i],
      phase: 'merged',
      nextPointer: j < finalSecondHalf.length ? finalSecondHalf[j].originalIndex : null,
    });
    i++;
    
    steps.push({
      type: 'merge',
      phase: 'phase3',
      nodes: [...initialNodes],
      visualNodes: [...finalFirstHalf, ...finalSecondHalf],
      slow: null,
      fast: null,
      description: `Add from first half: ${finalFirstHalf[i-1].val}`,
      codeHighlight: 8,
      firstHalf: finalFirstHalf,
      secondHalf: finalSecondHalf,
      mergedNodes: [...mergedNodes],
    });
    
    // Add from second half (reversed)
    if (j < finalSecondHalf.length) {
      mergedNodes.push({
        ...finalSecondHalf[j],
        phase: 'merged',
        nextPointer: i < finalFirstHalf.length ? finalFirstHalf[i].originalIndex : null,
      });
      j++;
      
      steps.push({
        type: 'merge',
        phase: 'phase3',
        nodes: [...initialNodes],
        visualNodes: [...finalFirstHalf, ...finalSecondHalf],
        slow: null,
        fast: null,
        description: `Add from second half (reversed): ${finalSecondHalf[j-1].val}`,
        codeHighlight: 9,
        firstHalf: finalFirstHalf,
        secondHalf: finalSecondHalf,
        mergedNodes: [...mergedNodes],
      });
    }
  }
  
  // Add remaining nodes from first half
  while (i < finalFirstHalf.length) {
    mergedNodes.push({
      ...finalFirstHalf[i],
      phase: 'merged',
      nextPointer: i < finalFirstHalf.length - 1 ? finalFirstHalf[i + 1].originalIndex : null,
    });
    i++;
  }
  
  steps.push({
    type: 'done',
    phase: 'complete',
    nodes: [...initialNodes],
    visualNodes: mergedNodes,
    slow: null,
    fast: null,
    description: 'Reordering complete! List has been reordered as: L0 → Ln → L1 → Ln-1 → L2 → Ln-2...',
    codeHighlight: 10,
    mergedNodes,
  });
  
  return steps;
}

const PRESETS = [
  { label: 'Example 1', values: [1, 2, 3, 4] },
  { label: 'Example 2', values: [1, 2, 3, 4, 5] },
  { label: 'Short List', values: [1, 2, 3] },
  { label: 'Longer List', values: [1, 2, 3, 4, 5, 6] },
  { label: 'Two Nodes', values: [1, 2] },
];

export function ReorderListVisualizer() {
  const [inputValue, setInputValue] = useState('1, 2, 3, 4');
  const [values, setValues] = useState([1, 2, 3, 4]);
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 2000 / speed);
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
    const spacing = Math.min(120, Math.max(80, 700 / total));
    const startX = Math.max(60, (800 - (total - 1) * spacing) / 2);
    return {
      x: startX + index * spacing,
      y: 150,
    };
  };

  const renderNode = (visualNode: VisualNode, index: number, total: number) => {
    const pos = getNodePosition(index, total);
    
    let nodeColor = '#475569'; // default gray
    let strokeColor = '#64748b';
    
    if (visualNode.isSlow) {
      nodeColor = '#059669'; // green for slow pointer
      strokeColor = '#047857';
    } else if (visualNode.isFast) {
      nodeColor = '#2563eb'; // blue for fast pointer  
      strokeColor = '#1d4ed8';
    } else if (visualNode.phase === 'reversed') {
      nodeColor = '#8b5cf6'; // purple for reversed
      strokeColor = '#7c3aed';
    } else if (visualNode.phase === 'merged') {
      nodeColor = '#059669'; // green for merged
      strokeColor = '#047857';
    }
    
    return (
      <motion.g key={`node-${index}`}>
        {/* Node circle */}
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r="25"
          fill={nodeColor}
          stroke={strokeColor}
          strokeWidth="2"
          animate={{
            scale: visualNode.isSlow || visualNode.isFast ? 1.2 : 1,
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
          {visualNode.isSlow && (
            <motion.text
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              x={pos.x}
              y={pos.y - 45}
              textAnchor="middle"
              className="text-sm font-bold fill-green-400"
            >
              slow
            </motion.text>
          )}
          {visualNode.isFast && (
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
        </AnimatePresence>
        
        {/* Index label */}
        <text
          x={pos.x}
          y={pos.y + 45}
          textAnchor="middle"
          className="text-xs fill-slate-500"
        >
          idx: {visualNode.originalIndex}
        </text>
      </motion.g>
    );
  };

  const renderArrow = (fromIndex: number, toIndex: number | null, total: number, color: string = '#64748b') => {
    if (toIndex === null) return null;
    
    const fromPos = getNodePosition(fromIndex, total);
    const toPos = getNodePosition(toIndex, total);
    
    const startX = fromPos.x + (toIndex > fromIndex ? 25 : -25);
    const endX = toPos.x + (toIndex > fromIndex ? -25 : 25);
    const y = fromPos.y;
    
    return (
      <motion.g key={`arrow-${fromIndex}-${toIndex}`}>
        <motion.line
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke={color}
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          animate={{ pathLength: 1 }}
          initial={{ pathLength: 0 }}
        />
      </motion.g>
    );
  };

  const renderPhaseIndicator = () => {
    const phases = [
      { id: 'phase1', label: 'Find Middle', color: 'blue' },
      { id: 'phase2', label: 'Reverse Second Half', color: 'purple' },
      { id: 'phase3', label: 'Merge Alternately', color: 'green' },
    ];
    
    return (
      <div className="flex justify-center gap-4 mb-6">
        {phases.map((phase, i) => {
          const isActive = step?.phase === phase.id || (step?.phase === 'complete' && i === 2);
          const isCompleted = 
            (phase.id === 'phase1' && ['phase2', 'phase3', 'complete'].includes(step?.phase || '')) ||
            (phase.id === 'phase2' && ['phase3', 'complete'].includes(step?.phase || '')) ||
            (phase.id === 'phase3' && step?.phase === 'complete');
            
          return (
            <div
              key={phase.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isActive 
                  ? `bg-${phase.color}-500/20 border-${phase.color}-500/50` 
                  : isCompleted
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-slate-700 border-slate-600'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  isActive
                    ? `bg-${phase.color}-500`
                    : isCompleted
                    ? 'bg-green-500'
                    : 'bg-slate-500'
                }`}
              />
              <span className={`text-sm font-medium ${
                isActive || isCompleted ? 'text-white' : 'text-slate-400'
              }`}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reorder List</h1>
        <p className="text-slate-400">
          Reorder a linked list L0 → L1 → L2 → ... → Ln into L0 → Ln → L1 → Ln-1 → L2 → Ln-2...
          <br />
          Uses the three-phase algorithm: find middle, reverse second half, merge alternately.
        </p>
      </div>

      {/* Phase Indicator */}
      {renderPhaseIndicator()}

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
          placeholder="1, 2, 3, 4"
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono flex-1 min-w-[200px]" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Linked List Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          {step?.phase === 'phase1' ? 'Phase 1: Finding Middle with Two Pointers' :
           step?.phase === 'phase2' ? 'Phase 2: Reversing Second Half' :
           step?.phase === 'phase3' ? 'Phase 3: Merging Alternately' :
           'Original List'}
        </h3>
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
              </defs>
              
              {/* Render arrows */}
              {step.visualNodes.map((visualNode, i) => {
                if (visualNode.nextPointer !== null) {
                  const targetIndex = step.visualNodes.findIndex(n => n.originalIndex === visualNode.nextPointer);
                  if (targetIndex !== -1) {
                    let color = '#64748b';
                    if (visualNode.phase === 'reversed') color = '#8b5cf6';
                    if (visualNode.phase === 'merged') color = '#059669';
                    return renderArrow(i, targetIndex, step.visualNodes.length, color);
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
            <span className="text-slate-400">Original</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-600"></div>
            <span className="text-slate-400">Slow pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600"></div>
            <span className="text-slate-400">Fast pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-slate-400">Reversed portion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-slate-400">Merged nodes</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.phase === 'phase1' ? 'bg-blue-500' :
            step?.phase === 'phase2' ? 'bg-purple-500' :
            step?.phase === 'phase3' ? 'bg-green-500' :
            step?.phase === 'complete' ? 'bg-green-500' :
            'bg-slate-500'
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
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code - Three Phase Approach</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public void reorderList(ListNode head) {
    if (head == null || head.next == null) return;
    
    // Phase 1: Find middle using slow/fast pointers
    ListNode slow = head, fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    // Phase 2: Reverse second half
    ListNode secondHalf = reverseList(slow.next);
    slow.next = null; // Split the list
    
    // Phase 3: Merge alternately
    ListNode first = head, second = secondHalf;
    while (second != null) {
        ListNode temp1 = first.next;
        ListNode temp2 = second.next;
        
        first.next = second;
        second.next = temp1;
        
        first = temp1;
        second = temp2;
    }
}

private ListNode reverseList(ListNode head) {
    ListNode prev = null, current = head;
    while (current != null) {
        ListNode next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    return prev;
}
// Time: O(n) - single pass for each phase  |  Space: O(1) - only pointers`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Key Algorithm Insights</h3>
        <div className="text-slate-300 text-sm space-y-2">
          <div><strong>Phase 1 - Finding Middle:</strong> Use Floyd's cycle detection (slow/fast pointers). When fast reaches end, slow is at middle.</div>
          <div><strong>Phase 2 - Reversing:</strong> Apply the classic 3-pointer reversal technique to the second half only.</div>
          <div><strong>Phase 3 - Merging:</strong> Alternately connect nodes: first→second→first.next→second.next...</div>
          <div><strong>Pattern:</strong> This combines three fundamental linked list patterns in one elegant solution!</div>
        </div>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Tips</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Draw the phases:</strong> Sketch all 3 phases clearly on the whiteboard</li>
          <li>• <strong>Edge cases:</strong> Single node or empty list need no reordering</li>
          <li>• <strong>Space constraint:</strong> Must be done in O(1) space - no extra arrays!</li>
          <li>• <strong>Common mistake:</strong> Forgetting to null-terminate the first half after splitting</li>
          <li>• <strong>Follow-up:</strong> "How would you restore the original order?"</li>
        </ul>
      </div>
    </div>
  );
}