import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, BarChart3, Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

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
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || '',
  tableId: import.meta.env.VITE_AIRTABLE_TABLE_ID || '',
  token: import.meta.env.VITE_AIRTABLE_TOKEN || '',
};

const CODING_CATEGORIES = [
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

async function fetchPrepData(): Promise<PrepSession[]> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableId}?sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_CONFIG.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status}`);
  }

  const data = await response.json();
  const records: AirtableRecord[] = data.records || [];

  return records
    .filter(record => record.fields.Date && record.fields.Title)
    .map(record => ({
      id: record.id,
      date: record.fields.Date!,
      title: record.fields.Title!,
      category: record.fields.Category || 'Other',
      difficulty: record.fields.Difficulty || 'Medium',
      duration: record.fields.Duration,
      company: record.fields.Company,
      completion: record.fields.Completion || 'Complete',
      link: record.fields.Link,
      note: record.fields.Note,
    }));
}

function calculatePrepStreak(sessions: PrepSession[]): number {
  if (!sessions.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get unique practice dates in descending order
  const uniqueDates = [...new Set(
    sessions.map(s => new Date(s.date).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let checkDate = new Date(today);

  for (const dateStr of uniqueDates) {
    const practiceDate = new Date(dateStr);
    practiceDate.setHours(0, 0, 0, 0);
    
    if (practiceDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (practiceDate.getTime() < checkDate.getTime()) {
      break; // Found a gap in practice days
    }
  }

  return streak;
}

function StreakDisplay({ streak }: { streak: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <Flame className="text-orange-400" size={28} />
        <div className="text-3xl font-bold text-orange-400">{streak}</div>
        <span className="text-orange-400 text-lg">day{streak !== 1 ? 's' : ''}</span>
      </div>
      <p className="text-slate-300 text-sm">Current prep streak</p>
      {streak === 0 ? (
        <p className="text-slate-400 text-xs mt-1">Start practicing to build your streak!</p>
      ) : (
        <p className="text-slate-400 text-xs mt-1">Keep going! 🔥</p>
      )}
    </motion.div>
  );
}

function CategoryCoverage({ sessions }: { sessions: PrepSession[] }) {
  const categoryStats = useMemo(() => {
    const practiced = new Set(sessions.map(s => s.category));
    
    return CODING_CATEGORIES.map(category => {
      const count = sessions.filter(s => s.category === category).length;
      return {
        name: category,
        practiced: practiced.has(category),
        count,
        percentage: sessions.length > 0 ? Math.round((count / sessions.length) * 100) : 0,
      };
    });
  }, [sessions]);

  const coveragePercentage = Math.round(
    (categoryStats.filter(c => c.practiced).length / CODING_CATEGORIES.length) * 100
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="text-purple-400" size={20} />
          Category Coverage
        </h3>
        <div className="text-purple-400 font-bold text-lg">
          {coveragePercentage}%
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
        {categoryStats.map((category) => (
          <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                category.practiced ? 'bg-green-500' : 'bg-slate-600'
              }`} />
              <span className={`text-sm ${
                category.practiced ? 'text-white' : 'text-slate-400'
              }`}>
                {category.name}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {category.count}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RecentActivity({ sessions }: { sessions: PrepSession[] }) {
  const recentSessions = sessions.slice(0, 8);

  const difficultyColors = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const completionIcons = {
    Complete: CheckCircle2,
    Partial: Clock,
    Review: AlertCircle,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="text-blue-400" size={20} />
        Recent Activity
      </h3>

      {recentSessions.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recentSessions.map((session, index) => {
            const CompletionIcon = completionIcons[session.completion];
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <CompletionIcon size={16} className={
                    session.completion === 'Complete' ? 'text-green-400' :
                    session.completion === 'Partial' ? 'text-yellow-400' : 'text-red-400'
                  } />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{session.title}</span>
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${
                      difficultyColors[session.difficulty]
                    }`}>
                      {session.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{session.category}</span>
                    {session.duration && (
                      <>
                        <span>•</span>
                        <span>{session.duration}m</span>
                      </>
                    )}
                    {session.company && (
                      <>
                        <span>•</span>
                        <span className="text-blue-400">{session.company}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 flex-shrink-0">
                  {new Date(session.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                
                {session.link && (
                  <a
                    href={session.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1 text-slate-400 hover:text-white transition-colors"
                    title="Open problem"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <Calendar size={40} className="mx-auto mb-2 text-slate-500" />
          <p>No prep sessions yet!</p>
          <p className="text-sm">Start logging your practice in Airtable.</p>
        </div>
      )}
    </motion.div>
  );
}

export function PrepDashboard() {
  const [sessions, setSessions] = useState<PrepSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrepData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPrepData();
        setSessions(data);
      } catch (err) {
        console.error('Failed to fetch prep data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadPrepData();
  }, []);

  const prepStreak = useMemo(() => calculatePrepStreak(sessions), [sessions]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Prep Dashboard
          </h1>
          <p className="text-slate-400">Interview preparation progress from Airtable</p>
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
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Prep Dashboard
          </h1>
          <p className="text-slate-400">Interview preparation progress from Airtable</p>
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-semibold mb-2 text-red-400">Connection Error</h2>
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
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Interview Prep Dashboard
        </h1>
        <p className="text-slate-400">
          Track your coding interview progress • {sessions.length} total sessions
        </p>
      </div>

      <div className="space-y-6">
        {/* Prep Streak - Featured prominently */}
        <StreakDisplay streak={prepStreak} />

        {/* Category Coverage and Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <CategoryCoverage sessions={sessions} />
          <RecentActivity sessions={sessions} />
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-400 text-center">
          📊 Connected to Airtable • Syncs automatically with your prep tracker
        </p>
      </div>
    </div>
  );
}