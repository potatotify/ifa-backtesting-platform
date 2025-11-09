// Route: POST /api/upload
// Handles file upload, validation, and saves metadata to MongoDB

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const parametersStr = formData.get('parameters') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (100MB)
    const maxSize = 150 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const filepath = path.join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Parse parameters
    const parameters = parametersStr ? JSON.parse(parametersStr) : {}

    // Save metadata to MongoDB
    const { db } = await connectToDatabase()
    const result = await db.collection('uploads').insertOne({
      filename,
      filepath,
      originalName: file.name,
      size: file.size,
      parameters,
      uploadedAt: new Date(),
      status: 'uploaded',
    })

    return NextResponse.json({
      success: true,
      fileId: result.insertedId.toString(),
      filename,
      filepath,
      message: 'File uploaded successfully',
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: 500 }
    )
  }
}

// REMOVED: The deprecated config export
// Next.js 14 App Router handles this automatically
