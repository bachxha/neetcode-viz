import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Interval {
  start: number;
  end: number;
  id: number;
  status: 'pending' | 'kept' | 'removed';
}

interface Step {
  type: 'initial' | 'sort' | 'keep-first' | 'compare' | 'keep' | 'remove' | 'done';
  intervals: Interval[];
  currentIndex: number;
  prevEnd: number;
  removedCount: number;
  description: string;
}

const COLORS = {
  pending: '#64748b',
  kept: '#22c55e',
  removed: '#ef4444',
  current: '#eab308',
};

function parseIntervals(input: string): Interval[] {
  try {
    const parsed = JSON.parse(input);
    return parsed.map((arr: number[], i: number) => ({
      start: arr[0],
      end: arr[1],
      id: i,
      status: 'pending' as const,
    }));
  } catch {
    return [];
  }
}

function generateSteps(intervals: Interval[]): Step[] {
  if (intervals.length === 0) return [];
  
  const steps: Step[] = [];
  
  // Initial state
  steps.push({
    type: 'initial',
    intervals: intervals.map(i => ({ ...i })),
    currentIndex: -1,
    prevEnd: -Infinity,
    removedCount: 0,
    description: 'Initial intervals (unsorted)',
  });
  
  // Sort by END time (greedy: keep intervals that end early)
  const sorted = [...intervals].sort((a, b) => a.end - b.end);
  steps.push({
    type: 'sort',
    intervals: sorted.map(i => ({ ...i })),
    currentIndex: -1,
    prevEnd: -Infinity,
    removedCount: 0,
    description: 'Sort by END time (greedy: prefer intervals that end early)',
  });
  
  let prevEnd = -Infinity;
  let removedCount = 0;
  
  // Keep first interval
  sorted[0].status = 'kept';
  prevEnd = sorted[0].end;
  steps.push({
    type: 'keep-first',
    intervals: sorted.map(i => ({ ...i })),
    currentIndex: 0,
    prevEnd,
    removedCount,
    description: `Keep first interval [${sorted[0].start}, ${sorted[0].end}], prevEnd = ${prevEnd}`,
  });
  
  // Process remaining intervals
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    
    steps.push({
      type: 'compare',
      intervals: sorted.map(int => ({ ...int })),
      currentIndex: i,
      prevEnd,
      removedCount,
      description: `Compare [${current.start}, ${current.end}]: does ${current.start} >= ${prevEnd}?`,
    });
    
    if (current.start >= prevEnd) {
      // No overlap, keep it
      current.status = 'kept';
      prevEnd = current.end;
      steps.push({
        type: 'keep',
        intervals: sorted.map(int => ({ ...int })),
        currentIndex: i,
        prevEnd,
        removedCount,
        description: `No overlap! Keep [${current.start}, ${current.end}], update prevEnd = ${prevEnd}`,
      });
    } else {
      // Overlap, remove it
      current.status = 'removed';
      removedCount++;
      steps.push({
        type: 'remove',
        intervals: sorted.map(int => ({ ...int })),
        currentIndex: i,
        prevEnd,
        removedCount,
        description: `Overlap! Remove [${current.start}, ${current.end}] (starts at ${current.start} < prevEnd ${prevEnd})`,
      });
    }
  }
  
  steps.push({
    type: 'done',
    intervals: sorted.map(i => ({ ...i })),
    currentIndex: -1,
    prevEnd,
    removedCount,
    description: `Done! Minimum removals needed: ${removedCount}`,
  });
  
  return steps;
}

export function NonOverlappingIntervalsVisualizer() {
  const [inputValue, setInputValue] = useState('[[1,2],[2,3],[3,4],[1,3]]');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const parsed = parseIntervals(inputValue);
    if (parsed.length > 0) {
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [inputValue]);
  
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
  const intervals = currentStepData?.intervals || [];
  const maxEnd = Math.max(...intervals.map(i => i.end), 10);
  const scale = 550 / maxEnd;
  
  const getIntervalColor = (interval: Interval, index: number) => {
    if (currentStepData?.currentIndex === index) return COLORS.current;
    return COLORS[interval.status];
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Non-overlapping Intervals</h1>
        <p className="text-slate-400">
          Find the minimum number of intervals to remove so the rest don't overlap.
          Greedy approach: sort by end time, keep intervals that end early.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Intervals:</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono text-sm"
          placeholder="[[1,2],[2,3],[3,4],[1,3]]"
        />
      </div>
      
      {/* Timeline Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-400">
            {currentStepData?.type === 'initial' ? 'Original Order' : 'Sorted by End Time'}
          </h3>
          <div className="text-sm">
            <span className="text-slate-400">prevEnd = </span>
            <span className="font-mono text-yellow-400">
              {currentStepData?.prevEnd === -Infinity ? '-∞' : currentStepData?.prevEnd}
            </span>
          </div>
        </div>
        
        <svg viewBox="0 0 700 220" className="w-full h-56">
          {/* Timeline axis */}
          <line x1="40" y1="190" x2="620" y2="190" className="stroke-slate-600" />
          {Array.from({ length: Math.ceil(maxEnd) + 1 }, (_, i) => (
            <g key={i}>
              <line x1={40 + i * scale} y1="185" x2={40 + i * scale} y2="195" className="stroke-slate-600" />
              <text x={40 + i * scale} y="208" textAnchor="middle" className="fill-slate-500 text-xs">{i}</text>
            </g>
          ))}
          
          {/* prevEnd marker */}
          {currentStepData && currentStepData.prevEnd !== -Infinity && (
            <g>
              <line 
                x1={40 + currentStepData.prevEnd * scale} 
                y1="10" 
                x2={40 + currentStepData.prevEnd * scale} 
                y2="180" 
                className="stroke-yellow-500 stroke-2"
                strokeDasharray="4 4"
              />
              <text 
                x={40 + currentStepData.prevEnd * scale} 
                y="8" 
                textAnchor="middle" 
                className="fill-yellow-400 text-xs font-bold"
              >
                prevEnd
              </text>
            </g>
          )}
          
          {/* Intervals */}
          <AnimatePresence>
            {intervals.map((interval, i) => {
              const y = 25 + (i % 6) * 26;
              const isActive = currentStepData?.currentIndex === i;
              const color = getIntervalColor(interval, i);
              
              return (
                <motion.g key={interval.id}>
                  <motion.rect
                    x={40 + interval.start * scale}
                    y={y}
                    width={(interval.end - interval.start) * scale}
                    height={20}
                    rx={4}
                    fill={color}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: interval.status === 'removed' ? 0.4 : 1,
                      strokeWidth: isActive ? 2 : 0,
                    }}
                    style={{ stroke: isActive ? '#fff' : 'none' }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.text
                    x={40 + interval.start * scale + (interval.end - interval.start) * scale / 2}
                    y={y + 14}
                    textAnchor="middle"
                    className="fill-white text-xs font-mono font-bold"
                    animate={{ 
                      opacity: interval.status === 'removed' ? 0.4 : 1,
                    }}
                  >
                    [{interval.start},{interval.end}]
                  </motion.text>
                  
                  {/* X mark for removed */}
                  {interval.status === 'removed' && (
                    <motion.text
                      x={40 + interval.start * scale + (interval.end - interval.start) * scale / 2}
                      y={y + 16}
                      textAnchor="middle"
                      className="fill-red-400 text-lg font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✕
                    </motion.text>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
        
        <div className="flex gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.pending }}></span> Pending
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.kept }}></span> Kept
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.removed }}></span> Removed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.current }}></span> Current
          </span>
        </div>
      </div>
      
      {/* Stats and Status */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Statistics</h3>
          <div className="flex gap-6">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {intervals.filter(i => i.status === 'kept').length}
              </div>
              <div className="text-xs text-slate-500">Kept</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {currentStepData?.removedCount || 0}
              </div>
              <div className="text-xs text-slate-500">Removed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-400">
                {intervals.filter(i => i.status === 'pending').length}
              </div>
              <div className="text-xs text-slate-500">Pending</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Action</h3>
          <p className={`text-sm ${
            currentStepData?.type === 'keep' || currentStepData?.type === 'keep-first' ? 'text-green-400' :
            currentStepData?.type === 'remove' ? 'text-red-400' :
            currentStepData?.type === 'done' ? 'text-purple-400' :
            'text-white'
          }`}>
            {currentStepData?.description || 'Ready'}
          </p>
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
      
      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int eraseOverlapIntervals(int[][] intervals) {
    if (intervals.length == 0) return 0;
    
    // Sort by END time (greedy: keep intervals that end early)
    Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
    
    int removed = 0;
    int prevEnd = intervals[0][1];
    
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= prevEnd) {
            // No overlap - keep this interval
            prevEnd = intervals[i][1];
        } else {
            // Overlap - remove this interval
            removed++;
        }
    }
    
    return removed;
}

// Key insight: Sort by END time, not start time!
// This ensures we always keep the interval that
// "gets out of the way" earliest.`}
        </pre>
      </div>
    </div>
  );
}
