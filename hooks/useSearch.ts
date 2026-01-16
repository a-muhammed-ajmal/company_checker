"use client"

import { useState } from "react"
import { searchCompanies } from "../services/api"
import type { Company } from "../types"

export const useSearch = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (forceRefresh = false) => {
    if (!query || !query.trim()) return

    setLoading(true)
    setHasSearched(true)
    setResults([])
    setError(null) // Clear previous errors

    try {
      const data = await searchCompanies(query, forceRefresh)
      setResults(data)
    } catch (error) {
      console.error("Search failed", error)
      const errorMessage = error instanceof Error ? error.message : "Search failed. Please try again."
      setError(errorMessage)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const resetSearch = () => {
    setQuery("")
    setResults([])
    setHasSearched(false)
    setError(null) // Clear errors on reset
  }

  return {
    query,
    setQuery,
    results,
    loading,
    hasSearched,
    error, // Expose error state
    handleSearch,
    resetSearch,
  }
}
