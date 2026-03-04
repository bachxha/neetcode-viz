import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';

interface NotesProps {
  problemId: string;
  className?: string;
}

export function Notes({ problemId, className = '' }: NotesProps) {
  const { getNote, updateNote, hasNote } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  // Load note when component mounts or problemId changes
  useEffect(() => {
    const existingNote = getNote(problemId);
    setNoteText(existingNote);
    setIsOpen(existingNote.trim() !== '');
  }, [problemId, getNote]);

  // Auto-resize textarea
  const autoResizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    autoResizeTextarea();
  }, [noteText, isOpen, autoResizeTextarea]);

  // Debounced save function
  const debouncedSave = useCallback((text: string) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = window.setTimeout(() => {
      updateNote(problemId, text);
      setIsSaving(false);
    }, 1000);
  }, [problemId, updateNote]);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNoteText(value);
    debouncedSave(value);
  };

  // Handle blur (save immediately)
  const handleBlur = () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    updateNote(problemId, noteText);
    setIsSaving(false);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`${className}`}>
      <div 
        className="border rounded-lg overflow-hidden transition-colors"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 p-4 transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          {isOpen ? (
            <ChevronDown
              size={20}
              className="transition-transform"
              style={{ color: 'var(--text-secondary)' }}
            />
          ) : (
            <ChevronRight
              size={20}
              className="transition-transform"
              style={{ color: 'var(--text-secondary)' }}
            />
          )}
          
          <div className="flex items-center gap-2">
            <FileText 
              size={18} 
              style={{ color: hasNote(problemId) ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
            />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Notes
            </span>
            {hasNote(problemId) && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                📝
              </span>
            )}
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            {isSaving && (
              <span 
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Saving...
              </span>
            )}
            <span 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isOpen ? 'Collapse' : 'Expand'}
            </span>
          </div>
        </button>
        
        {isOpen && (
          <div 
            className="transition-colors border-t"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={noteText}
                onChange={handleTextChange}
                onBlur={handleBlur}
                placeholder="Write your notes about this problem here... 

Consider including:
• Key insights or patterns you noticed
• Edge cases to remember
• Time/space complexity analysis
• Different approaches you tried
• Common mistakes to avoid"
                className="w-full px-3 py-2 rounded-lg border resize-none outline-none transition-colors focus:ring-2 focus:ring-blue-500/50 text-sm leading-relaxed"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-primary)',
                  minHeight: '120px'
                }}
                rows={noteText.split('\n').length || 5}
              />
              
              <div 
                className="mt-3 text-xs flex justify-between items-center"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>
                  Notes are automatically saved as you type
                </span>
                <span>
                  {noteText.trim().length} characters
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}