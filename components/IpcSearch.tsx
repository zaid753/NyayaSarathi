import React, { useState } from 'react';
import { Button, Card } from './UiComponents';

interface IpcSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const IpcSearch: React.FC<IpcSearchProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] md:min-h-[50vh]">
      <div className="text-center mb-8 max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-2xl mb-4 text-2xl">
          <i className="fas fa-book-open"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">IPC & Legal Section Explainer</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Enter an Indian Penal Code section (e.g., "420", "302") or a legal concept to get a simplified explanation, punishment details, and citations.
        </p>
      </div>

      <Card className="w-full max-w-xl p-2 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search IPC Section (e.g. 378 Theft)"
            className="flex-1 bg-transparent px-4 py-3 text-lg outline-none text-gray-900 dark:text-white placeholder-gray-400"
            autoFocus
          />
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()} 
            className="rounded-lg px-6"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
          </Button>
        </form>
      </Card>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
        {['Section 420', 'Section 302', 'Defamation', 'Cyber Stalking'].map((tag) => (
          <button
            key={tag}
            onClick={() => { setQuery(tag); onSearch(tag); }}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IpcSearch;