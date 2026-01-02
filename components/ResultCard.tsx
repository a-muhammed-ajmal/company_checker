import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DetailRow } from './DetailRow';
import { SearchResultState, TMLCompany, GoodCompany } from '../types';

interface ResultCardProps {
  result: SearchResultState;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  if (result.status === 'error') {
    return (
      <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-red-900 mb-1">Error Occurred</h3>
          <p className="text-red-700">{result.message}</p>
        </div>
      </div>
    );
  }

  if (result.status === 'ntml') {
    return (
      <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm animate-fade-in">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-1">NOT LISTED</h3>
          <p className="text-red-600 font-medium text-sm">Company not found in TML or Good List</p>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-red-100 shadow-md">
          <p className="text-gray-700 text-center">
            No records found for <span className="font-bold text-gray-900">"{result.query}"</span>
            {result.offline && (
              <span className="block mt-3 text-orange-600 bg-orange-50 py-2 px-3 rounded-lg text-sm font-medium">
                ⚠️ Offline Mode: Search limited to cached data
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  if (result.status === 'tml' && result.company) {
    const company = result.company as TMLCompany;
    return (
      <div className="mt-6 p-4 md:p-6 bg-green-50 border border-green-200 rounded-2xl shadow-md animate-fade-in">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-1">TML LISTED</h3>
          <p className="text-green-700 font-medium text-sm">High Priority Established Firm</p>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-green-100 shadow-md">
          <DetailRow label="Company Name" value={company.company_name} />
          {company.group_name && <DetailRow label="Group" value={company.group_name} />}
          {company.finnone_category && <DetailRow label="Category" value={company.finnone_category} />}
          {company.legal_status && <DetailRow label="Legal Status" value={company.legal_status} />}
          {company.establishment_date && <DetailRow label="Established" value={company.establishment_date} />}
          {company.emirate && <DetailRow label="Emirate" value={company.emirate} />}
          {company.industry && <DetailRow label="Industry" value={company.industry} />}
          {company.po_box && <DetailRow label="P.O. Box" value={company.po_box} />}
          {company.comments && (
            <div className="pt-4 mt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Comments</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed">{company.comments}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (result.status === 'good' && result.company) {
    const company = result.company as GoodCompany;
    return (
      <div className="mt-6 p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-md animate-fade-in">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-1">GOOD LIST</h3>
          <p className="text-blue-700 font-medium text-sm">Verified Corporate Status</p>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-md">
          <DetailRow label="Employer Name" value={company.employer_name} />
          {company.employer_code && <DetailRow label="Employer Code" value={company.employer_code} />}
          {company.category && <DetailRow label="Category" value={company.category} />}
          {company.employer_id && <DetailRow label="Employer ID" value={company.employer_id} />}
        </div>
      </div>
    );
  }

  return null;
};