import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Interval {
  start: number;
  end: number;
  id: number;
  color: string;
}

interface Step {
  type: 'initial' | 'sort' | 'compare' | 'overlap' | 'no-overlap' | 'done';
  intervals: Interval[];
  currentIndex: number;
  compareIndex: number | null;
  description: string;
  result: boolean | null;
  overlapping: boolean;
}

const COLORS = [
  '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

function parseIntervals(input: string): Interval[] {
  try {
    const parsed = JSON.parse(input);
    return parsed.map((arr: number[], i: number) => ({
      start: arr[0],
      end: arr[1],
      id: i,
      color: COLORS[i % COLORS.length],
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
    intervals: [...intervals],
    currentIndex: -1,
    compareIndex: null,
    description: 'Check if a person can attend all meetings (no overlapping intervals)',
    result: null,
    overlapping: false,
  });
  
  // Sort by start time
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  if (JSON.stringify(sorted) !== JSON.stringify(intervals)) {
    steps.push({
      type: 'sort',
      intervals: sorted,
      currentIndex: -1,
      compareIndex: null,
      description: 'Sort intervals by start time for easier comparison',
      result: null,
      overlapping: false,
    });
  }
  
  // Compare consecutive intervals
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = sorted[i - 1];
    
    steps.push({
      type: 'compare',
      intervals: sorted,
      currentIndex: i,
      compareIndex: i - 1,
      description: `Compare meeting [${current.start}, ${current.end}] with previous [${prev.start}, ${prev.end}]`,
      result: null,
      overlapping: false,
    });
    
    if (current.start < prev.end) {
      // Overlap found
      steps.push({
        type: 'overlap',
        intervals: sorted,
        currentIndex: i,
        compareIndex: i - 1,
        description: `Overlap detected! Meeting ${current.start} starts before meeting ${prev.end} ends → return false`,
        result: false,
        overlapping: true,
      });
      return steps;
    } else {
      // No overlap
      steps.push({
        type: 'no-overlap',
        intervals: sorted,
        currentIndex: i,
        compareIndex: i - 1,
        description: `No overlap: ${current.start} ≥ ${prev.end} ✓ Continue checking...`,
        result: null,
        overlapping: false,
      });
    }
  }
  
  // All meetings can be attended
  steps.push({
    type: 'done',
    intervals: sorted,
    currentIndex: -1,
    compareIndex: null,
    description: 'No overlaps found! All meetings can be attended → return true',
    result: true,
    overlapping: false,
  });
  
  return steps;
}

const PRESETS = [
  { label: '[[0,30],[5,10],[15,20]]', value: '[[0,30],[5,10],[15,20]]' },
  { label: '[[7,10],[2,4]]', value: '[[7,10],[2,4]]' },
  { label: '[[9,10],[4,9],[4,17]]', value: '[[9,10],[4,9],[4,17]]' },
  { label: '[[1,3],[4,6],[8,10]]', value: '[[1,3],[4,6],[8,10]]' },
];

export function MeetingRoomsVisualizer() {
  const [inputValue, setInputValue] = useState('[[0,30],[5,10],[15,20]]');
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  useEffect(() => {
    const parsed = parseIntervals(inputValue);
    if (parsed.length > 0) {
      setIntervals(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, []);
  
  const handleInputChange = useCallback(() => {
    const parsed = parseIntervals(inputValue);
    if (parsed.length > 0 && parsed.length <= 10) {
      setIntervals(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [inputValue]);
  
  const handlePreset = (preset: string) => {
    setInputValue(preset);
    const parsed = parseIntervals(preset);
    if (parsed.length > 0) {
      setIntervals(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };
  
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
  const maxEnd = Math.max(...intervals.map(i => i.end), 20);
  const scale = 700 / maxEnd;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Meeting Rooms</h1>
        <p className="text-slate-400">
          Determine if a person can attend all meetings. No two meetings should overlap.
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => handlePreset(p.value)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Input intervals:</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleInputChange()}
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none flex-1 font-mono text-sm"
          placeholder="[[0,30],[5,10],[15,20]]"
        />
      </div>
      
      {/* Timeline Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          Meeting Schedule
          {currentStepData?.result !== null && (
            <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${
              currentStepData.result ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {currentStepData.result ? 'CAN ATTEND ALL' : 'CANNOT ATTEND ALL'}
            </span>
          )}
        </h3>
        
        <svg viewBox="0 0 800 200" className="w-full h-48">
          {/* Timeline axis */}
          <line x1="40" y1="150" x2="760" y2="150" className="stroke-slate-600" />
          {Array.from({ length: maxEnd + 1 }, (_, i) => (
            <g key={i}>
              <line x1={40 + i * scale} y1="145" x2={40 + i * scale} y2="155" className="stroke-slate-600" />
              <text x={40 + i * scale} y="170" textAnchor="middle" className="fill-slate-500 text-xs">
                {i}
              </text>
            </g>
          ))}
          
          {/* Intervals */}
          <AnimatePresence>
            {currentStepData?.intervals.map((interval, i) => {
              const isCurrent = currentStepData.currentIndex === i;
              const isComparing = currentStepData.compareIndex === i;
              const isOverlapping = currentStepData.overlapping && (isCurrent || isComparing);
              const y = 30 + (i % 4) * 28;
              
              return (
                <motion.g key={interval.id}>
                  <motion.rect
                    x={40 + interval.start * scale}
                    y={y}
                    width={(interval.end - interval.start) * scale}
                    height={20}
                    rx={4}
                    fill={isOverlapping ? '#ef4444' : interval.color}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ 
                      opacity: (isCurrent || isComparing) ? 1 : 0.7,
                      scaleX: 1,
                      strokeWidth: (isCurrent || isComparing) ? 3 : 0,
                    }}
                    style={{ 
                      originX: 0,
                      stroke: (isCurrent || isComparing) ? '#fff' : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.text
                    x={40 + interval.start * scale + (interval.end - interval.start) * scale / 2}
                    y={y + 14}
                    textAnchor="middle"
                    className="fill-white text-xs font-mono font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    [{interval.start},{interval.end}]
                  </motion.text>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Algorithm Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Key idea:</strong> Sort intervals by start time, then check consecutive pairs. 
          If any interval starts before the previous one ends → overlap! This greedy approach 
          works because sorting ensures we always check in chronological order.
        </p>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'overlap' ? 'bg-red-500' :
            currentStepData?.type === 'done' && currentStepData?.result ? 'bg-green-500' :
            currentStepData?.type === 'compare' ? 'bg-yellow-500' :
            currentStepData?.type === 'no-overlap' ? 'bg-green-500' :
            'bg-blue-500'
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
      
      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public boolean canAttendMeetings(int[][] intervals) {
    if (intervals.length <= 1) return true;
    
    // Sort by start time
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    
    // Check consecutive intervals for overlap
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < intervals[i-1][1]) {
            return false;  // Overlap found!
        }
    }
    
    return true;  // No overlaps
}
// Time: O(n log n)  |  Space: O(1)`}
        </pre>
      </div>
    </div>
  );
}