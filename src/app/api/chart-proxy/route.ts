import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch chart from Cloudinary' }, { status: 500 })
    }
    
    const html = await response.text()
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Chart proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch chart' }, { status: 500 })
  }
}
