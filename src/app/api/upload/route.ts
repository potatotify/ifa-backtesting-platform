import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileUrl, publicId, filename, size } = body

    // Save to database
    const { db } = await connectToDatabase()
    const result = await db.collection('uploads').insertOne({
      fileUrl,
      publicId,
      filename,
      size,
      uploadedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      fileId: result.insertedId,
      fileUrl,
      publicId,
      filename,
    })
  } catch (error: any) {
    console.error('Error saving upload:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
