export interface TMLCompany {
  id?: number;
  company_name: string;
  company_name_normalized?: string;
  group_name?: string;
  finnone_category?: string;
  legal_status?: string;
  establishment_date?: string;
  emirate?: string;
  industry?: string;
  po_box?: string;
  comments?: string;
  type?: 'tml';
}

export interface GoodCompany {
  id?: number;
  employer_name: string;
  employer_name_normalized?: string;
  employer_code?: string;
  category?: string;
  employer_id?: string;
  type?: 'good';
}

export type CompanyData = TMLCompany | GoodCompany;

// Fix: Use type intersection with Omit to avoid conflict on 'type' property between TMLCompany and GoodCompany partials
export type Suggestion = Omit<Partial<TMLCompany>, 'type'> & Omit<Partial<GoodCompany>, 'type'> & {
  type: 'tml' | 'good';
};

export interface SearchResultState {
  status: 'initial' | 'loading' | 'tml' | 'good' | 'ntml' | 'suggestions' | 'error';
  company?: CompanyData;
  query?: string;
  message?: string;
  exactMatch?: boolean;
  offline?: boolean;
}

export interface CacheData {
  tml: TMLCompany[];
  good: GoodCompany[];
}