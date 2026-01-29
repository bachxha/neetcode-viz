import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface ListNode {
  val: number;
  next: number | null;
}

interface Step {
  type: 'start' | 'initialize' | 'add-digits' | 'calculate-sum' | 'create-node' | 'handle-carry' | 'advance' | 'final-carry' | 'done';
  l1: ListNode[];
  l2: ListNode[];
  result: ListNode[];
  l1Pointer: number | null;
  l2Pointer: number | null;
  resultPointer: number | null;
  carry: number;
  currentDigit1: number | null;
  currentDigit2: number | null;
  sum: number | null;
  newDigit: number | null;
  description: string;
}

function generateSteps(nums1: number[], nums2: number[]): Step[] {
  const steps: Step[] = [];
  
  // Build linked lists (digits in reverse order)
  const l1: ListNode[] = nums1.map((val, i) => ({
    val,
    next: i < nums1.length - 1 ? i + 1 : null,
  }));
  
  const l2: ListNode[] = nums2.map((val, i) => ({
    val,
    next: i < nums2.length - 1 ? i + 1 : null,
  }));
  
  steps.push({
    type: 'start',
    l1: [...l1],
    l2: [...l2],
    result: [],
    l1Pointer: null,
    l2Pointer: null,
    resultPointer: null,
    carry: 0,
    currentDigit1: null,
    currentDigit2: null,
    sum: null,
    newDigit: null,
    description: `Two numbers in linked lists (digits in reverse order): ${nums1.reverse().join('')} + ${nums2.reverse().join('')}`,
  });
  
  // Reverse back since we used reverse() just for display
  nums1.reverse();
  nums2.reverse();
  
  steps.push({
    type: 'initialize',
    l1: [...l1],
    l2: [...l2],
    result: [],
    l1Pointer: 0,
    l2Pointer: 0,
    resultPointer: null,
    carry: 0,
    currentDigit1: null,
    currentDigit2: null,
    sum: null,
    newDigit: null,
    description: 'Initialize pointers to the first nodes and carry = 0',
  });
  
  let result: ListNode[] = [];
  let l1Ptr: number | null = nums1.length > 0 ? 0 : null;
  let l2Ptr: number | null = nums2.length > 0 ? 0 : null;
  let carry = 0;
  let resultIndex = 0;
  
  while (l1Ptr !== null || l2Ptr !== null || carry !== 0) {
    const digit1 = l1Ptr !== null ? l1[l1Ptr].val : 0;
    const digit2 = l2Ptr !== null ? l2[l2Ptr].val : 0;
    
    steps.push({
      type: 'add-digits',
      l1: [...l1],
      l2: [...l2],
      result: [...result],
      l1Pointer: l1Ptr,
      l2Pointer: l2Ptr,
      resultPointer: result.length > 0 ? result.length - 1 : null,
      carry,
      currentDigit1: digit1,
      currentDigit2: digit2,
      sum: null,
      newDigit: null,
      description: `Get current digits: ${digit1} + ${digit2} + carry(${carry})`,
    });
    
    const sum = digit1 + digit2 + carry;
    
    steps.push({
      type: 'calculate-sum',
      l1: [...l1],
      l2: [...l2],
      result: [...result],
      l1Pointer: l1Ptr,
      l2Pointer: l2Ptr,
      resultPointer: result.length > 0 ? result.length - 1 : null,
      carry,
      currentDigit1: digit1,
      currentDigit2: digit2,
      sum,
      newDigit: null,
      description: `Calculate sum: ${digit1} + ${digit2} + ${carry} = ${sum}`,
    });
    
    const newDigit = sum % 10;
    const newCarry = Math.floor(sum / 10);
    
    steps.push({
      type: 'create-node',
      l1: [...l1],
      l2: [...l2],
      result: [...result],
      l1Pointer: l1Ptr,
      l2Pointer: l2Ptr,
      resultPointer: result.length > 0 ? result.length - 1 : null,
      carry,
      currentDigit1: digit1,
      currentDigit2: digit2,
      sum,
      newDigit,
      description: `New digit: ${sum} % 10 = ${newDigit}, new carry: ${sum} ÷ 10 = ${newCarry}`,
    });
    
    // Add new node to result
    result.push({
      val: newDigit,
      next: null,
    });
    
    // Update previous node's next pointer
    if (result.length > 1) {
      result[result.length - 2].next = result.length - 1;
    }
    
    carry = newCarry;
    
    if (newCarry > 0) {
      steps.push({
        type: 'handle-carry',
        l1: [...l1],
        l2: [...l2],
        result: [...result],
        l1Pointer: l1Ptr,
        l2Pointer: l2Ptr,
        resultPointer: result.length - 1,
        carry: newCarry,
        currentDigit1: digit1,
        currentDigit2: digit2,
        sum,
        newDigit,
        description: `Created node with value ${newDigit}. Carry = ${newCarry} for next position`,
      });
    } else {
      steps.push({
        type: 'handle-carry',
        l1: [...l1],
        l2: [...l2],
        result: [...result],
        l1Pointer: l1Ptr,
        l2Pointer: l2Ptr,
        resultPointer: result.length - 1,
        carry: 0,
        currentDigit1: digit1,
        currentDigit2: digit2,
        sum,
        newDigit,
        description: `Created node with value ${newDigit}. No carry needed`,
      });
    }
    
    // Advance pointers
    const nextL1 = l1Ptr !== null && l1[l1Ptr].next !== null ? l1[l1Ptr].next : null;
    const nextL2 = l2Ptr !== null && l2[l2Ptr].next !== null ? l2[l2Ptr].next : null;
    
    if (nextL1 !== null || nextL2 !== null || newCarry !== 0) {
      l1Ptr = nextL1;
      l2Ptr = nextL2;
      
      steps.push({
        type: 'advance',
        l1: [...l1],
        l2: [...l2],
        result: [...result],
        l1Pointer: l1Ptr,
        l2Pointer: l2Ptr,
        resultPointer: result.length - 1,
        carry: newCarry,
        currentDigit1: null,
        currentDigit2: null,
        sum: null,
        newDigit: null,
        description: 'Advance to next digits in both lists',
      });
    } else {
      break;
    }
    
    resultIndex++;
  }
  
  const finalNums = [...nums1].reverse();
  const finalNums2 = [...nums2].reverse();
  const resultDigits = result.map(node => node.val).reverse();
  
  steps.push({
    type: 'done',
    l1: [...l1],
    l2: [...l2],
    result: [...result],
    l1Pointer: null,
    l2Pointer: null,
    resultPointer: null,
    carry: 0,
    currentDigit1: null,
    currentDigit2: null,
    sum: null,
    newDigit: null,
    description: `Complete! ${finalNums.join('')} + ${finalNums2.join('')} = ${resultDigits.join('')}`,
  });
  
  return steps;
}

const PRESETS = [
  { label: 'Example 1', l1: [2, 4, 3], l2: [5, 6, 4] }, // 342 + 465 = 807
  { label: 'Example 2', l1: [0], l2: [0] }, // 0 + 0 = 0
  { label: 'Example 3', l1: [9, 9, 9, 9, 9, 9, 9], l2: [9, 9, 9, 9] }, // 9999999 + 9999 = 10009998
  { label: 'With Carry', l1: [9, 9, 9], l2: [1] }, // 999 + 1 = 1000
  { label: 'Simple', l1: [1, 2], l2: [3, 4] }, // 21 + 43 = 64
];

export function AddTwoNumbersVisualizer() {
  const [inputL1, setInputL1] = useState('2, 4, 3');
  const [inputL2, setInputL2] = useState('5, 6, 4');
  const [l1Values, setL1Values] = useState([2, 4, 3]);
  const [l2Values, setL2Values] = useState([5, 6, 4]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(l1Values, l2Values);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [l1Values, l2Values]);

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
    setL1Values(preset.l1);
    setL2Values(preset.l2);
    setInputL1(preset.l1.join(', '));
    setInputL2(preset.l2.join(', '));
  };

  const handleApply = () => {
    const parsedL1 = inputL1.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 9);
    const parsedL2 = inputL2.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 9);
    
    if (parsedL1.length > 0 && parsedL2.length > 0 && parsedL1.length <= 10 && parsedL2.length <= 10) {
      setL1Values(parsedL1);
      setL2Values(parsedL2);
    }
  };

  const getNodePosition = (index: number, total: number, listIndex: number) => {
    const spacing = Math.min(80, Math.max(60, 500 / Math.max(total, 6)));
    const startX = Math.max(60, (700 - (total - 1) * spacing) / 2);
    return {
      x: startX + index * spacing,
      y: 120 + listIndex * 120, // Different y for each list
    };
  };

  const renderListNode = (
    node: ListNode,
    index: number,
    total: number,
    listIndex: number,
    isPointer: boolean,
    listName: string
  ) => {
    const pos = getNodePosition(index, total, listIndex);
    const isCurrentDigit = (listIndex === 0 && index === step?.l1Pointer) || 
                          (listIndex === 1 && index === step?.l2Pointer) ||
                          (listIndex === 2 && index === step?.resultPointer);
    
    return (
      <motion.g key={`${listName}-node-${index}`}>
        {/* Node circle */}
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r="22"
          fill={
            isCurrentDigit ? '#facc15' :
            listIndex === 2 ? '#10b981' :
            '#475569'
          }
          stroke={
            isCurrentDigit ? '#eab308' :
            listIndex === 2 ? '#059669' :
            '#64748b'
          }
          strokeWidth="2"
          animate={{
            scale: isCurrentDigit ? 1.1 : 1,
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
          {node.val}
        </text>
        
        {/* Pointer label */}
        <AnimatePresence>
          {isPointer && (
            <motion.text
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              x={pos.x}
              y={pos.y - 35}
              textAnchor="middle"
              className="text-sm font-bold fill-yellow-400"
            >
              {listIndex === 0 ? 'ptr1' : listIndex === 1 ? 'ptr2' : 'result'}
            </motion.text>
          )}
        </AnimatePresence>
        
        {/* Index label */}
        <text
          x={pos.x}
          y={pos.y + 40}
          textAnchor="middle"
          className="text-xs fill-slate-500"
        >
          {index}
        </text>
      </motion.g>
    );
  };

  const renderArrow = (fromIndex: number, toIndex: number, total: number, listIndex: number) => {
    const fromPos = getNodePosition(fromIndex, total, listIndex);
    const toPos = getNodePosition(toIndex, total, listIndex);
    
    const startX = fromPos.x + 22;
    const endX = toPos.x - 22;
    const y = fromPos.y;
    
    return (
      <motion.line
        key={`arrow-${listIndex}-${fromIndex}-${toIndex}`}
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Add Two Numbers</h1>
        <p className="text-slate-400">
          Add two numbers represented by linked lists where digits are stored in reverse order.
          Each node contains a single digit and we build the result digit by digit with carry propagation.
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((preset, i) => (
          <button
            key={i}
            onClick={() => handlePreset(preset)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
      
      <div className="mb-6 space-y-3">
        <div className="flex gap-3 items-center flex-wrap">
          <label className="text-sm text-slate-400 w-20">List 1:</label>
          <input
            value={inputL1}
            onChange={e => setInputL1(e.target.value)}
            placeholder="2, 4, 3"
            className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono flex-1 min-w-[200px]"
          />
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <label className="text-sm text-slate-400 w-20">List 2:</label>
          <input
            value={inputL2}
            onChange={e => setInputL2(e.target.value)}
            placeholder="5, 6, 4"
            className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono flex-1 min-w-[200px]"
          />
        </div>
        <button
          onClick={handleApply}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
        >
          Apply Changes
        </button>
      </div>

      {/* Linked Lists Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Addition Process</h3>
        <div className="flex justify-center">
          {step ? (
            <svg width="800" height="400" className="overflow-visible">
              {/* Arrow marker definition */}
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

              {/* List labels */}
              <text x="20" y="130" className="text-sm font-semibold fill-slate-400">L1:</text>
              <text x="20" y="250" className="text-sm font-semibold fill-slate-400">L2:</text>
              <text x="20" y="370" className="text-sm font-semibold fill-slate-400">Result:</text>

              {/* Render arrows for L1 */}
              {step.l1.map((node, i) => {
                if (node.next !== null) {
                  return renderArrow(i, node.next, step.l1.length, 0);
                }
                return null;
              })}
              
              {/* Render arrows for L2 */}
              {step.l2.map((node, i) => {
                if (node.next !== null) {
                  return renderArrow(i, node.next, step.l2.length, 1);
                }
                return null;
              })}
              
              {/* Render arrows for Result */}
              {step.result.map((node, i) => {
                if (node.next !== null) {
                  return renderArrow(i, node.next, step.result.length, 2);
                }
                return null;
              })}

              {/* Render L1 nodes */}
              {step.l1.map((node, i) =>
                renderListNode(node, i, step.l1.length, 0, i === step.l1Pointer, 'l1')
              )}
              
              {/* Render L2 nodes */}
              {step.l2.map((node, i) =>
                renderListNode(node, i, step.l2.length, 1, i === step.l2Pointer, 'l2')
              )}
              
              {/* Render Result nodes */}
              {step.result.map((node, i) =>
                renderListNode(node, i, Math.max(step.result.length, 1), 2, i === step.resultPointer, 'result')
              )}
            </svg>
          ) : (
            <div className="py-20 text-center text-slate-500">
              Loading...
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex gap-6 justify-center mt-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
            <span className="text-slate-400">Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-slate-400">Current Position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-slate-400">Result Node</span>
          </div>
        </div>
      </div>

      {/* Math Calculation */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Current Calculation</h3>
        <div className="text-center space-y-3">
          {step?.currentDigit1 !== null && step?.currentDigit2 !== null ? (
            <div className="space-y-2">
              <div className="text-2xl font-mono">
                <span className="text-yellow-400">{step.currentDigit1}</span>
                {' + '}
                <span className="text-yellow-400">{step.currentDigit2}</span>
                {' + '}
                <span className="text-orange-400">{step.carry}</span>
                {step.sum !== null && (
                  <>
                    {' = '}
                    <span className="text-white">{step.sum}</span>
                  </>
                )}
              </div>
              
              {step.newDigit !== null && step.sum !== null && (
                <div className="text-lg font-mono text-slate-300">
                  <div>New digit: {step.sum} % 10 = <span className="text-green-400 font-bold">{step.newDigit}</span></div>
                  <div>New carry: ⌊{step.sum} ÷ 10⌋ = <span className="text-orange-400 font-bold">{Math.floor(step.sum / 10)}</span></div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-500 italic">
              {step?.type === 'start' ? 'Ready to start addition' : 
               step?.type === 'done' ? 'Addition complete!' :
               'Select digits to add'}
            </div>
          )}
          
          <div className="bg-slate-700 rounded p-3">
            <div className="text-sm text-slate-400">Current Carry:</div>
            <div className="text-xl font-bold text-orange-400">{step?.carry || 0}</div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'create-node' ? 'bg-green-500' :
            step?.type === 'handle-carry' ? 'bg-orange-500' :
            step?.type === 'add-digits' || step?.type === 'calculate-sum' ? 'bg-yellow-500' :
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
{`public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode current = dummy;
    int carry = 0;
    
    while (l1 != null || l2 != null || carry != 0) {
        int digit1 = (l1 != null) ? l1.val : 0;
        int digit2 = (l2 != null) ? l2.val : 0;
        
        int sum = digit1 + digit2 + carry;
        int newDigit = sum % 10;
        carry = sum / 10;
        
        current.next = new ListNode(newDigit);
        current = current.next;
        
        if (l1 != null) l1 = l1.next;
        if (l2 != null) l2 = l2.next;
    }
    
    return dummy.next;
}
// Time: O(max(m,n)) - visit all digits  |  Space: O(max(m,n)) - result list`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 Key Insights</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Reverse storage:</strong> Digits stored in reverse order makes addition natural (least significant first)</li>
          <li>• <strong>Carry handling:</strong> Always check if carry exists after processing all digits</li>
          <li>• <strong>Different lengths:</strong> Handle lists of different lengths by treating missing digits as 0</li>
          <li>• <strong>Dummy head:</strong> Use dummy node to simplify result list construction</li>
          <li>• <strong>Edge cases:</strong> Empty lists, single digits, carry overflow (999 + 1 = 1000)</li>
        </ul>
      </div>
    </div>
  );
}