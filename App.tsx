"use client"

import { useState } from "react"
import SuggestionList from "./components/SuggestionList"
import CompanyDetailsCard from "./components/cards/CompanyDetailsCard"
import NotListedCard from "./components/cards/NotListedCard"
import { useSearch } from "./hooks/useSearch"
import type { Company } from "./types"
import { searchCache } from "./utils/cache"

function App() {
  const { query, setQuery, results, loading, hasSearched, error, handleSearch, resetSearch } = useSearch()

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const hasCrossReference = results.length > 1 && results.some((r) => r.ui_type === "GOOD" || r.ui_type === "TML")

  const handleClear = () => {
    resetSearch()
    setSelectedCompany(null)
  }

  const handleClearCacheAndSearch = () => {
    searchCache.clear()
    console.log("[v0] Cache cleared by user")
    handleSearch(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 flex flex-col items-center">
      {/* SECTION 1: HEADER */}
      <div className="w-full max-w-lg mb-6 text-center mt-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Company Checker</h1>
        <p className="text-gray-500 text-sm mt-1">Instant Verification System</p>
      </div>



      {/* SECTION 2: SEARCH BAR */}
      <div className="w-full max-w-lg relative mb-4 z-20">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter company name..."
            className="w-full p-5 pl-14 rounded-2xl border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none text-lg transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl group-focus-within:text-blue-500 transition-colors">🔍</span>

          {hasSearched && (
            <button
              onClick={handleClear}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold hover:text-red-500 p-2 text-xl"
            >
              ✕
            </button>
          )}

          {!hasSearched && query.trim().length > 1 && (
            <button
              onClick={() => handleSearch()}
              className="absolute right-3 top-2.5 bottom-2.5 bg-blue-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md"
            >
              Check
            </button>
          )}
        </div>

        {hasSearched && results.length > 0 && !selectedCompany && (
          <button
            onClick={handleClearCacheAndSearch}
            className="mt-4 w-full text-xs text-gray-400 hover:text-blue-600 py-2 flex items-center justify-center gap-1 transition-colors font-medium"
            title="Clear cache and refresh results from database"
          >
            <span>🔄</span>
            <span>Refresh from Database (Clear Cache)</span>
          </button>
        )}
      </div>

      {/* SECTION: FOOTER INFO */}
      <div className="flex flex-col items-center gap-1.5 mb-10 text-center animate-fade-in">
        <p className="text-gray-600 text-sm font-bold tracking-wide">Database Updated On: 15th Jan 2026</p>
        <p className="text-gray-400 text-[10px] opacity-60 font-medium tracking-tight uppercase tracking-[0.1em]">© 2026 by Muhammed Ajmal</p>
      </div>

      {/* SECTION 3: RESULTS AREA */}
      <div className="w-full max-w-lg transition-all duration-300 z-10">
        {/* State A: Loading */}
        {loading && (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
            <span className="animate-pulse">Searching database...</span>
          </div>
        )}

        {!loading && hasSearched && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 text-4xl mb-2">⚠️</div>
            <h3 className="text-red-800 font-bold text-lg mb-2">Search Error</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => handleSearch()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* State B: No matches */}
        {!loading && !error && hasSearched && results.length === 0 && query.trim() !== "" && (
          <NotListedCard query={query} />
        )}

        {/* State C: Matches Found */}
        {!loading && !error && hasSearched && results.length > 0 && !selectedCompany && (
          <SuggestionList results={results} onSelect={setSelectedCompany} />
        )}

        {/* State D: Company Selected */}
        {!loading && selectedCompany && (
          <CompanyDetailsCard
            company={selectedCompany}
            hasCrossReference={hasCrossReference}
            onBack={() => setSelectedCompany(null)}
          />
        )}
      </div>
    </div>
  )
}

export default App
