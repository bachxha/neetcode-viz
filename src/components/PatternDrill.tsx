import { useState } from 'react';
import { patterns, type PatternCategory } from '../data/patterns';
import { getProblemsForPattern } from '../data/problemPatternMappings';
import { problems, type Problem } from '../data/problems';
import { ChevronRight, Play, ExternalLink, CheckCircle2, Target, TrendingUp, Clock, Star } from 'lucide-react';

interface DrillProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcodeUrl: string;
  hasVisualization: boolean;
  patternIds: string[];
}

interface DrillSession {
  patternName: string;
  patternCategory: PatternCategory;
  problems: DrillProblem[];
  currentProblemIndex: number;
  completedProblems: Set<string>;
  startTime: Date;
}

function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const colors = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium border ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}

function getPatternEmoji(category: string): string {
  switch (category) {
    case 'Sliding Window': return '🪟';
    case 'Two Pointers': return '👉';
    case 'Binary Search': return '🔍';
    case 'Trees': return '🌳';
    case 'Graphs': return '🕸️';
    case 'Dynamic Programming': return '💡';
    case 'Backtracking': return '↩️';
    case 'Intervals': return '📊';
    case 'Linked List': return '🔗';
    default: return '⚙️';
  }
}

function PatternCard({ 
  pattern, 
  onSelectPattern 
}: { 
  pattern: any; 
  onSelectPattern: (patternId: string, patternName: string, category: PatternCategory) => void;
}) {
  const relatedProblems = getProblemsForPattern(pattern.id);
  const allProblems = relatedProblems.map(mapping => 
    problems.find(p => p.id === mapping.problemId)
  ).filter(Boolean) as Problem[];
  
  const easyCount = allProblems.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = allProblems.filter(p => p.difficulty === 'Medium').length;
  const hardCount = allProblems.filter(p => p.difficulty === 'Hard').length;
  const withVisualization = allProblems.filter(p => p.hasVisualization).length;

  const categoryColors = {
    'Sliding Window': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    'Two Pointers': 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    'Binary Search': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    'Trees': 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    'Graphs': 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    'Dynamic Programming': 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    'Backtracking': 'from-red-500/20 to-pink-500/20 border-red-500/30',
    'Intervals': 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    'Linked List': 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
  };

  const gradient = categoryColors[pattern.category as keyof typeof categoryColors] || 'from-slate-500/20 to-slate-600/20 border-slate-500/30';

  return (
    <div 
      className={`p-6 rounded-lg bg-gradient-to-br ${gradient} border cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl`}
      onClick={() => onSelectPattern(pattern.id, pattern.name, pattern.category)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{pattern.name}</h3>
          <p className="text-sm text-slate-300">{pattern.category}</p>
        </div>
        <div className="text-2xl">{getPatternEmoji(pattern.category)}</div>
      </div>
      
      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{pattern.shortDescription}</p>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Target size={16} className="text-slate-400" />
          <span className="text-slate-300">
            {allProblems.length} problems
            {withVisualization > 0 && (
              <span className="text-blue-400"> · {withVisualization} visualized</span>
            )}
          </span>
        </div>
        
        {allProblems.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {easyCount > 0 && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  {easyCount} Easy
                </span>
              )}
              {mediumCount > 0 && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  {mediumCount} Medium
                </span>
              )}
              {hardCount > 0 && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  {hardCount} Hard
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
        <Play size={14} />
        <span>Start Drill Session</span>
        <ChevronRight size={14} className="ml-auto" />
      </div>
    </div>
  );
}

function DrillSession({ 
  session, 
  onComplete, 
  onExit,
  onNavigateToProblem 
}: { 
  session: DrillSession; 
  onComplete: () => void;
  onExit: () => void;
  onNavigateToProblem: (problemId: string) => void;
}) {
  const [completedProblems, setCompletedProblems] = useState<Set<string>>(session.completedProblems);
  
  const progress = (completedProblems.size / session.problems.length) * 100;
  const elapsedTime = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60);

  const markCompleted = (problemId: string) => {
    const newCompleted = new Set(completedProblems);
    newCompleted.add(problemId);
    setCompletedProblems(newCompleted);
    
    if (newCompleted.size === session.problems.length) {
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  };

  const logToAirtable = async () => {
    try {
      // Use environment variable for API token security
      // Set VITE_AIRTABLE_TOKEN in your .env file
      const API_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
      const BASE_ID = 'app63OhDShYVpsoAA';
      const TABLE_ID = 'tblpafqoG4BjUkbcW';
      
      if (!API_TOKEN) {
        console.warn('Airtable API token not found. Set VITE_AIRTABLE_TOKEN environment variable.');
        return;
      }
      
      const record = {
        fields: {
          Date: new Date().toISOString().split('T')[0],
          Title: `Pattern Drill: ${session.patternName}`,
          Category: session.patternCategory,
          Difficulty: 'Mixed',
          Link: 'https://neetcode-viz.com/drill',
          Note: `Completed ${completedProblems.size}/${session.problems.length} problems in ${elapsedTime}m`,
          Duration: elapsedTime,
          Company: '',
          Intent: `Pattern Drill: ${session.patternName}`,
          Completion: completedProblems.size === session.problems.length ? 'Complete' : 'Partial',
        }
      };

      await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });
    } catch (error) {
      console.error('Failed to log to Airtable:', error);
    }
  };

  const handleComplete = async () => {
    await logToAirtable();
    onComplete();
  };

  const isAllCompleted = completedProblems.size === session.problems.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {session.patternName} Drill
            </h1>
            <p className="text-slate-400">{session.patternCategory} Pattern</p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Exit Drill
          </button>
        </div>
        
        <div className="bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{completedProblems.size} of {session.problems.length} completed</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{elapsedTime}m</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} />
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {session.problems.map((problem, index) => {
          const isCompleted = completedProblems.has(problem.id);
          const isCurrent = index === session.currentProblemIndex && !isCompleted;
          
          return (
            <div
              key={problem.id}
              className={`p-4 rounded-lg border transition-all ${
                isCompleted 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : isCurrent 
                    ? 'bg-blue-900/20 border-blue-500/30 ring-2 ring-blue-500/20' 
                    : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isCompleted 
                      ? 'bg-green-500/20 text-green-400' 
                      : problem.hasVisualization 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-slate-700/50 text-slate-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 size={16} />
                    ) : problem.hasVisualization ? (
                      <Play size={16} />
                    ) : (
                      <ExternalLink size={16} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium truncate ${
                        isCompleted ? 'text-green-400' : 'text-white'
                      }`}>
                        {index + 1}. {problem.title}
                      </span>
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>
                    <div className="text-sm text-slate-400">
                      Patterns: {problem.patternIds.map(pid => 
                        patterns.find(p => p.id === pid)?.name
                      ).filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {problem.hasVisualization && !isCompleted && (
                    <button
                      onClick={() => onNavigateToProblem(problem.id)}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      Visualize
                    </button>
                  )}
                  
                  <a
                    href={problem.leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors text-sm"
                  >
                    LeetCode
                  </a>
                  
                  {!isCompleted && (
                    <button
                      onClick={() => markCompleted(problem.id)}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isAllCompleted && (
        <div className="mt-8 text-center">
          <div className="mb-4">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-1">Drill Complete!</h2>
            <p className="text-slate-400">
              You&apos;ve completed all {session.problems.length} problems in the {session.patternName} pattern
            </p>
          </div>
          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Star size={18} />
            Complete Drill Session
          </button>
        </div>
      )}
    </div>
  );
}

export function PatternDrill({ onNavigateToProblem }: { onNavigateToProblem: (problemId: string) => void }) {
  const [drillSession, setDrillSession] = useState<DrillSession | null>(null);
  
  const startDrillSession = (patternId: string, patternName: string, category: PatternCategory) => {
    const patternProblems = getProblemsForPattern(patternId);
    
    const drillProblems: DrillProblem[] = patternProblems
      .map(mapping => {
        const problem = problems.find(p => p.id === mapping.problemId);
        if (!problem) return null;
        
        return {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          leetcodeUrl: problem.leetcodeUrl,
          hasVisualization: problem.hasVisualization,
          patternIds: mapping.patterns,
        };
      })
      .filter((p): p is DrillProblem => p !== null)
      .sort((a, b) => {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        return order[a.difficulty] - order[b.difficulty];
      })
      .slice(0, 5);
    
    if (drillProblems.length === 0) {
      alert('No problems found for this pattern');
      return;
    }
    
    setDrillSession({
      patternName,
      patternCategory: category,
      problems: drillProblems,
      currentProblemIndex: 0,
      completedProblems: new Set(),
      startTime: new Date(),
    });
  };

  const exitDrillSession = () => {
    setDrillSession(null);
  };

  const completeDrillSession = () => {
    setDrillSession(null);
  };

  const patternsByCategory = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = [];
    }
    acc[pattern.category].push(pattern);
    return acc;
  }, {} as Record<PatternCategory, any[]>);

  if (drillSession) {
    return (
      <DrillSession
        session={drillSession}
        onComplete={completeDrillSession}
        onExit={exitDrillSession}
        onNavigateToProblem={onNavigateToProblem}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Pattern Drill Mode
        </h1>
        <p className="text-slate-400 text-lg mb-2">
          Master algorithm patterns through focused practice sessions
        </p>
        <p className="text-slate-500 text-sm">
          Each drill contains 3-5 problems arranged Easy → Medium → Hard for optimal learning
        </p>
      </div>

      {Object.entries(patternsByCategory).map(([category, categoryPatterns]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">
              {getPatternEmoji(category)}
            </span>
            {category}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryPatterns.map(pattern => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                onSelectPattern={startDrillSession}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 text-center text-slate-500 text-sm">
        <p>Select a pattern to start your focused drill session</p>
        <p className="mt-1">Progress is automatically tracked and logged to Airtable 📊</p>
      </div>
    </div>
  );
}