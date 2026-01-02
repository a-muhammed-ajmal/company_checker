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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 font-sans">
      <div className="max-w-3xl mx-auto pt-8 pb-16">
        
        {/* Connection Status Banner (if offline) */}
        <div className={`transition-all duration-300 overflow-hidden ${offlineMode ? 'max-h-16 mb-6' : 'max-h-0'}`}>
           <div className="bg-orange-100 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm">
             <WifiOff className="w-5 h-5" />
             <span className="font-medium">You are offline. Searching in cached database.</span>
           </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg mb-6 transform transition-transform hover:scale-105 duration-300">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Company Checker
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-lg mx-auto">
            Instantly verify company status against TML and Good lists.
          </p>
          
          <div className="absolute top-0 right-0 hidden md:block">
            {offlineMode ? (
              <WifiOff className="w-6 h-6 text-gray-400" />
            ) : (
              <Wifi className="w-6 h-6 text-green-500" />
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 p-2 mb-8 border border-white/50 backdrop-blur-sm">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
              placeholder="Enter company name to verify..."
              className="block w-full pl-12 pr-4 py-4 md:py-5 bg-transparent border-2 border-transparent focus:border-blue-100 rounded-xl text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
               <button
                onClick={() => handleSearch(searchTerm)}
                disabled={loading || !searchTerm.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2.5 font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Check'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          <SuggestionList 
            suggestions={suggestions} 
            onSelect={handleSuggestionSelect} 
          />
          
          <ResultCard result={result} />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 font-medium">
            Cached Entries: {cachedData.tml.length + cachedData.good.length}
          </p>
          <div className="mt-2 text-xs text-gray-300">
            Secure Database Access • v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;