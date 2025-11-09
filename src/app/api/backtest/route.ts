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
