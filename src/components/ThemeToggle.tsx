import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg border transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-primary)',
        color: 'var(--text-primary)',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun
          size={20}
          className={`absolute inset-0 transform transition-all duration-300 ${
            theme === 'light'
              ? 'rotate-0 opacity-100 scale-100'
              : 'rotate-90 opacity-0 scale-50'
          }`}
        />
        {/* Moon icon */}
        <Moon
          size={20}
          className={`absolute inset-0 transform transition-all duration-300 ${
            theme === 'dark'
              ? 'rotate-0 opacity-100 scale-100'
              : '-rotate-90 opacity-0 scale-50'
          }`}
        />
      </div>
    </button>
  );
};