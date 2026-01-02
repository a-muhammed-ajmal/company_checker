import { SUPABASE_URL, SUPABASE_ANON_KEY, CACHE_KEY } from '../constants';
import { CompanyData, CacheData, Suggestion, TMLCompany, GoodCompany } from '../types';

export const normalizeText = (text: string): string => {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

export const getCachedData = (): CacheData => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : { tml: [], good: [] };
  } catch (error) {
    console.error('Error loading cached data:', error);
    return { tml: [], good: [] };
  }
};

export const saveToCache = (type: 'tml' | 'good', company: CompanyData) => {
  try {
    const cached = getCachedData();
    if (type === 'tml') {
      const tmlComp = company as TMLCompany;
      // Simple duplicate check based on name if ID is missing, or ID if present
      const exists = cached.tml.some(c =>
        (c.id && c.id === tmlComp.id) ||
        (c.company_name === tmlComp.company_name)
      );
      if (!exists) cached.tml.push(tmlComp);
    } else {
      const goodComp = company as GoodCompany;
      const exists = cached.good.some(c =>
        (c.id && c.id === goodComp.id) ||
        (c.employer_name === goodComp.employer_name)
      );
      if (!exists) cached.good.push(goodComp);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    return cached;
  } catch (error) {
    console.error('Cache error:', error);
    return getCachedData();
  }
};

const isMatch = (normalizedQuery: string, normalizedDbName: string): boolean => {
  // Exact match
  if (normalizedQuery === normalizedDbName) return true;

  // Containment match with safety length check to avoid false positives on short acronyms
  // "WORLEY ENGINEERING" (db) should match "WORLEY ENGINEERING PTY..." (query)
  if (normalizedQuery.length > 8 && normalizedDbName.length > 3) {
    if (normalizedQuery.includes(normalizedDbName)) return true;
  }

  // Inverse containment: "WORLEY" (query) matches "WORLEY PARSONS" (db)
  // Only if query is sufficiently specific
  if (normalizedQuery.length > 4 && normalizedDbName.length > 8) {
    if (normalizedDbName.includes(normalizedQuery)) return true;
  }

  return false;
};

// Helper to get a broader search term for the API to find potential matches
const getSearchableTerms = (query: string): string => {
  const words = query.trim().split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ');
  }
  return query;
};

export const searchOnline = async (query: string): Promise<{
  exactMatch?: { type: 'tml' | 'good', data: CompanyData };
  suggestions: Suggestion[];
}> => {
  const normalizedQuery = normalizeText(query);
  const apiQuery = getSearchableTerms(query);
  const normalizedApiQuery = normalizeText(apiQuery);

  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  };

  // We search using both the original query and the shortened "apiQuery" to ensure we get candidates.
  // Using OR logic in Supabase filter if possible, or just broader truncated search.
  // Here we use the broader apiQuery to fetch candidates, then filter in memory logic.

  const [tmlResponse, goodResponse] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/tml_companies?or=(company_name.ilike.*${apiQuery}*,company_name_normalized.ilike.*${normalizedApiQuery}*)&limit=10`,
      { headers }
    ),
    fetch(
      `${SUPABASE_URL}/rest/v1/good_companies?or=(employer_name.ilike.*${apiQuery}*,employer_name_normalized.ilike.*${normalizedApiQuery}*)&limit=10`,
      { headers }
    )
  ]);

  if (!tmlResponse.ok || !goodResponse.ok) {
    throw new Error('API request failed');
  }

  const tmlData: TMLCompany[] = await tmlResponse.json();
  const goodData: GoodCompany[] = await goodResponse.json();

  let suggestions: Suggestion[] = [];
  let exactMatch: { type: 'tml' | 'good', data: CompanyData } | undefined;

  // Process TML Data
  if (tmlData.length > 0) {
    // Check for "Exact" match using our improved logic against the FULL original query
    const exact = tmlData.find(c => isMatch(normalizedQuery, normalizeText(c.company_name)));
    if (exact) {
      exactMatch = { type: 'tml', data: exact };
      return { exactMatch, suggestions: [] };
    }
    suggestions = [...suggestions, ...tmlData.map(c => ({ ...c, type: 'tml' as const }))];
  }

  // Process Good Data
  if (goodData.length > 0) {
    const exact = goodData.find(c => isMatch(normalizedQuery, normalizeText(c.employer_name)));
    if (exact) {
      if (!exactMatch) {
         exactMatch = { type: 'good', data: exact };
         return { exactMatch, suggestions: [] };
      }
    }
    suggestions = [...suggestions, ...goodData.map(c => ({ ...c, type: 'good' as const }))];
  }

  // Deduplicate suggestions based on ID or Name
  const uniqueSuggestions: Suggestion[] = [];
  const seen = new Set<string>();

  for (const s of suggestions) {
    const key = s.type === 'tml' ? `tml-${s.company_name}` : `good-${s.employer_name}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSuggestions.push(s);
    }
  }

  return { exactMatch, suggestions: uniqueSuggestions };
};

export const searchOffline = (query: string, cachedData: CacheData): {
  exactMatch?: { type: 'tml' | 'good', data: CompanyData };
  offline: boolean;
} => {
  const normalizedQuery = normalizeText(query);

  const tmlMatch = cachedData.tml.find(c => isMatch(normalizedQuery, normalizeText(c.company_name)));
  if (tmlMatch) {
    return { exactMatch: { type: 'tml', data: tmlMatch }, offline: true };
  }

  const goodMatch = cachedData.good.find(c => isMatch(normalizedQuery, normalizeText(c.employer_name)));
  if (goodMatch) {
    return { exactMatch: { type: 'good', data: goodMatch }, offline: true };
  }

  return { offline: true };
};