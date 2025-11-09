// Component: Display backtest results with download links

'use client'

interface ResultsDisplayProps {
  results: any
  onReset: () => void
}

export default function ResultsDisplay({ results, onReset }: ResultsDisplayProps) {
  const { metrics, trades, downloadLinks } = results

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Backtest Results</h2>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
        >
          New Backtest
        </button>
      </div>

      {/* Download Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Download Reports</h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleDownload(downloadLinks.trades_csv, 'trades.csv')}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
          >
            📊 Download Trades CSV
          </button>
          <button
            onClick={() => handleDownload(downloadLinks.metrics_csv, 'metrics.csv')}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold"
          >
            📈 Download Metrics CSV
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Trades</p>
          <p className="text-2xl font-bold text-white">{metrics.total_trades}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Win Rate</p>
          <p className="text-2xl font-bold text-green-400">
            {(metrics.win_rate * 100).toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total P&L</p>
          <p className={`text-2xl font-bold ${metrics.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${metrics.total_pnl.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Sharpe Ratio</p>
          <p className="text-2xl font-bold text-blue-400">
            {metrics.sharpe_ratio?.toFixed(2) || 'N/A'}
          </p>
        </div>
      </div>

      {/* Trade History Table */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Trades (First 10)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-gray-300">Entry Time</th>
                <th className="px-4 py-2 text-left text-gray-300">Position</th>
                <th className="px-4 py-2 text-left text-gray-300">Entry Price</th>
                <th className="px-4 py-2 text-left text-gray-300">Exit Time</th>
                <th className="px-4 py-2 text-left text-gray-300">Exit Reason</th>
                <th className="px-4 py-2 text-left text-gray-300">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {trades.slice(0, 10).map((trade: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-gray-300">{trade.entry_time}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.position === 'long' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}>
                      {trade.position}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-300">{trade.entry_price}</td>
                  <td className="px-4 py-2 text-gray-300">{trade.exit_time}</td>
                  <td className="px-4 py-2 text-gray-300">{trade.exit_reason}</td>
                  <td className={`px-4 py-2 font-semibold ${
                    trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${trade.pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
