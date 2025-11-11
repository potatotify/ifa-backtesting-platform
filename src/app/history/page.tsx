"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";

export default function HistoryPage() {
  const [backtests, setBacktests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const backtestsPerPage = 5;

  useEffect(() => {
    fetchBacktests();
  }, []);

  async function fetchBacktests() {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setBacktests(data);
    } catch (error) {
      console.error("Error fetching backtests:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString();
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white text-3xl mb-4">Backtest History</h2>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading backtests...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(backtests.length / backtestsPerPage);
  const startIndex = (currentPage - 1) * backtestsPerPage;
  const paginatedBacktests = backtests.slice(
    startIndex,
    startIndex + backtestsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="font-semibold text-gray-900 dark:text-white text-3xl mb-4">Backtest History</h2>

      {backtests.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-6xl">📊</div>
          <div className="text-center space-y-2">
            <p className="text-gray-900 dark:text-gray-300 text-lg font-semibold">No past backtests found</p>
            <p className="text-gray-600 dark:text-gray-400">Run a backtest to see it listed here!</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Run Your First Backtest
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {paginatedBacktests.map((bt) => (
              <li
                key={bt.id}
                className="bg-white dark:bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
                onClick={() => router.push(`/history/${bt.id}`)}
              >
                <div className="flex justify-between text-gray-700 dark:text-gray-300 mb-2">
                  <span>
                    <strong>Date:</strong> {formatDate(bt.date)}
                  </span>
                  <span>
                    <strong>Total Trades:</strong> {bt.totalTrades}
                  </span>
                </div>
                <div className="text-gray-800 dark:text-gray-200 space-y-1">
                  <p>
                    <strong>Win Rate:</strong>{" "}
                    <span className="text-green-600 dark:text-green-400">
                      {bt.winRate ? (bt.winRate * 100).toFixed(2) : "0.00"}%
                    </span>
                  </p>
                  <p>
                    <strong>Total P&L:</strong>{" "}
                    <span
                      className={
                        bt.totalPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }
                    >
                      ${bt.totalPnl?.toFixed(2) ?? "0.00"}
                    </span>
                  </p>
                  <p>
                    <strong>Parameters:</strong> TP:{" "}
                    {bt.parameters?.tp_ticks ?? "N/A"}, SL:{" "}
                    {bt.parameters?.sl_ticks ?? "N/A"}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1}-
                {Math.min(startIndex + backtestsPerPage, backtests.length)} of{" "}
                {backtests.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-900 dark:text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
