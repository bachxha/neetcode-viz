/**
 * CodeWalkthrough Component
 * Displays algorithm code with step-by-step line highlighting
 * Syncs with visualizer animation state
 * Supports multiple programming languages with persistent preference
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Code2 } from 'lucide-react';

export type Language = 'java' | 'python' | 'javascript';

export interface MultiLanguageCode {
  java: string;
  python: string;
  javascript: string;
}

interface CodeWalkthroughProps {
  // Support both single language (legacy) and multi-language
  code?: string;
  multiLanguageCode?: MultiLanguageCode;
  language?: Language;
  highlightedLines?: number[];  // 1-indexed line numbers to highlight
  currentLine?: number;         // Current executing line (1-indexed)
  title?: string;
  defaultExpanded?: boolean;
  className?: string;
}

// Enhanced syntax highlighting for multiple languages
function highlightCode(line: string, language: Language): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  let remaining = line;
  let key = 0;

  // Language-specific keywords
  const languageKeywords = {
    java: [
      'public', 'private', 'protected', 'static', 'final', 'void', 'class', 'interface',
      'extends', 'implements', 'new', 'return', 'if', 'else', 'for', 'while', 'do',
      'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws',
      'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'String',
      'null', 'true', 'false', 'this', 'super', 'import', 'package', 'instanceof',
    ],
    python: [
      'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
      'import', 'from', 'as', 'return', 'yield', 'break', 'continue', 'pass', 'with',
      'lambda', 'in', 'not', 'and', 'or', 'is', 'True', 'False', 'None', 'self',
      'global', 'nonlocal', 'assert', 'del', 'raise',
    ],
    javascript: [
      'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do', 'switch',
      'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw',
      'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'class', 'extends', 'super',
      'static', 'async', 'await', 'true', 'false', 'null', 'undefined', 'export',
      'import', 'from', 'default',
    ],
  };

  const typeKeywords = {
    java: [
      'List', 'ArrayList', 'LinkedList', 'Map', 'HashMap', 'TreeMap', 'Set', 'HashSet',
      'TreeSet', 'Queue', 'Deque', 'Stack', 'PriorityQueue', 'Arrays', 'Collections',
      'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Character', 'Object',
      'TreeNode', 'ListNode', 'StringBuilder', 'Math', 'System',
    ],
    python: [
      'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'len', 'range',
      'enumerate', 'zip', 'map', 'filter', 'sorted', 'min', 'max', 'sum', 'abs',
      'all', 'any', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr',
    ],
    javascript: [
      'Array', 'Object', 'Map', 'Set', 'String', 'Number', 'Boolean', 'Math',
      'JSON', 'Date', 'Promise', 'console', 'parseInt', 'parseFloat', 'isNaN',
      'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
    ],
  };

  // Comment patterns by language
  const commentPatterns = {
    java: [/^(\/\/.*$)/, /^(\/\*[\s\S]*?\*\/)/],
    python: [/^(#.*$)/, /^('''[\s\S]*?''')/, /^("""[\s\S]*?""")/],
    javascript: [/^(\/\/.*$)/, /^(\/\*[\s\S]*?\*\/)/],
  };

  const patterns = [
    // Comments (language-specific)
    ...commentPatterns[language].map(regex => ({ type: 'comment', regex })),
    // Strings
    { type: 'string', regex: /^("(?:[^"\\]|\\.)*")/ },
    { type: 'string', regex: /^('(?:[^'\\]|\\.)*')/ },
    { type: 'string', regex: /^(`(?:[^`\\]|\\.)*`)/ }, // Template strings (JS)
    // Numbers
    { type: 'number', regex: /^(\b\d+\.?\d*[fFdDlL]?\b)/ },
    // Keywords
    { type: 'keyword', regex: new RegExp(`^\\b(${languageKeywords[language].join('|')})\\b`) },
    { type: 'type', regex: new RegExp(`^\\b(${typeKeywords[language].join('|')})\\b`) },
    // Language-specific patterns
    { type: 'annotation', regex: /^(@\w+)/ }, // Java annotations
    { type: 'decorator', regex: /^(@\w+)/ },  // Python decorators
    { type: 'method', regex: /^(\w+)(?=\s*\()/ },
    // Operators
    { type: 'operator', regex: /^([+\-*/%=<>!&|^~?:]+)/ },
    // Brackets and punctuation
    { type: 'bracket', regex: /^([()[\]{}])/ },
    { type: 'punctuation', regex: /^([;,.])/ },
    // Whitespace
    { type: 'whitespace', regex: /^(\s+)/ },
    // Identifiers
    { type: 'identifier', regex: /^(\w+)/ },
    // Everything else
    { type: 'other', regex: /^(.)/ },
  ];

  const colorMap: Record<string, string> = {
    comment: 'text-slate-500 italic',
    string: 'text-green-400',
    number: 'text-orange-400',
    keyword: 'text-purple-400 font-medium',
    type: 'text-cyan-400',
    annotation: 'text-yellow-400',
    decorator: 'text-yellow-400',
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

// Language display names and file extensions for UI
const languageInfo: Record<Language, { name: string; ext: string }> = {
  java: { name: 'Java', ext: '.java' },
  python: { name: 'Python', ext: '.py' },
  javascript: { name: 'JS', ext: '.js' },
};

export function CodeWalkthrough({
  code,
  multiLanguageCode,
  language: propLanguage,
  highlightedLines = [],
  currentLine,
  title = 'Code Walkthrough',
  defaultExpanded = true,
  className = '',
}: CodeWalkthroughProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Language selection state with localStorage persistence
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    if (propLanguage) return propLanguage;
    try {
      const saved = localStorage.getItem('codeWalkthrough-language');
      return (saved as Language) || 'java';
    } catch {
      return 'java';
    }
  });

  // Persist language choice
  useEffect(() => {
    if (!propLanguage) { // Only persist if not controlled by props
      try {
        localStorage.setItem('codeWalkthrough-language', selectedLanguage);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [selectedLanguage, propLanguage]);

  // Determine current language and code
  const currentLanguage = propLanguage || selectedLanguage;
  const currentCode = multiLanguageCode 
    ? multiLanguageCode[currentLanguage] 
    : code || '';

  const lines = useMemo(() => currentCode.split('\n'), [currentCode]);
  
  const highlightedSet = useMemo(
    () => new Set(highlightedLines),
    [highlightedLines]
  );

  const handleLanguageChange = (lang: Language) => {
    if (!propLanguage) { // Only allow changes if not controlled by props
      setSelectedLanguage(lang);
    }
  };

  const isMultiLanguage = !!multiLanguageCode;

  return (
    <div className={`bg-slate-800 dark:bg-slate-900 rounded-lg border border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:bg-slate-700/50 rounded px-2 py-1 transition-colors"
        >
          <Code2 size={18} className="text-blue-400" />
          <span className="font-semibold text-slate-200">{title}</span>
          {!isMultiLanguage && (
            <span className="text-xs text-slate-500 capitalize">
              ({languageInfo[currentLanguage].name})
            </span>
          )}
        </button>
        
        <div className="flex items-center gap-2">
          {currentLine && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
              Line {currentLine}
            </span>
          )}
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Language Tabs (only shown for multi-language) */}
      {isMultiLanguage && isExpanded && (
        <div className="flex bg-slate-700/30 border-b border-slate-700">
          {(Object.keys(languageInfo) as Language[]).map((lang) => {
            const isActive = currentLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'text-blue-400 border-blue-400 bg-slate-600/30'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-600/20'
                }`}
              >
                {languageInfo[lang].name}
              </button>
            );
          })}
        </div>
      )}

      {/* Code content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="overflow-x-auto">
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
                        {highlightCode(line, currentLanguage)}
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
              {isMultiLanguage && (
                <>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-500">
                    Language: {languageInfo[currentLanguage].name}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CodeWalkthrough;