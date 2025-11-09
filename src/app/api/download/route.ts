// Route: GET /api/download?file=filename.csv
// Serves generated CSV files for download

import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filename = searchParams.get('file')

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename parameter is required' },
        { status: 400 }
      )
    }

    // Security: Only allow specific files
    if (!['trades.csv', 'metrics.csv'].includes(filename)) {
      return NextResponse.json(
        { error: 'Invalid file requested' },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), filename)
    const fileContent = await readFile(filePath)

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'File not found or error reading file' },
      { status: 404 }
    )
  }
}
