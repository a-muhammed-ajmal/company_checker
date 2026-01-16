import React from 'react';
import { Company } from '../types';

interface SuggestionListProps {
  results: Company[];
  onSelect: (company: Company) => void;
}

const SuggestionList: React.FC<SuggestionListProps> = ({ results, onSelect }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden w-full mb-8 animate-scale-in">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          {results.length} {results.length === 1 ? 'Match' : 'Matches'} Found
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto">
        {results.map((item) => (
          <button
            key={`${item.ui_source_id}-${item.id}`}
            onClick={() => onSelect(item)}
            className="w-full text-left px-5 py-4 hover:bg-blue-50 dark:hover:bg-blue-950/20 active:bg-blue-100 dark:active:bg-blue-900/30 transition-all flex justify-between items-center gap-3 group min-h-[60px]"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-snug break-words mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.displayName}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {item.ui_source_id.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>

            <div className="flex-shrink-0">
              {item.ui_type === 'DELISTED' && (
                <span className="inline-flex items-center px-2.5 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-[10px] font-bold rounded-md border border-red-200 dark:border-red-800 uppercase tracking-wide">
                  Delisted
                </span>
              )}
              {item.ui_type === 'TML' && (
                <span className="inline-flex items-center px-2.5 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-md border border-green-200 dark:border-green-800 uppercase tracking-wide">
                  TML
                </span>
              )}
              {item.ui_type === 'GOOD' && (
                <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-md border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
                  Good
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionList;
