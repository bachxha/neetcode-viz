import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  ExternalLink,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Target,
  TrendingUp,
  Star
} from 'lucide-react';
import companyQuestionsData from '../data/company-questions.json';
import type { CompanyQuestionsData, Question, CompanySummary } from '../data/company-questions.types';

interface CompanyPrepPageProps {
  selectedCompany?: string;
  onSelectCompany?: (companyName: string | null) => void;
}

// Highlighted companies based on requirements
const TARGET_COMPANIES = [
  'Google', 'Amazon', 'Meta', 'Airbnb', 'Netflix', 
  'Anduril', 'Coinbase', 'Apple', 'Microsoft'
];

type DifficultyFilter = 'All' | 'Easy' | 'Medium' | 'Hard';
type SortType = 'frequency' | 'acceptance';
type SortOrder = 'asc' | 'desc';

function DifficultyBadge({ difficulty }: { difficulty: Question['difficulty'] }) {
  const colors = {
    EASY: 'bg-green-500/20 text-green-400 border-green-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    HARD: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  const labels = {
    EASY: 'Easy',
    MEDIUM: 'Medium', 
    HARD: 'Hard',
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium border ${colors[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
}

function QuestionCard({ 
  question, 
  companyFrequency 
}: { 
  question: Question; 
  companyFrequency: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-white hover:text-blue-300 transition-colors">
              <a 
                href={question.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {question.title}
              </a>
            </h3>
            <a
              href={question.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {companyFrequency.toFixed(1)}% frequency
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {(question.acceptanceRate * 100).toFixed(1)}% acceptance
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {question.topics.map((topic, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-300"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompanySelector({
  companies,
  selectedCompany,
  onSelectCompany,
  searchTerm,
  onSearchChange
}: {
  companies: CompanySummary[];
  selectedCompany: string | null;
  onSelectCompany: (company: string | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) {
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const targetCompanies = filteredCompanies.filter(c => 
    TARGET_COMPANIES.includes(c.name)
  );
  const otherCompanies = filteredCompanies.filter(c => 
    !TARGET_COMPANIES.includes(c.name)
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-400"
        />
      </div>
      
      <div className="max-h-64 overflow-y-auto space-y-1">
        <button
          onClick={() => onSelectCompany(null)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            selectedCompany === null
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:bg-slate-700'
          }`}
        >
          All Companies ({companies.length})
        </button>
        
        {targetCompanies.length > 0 && (
          <>
            <div className="px-3 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Star size={12} className="text-yellow-400" />
              Target Companies
            </div>
            {targetCompanies.map((company) => (
              <button
                key={company.name}
                onClick={() => onSelectCompany(company.name)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCompany === company.name
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{company.name}</span>
                  <span className="text-xs text-slate-400">
                    {company.questionCount} questions
                  </span>
                </div>
              </button>
            ))}
          </>
        )}
        
        {otherCompanies.length > 0 && (
          <>
            <div className="px-3 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Other Companies
            </div>
            {otherCompanies.map((company) => (
              <button
                key={company.name}
                onClick={() => onSelectCompany(company.name)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCompany === company.name
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{company.name}</span>
                  <span className="text-xs text-slate-400">
                    {company.questionCount} questions
                  </span>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export function CompanyPrepPage({ selectedCompany, onSelectCompany }: CompanyPrepPageProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [sortType, setSortType] = useState<SortType>('frequency');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  const data = companyQuestionsData as CompanyQuestionsData;
  
  // Sort companies by question count (descending)
  const sortedCompanies = useMemo(() => {
    return [...data.companySummary].sort((a, b) => b.questionCount - a.questionCount);
  }, [data.companySummary]);
  
  // Filter and sort questions for selected company
  const filteredQuestions = useMemo(() => {
    let questions = data.questions;
    
    // Filter by selected company
    if (selectedCompany) {
      questions = questions.filter(q => 
        q.companies.some(c => c.name === selectedCompany)
      );
    }
    
    // Filter by difficulty
    if (difficultyFilter !== 'All') {
      questions = questions.filter(q => q.difficulty === difficultyFilter.toUpperCase());
    }
    
    // Sort questions
    const sorted = [...questions].sort((a, b) => {
      let aValue: number, bValue: number;
      
      if (sortType === 'frequency') {
        const aCompany = selectedCompany 
          ? a.companies.find(c => c.name === selectedCompany)
          : null;
        const bCompany = selectedCompany 
          ? b.companies.find(c => c.name === selectedCompany)
          : null;
        
        aValue = aCompany?.frequency || a.maxFrequency;
        bValue = bCompany?.frequency || b.maxFrequency;
      } else {
        aValue = a.acceptanceRate;
        bValue = b.acceptanceRate;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return sorted;
  }, [data.questions, selectedCompany, difficultyFilter, sortType, sortOrder]);
  
  const selectedCompanyData = selectedCompany 
    ? sortedCompanies.find(c => c.name === selectedCompany)
    : null;
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
          Company Interview Prep
        </h1>
        <p className="text-slate-400 text-lg mb-4">
          Browse LeetCode problems filtered by company interview frequency
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-blue-400 font-bold">{data.totalQuestions}</span>
            <span className="text-slate-400"> total questions</span>
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-cyan-400 font-bold">{data.totalCompanies}</span>
            <span className="text-slate-400"> companies</span>
          </div>
          {selectedCompany && (
            <div className="px-4 py-2 bg-slate-800 rounded-lg">
              <span className="text-purple-400 font-bold">{filteredQuestions.length}</span>
              <span className="text-slate-400"> filtered questions</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="text-blue-400" size={20} />
              <h2 className="text-lg font-semibold">Companies</h2>
            </div>
            
            <CompanySelector
              companies={sortedCompanies}
              selectedCompany={selectedCompany || null}
              onSelectCompany={onSelectCompany || (() => {})}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Selected Company Info */}
          {selectedCompany && selectedCompanyData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-6 mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Building2 className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCompany}</h2>
                  <p className="text-slate-400">{selectedCompanyData.questionCount} interview questions</p>
                </div>
                {TARGET_COMPANIES.includes(selectedCompany) && (
                  <div className="ml-auto">
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium">
                      <Star size={14} />
                      Target Company
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Filters */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-slate-400" size={18} />
                <span className="text-sm font-medium text-slate-300">Filters:</span>
              </div>
              
              {/* Difficulty Filter */}
              <div className="flex items-center gap-1">
                {(['All', 'Easy', 'Medium', 'Hard'] as DifficultyFilter[]).map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setDifficultyFilter(difficulty)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      difficultyFilter === difficulty
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium text-slate-300">Sort by:</span>
                <button
                  onClick={() => setSortType(sortType === 'frequency' ? 'acceptance' : 'frequency')}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  {sortType === 'frequency' ? (
                    <>
                      <TrendingUp size={14} />
                      Frequency
                    </>
                  ) : (
                    <>
                      <Target size={14} />
                      Acceptance Rate
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  {sortOrder === 'desc' ? <SortDesc size={18} /> : <SortAsc size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => {
                const companyInfo = selectedCompany 
                  ? question.companies.find(c => c.name === selectedCompany)
                  : question.companies.reduce((max, curr) => 
                      curr.frequency > max.frequency ? curr : max
                    );
                
                return (
                  <QuestionCard 
                    key={question.title}
                    question={question} 
                    companyFrequency={companyInfo?.frequency || question.maxFrequency}
                  />
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-2">No questions found</div>
                <p className="text-sm text-slate-500">
                  Try adjusting your filters or selecting a different company
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}