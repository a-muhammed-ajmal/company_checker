import { AlertCircle } from 'lucide-react';

interface ErrorCardProps {
  message: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ message }) => (
  <div className="mt-4 animate-scale-in">
    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 flex flex-col items-center text-center">
      <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">Error Occurred</h3>
      <p className="text-gray-500 text-xs">{message}</p>
    </div>
  </div>
);
