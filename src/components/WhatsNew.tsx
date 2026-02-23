import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, Zap, Target, Timer, Lightbulb, TrendingUp, Building2, BarChart3 } from 'lucide-react';

interface ChangelogEntry {
  id: string;
  title: string;
  date: string;
  description: string;
  icon: React.ReactNode;
  isNew?: boolean;
}

const changelogEntries: ChangelogEntry[] = [
  {
    id: 'feeling-lucky',
    title: 'I\'m Feeling Lucky Button',
    date: 'Feb 22',
    description: 'Intelligent problem selection based on your practice history and weak areas',
    icon: <Zap size={20} className="text-yellow-400" />,
    isNew: true
  },
  {
    id: 'pattern-drill',
    title: 'Pattern Drill Mode',
    date: 'Feb 21',
    description: 'Focused practice sessions targeting specific algorithm patterns',
    icon: <Target size={20} className="text-cyan-400" />
  },
  {
    id: 'streak-recovery',
    title: 'Streak Recovery Mode',
    date: 'Feb 20',
    description: 'Get back on track with smart recovery suggestions and motivation',
    icon: <TrendingUp size={20} className="text-green-400" />
  },
  {
    id: 'interview-timer',
    title: 'Interview Timer',
    date: 'Feb 17',
    description: 'Practice under real interview conditions with timed coding sessions',
    icon: <Timer size={20} className="text-orange-400" />
  },
  {
    id: 'ai-hints',
    title: 'AI Hints System',
    date: 'Feb 15',
    description: 'Smart contextual hints to guide you when you\'re stuck',
    icon: <Lightbulb size={20} className="text-purple-400" />
  },
  {
    id: 'progress-dashboard',
    title: 'Progress Dashboard',
    date: 'Feb 14',
    description: 'Comprehensive analytics and insights into your coding practice',
    icon: <BarChart3 size={20} className="text-blue-400" />
  },
  {
    id: 'company-prep',
    title: 'Company Prep Page',
    date: 'Feb 13',
    description: 'Tailored preparation paths for specific companies and interview types',
    icon: <Building2 size={20} className="text-emerald-400" />
  },
  {
    id: 'visualizers-milestone',
    title: '80+ Visualizers Available',
    date: 'Ongoing',
    description: 'Growing collection of interactive algorithm visualizations',
    icon: <Sparkles size={20} className="text-pink-400" />
  }
];

interface WhatsNewProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'algoforge_last_visit';
const DAYS_THRESHOLD = 7;

export function WhatsNew({ isOpen, onClose }: WhatsNewProps) {
  const handleClose = () => {
    // Update last visit timestamp
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                  <Sparkles size={24} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    What's New in AlgoForge
                  </h2>
                  <p className="text-slate-400 text-sm">Latest features and improvements</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Changelog Entries */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {changelogEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-4 p-4 rounded-lg border transition-all ${
                    entry.isNew 
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:border-yellow-400/50' 
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex-shrink-0 p-2 bg-slate-700 rounded-lg">
                    {entry.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{entry.title}</h3>
                      {entry.isNew && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{entry.description}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={12} />
                      <span>{entry.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-700 bg-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  <p>More features coming soon! 🚀</p>
                  <p className="text-xs mt-1">Built for interview success</p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  Got it!
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to check if user should see the What's New modal
export function useWhatsNew() {
  const [shouldShowModal, setShouldShowModal] = useState(false);

  useEffect(() => {
    const checkLastVisit = () => {
      const lastVisit = localStorage.getItem(STORAGE_KEY);
      
      if (!lastVisit) {
        // First time user - don't show modal immediately
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        return;
      }

      const lastVisitTimestamp = parseInt(lastVisit, 10);
      const daysSinceLastVisit = Math.floor((Date.now() - lastVisitTimestamp) / (24 * 60 * 60 * 1000));
      
      if (daysSinceLastVisit >= DAYS_THRESHOLD) {
        setShouldShowModal(true);
      }
    };

    checkLastVisit();
  }, []);

  return {
    shouldShowModal,
    showModal: () => setShouldShowModal(true),
    hideModal: () => setShouldShowModal(false)
  };
}