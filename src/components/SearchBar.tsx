import { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search problems...", 
  className = "" 
}: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounced search with 300ms delay
  const debouncedOnChange = useCallback(
    debounce(onChange, 300),
    [onChange]
  );

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div 
      className={`relative flex items-center ${className}`}
    >
      <div className="absolute left-3 pointer-events-none">
        <Search 
          size={18} 
          style={{ color: 'var(--text-muted)' }}
        />
      </div>
      
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)',
        }}
      />
      
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-full transition-all duration-200 hover:bg-gray-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          title="Clear search"
        >
          <X 
            size={16} 
            style={{ color: 'var(--text-muted)' }}
          />
        </button>
      )}
    </div>
  );
};

// Simple debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}