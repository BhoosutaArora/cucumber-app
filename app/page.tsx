'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [username, setUsername] = useState('')

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
    checkUser()
  }, [])

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
        <div className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="/explore" className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">Explore</a>
          <a href="/rooms" className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">Rooms</a>
          <a href="/dashboard" className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">My Trips</a>
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
      <section className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden pt-14 md:pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,#C8F0C0,transparent_65%)] pointer-events-none" />
        <div className="absolute top-20 right-5 md:right-10 w-40 md:w-72 h-40 md:h-72 rounded-full bg-gradient-to-br from-green-200 to-green-400 opacity-10 animate-pulse" />
        <div className="absolute bottom-20 left-5 md:left-10 w-28 md:w-48 h-28 md:h-48 rounded-full bg-gradient-to-br from-green-300 to-green-500 opacity-10 animate-pulse" />

        <div className="relative z-10 text-center max-w-5xl px-5 md:px-8 w-full">
          <div className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs font-bold text-green-700 mb-6 md:mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
            12,000+ travelers have found their tribe
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
            <a href="/rooms" className="w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-extrabold text-sm md:text-base shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all text-center">
              Find Your Room →
            </a>
            <a href="/login" className="w-full sm:w-auto px-7 py-3.5 md:py-4 rounded-2xl border-2 border-green-200 text-green-700 font-bold text-sm md:text-base bg-white hover:bg-green-50 transition-all text-center">
              See the community
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-16">
            {[
              { num: '48', label: 'Active rooms' },
              { num: '12K+', label: 'Travelers joined' },
              { num: '4.9 ⭐', label: 'Avg rating' },
              { num: '847', label: 'Trips completed' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl md:text-3xl font-extrabold text-green-700">{s.num}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROOMS SECTION ── */}
      <section className="w-full bg-green-50 py-14 md:py-24 px-4 md:px-16">
        <div className="text-center mb-10 md:mb-14">
          <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">Travel Rooms</div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">Pick your vibe. Join the room.</h2>
          <p className="text-sm md:text-base text-gray-500">Every destination, three vibes. Find your people in seconds.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-width-7xl mx-auto">
          {[
            { name: 'Adventure Squad 🏔️', dest: 'Spiti Valley, HP', dates: 'Aug 14–17, 2025', pct: 90, color: 'from-indigo-900 to-purple-900', status: '🔥 1 seat remaining', statusColor: 'text-orange-500', members: ['P','S','A','+6'], colors: ['#7B1FA2','#1565C0','#B71C1C','#E65100'] },
            { name: 'Peaceful Escape 🌿', dest: 'Shimla, HP', dates: 'Aug 2–5, 2025', pct: 60, color: 'from-green-900 to-green-700', status: '🌱 4 seats open', statusColor: 'text-green-600', members: ['P','N','+4'], colors: ['#7B1FA2','#00695C','#2E7D32'] },
            { name: 'Explorer Crew 🏛️', dest: 'Jaipur, Rajasthan', dates: 'Sep 5–8, 2025', pct: 25, color: 'from-orange-900 to-red-800', status: '🆕 Just opened!', statusColor: 'text-blue-500', members: ['D','K'], colors: ['#0277BD','#AD1457'] },
          ].map((room) => (
            <div key={room.name} className="bg-white rounded-2xl overflow-hidden border border-green-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className={`h-36 md:h-48 bg-gradient-to-br ${room.color} relative flex items-end p-3 md:p-4`}>
                <span className="text-xs font-bold text-white bg-black/30 px-2 md:px-3 py-1 rounded-lg relative z-10">📍 {room.dest}</span>
              </div>
              <div className="p-4 md:p-5">
                <div className="font-bold text-gray-900 text-base md:text-lg mb-1">{room.name}</div>
                <div className="text-xs text-gray-400 mb-3">{room.dates}</div>
                <div className="h-1.5 bg-green-100 rounded-full mb-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{width:`${room.pct}%`}} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex">
                    {room.members.map((m, i) => (
                      <div key={i} className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold -ml-1.5 first:ml-0" style={{background: room.colors[i] || '#2E7D32'}}>{m}</div>
                    ))}
                  </div>
                  <a href="/rooms" className="text-xs font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-3 py-1.5 rounded-lg hover:scale-105 transition-transform">
                    Join Room
                  </a>
                </div>
                <div className={`text-xs font-semibold mt-3 ${room.statusColor}`}>{room.status}</div>
              </div>
            </div>
          ))}
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
            {num:'01', icon:'🪪', title:'Sign up & verify', desc:'Create your profile, take the vibe quiz, upload your government ID.'},
            {num:'02', icon:'🏠', title:'Browse rooms', desc:'Pick a destination and vibe. See exactly who\'s already joined.'},
            {num:'03', icon:'💳', title:'Book your seat', desc:'Pay once. Everything included — hotel, transport, meals, activities.'},
            {num:'04', icon:'✈️', title:'Travel together', desc:'Meet your tribe in the pre-trip video call, then show up on day one.'},
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-7xl mx-auto mb-8 md:mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl md:text-2xl font-extrabold text-green-400 mb-3">cucumber<span className="text-white opacity-40">.</span></div>
            <div className="text-xs md:text-sm text-gray-500 leading-relaxed">Social travel for people who want real connections, not just destinations.</div>
          </div>
          {[
            {title:'Product', links:['Browse Rooms','Explore Feed','Pricing','Blog']},
            {title:'Safety', links:['ID Verification','Community Guidelines','Trust & Safety','Insurance']},
            {title:'Company', links:['About','Careers','Press','Contact']},
          ].map((col) => (
            <div key={col.title}>
              <div className="text-xs md:text-sm font-bold text-gray-300 mb-3 md:mb-4">{col.title}</div>
              {col.links.map(l => <div key={l} className="text-xs md:text-sm text-gray-600 mb-2 cursor-pointer hover:text-green-400 transition-colors">{l}</div>)}
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-800 pt-6 max-w-7xl mx-auto gap-3">
          <span className="text-xs text-gray-600 text-center">© 2025 Cucumber Travel Pvt. Ltd. · Made with 🥒 in India</span>
          <span className="text-xs text-gray-600">Privacy Policy · Terms</span>
        </div>
      </footer>

    </main>
  )
}