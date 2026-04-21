import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const amount = body.amount || 3500
    const roomId = body.roomId || ''

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: 'cucumber_' + Date.now(),
      notes: {
        purpose: amount === 3500 ? 'Video Call Token' : 'Trip Payment',
        room_id: roomId,
      },
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Razorpay order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}