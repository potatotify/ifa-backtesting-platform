'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ResultsDisplay from '@/components/ResultsDisplay'
import CompareBacktests from '@/components/CompareBacktests'

export default function BacktestDetailsPage() {
  const [backtest, setBacktest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCompare, setShowCompare] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchBacktest(params.id as string)
    }
  }, [params.id])

  async function fetchBacktest(id: string) {
    try {
      const res = await fetch(`/api/history/${id}`)
      if (!res.ok) throw new Error('Backtest not found')
      const data = await res.json()
      setBacktest(data)
    } catch (error) {
      console.error(error)
      setBacktest(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <button
          className="mb-4 px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
          onClick={() => router.push('/history')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to History
        </button>
        
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <p className="text-gray-300 text-xl font-semibold">Loading backtest details...</p>
        </div>
      </div>
    )
  }

  if (!backtest) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <button
          className="mb-4 px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
          onClick={() => router.push('/history')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to History
        </button>
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
          <div className="text-7xl">🔍</div>
          <p className="text-gray-300 text-2xl font-semibold">Backtest Not Found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <button
          className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-800"
          onClick={() => router.push('/history')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to History
        </button>
        
        
      </div>

      <ResultsDisplay
        results={backtest.results}
        onReset={() => router.push('/')}
      />

      {showCompare && (
        <CompareBacktests
          currentBacktest={backtest}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  )
}
