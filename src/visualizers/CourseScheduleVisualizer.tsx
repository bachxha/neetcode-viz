import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Course {
  id: number;
  label: string;
  x: number;
  y: number;
  state: 'unvisited' | 'visiting' | 'visited' | 'cycle';
}

interface Prerequisite {
  from: number;
  to: number;
}

interface Step {
  type: 'start' | 'visit' | 'backtrack' | 'cycle_detected' | 'done';
  currentCourse: number | null;
  recursionStack: number[];
  courseStates: Map<number, 'unvisited' | 'visiting' | 'visited' | 'cycle'>;
  description: string;
  canComplete?: boolean;
}

interface Example {
  name: string;
  courses: Course[];
  prerequisites: Prerequisite[];
  description: string;
}

const examples: Example[] = [
  {
    name: "Completable Schedule",
    description: "A valid course schedule with no cycles",
    courses: [
      { id: 0, label: "Math 101", x: 50, y: 100, state: 'unvisited' },
      { id: 1, label: "CS 101", x: 200, y: 50, state: 'unvisited' },
      { id: 2, label: "CS 201", x: 200, y: 150, state: 'unvisited' },
      { id: 3, label: "Stats 101", x: 350, y: 100, state: 'unvisited' },
    ],
    prerequisites: [
      { from: 0, to: 1 }, // Math 101 → CS 101
      { from: 1, to: 2 }, // CS 101 → CS 201
      { from: 0, to: 3 }, // Math 101 → Stats 101
    ]
  },
  {
    name: "Impossible Schedule",
    description: "An invalid course schedule with a cycle",
    courses: [
      { id: 0, label: "Course A", x: 100, y: 50, state: 'unvisited' },
      { id: 1, label: "Course B", x: 250, y: 50, state: 'unvisited' },
      { id: 2, label: "Course C", x: 250, y: 150, state: 'unvisited' },
      { id: 3, label: "Course D", x: 100, y: 150, state: 'unvisited' },
    ],
    prerequisites: [
      { from: 0, to: 1 }, // A → B
      { from: 1, to: 2 }, // B → C
      { from: 2, to: 3 }, // C → D
      { from: 3, to: 0 }, // D → A (creates cycle!)
    ]
  }
];

function generateSteps(courses: Course[], prerequisites: Prerequisite[]): Step[] {
  const steps: Step[] = [];
  const adjList = new Map<number, number[]>();
  const states = new Map<number, 'unvisited' | 'visiting' | 'visited' | 'cycle'>();
  const recursionStack: number[] = [];
  
  // Initialize adjacency list and states
  courses.forEach(course => {
    adjList.set(course.id, []);
    states.set(course.id, 'unvisited');
  });
  
  prerequisites.forEach(prereq => {
    const neighbors = adjList.get(prereq.from) || [];
    neighbors.push(prereq.to);
    adjList.set(prereq.from, neighbors);
  });

  let hasCycle = false;

  steps.push({
    type: 'start',
    currentCourse: null,
    recursionStack: [],
    courseStates: new Map(states),
    description: 'Starting DFS cycle detection. We\'ll use three states: unvisited (gray), visiting (yellow), visited (green).'
  });

  function dfs(courseId: number): boolean {
    if (states.get(courseId) === 'visiting') {
      // Found a back edge - cycle detected!
      states.set(courseId, 'cycle');
      steps.push({
        type: 'cycle_detected',
        currentCourse: courseId,
        recursionStack: [...recursionStack],
        courseStates: new Map(states),
        description: `Cycle detected! Course ${courseId} is already in our current path (visiting state). This creates a circular dependency.`
      });
      return true; // Cycle found
    }

    if (states.get(courseId) === 'visited') {
      return false; // Already processed
    }

    // Mark as visiting and add to recursion stack
    states.set(courseId, 'visiting');
    recursionStack.push(courseId);
    steps.push({
      type: 'visit',
      currentCourse: courseId,
      recursionStack: [...recursionStack],
      courseStates: new Map(states),
      description: `Visiting course ${courseId}. Mark as 'visiting' and add to recursion stack to track current DFS path.`
    });

    // Check all prerequisites
    const neighbors = adjList.get(courseId) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) {
        hasCycle = true;
        return true;
      }
    }

    // Mark as visited and remove from recursion stack
    states.set(courseId, 'visited');
    recursionStack.pop();
    steps.push({
      type: 'backtrack',
      currentCourse: courseId,
      recursionStack: [...recursionStack],
      courseStates: new Map(states),
      description: `Finished exploring course ${courseId}. Mark as 'visited' and remove from recursion stack.`
    });

    return false;
  }

  // Try DFS from each unvisited course
  for (const course of courses) {
    if (states.get(course.id) === 'unvisited') {
      if (dfs(course.id)) {
        hasCycle = true;
        break;
      }
    }
  }

  steps.push({
    type: 'done',
    currentCourse: null,
    recursionStack: [],
    courseStates: new Map(states),
    canComplete: !hasCycle,
    description: hasCycle 
      ? 'Cycle detected! These courses cannot be completed due to circular dependencies.'
      : 'No cycle found! All courses can be completed in a valid order.'
  });

  return steps;
}

function CourseGraph({ 
  courses, 
  prerequisites, 
  courseStates, 
  currentCourse, 
  recursionStack 
}: {
  courses: Course[];
  prerequisites: Prerequisite[];
  courseStates: Map<number, 'unvisited' | 'visiting' | 'visited' | 'cycle'>;
  currentCourse: number | null;
  recursionStack: number[];
}) {
  const getNodeColor = (courseId: number) => {
    const state = courseStates.get(courseId);
    switch (state) {
      case 'visiting': return 'bg-yellow-500';
      case 'visited': return 'bg-green-500';
      case 'cycle': return 'bg-red-500';
      default: return 'bg-slate-600';
    }
  };

  const getNodeBorder = (courseId: number) => {
    if (currentCourse === courseId) return 'ring-4 ring-blue-400';
    if (recursionStack.includes(courseId)) return 'ring-2 ring-yellow-300';
    return '';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-slate-400 mb-4">Course Dependency Graph</h3>
      <div className="relative">
        <svg width="400" height="200" className="mx-auto">
          {/* Edges (prerequisites) */}
          {prerequisites.map((prereq, i) => {
            const fromCourse = courses.find(c => c.id === prereq.from)!;
            const toCourse = courses.find(c => c.id === prereq.to)!;
            
            // Calculate arrow position
            const dx = toCourse.x - fromCourse.x;
            const dy = toCourse.y - fromCourse.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const unitX = dx / length;
            const unitY = dy / length;
            
            const startX = fromCourse.x + unitX * 30;
            const startY = fromCourse.y + unitY * 30;
            const endX = toCourse.x - unitX * 30;
            const endY = toCourse.y - unitY * 30;
            
            return (
              <g key={i}>
                <motion.line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#64748b"
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              </g>
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
          </defs>
          
          {/* Course nodes */}
          {courses.map((course) => (
            <motion.g key={course.id}>
              <motion.circle
                cx={course.x}
                cy={course.y}
                r={25}
                className={`${getNodeColor(course.id)} ${getNodeBorder(course.id)} stroke-white stroke-2`}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: currentCourse === course.id ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={course.x}
                y={course.y + 5}
                textAnchor="middle"
                className="text-white font-bold text-xs fill-current pointer-events-none"
              >
                {course.id}
              </text>
              <text
                x={course.x}
                y={course.y + 45}
                textAnchor="middle"
                className="text-slate-300 text-xs fill-current pointer-events-none"
              >
                {course.label}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function RecursionStackDisplay({ recursionStack, courses }: { recursionStack: number[]; courses: Course[] }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">
        DFS Recursion Stack <span className="text-slate-500">(current path)</span>
      </h3>
      <div className="space-y-1 min-h-[80px]">
        {recursionStack.length === 0 && (
          <span className="text-slate-500 italic">Empty stack</span>
        )}
        {recursionStack.map((courseId, index) => {
          const course = courses.find(c => c.id === courseId);
          return (
            <motion.div
              key={`${courseId}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-2 rounded bg-yellow-500/20 border border-yellow-500/30"
            >
              <span className="text-yellow-400 font-mono text-sm">
                {index === recursionStack.length - 1 ? '→' : ' '}
              </span>
              <span className="px-2 py-1 rounded bg-yellow-500/30 text-yellow-300 font-mono text-sm">
                {courseId}
              </span>
              <span className="text-slate-300 text-sm">{course?.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StateDisplay({ courseStates }: { courseStates: Map<number, 'unvisited' | 'visiting' | 'visited' | 'cycle'> }) {
  const stateCounts = {
    unvisited: 0,
    visiting: 0,
    visited: 0,
    cycle: 0,
  };

  courseStates.forEach(state => {
    stateCounts[state]++;
  });

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">Node States</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-slate-600"></div>
          <span>Unvisited: {stateCounts.unvisited}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Visiting: {stateCounts.visiting}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Visited: {stateCounts.visited}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Cycle: {stateCounts.cycle}</span>
        </div>
      </div>
    </div>
  );
}

export function CourseScheduleVisualizer() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const example = examples[selectedExample];
    const newSteps = generateSteps(example.courses, example.prerequisites);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [selectedExample]);

  useEffect(() => {
    initializeSteps();
  }, [initializeSteps]);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];
  const currentExample = examples[selectedExample];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Course Schedule</h1>
        <p className="text-slate-400">
          Detect cycles in course prerequisites using DFS with three states: unvisited, visiting (in current path), and visited.
          A cycle indicates circular dependencies, making course completion impossible.
        </p>
      </div>

      {/* Example Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Choose Example</h3>
        <div className="flex gap-3">
          {examples.map((example, i) => (
            <button
              key={i}
              onClick={() => setSelectedExample(i)}
              className={`p-3 rounded-lg border transition-all ${
                selectedExample === i
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-medium text-sm">{example.name}</div>
              <div className="text-xs text-slate-400 mt-1">{example.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CourseGraph
            courses={currentExample.courses}
            prerequisites={currentExample.prerequisites}
            courseStates={step?.courseStates || new Map()}
            currentCourse={step?.currentCourse || null}
            recursionStack={step?.recursionStack || []}
          />
        </div>
        
        <div className="space-y-4">
          <RecursionStackDisplay
            recursionStack={step?.recursionStack || []}
            courses={currentExample.courses}
          />
          <StateDisplay courseStates={step?.courseStates || new Map()} />
        </div>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? (step?.canComplete ? 'bg-green-500' : 'bg-red-500') :
            step?.type === 'visit' ? 'bg-blue-500' :
            step?.type === 'cycle_detected' ? 'bg-red-500' :
            step?.type === 'backtrack' ? 'bg-purple-500' :
            'bg-slate-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready to start'}</span>
        </div>
        {step?.canComplete !== undefined && (
          <div className={`mt-2 p-3 rounded-lg ${
            step.canComplete ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <strong>{step.canComplete ? '✓ Can Complete' : '✗ Cannot Complete'}</strong> - 
            {step.canComplete ? ' All courses can be taken in a valid order.' : ' Circular dependencies prevent completion.'}
          </div>
        )}
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

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6 mt-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
            <span>Unvisited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Visiting (in path)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Visited (done)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Cycle detected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-blue-400"></div>
            <span>Currently exploring</span>
          </div>
        </div>
      </div>

      {/* Java Code */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code (DFS Cycle Detection)</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public boolean canFinish(int numCourses, int[][] prerequisites) {
    // Build adjacency list
    List<List<Integer>> adjList = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) {
        adjList.add(new ArrayList<>());
    }
    
    for (int[] prereq : prerequisites) {
        adjList.get(prereq[0]).add(prereq[1]);
    }
    
    // 0 = unvisited, 1 = visiting, 2 = visited
    int[] state = new int[numCourses];
    
    for (int i = 0; i < numCourses; i++) {
        if (hasCycle(i, adjList, state)) {
            return false; // Cycle detected
        }
    }
    
    return true; // No cycles found
}

private boolean hasCycle(int course, List<List<Integer>> adjList, int[] state) {
    if (state[course] == 1) return true;  // Back edge - cycle!
    if (state[course] == 2) return false; // Already processed
    
    state[course] = 1; // Mark as visiting
    
    for (int neighbor : adjList.get(course)) {
        if (hasCycle(neighbor, adjList, state)) {
            return true;
        }
    }
    
    state[course] = 2; // Mark as visited
    return false;
}

// Time: O(V + E) where V = courses, E = prerequisites
// Space: O(V + E) for adjacency list and recursion stack`}
        </pre>
      </div>

      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Key Insights</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>Three-State DFS:</strong> Unvisited (0), Visiting (1), Visited (2). The "visiting" state tracks the current DFS path.</p>
          <p><strong>Cycle Detection:</strong> A back edge occurs when we encounter a node in "visiting" state - this means we've found a cycle.</p>
          <p><strong>Recursion Stack:</strong> Implicitly maintained by the call stack, explicitly shown here to visualize the current path.</p>
          <p><strong>Why DFS Works:</strong> DFS explores each path completely, making it perfect for detecting cycles in directed graphs.</p>
          <p><strong>Alternative:</strong> Kahn's algorithm (topological sort) can also solve this using BFS and in-degree counting.</p>
        </div>
      </div>
    </div>
  );
}