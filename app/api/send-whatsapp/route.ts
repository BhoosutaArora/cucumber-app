import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, roomName, destination, dates, price, type } = await request.json()

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_WHATSAPP_FROM

    if (!accountSid || !authToken || !from) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 })
    }

    let message = ''

    if (type === 'booking') {
      message = `🥒 *Cucumber Travel*\n\nHey! Your booking is confirmed! 🎉\n\n*${roomName}*\n📍 ${destination}\n📅 ${dates}\n💰 ₹${Number(price).toLocaleString()} paid\n\nYour adventure is officially booked! Check your email for full details.\n\nSee you on the trip! 🏔️`
    } else if (type === 'reminder') {
      message = `🥒 *Cucumber Travel*\n\nTrip reminder! 🏔️\n\n*${roomName}* starts in 7 days!\n📍 ${destination}\n📅 ${dates}\n\nJoin your room chat to meet your travel buddies 💬\n\ncucumber-app.vercel.app/chat`
    } else if (type === 'verification') {
      message = `🥒 *Cucumber Travel*\n\nYour ID has been verified! ✅\n\nYou can now join any travel room on Cucumber.\n\nFind your next adventure 👇\ncucumber-app.vercel.app/rooms`
    }

    // Format phone number
    const toWhatsApp = `whatsapp:${to}`

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from,
          To: toWhatsApp,
          Body: message,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, sid: data.sid })
  } catch (error) {
    console.error('WhatsApp error:', error)
    return NextResponse.json({ error: 'Failed to send WhatsApp' }, { status: 500 })
  }
}