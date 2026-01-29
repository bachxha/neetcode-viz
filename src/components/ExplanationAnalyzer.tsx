/**
 * ExplanationAnalyzer Component
 * Analyzes transcript and provides feedback on verbal explanations
 */

import { useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  explanationCheckpoints,
  fillerWords,
  fillerTips,
  checkpointWeights,
  type ExplanationCheckpoint,
} from '../data/verbalCheckpoints';

export interface AnalysisResult {
  checkpointsCovered: string[];
  checkpointsMissed: string[];
  fillerWordCount: number;
  fillerWordsFound: { word: string; count: number }[];
  wordCount: number;
  avgSentenceLength: number;
  score: number;
  feedback: string[];
  detailedCheckpoints: {
    checkpoint: ExplanationCheckpoint;
    covered: boolean;
    matchedKeywords: string[];
  }[];
}

export function analyzeTranscript(transcript: string): AnalysisResult {
  const lowerTranscript = transcript.toLowerCase();
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Analyze checkpoints
  const detailedCheckpoints = explanationCheckpoints.map(checkpoint => {
    const matchedKeywords = checkpoint.keywords.filter(keyword => 
      lowerTranscript.includes(keyword.toLowerCase())
    );
    return {
      checkpoint,
      covered: matchedKeywords.length > 0,
      matchedKeywords,
    };
  });

  const checkpointsCovered = detailedCheckpoints
    .filter(dc => dc.covered)
    .map(dc => dc.checkpoint.id);
  
  const checkpointsMissed = detailedCheckpoints
    .filter(dc => !dc.covered)
    .map(dc => dc.checkpoint.id);

  // Analyze filler words
  const fillerWordsFound: { word: string; count: number }[] = [];
  let fillerWordCount = 0;

  fillerWords.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerTranscript.match(regex);
    if (matches && matches.length > 0) {
      fillerWordsFound.push({ word: filler, count: matches.length });
      fillerWordCount += matches.length;
    }
  });

  // Sort by count
  fillerWordsFound.sort((a, b) => b.count - a.count);

  // Calculate average sentence length
  const avgSentenceLength = sentences.length > 0
    ? Math.round(words.length / sentences.length)
    : 0;

  // Calculate score
  let score = 0;
  detailedCheckpoints.forEach(dc => {
    if (dc.covered) {
      score += checkpointWeights[dc.checkpoint.id] || 0;
    }
  });

  // Penalty for excessive filler words (more than 5% of words)
  const fillerPercentage = words.length > 0 ? fillerWordCount / words.length : 0;
  if (fillerPercentage > 0.05) {
    score = Math.max(0, score - 10);
  } else if (fillerPercentage > 0.1) {
    score = Math.max(0, score - 20);
  }

  // Generate feedback
  const feedback: string[] = [];

  // Positive feedback first
  if (checkpointsCovered.length >= 4) {
    feedback.push('✅ Great coverage! You hit most key points.');
  } else if (checkpointsCovered.length >= 2) {
    feedback.push('👍 Good start! You covered some important points.');
  }

  // Specific missing checkpoint feedback
  const requiredMissing = detailedCheckpoints
    .filter(dc => !dc.covered && dc.checkpoint.importance === 'required')
    .map(dc => dc.checkpoint.label);

  if (requiredMissing.length > 0) {
    feedback.push(`⚠️ Missing required points: ${requiredMissing.join(', ')}`);
  }

  // Filler word feedback
  if (fillerWordCount === 0) {
    feedback.push('🎯 Excellent! No filler words detected.');
  } else if (fillerWordCount <= 3) {
    feedback.push(`💡 Minor filler words (${fillerWordCount}). Almost there!`);
  } else if (fillerWordCount <= 8) {
    feedback.push(`⚠️ ${fillerWordCount} filler words detected. Try pausing instead.`);
  } else {
    feedback.push(`🔴 High filler word count (${fillerWordCount}). Practice pausing instead of filling silence.`);
  }

  // Length feedback
  if (words.length < 50 && checkpointsCovered.length < 4) {
    feedback.push('📝 Your explanation seems brief. Try to elaborate more on your approach.');
  } else if (words.length > 500) {
    feedback.push('📏 Good detail, but consider being more concise for interviews.');
  }

  // Sentence length feedback
  if (avgSentenceLength > 30) {
    feedback.push('💬 Try shorter sentences for clarity.');
  }

  return {
    checkpointsCovered,
    checkpointsMissed,
    fillerWordCount,
    fillerWordsFound,
    wordCount: words.length,
    avgSentenceLength,
    score,
    feedback,
    detailedCheckpoints,
  };
}

interface ExplanationAnalyzerProps {
  transcript: string;
  duration: number; // in seconds
  onRetry?: () => void;
}

export function ExplanationAnalyzer({ transcript, duration, onRetry }: ExplanationAnalyzerProps) {
  const analysis = useMemo(() => analyzeTranscript(transcript), [transcript]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Great!';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Needs Work';
    return 'Keep Practicing';
  };

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="text-center py-6 px-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-slate-700">
        <div className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
          {analysis.score}
        </div>
        <div className="text-xl text-slate-300 mt-2">{getScoreLabel(analysis.score)}</div>
        <div className="flex justify-center gap-6 mt-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {formatDuration(duration)}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            {analysis.wordCount} words
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={14} />
            {analysis.checkpointsCovered.length}/{explanationCheckpoints.length} points
          </div>
        </div>
      </div>

      {/* Checkpoints Grid */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="text-blue-400" size={18} />
          Explanation Checkpoints
        </h3>
        <div className="grid gap-3">
          {analysis.detailedCheckpoints.map(({ checkpoint, covered, matchedKeywords }) => (
            <div
              key={checkpoint.id}
              className={`p-3 rounded-lg border transition-all ${
                covered
                  ? 'bg-green-500/10 border-green-500/30'
                  : checkpoint.importance === 'required'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-slate-700/50 border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${covered ? 'text-green-400' : checkpoint.importance === 'required' ? 'text-red-400' : 'text-slate-500'}`}>
                  {covered ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${covered ? 'text-green-300' : 'text-slate-300'}`}>
                      {checkpoint.label}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      checkpoint.importance === 'required' 
                        ? 'bg-red-500/20 text-red-400' 
                        : checkpoint.importance === 'recommended'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {checkpoint.importance}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{checkpoint.description}</p>
                  {covered && matchedKeywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {matchedKeywords.slice(0, 3).map(kw => (
                        <span key={kw} className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  )}
                  {!covered && (
                    <div className="mt-2 text-xs text-slate-500">
                      💡 {checkpoint.tips[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filler Words Analysis */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className={analysis.fillerWordCount > 5 ? 'text-yellow-400' : 'text-green-400'} size={18} />
          Filler Words ({analysis.fillerWordCount})
        </h3>
        {analysis.fillerWordsFound.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {analysis.fillerWordsFound.map(({ word, count }) => (
                <span
                  key={word}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    count > 3
                      ? 'bg-red-500/20 text-red-400'
                      : count > 1
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  "{word}" × {count}
                </span>
              ))}
            </div>
            <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                <Lightbulb size={14} className="text-yellow-400" />
                Tips to reduce filler words:
              </div>
              <ul className="text-sm text-slate-400 space-y-1">
                {fillerTips.slice(0, 3).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-green-400 text-center py-4">
            🎉 No filler words detected! Great job!
          </div>
        )}
      </div>

      {/* Feedback Summary */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-blue-500/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="text-blue-400" size={18} />
          Feedback
        </h3>
        <ul className="space-y-2">
          {analysis.feedback.map((fb, i) => (
            <li key={i} className="text-slate-300 text-sm">
              {fb}
            </li>
          ))}
        </ul>
      </div>

      {/* Transcript */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="text-slate-400" size={18} />
          Your Transcript
        </h3>
        <div className="p-4 bg-slate-900/50 rounded-lg max-h-48 overflow-y-auto">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {transcript || 'No transcript recorded.'}
          </p>
        </div>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <div className="text-center pt-2">
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default ExplanationAnalyzer;
