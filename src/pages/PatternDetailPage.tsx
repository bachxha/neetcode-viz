import React, { useState } from 'react';
import type { Pattern } from '../data/patterns';
import { ArrowLeft, Clock, HardDrive, Copy, Check, ExternalLink, ChevronRight, Lightbulb, ListOrdered } from 'lucide-react';
import { problems } from '../data/problems';

interface PatternDetailPageProps {
  pattern: Pattern;
  onBack: () => void;
  onSelectProblem: (id: string) => void;
}

function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const colors = {
    Easy: 'bg-green-500/20 text-green-400',
    Medium: 'bg-yellow-500/20 text-yellow-400',
    Hard: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    'Sliding Window': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Two Pointers': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Binary Search': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Trees': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Graphs': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Dynamic Programming': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Backtracking': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Intervals': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Linked List': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };
  
  const classes = colorMap[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${classes}`}>
      {category}
    </span>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const lines = code.split('\n');
  
  return (
    <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-medium">Java Template</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm">
          <code className="font-mono">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="select-none w-8 pr-4 text-right text-slate-600 text-xs leading-6">
                  {i + 1}
                </span>
                <span className="text-slate-300 leading-6">{highlightSyntax(line)}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function highlightSyntax(line: string): React.ReactElement {
  // Check for comments first (highest priority)
  if (line.trim().startsWith('//')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }
  
  // Simple rendering with syntax highlighting
  return (
    <span dangerouslySetInnerHTML={{
      __html: line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(\/\/.*$)/g, '<span class="text-slate-500 italic">$1</span>')
        .replace(/(".*?")/g, '<span class="text-green-400">$1</span>')
        .replace(/\b(public|private|class|int|boolean|void|return|if|else|while|for|new|null|true|false|this|static|final|extends|implements|import|package|throw|try|catch)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/\b(String|Integer|Boolean|Map|Set|List|Queue|Stack|TreeNode|ListNode|Arrays|Math|HashMap|HashSet|ArrayList|LinkedList|PriorityQueue|Color)\b/g, '<span class="text-cyan-400">$1</span>')
    }} />
  );
}

export function PatternDetailPage({ pattern, onBack, onSelectProblem }: PatternDetailPageProps) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        <span>Back to Patterns</span>
      </button>
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold text-white">{pattern.name}</h1>
          <CategoryBadge category={pattern.category} />
        </div>
        <p className="text-slate-300 text-lg leading-relaxed">{pattern.description}</p>
      </div>
      
      {/* Key Insight Box */}
      <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="text-yellow-400" size={20} />
          <h2 className="text-lg font-semibold text-yellow-400">Key Insight</h2>
        </div>
        <p className="text-slate-300 leading-relaxed">{pattern.keyInsight}</p>
      </div>
      
      {/* Complexity */}
      <div className="mb-8 flex gap-4">
        <div className="flex-1 p-4 rounded-lg bg-slate-800 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Clock size={16} />
            <span className="text-sm">Time Complexity</span>
          </div>
          <span className="text-xl font-mono font-bold text-white">{pattern.timeComplexity}</span>
        </div>
        <div className="flex-1 p-4 rounded-lg bg-slate-800 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <HardDrive size={16} />
            <span className="text-sm">Space Complexity</span>
          </div>
          <span className="text-xl font-mono font-bold text-white">{pattern.spaceComplexity}</span>
        </div>
      </div>
      
      {/* Algorithm Steps */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ListOrdered className="text-blue-400" size={20} />
          <h2 className="text-xl font-semibold text-white">Algorithm Steps</h2>
        </div>
        <div className="space-y-2">
          {pattern.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span className="text-slate-300 pt-0.5">{step}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Code Template */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Code Template</h2>
        <CodeBlock code={pattern.javaTemplate} />
      </div>
      
      {/* Related Problems */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Related Problems
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({pattern.relatedProblems.length} problems)
          </span>
        </h2>
        <div className="space-y-2">
          {pattern.relatedProblems.map((problem) => {
            const hasVisualization = problems.find(p => p.id === problem.id)?.hasVisualization;
            
            return (
              <div
                key={problem.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  hasVisualization
                    ? 'bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
                onClick={() => hasVisualization && onSelectProblem(problem.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${hasVisualization ? 'text-white' : 'text-slate-400'}`}>
                      {problem.title}
                    </span>
                    <DifficultyBadge difficulty={problem.difficulty} />
                    {hasVisualization && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                        Visualizer
                      </span>
                    )}
                  </div>
                </div>
                
                <a
                  href={problem.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Open on LeetCode"
                >
                  <ExternalLink size={14} />
                </a>
                
                {hasVisualization && (
                  <ChevronRight className="text-slate-500" size={16} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-slate-500 text-sm pt-4 border-t border-slate-800">
        <p>Practice this pattern until you can recognize it instantly 🎯</p>
      </div>
    </div>
  );
}
