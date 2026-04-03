'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')

  useEffect(() => {
    async function fetchRooms() {
      const { data, error } = await supabase
        .from('Rooms')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) console.error('Error fetching rooms:', error)
      else setRooms(data || [])
      setLoading(false)
    }

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

    fetchRooms()
    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🥒</div>
          <div className="text-green-700 font-bold text-lg">Loading rooms...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white font-sans">

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100">
        <a href="/" className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Home</a>
          <a href="/rooms" className="text-sm font-bold text-green-700">Rooms</a>
          <a href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Dashboard</a>
        </div>
        <div className="flex items-center gap-2">
          {username ? (
            <a href="/dashboard" className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                {username[0].toUpperCase()}
              </div>
              <span className="text-xs md:text-sm font-semibold text-green-700">{username}</span>
            </a>
          ) : (
            <a href="/login" className="text-xs md:text-sm font-semibold text-green-700 border border-green-200 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:bg-green-50 transition-all cursor-pointer">
              Sign in
            </a>
          )}
        </div>
      </nav>

      <section className="pt-20 md:pt-28 pb-8 md:pb-12 px-4 md:px-16 bg-green-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs font-bold text-green-700 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
              {rooms.length} rooms open right now
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2 md:mb-3">
              Travel <span className="text-green-500">Rooms</span>
            </h1>
            <p className="text-sm md:text-lg text-gray-500">Find your tribe. Travel together.</p>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            {[
              { num: rooms.length.toString(), label: 'Active rooms' },
              { num: '89', label: 'Online now' },
            ].map((s) => (
              <div key={s.label} className="text-center bg-white rounded-2xl px-5 md:px-8 py-3 md:py-4 border border-green-100 shadow-sm">
                <div className="text-2xl md:text-3xl font-extrabold text-green-700">{s.num}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-16 py-4 md:py-5 bg-white border-b border-green-50 sticky top-14 md:top-16 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-2 md:gap-3 overflow-x-auto pb-1">
          {["All Vibes", "Adventure", "Peaceful", "Explorer", "Beach"].map((f, i) => (
            <button key={f} className={'px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold border transition-all whitespace-nowrap cursor-pointer ' + (i === 0 ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-700')}>
              {f}
            </button>
          ))}
          <div className="ml-auto flex-shrink-0">
            <a href="/rooms/create" className="px-3 md:px-5 py-1.5 md:py-2 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white text-xs md:text-sm font-bold whitespace-nowrap cursor-pointer">
              + Create Room
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-16 py-6 md:py-10 max-w-7xl mx-auto">
        {rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏔️</div>
            <div className="font-bold text-gray-700 text-xl mb-2">No rooms yet!</div>
            <div className="text-gray-400">Check back soon.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {rooms.map((room: any) => {
              const pct = Math.round(((room.seats_filled || 0) / (room.seats_total || 10)) * 100)
              return (
                <div key={room.id} className="bg-white rounded-2xl overflow-hidden border border-green-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">

                  <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => { window.location.href = '/rooms/' + room.id }}>
                    {room.image_url ? (
                      <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-700 to-green-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <div className="text-white font-extrabold text-lg leading-tight">{room.name}</div>
                        <div className="text-white/80 text-xs mt-0.5">📍 {room.destination}</div>
                      </div>
                      <span className="text-xs font-bold bg-white/20 backdrop-blur text-white px-2 py-1 rounded-full flex-shrink-0">
                        {room.vibe}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xl font-extrabold text-green-700">₹{room.price?.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 ml-1">per person</span>
                      </div>
                      <span className="text-xs text-gray-400">{room.dates}</span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-600">{room.seats_filled || 0} / {room.seats_total || 10} seats</span>
                        <span className={pct >= 80 ? 'text-orange-500 font-bold' : 'text-green-600 font-bold'}>
                          {pct >= 80 ? 'Almost full' : 'Open'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                        <div
                          className={'h-full rounded-full ' + (pct >= 80 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-green-500')}
                          style={{ width: pct + '%' }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { window.location.href = '/rooms/' + room.id + '/join' }}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold hover:shadow-lg transition-all cursor-pointer"
                      >
                        Join Room
                      </button>
                      <button
                        onClick={() => { window.location.href = '/rooms/' + room.id }}
                        className="px-4 py-2.5 rounded-xl border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-50 transition-all cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </section>

      <footer className="bg-gray-950 py-8 md:py-10 px-4 md:px-16 text-center">
        <div className="text-xl md:text-2xl font-extrabold text-green-400 mb-2">cucumber<span className="text-white opacity-40">.</span></div>
        <div className="text-xs md:text-sm text-gray-600">© 2025 Cucumber Travel · Made with 🥒 in India</div>
      </footer>

    </main>
  )
}