import React from 'react';
import { Company } from '../types';

import { Badge } from './ui/badge';

interface SuggestionListProps {
  results: Company[];
  onSelect: (company: Company) => void;
}

const SuggestionList: React.FC<SuggestionListProps> = ({ results, onSelect }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden w-full mb-6 animate-scale-in">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          {results.length} {results.length === 1 ? 'Match' : 'Matches'} Found
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto">
        {results.map((item) => (
          <button
            key={`${item.ui_source_id}-${item.id}`}
            onClick={() => onSelect(item)}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 active:bg-blue-100 dark:active:bg-blue-900/30 transition-all flex justify-between items-center gap-3 group min-h-[50px]"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white leading-snug break-words mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.displayName}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {item.ui_source_id.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>

            <div className="flex-shrink-0">
              {item.ui_type === 'DELISTED' && (
                <Badge variant="destructive" className="px-2 py-0.5 text-[9px]">DELISTED</Badge>
              )}
              {item.ui_type === 'TML' && (
                <Badge variant="success" className="px-2 py-0.5 text-[9px]">TML</Badge>
              )}
              {item.ui_type === 'GOOD' && (
                <Badge variant="default" className="px-2 py-0.5 text-[9px]">GOOD</Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionList;
