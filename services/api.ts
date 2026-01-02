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

const isConfirmedMatch = (normalizedQuery: string, normalizedDbName: string) => {
  // 1. Exact identical match
  if (normalizedQuery === normalizedDbName) return true;

  // 2. Query contains DB Name (User inputs "WORLEY... BRANCH", DB has "WORLEY")
  if (normalizedQuery.length > 8 && normalizedDbName.length > 3) {
    if (normalizedQuery.includes(normalizedDbName)) return true;
  }

  return false;
};

const isSuggestionMatch = (normalizedQuery: string, normalizedDbName: string) => {
    // If confirmed, it's not a suggestion (handled by logic flow)
    if (isConfirmedMatch(normalizedQuery, normalizedDbName)) return false;

    // DB contains Query (User "ZULEKHA", DB "ZULEKHA HOSPITAL")
    if (normalizedDbName.includes(normalizedQuery) && normalizedQuery.length > 3) return true;

    return false;
};

// Helper to get a broader search term
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

  // 1. Find Primary Exact Matches (Priority: TML > Good)
  // We prefer TML, but even if found, we should still look for Good suggestions
  const tmlExact = tmlData.find(c => isConfirmedMatch(normalizedQuery, normalizeText(c.company_name)));

  // If TML Exact Match Found
  if (tmlExact) {
    exactMatch = { type: 'tml', data: tmlExact };
    // Add ALL Good entries as suggestions (both exact and partial) because user might want to know if it's there too
    suggestions = [
        ...goodData.map(c => ({ ...c, type: 'good' as const }))
    ];
  } else {
      // Check Good Exact Match only if TML NOT found
      const goodExact = goodData.find(c => isConfirmedMatch(normalizedQuery, normalizeText(c.employer_name)));
      if (goodExact) {
          exactMatch = { type: 'good', data: goodExact };
          // Add TML partials as suggestions
          suggestions = [
              ...tmlData.map(c => ({ ...c, type: 'tml' as const }))
          ];
      }
  }

  // 2. If NO Exact Match Found at all, collect suggestions from both
  if (!exactMatch) {
      suggestions = [
          ...tmlData.map(c => ({ ...c, type: 'tml' as const })),
          ...goodData.map(c => ({ ...c, type: 'good' as const }))
      ];
  }

  // 3. Deduplicate and clean up suggestions
  // - Remove the item that is currently the "Exact Match" from suggestions list
  const uniqueSuggestions: Suggestion[] = [];
  const seen = new Set<string>();

  // Filter helper
  const isSameAsExact = (s: Suggestion) => {
      if (!exactMatch) return false;
      const sName = s.type === 'tml' ? s.company_name : s.employer_name;
      const eName = exactMatch.data.type === 'tml'
        ? (exactMatch.data as TMLCompany).company_name
        : (exactMatch.data as GoodCompany).employer_name; // Use casted property access if needed or simple check

      // We can check by ID if available or Name
      return sName === (exactMatch.type === 'tml' ? (exactMatch.data as TMLCompany).company_name : (exactMatch.data as GoodCompany).employer_name);
  };

  const exactName = exactMatch
    ? (exactMatch.type === 'tml' ? (exactMatch.data as TMLCompany).company_name : (exactMatch.data as GoodCompany).employer_name)
    : '';

  for (const s of suggestions) {
    const sName = s.type === 'tml' ? s.company_name : s.employer_name;

    // Skip if it's the exact match we are showing
    if (exactMatch && s.type === exactMatch.type && sName === exactName) continue;

    const key = s.type === 'tml' ? `tml-${sName}` : `good-${sName}`;
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

  const tmlMatch = cachedData.tml.find(c => isConfirmedMatch(normalizedQuery, normalizeText(c.company_name)));
  if (tmlMatch) {
    return { exactMatch: { type: 'tml', data: tmlMatch }, offline: true };
  }

  const goodMatch = cachedData.good.find(c => isConfirmedMatch(normalizedQuery, normalizeText(c.employer_name)));
  if (goodMatch) {
    return { exactMatch: { type: 'good', data: goodMatch }, offline: true };
  }

  return { offline: true };
};