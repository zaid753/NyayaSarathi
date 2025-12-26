
import React, { useState } from 'react';
import { Button, Card } from './UiComponents';

interface LegalDictionaryProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const LegalDictionary: React.FC<LegalDictionaryProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const commonTerms = [
    'Mens Rea', 'Habeas Corpus', 'Locus Standi', 'Suo Motu', 
    'Cognizable Offense', 'Charge Sheet', 'Amicus Curiae', 'Summons'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(`Define legal term: ${query}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh]">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
          <i className="fas fa-spell-check"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Legal Dictionary</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Understand Indian legal jargon in plain language. Lookup terms used by lawyers, courts, and in official documents.
        </p>
      </div>

      <Card className="w-full max-w-xl p-2 bg-white dark:bg-slate-800 border-2 border-emerald-100 dark:border-slate-700 focus-within:border-emerald-500 transition-all shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search term (e.g. Cognizable)"
            className="flex-1 bg-transparent px-4 py-3 text-lg outline-none text-gray-900 dark:text-white"
          />
          <Button type="submit" disabled={isLoading || !query.trim()} className="rounded-xl !bg-emerald-600 hover:!bg-emerald-700 border-none">
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-book"></i>}
          </Button>
        </form>
      </Card>

      <div className="mt-12 w-full max-w-2xl">
        <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 text-center">Popular Terms</h4>
        <div className="flex flex-wrap justify-center gap-2">
          {commonTerms.map(term => (
            <button
              key={term}
              onClick={() => { setQuery(term); onSearch(`Define legal term: ${term}`); }}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-emerald-400 hover:text-emerald-600 transition-all shadow-sm"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalDictionary;
