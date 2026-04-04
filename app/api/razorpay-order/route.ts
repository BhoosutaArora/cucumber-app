import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Initialize inside function so env vars are loaded
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

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