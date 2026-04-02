'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function CreateRoom() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    gender_preference: 'any',
    is_private: false,
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
    if (!form.name) {
      alert('Please enter a room name!')
      return
    }
    setLoading(true)

    const roomCode = form.is_private
      ? Math.random().toString(36).substring(2, 8).toUpperCase()
      : null

    const { error } = await supabase.from('Rooms').insert({
      name: form.name,
      gender_preference: form.gender_preference,
      is_private: form.is_private,
      room_code: roomCode,
      created_by: user.id,
      status: 'Pending Approval',
    })

    if (error) {
      alert('Something went wrong! Try again.')
      console.error(error)
      setLoading(false)
    } else {
      window.location.href = '/rooms/success'
    }
  }

  return (
    <main className="min-h-screen bg-green-50 font-sans flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-extrabold text-green-700 block mb-6">
            cucumber<span className="text-green-400">.</span>
          </a>
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Create a Room</h1>
          <p className="text-gray-400 text-sm">Your room will be reviewed by Cucumber before going live!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-6 flex flex-col gap-5">

          {/* Room Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Room Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Girls Trip to Shimla 🏔️"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Who can join?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'any', label: '🌍 Everyone' },
                { value: 'women', label: '👩 Women Only' },
                { value: 'men', label: '👨 Men Only' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, gender_preference: option.value }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    form.gender_preference === option.value
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Private Room Toggle */}
          <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 border border-green-100">
            <div>
              <div className="font-semibold text-gray-900 text-sm">Private Room 🔒</div>
              <div className="text-xs text-gray-400">Like Among Us — only with the code!</div>
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

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Room 🥒'}
          </button>

          <a href="/rooms" className="block text-center text-xs text-gray-400 hover:text-gray-600">
            ← Back to Rooms
          </a>

        </div>
      </div>
    </main>
  )
}
