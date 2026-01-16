import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseCredentials } from "../constants"
import type { Company, CompanySource, UIType } from "../types"
import { searchCache } from "../utils/cache"

/**
 * Sanitizes user input to prevent injection attacks
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>"'`]/g, "") // Remove potentially dangerous characters
    .replace(/[\r\n]/g, "") // Remove newlines
    .trim()
    .slice(0, 100) // Limit length
}

// ==========================================
// 1. CONFIGURATION
// Corrected Column Names based on your DB schema
// ==========================================

interface TableConfig {
  tableName: CompanySource
  columnName: string
  type: UIType
  priority: number
  label: string
}

const TABLE_CONFIGS: TableConfig[] = [
  // TIER 1: DELISTED (Red Theme)
  {
    tableName: "delisted_company_1",
    columnName: "company_name",
    type: "DELISTED",
    priority: 1,
    label: "Deletion / Suspension: Delisted Employer from Jan08",
  },
  {
    tableName: "delisted_company_2",
    columnName: "company_name",
    type: "DELISTED",
    priority: 2, // Sub-priority within Tier 1
    label: "Deletion / Suspension: Delisted Employer July02 to Dec07",
  },

  // TIER 2: TML (Green Theme)
  {
    tableName: "eib_approved",
    columnName: "company_name",
    type: "TML",
    priority: 3,
    label: "TML: EIB – Approved Employer",
  },
  {
    tableName: "enbd_approved",
    columnName: "company_name",
    type: "TML",
    priority: 4,
    label: "TML: ENBD – Approved Employer",
  },
  {
    tableName: "payroll_approved",
    columnName: "company_name",
    type: "TML",
    priority: 5,
    label: "TML: Payroll Employer",
  },
  {
    tableName: "credit_card_approved",
    columnName: "company_name",
    type: "TML",
    priority: 6,
    label: "TML: Credit Card Approved Employer",
  },

  // TIER 3: GOOD LIST (Blue Theme)
  {
    tableName: "good_listed",
    columnName: "employer_name",
    type: "GOOD",
    priority: 7,
    label: "Good List Company (NTML): Verified Corporate Status",
  },
]

// ==========================================
// 2. LOGIC HELPER: TEXT NORMALIZATION
// ==========================================

/**
 * Normalizes company names to prevent duplicate results from spelling variations
 * - Removes all non-alphanumeric characters
 * - Removes entity types (LLC, FZE, etc.)
 * - Converts & to AND for logical consistency
 * - Converts to lowercase for case-insensitive comparison
 */
function normalizeText(text: string): string {
  if (!text) return ""

  let normalized = text.toLowerCase().trim()

  normalized = normalized.replace(/&/g, "and")

  normalized = normalized.replace(/\b(l\.l\.c|llc|f\.z\.e|fze)\b/gi, "")

  normalized = normalized.replace(/[^a-z0-9\s]/g, "")

  normalized = normalized.replace(/\s+/g, " ").trim()

  return normalized
}

// ==========================================
// 3. LOGIC HELPER: FUZZY MATCHING WITH NORMALIZATION
// ==========================================

/**
 * Calculates match score (0-100) using normalized text
 * - 100: Exact match
 * - 85: Substring match (e.g., "Sobha" in "Sobha Construction LLC")
 * - Token match: Percentage of query words found in target
 * - Threshold: Results below 40 are filtered out
 */
function calculateMatchScore(query: string, targetName: string): number {
  if (!query || !targetName) return 0

  const normalizedQuery = normalizeText(query)
  const normalizedTarget = normalizeText(targetName)

  // 1. Exact Match (normalized)
  if (normalizedQuery === normalizedTarget) return 100

  // 2. Substring Match (e.g. "sobha" inside "sobha construction")
  if (normalizedTarget.includes(normalizedQuery)) return 85

  // 3. Token Match (Word by Word)
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 1)
  const targetWords = normalizedTarget.split(/\s+/)

  if (queryWords.length === 0) return 0

  let matchedWords = 0
  queryWords.forEach((qWord) => {
    if (targetWords.some((tWord) => tWord.includes(qWord))) {
      matchedWords++
    }
  })

  return (matchedWords / queryWords.length) * 100
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout - please check your connection")
    }
    throw error
  }
}

// ==========================================
// 4. LOGIC HELPER: STRICT DUPLICATION HANDLING
// ==========================================

/**
 * Ensures delisted companies are ALWAYS shown when they also appear in good lists
 * - Groups results by normalized name
 * - If both DELISTED and GOOD/TML exist, keeps BOTH with DELISTED first
 * - Never allows GOOD to hide DELISTED entries
 */
function handleDuplicates(results: Company[]): Company[] {
  const groupedByName = new Map<string, Company[]>()

  results.forEach((company) => {
    const normalizedName = normalizeText(company.displayName)
    if (!groupedByName.has(normalizedName)) {
      groupedByName.set(normalizedName, [])
    }
    groupedByName.get(normalizedName)!.push(company)
  })

  const deduplicatedResults: Company[] = []

  groupedByName.forEach((companies) => {
    if (companies.length === 1) {
      // No collision - add as is
      deduplicatedResults.push(companies[0])
    } else {
      // Collision detected - apply strict duplication rules
      const hasDelisted = companies.some((c) => c.ui_type === "DELISTED")
      const hasGoodOrTML = companies.some((c) => c.ui_type === "GOOD" || c.ui_type === "TML")

      if (hasDelisted && hasGoodOrTML) {
        // Sort by priority to determine order (Delisted only first if exact match/high priority)
        companies.sort((a, b) => a.ui_priority - b.ui_priority)
        deduplicatedResults.push(...companies)
      } else {
        // No critical collision - just add all variants
        deduplicatedResults.push(...companies)
      }
    }
  })

  return deduplicatedResults
}

// ==========================================
// 5. MAIN API FUNCTION
// ==========================================

export async function searchCompanies(query: string, forceRefresh = false): Promise<Company[]> {
  // Sanitize input to prevent injection attacks
  const cleanQuery = sanitizeInput(query)
  if (!cleanQuery) return []

  const cacheKey = `search_${cleanQuery.toLowerCase()}`

  // Check cache unless force refresh requested
  if (!forceRefresh) {
    const cached = searchCache.get<Company[]>(cacheKey)
    if (cached) {
      return cached
    }
  }

  if (!hasSupabaseCredentials()) {
    throw new Error(
      "Supabase credentials not configured. Please check your environment variables.",
    )
  }

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  }

  // Search ALL tables in parallel
  const searchPromises = TABLE_CONFIGS.map(async (config) => {
    try {
      // Supabase REST API: Column names with spaces do NOT need quotes in URL parameters
      // Format: Column Name=ilike.*value*
      const searchFilter = `${config.columnName}=ilike.*${cleanQuery}*`
      const url = `${SUPABASE_URL}/rest/v1/${config.tableName}?${searchFilter}&select=*&limit=100`

      const response = await fetchWithTimeout(url, { headers }, 10000)

      if (!response.ok) {
        return []
      }

      const data = await response.json()

      const filteredData = data.filter((item: any) => {
        const name = item[config.columnName] || ""
        if (!name) return false
        const score = calculateMatchScore(cleanQuery, name)
        return score >= 40
      })

      return filteredData.map((item: any) => {
        const name = item[config.columnName] || ""
        const matchScore = calculateMatchScore(cleanQuery, name)
        let dynamicPriority = config.priority

        // Dynamic Priority Logic:
        // 1. Exact Match DELISTED -> Priority 1 (Highest)
        // 2. Partial Match DELISTED -> Priority 99 (Lowest)
        // 3. TML/GOOD -> Keep original priority (Medium)
        if (config.type === "DELISTED") {
          dynamicPriority = matchScore === 100 ? 1 : 99
        }

        return {
          ...item,
          displayName: name,
          ui_type: config.type,
          ui_priority: dynamicPriority,
          ui_source_id: config.tableName,
          ui_label: config.label,
          match_score: matchScore,
        } as Company
      })
    } catch (error) {
      // Silently fail individual table queries
      return []
    }
  })

  const resultsArrays = await Promise.all(searchPromises)
  const allRawResults = resultsArrays.flat()

  const relevantResults = allRawResults.filter((c) => (c.match_score || 0) >= 40)

  relevantResults.sort((a, b) => {
    if (a.ui_priority !== b.ui_priority) {
      return a.ui_priority - b.ui_priority // Lower priority number = higher priority (DELISTED=1 first)
    }
    return (b.match_score || 0) - (a.match_score || 0)
  })

  const deduplicatedResults = handleDuplicates(relevantResults)

  const finalResults = deduplicatedResults.slice(0, 25)

  // Cache results for future requests
  searchCache.set(cacheKey, finalResults)

  return finalResults
}
