import React, { useState } from 'react';
import { Button, Card } from './UiComponents';

interface StationFinderProps {
  onSearch: (query?: string, location?: { latitude: number; longitude: number }) => void;
  isLoading: boolean;
}

const StationFinder: React.FC<StationFinderProps> = ({ onSearch, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLocate = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSearch(undefined, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (err) => {
        setError("Unable to retrieve your location. Try searching by area name.");
        console.error(err);
      },
      { timeout: 10000 }
    );
  };

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
          <i className="fas fa-building-shield"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Station Finder</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Find the nearest police station to report an incident or file a Zero FIR.
        </p>
      </div>

      <Card className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 shadow-xl space-y-6">
        {/* Geolocation Option */}
        <div className="text-center">
          <Button 
            onClick={handleLocate} 
            disabled={isLoading}
            className="w-full py-3 text-base flex items-center justify-center gap-2 mb-2"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-crosshairs"></i>}
            Use My Current Location
          </Button>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">or search by area</span>
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
        </div>

        {/* Text Search Option */}
        <form onSubmit={handleTextSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter City, Area, or Landmark"
            className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
          />
          <Button type="submit" disabled={isLoading || !searchQuery.trim()} className="rounded-xl">
            <i className="fas fa-search"></i>
          </Button>
        </form>
      </Card>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Jurisdiction</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Every police station has a defined geographical area of authority.
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Zero FIR</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            You can file a complaint at ANY station. They must transfer it to the correct one.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StationFinder;