import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'move' | 'meet' | 'no-cycle' | 'done';
  nodes: number[];
  cycleStart: number; // -1 means no cycle
  slow: number;
  fast: number;
  description: string;
  phase: 'detection' | 'complete';
}

function generateSteps(values: number[], cyclePos: number): Step[] {
  const steps: Step[] = [];
  const n = values.length;
  
  if (n === 0) {
    steps.push({
      type: 'done',
      nodes: [],
      cycleStart: -1,
      slow: -1,
      fast: -1,
      description: 'Empty list - no cycle possible',
      phase: 'complete',
    });
    return steps;
  }
  
  const hasCycle = cyclePos >= 0 && cyclePos < n;
  
  steps.push({
    type: 'start',
    nodes: values,
    cycleStart: hasCycle ? cyclePos : -1,
    slow: 0,
    fast: 0,
    description: `Floyd's Cycle Detection: slow moves 1 step, fast moves 2 steps. ${hasCycle ? `Cycle at index ${cyclePos}` : 'No cycle'}`,
    phase: 'detection',
  });
  
  let slow = 0;
  let fast = 0;
  let stepCount = 0;
  const maxSteps = n * 3; // Prevent infinite loops in visualization
  
  // Helper to get next index
  const getNext = (i: number): number => {
    if (i === n - 1) {
      return hasCycle ? cyclePos : -1; // -1 means null
    }
    return i + 1;
  };
  
  while (stepCount < maxSteps) {
    // Move slow by 1
    const nextSlow = getNext(slow);
    // Move fast by 2
    const nextFast1 = getNext(fast);
    const nextFast = nextFast1 >= 0 ? getNext(nextFast1) : -1;
    
    // Check if fast hit null (no cycle)
    if (nextFast1 < 0 || nextFast < 0) {
      steps.push({
        type: 'no-cycle',
        nodes: values,
        cycleStart: -1,
        slow: nextSlow >= 0 ? nextSlow : slow,
        fast: nextFast1 >= 0 ? nextFast1 : fast,
        description: 'Fast pointer reached null - No cycle detected!',
        phase: 'complete',
      });
      return steps;
    }
    
    slow = nextSlow;
    fast = nextFast;
    
    steps.push({
      type: 'move',
      nodes: values,
      cycleStart: hasCycle ? cyclePos : -1,
      slow,
      fast,
      description: `Slow → node ${slow} (val=${values[slow]}), Fast → node ${fast} (val=${values[fast]})`,
      phase: 'detection',
    });
    
    // Check if they meet
    if (slow === fast) {
      steps.push({
        type: 'meet',
        nodes: values,
        cycleStart: hasCycle ? cyclePos : -1,
        slow,
        fast,
        description: `🎯 Pointers meet at node ${slow}! Cycle detected!`,
        phase: 'complete',
      });
      
      steps.push({
        type: 'done',
        nodes: values,
        cycleStart: hasCycle ? cyclePos : -1,
        slow,
        fast,
        description: `Cycle confirmed! The linked list has a cycle starting at index ${cyclePos}`,
        phase: 'complete',
      });
      return steps;
    }
    
    stepCount++;
  }
  
  return steps;
}

export function LinkedListCycleVisualizer() {
  const [input, setInput] = useState('3,2,0,-4');
  const [cycleInput, setCycleInput] = useState('1');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const values = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const cyclePos = parseInt(cycleInput.trim());
    const validCyclePos = isNaN(cyclePos) ? -1 : cyclePos;
    
    if (values.length > 0 && values.length <= 10) {
      const newSteps = generateSteps(values, validCyclePos);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [input, cycleInput]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  const hasCycle = currentStepData && currentStepData.cycleStart >= 0;
  
  // Calculate node positions for visualization
  const getNodePosition = (index: number, total: number) => {
    const centerX = 400;
    const centerY = 150;
    const radiusX = 180;
    const radiusY = 80;
    
    // Arrange in an oval/arc shape
    const angle = Math.PI - (index / (total - 1 || 1)) * Math.PI;
    return {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY - radiusY * Math.sin(angle),
    };
  };
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Linked List Cycle Detection</h1>
        <p className="text-slate-400">
          Floyd's Tortoise and Hare algorithm. Slow pointer moves 1 step, fast moves 2.
          If they meet, there's a cycle!
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center flex-wrap">
        <div className="flex gap-2 items-center flex-1 min-w-[200px]">
          <label className="text-sm text-slate-400">Node values:</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-slate-400">Cycle at index (-1 for no cycle):</label>
          <input
            type="number"
            value={cycleInput}
            onChange={(e) => setCycleInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-20 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            min="-1"
          />
        </div>
      </div>
      
      {/* Linked list visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Linked List</h3>
        <div className="relative" style={{ height: '300px' }}>
          <svg className="absolute inset-0 w-full h-full">
            {/* Draw arrows between nodes */}
            {currentStepData?.nodes.map((_, i) => {
              if (i >= currentStepData.nodes.length - 1) return null;
              const from = getNodePosition(i, currentStepData.nodes.length);
              const to = getNodePosition(i + 1, currentStepData.nodes.length);
              return (
                <line
                  key={`arrow-${i}`}
                  x1={from.x + 25}
                  y1={from.y}
                  x2={to.x - 25}
                  y2={to.y}
                  stroke="#64748b"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            
            {/* Draw cycle arrow if present */}
            {hasCycle && currentStepData && (
              <path
                d={(() => {
                  const last = getNodePosition(currentStepData.nodes.length - 1, currentStepData.nodes.length);
                  const cycleTarget = getNodePosition(currentStepData.cycleStart, currentStepData.nodes.length);
                  // Draw a curved arrow going down and back
                  return `M ${last.x} ${last.y + 25} 
                          Q ${last.x + 50} ${last.y + 100} ${(last.x + cycleTarget.x) / 2} ${last.y + 120}
                          Q ${cycleTarget.x - 50} ${cycleTarget.y + 100} ${cycleTarget.x} ${cycleTarget.y + 25}`;
                })()}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,5"
                markerEnd="url(#arrowhead-cycle)"
              />
            )}
            
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
                <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
              </marker>
            </defs>
          </svg>
          
          {/* Render nodes */}
          {currentStepData?.nodes.map((val, i) => {
            const pos = getNodePosition(i, currentStepData.nodes.length);
            const isSlow = i === currentStepData.slow;
            const isFast = i === currentStepData.fast;
            const isCycleStart = i === currentStepData.cycleStart;
            const isMeetingPoint = isSlow && isFast && currentStepData.type === 'meet';
            
            return (
              <motion.div
                key={i}
                className="absolute flex flex-col items-center"
                style={{
                  left: pos.x - 25,
                  top: pos.y - 25,
                }}
                animate={{
                  scale: isSlow || isFast ? 1.2 : 1,
                }}
              >
                {/* Pointer labels */}
                <div className="absolute -top-8 flex gap-1">
                  {isSlow && (
                    <motion.span
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded"
                    >
                      🐢 Slow
                    </motion.span>
                  )}
                  {isFast && (
                    <motion.span
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="px-2 py-0.5 bg-orange-500 text-black text-xs font-bold rounded"
                    >
                      🐇 Fast
                    </motion.span>
                  )}
                </div>
                
                {/* Node */}
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                    isMeetingPoint ? 'bg-purple-500 border-purple-300' :
                    isSlow && isFast ? 'bg-purple-500 border-purple-300' :
                    isSlow ? 'bg-green-500 border-green-300' :
                    isFast ? 'bg-orange-500 border-orange-300' :
                    isCycleStart ? 'bg-yellow-500/30 border-yellow-500' :
                    'bg-slate-700 border-slate-600'
                  }`}
                  animate={{
                    boxShadow: isMeetingPoint 
                      ? '0 0 20px rgba(168, 85, 247, 0.5)' 
                      : 'none',
                  }}
                >
                  {val}
                </motion.div>
                
                <span className="text-xs text-slate-500 mt-1">idx: {i}</span>
                {isCycleStart && (
                  <span className="text-xs text-yellow-500">↩ cycle</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex gap-6 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500" />
            <span className="text-sm">🐢 Slow (1 step)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500" />
            <span className="text-sm">🐇 Fast (2 steps)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500" />
            <span className="text-sm">Meeting point</span>
          </div>
          {hasCycle && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-yellow-500" style={{ borderStyle: 'dashed' }} />
              <span className="text-sm">Cycle link</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'done' || currentStepData?.type === 'meet' ? 'bg-green-500' :
            currentStepData?.type === 'no-cycle' ? 'bg-blue-500' :
            'bg-yellow-500'
          }`} />
          <span className="text-lg">{currentStepData?.description || 'Ready'}</span>
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
{`public boolean hasCycle(ListNode head) {
    if (head == null || head.next == null) {
        return false;
    }
    
    ListNode slow = head;
    ListNode fast = head;
    
    while (fast != null && fast.next != null) {
        slow = slow.next;         // Move 1 step
        fast = fast.next.next;    // Move 2 steps
        
        if (slow == fast) {       // They meet = cycle!
            return true;
        }
    }
    
    return false;  // Fast hit null = no cycle
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Why Does This Work?</h3>
        <p className="text-slate-300">
          If there's a cycle, the fast pointer will eventually "lap" the slow pointer 
          inside the cycle. Think of it like two runners on a circular track - the faster 
          one will catch up. If there's no cycle, fast will hit null first.
        </p>
        <p className="text-slate-300 mt-2">
          <strong>Time:</strong> O(n) | <strong>Space:</strong> O(1)
        </p>
      </div>
    </div>
  );
}
