import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parameters, results, fileUrl } = body

    console.log('📥 Saving backtest to MongoDB')

    const { db } = await connectToDatabase()
    const result = await db.collection('backtests').insertOne({
      parameters,
      results,
      fileUrl,
      createdAt: new Date(),
    })

    console.log('✅ Backtest saved to MongoDB')

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error: any) {
    console.error('❌ Backtest save error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
