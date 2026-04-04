import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST() {
  try {
    const order = await razorpay.orders.create({
      amount: 19900, // ₹199 in paise
      currency: 'INR',
      receipt: 'video_call_' + Date.now(),
      notes: {
        purpose: 'Cucumber Video Call Token',
      },
    })
    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Razorpay order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}