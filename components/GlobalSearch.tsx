
import React, { useState } from 'react';

interface GlobalSearchProps {
  onSearch: (query: string) => void;
  placeholder: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSearch, placeholder }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery('');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <i className="fas fa-search text-sm"></i>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full py-2.5 pl-10 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-slate-500"
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <button 
            type="submit"
            className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default GlobalSearch;
