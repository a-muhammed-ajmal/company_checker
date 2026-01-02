import React from 'react';
import { Info, ChevronRight, Building } from 'lucide-react';
import { Suggestion } from '../types';

interface SuggestionListProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
}

export const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions, onSelect }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
        <Info className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-bold text-gray-900">Did you mean one of these?</h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${index}`}
            onClick={() => onSelect(suggestion)}
            className="group w-full text-left p-4 bg-gray-50 hover:bg-white hover:shadow-md hover:border-blue-200 rounded-xl transition-all duration-200 border border-transparent"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className={`p-2 rounded-lg flex-shrink-0 ${suggestion.type === 'tml' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Building className="w-5 h-5" />
                 </div>
                 <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate pr-2">
                      {suggestion.type === 'tml' ? suggestion.company_name : suggestion.employer_name}
                    </p>
                    {suggestion.type === 'tml' && suggestion.group_name && (
                      <p className="text-xs text-gray-500 truncate">{suggestion.group_name}</p>
                    )}
                 </div>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  suggestion.type === 'tml' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {suggestion.type === 'tml' ? 'TML' : 'GOOD'}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};