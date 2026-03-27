import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, name, roomName, destination, dates, price } = await request.json()

    const { data, error } = await resend.emails.send({
      from: 'Cucumber Travel <onboarding@resend.dev>',
      to: email,
      subject: `Booking Confirmed! ${roomName} 🥒`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#F0FAF0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          
          <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
            
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#2E7D32,#4CAF50);border-radius:20px;padding:32px;text-align:center;margin-bottom:20px;">
              <div style="font-size:36px;font-weight:900;color:#7ED957;letter-spacing:-1px;margin-bottom:8px;">cucumber.</div>
              <div style="font-size:16px;color:#C8F0C0;">Your adventure is confirmed! 🎉</div>
            </div>

            <!-- Booking Card -->
            <div style="background:#fff;border-radius:20px;padding:28px;margin-bottom:16px;border:1px solid #E8F5E9;">
              <div style="font-size:22px;font-weight:800;color:#1a1a1a;margin-bottom:4px;">${roomName}</div>
              <div style="font-size:14px;color:#4CAF50;font-weight:600;margin-bottom:16px;">📍 ${destination}</div>
              
              <div style="background:#F0FAF0;border-radius:12px;padding:16px;margin-bottom:16px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #E8F5E9;">
                      <span style="font-size:13px;color:#6B7280;">Traveler</span>
                    </td>
                    <td style="padding:8px 0;border-bottom:1px solid #E8F5E9;text-align:right;">
                      <span style="font-size:13px;font-weight:700;color:#1a1a1a;">${name}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #E8F5E9;">
                      <span style="font-size:13px;color:#6B7280;">Dates</span>
                    </td>
                    <td style="padding:8px 0;border-bottom:1px solid #E8F5E9;text-align:right;">
                      <span style="font-size:13px;font-weight:700;color:#1a1a1a;">${dates}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="font-size:13px;color:#6B7280;">Amount Paid</span>
                    </td>
                    <td style="padding:8px 0;text-align:right;">
                      <span style="font-size:16px;font-weight:800;color:#2E7D32;">₹${price?.toLocaleString()}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="background:linear-gradient(135deg,#E8F5E9,#C8F0C0);border-radius:12px;padding:14px;text-align:center;border:1px solid #A5D6A7;">
                <div style="font-size:13px;font-weight:700;color:#2E7D32;">✅ Payment Successful · Seat Confirmed</div>
              </div>
            </div>

            <!-- What's included -->
            <div style="background:#fff;border-radius:20px;padding:24px;margin-bottom:16px;border:1px solid #E8F5E9;">
              <div style="font-size:16px;font-weight:800;color:#1a1a1a;margin-bottom:14px;">What's included in your trip</div>
              <div style="display:grid;gap:10px;">
                ${['🏨 Hotel / Homestay accommodation', '🚌 AC transport to and from destination', '🍽️ Breakfast and dinner daily', '🎯 2-3 curated activities', '👥 Small group of 8-10 verified travelers', '📞 Dedicated trip coordinator'].map(item => `
                  <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#F0FAF0;border-radius:10px;">
                    <span style="font-size:14px;">${item}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Next steps -->
            <div style="background:#fff;border-radius:20px;padding:24px;margin-bottom:16px;border:1px solid #E8F5E9;">
              <div style="font-size:16px;font-weight:800;color:#1a1a1a;margin-bottom:14px;">What happens next?</div>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;gap:12px;align-items:flex-start;">
                  <div style="width:28px;height:28px;border-radius:50%;background:#4CAF50;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;">1</div>
                  <div><div style="font-size:13px;font-weight:700;color:#1a1a1a;">Join your Room Chat</div><div style="font-size:12px;color:#6B7280;margin-top:2px;">Meet your travel buddies in the room chat — it opens 7 days before the trip.</div></div>
                </div>
                <div style="display:flex;gap:12px;align-items:flex-start;">
                  <div style="width:28px;height:28px;border-radius:50%;background:#4CAF50;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;">2</div>
                  <div><div style="font-size:13px;font-weight:700;color:#1a1a1a;">Pre-trip Video Call</div><div style="font-size:12px;color:#6B7280;margin-top:2px;">2 days before the trip, meet everyone on a quick video call.</div></div>
                </div>
                <div style="display:flex;gap:12px;align-items:flex-start;">
                  <div style="width:28px;height:28px;border-radius:50%;background:#4CAF50;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;">3</div>
                  <div><div style="font-size:13px;font-weight:700;color:#1a1a1a;">Show up on Day 1</div><div style="font-size:12px;color:#6B7280;margin-top:2px;">Your coordinator will greet you at the meeting point. Adventure begins! 🏔️</div></div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align:center;padding:16px;">
              <div style="font-size:20px;font-weight:800;color:#2E7D32;margin-bottom:6px;">cucumber.</div>
              <div style="font-size:12px;color:#9CA3AF;">Find your tribe. Travel together.</div>
              <div style="font-size:11px;color:#D1D5DB;margin-top:8px;">© 2025 Cucumber Travel Pvt. Ltd. · Made with 🥒 in India</div>
            </div>

          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}