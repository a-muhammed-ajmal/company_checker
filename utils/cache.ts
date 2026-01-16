// Cache utility for company search results
// Implements both in-memory and localStorage caching

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class SearchCache {
  private memoryCache = new Map<string, CacheEntry<any>>()
  private readonly CACHE_PREFIX = "company_search_"
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly STORAGE_TTL = 24 * 60 * 60 * 1000 // 24 hours for localStorage

  // Get from cache (checks memory first, then localStorage)
  get<T>(key: string): T | null {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data as T
    }

    // Check localStorage for offline support
    try {
      const storageKey = this.CACHE_PREFIX + key
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored)
        if (!this.isExpired(entry)) {
          // Restore to memory cache
          this.memoryCache.set(key, entry)
          return entry.data
        } else {
          // Remove expired entry
          localStorage.removeItem(storageKey)
        }
      }
    } catch (error) {
      console.error("Cache read error:", error)
    }

    return null
  }

  // Set cache (both memory and localStorage)
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: ttl || this.DEFAULT_TTL,
    }

    // Store in memory
    this.memoryCache.set(key, entry)

    // Store in localStorage for offline access
    try {
      const storageKey = this.CACHE_PREFIX + key
      const storageEntry: CacheEntry<T> = {
        ...entry,
        expiresIn: this.STORAGE_TTL,
      }
      localStorage.setItem(storageKey, JSON.stringify(storageEntry))
    } catch (error) {
      console.error("Cache write error:", error)
    }
  }

  // Check if entry is expired
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.expiresIn
  }

  // Invalidate specific cache key
  invalidate(key: string): void {
    this.memoryCache.delete(key)
    try {
      const storageKey = this.CACHE_PREFIX + key
      localStorage.removeItem(storageKey)
      console.log("[v0] Invalidated cache for key:", key)
    } catch (error) {
      console.error("Cache invalidate error:", error)
    }
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear()
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      console.log("[v0] Cleared all cache")
    } catch (error) {
      console.error("Cache clear error:", error)
    }
  }

  // Get cache stats
  getStats() {
    return {
      memoryEntries: this.memoryCache.size,
      storageEntries: Object.keys(localStorage).filter((k) => k.startsWith(this.CACHE_PREFIX)).length,
    }
  }
}

export const searchCache = new SearchCache()
