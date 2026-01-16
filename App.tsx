"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-start p-4 font-['Figtree']">

      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 p-6 mt-6">

        <header className="flex flex-col items-center mb-5">
          <ShieldCheck className="w-8 h-8 text-blue-600 mb-2" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Company Checker
          </h1>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
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

        <p className="text-[10px] text-slate-400 text-center mt-3 px-4 leading-normal">
          Securely verify companies against<br />
          TML, Good Listed, NTML, and Delisted
        </p>

        {hasSearched && results.length > 0 && !selectedCompany && (
          <button
            onClick={handleClearCacheAndSearch}
            className="mt-4 w-full text-[9px] font-bold text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors"
          >
            🔄 Refresh from Database
          </button>
        )}

        <div className="mt-5 relative min-h-[50px]">
          {loading && (
            <div className="flex flex-col items-center py-4">
              <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-2"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Searching...</span>
            </div>
          )}

          {!loading && hasSearched && error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 rounded-xl p-4 text-center">
              <p className="text-red-600 text-[10px] font-bold">{error}</p>
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
