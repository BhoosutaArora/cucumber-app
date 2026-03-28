'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function BookingConfirmed() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

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
  }, [])

  const userName = user?.email?.split('@')[0] || 'Traveler'

  return (
    <main className="min-h-screen bg-green-50 font-sans">

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
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
        .slide-up { animation: slideUp 0.5s ease forwards; }
        .slide-up-1 { animation: slideUp 0.5s ease 0.1s forwards; opacity: 0; }
        .slide-up-2 { animation: slideUp 0.5s ease 0.2s forwards; opacity: 0; }
        .slide-up-3 { animation: slideUp 0.5s ease 0.3s forwards; opacity: 0; }
        .slide-up-4 { animation: slideUp 0.5s ease 0.4s forwards; opacity: 0; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </a>
        <a href="/dashboard" className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-4 py-2 rounded-xl">
          My Dashboard →
        </a>
      </nav>

      <div className="pt-20 md:pt-24 px-4 md:px-8 pb-16 max-w-2xl mx-auto">

        {/* ── SUCCESS ICON ── */}
        <div className="text-center mb-8 pop-in">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <polyline points="20,6 9,17 4,12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            You're in! 🎉
          </h1>
          <p className="text-base md:text-lg text-gray-500">
            Welcome to the tribe, <span className="font-bold text-green-600">{userName}</span>! Your seat is confirmed.
          </p>
        </div>

        {/* ── BOOKING CARD ── */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-green-100 overflow-hidden shadow-lg shadow-green-50 mb-5 slide-up-1">
          <div className="bg-gradient-to-r from-green-700 to-green-500 px-6 py-4">
            <div className="text-green-200 text-xs font-bold uppercase tracking-widest mb-1">Booking Confirmed</div>
            <div className="text-white text-xl md:text-2xl font-extrabold">Adventure Squad 🏔️</div>
            <div className="text-green-200 text-sm mt-1">📍 Spiti Valley, HP · Aug 14–17, 2025</div>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between py-3 border-b border-green-50">
              <span className="text-sm text-gray-500">Traveler</span>
              <span className="text-sm font-bold text-gray-900">{userName}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-green-50">
              <span className="text-sm text-gray-500">Booking ID</span>
              <span className="text-sm font-bold text-gray-900">CUC-2025001</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-green-50">
              <span className="text-sm text-gray-500">Amount Paid</span>
              <span className="text-base font-extrabold text-green-700">₹7,499</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ Confirmed</span>
            </div>
          </div>
        </div>

        {/* ── EMAIL NOTICE ── */}
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3 slide-up-2">
          <span className="text-2xl flex-shrink-0">📧</span>
          <div>
            <div className="font-bold text-green-800 text-sm mb-1">Confirmation email sent!</div>
            <div className="text-xs text-green-600 leading-relaxed">We've sent your booking details to <strong>{user?.email}</strong>. Check your inbox — it has everything you need for the trip.</div>
          </div>
        </div>

        {/* ── WHAT'S NEXT ── */}
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm mb-5 slide-up-3">
          <div className="px-5 py-4 border-b border-green-50">
            <div className="font-bold text-gray-900 text-base">What happens next?</div>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            {[
              { num: '1', icon: '💬', title: 'Join your Room Chat', desc: 'Opens 7 days before the trip. Meet your travel buddies and start planning!', time: '7 days before' },
              { num: '2', icon: '📹', title: 'Pre-trip Video Call', desc: 'A quick 30-min video call with your group 2 days before departure.', time: '2 days before' },
              { num: '3', icon: '📍', title: 'Meet on Day 1', desc: 'Your coordinator will be at the meeting point. Adventure begins!', time: 'Aug 14, 2:00 PM' },
            ].map((step) => (
              <div key={step.num} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {step.num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="font-bold text-gray-900 text-sm">{step.icon} {step.title}</div>
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">{step.time}</span>
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHATS INCLUDED ── */}
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm mb-8 slide-up-4">
          <div className="px-5 py-4 border-b border-green-50">
            <div className="font-bold text-gray-900 text-base">What's included in your trip</div>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 gap-3">
            {[
              '🏨 Hotel / Homestay',
              '🚌 AC Transport',
              '🍽️ Breakfast & Dinner',
              '🎯 2-3 Activities',
              '👥 8-10 Travelers',
              '📞 Trip Coordinator',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-600 bg-green-50 rounded-xl px-3 py-2.5">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA BUTTONS ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="/dashboard" className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:shadow-lg hover:scale-105 transition-all shadow-md shadow-green-200">
            Go to My Dashboard →
          </a>
          <a href="/rooms" className="flex-1 py-3.5 rounded-2xl border-2 border-green-200 text-green-700 font-bold text-sm text-center hover:bg-green-50 transition-all">
            Browse More Rooms
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Questions? Email us at <span className="text-green-600 font-semibold">hello@cucumber.travel</span>
        </p>

      </div>
    </main>
  )
}