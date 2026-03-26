import { NextRequest, NextResponse } from 'next/server'
const Razorpay = require('razorpay')

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, roomName } = await request.json()

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise (1 rupee = 100 paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        roomName: roomName,
      },
    })

    return NextResponse.json({ orderId: order.id, amount: order.amount })
  } catch (error) {
    console.error('Razorpay error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}