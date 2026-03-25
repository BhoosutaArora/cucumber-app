'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    getUser()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥒</div>
          <div className="text-green-700 font-bold text-lg">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  const userEmail = user?.email || ''
  const userName = userEmail.split('@')[0] || 'Traveler'

  return (
    <main className="min-h-screen bg-green-50 font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-16 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </a>
        <div className="flex items-center gap-8">
          <a href="/" className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Home</a>
          <a href="/rooms" className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Rooms</a>
          <a href="/dashboard" className="text-sm font-bold text-green-700">Dashboard</a>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
              {userName[0].toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-green-700">{userName}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="pt-24 px-16 pb-16 max-w-7xl mx-auto">

        {/* ── WELCOME BANNER ── */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-green-200 text-sm font-semibold mb-1">Welcome back 👋</div>
              <div className="text-white text-3xl font-extrabold tracking-tight mb-1">
                Hey {userName}! 🥒
              </div>
              <div className="text-green-200 text-sm">Ready for your next adventure?</div>
            </div>
            <div className="flex items-center gap-6">
              {[
                { num: '0', label: 'Trips booked' },
                { num: '0', label: 'Rooms joined' },
                { num: '0', label: 'Travel buddies' },
              ].map((stat) => (
                <div key={stat.label} className="text-center bg-white/10 backdrop-blur rounded-2xl px-6 py-4 border border-white/20">
                  <div className="text-2xl font-extrabold text-white">{stat.num}</div>
                  <div className="text-xs text-green-200 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="col-span-2 flex flex-col gap-6">

            {/* upcoming trips */}
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-green-50">
                <div className="font-bold text-gray-900 text-lg">My Upcoming Trips</div>
                <a href="/rooms" className="text-xs font-bold text-green-600 hover:underline">Browse rooms →</a>
              </div>
              <div className="p-6">
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">🏔️</div>
                  <div className="font-bold text-gray-700 text-lg mb-2">No trips booked yet</div>
                  <div className="text-sm text-gray-400 mb-5">Your next adventure is waiting. Browse rooms and join one!</div>
                  <a href="/rooms" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all shadow-sm">
                    Find a Room 🥒
                  </a>
                </div>
              </div>
            </div>

            {/* recommended rooms */}
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-green-50">
                <div className="font-bold text-gray-900 text-lg">Recommended For You</div>
                <a href="/rooms" className="text-xs font-bold text-green-600 hover:underline">See all →</a>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                {[
                  { name: 'Adventure Squad 🏔️', dest: 'Spiti Valley', dates: 'Aug 14–17', seats: '1 seat left', color: 'from-indigo-900 to-purple-900', urgent: true },
                  { name: 'Peaceful Escape 🌿', dest: 'Shimla', dates: 'Aug 2–5', seats: '4 seats open', color: 'from-green-900 to-green-700', urgent: false },
                ].map((room) => (
                  <div key={room.name} className="rounded-xl border border-green-100 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer">
                    <div className={`h-20 bg-gradient-to-br ${room.color} flex items-end p-3`}>
                      <span className="text-xs font-bold text-white bg-black/30 px-2 py-1 rounded-lg">📍 {room.dest}</span>
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-gray-900 text-sm mb-1">{room.name}</div>
                      <div className="text-xs text-gray-400 mb-2">{room.dates}</div>
                      <div className={`text-xs font-bold ${room.urgent ? 'text-orange-500' : 'text-green-600'}`}>
                        {room.urgent ? '🔥' : '🌱'} {room.seats}
                      </div>
                      <button className="w-full mt-2 py-1.5 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold hover:scale-105 transition-transform">
                        Join Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-6">

            {/* profile card */}
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
              <div className="bg-gradient-to-br from-green-600 to-green-400 h-16 relative">
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-md">
                    {userName[0].toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="pt-8 pb-4 px-4 text-center">
                <div className="font-bold text-gray-900 text-lg">{userName}</div>
                <div className="text-xs text-green-600 font-semibold mt-1">🌱 New Traveler</div>
                <div className="text-xs text-gray-400 mt-1">{userEmail}</div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { num: '0', label: 'Trips' },
                    { num: '0', label: 'Reviews' },
                    { num: '—', label: 'Rating' },
                  ].map((s) => (
                    <div key={s.label} className="bg-green-50 rounded-xl py-2 border border-green-100">
                      <div className="font-bold text-green-700 text-lg">{s.num}</div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 rounded-xl border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-50 transition-all">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* quick actions */}
            <div className="bg-white rounded-2xl border border-green-100 p-4">
              <div className="font-bold text-gray-900 mb-3">Quick Actions</div>
              {[
                { icon: '🏠', label: 'Browse Rooms', href: '/rooms' },
                { icon: '👤', label: 'Edit Profile', href: '#' },
                { icon: '🔔', label: 'Notifications', href: '#' },
                { icon: '⚙️', label: 'Settings', href: '#' },
              ].map((action) => (
                <a key={action.label} href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-all cursor-pointer mb-1">
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-semibold text-gray-700">{action.label}</span>
                  <span className="ml-auto text-gray-300">→</span>
                </a>
              ))}
            </div>

            {/* account info */}
            <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
              <div className="font-bold text-green-700 text-sm mb-2">✅ Account Verified</div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Your email is verified. Complete your profile to unlock all features and join travel rooms.
              </div>
              <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
              </div>
              <div className="text-xs text-gray-400 mt-1">Profile 25% complete</div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}