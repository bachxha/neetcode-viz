import { X, Keyboard } from 'lucide-react';
import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'Space', description: 'Play / Pause animation' },
  { key: '←', description: 'Step backward' },
  { key: '→', description: 'Step forward' },
  { key: 'R', description: 'Reset animation' },
  { key: 'S', description: 'Toggle speed (0.5x → 1x → 2x)' },
  { key: '?', description: 'Show / Hide this help' },
  { key: 'Esc', description: 'Close any open modal' },
];

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-600">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-slate-300">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm font-mono border border-slate-600">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-6 pt-4 border-t border-slate-600">
          <p className="text-sm text-slate-400 text-center">
            Shortcuts are disabled when typing in input fields
          </p>
        </div>
      </div>
    </div>
  );
}