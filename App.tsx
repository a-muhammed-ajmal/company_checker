"use client"

import { useState } from "react"
import SuggestionList from "./components/SuggestionList"
import CompanyDetailsCard from "./components/cards/CompanyDetailsCard"
import NotListedCard from "./components/cards/NotListedCard"
import { SearchBar } from "./components/SearchBar"
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
    handleSearch(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-start p-4 sm:p-6 font-sans">
      {/* MAIN CONTENT BOX */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-8 mt-4 sm:mt-10 transition-all">

        {/* HEADER SECTION */}
        <header className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Company Checker
          </h1>
          <p className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-2">
            Securely verify companies against<br />
            <span className="text-blue-600 dark:text-blue-400 font-bold">TML, Good Listed, NTML, and Delisted</span>
          </p>
        </header>

        {/* SEARCH SECTION */}
        <div className="mb-4">
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            onClear={handleClear}
            loading={loading}
          />
        </div>

        {/* REFRESH ACTION */}
        {hasSearched && results.length > 0 && !selectedCompany && (
          <button
            onClick={handleClearCacheAndSearch}
            className="mb-4 w-full text-[10px] uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-colors font-bold"
          >
            <span>🔄</span> Refresh from Database
          </button>
        )}

        {/* RESULTS AREA */}
        <div className="relative min-h-[100px] transition-all duration-300">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3"></div>
              <span className="text-xs font-bold animate-pulse uppercase tracking-tighter">Searching Database...</span>
            </div>
          )}

          {!loading && hasSearched && error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <h3 className="text-red-800 dark:text-red-400 font-bold text-sm mb-1">Search Error</h3>
              <p className="text-red-600 dark:text-red-500 text-[11px] mb-4">{error}</p>
              <button
                onClick={() => handleSearch()}
                className="bg-red-600 text-white text-xs px-5 py-2 rounded-lg font-bold hover:bg-red-700 transition-all"
              >
                Try Again
              </button>
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

      {/* FOOTER SECTION */}
      <footer className="mt-8 mb-6 flex flex-col items-center gap-2 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black tracking-widest uppercase">
          DATABASE UPDATED ON 15TH JANUARY 2026
        </p>
        <div className="flex flex-col gap-1">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium">
            © 2026 Verification System by{" "}
            <a
              href="https://www.linkedin.com/in/muhammed-ajmal-consultant/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline font-bold"
            >
              Muhammed Ajmal
            </a>
          </p>
          <p className="text-slate-300 dark:text-slate-600 text-[9px] font-bold uppercase tracking-tighter">
            © 2024 Compliance Verification System
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
