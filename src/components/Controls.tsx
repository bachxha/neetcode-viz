import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  canStepBack: boolean;
  canStepForward: boolean;
}

export function Controls({
  isPlaying,
  onPlayPause,
  onStepBack,
  onStepForward,
  onReset,
  currentStep,
  totalSteps,
  speed,
  onSpeedChange,
  canStepBack,
  canStepForward,
}: ControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg">
      <button
        onClick={onReset}
        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
        title="Reset"
      >
        <RotateCcw size={20} />
      </button>
      
      <button
        onClick={onStepBack}
        disabled={!canStepBack}
        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Step Back"
      >
        <SkipBack size={20} />
      </button>
      
      <button
        onClick={onPlayPause}
        className="p-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      
      <button
        onClick={onStepForward}
        disabled={!canStepForward}
        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Step Forward"
      >
        <SkipForward size={20} />
      </button>
      
      <div className="flex items-center gap-2 ml-4">
        <span className="text-sm text-slate-400">Speed:</span>
        <input
          type="range"
          min="0.25"
          max="2"
          step="0.25"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-24 accent-blue-500"
        />
        <span className="text-sm w-12">{speed}x</span>
      </div>
      
      <div className="ml-auto text-sm text-slate-400">
        Step {currentStep} / {totalSteps}
      </div>
    </div>
  );
}
