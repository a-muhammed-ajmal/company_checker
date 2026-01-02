
// Helper to safely get environment variables across different build systems (Vite, CRA, Next.js)
const getEnv = (key: string) => {
  // Vite support (import.meta.env)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`];
  }
  
  // Create React App / Next.js / Node support
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    if (process.env[`REACT_APP_${key}`]) return process.env[`REACT_APP_${key}`];
    // @ts-ignore
    if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`];
  }
  
  return null;
};

// Use environment variables if available, otherwise fallback to hardcoded values
export const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://cioyfhgzwpciczsppdqo.supabase.co';
export const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'sb_publishable_SJ43W6d_9BIDjgwWAvxneQ_nlu-Pan_';

export const CACHE_KEY = 'company_checker_data';
export const CACHE_INITIAL_STATE = { tml: [], good: [] };
