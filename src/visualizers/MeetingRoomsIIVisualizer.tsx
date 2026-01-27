import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Meeting {
  start: number;
  end: number;
  id: number;
  color: string;
  room?: number;
}

interface Step {
  type: 'initial' | 'sort' | 'process' | 'assign-new' | 'reuse' | 'done';
  meetings: Meeting[];
  currentIndex: number;
  heap: number[];  // end times in heap
  rooms: Meeting[][];  // meetings assigned to each room
  description: string;
  maxRooms: number;
}

const COLORS = [
  '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

const ROOM_COLORS = [
  '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ec4899',
  '#14b8a6', '#6366f1', '#eab308', '#ef4444', '#84cc16',
];

function parseMeetings(input: string): Meeting[] {
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

function generateSteps(meetings: Meeting[]): Step[] {
  if (meetings.length === 0) return [];
  
  const steps: Step[] = [];
  
  // Initial state
  steps.push({
    type: 'initial',
    meetings: meetings.map(m => ({ ...m })),
    currentIndex: -1,
    heap: [],
    rooms: [],
    description: 'Initial meetings (unsorted)',
    maxRooms: 0,
  });
  
  // Sort by start time
  const sorted = [...meetings].sort((a, b) => a.start - b.start);
  steps.push({
    type: 'sort',
    meetings: sorted.map(m => ({ ...m })),
    currentIndex: -1,
    heap: [],
    rooms: [],
    description: 'Sort meetings by start time',
    maxRooms: 0,
  });
  
  // Process each meeting
  const heap: number[] = [];  // min-heap of end times
  const rooms: Meeting[][] = [];
  
  for (let i = 0; i < sorted.length; i++) {
    const meeting = { ...sorted[i] };
    
    steps.push({
      type: 'process',
      meetings: sorted.map((m, idx) => ({ ...m, room: idx < i ? sorted[idx].room : undefined })),
      currentIndex: i,
      heap: [...heap],
      rooms: rooms.map(r => [...r]),
      description: `Processing meeting [${meeting.start}, ${meeting.end}]`,
      maxRooms: rooms.length,
    });
    
    // Check if we can reuse a room (earliest ending meeting ends before this starts)
    if (heap.length > 0 && heap[0] <= meeting.start) {
      // Find which room is freeing up
      let roomIndex = -1;
      for (let r = 0; r < rooms.length; r++) {
        const lastMeeting = rooms[r][rooms[r].length - 1];
        if (lastMeeting.end === heap[0]) {
          roomIndex = r;
          break;
        }
      }
      
      // Remove the minimum from heap
      heap.shift();
      heap.sort((a, b) => a - b);
      
      meeting.room = roomIndex;
      sorted[i].room = roomIndex;
      rooms[roomIndex].push(meeting);
      heap.push(meeting.end);
      heap.sort((a, b) => a - b);
      
      steps.push({
        type: 'reuse',
        meetings: sorted.map(m => ({ ...m })),
        currentIndex: i,
        heap: [...heap],
        rooms: rooms.map(r => [...r]),
        description: `Reuse room ${roomIndex + 1} (previous meeting ended at ${meeting.start} or earlier)`,
        maxRooms: rooms.length,
      });
    } else {
      // Need a new room
      const roomIndex = rooms.length;
      meeting.room = roomIndex;
      sorted[i].room = roomIndex;
      rooms.push([meeting]);
      heap.push(meeting.end);
      heap.sort((a, b) => a - b);
      
      steps.push({
        type: 'assign-new',
        meetings: sorted.map(m => ({ ...m })),
        currentIndex: i,
        heap: [...heap],
        rooms: rooms.map(r => [...r]),
        description: `Need new room! Assign to room ${roomIndex + 1}`,
        maxRooms: rooms.length,
      });
    }
  }
  
  steps.push({
    type: 'done',
    meetings: sorted.map(m => ({ ...m })),
    currentIndex: -1,
    heap: [...heap],
    rooms: rooms.map(r => [...r]),
    description: `Done! Minimum rooms needed: ${rooms.length}`,
    maxRooms: rooms.length,
  });
  
  return steps;
}

export function MeetingRoomsIIVisualizer() {
  const [inputValue, setInputValue] = useState('[[0,30],[5,10],[15,20]]');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  useEffect(() => {
    const parsed = parseMeetings(inputValue);
    if (parsed.length > 0) {
      setMeetings(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, []);
  
  const handleInputChange = useCallback(() => {
    const parsed = parseMeetings(inputValue);
    if (parsed.length > 0 && parsed.length <= 10) {
      setMeetings(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [inputValue]);
  
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
  const maxEnd = Math.max(...meetings.map(m => m.end), 30);
  const scale = 600 / maxEnd;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Meeting Rooms II</h1>
        <p className="text-slate-400">
          Find the minimum number of conference rooms required. Uses a min-heap 
          to track the earliest ending meeting.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Meetings:</label>
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
      
      {/* Timeline View */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Timeline</h3>
        
        <svg viewBox="0 0 700 180" className="w-full h-44">
          {/* Timeline axis */}
          <line x1="40" y1="150" x2="660" y2="150" className="stroke-slate-600" />
          {Array.from({ length: Math.ceil(maxEnd / 5) + 1 }, (_, i) => i * 5).map(t => (
            <g key={t}>
              <line x1={40 + t * scale} y1="145" x2={40 + t * scale} y2="155" className="stroke-slate-600" />
              <text x={40 + t * scale} y="168" textAnchor="middle" className="fill-slate-500 text-xs">
                {t}
              </text>
            </g>
          ))}
          
          {/* Meetings */}
          <AnimatePresence>
            {currentStepData?.meetings.map((meeting, i) => {
              const isCurrentIndex = currentStepData.currentIndex === i;
              const y = 20 + (i % 5) * 24;
              
              return (
                <motion.g key={meeting.id}>
                  <motion.rect
                    x={40 + meeting.start * scale}
                    y={y}
                    width={(meeting.end - meeting.start) * scale}
                    height={18}
                    rx={3}
                    fill={meeting.room !== undefined ? ROOM_COLORS[meeting.room % ROOM_COLORS.length] : meeting.color}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ 
                      opacity: isCurrentIndex ? 1 : 0.7,
                      scaleX: 1,
                      strokeWidth: isCurrentIndex ? 2 : 0,
                    }}
                    style={{ 
                      originX: 0,
                      stroke: isCurrentIndex ? '#fff' : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.text
                    x={40 + meeting.start * scale + (meeting.end - meeting.start) * scale / 2}
                    y={y + 13}
                    textAnchor="middle"
                    className="fill-white text-xs font-mono font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    [{meeting.start},{meeting.end}]
                  </motion.text>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Room Assignments */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Room Assignments</h3>
          <div className="space-y-2">
            {currentStepData?.rooms.length === 0 ? (
              <p className="text-slate-500 text-sm">No rooms assigned yet</p>
            ) : (
              currentStepData?.rooms.map((room, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: ROOM_COLORS[i % ROOM_COLORS.length] }}
                  />
                  <span className="text-sm font-medium">Room {i + 1}:</span>
                  <div className="flex gap-1 flex-wrap">
                    {room.map((m, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 bg-slate-700 rounded font-mono">
                        [{m.start},{m.end}]
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Min Heap */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Min Heap (End Times)</h3>
          <div className="flex gap-2 flex-wrap">
            {currentStepData?.heap.length === 0 ? (
              <p className="text-slate-500 text-sm">Empty</p>
            ) : (
              currentStepData?.heap.map((endTime, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-3 py-1 rounded font-mono text-sm ${
                    i === 0 ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500' : 'bg-slate-700'
                  }`}
                >
                  {endTime}
                </motion.span>
              ))
            )}
          </div>
          {currentStepData?.heap.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              Min = {currentStepData.heap[0]} (earliest room to free up)
            </p>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded text-sm font-bold ${
            currentStepData?.type === 'assign-new' ? 'bg-red-500/30 text-red-300' :
            currentStepData?.type === 'reuse' ? 'bg-green-500/30 text-green-300' :
            currentStepData?.type === 'done' ? 'bg-purple-500/30 text-purple-300' :
            'bg-slate-700'
          }`}>
            Rooms: {currentStepData?.maxRooms || 0}
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
{`public int minMeetingRooms(int[][] intervals) {
    if (intervals.length == 0) return 0;
    
    // Sort by start time
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    
    // Min heap to track end times of meetings in progress
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    
    for (int[] interval : intervals) {
        // If earliest ending meeting ends before this one starts,
        // we can reuse that room
        if (!heap.isEmpty() && heap.peek() <= interval[0]) {
            heap.poll();  // Remove the finished meeting
        }
        
        // Add current meeting's end time
        heap.offer(interval[1]);
    }
    
    // Heap size = number of overlapping meetings = rooms needed
    return heap.size();
}`}
        </pre>
      </div>
    </div>
  );
}
