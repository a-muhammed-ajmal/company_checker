import React, { useState, useEffect } from 'react';
import { Search, Building2, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import {
  searchOnline,
  searchOffline,
  getCachedData,
  saveToCache
} from './services/api';
import { ResultCard } from './components/ResultCard';
import { SuggestionList } from './components/SuggestionList';
import { SearchResultState, Suggestion, CacheData, CompanyData } from './types';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResultState>({ status: 'initial' });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [cachedData, setCachedData] = useState<CacheData>({ tml: [], good: [] });

  // Initialize app state
  useEffect(() => {
    setCachedData(getCachedData());
    setOfflineMode(!navigator.onLine);

    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setResult({ status: 'initial' });
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setSuggestions([]);
    setResult({ status: 'loading' });

    try {
      if (offlineMode) {
        const offlineResult = searchOffline(term, cachedData);
        if (offlineResult.exactMatch) {
          setResult({
            status: offlineResult.exactMatch.type,
            company: offlineResult.exactMatch.data,
            exactMatch: true,
            offline: true
          });
        } else {
          setResult({
            status: 'ntml',
            query: term,
            exactMatch: false,
            offline: true
          });
        }
      } else {
        const { exactMatch, suggestions: newSuggestions } = await searchOnline(term);

        if (exactMatch) {
          setResult({
            status: exactMatch.type,
            company: exactMatch.data,
            exactMatch: true
          });
          // Cache the exact match
          const updatedCache = saveToCache(exactMatch.type, exactMatch.data);
          setCachedData(updatedCache);
        } else if (newSuggestions.length > 0) {
          setSuggestions(newSuggestions);
          setResult({ status: 'suggestions', query: term });
        } else {
          setResult({
            status: 'ntml',
            query: term,
            exactMatch: false
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to offline search on error
      if (!offlineMode) {
         // Optionally try offline search immediately if online fails
         const offlineFallback = searchOffline(term, cachedData);
         if (offlineFallback.exactMatch) {
            setResult({
               status: offlineFallback.exactMatch.type,
               company: offlineFallback.exactMatch.data,
               exactMatch: true,
               offline: true, // Indicate this came from offline cache
               message: "Network request failed, but found in cache."
            });
            setLoading(false);
            return;
         }
      }

      setResult({
        status: 'error',
        message: 'Search failed. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const type = suggestion.type;
    // Cast to full CompanyData based on type for safety, though Suggestion is partial
    const company = suggestion as unknown as CompanyData;

    setResult({
      status: type,
      company: company,
      exactMatch: true
    });
    setSuggestions([]);
    setSearchTerm(type === 'tml' ? (suggestion.company_name || '') : (suggestion.employer_name || ''));

    // Cache selection
    const updatedCache = saveToCache(type, company);
    setCachedData(updatedCache);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">

        {/* Connection Status Banner */}
        <div className={`transition-all duration-300 overflow-hidden bg-slate-900 text-white ${offlineMode ? 'max-h-12' : 'max-h-0'}`}>
           <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium">
             <WifiOff className="w-3 h-3 text-orange-400" />
             <span>Offline Mode • Searching Cache</span>
           </div>
        </div>

        {/* Header & Search Section (Sticky-ish feel) */}
        <div className="bg-white px-5 pt-8 pb-4 relative z-10">
          <div className="flex flex-col items-center mb-6 animate-fade-in">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-3">
               <Building2 className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">Company Checker</h1>
             <p className="text-xs text-slate-500 mt-1 font-medium">Instant Verification System</p>
          </div>

          <div className="animate-slide-up delay-100">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                  placeholder="Search company..."
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={() => handleSearch(searchTerm)}
                disabled={loading || !searchTerm.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl py-3 text-sm font-semibold transition-all active:scale-95 shadow-md shadow-blue-600/10 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Status'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 px-5 pb-8 overflow-y-auto">
          <SuggestionList
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
          />

          <ResultCard result={result} />

          {/* Footer Info */}
          <div className="mt-12 text-center pb-4 opacity-60">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              Database Updated: Jan 1st, 2026
            </p>
            <div className="mt-2 text-[10px] text-slate-300">
              v1.0.0 • Secure Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;