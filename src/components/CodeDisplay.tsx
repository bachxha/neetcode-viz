/**
 * CodeDisplay Component
 * Displays Java code with syntax highlighting, line numbers, and clickable lines
 */

import React, { useMemo } from 'react';
import type { Bug, BugType } from '../data/buggyCodeChallenges';

interface SelectedLine {
  lineNumber: number;
  bugType: BugType | null;
}

interface CodeDisplayProps {
  code: string;
  selectedLines: SelectedLine[];
  onLineClick?: (lineNumber: number) => void;
  revealedBugs?: Bug[];
  showResults?: boolean;
  disabled?: boolean;
}

// Simple Java syntax highlighting
function highlightJava(line: string): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  let remaining = line;
  let key = 0;

  const keywords = [
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

  // Build regex pattern
  const patterns = [
    { type: 'comment', regex: /^(\/\/.*$)/ },
    { type: 'string', regex: /^("(?:[^"\\]|\\.)*")/ },
    { type: 'char', regex: /^('(?:[^'\\]|\\.)*')/ },
    { type: 'number', regex: /^(\b\d+\.?\d*[fFdDlL]?\b)/ },
    { type: 'keyword', regex: new RegExp(`^\\b(${keywords.join('|')})\\b`) },
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
    char: 'text-green-400',
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

function getBugIndicatorColor(bugType: BugType): string {
  const colors: Record<BugType, string> = {
    'off-by-one': 'bg-blue-500',
    'wrong-operator': 'bg-yellow-500',
    'missing-edge-case': 'bg-purple-500',
    'wrong-variable': 'bg-orange-500',
    'infinite-loop': 'bg-red-500',
    'wrong-return': 'bg-green-500',
    'null-pointer': 'bg-red-600',
    'logic-error': 'bg-pink-500',
  };
  return colors[bugType] || 'bg-slate-500';
}

export function CodeDisplay({
  code,
  selectedLines,
  onLineClick,
  revealedBugs,
  showResults = false,
  disabled = false,
}: CodeDisplayProps) {
  const lines = useMemo(() => code.split('\n'), [code]);
  
  const selectedLinesMap = useMemo(() => {
    const map = new Map<number, SelectedLine>();
    selectedLines.forEach(sl => map.set(sl.lineNumber, sl));
    return map;
  }, [selectedLines]);

  const revealedBugsMap = useMemo(() => {
    if (!revealedBugs) return new Map<number, Bug>();
    const map = new Map<number, Bug>();
    revealedBugs.forEach(bug => map.set(bug.lineNumber, bug));
    return map;
  }, [revealedBugs]);

  const getLineClassName = (lineNumber: number): string => {
    const base = 'flex items-stretch border-l-4 transition-all duration-150';
    const selected = selectedLinesMap.get(lineNumber);
    const bug = revealedBugsMap.get(lineNumber);

    if (showResults) {
      // Results mode
      if (selected && bug) {
        // Correctly found bug (true positive)
        return `${base} bg-green-500/20 border-green-500`;
      } else if (!selected && bug) {
        // Missed bug (false negative)
        return `${base} bg-red-500/20 border-red-500`;
      } else if (selected && !bug) {
        // False positive
        return `${base} bg-yellow-500/20 border-yellow-500`;
      }
      return `${base} border-transparent hover:bg-slate-800/50`;
    }

    // Training mode
    if (selected) {
      return `${base} bg-blue-500/20 border-blue-500`;
    }
    
    if (!disabled) {
      return `${base} border-transparent hover:bg-slate-800/50 hover:border-slate-600 cursor-pointer`;
    }
    
    return `${base} border-transparent`;
  };

  return (
    <div className="relative font-mono text-sm bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-slate-500">Java</span>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const selected = selectedLinesMap.get(lineNumber);
            const bug = revealedBugsMap.get(lineNumber);
            
            return (
              <div
                key={lineNumber}
                className={getLineClassName(lineNumber)}
                onClick={() => !disabled && !showResults && onLineClick?.(lineNumber)}
              >
                {/* Line number */}
                <div className="w-12 flex-shrink-0 px-3 py-1 text-right text-slate-500 bg-slate-800/50 select-none border-r border-slate-700">
                  {lineNumber}
                </div>

                {/* Code content */}
                <div className="flex-1 px-4 py-1 whitespace-pre">
                  {highlightJava(line)}
                </div>

                {/* Bug type indicator (training mode) */}
                {selected && selected.bugType && !showResults && (
                  <div className="flex-shrink-0 px-3 py-1 flex items-center">
                    <span className={`px-2 py-0.5 rounded text-xs text-white ${getBugIndicatorColor(selected.bugType)}`}>
                      {selected.bugType}
                    </span>
                  </div>
                )}

                {/* Result indicator */}
                {showResults && (selected || bug) && (
                  <div className="flex-shrink-0 px-3 py-1 flex items-center gap-2">
                    {selected && bug && (
                      <span className="text-xs text-green-400 font-medium">✓ Found</span>
                    )}
                    {!selected && bug && (
                      <span className="text-xs text-red-400 font-medium">✗ Missed</span>
                    )}
                    {selected && !bug && (
                      <span className="text-xs text-yellow-400 font-medium">⚠ False +</span>
                    )}
                    {bug && (
                      <span className={`px-2 py-0.5 rounded text-xs text-white ${getBugIndicatorColor(bug.bugType)}`}>
                        {bug.bugType}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend for results mode */}
      {showResults && (
        <div className="flex items-center justify-center gap-6 px-4 py-3 bg-slate-800 border-t border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-slate-400">Correctly Found</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-slate-400">Missed Bug</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-slate-400">False Positive</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Component for displaying just the bug info
export function BugDetails({ bug }: { bug: Bug }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm text-slate-400">Line {bug.lineNumber}</span>
        <span className={`px-2 py-0.5 rounded text-xs text-white ${getBugIndicatorColor(bug.bugType)}`}>
          {bug.bugType}
        </span>
      </div>
      <p className="text-sm text-slate-300 mb-3">{bug.description}</p>
      <div className="bg-slate-900 rounded p-3">
        <div className="text-xs text-green-400 mb-1">Fix:</div>
        <code className="text-sm text-slate-200">{bug.fix}</code>
      </div>
    </div>
  );
}

export default CodeDisplay;
