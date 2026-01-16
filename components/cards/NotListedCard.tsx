import type React from "react"

interface NotListedCardProps {
  query: string
}

const NotListedCard: React.FC<NotListedCardProps> = ({ query }) => {
  return (
    <div className="w-full bg-white border-2 border-dashed border-red-300 rounded-xl p-6 text-center animate-fade-in shadow-sm">
      <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
        <span className="text-4xl">❓</span>
      </div>

      <h2 className="text-xl font-bold text-red-700">Non-Listed Company (NTML)</h2>

      <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-100 text-left">
        <p className="text-gray-600 text-sm mb-1">Searched for:</p>
        <p className="font-bold text-gray-900 mb-2 break-all">"{query}"</p>

        <div className="border-t border-red-200 pt-2 mt-2">
          <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded text-xs uppercase">Not Found</span>
          <p className="text-red-700 text-sm mt-3 leading-relaxed">
            No match is found in any lists. This company is not present in our Delisted, TML (Target Market List), or
            Good List databases.
          </p>
        </div>
      </div>

      <div className="mt-6 text-left text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <p className="font-bold mb-2">Recommended Actions:</p>
        <ul className="list-none space-y-1">
          <li className="flex items-center gap-2">
            ✓ <span className="text-gray-500">Double-check the spelling and try again</span>
          </li>
          <li className="flex items-center gap-2">
            ✓ <span className="text-gray-500">Try searching with abbreviated or full company names</span>
          </li>
          <li className="flex items-center gap-2">
            ✓ <span className="text-gray-500">Request official company documentation for verification</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default NotListedCard
