'use client'

import { useState, useEffect } from 'react'

interface CompareBacktestsProps {
  currentBacktest: any
  onClose: () => void
}

export default function CompareBacktests({ currentBacktest, onClose }: CompareBacktestsProps) {
  const [availableBacktests, setAvailableBacktests] = useState<any[]>([])
  const [selectedBacktest, setSelectedBacktest] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBacktests()
  }, [])

  const fetchBacktests = async () => {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      const filtered = data.filter((bt: any) => bt.id !== currentBacktest.id)
      setAvailableBacktests(filtered)
    } catch (error) {
      console.error('Failed to fetch backtests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBacktest = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`)
      const data = await res.json()
      setSelectedBacktest(data)
    } catch (error) {
      console.error('Failed to load backtest:', error)
    }
  }

  const MetricCard = ({ label, current, compare }: any) => {
    const currentVal = parseFloat(current) || 0
    const compareVal = parseFloat(compare) || 0
    const diff = currentVal - compareVal
    const isPositive = diff > 0

    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{label}</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Current</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{current}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Compare</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{compare}</p>
          </div>
        </div>
        {selectedBacktest && (
          <div className={`mt-2 text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(diff).toFixed(2)} difference
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Compare Backtests</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Backtest Selector */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Backtest to Compare
            </h3>
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400">Loading backtests...</p>
            ) : availableBacktests.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No other backtests available for comparison.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBacktests.map((bt) => (
                  <button
                    key={bt.id}
                    onClick={() => loadBacktest(bt.id)}
                    className={`p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedBacktest?.id === bt.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <p className="text-gray-900 dark:text-white font-semibold mb-2">
                      {new Date(bt.date).toLocaleDateString()}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Trades</p>
                        <p className="text-gray-900 dark:text-white">{bt.totalTrades}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">P&L</p>
                        <p className={bt.totalPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          ${bt.totalPnl?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comparison Table */}
          {selectedBacktest && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Comparison
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Total Trades"
                  current={currentBacktest.results.metrics.total_trades}
                  compare={selectedBacktest.results.metrics.total_trades}
                />
                <MetricCard
                  label="Win Rate"
                  current={`${((currentBacktest.results.metrics.win_rate ?? 0) * 100).toFixed(2)}%`}
                  compare={`${((selectedBacktest.results.metrics.win_rate ?? 0) * 100).toFixed(2)}%`}
                />
                <MetricCard
                  label="Total P&L"
                  current={`$${Number(currentBacktest.results.metrics.total_pnl ?? 0).toFixed(2)}`}
                  compare={`$${Number(selectedBacktest.results.metrics.total_pnl ?? 0).toFixed(2)}`}
                />
                <MetricCard
                  label="Sharpe Ratio"
                  current={currentBacktest.results.metrics.sharpe_ratio?.toFixed(2) || 'N/A'}
                  compare={selectedBacktest.results.metrics.sharpe_ratio?.toFixed(2) || 'N/A'}
                />
                <MetricCard
                  label="Avg Win"
                  current={`$${currentBacktest.results.metrics.avg_win?.toFixed(2) || '0.00'}`}
                  compare={`$${selectedBacktest.results.metrics.avg_win?.toFixed(2) || '0.00'}`}
                />
                <MetricCard
                  label="Avg Loss"
                  current={`$${Math.abs(currentBacktest.results.metrics.avg_loss)?.toFixed(2) || '0.00'}`}
                  compare={`$${Math.abs(selectedBacktest.results.metrics.avg_loss)?.toFixed(2) || '0.00'}`}
                />
                <MetricCard
                  label="Best Trade"
                  current={`$${currentBacktest.results.metrics.best_trade?.toFixed(2) || '0.00'}`}
                  compare={`$${selectedBacktest.results.metrics.best_trade?.toFixed(2) || '0.00'}`}
                />
                <MetricCard
                  label="Worst Trade"
                  current={`$${Math.abs(currentBacktest.results.metrics.worst_trade)?.toFixed(2) || '0.00'}`}
                  compare={`$${Math.abs(selectedBacktest.results.metrics.worst_trade)?.toFixed(2) || '0.00'}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
