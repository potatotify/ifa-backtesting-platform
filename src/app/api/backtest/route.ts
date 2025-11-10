// Route: POST /api/backtest
// Calls Python backend on Render

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId, fileUrl, parameters } = body

    // Call Python backend
    const backtestResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/run-backtest`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: fileUrl,
          parameters,
        }),
      }
    )

    if (!backtestResponse.ok) {
      const error = await backtestResponse.json()
      return NextResponse.json({ error: error.error }, { status: 500 })
    }

    const results = await backtestResponse.json()

    // Generate chart data if backend doesn't provide it
    if (!results.chart_data && results.trades && results.trades.length > 0) {
      const startingBalance = parameters.starting_balance || 100000
      results.chart_data = generateChartData(results.trades, startingBalance)
    }

    // Save to MongoDB
    const { db } = await connectToDatabase()
    await db.collection('backtests').insertOne({
      fileId,
      parameters,
      results,
      createdAt: new Date(),
    })

    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Generate chart data as backup/for Recharts
interface EquityPoint {
  trade_number: number
  date: string
  balance: number
}

function generateChartData(trades: any[], startingBalance: number) {
  const equityCurve: EquityPoint[] = []
  const monthlyReturns: { [key: string]: number } = {}

  let currentBalance = startingBalance

  trades.forEach((trade, index) => {
    currentBalance += trade.pnl || 0

    equityCurve.push({
      trade_number: index + 1,
      date: trade.exit_time,
      balance: parseFloat(currentBalance.toFixed(2)),
    })

    // Extract month from date (assumes format like "2020-01-15 09:30:00")
    const month = trade.exit_time?.substring(0, 7) || 'Unknown' // "2020-01"
    monthlyReturns[month] = (monthlyReturns[month] || 0) + (trade.pnl || 0)
  })

  const monthlyReturnsArray = Object.entries(monthlyReturns).map(
    ([month, pnl]) => ({
      month,
      pnl: parseFloat((pnl as number).toFixed(2)),
    })
  )

  return {
    equity_curve: equityCurve,
    monthly_returns: monthlyReturnsArray,
  }
}
