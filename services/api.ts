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

export const searchOnline = async (query: string): Promise<{
  exactMatch?: { type: 'tml' | 'good', data: CompanyData };
  suggestions: Suggestion[];
}> => {
  const normalized = normalizeText(query);
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  };

  // Parallel fetch for better performance
  const [tmlResponse, goodResponse] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/tml_companies?or=(company_name.ilike.*${query}*,company_name_normalized.eq.${normalized})&limit=5`,
      { headers }
    ),
    fetch(
      `${SUPABASE_URL}/rest/v1/good_companies?or=(employer_name.ilike.*${query}*,employer_name_normalized.eq.${normalized})&limit=5`,
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
    const exact = tmlData.find(c => normalizeText(c.company_name) === normalized);
    if (exact) {
      exactMatch = { type: 'tml', data: exact };
      // Even if exact match found, we might want to return it immediately, 
      // but let's check priorities. TML is highest priority.
      return { exactMatch, suggestions: [] };
    }
    suggestions = [...suggestions, ...tmlData.map(c => ({ ...c, type: 'tml' as const }))];
  }

  // Process Good Data
  if (goodData.length > 0) {
    const exact = goodData.find(c => normalizeText(c.employer_name) === normalized);
    if (exact) {
      // Only set if not already found in TML (TML takes precedence)
      if (!exactMatch) {
        exactMatch = { type: 'good', data: exact };
        return { exactMatch, suggestions: [] };
      }
    }
    suggestions = [...suggestions, ...goodData.map(c => ({ ...c, type: 'good' as const }))];
  }

  return { exactMatch, suggestions };
};

export const searchOffline = (query: string, cachedData: CacheData): {
  exactMatch?: { type: 'tml' | 'good', data: CompanyData };
  offline: boolean;
} => {
  const normalized = normalizeText(query);
  
  const tmlMatch = cachedData.tml.find(c => normalizeText(c.company_name) === normalized);
  if (tmlMatch) {
    return { exactMatch: { type: 'tml', data: tmlMatch }, offline: true };
  }

  const goodMatch = cachedData.good.find(c => normalizeText(c.employer_name) === normalized);
  if (goodMatch) {
    return { exactMatch: { type: 'good', data: goodMatch }, offline: true };
  }

  return { offline: true };
};