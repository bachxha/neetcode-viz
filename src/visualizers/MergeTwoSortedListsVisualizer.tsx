import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface ListNode {
  val: number;
  index: number; // original index in the list
}

interface Step {
  type: 'start' | 'compare' | 'take-from-list1' | 'take-from-list2' | 'advance-pointer' | 'add-remaining' | 'done';
  list1: ListNode[];
  list2: ListNode[];
  merged: ListNode[];
  pointer1: number; // index in list1
  pointer2: number; // index in list2
  description: string;
  comparingValues?: { val1: number; val2: number };
  actionNode?: { from: 'list1' | 'list2'; value: number };
}

function generateSteps(values1: number[], values2: number[]): Step[] {
  const steps: Step[] = [];
  
  const list1 = values1.map((val, i) => ({ val, index: i }));
  const list2 = values2.map((val, i) => ({ val, index: i }));
  
  // Start step
  steps.push({
    type: 'start',
    list1: [...list1],
    list2: [...list2],
    merged: [],
    pointer1: 0,
    pointer2: 0,
    description: 'Two sorted linked lists ready to merge. We\'ll use two pointers to compare and select the smaller value.',
  });
  
  let p1 = 0, p2 = 0;
  const merged: ListNode[] = [];
  
  // Main merge loop
  while (p1 < list1.length && p2 < list2.length) {
    // Compare step
    steps.push({
      type: 'compare',
      list1: [...list1],
      list2: [...list2],
      merged: [...merged],
      pointer1: p1,
      pointer2: p2,
      description: `Compare ${list1[p1].val} (list1) vs ${list2[p2].val} (list2). Take the smaller value.`,
      comparingValues: { val1: list1[p1].val, val2: list2[p2].val },
    });
    
    if (list1[p1].val <= list2[p2].val) {
      // Take from list1
      const nodeToAdd = { ...list1[p1] };
      merged.push(nodeToAdd);
      
      steps.push({
        type: 'take-from-list1',
        list1: [...list1],
        list2: [...list2],
        merged: [...merged],
        pointer1: p1,
        pointer2: p2,
        description: `${list1[p1].val} ≤ ${list2[p2].val}, so add ${list1[p1].val} to merged list and advance pointer1.`,
        actionNode: { from: 'list1', value: list1[p1].val },
      });
      
      p1++;
    } else {
      // Take from list2
      const nodeToAdd = { ...list2[p2] };
      merged.push(nodeToAdd);
      
      steps.push({
        type: 'take-from-list2',
        list1: [...list1],
        list2: [...list2],
        merged: [...merged],
        pointer1: p1,
        pointer2: p2,
        description: `${list2[p2].val} < ${list1[p1].val}, so add ${list2[p2].val} to merged list and advance pointer2.`,
        actionNode: { from: 'list2', value: list2[p2].val },
      });
      
      p2++;
    }
    
    // Advance pointer step
    steps.push({
      type: 'advance-pointer',
      list1: [...list1],
      list2: [...list2],
      merged: [...merged],
      pointer1: p1,
      pointer2: p2,
      description: `Pointers advanced. Continue with next comparison.`,
    });
  }
  
  // Add remaining nodes from list1
  while (p1 < list1.length) {
    const nodeToAdd = { ...list1[p1] };
    merged.push(nodeToAdd);
    
    steps.push({
      type: 'add-remaining',
      list1: [...list1],
      list2: [...list2],
      merged: [...merged],
      pointer1: p1,
      pointer2: p2,
      description: `List2 exhausted. Add remaining ${list1[p1].val} from list1.`,
      actionNode: { from: 'list1', value: list1[p1].val },
    });
    
    p1++;
  }
  
  // Add remaining nodes from list2
  while (p2 < list2.length) {
    const nodeToAdd = { ...list2[p2] };
    merged.push(nodeToAdd);
    
    steps.push({
      type: 'add-remaining',
      list1: [...list1],
      list2: [...list2],
      merged: [...merged],
      pointer1: p1,
      pointer2: p2,
      description: `List1 exhausted. Add remaining ${list2[p2].val} from list2.`,
      actionNode: { from: 'list2', value: list2[p2].val },
    });
    
    p2++;
  }
  
  // Done
  steps.push({
    type: 'done',
    list1: [...list1],
    list2: [...list2],
    merged: [...merged],
    pointer1: p1,
    pointer2: p2,
    description: 'Merge complete! Both lists have been fully processed and combined in sorted order.',
  });
  
  return steps;
}

const PRESETS = [
  { label: 'Example 1', list1: [1, 2, 4], list2: [1, 3, 4] },
  { label: 'Example 2', list1: [1, 3, 5], list2: [2, 4, 6] },
  { label: 'Different Lengths', list1: [1, 5, 7, 9], list2: [2, 3] },
  { label: 'One Empty', list1: [], list2: [1, 2, 3] },
  { label: 'Equal Values', list1: [1, 2, 3], list2: [1, 2, 3] },
];

export function MergeTwoSortedListsVisualizer() {
  const [inputValue1, setInputValue1] = useState('1, 2, 4');
  const [inputValue2, setInputValue2] = useState('1, 3, 4');
  const [values1, setValues1] = useState([1, 2, 4]);
  const [values2, setValues2] = useState([1, 3, 4]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(values1, values2);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [values1, values2]);

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
    setValues1(preset.list1);
    setValues2(preset.list2);
    setInputValue1(preset.list1.join(', '));
    setInputValue2(preset.list2.join(', '));
    const newSteps = generateSteps(preset.list1, preset.list2);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed1 = inputValue1.split(',').map(s => s.trim()).filter(s => s).map(s => parseInt(s)).filter(n => !isNaN(n));
    const parsed2 = inputValue2.split(',').map(s => s.trim()).filter(s => s).map(s => parseInt(s)).filter(n => !isNaN(n));
    setValues1(parsed1);
    setValues2(parsed2);
    const newSteps = generateSteps(parsed1, parsed2);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Calculate node positions for visualization
  const getNodePosition = (index: number, total: number, yOffset: number = 0) => {
    const maxNodes = Math.max(values1.length, values2.length, step?.merged.length || 0);
    const spacing = Math.min(100, Math.max(60, 600 / Math.max(maxNodes, 4)));
    const startX = Math.max(60, (800 - (total - 1) * spacing) / 2);
    return {
      x: startX + index * spacing,
      y: 100 + yOffset,
    };
  };

  const renderNode = (node: ListNode, index: number, total: number, listType: 'list1' | 'list2' | 'merged', yOffset: number = 0) => {
    if (!step) return null;
    
    const pos = getNodePosition(index, total, yOffset);
    const isPointer1 = listType === 'list1' && index === step.pointer1;
    const isPointer2 = listType === 'list2' && index === step.pointer2;
    const isComparing = (step.type === 'compare' && ((listType === 'list1' && isPointer1) || (listType === 'list2' && isPointer2)));
    const isBeingTaken = step.actionNode && (
      (step.actionNode.from === 'list1' && listType === 'list1' && isPointer1) ||
      (step.actionNode.from === 'list2' && listType === 'list2' && isPointer2)
    );
    const isMerged = listType === 'merged';
    const isProcessed = 
      (listType === 'list1' && index < step.pointer1) ||
      (listType === 'list2' && index < step.pointer2);
    
    return (
      <motion.g key={`${listType}-node-${index}`}>
        {/* Node circle */}
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r="22"
          fill={
            isBeingTaken ? '#f97316' :
            isComparing ? '#facc15' :
            isMerged ? '#10b981' :
            isProcessed ? '#64748b' :
            (isPointer1 || isPointer2) ? '#3b82f6' :
            '#475569'
          }
          stroke={
            isBeingTaken ? '#ea580c' :
            isComparing ? '#eab308' :
            isMerged ? '#059669' :
            isProcessed ? '#475569' :
            (isPointer1 || isPointer2) ? '#2563eb' :
            '#64748b'
          }
          strokeWidth="2"
          animate={{
            scale: isComparing || isBeingTaken ? 1.2 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        
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
          {(isPointer1 || isPointer2) && !isProcessed && (
            <motion.text
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              x={pos.x}
              y={pos.y - 35}
              textAnchor="middle"
              className="text-sm font-bold fill-blue-400"
            >
              {isPointer1 ? 'p1' : 'p2'}
            </motion.text>
          )}
        </AnimatePresence>
      </motion.g>
    );
  };

  const renderArrow = (fromIndex: number, toIndex: number, total: number, yOffset: number = 0) => {
    if (fromIndex >= total - 1) return null;
    
    const fromPos = getNodePosition(fromIndex, total, yOffset);
    const toPos = getNodePosition(toIndex, total, yOffset);
    
    const startX = fromPos.x + 22;
    const endX = toPos.x - 22;
    const y = fromPos.y;
    
    return (
      <motion.line
        key={`arrow-${fromIndex}-${toIndex}-${yOffset}`}
        x1={startX}
        y1={y}
        x2={endX}
        y2={y}
        stroke="#64748b"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    );
  };

  const renderNullPointer = (fromIndex: number, total: number, yOffset: number = 0) => {
    const fromPos = getNodePosition(fromIndex, total, yOffset);
    const startX = fromPos.x + 22;
    const endX = startX + 30;
    const y = fromPos.y;
    
    return (
      <motion.g key={`null-${fromIndex}-${yOffset}`}>
        <motion.line
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke="#64748b"
          strokeWidth="2"
        />
        <text
          x={endX + 5}
          y={y + 4}
          className="text-xs font-mono fill-slate-400"
        >
          null
        </text>
      </motion.g>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Merge Two Sorted Lists</h1>
        <p className="text-slate-400">
          Use two pointers to compare heads of both lists, always take the smaller value, 
          and build the merged result. A fundamental pattern for merging sorted data!
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
      <div className="mb-6 space-y-3">
        <div className="flex gap-3 items-center flex-wrap">
          <label className="text-sm text-slate-400 w-16">List 1:</label>
          <input value={inputValue1} onChange={e => setInputValue1(e.target.value)}
            placeholder="1, 2, 4"
            className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono flex-1 min-w-[200px]" />
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <label className="text-sm text-slate-400 w-16">List 2:</label>
          <input value={inputValue2} onChange={e => setInputValue2(e.target.value)}
            placeholder="1, 3, 4"
            className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono flex-1 min-w-[200px]" />
        </div>
        <button onClick={handleApply}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors">Apply</button>
      </div>

      {/* Linked Lists Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Merge Process Visualization</h3>
        <div className="flex justify-center">
          {step ? (
            <svg width="800" height="350" className="overflow-visible">
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
              
              {/* List 1 Label */}
              <text x="50" y="90" className="text-sm font-semibold fill-slate-400">List 1:</text>
              
              {/* List 1 nodes */}
              {step.list1.length > 0 ? (
                <>
                  {step.list1.map((node, i) => renderNode(node, i, step.list1.length, 'list1', 0))}
                  {step.list1.map((_, i) => i < step.list1.length - 1 ? renderArrow(i, i + 1, step.list1.length, 0) : null)}
                  {step.list1.length > 0 && renderNullPointer(step.list1.length - 1, step.list1.length, 0)}
                </>
              ) : (
                <text x="120" y="105" className="text-sm fill-slate-500">empty</text>
              )}
              
              {/* List 2 Label */}
              <text x="50" y="190" className="text-sm font-semibold fill-slate-400">List 2:</text>
              
              {/* List 2 nodes */}
              {step.list2.length > 0 ? (
                <>
                  {step.list2.map((node, i) => renderNode(node, i, step.list2.length, 'list2', 100))}
                  {step.list2.map((_, i) => i < step.list2.length - 1 ? renderArrow(i, i + 1, step.list2.length, 100) : null)}
                  {step.list2.length > 0 && renderNullPointer(step.list2.length - 1, step.list2.length, 100)}
                </>
              ) : (
                <text x="120" y="205" className="text-sm fill-slate-500">empty</text>
              )}
              
              {/* Merged Result Label */}
              <text x="50" y="290" className="text-sm font-semibold fill-green-400">Merged:</text>
              
              {/* Merged result nodes */}
              {step.merged.length > 0 ? (
                <>
                  {step.merged.map((node, i) => renderNode(node, i, step.merged.length, 'merged', 200))}
                  {step.merged.map((_, i) => i < step.merged.length - 1 ? renderArrow(i, i + 1, step.merged.length, 200) : null)}
                  {step.merged.length > 0 && renderNullPointer(step.merged.length - 1, step.merged.length, 200)}
                </>
              ) : (
                <text x="120" y="305" className="text-sm fill-slate-500">empty</text>
              )}
            </svg>
          ) : (
            <div className="py-20 text-center text-slate-500">
              Ready to merge
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
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">Pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-slate-400">Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-slate-400">Taking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-slate-400">Merged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600 opacity-75"></div>
            <span className="text-slate-400">Processed</span>
          </div>
        </div>
      </div>

      {/* Comparison State */}
      {step?.comparingValues && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Current Comparison</h3>
          <div className="flex justify-center items-center gap-8">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <div className="text-blue-400 font-bold text-2xl">{step.comparingValues.val1}</div>
              <div className="text-sm text-slate-400">List 1</div>
            </div>
            <div className="text-2xl text-slate-400">vs</div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <div className="text-blue-400 font-bold text-2xl">{step.comparingValues.val2}</div>
              <div className="text-sm text-slate-400">List 2</div>
            </div>
            <div className="text-2xl text-slate-400">→</div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-green-400 font-bold text-2xl">
                {Math.min(step.comparingValues.val1, step.comparingValues.val2)}
              </div>
              <div className="text-sm text-slate-400">Choose Smaller</div>
            </div>
          </div>
        </div>
      )}

      {/* Pointer State */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Pointer State</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-blue-400 font-bold text-lg">
              {step && step.pointer1 < step.list1.length ? `Index ${step.pointer1}` : 'End'}
            </div>
            <div className="text-sm text-slate-400">pointer1 (List 1)</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-blue-400 font-bold text-lg">
              {step && step.pointer2 < step.list2.length ? `Index ${step.pointer2}` : 'End'}
            </div>
            <div className="text-sm text-slate-400">pointer2 (List 2)</div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'compare' ? 'bg-yellow-500' :
            step?.type.startsWith('take-from') ? 'bg-orange-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready to merge'}</span>
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
{`public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    // Create a dummy node to simplify the logic
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    
    // Use two pointers to compare and merge
    while (list1 != null && list2 != null) {
        if (list1.val <= list2.val) {
            tail.next = list1;    // Add smaller node to result
            list1 = list1.next;   // Advance pointer1
        } else {
            tail.next = list2;    // Add smaller node to result
            list2 = list2.next;   // Advance pointer2
        }
        tail = tail.next;         // Move result tail pointer
    }
    
    // Append remaining nodes (one list is exhausted)
    tail.next = (list1 != null) ? list1 : list2;
    
    return dummy.next;  // Skip the dummy node
}
// Time: O(n + m) - visit each node once  |  Space: O(1) - only pointers`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Algorithm Insight</h3>
        <p className="text-slate-300 text-sm mb-3">
          <strong>The two-pointer technique:</strong> Since both lists are already sorted, we only need to 
          compare the current heads and always take the smaller one. This maintains the sorted order 
          in the merged result without needing additional sorting!
        </p>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Interview Tips</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Dummy node trick:</strong> Use a dummy head to avoid special cases for the first node</li>
          <li>• <strong>Edge cases:</strong> One or both lists empty - handle gracefully</li>
          <li>• <strong>Time complexity:</strong> O(n + m) where n, m are the lengths of both lists</li>
          <li>• <strong>Space:</strong> O(1) if modifying existing nodes, O(n + m) if creating new list</li>
          <li>• <strong>Follow-up:</strong> "Merge k sorted lists" uses this as a building block</li>
        </ul>
      </div>
    </div>
  );
}