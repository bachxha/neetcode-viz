import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Interval {
  start: number;
  end: number;
  id: number;
  color: string;
  type: 'original' | 'new' | 'merged';
}

interface Step {
  type: 'initial' | 'add-before' | 'check-overlap' | 'merge' | 'add-merged' | 'add-after' | 'done';
  intervals: Interval[];
  newInterval: Interval;
  result: Interval[];
  currentIndex: number;
  description: string;
  phase: 'before' | 'overlap' | 'after';
}

const COLORS = {
  original: '#3b82f6',
  new: '#eab308',
  merged: '#22c55e',
  before: '#6366f1',
  after: '#a855f7',
};

function parseInput(intervalsStr: string, newIntervalStr: string): { intervals: Interval[], newInterval: Interval } | null {
  try {
    const intervals = JSON.parse(intervalsStr).map((arr: number[], i: number) => ({
      start: arr[0],
      end: arr[1],
      id: i,
      color: COLORS.original,
      type: 'original' as const,
    }));
    const newArr = JSON.parse(newIntervalStr);
    const newInterval: Interval = {
      start: newArr[0],
      end: newArr[1],
      id: 999,
      color: COLORS.new,
      type: 'new' as const,
    };
    return { intervals, newInterval };
  } catch {
    return null;
  }
}

function generateSteps(intervals: Interval[], newInterval: Interval): Step[] {
  const steps: Step[] = [];
  const result: Interval[] = [];
  let mergedInterval = { ...newInterval };
  let i = 0;
  
  // Initial state
  steps.push({
    type: 'initial',
    intervals: [...intervals],
    newInterval: { ...newInterval },
    result: [],
    currentIndex: -1,
    description: `Insert [${newInterval.start}, ${newInterval.end}] into the interval list`,
    phase: 'before',
  });
  
  // Phase 1: Add all intervals that come before newInterval
  while (i < intervals.length && intervals[i].end < newInterval.start) {
    steps.push({
      type: 'add-before',
      intervals: [...intervals],
      newInterval: { ...newInterval },
      result: [...result, { ...intervals[i], color: COLORS.before }],
      currentIndex: i,
      description: `[${intervals[i].start}, ${intervals[i].end}] ends before new interval starts → add to result`,
      phase: 'before',
    });
    result.push({ ...intervals[i], color: COLORS.before });
    i++;
  }
  
  // Phase 2: Merge overlapping intervals
  while (i < intervals.length && intervals[i].start <= newInterval.end) {
    steps.push({
      type: 'check-overlap',
      intervals: [...intervals],
      newInterval: { ...mergedInterval },
      result: [...result],
      currentIndex: i,
      description: `[${intervals[i].start}, ${intervals[i].end}] overlaps with [${mergedInterval.start}, ${mergedInterval.end}]`,
      phase: 'overlap',
    });
    
    mergedInterval = {
      ...mergedInterval,
      start: Math.min(mergedInterval.start, intervals[i].start),
      end: Math.max(mergedInterval.end, intervals[i].end),
      color: COLORS.merged,
      type: 'merged',
    };
    
    steps.push({
      type: 'merge',
      intervals: [...intervals],
      newInterval: { ...mergedInterval },
      result: [...result],
      currentIndex: i,
      description: `Merge → [${mergedInterval.start}, ${mergedInterval.end}]`,
      phase: 'overlap',
    });
    
    i++;
  }
  
  // Add merged interval
  steps.push({
    type: 'add-merged',
    intervals: [...intervals],
    newInterval: { ...mergedInterval },
    result: [...result, { ...mergedInterval }],
    currentIndex: -1,
    description: `Add merged interval [${mergedInterval.start}, ${mergedInterval.end}] to result`,
    phase: 'overlap',
  });
  result.push({ ...mergedInterval, color: COLORS.merged, type: 'merged' });
  
  // Phase 3: Add remaining intervals
  while (i < intervals.length) {
    steps.push({
      type: 'add-after',
      intervals: [...intervals],
      newInterval: { ...mergedInterval },
      result: [...result, { ...intervals[i], color: COLORS.after }],
      currentIndex: i,
      description: `[${intervals[i].start}, ${intervals[i].end}] comes after → add to result`,
      phase: 'after',
    });
    result.push({ ...intervals[i], color: COLORS.after });
    i++;
  }
  
  steps.push({
    type: 'done',
    intervals: [...intervals],
    newInterval: { ...mergedInterval },
    result: [...result],
    currentIndex: -1,
    description: `Done! Result has ${result.length} interval${result.length !== 1 ? 's' : ''}`,
    phase: 'after',
  });
  
  return steps;
}

export function InsertIntervalVisualizer() {
  const [intervalsInput, setIntervalsInput] = useState('[[1,3],[6,9]]');
  const [newIntervalInput, setNewIntervalInput] = useState('[2,5]');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const parsed = parseInput(intervalsInput, newIntervalInput);
    if (parsed) {
      const newSteps = generateSteps(parsed.intervals, parsed.newInterval);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [intervalsInput, newIntervalInput]);
  
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
  const allIntervals = currentStepData ? [...currentStepData.intervals, currentStepData.newInterval] : [];
  const maxEnd = Math.max(...allIntervals.map(i => i.end), 15);
  const scale = 600 / maxEnd;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Insert Interval</h1>
        <p className="text-slate-400">
          Insert a new interval into a sorted list of non-overlapping intervals, 
          merging if necessary.
        </p>
      </div>
      
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-1">Intervals (sorted):</label>
          <input
            type="text"
            value={intervalsInput}
            onChange={(e) => setIntervalsInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-1">New interval:</label>
          <input
            type="text"
            value={newIntervalInput}
            onChange={(e) => setNewIntervalInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-yellow-500 outline-none font-mono text-sm"
          />
        </div>
      </div>
      
      {/* Original intervals + new interval */}
      <div className="bg-slate-800 rounded-lg p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Input</h3>
        <svg viewBox="0 0 700 100" className="w-full h-24">
          <line x1="40" y1="70" x2="660" y2="70" className="stroke-slate-600" />
          {Array.from({ length: Math.ceil(maxEnd) + 1 }, (_, i) => (
            <g key={i}>
              <line x1={40 + i * scale} y1="65" x2={40 + i * scale} y2="75" className="stroke-slate-600" />
              <text x={40 + i * scale} y="88" textAnchor="middle" className="fill-slate-500 text-xs">{i}</text>
            </g>
          ))}
          
          {/* Original intervals */}
          {currentStepData?.intervals.map((interval, i) => {
            const isActive = currentStepData.currentIndex === i;
            return (
              <motion.g key={interval.id}>
                <motion.rect
                  x={40 + interval.start * scale}
                  y={15}
                  width={(interval.end - interval.start) * scale}
                  height={24}
                  rx={4}
                  fill={COLORS.original}
                  animate={{ 
                    opacity: isActive ? 1 : 0.6,
                    strokeWidth: isActive ? 2 : 0,
                  }}
                  style={{ stroke: isActive ? '#fff' : 'none' }}
                />
                <text
                  x={40 + interval.start * scale + (interval.end - interval.start) * scale / 2}
                  y={31}
                  textAnchor="middle"
                  className="fill-white text-xs font-mono font-bold"
                >
                  [{interval.start},{interval.end}]
                </text>
              </motion.g>
            );
          })}
          
          {/* New interval */}
          {currentStepData && (
            <motion.g>
              <motion.rect
                x={40 + currentStepData.newInterval.start * scale}
                y={42}
                width={(currentStepData.newInterval.end - currentStepData.newInterval.start) * scale}
                height={24}
                rx={4}
                fill={currentStepData.newInterval.type === 'merged' ? COLORS.merged : COLORS.new}
                animate={{ 
                  x: 40 + currentStepData.newInterval.start * scale,
                  width: (currentStepData.newInterval.end - currentStepData.newInterval.start) * scale,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.text
                x={40 + currentStepData.newInterval.start * scale + (currentStepData.newInterval.end - currentStepData.newInterval.start) * scale / 2}
                y={58}
                textAnchor="middle"
                className="fill-white text-xs font-mono font-bold"
                animate={{
                  x: 40 + currentStepData.newInterval.start * scale + (currentStepData.newInterval.end - currentStepData.newInterval.start) * scale / 2,
                }}
              >
                [{currentStepData.newInterval.start},{currentStepData.newInterval.end}]
              </motion.text>
            </motion.g>
          )}
        </svg>
        
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.original }}></span> Original
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.new }}></span> New interval
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.merged }}></span> Merged
          </span>
        </div>
      </div>
      
      {/* Result */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Result</h3>
        <svg viewBox="0 0 700 80" className="w-full h-20">
          <line x1="40" y1="55" x2="660" y2="55" className="stroke-slate-600" />
          
          <AnimatePresence>
            {currentStepData?.result.map((interval, i) => (
              <motion.g key={`result-${i}`}>
                <motion.rect
                  x={40 + interval.start * scale}
                  y={15}
                  width={(interval.end - interval.start) * scale}
                  height={28}
                  rx={4}
                  fill={interval.color}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  style={{ originX: 0 }}
                />
                <motion.text
                  x={40 + interval.start * scale + (interval.end - interval.start) * scale / 2}
                  y={34}
                  textAnchor="middle"
                  className="fill-white text-sm font-mono font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  [{interval.start},{interval.end}]
                </motion.text>
              </motion.g>
            ))}
          </AnimatePresence>
          
          {currentStepData?.result.length === 0 && (
            <text x="350" y="35" textAnchor="middle" className="fill-slate-500">Building result...</text>
          )}
        </svg>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            currentStepData?.phase === 'before' ? 'bg-indigo-500/30 text-indigo-300' :
            currentStepData?.phase === 'overlap' ? 'bg-green-500/30 text-green-300' :
            'bg-purple-500/30 text-purple-300'
          }`}>
            {currentStepData?.phase === 'before' ? 'Phase 1: Before' :
             currentStepData?.phase === 'overlap' ? 'Phase 2: Overlap' : 'Phase 3: After'}
          </span>
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
      
      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> result = new ArrayList<>();
    int i = 0;
    int n = intervals.length;
    
    // Phase 1: Add all intervals that come before newInterval
    while (i < n && intervals[i][1] < newInterval[0]) {
        result.add(intervals[i]);
        i++;
    }
    
    // Phase 2: Merge overlapping intervals
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.add(newInterval);
    
    // Phase 3: Add remaining intervals
    while (i < n) {
        result.add(intervals[i]);
        i++;
    }
    
    return result.toArray(new int[result.size()][]);
}`}
        </pre>
      </div>
    </div>
  );
}
