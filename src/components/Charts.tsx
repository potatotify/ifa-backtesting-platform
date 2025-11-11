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
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Cell
} from "recharts";

interface ChartsProps {
  equityCurve: Array<{trade_number: number; date: string; balance: number}>;
  monthlyReturns: Array<{month: string; pnl: number}>;
}

export default function Charts({equityCurve, monthlyReturns}: ChartsProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const EquityTooltip = ({active, payload}: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <p className="text-gray-900 dark:text-white font-semibold text-sm">Trade #{data.trade_number}</p>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 font-mono">
            {new Date(data.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-500 dark:text-gray-500 text-xs">Balance:</span>
            <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">
              {formatCurrency(payload[0].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const MonthlyTooltip = ({active, payload}: any) => {
    if (active && payload && payload.length) {
      const pnl = payload[0].value;
      const isProfit = pnl >= 0;
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isProfit ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-gray-900 dark:text-white font-semibold text-sm">
              {payload[0].payload.month}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-500 text-xs">P&L:</span>
            <p className={`font-bold text-lg ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isProfit ? '+' : ''}{formatCurrency(pnl)}
            </p>
          </div>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
            {isProfit ? '📈 Profitable Month' : '📉 Loss Month'}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value, index } = props;
    const month = monthlyReturns[index]?.month || '';
    const isPositive = value >= 0;
    
    const labelY = isPositive ? y + height + 15 : y - 10;
    
    return (
      <text
        x={x + width / 2}
        y={labelY}
        fill="#9CA3AF"
        textAnchor="middle"
        fontSize="11"
        fontWeight="500"
      >
        {month}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Equity Curve */}
      <div className="bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Equity Curve
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Account balance progression over time</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={450}>
          <AreaChart 
            data={equityCurve}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" className="dark:stroke-gray-700" opacity={0.5} />
            <XAxis
              dataKey="trade_number"
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#9CA3AF' }}
              label={{
                value: "Trade Number",
                position: "insideBottom",
                offset: -15,
                fill: "#6B7280",
                fontSize: 13,
                fontWeight: 600
              }}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#9CA3AF' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              label={{
                value: "Account Balance",
                angle: -90,
                position: "insideLeft",
                fill: "#6B7280",
                fontSize: 13,
                fontWeight: 600
              }}
            />
            <Tooltip content={<EquityTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#colorBalance)"
              name="Account Balance"
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 8, fill: '#3B82F6', stroke: '#1E40AF', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Returns */}
      <div className="bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Monthly Returns
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Profit & loss breakdown by month</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400 text-xs">Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400 text-xs">Loss</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={500}>
          <BarChart 
            data={monthlyReturns}
            margin={{ top: 20, right: 30, left: 50, bottom: 40 }}
          >
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="colorLoss" x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#D1D5DB"
              className="dark:stroke-gray-700"
              opacity={0.4}
              verticalFill={['rgba(209, 213, 219, 0.05)', 'transparent']}
            />
            
            <XAxis 
              dataKey="month" 
              hide={true}
            />
            
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#9CA3AF', strokeWidth: 2 }}
              tickFormatter={(value) => {
                const absValue = Math.abs(value);
                return `$${(absValue / 1000).toFixed(1)}k`;
              }}
              label={{
                value: "Profit & Loss",
                angle: -90,
                position: "insideLeft",
                fill: "#6B7280",
                fontSize: 13,
                fontWeight: 600,
                offset: 0
              }}
            />
            
            <ReferenceLine 
              y={0} 
              stroke="#6B7280" 
              strokeWidth={2}
              strokeDasharray="0"
            />
            
            <Tooltip content={<MonthlyTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
            
            <Bar 
              dataKey="pnl"
              radius={[8, 8, 8, 8]}
              maxBarSize={60}
              label={renderCustomLabel}
            >
              {monthlyReturns.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? 'url(#colorProfit)' : 'url(#colorLoss)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
