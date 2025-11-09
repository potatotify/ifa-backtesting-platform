"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";

export default function HistoryPage() {
  const [backtests, setBacktests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    return <p className="text-gray-400 p-6">Loading backtests...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-white text-3xl mb-6">Backtest History</h1>

      {backtests.length === 0 ? (
        <div className="p-6 text-center text-gray-400 border border-gray-700 rounded">
          <p>No past backtests found.</p>
          <p>Run a backtest to see it listed here!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {backtests.map((bt) => (
            <li
              key={bt.id}
              className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700"
              onClick={() => router.push(`/history/${bt.id}`)}
            >
              <div className="flex justify-between text-gray-300 mb-2">
                <span>
                  <strong>Date:</strong> {formatDate(bt.date)}
                </span>
                <span>
                  <strong>Total Trades:</strong> {bt.totalTrades}
                </span>
              </div>
              <div className="text-gray-200">
                <p>
                  <strong>Win Rate:</strong> {(bt.winRate * 100).toFixed(2)}%
                </p>
                <p>
                  <strong>Total P&L:</strong> ${bt.totalPnl.toFixed(2)}
                </p>
                <p>
                  <strong>Parameters:</strong> TP: {bt.parameters.tp_ticks}, SL:{" "}
                  {bt.parameters.sl_ticks}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
