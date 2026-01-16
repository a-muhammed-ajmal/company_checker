"use client"

import type React from "react"
import type { Company } from "../../types"

interface CompanyDetailsCardProps {
  company: Company
  hasCrossReference?: boolean
  onBack: () => void
}

const CompanyDetailsCard: React.FC<CompanyDetailsCardProps> = ({ company, hasCrossReference, onBack }) => {
  // Dynamic Styling based on UI Type
  const getTheme = () => {
    switch (company.ui_type) {
      case "DELISTED":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          header: "bg-red-600",
          badgeText: "text-red-700",
          badgeLabel: "DELISTED",
          icon: "⛔",
          textMain: "text-red-700",
          title: "Delisted Company",
        }
      case "TML":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          header: "bg-green-600",
          badgeText: "text-green-700",
          badgeLabel: "APPROVED",
          icon: "✅",
          textMain: "text-green-700",
          title: "Target Market List (TML)",
        }
      case "GOOD":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          header: "bg-blue-600",
          badgeText: "text-blue-700",
          badgeLabel: "VERIFIED",
          icon: "🛡️",
          textMain: "text-blue-700",
          title: "Good List Company (NTML)",
        }
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          header: "bg-gray-600",
          badgeText: "text-gray-700",
          badgeLabel: "UNKNOWN",
          icon: "?",
          textMain: "text-gray-700",
          title: "Company Details",
        }
    }
  }

  const theme = getTheme()

  return (
    <div className="animate-fade-in w-full">
      <button
        onClick={onBack}
        className="mb-4 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-blue-600 font-bold flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors"
      >
        <span>←</span> Back to results
      </button>

      <div className={`w-full ${theme.bg} border border-white/50 rounded-2xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] overflow-hidden`}>
        {/* Header */}
        <div className={`${theme.header} px-4 py-3 flex justify-between items-center`}>
          <h2 className="text-white font-bold text-lg">{theme.title}</h2>
          <span className={`bg-white ${theme.badgeText} text-xs font-black px-2 py-1 rounded uppercase`}>
            {theme.badgeLabel}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-1">Company Name</p>
          <h1 className="text-2xl font-black text-gray-900 leading-tight mb-4 break-words">{company.displayName}</h1>

          <div className={`bg-white p-3 rounded-lg border ${theme.border} flex items-start gap-3 mb-4`}>
            <span className="text-2xl">{theme.icon}</span>
            <div>
              <p className="text-sm text-gray-500">Status:</p>
              <p className={`font-bold ${theme.textMain} text-base`}>{company.ui_label}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm">
            {company.employer_code && (
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Employer Code:</span>
                <span className="font-mono font-bold">{company.employer_code}</span>
              </div>
            )}
            {company.legal_status && (
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Legal Status:</span>
                <span className="font-bold">{company.legal_status}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Source Table:</span>
              <span className="font-mono text-xs text-gray-400">{company.ui_source_id}</span>
            </div>
          </div>

          {/* WARNING NOTE (Important!) */}
          {hasCrossReference && (
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-900 rounded-r shadow-sm">
              <strong>⚠️ Warning:</strong> This entity also appears in other lists. The current status ({company.ui_type}
              ) takes priority as it represents higher risk/priority information.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyDetailsCard
