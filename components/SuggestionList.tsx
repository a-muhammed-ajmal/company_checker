import React from 'react';
import { Company } from '../types';

interface SuggestionListProps {
  results: Company[];
  onSelect: (company: Company) => void;
}

const SuggestionList: React.FC<SuggestionListProps> = ({ results, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_15px_50px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden w-full mb-10 animate-scale-in">
      <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-black text-gray-500 uppercase tracking-widest">
          Found {results.length} possible matches:
        </p>
      </div>

      <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
        {results.map((item) => (
          <button
            key={`${item.ui_source_id}-${item.id}`}
            onClick={() => onSelect(item)}
            className="w-full text-left p-4 hover:bg-blue-50 active:bg-blue-100 transition-colors flex justify-between items-center group"
          >
            <div className="flex-1 pr-2">
              <h4 className="font-bold text-gray-900 text-base leading-snug break-words">
                {item.displayName}
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Source: {item.ui_source_id}
              </p>
            </div>

            <div className="flex-shrink-0">
              {item.ui_type === 'DELISTED' && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded border border-red-200">DELISTED</span>}
              {item.ui_type === 'TML' && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded border border-green-200">TML</span>}
              {item.ui_type === 'GOOD' && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded border border-blue-200">GOOD</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionList;
