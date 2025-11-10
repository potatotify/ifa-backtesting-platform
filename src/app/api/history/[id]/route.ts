import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to unwrap the Promise
    const { id } = await params

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid backtest ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const backtest = await db.collection('backtests').findOne({
      _id: new ObjectId(id)
    })

    if (!backtest) {
      return NextResponse.json({ error: 'Backtest not found' }, { status: 404 })
    }

    return NextResponse.json(backtest)
  } catch (error: any) {
    console.error('Error fetching backtest:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
