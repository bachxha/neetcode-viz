import { useState, useEffect } from 'react';
import { Flame, Calendar, Play, AlertCircle, BarChart3 } from 'lucide-react';

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

interface StreakData {
  currentStreak: number;
  daysSinceLastPractice: number;
  totalSessions: number;
  lastPracticeDate: Date | null;
}

const AIRTABLE_CONFIG = {
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || '',
  tableId: import.meta.env.VITE_AIRTABLE_TABLE_ID || '',
  apiToken: import.meta.env.VITE_AIRTABLE_TOKEN || ''
};

interface PrepStreakProps {
  onSelectProblem?: (problemId: string) => void;
}

export function PrepStreak({ onSelectProblem }: PrepStreakProps) {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    daysSinceLastPractice: 0,
    totalSessions: 0,
    lastPracticeDate: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAirtableData();
  }, []);

  const fetchAirtableData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if environment variables are configured
      if (!AIRTABLE_CONFIG.baseId || !AIRTABLE_CONFIG.tableId || !AIRTABLE_CONFIG.apiToken) {
        throw new Error('Airtable configuration missing. Please check environment variables.');
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableId}?sort[0][field]=Date&sort[0][direction]=desc&pageSize=100`,
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
      
      const streakData = calculateStreak(records);
      setStreakData(streakData);
    } catch (err) {
      console.error('Error fetching Airtable data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = (records: AirtableRecord[]): StreakData => {
    if (records.length === 0) {
      return {
        currentStreak: 0,
        daysSinceLastPractice: 0,
        totalSessions: 0,
        lastPracticeDate: null
      };
    }

    // Parse and sort dates
    const validRecords = records
      .filter(record => record.fields.Date)
      .map(record => ({
        ...record,
        parsedDate: new Date(record.fields.Date)
      }))
      .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

    if (validRecords.length === 0) {
      return {
        currentStreak: 0,
        daysSinceLastPractice: 0,
        totalSessions: 0,
        lastPracticeDate: null
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastPracticeDate = validRecords[0].parsedDate;
    const lastPracticeDay = new Date(
      lastPracticeDate.getFullYear(),
      lastPracticeDate.getMonth(),
      lastPracticeDate.getDate()
    );

    // Calculate days since last practice
    const daysSinceLastPractice = Math.floor(
      (today.getTime() - lastPracticeDay.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // If last practice was today, start counting
    if (daysSinceLastPractice === 0) {
      checkDate = new Date(today);
    } 
    // If last practice was yesterday, start counting from yesterday
    else if (daysSinceLastPractice === 1) {
      checkDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    }
    // If more than 1 day ago, streak is broken
    else {
      return {
        currentStreak: 0,
        daysSinceLastPractice,
        totalSessions: validRecords.length,
        lastPracticeDate
      };
    }

    // Count consecutive days
    const uniqueDates = new Set<string>();
    validRecords.forEach(record => {
      const dateStr = new Date(
        record.parsedDate.getFullYear(),
        record.parsedDate.getMonth(),
        record.parsedDate.getDate()
      ).toISOString().split('T')[0];
      uniqueDates.add(dateStr);
    });

    const sortedUniqueDates = Array.from(uniqueDates).sort().reverse();

    for (const dateStr of sortedUniqueDates) {
      const checkDateStr = checkDate.toISOString().split('T')[0];
      if (dateStr === checkDateStr) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    return {
      currentStreak,
      daysSinceLastPractice,
      totalSessions: validRecords.length,
      lastPracticeDate
    };
  };

  const getMotivationalMessage = () => {
    const { currentStreak, daysSinceLastPractice } = streakData;
    
    if (isLoading) return "Loading your progress...";
    if (error) return "Unable to load streak data";
    
    if (daysSinceLastPractice === 0) {
      if (currentStreak === 1) {
        return "🎯 Great start! You practiced today!";
      } else {
        return `🔥 ${currentStreak} day streak! You're on fire!`;
      }
    } else if (daysSinceLastPractice === 1) {
      if (currentStreak > 0) {
        return `🔥 ${currentStreak} day streak! Keep it going!`;
      } else {
        return "⚡ Yesterday was productive! Start a new streak!";
      }
    } else if (daysSinceLastPractice <= 3) {
      return `⏰ ${daysSinceLastPractice} days since last practice. Time to code!`;
    } else if (daysSinceLastPractice <= 7) {
      return `😴 ${daysSinceLastPractice} days since last practice. Let's get back to it!`;
    } else {
      return `💤 ${daysSinceLastPractice} days since last practice. Time to wake up!`;
    }
  };

  const getRandomProblem = () => {
    // Focus on problems with visualizations for better experience
    const visualizedProblems = [
      'two-sum', 'valid-parentheses', 'best-time-to-buy-and-sell-stock',
      'contains-duplicate', 'product-of-array-except-self', 'group-anagrams',
      'longest-substring-without-repeating', '3sum', 'container-with-most-water',
      'merge-intervals', 'subsets', 'combination-sum', 'climbing-stairs',
      'coin-change', 'number-of-islands', 'binary-tree-level-order',
      'invert-binary-tree', 'maximum-depth-of-binary-tree', 'reverse-linked-list'
    ];
    
    return visualizedProblems[Math.floor(Math.random() * visualizedProblems.length)];
  };

  const handleStartSession = () => {
    const randomProblem = getRandomProblem();
    if (onSelectProblem) {
      onSelectProblem(randomProblem);
    } else {
      alert(`Starting session with: ${randomProblem}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          {streakData.currentStreak > 0 ? (
            <Flame className="w-5 h-5 text-orange-400" />
          ) : (
            <Calendar className="w-5 h-5 text-purple-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-white">Prep Streak</h3>
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-red-400 mb-4">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Failed to load data</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {isLoading ? '-' : streakData.currentStreak}
              </div>
              <div className="text-xs text-slate-400">
                Day{streakData.currentStreak !== 1 ? 's' : ''} Streak
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {isLoading ? '-' : streakData.totalSessions}
              </div>
              <div className="text-xs text-slate-400">
                Total Sessions
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-center text-slate-300">
              {getMotivationalMessage()}
            </p>
            {streakData.lastPracticeDate && (
              <p className="text-xs text-center text-slate-500 mt-1">
                Last practice: {streakData.lastPracticeDate.toLocaleDateString()}
              </p>
            )}
          </div>
        </>
      )}

      <button
        onClick={handleStartSession}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
      >
        <Play className="w-4 h-4" />
        {isLoading ? 'Loading...' : 'Start Session'}
      </button>

      <button
        onClick={fetchAirtableData}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-300 text-sm rounded-lg transition-all disabled:cursor-not-allowed"
      >
        <BarChart3 className="w-4 h-4" />
        Refresh Data
      </button>
    </div>
  );
}