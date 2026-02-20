import { useState, useEffect } from 'react';
import { Coffee, Timer, Heart, RefreshCw } from 'lucide-react';
import { problems } from '../data/problems';

interface AirtableRecord {
  id: string;
  fields: {
    Date: string;
    Title?: string;
    Category?: string;
    Difficulty?: string;
    Duration?: number;
    Completion?: string;
  };
}

const AIRTABLE_CONFIG = {
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || '',
  tableId: import.meta.env.VITE_AIRTABLE_TABLE_ID || '',
  apiToken: import.meta.env.VITE_AIRTABLE_TOKEN || ''
};

interface StreakRecoveryProps {
  onSelectProblem?: (problemId: string) => void;
}

export function StreakRecovery({ onSelectProblem }: StreakRecoveryProps) {
  const [daysSinceLastPractice, setDaysSinceLastPractice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  useEffect(() => {
    calculateDaysSinceLastPractice();
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(timer => {
          if (timer <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const calculateDaysSinceLastPractice = async () => {
    try {
      setIsLoading(true);

      if (!AIRTABLE_CONFIG.baseId || !AIRTABLE_CONFIG.tableId || !AIRTABLE_CONFIG.apiToken) {
        setDaysSinceLastPractice(30); // Default fallback
        return;
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableId}?sort[0][field]=Date&sort[0][direction]=desc&pageSize=10`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      const records: AirtableRecord[] = data.records || [];
      
      if (records.length === 0) {
        setDaysSinceLastPractice(30);
        return;
      }

      const validRecords = records.filter(record => record.fields.Date);
      if (validRecords.length === 0) {
        setDaysSinceLastPractice(30);
        return;
      }

      const lastPracticeDate = new Date(validRecords[0].fields.Date);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const lastPracticeDayStart = new Date(
        lastPracticeDate.getFullYear(),
        lastPracticeDate.getMonth(),
        lastPracticeDate.getDate()
      );

      const daysDiff = Math.floor(
        (todayStart.getTime() - lastPracticeDayStart.getTime()) / (24 * 60 * 60 * 1000)
      );

      setDaysSinceLastPractice(daysDiff);
    } catch (error) {
      console.error('Error calculating days since last practice:', error);
      setDaysSinceLastPractice(30); // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const getEasyProblemsFromBeginnerCategories = () => {
    // Focus on Easy problems from beginner-friendly categories
    const beginnerProblems = problems.filter(p => 
      (p.category === 'Arrays & Hashing' || p.category === 'Two Pointers') &&
      p.difficulty === 'Easy' &&
      p.hasVisualization
    );

    // Add some other easy problems with visualizations if we need more variety
    const otherEasyProblems = problems.filter(p => 
      p.difficulty === 'Easy' && 
      p.hasVisualization &&
      !beginnerProblems.includes(p) &&
      ['Sliding Window', 'Stack', 'Binary Search', 'Linked List', 'Trees'].includes(p.category)
    );

    return [...beginnerProblems, ...otherEasyProblems];
  };

  const getRandomEasyProblem = () => {
    const easyProblems = getEasyProblemsFromBeginnerCategories();
    if (easyProblems.length === 0) {
      return 'contains-duplicate'; // fallback
    }
    return easyProblems[Math.floor(Math.random() * easyProblems.length)].id;
  };

  const handleStartQuickDrill = () => {
    const problemId = getRandomEasyProblem();
    setSelectedProblem(problemId);
    setTimer(5 * 60); // 5 minutes in seconds
    setIsTimerRunning(true);

    // Log the session start to Airtable if possible
    trackQuickDrillStart(problemId);

    if (onSelectProblem) {
      onSelectProblem(problemId);
    }
  };

  const trackQuickDrillStart = async (problemId: string) => {
    try {
      if (!AIRTABLE_CONFIG.baseId || !AIRTABLE_CONFIG.tableId || !AIRTABLE_CONFIG.apiToken) {
        return;
      }

      const problem = problems.find(p => p.id === problemId);
      if (!problem) return;

      const record = {
        fields: {
          Date: new Date().toISOString().split('T')[0],
          Title: problem.title,
          Category: problem.category,
          Difficulty: problem.difficulty,
          Duration: 5,
          Intent: 'Streak Recovery Quick Drill',
          Note: `Quick 5-minute drill session after ${daysSinceLastPractice} days away`
        }
      };

      await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(record)
        }
      );
    } catch (error) {
      console.error('Error tracking quick drill start:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWelcomeMessage = () => {
    if (daysSinceLastPractice <= 1) return "Welcome back!";
    if (daysSinceLastPractice <= 7) return "Hey there!";
    if (daysSinceLastPractice <= 14) return "Welcome back!";
    if (daysSinceLastPractice <= 30) return "Good to see you again!";
    return "Welcome back, coding warrior!";
  };

  const getEncouragingMessage = () => {
    if (daysSinceLastPractice <= 7) {
      return "Let's do a quick warm-up to get back into the groove.";
    }
    if (daysSinceLastPractice <= 14) {
      return "No worries about the break - let's ease back in with something fun!";
    }
    if (daysSinceLastPractice <= 30) {
      return "Every expert was once a beginner. Let's start fresh with a gentle problem.";
    }
    return "The best time to start again is now. Let's take it slow and steady.";
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-lg p-6 max-w-md">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="ml-2 text-emerald-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-lg p-6 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Heart className="w-5 h-5 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Streak Recovery</h3>
      </div>

      <div className="text-center mb-6">
        <h4 className="text-xl font-medium text-emerald-300 mb-2">
          {getWelcomeMessage()}
        </h4>
        <p className="text-sm text-slate-300 mb-3">
          It's been <span className="font-bold text-emerald-400">{daysSinceLastPractice}</span> day{daysSinceLastPractice !== 1 ? 's' : ''} since your last session.
        </p>
        <p className="text-sm text-slate-400">
          {getEncouragingMessage()}
        </p>
      </div>

      {isTimerRunning && (
        <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <Timer className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 font-mono text-lg font-bold">
            {formatTime(timer)}
          </span>
          <span className="text-amber-400 text-sm">left</span>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleStartQuickDrill}
          disabled={isTimerRunning}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
        >
          <Coffee className="w-4 h-4" />
          {isTimerRunning ? 'Quick Drill In Progress...' : '5-Minute Quick Drill'}
        </button>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            One easy problem • No pressure • Just for fun
          </p>
        </div>

        {timer === 0 && selectedProblem && !isTimerRunning && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <p className="text-green-400 text-sm">
              Great job! You completed your comeback session! 🎉
            </p>
            <button
              onClick={() => {
                setTimer(0);
                setSelectedProblem(null);
              }}
              className="mt-2 text-xs text-green-400 hover:text-green-300 underline"
            >
              Start another one?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}