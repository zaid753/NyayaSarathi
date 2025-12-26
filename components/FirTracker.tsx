import React, { useState } from 'react';
import { Button, Card } from './UiComponents';

interface FirTrackerProps {
  onTrack: (details: string) => void;
  isLoading: boolean;
}

const FirTracker: React.FC<FirTrackerProps> = ({ onTrack, isLoading }) => {
  const [firNumber, setFirNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firNumber.trim() && district.trim()) {
      onTrack(`Track FIR Number: ${firNumber} in District: ${district}, State: ${state}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
          <i className="fas fa-magnifying-glass-location"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">FIR Status Tracker</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track the investigation progress of your filed First Information Report.
        </p>
      </div>

      <Card className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">FIR Number</label>
              <input
                type="text"
                value={firNumber}
                onChange={(e) => setFirNumber(e.target.value)}
                placeholder="e.g. 123/2024"
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">State / UT</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Delhi"
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">District / Police Station</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. South Delhi, Hauz Khas"
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !firNumber.trim() || !district.trim()}
            className="w-full py-3 mt-4"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-search mr-2"></i>}
            Track FIR Status
          </Button>
        </form>
      </Card>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl w-full">
        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
          <i className="fas fa-info-circle"></i> Tracking Information
        </h4>
        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
          The central CCTNS (Crime and Criminal Tracking Network & Systems) portal allows citizens to view FIR status online. 
          You will need to register on your state's digital police portal for full details.
        </p>
      </div>
    </div>
  );
};

export default FirTracker;