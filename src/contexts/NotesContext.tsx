import React, { createContext, useContext, useEffect, useState } from 'react';

interface NotesContextType {
  notes: Record<string, string>;
  getNote: (problemId: string) => string;
  hasNote: (problemId: string) => boolean;
  updateNote: (problemId: string, note: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize notes from localStorage
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neetcode-notes');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Persist notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('neetcode-notes', JSON.stringify(notes));
  }, [notes]);

  const getNote = (problemId: string): string => {
    return notes[problemId] || '';
  };

  const hasNote = (problemId: string): boolean => {
    return notes[problemId] !== undefined && notes[problemId].trim() !== '';
  };

  const updateNote = (problemId: string, note: string) => {
    setNotes(prev => {
      if (note.trim() === '') {
        // Remove the note if it's empty
        const newNotes = { ...prev };
        delete newNotes[problemId];
        return newNotes;
      } else {
        // Update the note
        return {
          ...prev,
          [problemId]: note
        };
      }
    });
  };

  return (
    <NotesContext.Provider value={{ notes, getNote, hasNote, updateNote }}>
      {children}
    </NotesContext.Provider>
  );
};