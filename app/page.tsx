'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState<any>(null)
  const [membersCount, setMembersCount] = useState(0)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        setUsername(profile?.username || user.email?.split('@')[0] || 'Traveler')
      }
    }

    async function fetchRoom() {
      const { data } = await supabase
        .from('Rooms')
        .select('*')
        .eq('id', 2)
        .single()
      setRoom(data)

      const { count } = await supabase
        .from('room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', 2)
      setMembersCount(count || 0)
    }

    checkUser()
    fetchRoom()
  }, [])

  const seatsLeft = room ? room.seats_total - (room.seats_filled || 0) : 0
  const pct = room ? Math.round(((room.seats_filled || 0) / room.seats_total) * 100) : 0

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
        <div className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="/rooms" className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">Rooms</a>
          <a href="/dashboard" className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">Dashboard</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {username ? (
            <a href="/dashboard" className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                {username[0].toUpperCase()}
              </div>
              <span className="text-xs md:text-sm font-semibold text-green-700">{username}</span>
            </a>
          ) : (
            <a href="/login" className="text-xs md:text-sm font-semibold text-green-700 border border-green-200 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:bg-green-50 transition-all">
              Sign in
            </a>
          )}
          <a href="/rooms" className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:shadow-lg transition-all">
            Find Room →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden pt-14 md:pt-16 px-5 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,#C8F0C0,transparent_65%)] pointer-events-none" />
        <div className="absolute top-20 right-5 md:right-10 w-40 md:w-72 h-40 md:h-72 rounded-full bg-gradient-to-br from-green-200 to-green-400 opacity-10 animate-pulse" />
        <div className="absolute bottom-20 left-5 md:left-10 w-28 md:w-48 h-28 md:h-48 rounded-full bg-gradient-to-br from-green-300 to-green-500 opacity-10 animate-pulse" />

        <div className="relative z-10 text-center max-w-5xl w-full">
          <div className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs font-bold text-green-700 mb-6 md:mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
            Shimla trip is open — {seatsLeft > 0 ? `${seatsLeft} seats left!` : 'filling fast!'}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none tracking-tight text-gray-900 mb-5 md:mb-6">
            Travel <span className="text-green-500">together</span><br />
            with strangers<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">who get it.</span>
          </h1>

          <p className="text-sm md:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-8 md:mb-10">
            Cucumber connects you to small, curated travel rooms of 8–10 people who share your exact travel vibe. No boring group tours. No lonely solo trips.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-10 md:mb-16">
            <a href="/rooms/2" className="w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-extrabold text-sm md:text-base shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all text-center">
              Join Shimla Trip →
            </a>
            <a href="/login" className="w-full sm:w-auto px-7 py-3.5 md:py-4 rounded-2xl border-2 border-green-200 text-green-700 font-bold text-sm md:text-base bg-white hover:bg-green-50 transition-all text-center">
              Create account free
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-16">
            {[
              { num: '4 Days', label: '3 Nights Shimla' },
              { num: '₹6,999', label: 'All inclusive' },
              { num: '8–10', label: 'People per room' },
              { num: '🥒', label: 'Made in India' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl md:text-3xl font-extrabold text-green-700">{s.num}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE ROOM ── */}
      <section className="w-full bg-green-50 py-14 md:py-24 px-4 md:px-16">
        <div className="text-center mb-10 md:mb-14">
          <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">Live Now</div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">One trip. Your tribe.</h2>
          <p className="text-sm md:text-base text-gray-500">Our first Shimla trip is open. Be part of something real.</p>
        </div>

        {/* Real room card */}
        <div className="max-w-sm mx-auto bg-white rounded-2xl overflow-hidden border border-green-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="h-48 relative flex items-end p-4 overflow-hidden">
            <img
              src="https://qutczfwmdqlpeslqcwnt.supabase.co/storage/v1/object/public/image/yash-kiran-qxp9X5t9hQ4-unsplash.jpg"
              alt="Shimla"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="text-xs font-bold text-white bg-black/30 px-3 py-1 rounded-lg relative z-10">
              📍 {room?.destination || 'Shimla, HP'}
            </span>
          </div>
          <div className="p-5">
            <div className="font-bold text-gray-900 text-lg mb-1">{room?.name || 'Peaceful Escape 🌿'}</div>
            <div className="text-xs text-gray-400 mb-1">{room?.dates || 'Aug 2–5, 2026'}</div>
            <div className="text-xs text-gray-400 mb-3">{membersCount} member{membersCount !== 1 ? 's' : ''} joined · {seatsLeft} seats left</div>

            <div className="h-1.5 bg-green-100 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all" style={{width: `${pct}%`}} />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-400">Price per person</div>
                <div className="text-lg font-extrabold text-green-700">₹{room?.price?.toLocaleString() || '6,999'}</div>
              </div>
              <div className={`text-xs font-bold px-3 py-1 rounded-full ${seatsLeft <= 2 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                {seatsLeft <= 2 ? '🔥 Almost full!' : `🌱 ${seatsLeft} seats open`}
              </div>
            </div>

            <a href="/rooms/2" className="block w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:scale-105 transition-transform">
              View Room & Join →
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="w-full bg-white py-14 md:py-24 px-4 md:px-16">
        <div className="text-center mb-10 md:mb-14">
          <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">How it works</div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">From stranger to travel buddy<br />in 4 steps.</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto">
          {[
            {num:'01', icon:'🪪', title:'Sign up & verify', desc:'Create your profile and upload your government ID.'},
            {num:'02', icon:'🏠', title:'Join a room', desc:'Pick a destination and vibe. See exactly who\'s already in.'},
            {num:'03', icon:'🎥', title:'Video call first', desc:'Pay ₹199 token to meet your travel buddies on video before committing.'},
            {num:'04', icon:'✈️', title:'Travel together', desc:'Show up, meet your tribe, make memories.'},
          ].map((s) => (
            <div key={s.num} className="text-center p-4 md:p-8">
              <div className="text-4xl md:text-6xl font-extrabold text-green-100 leading-none mb-3 md:mb-4">{s.num}</div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-lg md:text-2xl mx-auto mb-3 md:mb-4">{s.icon}</div>
              <div className="font-bold text-gray-900 text-sm md:text-lg mb-2">{s.title}</div>
              <div className="text-xs md:text-sm text-gray-400 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-gray-950 py-10 md:py-16 px-4 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div>
              <div className="text-xl md:text-2xl font-extrabold text-green-400 mb-2">cucumber<span className="text-white opacity-40">.</span></div>
              <div className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-xs">Social travel for people who want real connections, not just destinations.</div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contact us</div>
              <a
                href="https://instagram.com/cucumbertravel.in"
                target="_blank"
                className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 hover:border-green-800 transition-all"
              >
                <span className="text-lg">📸</span>
                <span className="text-sm font-semibold text-gray-300">@cucumbertravel.in</span>
              </a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-800 pt-6 gap-3">
            <span className="text-xs text-gray-600 text-center">© 2025 Cucumber Travel · Made with love in India</span>
            <a href="/privacy-policy" className="text-xs text-gray-600 hover:text-green-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </main>
  )
}