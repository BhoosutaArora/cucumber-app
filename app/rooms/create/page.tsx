'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function CreateRoom() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    destination: '',
    description: '',
    dates: '',
    price: '',
    seats_total: '8',
    vibe: '🏔️ Adventure',
    gender_preference: 'any',
    is_private: false,
    itinerary: '',
  })

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) window.location.href = '/login'
      else setUser(user)
    }
    getUser()
  }, [])

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.destination || !form.dates || !form.price) {
      setMessage('Please fill in all required fields!')
      return
    }
    setLoading(true)

    const roomCode = form.is_private 
      ? Math.random().toString(36).substring(2, 8).toUpperCase() 
      : null

    const { error } = await supabase.from('Rooms').insert({
      name: form.name,
      destination: form.destination,
      description: form.description,
      dates: form.dates,
      price: parseInt(form.price),
      seats_total: parseInt(form.seats_total),
      seats_filled: 0,
      vibe: form.vibe,
      gender_preference: form.gender_preference,
      is_private: form.is_private,
      room_code: roomCode,
      created_by: user.id,
      itinerary: form.itinerary,
      status: 'Pending Approval',
    })

    if (error) {
      setMessage('Something went wrong! Try again.')
      console.error(error)
    } else {
      window.location.href = '/rooms/success'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-green-50 font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl font-extrabold text-green-700">
          cucumber<span className="text-green-400">.</span>
        </a>
        <a href="/rooms" className="text-sm font-semibold text-gray-500 hover:text-green-700">
          ← Back to Rooms
        </a>
      </nav>

      <div className="pt-20 pb-16 px-4 md:px-16 max-w-3xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create a Room</h1>
          <p className="text-gray-500 text-sm">Your room will be reviewed by Cucumber before going live!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-6 md:p-8 flex flex-col gap-5">

          {/* Room Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Room Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Adventure Squad Shimla 🏔️"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Destination *</label>
            <input
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="e.g. Shimla, Himachal Pradesh"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell people about this trip — what's the vibe, who should join..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all resize-none"
            />
          </div>

          {/* Dates */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Dates *</label>
            <input
              name="dates"
              value={form.dates}
              onChange={handleChange}
              placeholder="e.g. Aug 14–17, 2025"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>

          {/* Price + Seats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Price per person (₹) *</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 8000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Max Seats</label>
              <select
                name="seats_total"
                value={form.seats_total}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 transition-all"
              >
                {[4,6,8,10,12].map(n => (
                  <option key={n} value={n}>{n} people</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vibe + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Vibe</label>
              <select
                name="vibe"
                value={form.vibe}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 transition-all"
              >
                {['🏔️ Adventure', '🌿 Peaceful', '🏛️ Explorer', '🏖️ Beach', '🎉 Party'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Gender Preference</label>
              <select
                name="gender_preference"
                value={form.gender_preference}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 transition-all"
              >
                <option value="any">Everyone Welcome</option>
                <option value="women">Women Only</option>
                <option value="men">Men Only</option>
              </select>
            </div>
          </div>

          {/* Itinerary */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Itinerary</label>
            <textarea
              name="itinerary"
              value={form.itinerary}
              onChange={handleChange}
              placeholder="Day 1: Arrive in Shimla, check in hotel, explore Mall Road&#10;Day 2: Kufri trip, snow activities&#10;Day 3: Jakhu Temple, local food tour&#10;Day 4: Departure"
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all resize-none"
            />
          </div>

          {/* Private Room Toggle */}
          <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 border border-green-100">
            <div>
              <div className="font-semibold text-gray-900 text-sm">Private Room 🔒</div>
              <div className="text-xs text-gray-400">Only people with the code can join</div>
            </div>
            <input
              type="checkbox"
              name="is_private"
              checked={form.is_private}
              onChange={handleChange}
              className="w-5 h-5 accent-green-500"
            />
          </div>

          {form.is_private && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-700 font-medium">
              🔑 A unique room code will be generated automatically when your room is approved!
            </div>
          )}

          {message && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Room 🥒'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Your room will be reviewed by Cucumber team before going live. Usually approved within 24 hours!
          </p>

        </div>
      </div>
    </main>
  )
}