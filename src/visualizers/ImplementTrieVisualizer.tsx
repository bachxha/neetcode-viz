import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  char?: string;
  id: string;
}

interface Step {
  type: 'start' | 'insert' | 'search' | 'startswith' | 'navigate' | 'create_node' | 'mark_end' | 'found' | 'not_found';
  currentWord: string;
  currentChar: string;
  currentIndex: number;
  highlightedNodes: string[];
  description: string;
  trie: TrieNode;
  operation: 'insert' | 'search' | 'startsWith' | 'init';
  result?: boolean;
}

class TrieImplementation {
  root: TrieNode;
  private nodeIdCounter: number;

  constructor() {
    this.nodeIdCounter = 0;
    this.root = {
      children: new Map(),
      isEndOfWord: false,
      id: this.getNextNodeId(),
    };
  }

  private getNextNodeId(): string {
    return `node_${this.nodeIdCounter++}`;
  }

  private cloneNode(node: TrieNode): TrieNode {
    const cloned: TrieNode = {
      children: new Map(),
      isEndOfWord: node.isEndOfWord,
      char: node.char,
      id: node.id,
    };

    for (const [char, child] of node.children) {
      cloned.children.set(char, this.cloneNode(child));
    }

    return cloned;
  }

  insertWithSteps(word: string): Step[] {
    const steps: Step[] = [];
    let current = this.root;
    
    steps.push({
      type: 'start',
      currentWord: word,
      currentChar: '',
      currentIndex: -1,
      highlightedNodes: [this.root.id],
      description: `Insert "${word}" into the Trie. Start at root.`,
      trie: this.cloneNode(this.root),
      operation: 'insert',
    });

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      
      steps.push({
        type: 'navigate',
        currentWord: word,
        currentChar: char,
        currentIndex: i,
        highlightedNodes: [current.id],
        description: `Looking for child node with character '${char}'`,
        trie: this.cloneNode(this.root),
        operation: 'insert',
      });

      if (!current.children.has(char)) {
        const newNode: TrieNode = {
          children: new Map(),
          isEndOfWord: false,
          char: char,
          id: this.getNextNodeId(),
        };
        current.children.set(char, newNode);
        
        steps.push({
          type: 'create_node',
          currentWord: word,
          currentChar: char,
          currentIndex: i,
          highlightedNodes: [newNode.id],
          description: `Character '${char}' not found. Create new node.`,
          trie: this.cloneNode(this.root),
          operation: 'insert',
        });
      }

      current = current.children.get(char)!;
      
      steps.push({
        type: 'insert',
        currentWord: word,
        currentChar: char,
        currentIndex: i,
        highlightedNodes: [current.id],
        description: `Move to node '${char}' (index ${i})`,
        trie: this.cloneNode(this.root),
        operation: 'insert',
      });
    }

    current.isEndOfWord = true;
    steps.push({
      type: 'mark_end',
      currentWord: word,
      currentChar: '',
      currentIndex: word.length,
      highlightedNodes: [current.id],
      description: `Mark current node as end of word. "${word}" successfully inserted!`,
      trie: this.cloneNode(this.root),
      operation: 'insert',
    });

    return steps;
  }

  searchWithSteps(word: string): Step[] {
    const steps: Step[] = [];
    let current = this.root;
    
    steps.push({
      type: 'start',
      currentWord: word,
      currentChar: '',
      currentIndex: -1,
      highlightedNodes: [this.root.id],
      description: `Search for "${word}" in the Trie. Start at root.`,
      trie: this.cloneNode(this.root),
      operation: 'search',
    });

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      
      steps.push({
        type: 'navigate',
        currentWord: word,
        currentChar: char,
        currentIndex: i,
        highlightedNodes: [current.id],
        description: `Looking for child node with character '${char}'`,
        trie: this.cloneNode(this.root),
        operation: 'search',
      });

      if (!current.children.has(char)) {
        steps.push({
          type: 'not_found',
          currentWord: word,
          currentChar: char,
          currentIndex: i,
          highlightedNodes: [current.id],
          description: `Character '${char}' not found. "${word}" is not in the Trie.`,
          trie: this.cloneNode(this.root),
          operation: 'search',
          result: false,
        });
        return steps;
      }

      current = current.children.get(char)!;
      
      steps.push({
        type: 'search',
        currentWord: word,
        currentChar: char,
        currentIndex: i,
        highlightedNodes: [current.id],
        description: `Found '${char}', move to next node (index ${i})`,
        trie: this.cloneNode(this.root),
        operation: 'search',
      });
    }

    const found = current.isEndOfWord;
    steps.push({
      type: found ? 'found' : 'not_found',
      currentWord: word,
      currentChar: '',
      currentIndex: word.length,
      highlightedNodes: [current.id],
      description: found 
        ? `Reached end of "${word}" and node is marked as end of word. Found!`
        : `Reached end of "${word}" but node is not marked as end of word. Not found!`,
      trie: this.cloneNode(this.root),
      operation: 'search',
      result: found,
    });

    return steps;
  }

  startsWithSteps(prefix: string): Step[] {
    const steps: Step[] = [];
    let current = this.root;
    
    steps.push({
      type: 'start',
      currentWord: prefix,
      currentChar: '',
      currentIndex: -1,
      highlightedNodes: [this.root.id],
      description: `Check if any word starts with "${prefix}". Start at root.`,
      trie: this.cloneNode(this.root),
      operation: 'startsWith',
    });

    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      
      steps.push({
        type: 'navigate',
        currentWord: prefix,
        currentChar: char,
        currentIndex: i,
        highlightedNodes: [current.id],
        description: `Looking for child node with character '${char}'`,
        trie: this.cloneNode(this.root),
        operation: 'startsWith',
      });

      if (!current.children.has(char)) {
        steps.push({
          type: 'not_found',
          currentWord: prefix,
          currentChar: char,
          currentIndex: i,
          highlightedNodes: [current.id],
          description: `Character '${char}' not found. No words start with "${prefix}".`,
          trie: this.cloneNode(this.root),
          operation: 'startsWith',
          result: false,
        });
        return steps;
      }

      current = current.children.get(char)!;
      
      steps.push({
        type: 'startswith',
        currentWord: prefix,
        currentChar: char,
        currentIndex: i,
        highlightedNodes: [current.id],
        description: `Found '${char}', move to next node (index ${i})`,
        trie: this.cloneNode(this.root),
        operation: 'startsWith',
      });
    }

    steps.push({
      type: 'found',
      currentWord: prefix,
      currentChar: '',
      currentIndex: prefix.length,
      highlightedNodes: [current.id],
      description: `Successfully navigated through "${prefix}". Prefix exists!`,
      trie: this.cloneNode(this.root),
      operation: 'startsWith',
      result: true,
    });

    return steps;
  }
}

const DEMO_SEQUENCES = [
  {
    label: 'Basic Example',
    operations: [
      { type: 'insert', word: 'app' },
      { type: 'insert', word: 'apple' },
      { type: 'search', word: 'app' },
      { type: 'startsWith', word: 'app' },
    ]
  },
  {
    label: 'Word Variations',
    operations: [
      { type: 'insert', word: 'cat' },
      { type: 'insert', word: 'car' },
      { type: 'insert', word: 'card' },
      { type: 'search', word: 'car' },
      { type: 'search', word: 'care' },
      { type: 'startsWith', word: 'ca' },
    ]
  },
];

export function ImplementTrieVisualizer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedSequence, setSelectedSequence] = useState(0);

  const initializeSteps = useCallback(() => {
    // Reset trie
    const newTrie = new TrieImplementation();
    const allSteps: Step[] = [];
    
    const sequence = DEMO_SEQUENCES[selectedSequence];
    
    for (const operation of sequence.operations) {
      if (operation.type === 'insert') {
        const insertSteps = newTrie.insertWithSteps(operation.word);
        allSteps.push(...insertSteps);
      } else if (operation.type === 'search') {
        const searchSteps = newTrie.searchWithSteps(operation.word);
        allSteps.push(...searchSteps);
      } else if (operation.type === 'startsWith') {
        const startsWithSteps = newTrie.startsWithSteps(operation.word);
        allSteps.push(...startsWithSteps);
      }
    }
    
    setSteps(allSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [selectedSequence]);

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

  const renderTrieNode = (node: TrieNode, x: number, y: number, level: number = 0): React.JSX.Element[] => {
    const elements: React.JSX.Element[] = [];
    const isHighlighted = step?.highlightedNodes.includes(node.id);
    
    // Draw current node
    elements.push(
      <motion.g key={node.id}>
        <motion.circle
          cx={x}
          cy={y}
          r={20}
          fill={isHighlighted ? '#3b82f6' : node.isEndOfWord ? '#10b981' : '#374151'}
          stroke={isHighlighted ? '#60a5fa' : '#6b7280'}
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.text
          x={x}
          y={y + 4}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          {node.char || 'R'}
        </motion.text>
        {node.isEndOfWord && (
          <motion.circle
            cx={x + 15}
            cy={y - 15}
            r={4}
            fill="#10b981"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
        )}
      </motion.g>
    );

    // Draw children
    const childrenArray = Array.from(node.children.entries());
    const childSpacing = Math.max(120, 240 / Math.max(childrenArray.length, 1));
    const startX = x - (childSpacing * (childrenArray.length - 1)) / 2;

    childrenArray.forEach(([, child], index) => {
      const childX = startX + index * childSpacing;
      const childY = y + 80;

      // Draw edge
      elements.push(
        <motion.line
          key={`edge-${node.id}-${child.id}`}
          x1={x}
          y1={y + 20}
          x2={childX}
          y2={childY - 20}
          stroke="#6b7280"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      );

      // Draw child nodes recursively
      elements.push(...renderTrieNode(child, childX, childY, level + 1));
    });

    return elements;
  };

  if (!step) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Implement Trie (Prefix Tree)</h1>
        <p className="text-slate-400">
          A Trie is a tree-like data structure for storing strings. Each node represents a character,
          and paths from root to nodes represent words or prefixes.
        </p>
      </div>

      {/* Demo Sequence Selection */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Demo:</span>
        {DEMO_SEQUENCES.map((seq, i) => (
          <button
            key={i}
            onClick={() => setSelectedSequence(i)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              selectedSequence === i
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {seq.label}
          </button>
        ))}
      </div>

      {/* Current Operation Info */}
      <div className="mb-6 p-4 bg-slate-800 rounded-lg">
        <div className="flex items-center gap-4 mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            step.operation === 'insert' ? 'bg-green-500/20 text-green-400' :
            step.operation === 'search' ? 'bg-blue-500/20 text-blue-400' :
            'bg-purple-500/20 text-purple-400'
          }`}>
            {step.operation === 'startsWith' ? 'Starts With' : step.operation.toUpperCase()}
          </span>
          <span className="text-white font-mono">"{step.currentWord}"</span>
          {step.result !== undefined && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              step.result ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {step.result ? 'TRUE' : 'FALSE'}
            </span>
          )}
        </div>
        <p className="text-slate-300">{step.description}</p>
      </div>

      {/* Trie Visualization */}
      <div className="mb-6 bg-slate-800 rounded-lg p-6 overflow-x-auto">
        <svg width="800" height="400" className="mx-auto">
          {step.trie && renderTrieNode(step.trie, 400, 50)}
        </svg>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-600"></div>
          <span className="text-slate-400">Regular Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-slate-400">Current Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-slate-400">End of Word</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-slate-400">Word Marker</span>
        </div>
      </div>

      <Controls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onStepForward={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
        onStepBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
        onReset={() => setCurrentStep(0)}
        currentStep={currentStep}
        totalSteps={steps.length}
        speed={speed}
        onSpeedChange={setSpeed}
        canStepForward={currentStep < steps.length - 1}
        canStepBack={currentStep > 0}
      />
    </div>
  );
}