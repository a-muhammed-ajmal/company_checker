export type CompanySource =
  | "eib_approved"
  | "payroll_approved"
  | "credit_card_approved"
  | "delisted_company_1"
  | "delisted_company_2"
  | "enbd_approved"
  | "good_listed"

export type UIType = "DELISTED" | "TML" | "GOOD"

// 1. Raw Data Structure (Matches your Supabase DB)
export interface BaseCompanyData {
  id: string | number

  // Potential naming columns
  company_name?: string
  employer_name?: string

  // Normalized columns
  company_name_normalized?: string
  employer_name_normalized?: string

  // Details
  group_name?: string
  category?: string
  legal_status?: string
  establishment_date?: string
  emirate?: string
  industry?: string
  po_box?: string
  comments?: string
  employer_code?: string
  employer_id?: string
  status?: string
  reason?: string
}

// 2. Unified App Object (Used in UI)
export interface Company extends BaseCompanyData {
  // The name to display (resolved from company_name or employer_name)
  displayName: string

  // Logic Fields
  ui_type: UIType
  ui_priority: number // 1 = High, 2 = Medium, 3 = Low
  ui_source_id: CompanySource
  ui_label: string

  // Search Metadata
  match_score?: number
}

export interface Suggestion {
  id: string | number
  company_name?: string
  employer_name?: string
  group_name?: string
  source: CompanySource
}
