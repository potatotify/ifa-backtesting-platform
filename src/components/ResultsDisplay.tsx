import { useState, useEffect } from "react";
import Charts from "./Charts";

interface ResultsDisplayProps {
  results: any;
  onReset: () => void;
}

export default function ResultsDisplay({
  results,
  onReset
}: ResultsDisplayProps) {
  const [showAdvancedCharts, setShowAdvancedCharts] = useState(false);
  const { metrics, trades, chart_data, chart_files, downloadLinks } = results;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<"all" | "wins" | "losses">("all");
  const [positionFilter, setPositionFilter] = useState<"all" | "long" | "short">("all");
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const tradesPerPage = 20;

  // Initialize selected chart when chart_files loads
  useEffect(() => {
    if (chart_files && chart_files.length > 0 && !selectedChart) {
      setSelectedChart(chart_files[0]);
    }
  }, [chart_files, selectedChart]);

  // Set loading state when chart changes
  useEffect(() => {
    if (showAdvancedCharts && selectedChart) {
      setIsChartLoading(true);
    }
  }, [selectedChart, showAdvancedCharts]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleChartLoad = () => {
    setIsChartLoading(false);
  };

  // Filter trades
  let filteredTrades = [...trades];
  if (filterType === "wins") {
    filteredTrades = filteredTrades.filter((t) => t.pnl > 0);
  } else if (filterType === "losses") {
    filteredTrades = filteredTrades.filter((t) => t.pnl < 0);
  }
  if (positionFilter !== "all") {
    filteredTrades = filteredTrades.filter(
      (t) => t.position.toLowerCase() === positionFilter
    );
  }

  // Sort trades
  if (sortField) {
    filteredTrades.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / tradesPerPage);
  const startIndex = (currentPage - 1) * tradesPerPage;
  const paginatedTrades = filteredTrades.slice(
    startIndex,
    startIndex + tradesPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <h3 className="text-lg font-semibold text-white mb-4">
          Download Reports
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleDownload(downloadLinks.trades_csv, "trades.csv")}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
          >
            📊 Download Trades CSV
          </button>
          <button
            onClick={() => handleDownload(downloadLinks.metrics_csv, "metrics.csv")}
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
            {((metrics.win_rate ?? 0) * 100).toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total P&L</p>
          <p
            className={`text-2xl font-bold ${
              (metrics.total_pnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            ${Number(metrics.total_pnl ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Sharpe Ratio</p>
          <p className="text-2xl font-bold text-blue-400">
            {metrics.sharpe_ratio?.toFixed(2) || "N/A"}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Avg Win</p>
          <p className="text-2xl font-bold text-green-400">
            ${metrics.avg_win?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Avg Loss</p>
          <p className="text-2xl font-bold text-red-400">
            ${Math.abs(metrics.avg_loss)?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Best Trade</p>
          <p className="text-2xl font-bold text-green-400">
            ${metrics.best_trade?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Worst Trade</p>
          <p className="text-2xl font-bold text-red-400">
            ${Math.abs(metrics.worst_trade)?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      {/* Frontend-Rendered Charts */}
      {chart_data && (
        <Charts
          equityCurve={chart_data.equity_curve}
          monthlyReturns={chart_data.monthly_returns}
        />
      )}

      {/* Advanced Interactive Charts */}
      {chart_files && chart_files.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Advanced Interactive Charts
            </h3>
            <button
              onClick={() => {
                setShowAdvancedCharts(!showAdvancedCharts);
                if (!showAdvancedCharts) {
                  setIsChartLoading(true);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              {showAdvancedCharts ? "Hide" : "Show"} Advanced Charts
            </button>
          </div>

          {showAdvancedCharts && (
            <>
              {/* Chart Selector */}
              {chart_files.length > 1 && (
                <div className="mb-4 flex gap-2 flex-wrap">
                  {chart_files.map((chartUrl: string, idx: number) => {
                    const filename = chartUrl.split("/").pop() || `Chart ${idx + 1}`;
                    const displayName = filename
                      .replace("backtest_", "")
                      .replace("_strategy_candles_", " Chart ")
                      .replace(".html", "");

                    return (
                      <button
                        key={chartUrl}
                        onClick={() => setSelectedChart(chartUrl)}
                        className={`px-4 py-2 rounded font-semibold transition-colors ${
                          selectedChart === chartUrl
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {displayName}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Chart Display with Loading State */}
              <div className="relative w-full rounded overflow-hidden" style={{ height: "700px" }}>
                {isChartLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-300">Loading chart...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={`/api/chart-proxy?url=${encodeURIComponent(selectedChart || chart_files[0])}`}
                  className="w-full h-full border-0"
                  title="Strategy Chart"
                  sandbox="allow-scripts allow-same-origin"
                  loading="lazy"
                  onLoad={handleChartLoad}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Trade History Table */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            Trade History ({filteredTrades.length} trades)
          </h3>
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="all">All Trades</option>
              <option value="wins">Wins Only</option>
              <option value="losses">Losses Only</option>
            </select>
            <select
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="all">All Positions</option>
              <option value="long">Long Only</option>
              <option value="short">Short Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th
                  onClick={() => handleSort("entry_time")}
                  className="px-4 py-2 text-left text-gray-300 cursor-pointer hover:bg-gray-600"
                >
                  Entry Time{" "}
                  {sortField === "entry_time" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("position")}
                  className="px-4 py-2 text-left text-gray-300 cursor-pointer hover:bg-gray-600"
                >
                  Position{" "}
                  {sortField === "position" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("entry_price")}
                  className="px-4 py-2 text-left text-gray-300 cursor-pointer hover:bg-gray-600"
                >
                  Entry{" "}
                  {sortField === "entry_price" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-2 text-left text-gray-300">SL</th>
                <th className="px-4 py-2 text-left text-gray-300">TP</th>
                <th
                  onClick={() => handleSort("exit_time")}
                  className="px-4 py-2 text-left text-gray-300 cursor-pointer hover:bg-gray-600"
                >
                  Exit Time{" "}
                  {sortField === "exit_time" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-2 text-left text-gray-300">Reason</th>
                <th
                  onClick={() => handleSort("pnl")}
                  className="px-4 py-2 text-left text-gray-300 cursor-pointer hover:bg-gray-600"
                >
                  P&L {sortField === "pnl" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-2 text-left text-gray-300">Cumulative P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedTrades.map((trade: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-gray-300">{trade.entry_time}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        trade.position === "long"
                          ? "bg-green-900 text-green-200"
                          : "bg-red-900 text-red-200"
                      }`}
                    >
                      {trade.position}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-300">{trade.entry_price}</td>
                  <td className="px-4 py-2 text-gray-300">
                    {trade.sl_price?.toFixed(2) || "-"}
                  </td>
                  <td className="px-4 py-2 text-gray-300">
                    {trade.tp_price?.toFixed(2) || "-"}
                  </td>
                  <td className="px-4 py-2 text-gray-300">{trade.exit_time}</td>
                  <td className="px-4 py-2 text-gray-300">{trade.exit_reason}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      (trade.pnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    ${Number(trade.pnl ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-gray-300">
                    ${trade.cumulative_pnl?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-400">
            Showing {startIndex + 1}-{Math.min(startIndex + tradesPerPage, filteredTrades.length)} of{" "}
            {filteredTrades.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
