import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface WordNode {
  word: string;
  x: number;
  y: number;
  visited: boolean;
  inQueue: boolean;
  distance: number;
  parent: string | null;
  isPath: boolean;
}

interface Edge {
  from: string;
  to: string;
  discovered: boolean;
}

interface Step {
  type: 'start' | 'dequeue' | 'explore' | 'found' | 'add_to_queue' | 'done' | 'no_path';
  currentWord: string | null;
  queue: string[];
  visited: Set<string>;
  distances: Map<string, number>;
  parents: Map<string, string>;
  newlyDiscovered: string[];
  finalPath: string[];
  description: string;
  transformations?: string[];
}

interface Example {
  name: string;
  beginWord: string;
  endWord: string;
  wordList: string[];
  description: string;
}

const examples: Example[] = [
  {
    name: "Basic Transformation",
    description: "Transform 'hit' to 'cog' through valid English words",
    beginWord: "hit",
    endWord: "cog",
    wordList: ["hot", "dot", "dog", "lot", "log", "cog"]
  },
  {
    name: "Longer Path",
    description: "Transform 'cat' to 'dog' with multiple possible paths",
    beginWord: "cat",
    endWord: "dog",
    wordList: ["bat", "bet", "bot", "bag", "big", "bog", "cog", "dig", "dot", "dog"]
  },
  {
    name: "No Solution",
    description: "Impossible transformation - endWord not in wordList",
    beginWord: "hit",
    endWord: "cog",
    wordList: ["hot", "dot", "dog", "lot", "log"]
  }
];

function canTransform(word1: string, word2: string): boolean {
  if (word1.length !== word2.length) return false;
  let diff = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      diff++;
      if (diff > 1) return false;
    }
  }
  return diff === 1;
}

function generateSteps(beginWord: string, endWord: string, wordList: string[]): Step[] {
  const steps: Step[] = [];
  const queue = [beginWord];
  const visited = new Set([beginWord]);
  const distances = new Map([[beginWord, 0]]);
  const parents = new Map<string, string>();

  steps.push({
    type: 'start',
    currentWord: null,
    queue: [...queue],
    visited: new Set(visited),
    distances: new Map(distances),
    parents: new Map(parents),
    newlyDiscovered: [],
    finalPath: [],
    description: `Starting BFS from "${beginWord}". Goal: find shortest path to "${endWord}". Initialize queue with start word.`
  });

  if (!wordList.includes(endWord)) {
    steps.push({
      type: 'no_path',
      currentWord: null,
      queue: [],
      visited: new Set(),
      distances: new Map(),
      parents: new Map(),
      newlyDiscovered: [],
      finalPath: [],
      description: `No solution possible - "${endWord}" is not in the word list.`
    });
    return steps;
  }

  while (queue.length > 0) {
    const currentWord = queue.shift()!;
    const currentDistance = distances.get(currentWord)!;

    steps.push({
      type: 'dequeue',
      currentWord,
      queue: [...queue],
      visited: new Set(visited),
      distances: new Map(distances),
      parents: new Map(parents),
      newlyDiscovered: [],
      finalPath: [],
      description: `Dequeue "${currentWord}" (distance: ${currentDistance}). Explore all words that differ by exactly one character.`
    });

    if (currentWord === endWord) {
      // Reconstruct path
      const path: string[] = [];
      let current: string | undefined = endWord;
      while (current) {
        path.unshift(current);
        current = parents.get(current);
      }

      steps.push({
        type: 'found',
        currentWord: endWord,
        queue: [...queue],
        visited: new Set(visited),
        distances: new Map(distances),
        parents: new Map(parents),
        newlyDiscovered: [],
        finalPath: path,
        description: `Found target word "${endWord}"! Reconstructing shortest path...`,
        transformations: path.slice(1).map((word, i) => {
          const prev = path[i];
          const changes = [];
          for (let j = 0; j < word.length; j++) {
            if (word[j] !== prev[j]) {
              changes.push(`${prev[j]}→${word[j]} at position ${j}`);
            }
          }
          return changes.join(', ');
        })
      });

      return steps;
    }

    // Find all transformable words
    const neighbors: string[] = [];
    for (const word of wordList) {
      if (!visited.has(word) && canTransform(currentWord, word)) {
        neighbors.push(word);
      }
    }

    if (neighbors.length > 0) {
      steps.push({
        type: 'explore',
        currentWord,
        queue: [...queue],
        visited: new Set(visited),
        distances: new Map(distances),
        parents: new Map(parents),
        newlyDiscovered: neighbors,
        finalPath: [],
        description: `Found ${neighbors.length} transformable word${neighbors.length === 1 ? '' : 's'}: ${neighbors.map(w => `"${w}"`).join(', ')}.`
      });

      // Add neighbors to queue
      for (const neighbor of neighbors) {
        queue.push(neighbor);
        visited.add(neighbor);
        distances.set(neighbor, currentDistance + 1);
        parents.set(neighbor, currentWord);
      }

      steps.push({
        type: 'add_to_queue',
        currentWord,
        queue: [...queue],
        visited: new Set(visited),
        distances: new Map(distances),
        parents: new Map(parents),
        newlyDiscovered: neighbors,
        finalPath: [],
        description: `Added ${neighbors.length} word${neighbors.length === 1 ? '' : 's'} to queue with distance ${currentDistance + 1}.`
      });
    }
  }

  steps.push({
    type: 'no_path',
    currentWord: null,
    queue: [],
    visited: new Set(visited),
    distances: new Map(),
    parents: new Map(),
    newlyDiscovered: [],
    finalPath: [],
    description: `No transformation sequence found. "${endWord}" is unreachable from "${beginWord}".`
  });

  return steps;
}

function WordGraph({ 
  words, 
  edges, 
  step,
  beginWord,
  endWord
}: {
  words: WordNode[];
  edges: Edge[];
  step: Step;
  beginWord: string;
  endWord: string;
}) {
  const getWordColor = (word: string) => {
    if (step.finalPath.includes(word)) return 'bg-green-500';
    if (step.newlyDiscovered.includes(word)) return 'bg-yellow-500';
    if (step.visited.has(word)) return 'bg-blue-500';
    if (step.queue.includes(word)) return 'bg-purple-500';
    return 'bg-slate-600';
  };

  const getWordBorder = (word: string) => {
    if (word === step.currentWord) return 'ring-4 ring-white';
    if (word === beginWord) return 'ring-2 ring-green-400';
    if (word === endWord) return 'ring-2 ring-red-400';
    return '';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-slate-400 mb-4">Word Transformation Graph</h3>
      <div className="relative">
        <svg width="600" height="400" className="mx-auto">
          {/* Edges */}
          {edges.map((edge) => {
            const fromWord = words.find(w => w.word === edge.from)!;
            const toWord = words.find(w => w.word === edge.to)!;
            
            const isInPath = step.finalPath.includes(edge.from) && step.finalPath.includes(edge.to) &&
              Math.abs(step.finalPath.indexOf(edge.from) - step.finalPath.indexOf(edge.to)) === 1;
            
            return (
              <motion.line
                key={`${edge.from}-${edge.to}`}
                x1={fromWord.x}
                y1={fromWord.y}
                x2={toWord.x}
                y2={toWord.y}
                stroke={isInPath ? '#10b981' : edge.discovered ? '#64748b' : '#374151'}
                strokeWidth={isInPath ? 4 : edge.discovered ? 2 : 1}
                initial={{ opacity: 0 }}
                animate={{ opacity: edge.discovered ? 1 : 0.3 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
          
          {/* Word nodes */}
          {words.map((wordNode) => (
            <motion.g key={wordNode.word}>
              <motion.circle
                cx={wordNode.x}
                cy={wordNode.y}
                r={30}
                className={`${getWordColor(wordNode.word)} ${getWordBorder(wordNode.word)}`}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: wordNode.word === step.currentWord ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={wordNode.x}
                y={wordNode.y + 5}
                textAnchor="middle"
                className="text-white font-bold text-sm fill-current pointer-events-none"
              >
                {wordNode.word}
              </text>
              {step.distances.has(wordNode.word) && (
                <text
                  x={wordNode.x}
                  y={wordNode.y + 50}
                  textAnchor="middle"
                  className="text-slate-300 text-xs fill-current pointer-events-none"
                >
                  d:{step.distances.get(wordNode.word)}
                </text>
              )}
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function QueueDisplay({ queue, currentWord }: { queue: string[]; currentWord: string | null }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">BFS Queue</h3>
      <div className="flex flex-wrap gap-2 min-h-[60px] items-start">
        {queue.length === 0 && (
          <span className="text-slate-500 italic">Empty queue</span>
        )}
        {queue.map((word, index) => (
          <motion.div
            key={`${word}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`px-3 py-1 rounded ${
              index === 0 ? 'bg-purple-500/30 border border-purple-500/50' : 'bg-purple-500/20 border border-purple-500/30'
            }`}
          >
            <span className="text-purple-300 font-mono text-sm">{word}</span>
          </motion.div>
        ))}
      </div>
      {currentWord && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Currently processing:</span>
            <span className="px-2 py-1 bg-blue-500/30 border border-blue-500/50 rounded text-blue-300 font-mono text-sm">
              {currentWord}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PathDisplay({ path, transformations }: { path: string[]; transformations?: string[] }) {
  if (path.length === 0) return null;

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">Shortest Path (Length: {path.length})</h3>
      <div className="flex flex-wrap items-center gap-2">
        {path.map((word, index) => (
          <div key={index} className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-2 bg-green-500/30 border border-green-500/50 rounded font-mono text-green-300"
            >
              {word}
            </motion.div>
            {index < path.length - 1 && (
              <div className="flex flex-col items-center">
                <span className="text-slate-500 text-xs">→</span>
                {transformations && transformations[index] && (
                  <span className="text-slate-500 text-xs mt-1 max-w-[120px] text-center">
                    {transformations[index]}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WordLadderVisualizer() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const example = examples[selectedExample];
    const newSteps = generateSteps(example.beginWord, example.endWord, example.wordList);
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
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1200 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  // Generate graph layout
  const generateWordGraph = (example: Example) => {
    const allWords = [example.beginWord, ...example.wordList];
    const words: WordNode[] = [];
    const edges: Edge[] = [];

    // Position words in a circle
    const radius = 150;
    const centerX = 300;
    const centerY = 200;
    
    allWords.forEach((word, i) => {
      const angle = (i * 2 * Math.PI) / allWords.length;
      words.push({
        word,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        visited: false,
        inQueue: false,
        distance: -1,
        parent: null,
        isPath: false
      });
    });

    // Generate edges between transformable words
    for (let i = 0; i < allWords.length; i++) {
      for (let j = i + 1; j < allWords.length; j++) {
        if (canTransform(allWords[i], allWords[j])) {
          edges.push({
            from: allWords[i],
            to: allWords[j],
            discovered: false
          });
          edges.push({
            from: allWords[j],
            to: allWords[i],
            discovered: false
          });
        }
      }
    }

    // Mark discovered edges based on current step
    const step = steps[currentStep];
    if (step) {
      edges.forEach(edge => {
        edge.discovered = step.visited.has(edge.from) && step.visited.has(edge.to);
      });
    }

    return { words, edges };
  };

  const step = steps[currentStep];
  const currentExample = examples[selectedExample];
  const { words, edges } = generateWordGraph(currentExample);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Word Ladder</h1>
        <p className="text-slate-400">
          Find the shortest transformation sequence from beginWord to endWord using BFS, 
          changing only one letter at a time through valid dictionary words.
        </p>
      </div>

      {/* Example Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Choose Example</h3>
        <div className="flex gap-3 flex-wrap">
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
              <div className="text-xs text-slate-500 mt-2">
                {example.beginWord} → {example.endWord}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <WordGraph
            words={words}
            edges={edges}
            step={step || { 
              queue: [], 
              visited: new Set(), 
              distances: new Map(), 
              parents: new Map(), 
              newlyDiscovered: [], 
              finalPath: [],
              currentWord: null,
              type: 'start',
              description: ''
            }}
            beginWord={currentExample.beginWord}
            endWord={currentExample.endWord}
          />
        </div>
        
        <div className="space-y-4">
          <QueueDisplay
            queue={step?.queue || []}
            currentWord={step?.currentWord || null}
          />
          {step?.finalPath && step.finalPath.length > 0 && (
            <PathDisplay 
              path={step.finalPath} 
              transformations={step.transformations}
            />
          )}
        </div>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'found' ? 'bg-green-500' :
            step?.type === 'no_path' ? 'bg-red-500' :
            step?.type === 'dequeue' ? 'bg-blue-500' :
            step?.type === 'explore' ? 'bg-yellow-500' :
            step?.type === 'add_to_queue' ? 'bg-purple-500' :
            'bg-slate-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready to start'}</span>
        </div>
        {step?.type === 'found' && (
          <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <strong>✓ Path Found!</strong> - Shortest transformation length: {step.finalPath.length - 1} steps
          </div>
        )}
        {step?.type === 'no_path' && (
          <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <strong>✗ No Path Exists</strong> - Cannot transform between the given words
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
            <span>Unvisited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span>In Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Just Discovered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Final Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-white"></div>
            <span>Currently Processing</span>
          </div>
        </div>
      </div>

      {/* Java Code */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code (BFS Word Ladder)</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int ladderLength(String beginWord, String endWord, List<String> wordList) {
    Set<String> wordSet = new HashSet<>(wordList);
    if (!wordSet.contains(endWord)) return 0;
    
    Queue<String> queue = new LinkedList<>();
    Set<String> visited = new HashSet<>();
    
    queue.offer(beginWord);
    visited.add(beginWord);
    int level = 1;
    
    while (!queue.isEmpty()) {
        int size = queue.size();
        
        for (int i = 0; i < size; i++) {
            String word = queue.poll();
            
            if (word.equals(endWord)) {
                return level; // Found shortest path
            }
            
            // Try changing each character
            for (int j = 0; j < word.length(); j++) {
                char[] chars = word.toCharArray();
                
                for (char c = 'a'; c <= 'z'; c++) {
                    chars[j] = c;
                    String newWord = new String(chars);
                    
                    if (wordSet.contains(newWord) && !visited.contains(newWord)) {
                        queue.offer(newWord);
                        visited.add(newWord);
                    }
                }
            }
        }
        level++;
    }
    
    return 0; // No transformation found
}

// Time: O(M²×N) where M = word length, N = wordList size
// Space: O(M×N) for queue and visited set`}
        </pre>
      </div>

      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Key Insights</h3>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>BFS for Shortest Path:</strong> BFS guarantees finding the shortest path in unweighted graphs like this word transformation problem.</p>
          <p><strong>Word Distance:</strong> Each transformation changes exactly one character, creating edges between "adjacent" words in the graph.</p>
          <p><strong>Level-by-Level:</strong> BFS processes words level by level, ensuring we find the minimum transformation sequence.</p>
          <p><strong>Bidirectional BFS:</strong> For optimization, we could search from both ends and meet in the middle (reduces search space).</p>
          <p><strong>Character Iteration:</strong> For each word, try changing every position to every possible letter to find valid transformations.</p>
        </div>
      </div>
    </div>
  );
}