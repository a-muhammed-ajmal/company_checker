"use client"

import { useState, useEffect, useRef } from "react"
import { searchCompanies } from "../services/api"
import type { Company } from "../types"

const SEARCH_TIMEOUT = 10000 // 10 seconds

export const useSearch = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleSearch = async (forceRefresh = false) => {
    if (!query || !query.trim()) return

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setLoading(true)
    setHasSearched(true)
    setResults([])
    setError(null)

    // Set timeout for search operation
    timeoutRef.current = setTimeout(() => {
      setLoading(false)
      setError("Search timeout. Please check your connection and try again.")
    }, SEARCH_TIMEOUT)

    try {
      const data = await searchCompanies(query, forceRefresh)

      // Clear timeout on success
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      setResults(data)
      setLoading(false)
    } catch (error) {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      const errorMessage = error instanceof Error ? error.message : "Search failed. Please try again."
      setError(errorMessage)
      setResults([])
      setLoading(false)
    }
  }

  const resetSearch = () => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setQuery("")
    setResults([])
    setHasSearched(false)
    setError(null)
  }

  return {
    query,
    setQuery,
    results,
    loading,
    hasSearched,
    error,
    handleSearch,
    resetSearch,
  }
}
