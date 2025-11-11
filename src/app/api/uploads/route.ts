import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileUrl, publicId, filename, size } = body

    console.log('📥 Saving upload to MongoDB:', filename)

    const { db } = await connectToDatabase()
    const result = await db.collection('uploads').insertOne({
      fileUrl,
      publicId,
      filename,
      size,
      uploadedAt: new Date(),
    })

    console.log('✅ Upload saved to MongoDB')

    return NextResponse.json({
      success: true,
      fileId: result.insertedId.toString(),
    })
  } catch (error: any) {
    console.error('❌ MongoDB save error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
