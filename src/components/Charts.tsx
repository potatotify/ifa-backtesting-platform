"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ChartsProps {
  equityCurve: Array<{trade_number: number; date: string; balance: number}>;
  monthlyReturns: Array<{month: string; pnl: number}>;
}

export default function Charts({equityCurve, monthlyReturns}: ChartsProps) {
  return (
    <div className="space-y-6">
      {/* Equity Curve - REQUIRED */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={equityCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="trade_number"
              stroke="#9CA3AF"
              label={{
                value: "Trade Number",
                position: "insideBottom",
                offset: -5,
                fill: "#9CA3AF"
              }}
            />
            <YAxis
              stroke="#9CA3AF"
              label={{
                value: "Balance ($)",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF"
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px"
              }}
              labelStyle={{color: "#F3F4F6"}}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name="Account Balance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Returns - Additional Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Monthly Returns
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyReturns}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#9CA3AF"
              label={{
                value: "P&L ($)",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF"
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px"
              }}
              labelStyle={{color: "#F3F4F6"}}
            />
            <Legend />
            <Bar dataKey="pnl" fill="#10B981" name="Monthly P&L" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
