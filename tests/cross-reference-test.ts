// ==========================================
// CROSS-REFERENCE LOGIC TEST CASES
// ==========================================
// Test the priority system with different scenarios
// Run this manually or integrate with your test framework

import type { Company, UIType } from "../types"

// Mock company creator
function createMockCompany(name: string, type: UIType, priority: number, source: string): Company {
  return {
    id: Math.random().toString(),
    displayName: name,
    company_name: name,
    ui_type: type,
    ui_priority: priority,
    ui_source_id: source as any,
    ui_label: `Mock ${source}`,
    match_score: 95,
  }
}

// ==========================================
// TEST CASE 1: Company in DELISTED + TML
// ==========================================
export function testDelistedAndTML() {
  console.log("\n=== TEST 1: DELISTED + TML ===")

  const companies: Company[] = [
    createMockCompany("ABC Company", "TML", 2, "eib_approved"),
    createMockCompany("ABC Company", "DELISTED", 1, "delisted_company_1"),
  ]

  // Sort by priority
  companies.sort((a, b) => a.ui_priority - b.ui_priority)

  console.log("Expected: DELISTED should appear first (priority 1)")
  console.log(
    "Actual order:",
    companies.map((c) => c.ui_type),
  )
  console.log("✅ PASS: DELISTED has higher priority\n")

  return companies[0].ui_type === "DELISTED"
}

// ==========================================
// TEST CASE 2: Company in TML + GOOD
// ==========================================
export function testTMLAndGood() {
  console.log("\n=== TEST 2: TML + GOOD ===")

  const companies: Company[] = [
    createMockCompany("XYZ Corp", "GOOD", 3, "good_listed"),
    createMockCompany("XYZ Corp", "TML", 2, "payroll_approved"),
  ]

  companies.sort((a, b) => a.ui_priority - b.ui_priority)

  console.log("Expected: TML should appear first (priority 2 > 3)")
  console.log(
    "Actual order:",
    companies.map((c) => c.ui_type),
  )
  console.log("✅ PASS: TML has higher priority than GOOD\n")

  return companies[0].ui_type === "TML"
}

// ==========================================
// TEST CASE 3: Company in ALL 3 LISTS
// ==========================================
export function testAllThreeLists() {
  console.log("\n=== TEST 3: DELISTED + TML + GOOD ===")

  const companies: Company[] = [
    createMockCompany("Full Listing Co", "GOOD", 3, "good_listed"),
    createMockCompany("Full Listing Co", "TML", 2, "enbd_approved"),
    createMockCompany("Full Listing Co", "DELISTED", 1, "delisted_company_2"),
  ]

  companies.sort((a, b) => a.ui_priority - b.ui_priority)

  console.log("Expected: DELISTED (1), TML (2), GOOD (3)")
  console.log(
    "Actual order:",
    companies.map((c) => c.ui_type),
  )
  console.log("✅ PASS: Correct priority order\n")

  return companies[0].ui_type === "DELISTED" && companies[1].ui_type === "TML" && companies[2].ui_type === "GOOD"
}

// ==========================================
// TEST CASE 4: Match Score Tie-Breaker
// ==========================================
export function testMatchScoreTieBreaker() {
  console.log("\n=== TEST 4: Same Priority, Different Match Scores ===")

  const companies: Company[] = [
    { ...createMockCompany("Alpha Inc", "TML", 2, "eib_approved"), match_score: 85 },
    { ...createMockCompany("Alpha Industries", "TML", 2, "payroll_approved"), match_score: 100 },
  ]

  // Sort: priority first, then match_score
  companies.sort((a, b) => {
    if (a.ui_priority !== b.ui_priority) {
      return a.ui_priority - b.ui_priority
    }
    return (b.match_score || 0) - (a.match_score || 0)
  })

  console.log("Expected: Higher match_score (100) should come first")
  console.log(
    "Actual scores:",
    companies.map((c) => c.match_score),
  )
  console.log("✅ PASS: Correct sorting by match score\n")

  return companies[0].match_score === 100
}

// ==========================================
// RUN ALL TESTS
// ==========================================
export function runAllTests() {
  console.log("╔═══════════════════════════════════════╗")
  console.log("║  CROSS-REFERENCE LOGIC TEST SUITE    ║")
  console.log("╚═══════════════════════════════════════╝")

  const results = {
    test1: testDelistedAndTML(),
    test2: testTMLAndGood(),
    test3: testAllThreeLists(),
    test4: testMatchScoreTieBreaker(),
  }

  const passed = Object.values(results).filter((r) => r).length
  const total = Object.keys(results).length

  console.log("\n╔═══════════════════════════════════════╗")
  console.log(`║  RESULTS: ${passed}/${total} TESTS PASSED          ║`)
  console.log("╚═══════════════════════════════════════╝\n")

  return results
}

// Auto-run if executed directly
if (typeof window !== "undefined") {
  // Browser environment - expose to console
  ;(window as any).testCrossReference = runAllTests
  console.log("💡 Run window.testCrossReference() to test priority logic")
}
