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
  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Custom tooltip for equity curve
  const EquityTooltip = ({active, payload}: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-1">
            Trade #{payload[0].payload.trade_number}
          </p>
          <p className="text-gray-400 text-xs mb-2">
            {payload[0].payload.date}
          </p>
          <p className="text-blue-400 font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for monthly returns with color based on profit/loss
  const MonthlyTooltip = ({active, payload}: any) => {
    if (active && payload && payload.length) {
      const pnl = payload[0].value;
      const isProfit = pnl >= 0;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-1">
            {payload[0].payload.month}
          </p>
          <p className={`font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{formatCurrency(pnl)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom bar color function - green for positive, red for negative
  const getBarColor = (entry: any) => {
    return entry.pnl >= 0 ? '#10B981' : '#EF4444';
  };

  return (
    <div className="space-y-6">
      {/* Equity Curve - REQUIRED */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          📈 Equity Curve
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart 
            data={equityCurve}
            margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="trade_number"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              label={{
                value: "Trade Number",
                position: "insideBottom",
                offset: -10,
                fill: "#9CA3AF",
                fontSize: 14
              }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              label={{
                value: "Account Balance",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF",
                fontSize: 14
              }}
            />
            <Tooltip content={<EquityTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              name="Account Balance"
              activeDot={{ r: 6, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Returns - Additional Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          📊 Monthly Returns
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={monthlyReturns}
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              label={{
                value: "Profit & Loss",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF",
                fontSize: 14
              }}
            />
            <Tooltip content={<MonthlyTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Bar 
              dataKey="pnl" 
              name="Monthly P&L"
              radius={[4, 4, 0, 0]}
            >
              {monthlyReturns.map((entry, index) => (
                <Bar 
                  key={`bar-${index}`}
                  dataKey="pnl"
                  fill={getBarColor(entry)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
