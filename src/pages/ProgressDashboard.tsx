import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Flame,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Target,
  Activity,
  ExternalLink,
  TrendingUp,
  BookOpen,
  Award,
} from 'lucide-react';

interface AirtableRecord {
  id: string;
  fields: {
    Date?: string;
    Title?: string;
    Category?: string;
    Difficulty?: 'Easy' | 'Medium' | 'Hard';
    Link?: string;
    Note?: string;
    Duration?: number;
    Company?: string;
    Intent?: string;
    Completion?: 'Complete' | 'Partial' | 'Review';
  };
}

interface PrepSession {
  id: string;
  date: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration?: number;
  company?: string;
  completion: 'Complete' | 'Partial' | 'Review';
  link?: string;
  note?: string;
}

const AIRTABLE_CONFIG = {
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || 'app63OhDShYVpsoAA',
  tableId: import.meta.env.VITE_AIRTABLE_TABLE_ID || 'tblpafqoG4BjUkbcW',
  token: import.meta.env.VITE_AIRTABLE_TOKEN || '',
};

// NeetCode 150 Categories
const NEETCODE_CATEGORIES = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  '1-D Dynamic Programming',
  '2-D Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation',
];

// Expected problems per category (approximate NeetCode 150 distribution)
const CATEGORY_TOTALS: Record<string, number> = {
  'Arrays & Hashing': 9,
  'Two Pointers': 5,
  'Sliding Window': 6,
  'Stack': 7,
  'Binary Search': 7,
  'Linked List': 11,
  'Trees': 15,
  'Tries': 3,
  'Heap / Priority Queue': 3,
  'Backtracking': 9,
  'Graphs': 7,
  'Advanced Graphs': 6,
  '1-D Dynamic Programming': 10,
  '2-D Dynamic Programming': 11,
  'Greedy': 8,
  'Intervals': 6,
  'Math & Geometry': 8,
  'Bit Manipulation': 5,
};

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-sm text-slate-400 font-medium">{label}</p>
            {subValue && (
              <div className="flex items-center gap-1 mt-1">
                {trend && (
                  <TrendingUp
                    size={12}
                    className={`${
                      trend === 'up'
                        ? 'text-green-400 rotate-0'
                        : trend === 'down'
                        ? 'text-red-400 rotate-180'
                        : 'text-slate-400 rotate-90'
                    }`}
                  />
                )}
                <p className="text-xs text-slate-500">{subValue}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryProgressBar({
  category,
  completed,
  total,
  percentage,
}: {
  category: string;
  completed: number;
  total: number;
  percentage: number;
}) {
  const getBarColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-blue-500';
    if (pct >= 40) return 'bg-yellow-500';
    if (pct >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium truncate pr-2">{category}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {completed}/{total}
          </span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${
              percentage >= 80
                ? 'bg-green-500/20 text-green-400'
                : percentage >= 60
                ? 'bg-blue-500/20 text-blue-400'
                : percentage >= 40
                ? 'bg-yellow-500/20 text-yellow-400'
                : percentage >= 20
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-2 rounded-full ${getBarColor(percentage)}`}
        />
      </div>
    </motion.div>
  );
}

function ActivityHeatmap({ sessions }: { sessions: PrepSession[] }) {
  // Generate last 12 weeks of data
  const generateHeatmapData = () => {
    const weeks = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 83); // 12 weeks ago
    
    const sessionsByDate = sessions.reduce((acc, session) => {
      const date = new Date(session.date).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (let week = 0; week < 12; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);
        const dateStr = currentDate.toDateString();
        const count = sessionsByDate[dateStr] || 0;
        
        weekData.push({
          date: currentDate.toISOString().split('T')[0],
          count,
          day: currentDate.getDay(),
        });
      }
      weeks.push(weekData);
    }
    
    return weeks;
  };

  const weeks = generateHeatmapData();

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-slate-800 border-slate-700';
    if (count === 1) return 'bg-green-500/20 border-green-500/30';
    if (count === 2) return 'bg-green-500/40 border-green-500/50';
    if (count >= 3) return 'bg-green-500/60 border-green-500/70';
    return 'bg-green-500/80 border-green-500/90';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity size={20} className="text-green-400" />
        Weekly Activity Heatmap
      </h3>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm border ${getIntensity(day.count)}`}
                title={`${day.date}: ${day.count} problem${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400 mt-3">
        <span>12 weeks ago</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-slate-800 border border-slate-700" />
            <div className="w-2 h-2 rounded-sm bg-green-500/20 border border-green-500/30" />
            <div className="w-2 h-2 rounded-sm bg-green-500/40 border border-green-500/50" />
            <div className="w-2 h-2 rounded-sm bg-green-500/60 border border-green-500/70" />
            <div className="w-2 h-2 rounded-sm bg-green-500/80 border border-green-500/90" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

function WeakAreasSection({
  categoryProgress,
}: {
  categoryProgress: Array<{
    category: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
}) {
  const weakest = categoryProgress
    .filter(cat => cat.total > 0)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target size={20} className="text-red-400" />
        Focus Areas
      </h3>
      <div className="space-y-3">
        {weakest.map((category, index) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400 font-bold text-sm">
                  {index + 1}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">{category.category}</p>
              <p className="text-sm text-slate-400">
                {category.completed}/{category.total} completed • {Math.round(category.percentage)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-red-400">
                {category.total - category.completed} remaining
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RecentSessionCard({ session, index }: { session: PrepSession; index: number }) {
  const difficultyColors = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const completionColors = {
    Complete: 'bg-green-500/20 text-green-400',
    Partial: 'bg-yellow-500/20 text-yellow-400',
    Review: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-200"
    >
      <div className="flex-shrink-0">
        <CheckCircle2 size={18} className="text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-medium truncate">{session.title}</p>
          <span
            className={`px-2 py-1 rounded text-xs font-medium border ${
              difficultyColors[session.difficulty]
            }`}
          >
            {session.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`px-2 py-1 rounded font-medium ${
              completionColors[session.completion]
            }`}
          >
            {session.completion}
          </span>
          <span className="text-slate-400">{session.category}</span>
          {session.duration && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{session.duration}min</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs text-slate-400">
            {new Date(session.date).toLocaleDateString()}
          </p>
        </div>
        {session.link && (
          <a
            href={session.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </motion.div>
  );
}

async function fetchAirtableData(): Promise<PrepSession[]> {
  if (!AIRTABLE_CONFIG.token) {
    throw new Error('Airtable credentials not configured. Please set VITE_AIRTABLE_TOKEN environment variable.');
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableId}?sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_CONFIG.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const data = await response.json();
  const records: AirtableRecord[] = data.records || [];

  return records
    .filter(record => record.fields.Date && record.fields.Title)
    .map(record => ({
      id: record.id,
      date: record.fields.Date!,
      title: record.fields.Title!,
      category: record.fields.Category || 'Uncategorized',
      difficulty: record.fields.Difficulty || 'Medium',
      duration: record.fields.Duration,
      company: record.fields.Company,
      completion: record.fields.Completion || 'Complete',
      link: record.fields.Link,
      note: record.fields.Note,
    }));
}

function calculateStreak(sessions: PrepSession[]): { current: number; longest: number } {
  if (!sessions.length) return { current: 0, longest: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sessionDates = [...new Set(
    sessions.map(s => new Date(s.date).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Calculate current streak
  let currentStreak = 0;
  let currentDate = new Date(today);

  for (const dateStr of sessionDates) {
    const sessionDate = new Date(dateStr);
    sessionDate.setHours(0, 0, 0, 0);
    
    if (sessionDate.getTime() === currentDate.getTime()) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (sessionDate.getTime() < currentDate.getTime()) {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let tempDate = new Date(sessionDates[0]);

  for (let i = 0; i < sessionDates.length; i++) {
    const currentSessionDate = new Date(sessionDates[i]);
    
    if (i === 0 || tempDate.getTime() - currentSessionDate.getTime() === 24 * 60 * 60 * 1000) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
    
    tempDate = currentSessionDate;
    tempDate.setDate(tempDate.getDate() - 1);
  }

  return { current: currentStreak, longest: longestStreak };
}

function getTimeSinceLastPractice(sessions: PrepSession[]): string {
  if (!sessions.length) return 'Never';
  
  const lastSession = new Date(sessions[0].date);
  const now = new Date();
  const diffMs = now.getTime() - lastSession.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function ProgressDashboard() {
  const [sessions, setSessions] = useState<PrepSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAirtableData();
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalProblems = sessions.filter(s => s.completion === 'Complete').length;
    const streaks = calculateStreak(sessions);
    const timeSinceLastPractice = getTimeSinceLastPractice(sessions);
    
    // Category progress
    const categoryStats = NEETCODE_CATEGORIES.map(category => {
      const completed = sessions.filter(
        s => s.category === category && s.completion === 'Complete'
      ).length;
      const total = CATEGORY_TOTALS[category] || 10; // default to 10 if unknown
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        category,
        completed,
        total,
        percentage,
      };
    });

    // Recent sessions (last 5)
    const recentSessions = sessions.slice(0, 5);

    return {
      totalProblems,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      timeSinceLastPractice,
      categoryProgress: categoryStats,
      recentSessions,
    };
  }, [sessions]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Progress Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Track your NeetCode 150 journey with detailed analytics and insights.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your progress data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Progress Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Track your NeetCode 150 journey with detailed analytics and insights.
          </p>
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-semibold mb-2 text-red-400">Failed to Load Data</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Progress Dashboard
        </h1>
        <p className="text-slate-400 text-lg">
          Track your NeetCode 150 journey with detailed analytics and insights.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Award}
          label="Problems Solved"
          value={stats.totalProblems}
          subValue="completed successfully"
          color="bg-blue-500/20 text-blue-400"
          trend="up"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          subValue="consecutive practice"
          color="bg-orange-500/20 text-orange-400"
          trend={stats.currentStreak > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          icon={Target}
          label="Longest Streak"
          value={`${stats.longestStreak} days`}
          subValue="personal best"
          color="bg-green-500/20 text-green-400"
          trend="neutral"
        />
        <StatCard
          icon={Clock}
          label="Last Practice"
          value={stats.timeSinceLastPractice}
          subValue="time since last session"
          color="bg-purple-500/20 text-purple-400"
          trend="neutral"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Category Progress */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 size={24} className="text-blue-400" />
            Category Progress
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.categoryProgress
              .sort((a, b) => b.percentage - a.percentage)
              .map((category) => (
                <CategoryProgressBar
                  key={category.category}
                  category={category.category}
                  completed={category.completed}
                  total={category.total}
                  percentage={category.percentage}
                />
              ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <WeakAreasSection categoryProgress={stats.categoryProgress} />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 mt-8">
        {/* Weekly Activity Heatmap */}
        <div className="lg:col-span-3 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <ActivityHeatmap sessions={sessions} />
        </div>

        {/* Recent Sessions */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-green-400" />
            Recent Sessions
          </h3>
          {stats.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSessions.map((session, index) => (
                <RecentSessionCard key={session.id} session={session} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Calendar size={40} className="mx-auto mb-3 text-slate-500" />
              <p className="font-medium mb-1">No recent sessions</p>
              <p className="text-sm">Start practicing to see your progress!</p>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-6 bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-xl border border-slate-600/50">
        <h3 className="text-lg font-semibold mb-3 text-slate-200">
          📊 About Your Progress Dashboard
        </h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p>
            <strong className="text-slate-300">Data Source:</strong> Automatically synced from your Airtable tracker with 
            fields: Date, Title, Category, Difficulty, and Completion status.
          </p>
          <p>
            <strong className="text-slate-300">Categories:</strong> Based on the NeetCode 150 problem set, 
            tracking your progress across all major algorithm patterns.
          </p>
          <p>
            <strong className="text-slate-300">Streaks:</strong> Calculated based on consecutive days with completed practice sessions. 
            Keep the momentum going! 🔥
          </p>
        </div>
      </div>
    </div>
  );
}