import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Calendar, Clock, TrendingUp, AlertCircle, Target } from 'lucide-react';

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

interface PracticeSession {
  id: string;
  date: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completion: 'Complete' | 'Partial' | 'Review';
}

interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
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
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  '1-D Dynamic Programming',
  'Greedy',
  'Intervals',
];

async function fetchPracticeData(): Promise<PracticeSession[]> {
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
      completion: record.fields.Completion || 'Complete',
    }));
}

function calculateDaysSinceLastPractice(sessions: PracticeSession[]): number {
  if (!sessions.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastPracticeDate = new Date(sessions[0].date);
  lastPracticeDate.setHours(0, 0, 0, 0);
  
  return Math.floor((today.getTime() - lastPracticeDate.getTime()) / (24 * 60 * 60 * 1000));
}

export function PracticeStats() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPracticeData() {
      try {
        setLoading(true);
        setError(null);
        
        if (!AIRTABLE_CONFIG.baseId || !AIRTABLE_CONFIG.tableId || !AIRTABLE_CONFIG.token) {
          throw new Error('Airtable configuration missing');
        }
        
        const data = await fetchPracticeData();
        setSessions(data);
      } catch (err) {
        console.error('Failed to fetch practice data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadPracticeData();
  }, []);

  const stats = useMemo(() => {
    const daysSinceLastPractice = calculateDaysSinceLastPractice(sessions);
    const totalProblems = sessions.filter(s => s.completion === 'Complete').length;
    
    // Category breakdown
    const categoryCount = new Map<string, number>();
    sessions.forEach(session => {
      if (session.completion === 'Complete') {
        const count = categoryCount.get(session.category) || 0;
        categoryCount.set(session.category, count + 1);
      }
    });

    const categoryStats: CategoryStats[] = Array.from(categoryCount.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalProblems > 0 ? Math.round((count / totalProblems) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Show top 5 categories

    // Find weakest category (from the predefined list with 0 problems)
    const weakestCategory = CODING_CATEGORIES.find(category => 
      !categoryCount.has(category)
    ) || CODING_CATEGORIES.find(category => 
      (categoryCount.get(category) || 0) < 2
    );

    return {
      daysSinceLastPractice,
      totalProblems,
      categoryStats,
      weakestCategory,
    };
  }, [sessions]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Practice Stats</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Practice Stats</h3>
        </div>
        <div className="text-center py-4">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-400 mb-2">Connect Airtable</p>
          <p className="text-xs text-slate-400">Check your API configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Practice Stats</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-2xl font-bold text-orange-400">
              {stats.daysSinceLastPractice}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Day{stats.daysSinceLastPractice !== 1 ? 's' : ''} since last
          </p>
        </div>
        
        <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-2xl font-bold text-green-400">
              {stats.totalProblems}
            </span>
          </div>
          <p className="text-xs text-slate-400">Problems solved</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.categoryStats.length > 0 ? (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Top Categories
          </h4>
          <div className="space-y-2">
            {stats.categoryStats.map((category, index) => (
              <div key={category.name} className="flex items-center gap-3">
                <div className="text-xs text-slate-400 w-4">
                  {index + 1}.
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300 truncate">
                      {category.name}
                    </span>
                    <span className="text-xs text-blue-400 font-medium">
                      {category.count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 text-center py-4">
          <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No completed problems yet</p>
          <p className="text-xs text-slate-500">Start practicing to see stats!</p>
        </div>
      )}

      {/* Weakest Category Suggestion */}
      {stats.weakestCategory && stats.totalProblems > 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">
              Focus Area
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Consider practicing{' '}
            <span className="font-medium text-yellow-300">
              {stats.weakestCategory}
            </span>
          </p>
        </div>
      )}

      {/* Data source indicator */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <p className="text-xs text-center text-slate-500">
          📊 Synced with Airtable • {sessions.length} total sessions
        </p>
      </div>
    </div>
  );
}