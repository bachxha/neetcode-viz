import React, { createContext, useContext, useEffect, useState } from 'react';

interface BookmarkContextType {
  bookmarks: string[];
  isBookmarked: (problemId: string) => boolean;
  toggleBookmark: (problemId: string) => void;
  bookmarkCount: number;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize bookmarks from localStorage
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neetcode-bookmarks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('neetcode-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const isBookmarked = (problemId: string): boolean => {
    return bookmarks.includes(problemId);
  };

  const toggleBookmark = (problemId: string) => {
    setBookmarks(prev => {
      if (prev.includes(problemId)) {
        // Remove bookmark
        return prev.filter(id => id !== problemId);
      } else {
        // Add bookmark
        return [...prev, problemId];
      }
    });
  };

  const bookmarkCount = bookmarks.length;

  return (
    <BookmarkContext.Provider value={{ bookmarks, isBookmarked, toggleBookmark, bookmarkCount }}>
      {children}
    </BookmarkContext.Provider>
  );
};