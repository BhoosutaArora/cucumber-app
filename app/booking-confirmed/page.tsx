'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

function BookingConfirmedContent() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const [user, setUser] = useState<any>(null)
  const [room, setRoom] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      setUsername(profile?.username || user.email?.split('@')[0] || 'Traveler')

      if (roomId) {
        const { data: roomData } = await supabase
          .from('Rooms')
          .select('*')
          .eq('id', roomId)
          .single()
        setRoom(roomData)
      }

      setLoading(false)

      // Confetti effect
      const colors = ['#7ED957', '#4CAF50', '#C8F0C0', '#2E7D32', '#AEEA00']
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div')
          confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            left: ${Math.random() * 100}vw;
            top: -20px;
            z-index: 9999;
            pointer-events: none;
            animation: fall ${Math.random() * 3 + 2}s linear forwards;
          `
          document.body.appendChild(confetti)
          setTimeout(() => confetti.remove(), 5000)
        }, i * 30)
      }
    }
    init()
  }, [roomId])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Loading your confirmation...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 font-sans pb-20 md:pb-0">

      <style>{`
        @keyframes fall {
          to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pop-in { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .slide-up-1 { animation: slideUp 0.5s ease 0.1s forwards; opacity: 0; }
        .slide-up-2 { animation: slideUp 0.5s ease 0.2s forwards; opacity: 0; }
        .slide-up-3 { animation: slideUp 0.5s ease 0.3s forwards; opacity: 0; }
        .slide-up-4 { animation: slideUp 0.5s ease 0.4s forwards; opacity: 0; }
      `}</style>

      <Navbar />

      <div className="pt-20 md:pt-24 px-4 md:px-8 pb-16 max-w-2xl mx-auto">

        {/* SUCCESS ICON */}
        <div className="text-center mb-8 pop-in">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <polyline points="20,6 9,17 4,12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            You are in! 🎉
          </h1>
          <p className="text-base md:text-lg text-gray-500">
            Welcome to the tribe, <span className="font-bold text-green-600">{username}</span>! Your seat is confirmed.
          </p>
        </div>

        {/* BOOKING CARD */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-green-100 overflow-hidden shadow-lg shadow-green-50 mb-5 slide-up-1">
          <div className="bg-gradient-to-r from-green-700 to-green-500 px-6 py-4">
            <div className="text-green-200 text-xs font-bold uppercase tracking-widest mb-1">Booking Confirmed</div>
            <div className="text-white text-xl md:text-2xl font-extrabold">{room?.name}</div>
            <div className="text-green-200 text-sm mt-1">📍 {room?.destination} · {room?.dates}</div>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between py-3 border-b border-green-50">
              <span className="text-sm text-gray-500">Traveler</span>
              <span className="text-sm font-bold text-gray-900">{username}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-green-50">
              <span className="text-sm text-gray-500">Trip</span>
              <span className="text-sm font-bold text-gray-900">{room?.destination}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-green-50">
              <span className="text-sm text-gray-500">Amount Paid</span>
              <span className="text-base font-extrabold text-green-700">₹{room?.price?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Confirmed</span>
            </div>
          </div>
        </div>

        {/* WHATSAPP NOTICE */}
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3 slide-up-2">
          <span className="text-2xl flex-shrink-0">💬</span>
          <div>
            <div className="font-bold text-green-800 text-sm mb-1">We will WhatsApp you!</div>
            <div className="text-xs text-green-600 leading-relaxed">
              We will send all trip details — meeting point, what to pack, hotel info — to your registered phone number within 24 hours!
            </div>
          </div>
        </div>

        {/* WHAT TO EXPECT */}
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm mb-5 slide-up-3">
          <div className="px-5 py-4 border-b border-green-50">
            <div className="font-bold text-gray-900 text-base">What happens next?</div>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            {[
              { num: '1', icon: '💬', title: 'Check your WhatsApp', desc: 'We will send you all trip details on your registered number within 24 hours.' },
              { num: '2', icon: '🎒', title: 'Pack light', desc: 'Weekend trip — just the essentials. Good shoes, warm layer, ID proof.' },
              { num: '3', icon: '📍', title: 'Show up and vibe', desc: 'Meet your travel buddies at the pickup point. Adventure begins!' },
            ].map((step) => (
              <div key={step.num} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {step.num}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-sm mb-0.5">{step.icon} {step.title}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REFUND POLICY */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl px-5 py-4 mb-8 slide-up-4">
          <div className="font-bold text-yellow-800 text-sm mb-2">Refund Policy</div>
          <div className="flex flex-col gap-1.5">
            {[
              { icon: 'V', color: 'text-green-500', text: '90% back if cancelled 30+ days before trip' },
              { icon: '~', color: 'text-yellow-500', text: '50% back if cancelled 15-30 days before trip' },
              { icon: 'X', color: 'text-red-400', text: 'No refund if cancelled less than 15 days before trip' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-xs text-gray-600">
                <span className={'font-bold ' + item.color}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={'/rooms/' + roomId + '/room'}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:shadow-lg hover:scale-105 transition-all shadow-md shadow-green-200"
          >
            Go to Room
          </a>
          <a
            href="/rooms"
            className="flex-1 py-3.5 rounded-2xl border-2 border-green-200 text-green-700 font-bold text-sm text-center hover:bg-green-50 transition-all"
          >
            Browse More Trips
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Questions? WhatsApp us at <span className="text-green-600 font-semibold">+91 6284838263</span>
        </p>

      </div>
    </main>
  )
}

export default function BookingConfirmed() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Loading your confirmation...</div>
        </div>
      </div>
    }>
      <BookingConfirmedContent />
    </Suspense>
  )
}