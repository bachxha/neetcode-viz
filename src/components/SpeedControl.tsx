import { Zap } from 'lucide-react';

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5×' },
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
];

export function SpeedControl({ speed, onSpeedChange }: SpeedControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Zap size={16} className="text-slate-400" />
      <span className="text-sm text-slate-400">Speed:</span>
      <div className="flex gap-1">
        {SPEED_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSpeedChange(option.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              speed === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            title={`Set speed to ${option.label}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}