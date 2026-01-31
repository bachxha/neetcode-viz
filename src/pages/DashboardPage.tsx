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
} from 'lucide-react';

interface DashboardPageProps {
  onSelectProblem: (problemId: string) => void;
}

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

const CATEGORIES = [
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

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-lg p-4 border border-slate-700"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-slate-400">{label}</p>
          {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
        </div>
      </div>
    </motion.div>
  );
}

function CategoryCoverageBar({
  category,
  practiced,
}: {
  category: string;
  practiced: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full ${
          practiced ? 'bg-green-500' : 'bg-slate-600'
        }`}
      />
      <span
        className={`text-sm flex-1 ${
          practiced ? 'text-white' : 'text-slate-400'
        }`}
      >
        {category}
      </span>
    </div>
  );
}

function RecentSessionCard({ session }: { session: PrepSession }) {
  const difficultyColors = {
    Easy: 'bg-green-500/20 text-green-400',
    Medium: 'bg-yellow-500/20 text-yellow-400',
    Hard: 'bg-red-500/20 text-red-400',
  };

  const completionColors = {
    Complete: 'bg-green-500/20 text-green-400',
    Partial: 'bg-yellow-500/20 text-yellow-400',
    Review: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
    >
      <div className="flex-shrink-0">
        <CheckCircle2 size={16} className="text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium truncate">{session.title}</p>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              difficultyColors[session.difficulty]
            }`}
          >
            {session.difficulty}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              completionColors[session.completion]
            }`}
          >
            {session.completion}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{session.category}</span>
          {session.company && (
            <>
              <span>•</span>
              <span className="text-blue-400">{session.company}</span>
            </>
          )}
          {session.duration && (
            <>
              <span>•</span>
              <span>{session.duration}min</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-xs text-slate-500">
        {new Date(session.date).toLocaleDateString()}
      </div>
      {session.link && (
        <a
          href={session.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-1 text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      )}
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

function calculateStreak(sessions: PrepSession[]): number {
  if (!sessions.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sessionDates = [...new Set(
    sessions.map(s => new Date(s.date).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let currentDate = new Date(today);

  for (const dateStr of sessionDates) {
    const sessionDate = new Date(dateStr);
    sessionDate.setHours(0, 0, 0, 0);
    
    if (sessionDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (sessionDate.getTime() < currentDate.getTime()) {
      // Gap in streak
      break;
    }
  }

  return streak;
}

export function DashboardPage({}: DashboardPageProps) {
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
    const totalProblems = sessions.length;
    const completedProblems = sessions.filter(s => s.completion === 'Complete').length;
    const streak = calculateStreak(sessions);
    
    // Category coverage
    const practicedCategories = new Set(sessions.map(s => s.category));
    const categoryProgress = CATEGORIES.map(cat => ({
      category: cat,
      practiced: practicedCategories.has(cat),
      count: sessions.filter(s => s.category === cat).length,
    }));

    // Recent sessions (last 10)
    const recentSessions = sessions.slice(0, 10);

    return {
      totalProblems,
      completedProblems,
      streak,
      categoryProgress,
      recentSessions,
      completionRate: totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0,
    };
  }, [sessions]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Prep Dashboard</h1>
          <p className="text-slate-400">
            Track your coding interview preparation progress.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your prep data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Prep Dashboard</h1>
          <p className="text-slate-400">
            Track your coding interview preparation progress.
          </p>
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-semibold mb-2 text-red-400">Failed to Load Data</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Prep Dashboard</h1>
        <p className="text-slate-400">
          Track your coding interview preparation progress powered by Airtable.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={CheckCircle2}
          label="Problems Completed"
          value={stats.completedProblems}
          subValue={`${stats.completionRate}% completion rate`}
          color="bg-green-500/20 text-green-400"
        />
        <StatCard
          icon={Activity}
          label="Total Attempts"
          value={stats.totalProblems}
          subValue="sessions logged"
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.streak} day${stats.streak !== 1 ? 's' : ''}`}
          subValue="consecutive practice"
          color="bg-orange-500/20 text-orange-400"
        />
        <StatCard
          icon={Target}
          label="Category Coverage"
          value={`${stats.categoryProgress.filter(c => c.practiced).length}/${CATEGORIES.length}`}
          subValue="categories practiced"
          color="bg-purple-500/20 text-purple-400"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="md:col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            Recent Practice Sessions
          </h2>
          {stats.recentSessions.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stats.recentSessions.map((session) => (
                <RecentSessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Calendar size={40} className="mx-auto mb-2 text-blue-400" />
              <p>No practice sessions yet!</p>
              <p className="text-sm">Start logging your prep sessions in Airtable.</p>
            </div>
          )}
        </div>

        {/* Category Coverage */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 max-h-96 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-400" />
            Category Coverage
          </h2>
          <div className="space-y-2">
            {stats.categoryProgress
              .sort((a, b) => b.count - a.count)
              .map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <CategoryCoverageBar
                    category={category.category}
                    practiced={category.practiced}
                  />
                  <span className="text-xs text-slate-500 ml-2">
                    {category.count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h3 className="text-sm font-semibold mb-2 text-slate-300">How it works:</h3>
        <p className="text-xs text-slate-400">
          This dashboard automatically syncs with your Airtable interview prep tracker. 
          Log your practice sessions with Date, Title, Category, Difficulty, and Completion status 
          to see your progress here. Your streak is calculated based on consecutive days with entries.
        </p>
      </div>
    </div>
  );
}