const getEnv = (key: string, fallback?: string) => {
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[`VITE_${key}`]) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`]
  }
  // @ts-ignore
  if (typeof process !== "undefined" && process.env) {
    // @ts-ignore
    if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`]
  }
  return fallback || null
}

export const SUPABASE_URL = getEnv("SUPABASE_URL", "")
export const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY", "")

// Helper function to check if credentials are configured
export function hasSupabaseCredentials(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export const CACHE_KEY = "company_checker_data_v2"

if (!hasSupabaseCredentials()) {
  console.warn(
    "Missing Supabase credentials. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables",
  )
}
