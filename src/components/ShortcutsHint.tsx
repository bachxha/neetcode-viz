import { X, Keyboard } from 'lucide-react';

interface ShortcutsHintProps {
  show: boolean;
  onDismiss: () => void;
}

export function ShortcutsHint({ show, onDismiss }: ShortcutsHintProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 pr-8 shadow-lg max-w-xs">
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
          title="Dismiss hint"
        >
          <X size={14} />
        </button>
        
        <div className="flex items-center gap-2">
          <Keyboard size={16} className="text-blue-400" />
          <span className="text-sm text-slate-300">
            Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs font-mono border border-slate-600">?</kbd> for keyboard shortcuts
          </span>
        </div>
      </div>
    </div>
  );
}