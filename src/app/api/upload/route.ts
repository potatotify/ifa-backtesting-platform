// Route: POST /api/upload
// Forwards file to Python backend on Render

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const parametersStr = formData.get('parameters') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Forward to Python backend
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    const uploadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/upload`,
      {
        method: 'POST',
        body: backendFormData,
      }
    )

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json()
      return NextResponse.json({ error: error.error }, { status: 500 })
    }

    const uploadData = await uploadResponse.json()
    const parameters = parametersStr ? JSON.parse(parametersStr) : {}

    // Save metadata to MongoDB
    const { db } = await connectToDatabase()
    const result = await db.collection('uploads').insertOne({
      filename: uploadData.filename,
      fileUrl: uploadData.file_url,
      publicId: uploadData.public_id,
      parameters,
      uploadedAt: new Date(),
      status: 'uploaded',
    })

    return NextResponse.json({
      success: true,
      fileId: result.insertedId.toString(),
      fileUrl: uploadData.file_url,
      filename: uploadData.filename,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
