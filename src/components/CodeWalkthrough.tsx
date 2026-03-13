/**
 * CodeWalkthrough Component
 * Displays algorithm code with step-by-step line highlighting
 * Syncs with visualizer animation state
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Code2 } from 'lucide-react';

interface CodeWalkthroughProps {
  code: string;
  language?: 'java' | 'python' | 'javascript';
  highlightedLines?: number[];  // 1-indexed line numbers to highlight
  currentLine?: number;         // Current executing line (1-indexed)
  title?: string;
  defaultExpanded?: boolean;
  className?: string;
}

// Simple syntax highlighting (Java-focused for now)
function highlightCode(line: string, _language: string): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  let remaining = line;
  let key = 0;

  const javaKeywords = [
    'public', 'private', 'protected', 'static', 'final', 'void', 'class', 'interface',
    'extends', 'implements', 'new', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws',
    'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'String',
    'null', 'true', 'false', 'this', 'super', 'import', 'package',
  ];
  
  const typeKeywords = [
    'List', 'ArrayList', 'LinkedList', 'Map', 'HashMap', 'TreeMap', 'Set', 'HashSet',
    'TreeSet', 'Queue', 'Deque', 'Stack', 'PriorityQueue', 'Arrays', 'Collections',
    'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Character', 'Object',
    'TreeNode', 'ListNode', 'StringBuilder', 'Math', 'System',
  ];

  const patterns = [
    { type: 'comment', regex: /^(\/\/.*$)/ },
    { type: 'comment', regex: /^(#.*$)/ }, // Python
    { type: 'string', regex: /^("(?:[^"\\]|\\.)*")/ },
    { type: 'string', regex: /^('(?:[^'\\]|\\.)*')/ },
    { type: 'number', regex: /^(\b\d+\.?\d*[fFdDlL]?\b)/ },
    { type: 'keyword', regex: new RegExp(`^\\b(${javaKeywords.join('|')})\\b`) },
    { type: 'type', regex: new RegExp(`^\\b(${typeKeywords.join('|')})\\b`) },
    { type: 'annotation', regex: /^(@\w+)/ },
    { type: 'method', regex: /^(\w+)(?=\s*\()/ },
    { type: 'operator', regex: /^([+\-*/%=<>!&|^~?:]+)/ },
    { type: 'bracket', regex: /^([()[\]{}])/ },
    { type: 'punctuation', regex: /^([;,.])/ },
    { type: 'whitespace', regex: /^(\s+)/ },
    { type: 'identifier', regex: /^(\w+)/ },
    { type: 'other', regex: /^(.)/ },
  ];

  const colorMap: Record<string, string> = {
    comment: 'text-slate-500 italic',
    string: 'text-green-400',
    number: 'text-orange-400',
    keyword: 'text-purple-400 font-medium',
    type: 'text-cyan-400',
    annotation: 'text-yellow-400',
    method: 'text-blue-400',
    operator: 'text-pink-400',
    bracket: 'text-slate-300',
    punctuation: 'text-slate-400',
    whitespace: '',
    identifier: 'text-slate-200',
    other: 'text-slate-300',
  };

  while (remaining.length > 0) {
    let matched = false;
    for (const { type, regex } of patterns) {
      const match = remaining.match(regex);
      if (match) {
        const text = match[1];
        elements.push(
          <span key={key++} className={colorMap[type]}>
            {text}
          </span>
        );
        remaining = remaining.slice(text.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      elements.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }

  return elements;
}

export function CodeWalkthrough({
  code,
  language = 'java',
  highlightedLines = [],
  currentLine,
  title = 'Code Walkthrough',
  defaultExpanded = true,
  className = '',
}: CodeWalkthroughProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const lines = useMemo(() => code.split('\n'), [code]);
  
  const highlightedSet = useMemo(
    () => new Set(highlightedLines),
    [highlightedLines]
  );

  return (
    <div className={`bg-slate-800 dark:bg-slate-900 rounded-lg border border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code2 size={18} className="text-blue-400" />
          <span className="font-semibold text-slate-200">{title}</span>
          <span className="text-xs text-slate-500 capitalize">({language})</span>
        </div>
        <div className="flex items-center gap-2">
          {currentLine && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
              Line {currentLine}
            </span>
          )}
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Code content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-slate-700 overflow-x-auto">
              <div className="font-mono text-sm min-w-max">
                {lines.map((line, index) => {
                  const lineNumber = index + 1;
                  const isCurrent = lineNumber === currentLine;
                  const isHighlighted = highlightedSet.has(lineNumber);
                  
                  return (
                    <div
                      key={lineNumber}
                      className={`flex border-l-4 transition-all duration-200 ${
                        isCurrent
                          ? 'bg-yellow-500/20 border-yellow-500'
                          : isHighlighted
                          ? 'bg-blue-500/10 border-blue-500/50'
                          : 'border-transparent hover:bg-slate-700/30'
                      }`}
                    >
                      {/* Line number */}
                      <div className={`w-12 flex-shrink-0 px-3 py-1 text-right select-none border-r border-slate-700 ${
                        isCurrent ? 'text-yellow-400 font-bold' : 'text-slate-500'
                      }`}>
                        {lineNumber}
                      </div>

                      {/* Code content */}
                      <div className="flex-1 px-4 py-1 whitespace-pre">
                        {highlightCode(line, language)}
                      </div>

                      {/* Execution indicator */}
                      {isCurrent && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex-shrink-0 px-3 py-1 flex items-center"
                        >
                          <span className="text-xs text-yellow-400 font-medium flex items-center gap-1">
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                            >
                              ►
                            </motion.span>
                            executing
                          </span>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complexity footer */}
            <div className="border-t border-slate-700 px-4 py-2 bg-slate-800/50 flex items-center gap-4 text-xs text-slate-400">
              <span>
                <span className="text-slate-500">Lines:</span> {lines.length}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-yellow-400">● Current</span>
              <span className="text-blue-400">● Active region</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CodeWalkthrough;
