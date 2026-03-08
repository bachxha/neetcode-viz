import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, FileText, AlertCircle, CheckCircle, Star, Check, Clock, Settings } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportData {
  [key: string]: any;
}

interface PreviewData {
  bookmarks: number;
  completions: number;
  notes: number;
  timeStats: number;
  settings: number;
}

const EXPORTABLE_KEYS = [
  'neetcode-bookmarks',
  'neetcode-completions', 
  'neetcode-notes',
  'neetcode-time-stats',
  'theme',
  'neetcode-difficulty-filter',
  'neetcode-viz-speed',
  'neetcode-viz-shortcuts-hint-dismissed'
];

export function ExportImportModal({ isOpen, onClose }: ExportImportModalProps) {
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFilename = (): string => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    return `neetcode-viz-backup-${dateStr}.json`;
  };

  const getPreviewData = (data: ImportData): PreviewData => {
    const bookmarks = data['neetcode-bookmarks'] ? JSON.parse(data['neetcode-bookmarks']).length : 0;
    const completions = data['neetcode-completions'] ? JSON.parse(data['neetcode-completions']).length : 0;
    const notes = data['neetcode-notes'] ? Object.keys(JSON.parse(data['neetcode-notes'])).length : 0;
    const timeStats = data['neetcode-time-stats'] ? Object.keys(JSON.parse(data['neetcode-time-stats'])).length : 0;
    
    // Count settings
    let settings = 0;
    if (data['theme']) settings++;
    if (data['neetcode-difficulty-filter']) settings++;
    if (data['neetcode-viz-speed']) settings++;
    if (data['neetcode-viz-shortcuts-hint-dismissed']) settings++;

    return { bookmarks, completions, notes, timeStats, settings };
  };

  const exportData = () => {
    try {
      setIsProcessing(true);
      const exportData: ImportData = {};
      
      // Collect all relevant localStorage data
      EXPORTABLE_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          exportData[key] = value;
        }
      });

      // Add metadata
      const fullExportData = {
        ...exportData,
        _metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          appName: 'neetcode-viz'
        }
      };

      // Convert to JSON and download
      const jsonString = JSON.stringify(fullExportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = generateFilename();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccessToast('Export completed successfully! 💾');
    } catch (error) {
      console.error('Export failed:', error);
      showErrorToast('Export failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showErrorToast('Please select a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate the data structure
        if (!jsonData || typeof jsonData !== 'object') {
          throw new Error('Invalid file format');
        }

        // Check if it's a neetcode-viz backup file
        if (jsonData._metadata?.appName !== 'neetcode-viz') {
          // Still allow import if it contains valid keys
          const hasValidKeys = EXPORTABLE_KEYS.some(key => jsonData.hasOwnProperty(key));
          if (!hasValidKeys) {
            throw new Error('File does not contain valid neetcode-viz data');
          }
        }

        setImportData(jsonData);
      } catch (error) {
        console.error('File parsing failed:', error);
        showErrorToast('Invalid backup file. Please check the file format.');
        setImportData(null);
      }
    };

    reader.onerror = () => {
      showErrorToast('Failed to read the file.');
      setImportData(null);
    };

    reader.readAsText(file);
  };

  const performImport = () => {
    if (!importData) return;

    try {
      setIsProcessing(true);
      let importedCount = 0;

      EXPORTABLE_KEYS.forEach(key => {
        if (importData.hasOwnProperty(key)) {
          if (importMode === 'replace') {
            localStorage.setItem(key, importData[key]);
            importedCount++;
          } else {
            // Merge mode - only for certain keys
            if (key === 'neetcode-bookmarks' || key === 'neetcode-completions') {
              const existing = JSON.parse(localStorage.getItem(key) || '[]');
              const incoming = JSON.parse(importData[key] || '[]');
              const merged = [...new Set([...existing, ...incoming])]; // Remove duplicates
              localStorage.setItem(key, JSON.stringify(merged));
              importedCount++;
            } else if (key === 'neetcode-notes' || key === 'neetcode-time-stats') {
              const existing = JSON.parse(localStorage.getItem(key) || '{}');
              const incoming = JSON.parse(importData[key] || '{}');
              const merged = { ...existing, ...incoming }; // Incoming values overwrite existing
              localStorage.setItem(key, JSON.stringify(merged));
              importedCount++;
            } else {
              // For settings, just overwrite
              localStorage.setItem(key, importData[key]);
              importedCount++;
            }
          }
        }
      });

      // Force page reload to apply all changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      showSuccessToast(`Import completed! ${importedCount} data categories imported. Page will reload...`);
      setImportData(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import failed:', error);
      showErrorToast('Import failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const showSuccessToast = (message: string) => {
    setShowToast({ type: 'success', message });
    setTimeout(() => setShowToast(null), 4000);
  };

  const showErrorToast = (message: string) => {
    setShowToast({ type: 'error', message });
    setTimeout(() => setShowToast(null), 4000);
  };

  const resetImport = () => {
    setImportData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
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
                    <FileText size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      Export/Import Progress
                    </h2>
                    <p className="text-slate-400 text-sm">Backup and restore your learning data</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Export Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Download size={20} className="text-green-400" />
                    Export Your Data
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Download all your progress data including bookmarks, completed problems, notes, and session times.
                  </p>
                  <button
                    onClick={exportData}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={18} />
                    {isProcessing ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-600"></div>

                {/* Import Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Upload size={20} className="text-blue-400" />
                    Import Your Data
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Upload a previously exported backup file to restore your progress.
                  </p>

                  {/* File Input */}
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-all"
                    >
                      <Upload size={18} />
                      Choose Backup File
                    </button>
                  </div>

                  {/* Import Preview */}
                  {importData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 p-4 bg-slate-700/50 border border-slate-600 rounded-lg"
                    >
                      <h4 className="font-medium text-white flex items-center gap-2">
                        <FileText size={16} />
                        Import Preview
                      </h4>
                      
                      {(() => {
                        const preview = getPreviewData(importData);
                        return (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-yellow-400">
                              <Star size={16} />
                              <span>{preview.bookmarks} bookmarks</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                              <Check size={16} />
                              <span>{preview.completions} completed</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-400">
                              <FileText size={16} />
                              <span>{preview.notes} notes</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-400">
                              <Clock size={16} />
                              <span>{preview.timeStats} time records</span>
                            </div>
                            <div className="flex items-center gap-2 text-orange-400 col-span-2">
                              <Settings size={16} />
                              <span>{preview.settings} settings</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Import Mode Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">Import Mode:</label>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="merge"
                              checked={importMode === 'merge'}
                              onChange={(e) => setImportMode(e.target.value as 'merge')}
                              className="text-blue-400"
                            />
                            <span className="text-sm text-slate-300">Merge with existing</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="replace"
                              checked={importMode === 'replace'}
                              onChange={(e) => setImportMode(e.target.value as 'replace')}
                              className="text-red-400"
                            />
                            <span className="text-sm text-slate-300">Replace all</span>
                          </label>
                        </div>
                        <p className="text-xs text-slate-400">
                          {importMode === 'merge' 
                            ? 'Combines imported data with your existing data. Duplicates are removed.' 
                            : 'Replaces all existing data with imported data. This cannot be undone.'}
                        </p>
                      </div>

                      {/* Import Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={performImport}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Upload size={16} />
                          {isProcessing ? 'Importing...' : 'Import Data'}
                        </button>
                        <button
                          onClick={resetImport}
                          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>

                      {importMode === 'replace' && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <AlertCircle size={16} className="text-red-400" />
                          <span className="text-xs text-red-300">
                            Warning: This will permanently replace all your existing data!
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Instructions */}
                <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Instructions:</h4>
                  <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                    <li>Export creates a JSON file with all your progress data</li>
                    <li>Keep your backup files safe - they contain all your learning progress</li>
                    <li>Import "Merge" mode combines data without losing existing progress</li>
                    <li>Import "Replace" mode completely overwrites your current data</li>
                    <li>The page will reload after import to apply all changes</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg z-[60] ${
              showToast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {showToast.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}