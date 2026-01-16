import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseCredentials } from "../constants"
import type { Company, CompanySource, UIType } from "../types"
import { searchCache } from "../utils/cache"

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
  // PRIORITY 1: DELISTED (High Risk) - Red Theme
  {
    tableName: "delisted_company_1",
    columnName: "NAME OF THE COMPANY",
    type: "DELISTED",
    priority: 1,
    label: "Deletion / Suspension: Delisted Employer from Jan08",
  },
  {
    tableName: "delisted_company_2",
    columnName: "NAME OF THE COMPANY",
    type: "DELISTED",
    priority: 1,
    label: "Deletion / Suspension: Delisted Employer July02 to Dec07",
  },

  // PRIORITY 2: TML (Target Market List) - Green Theme
  {
    tableName: "eib_approved",
    columnName: "Name of the Company",
    type: "TML",
    priority: 2,
    label: "TML (Target Market List): EIB - Approved Employer",
  },
  {
    tableName: "payroll_approved",
    columnName: "NAME OF THE COMPANY",
    type: "TML",
    priority: 2,
    label: "TML (Target Market List): Payroll Employer",
  },
  {
    tableName: "credit_card_approved",
    columnName: "NAME OF THE COMPANY",
    type: "TML",
    priority: 2,
    label: "TML (Target Market List): Credit Card Approved Employer",
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
        // Delisted always appears first due to priority sorting
        const delisted = companies.filter((c) => c.ui_type === "DELISTED")
        const goodOrTML = companies.filter((c) => c.ui_type === "GOOD" || c.ui_type === "TML")

        console.log(`[v0] Collision detected for "${companies[0].displayName}" - showing DELISTED first, then GOOD/TML`)

        // Add delisted entries first
        deduplicatedResults.push(...delisted)
        // Then add good/TML entries
        deduplicatedResults.push(...goodOrTML)
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
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const cacheKey = `search_${cleanQuery.toLowerCase()}`

  if (!forceRefresh) {
    const cached = searchCache.get<Company[]>(cacheKey)
    if (cached) {
      console.log("[v0] Cache hit for query:", cleanQuery)
      console.log(
        "[v0] Cached results:",
        cached.map((c) => ({ name: c.displayName, type: c.ui_type, priority: c.ui_priority })),
      )
      return cached
    }
  } else {
    console.log("[v0] Force refresh - bypassing cache for query:", cleanQuery)
  }

  if (!hasSupabaseCredentials()) {
    console.error(
      "[v0] Missing credentials - URL:",
      SUPABASE_URL ? "SET" : "MISSING",
      "KEY:",
      SUPABASE_ANON_KEY ? "SET" : "MISSING",
    )
    throw new Error(
      "Supabase credentials not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Vars section.",
    )
  }

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  }

  console.log("[v0] Searching database for:", cleanQuery)
  console.log("[v0] Using Supabase URL:", SUPABASE_URL)

  // Search ALL tables in parallel
  const searchPromises = TABLE_CONFIGS.map(async (config) => {
    try {
      // Supabase REST API requires double quotes around column names with special chars
      // Format: "Column Name"=ilike.*value*
      const url = `${SUPABASE_URL}/rest/v1/${config.tableName}?select=*&limit=30`

      console.log(`[v0] Fetching from ${config.tableName}, column: ${config.columnName}`)

      const response = await fetchWithTimeout(url, { headers }, 10000)

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`[v0] Error fetching ${config.tableName}: ${response.status} ${response.statusText}`, errorText)
        return []
      }

      const data = await response.json()

      console.log(`[v0] Raw data from ${config.tableName}: ${data.length} rows`)
      if (data.length > 0) {
        console.log(`[v0] Sample row keys from ${config.tableName}:`, Object.keys(data[0]))
        console.log(`[v0] Sample row from ${config.tableName}:`, data[0])
      }

      const filteredData = data.filter((item: any) => {
        const name = item[config.columnName] || ""
        if (!name) return false
        const score = calculateMatchScore(cleanQuery, name)
        return score >= 40
      })

      console.log(`[v0] Filtered ${filteredData.length} results from ${config.tableName} for query "${cleanQuery}"`)

      return filteredData.map((item: any) => {
        const name = item[config.columnName] || ""

        return {
          ...item,
          displayName: name,
          ui_type: config.type,
          ui_priority: config.priority,
          ui_source_id: config.tableName,
          ui_label: config.label,
          match_score: calculateMatchScore(cleanQuery, name),
        } as Company
      })
    } catch (error) {
      console.error(`[v0] Error on ${config.tableName}`, error)
      return []
    }
  })

  const resultsArrays = await Promise.all(searchPromises)
  const allRawResults = resultsArrays.flat()

  console.log("[v0] Total raw results:", allRawResults.length)
  console.log("[v0] Results by type:", {
    DELISTED: allRawResults.filter((r) => r.ui_type === "DELISTED").length,
    TML: allRawResults.filter((r) => r.ui_type === "TML").length,
    GOOD: allRawResults.filter((r) => r.ui_type === "GOOD").length,
  })

  const relevantResults = allRawResults.filter((c) => (c.match_score || 0) >= 40)

  console.log("[v0] After filtering (score >= 40):", relevantResults.length)

  relevantResults.sort((a, b) => {
    if (a.ui_priority !== b.ui_priority) {
      return a.ui_priority - b.ui_priority // Lower priority number = higher priority (DELISTED=1 first)
    }
    return (b.match_score || 0) - (a.match_score || 0)
  })

  console.log(
    "[v0] Top 5 results after sorting:",
    relevantResults.slice(0, 5).map((r) => ({
      name: r.displayName,
      type: r.ui_type,
      priority: r.ui_priority,
      score: r.match_score,
    })),
  )

  const deduplicatedResults = handleDuplicates(relevantResults)

  console.log("[v0] After deduplication:", deduplicatedResults.length)
  console.log(
    "[v0] Final top 5 results:",
    deduplicatedResults.slice(0, 5).map((r) => ({
      name: r.displayName,
      type: r.ui_type,
      priority: r.ui_priority,
      score: r.match_score,
    })),
  )

  const finalResults = deduplicatedResults.slice(0, 25)

  searchCache.set(cacheKey, finalResults)
  console.log("[v0] Cached results for query:", cleanQuery)

  return finalResults
}
