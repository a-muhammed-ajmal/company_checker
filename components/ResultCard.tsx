
import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Building2 } from 'lucide-react';
import { DetailRow } from './DetailRow';
import { SearchResultState, TMLCompany, GoodCompany } from '../types';

interface ResultCardProps {
  result: SearchResultState;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  if (result.status === 'error') {
    return (
      <div className="mt-4 animate-scale-in">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Error Occurred</h3>
          <p className="text-gray-500 text-xs">{result.message}</p>
        </div>
      </div>
    );
  }

  if (result.status === 'ntml') {
    return (
      <div className="mt-4 animate-slide-up">
        {/* Status Header */}
        <div className="bg-white rounded-t-2xl shadow-sm border-x border-t border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Not Listed</h3>
          <p className="text-gray-500 text-xs mt-1">Company not found in our records</p>
        </div>

        {/* Details Content */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 p-5 mt-[-1px]">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
             <p className="text-xs text-gray-600">
                No match found for <span className="font-semibold text-gray-900">"{result.query}"</span>
             </p>
             {result.offline && (
              <span className="inline-block mt-2 text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                Offline Mode
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'tml' && result.company) {
    const company = result.company as TMLCompany;
    return (
      <div className="mt-4 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
           {/* Status Banner */}
           <div className="bg-green-50/50 p-5 flex flex-col items-center text-center border-b border-green-50">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-green-500">
                <CheckCircle2 className="w-7 h-7 fill-current" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">TML Listed</h3>
              <p className="text-green-700 text-xs font-medium mt-1 bg-green-100/50 px-3 py-1 rounded-full">
                High Priority Established Firm
              </p>
           </div>

           {/* Company Name BOx */}
           <div className="p-4 pb-2">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-2">
                 <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Company Name</div>
                 <div className="text-sm font-bold text-gray-900 leading-tight">{company.company_name}</div>
              </div>
           </div>

           {/* Details Grid */}
           <div className="px-5 pb-6 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                 {company.group_name && <DetailRow label="Group" value={company.group_name} />}
                 {company.finnone_category && <DetailRow label="Category" value={company.finnone_category} />}
                 {company.legal_status && <DetailRow label="Legal Status" value={company.legal_status} />}
                 {company.establishment_date && <DetailRow label="Established" value={company.establishment_date} />}
                 {company.emirate && <DetailRow label="Emirate" value={company.emirate} />}
                 {company.industry && <DetailRow label="Industry" value={company.industry} />}
                 {company.po_box && <DetailRow label="P.O. Box" value={company.po_box} />}
              </div>

              {company.comments && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Comments
                  </p>
                  <p className="text-xs text-gray-600 bg-yellow-50/50 p-3 rounded-lg border border-yellow-50/50 leading-relaxed">
                    {company.comments}
                  </p>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  if (result.status === 'good' && result.company) {
    const company = result.company as GoodCompany;
    return (
      <div className="mt-4 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
           {/* Status Banner */}
           <div className="bg-blue-50/50 p-5 flex flex-col items-center text-center border-b border-blue-50">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-blue-500">
                <CheckCircle2 className="w-7 h-7 fill-current" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Good List</h3>
              <p className="text-blue-700 text-xs font-medium mt-1 bg-blue-100/50 px-3 py-1 rounded-full">
                Verified Corporate Status
              </p>
           </div>

           <div className="p-4 pb-2">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-2">
                 <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Employer Name</div>
                 <div className="text-sm font-bold text-gray-900 leading-tight">{company.employer_name}</div>
              </div>
           </div>

           <div className="px-5 pb-6 space-y-3">
               {company.employer_code && <DetailRow label="Employer Code" value={company.employer_code} />}
               {company.category && <DetailRow label="Category" value={company.category} />}
               {company.employer_id && <DetailRow label="Employer ID" value={company.employer_id} />}
           </div>
        </div>
      </div>
    );
  }

  return null;
};