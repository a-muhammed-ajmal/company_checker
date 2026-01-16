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

// Security Enhancement: No fallback values - credentials are required
export const SUPABASE_URL = getEnv("SUPABASE_URL")
export const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY")

// Validate credentials on app startup
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "❌ Missing required environment variables.\n\n" +
      "Please set the following in your .env file:\n" +
      "  - VITE_SUPABASE_URL\n" +
      "  - VITE_SUPABASE_ANON_KEY\n\n" +
      "See .env.example for template.\n\n" +
      "For production deployment (Vercel), add these to Environment Variables."
  )
}

// Helper function to check if credentials are configured
export function hasSupabaseCredentials(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export const CACHE_KEY = "company_checker_data_v2"
