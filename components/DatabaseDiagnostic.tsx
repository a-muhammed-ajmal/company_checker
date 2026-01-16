"use client"

import { useState } from "react"
import { SUPABASE_URL, SUPABASE_ANON_KEY, hasSupabaseCredentials } from "../constants"

interface ColumnInfo {
  tableName: string
  columns: string[]
  sampleData: any[]
  rowCount: number
  error?: string
}

export default function DatabaseDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<ColumnInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const tableNames = [
    "delisted_company_1",
    "delisted_company_2",
    "eib_approved",
    "payroll_approved",
    "credit_card_approved",
  ]

  const runDiagnostic = async () => {
    if (!hasSupabaseCredentials()) {
      setDiagnostics([
        {
          tableName: "Configuration Error",
          columns: [],
          sampleData: [],
          rowCount: 0,
          error:
            "Missing Supabase credentials. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Vars section of the sidebar.",
        },
      ])
      return
    }

    setLoading(true)
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "count=exact",
    }

    console.log(`[v0] SUPABASE_URL: ${SUPABASE_URL}`)
    console.log(
      `[v0] SUPABASE_ANON_KEY length: ${SUPABASE_ANON_KEY?.length}, starts with: ${SUPABASE_ANON_KEY?.substring(0, 20)}...`,
    )

    const results: ColumnInfo[] = []

    for (const tableName of tableNames) {
      try {
        const url = `${SUPABASE_URL}/rest/v1/${tableName}?select=*&limit=5`
        console.log(`[v0] Fetching: ${url}`)

        const response = await fetch(url, { headers })

        const responseStatus = response.status
        const responseStatusText = response.statusText
        const responseHeaders: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value
        })

        console.log(`[v0] Response for ${tableName}: status=${responseStatus} ${responseStatusText}`)
        console.log(`[v0] Response headers for ${tableName}:`, JSON.stringify(responseHeaders))

        const rawText = await response.text()
        console.log(`[v0] Raw response body for ${tableName}:`, rawText.substring(0, 500))

        let data: any[] = []
        try {
          data = JSON.parse(rawText)
        } catch (e) {
          console.log(`[v0] Failed to parse JSON for ${tableName}:`, e)
        }

        if (!response.ok) {
          results.push({
            tableName,
            columns: [],
            sampleData: [],
            rowCount: 0,
            error: `HTTP ${responseStatus}: ${rawText.substring(0, 200)}`,
          })
          continue
        }

        const contentRange = response.headers.get("content-range")
        let totalCount = 0
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)/)
          if (match) totalCount = Number.parseInt(match[1], 10)
        }

        console.log(`[v0] ${tableName}: ${data.length} rows, total: ${totalCount}`)

        if (data.length > 0) {
          const columns = Object.keys(data[0])
          results.push({
            tableName,
            columns,
            sampleData: data,
            rowCount: totalCount || data.length,
          })
        } else {
          results.push({
            tableName,
            columns: [],
            sampleData: [],
            rowCount: 0,
            error: `Table returned 0 rows (HTTP ${responseStatus})`,
          })
        }
      } catch (error) {
        console.error(`[v0] Exception for ${tableName}:`, error)
        results.push({
          tableName,
          columns: [],
          sampleData: [],
          rowCount: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    setDiagnostics(results)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && diagnostics.length === 0) {
            runDiagnostic()
          }
        }}
        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
      >
        {isOpen ? "Hide" : "Show"} Database Column Diagnostic
      </button>

      {isOpen && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-h-[500px] overflow-y-auto">
          {loading && <p className="text-center text-gray-500">Loading database structure...</p>}

          {!loading && diagnostics.length > 0 && (
            <div className="space-y-4">
              {diagnostics.map((info) => (
                <div key={info.tableName} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="font-bold text-sm text-gray-800 mb-2">
                    Table: <span className="text-blue-600">{info.tableName}</span>
                    {info.rowCount > 0 && (
                      <span className="ml-2 text-green-600 font-normal">({info.rowCount} rows)</span>
                    )}
                  </h3>

                  {info.error ? (
                    <p className="text-red-600 text-xs">{info.error}</p>
                  ) : (
                    <>
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 font-medium mb-1">Columns ({info.columns.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {info.columns.map((col) => (
                            <span
                              key={col}
                              className={`px-2 py-0.5 rounded text-xs ${
                                col.toLowerCase().includes("name") || col.toLowerCase().includes("company")
                                  ? "bg-green-100 text-green-800 font-bold"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>

                      {info.sampleData.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">Sample Data:</p>
                          <div className="text-xs font-mono bg-gray-50 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
                            {info.sampleData.map((row, idx) => (
                              <div key={idx} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                                <pre className="whitespace-pre-wrap text-gray-700">{JSON.stringify(row, null, 2)}</pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="mt-4 w-full bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors disabled:bg-gray-400"
          >
            Refresh Diagnostic
          </button>
        </div>
      )}
    </div>
  )
}
