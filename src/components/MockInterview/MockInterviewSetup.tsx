import { useState } from 'react';
import { Building2, Clock, Target, Star } from 'lucide-react';

export interface MockInterviewConfig {
  company: string;
  difficulty: 'easy-practice' | 'standard' | 'hard';
  durationMinutes: number;
}

interface Company {
  id: string;
  name: string;
  icon: string;
}

const COMPANIES: Company[] = [
  { id: 'google', name: 'Google', icon: '🔍' },
  { id: 'meta', name: 'Meta', icon: '📘' },
  { id: 'amazon', name: 'Amazon', icon: '📦' },
  { id: 'microsoft', name: 'Microsoft', icon: '🪟' },
  { id: 'apple', name: 'Apple', icon: '🍎' },
  { id: 'netflix', name: 'Netflix', icon: '🎬' },
  { id: 'tesla', name: 'Tesla', icon: '⚡' },
  { id: 'uber', name: 'Uber', icon: '🚗' },
  { id: 'airbnb', name: 'Airbnb', icon: '🏠' },
  { id: 'random', name: 'Random', icon: '🎲' },
];

const DIFFICULTY_OPTIONS = [
  {
    id: 'easy-practice' as const,
    name: 'Easy Practice',
    description: '1 Easy + 1 Medium',
    icon: '📚',
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    problems: '2 problems',
  },
  {
    id: 'standard' as const,
    name: 'Standard',
    description: '2 Medium problems',
    icon: '🎯',
    color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400',
    problems: '2 problems',
  },
  {
    id: 'hard' as const,
    name: 'Hard',
    description: '1 Medium + 1 Hard',
    icon: '💪',
    color: 'from-red-500/20 to-pink-500/20 border-red-500/30 text-red-400',
    problems: '2 problems',
  },
];

interface MockInterviewSetupProps {
  onStartInterview: (config: MockInterviewConfig) => void;
}

export function MockInterviewSetup({ onStartInterview }: MockInterviewSetupProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>('google');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy-practice' | 'standard' | 'hard'>('standard');

  const handleStartInterview = () => {
    const config: MockInterviewConfig = {
      company: selectedCompany,
      difficulty: selectedDifficulty,
      durationMinutes: 45,
    };
    onStartInterview(config);
  };

  const selectedDifficultyOption = DIFFICULTY_OPTIONS.find(opt => opt.id === selectedDifficulty)!;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div 
        className="w-full max-w-2xl p-8 rounded-2xl border shadow-2xl"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎤</div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Mock Interview Setup
          </h1>
          <p className="text-slate-400">
            Simulate real interview conditions with timed coding challenges
          </p>
        </div>

        {/* Company Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Building2 size={20} />
            Choose Company
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COMPANIES.map((company) => (
              <button
                key={company.id}
                onClick={() => setSelectedCompany(company.id)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedCompany === company.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600/50 bg-gray-800/30 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-2">{company.icon}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {company.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Target size={20} />
            Choose Difficulty
          </h2>
          <div className="space-y-3">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedDifficulty(option.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedDifficulty === option.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600/50 bg-gray-800/30 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {option.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-slate-400">
                        {option.problems}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{option.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Interview Details */}
        <div className="mb-8 p-4 rounded-lg border" style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-secondary)'
        }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock size={18} />
            Interview Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Duration:</span>
              <span style={{ color: 'var(--text-primary)' }}>45 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Company:</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {COMPANIES.find(c => c.id === selectedCompany)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Difficulty:</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {selectedDifficultyOption.description}
              </span>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="mb-8 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-yellow-400">
            <Star size={18} />
            Interview Rules
          </h3>
          <ul className="text-sm space-y-2 text-slate-300">
            <li>• Problems are presented one at a time</li>
            <li>• No hints or solutions available during the interview</li>
            <li>• Mark problems as "Done" or "Skip" to proceed</li>
            <li>• Timer turns red when under 10 minutes remain</li>
            <li>• You can review solutions after completion</li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartInterview}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          🚀 Start Mock Interview
        </button>
      </div>
    </div>
  );
}