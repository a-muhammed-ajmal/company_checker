import React from 'react';

interface DetailRowProps {
  label: string;
  value: string | number | undefined | null;
}

export const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
      <span className="text-sm font-semibold text-gray-600 w-1/3 pt-0.5">{label}</span>
      <span className="text-sm text-gray-900 w-2/3 text-right font-medium break-words">{value}</span>
    </div>
  );
};
