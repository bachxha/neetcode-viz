import { useState, useMemo } from 'react';
import { 
  MockInterviewSetup, 
  MockInterviewSession, 
  MockInterviewResults,
} from '../components/MockInterview';
import type { MockInterviewConfig, InterviewResult } from '../components/MockInterview';
import { problems } from '../data/problems';
import type { Problem } from '../data/problems';

type InterviewPhase = 'setup' | 'session' | 'results';

interface MockInterviewPageProps {
  onSelectProblem: (id: string) => void;
  onGoHome: () => void;
}

export function MockInterviewPage({ onSelectProblem, onGoHome }: MockInterviewPageProps) {
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [config, setConfig] = useState<MockInterviewConfig | null>(null);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [results, setResults] = useState<InterviewResult[]>([]);

  // Get problems with visualizations for the interview
  const availableProblems = useMemo(() => {
    return problems.filter(p => p.hasVisualization);
  }, []);

  const selectProblemsForInterview = (config: MockInterviewConfig): Problem[] => {
    const { difficulty } = config;
    
    // Filter by difficulty based on interview type
    let needed: { difficulty: 'Easy' | 'Medium' | 'Hard'; count: number }[] = [];
    
    switch (difficulty) {
      case 'easy-practice':
        needed = [
          { difficulty: 'Easy', count: 1 },
          { difficulty: 'Medium', count: 1 }
        ];
        break;
      case 'standard':
        needed = [
          { difficulty: 'Medium', count: 2 }
        ];
        break;
      case 'hard':
        needed = [
          { difficulty: 'Medium', count: 1 },
          { difficulty: 'Hard', count: 1 }
        ];
        break;
    }

    const selected: Problem[] = [];
    
    for (const req of needed) {
      const matching = availableProblems.filter(
        p => p.difficulty === req.difficulty && !selected.includes(p)
      );
      
      // Shuffle and pick
      const shuffled = [...matching].sort(() => Math.random() - 0.5);
      selected.push(...shuffled.slice(0, req.count));
    }

    // If we couldn't fill all slots, fill with random available problems
    while (selected.length < 2) {
      const remaining = availableProblems.filter(p => !selected.includes(p));
      if (remaining.length === 0) break;
      const random = remaining[Math.floor(Math.random() * remaining.length)];
      selected.push(random);
    }

    return selected;
  };

  const handleStartInterview = (newConfig: MockInterviewConfig) => {
    setConfig(newConfig);
    const selected = selectProblemsForInterview(newConfig);
    setSelectedProblems(selected);
    setPhase('session');
  };

  const handleInterviewComplete = (interviewResults: InterviewResult[]) => {
    setResults(interviewResults);
    setPhase('results');
  };

  const handleTryAgain = () => {
    setConfig(null);
    setSelectedProblems([]);
    setResults([]);
    setPhase('setup');
  };

  switch (phase) {
    case 'setup':
      return <MockInterviewSetup onStartInterview={handleStartInterview} />;
    
    case 'session':
      return (
        <MockInterviewSession
          problems={selectedProblems}
          durationMinutes={config?.durationMinutes || 45}
          onComplete={handleInterviewComplete}
        />
      );
    
    case 'results':
      return (
        <MockInterviewResults
          results={results}
          company={config?.company || 'Unknown'}
          difficulty={config?.difficulty || 'standard'}
          onTryAgain={handleTryAgain}
          onSelectProblem={onSelectProblem}
          onGoHome={onGoHome}
        />
      );
  }
}
