import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const roomId = url.searchParams.get('room') || ''
  return NextResponse.redirect('https://cucumbertravel.in/video-call?paid=true&room=' + roomId)
}