"use client"

import { useState } from "react"
import { ShieldCheck, WifiOff } from "lucide-react"
import SuggestionList from "./components/SuggestionList"
import CompanyDetailsCard from "./components/cards/CompanyDetailsCard"
import NotListedCard from "./components/cards/NotListedCard"
import { SearchBar } from "./components/SearchBar"
import { useSearch } from "./hooks/useSearch"
import { useNetworkStatus } from "./hooks/useNetworkStatus"
import type { Company } from "./types"
import { searchCache } from "./utils/cache"

function App() {
  const { query, setQuery, results, loading, hasSearched, error, handleSearch, resetSearch } = useSearch()
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const isOnline = useNetworkStatus()

  const hasCrossReference = results.length > 1 && results.some((r) => r.ui_type === "GOOD" || r.ui_type === "TML")

  const handleClear = () => {
    resetSearch()
    setSelectedCompany(null)
  }

  const handleClearCacheAndSearch = () => {
    searchCache.clear()
    handleSearch(true)
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 flex flex-col items-center justify-start p-4 font-sans">

      {/* OFFLINE INDICATOR */}
      {!isOnline && (
        <div className="w-full max-w-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4 mt-4">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
            <div>
              <p className="text-xs font-bold text-yellow-800 dark:text-yellow-200">You are offline</p>
              <p className="text-[10px] text-yellow-700 dark:text-yellow-300">Showing cached results only.</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT BOX */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 mt-8">

        <header className="flex flex-col items-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Company Checker
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
            Instant Verification System
          </p>
        </header>

        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          onClear={handleClear}
          loading={loading}
        />

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4 leading-relaxed">
          Verify companies across databases
        </p>

        {hasSearched && results.length > 0 && !selectedCompany && (
          <button
            onClick={handleClearCacheAndSearch}
            className="mt-4 w-full text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-all hover:gap-3 py-2"
          >
            <span className="text-base">🔄</span> Refresh Database
          </button>
        )}

        <div className="mt-4 relative">
          {loading && (
            <div className="flex flex-col items-center py-8">
              <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mb-3"></div>
              <span className="text-sm font-semibold text-slate-500 tracking-wide">Searching...</span>
            </div>
          )}

          {!loading && hasSearched && error && (
            <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          {!loading && !error && hasSearched && results.length === 0 && query.trim() !== "" && (
            <NotListedCard query={query} />
          )}

          {!loading && !error && hasSearched && results.length > 0 && !selectedCompany && (
            <SuggestionList results={results} onSelect={setSelectedCompany} />
          )}

          {!loading && selectedCompany && (
            <CompanyDetailsCard
              company={selectedCompany}
              hasCrossReference={hasCrossReference}
              onBack={() => setSelectedCompany(null)}
            />
          )}
        </div>
      </div>

      <footer className="mt-auto py-6 flex flex-col items-center gap-1 text-center opacity-10 select-none">
        <p className="text-slate-500 text-[9px] font-bold tracking-[0.2em]">
          DATABASE UPDATED ON 15TH JANUARY 2026
        </p>
        <p className="text-slate-500 text-[9px] font-medium">
          © 2026 Verification System by{" "}
          <a
            href="https://www.linkedin.com/in/muhammed-ajmal-consultant/"
            className="text-inherit no-underline"
          >
            Muhammed Ajmal
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
