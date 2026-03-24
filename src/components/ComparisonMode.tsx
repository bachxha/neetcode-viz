import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { ComplexityBadges } from './ComplexityBadge';
import type { AlgorithmComparison } from '../data/comparisons';

// Import visualizers directly for now
import { TwoSumVisualizer } from '../visualizers/TwoSumVisualizer';
import { TwoSumBruteVisualizer } from '../visualizers/TwoSumBrute';
import { LinearSearchVisualizer } from '../visualizers/LinearSearchVisualizer';
import { BinarySearchComparisonVisualizer } from '../visualizers/BinarySearchComparisonVisualizer';
import { ContainerBruteForceVisualizer } from '../visualizers/ContainerBruteForceVisualizer';
import { ContainerTwoPointersVisualizer } from '../visualizers/ContainerTwoPointersVisualizer';

// Visualizer component mapping
const VisualizerComponents: Record<string, React.ComponentType<any>> = {
  TwoSumVisualizer: TwoSumVisualizer,
  TwoSumBruteVisualizer: TwoSumBruteVisualizer,
  LinearSearchVisualizer: LinearSearchVisualizer,
  BinarySearchComparisonVisualizer: BinarySearchComparisonVisualizer,
  ContainerBruteForceVisualizer: ContainerBruteForceVisualizer,
  ContainerTwoPointersVisualizer: ContainerTwoPointersVisualizer,
};

interface ComparisonModeProps {
  comparison: AlgorithmComparison;
  className?: string;
}

interface SyncedVisualizerProps {
  component: React.ComponentType<any>;
  approach: 'bruteForce' | 'optimal';
  comparison: AlgorithmComparison;
}

function SyncedVisualizer({ 
  component: Component, 
  approach, 
  comparison
}: SyncedVisualizerProps) {
  const approachInfo = comparison.approaches[approach];
  
  return (
    <div className="flex-1 min-h-0">
      <div className="bg-slate-800 rounded-t-lg p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">{approachInfo.name}</h3>
          <div className="flex items-center gap-2">
            <ComplexityBadges 
              timeComplexity={approachInfo.timeComplexity}
              spaceComplexity={approachInfo.spaceComplexity}
              size="sm"
            />
          </div>
        </div>
        <p className="text-slate-300 text-sm">{approachInfo.description}</p>
      </div>
      
      <div className="bg-slate-900 rounded-b-lg overflow-hidden">
        <Component />
      </div>
    </div>
  );
}

export function ComparisonMode({ comparison, className = '' }: ComparisonModeProps) {
  // Get visualizer components
  const bruteForceComponent = VisualizerComponents[comparison.approaches.bruteForce.visualizer];
  const optimalComponent = VisualizerComponents[comparison.approaches.optimal.visualizer];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with comparison info */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {comparison.title} - Algorithm Comparison
        </h1>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <ComplexityBadges 
              timeComplexity={comparison.approaches.bruteForce.timeComplexity}
              spaceComplexity={comparison.approaches.bruteForce.spaceComplexity}
              size="md"
            />
            <span className="text-sm">Brute Force</span>
          </div>
          <ArrowRight size={20} className="text-slate-500" />
          <div className="flex items-center gap-2 text-green-400">
            <ComplexityBadges 
              timeComplexity={comparison.approaches.optimal.timeComplexity}
              spaceComplexity={comparison.approaches.optimal.spaceComplexity}
              size="md"
            />
            <span className="text-sm">Optimized</span>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <TrendingUp size={16} />
            Key Insight
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {comparison.keyInsight}
          </p>
        </div>
      </div>

      {/* Synced Controls - TODO: Implement synchronized playback */}
      {/*
      <div className="mb-4">
        <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            title="Reset Both"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={handleStepBack}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Step Back"
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
            title={isPlaying ? 'Pause Both' : 'Play Both'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={handleStepForward}
            disabled={currentStep >= totalSteps - 1}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Step Forward"
          >
            <SkipForward size={20} />
          </button>
          
          <div className="ml-4">
            <SpeedControl speed={speed} onSpeedChange={setSpeed} />
          </div>
          
          <div className="ml-auto text-sm text-slate-400">
            Step {currentStep + 1} / {totalSteps}
          </div>
        </div>
      </div>
      */}

      {/* Side-by-side visualizers */}
      <div className="flex-1 flex gap-6 min-h-0">
        <div className="hidden lg:flex gap-6 w-full">
          {/* Desktop: Side by side */}
          {bruteForceComponent && (
            <SyncedVisualizer
              component={bruteForceComponent}
              approach="bruteForce"
              comparison={comparison}
            />
          )}
          
          {optimalComponent && (
            <SyncedVisualizer
              component={optimalComponent}
              approach="optimal"
              comparison={comparison}
            />
          )}
        </div>

        {/* Mobile: Stacked */}
        <div className="lg:hidden flex flex-col gap-6 w-full">
          {bruteForceComponent && (
            <SyncedVisualizer
              component={bruteForceComponent}
              approach="bruteForce"
              comparison={comparison}
            />
          )}
          
          {optimalComponent && (
            <SyncedVisualizer
              component={optimalComponent}
              approach="optimal"
              comparison={comparison}
            />
          )}
        </div>
      </div>
    </div>
  );
}