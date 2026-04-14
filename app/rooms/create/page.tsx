'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'

const DESTINATIONS = [
  'Shimla, Himachal Pradesh',
  'Amritsar, Punjab',
  'Manali, Himachal Pradesh',
  'Goa',
  'Rishikesh, Uttarakhand',
  'Spiti Valley, Himachal Pradesh',
  'Leh Ladakh',
  'Jaipur, Rajasthan',
  'Kasol, Himachal Pradesh',
  'Mcleod Ganj, Himachal Pradesh',
  'Other',
]

const VIBES = ['Adventure', 'Chill', 'Cultural', 'Explorer']

export default function CreateRoom() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    destination: '',
    dates: '',
    seats: '6',
    vibe: 'Adventure',
    gender_preference: 'any',
    note: '',
  })

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
    }
    getUser()
  }, [])

  async function handleSubmit() {
    if (!form.destination || !form.dates) {
      alert('Please fill destination and dates!')
      return
    }
    setLoading(true)

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    const roomName = (profile?.username || 'Traveler') + ' trip to ' + form.destination.split(',')[0]

    const { error } = await supabase.from('Rooms').insert({
      name: roomName,
      destination: form.destination,
      dates: form.dates,
      seats_total: parseInt(form.seats),
      seats_filled: 0,
      vibe: form.vibe,
      gender_preference: form.gender_preference,
      created_by: user.id,
      status: 'Pending Approval',
      description: form.note,
    })

    if (error) {
      alert('Something went wrong! Try again.')
      console.error(error)
      setLoading(false)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-green-50 font-sans flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🥒</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Request sent!</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your trip request has been sent to the Cucumber team. We will review it and get back to you within 24 hours!
          </p>
          <a href="/rooms" className="block w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:shadow-lg transition-all">
            Browse Existing Trips
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 font-sans pb-20 md:pb-0">

      <Navbar />

      <div className="pt-20 pb-16 px-4 max-w-lg mx-auto">

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✈️</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Request a Trip</h1>
          <p className="text-gray-500 text-sm">Tell us where you want to go and we will make it happen!</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5">
          <div className="text-sm font-bold text-yellow-800 mb-1">How this works</div>
          <div className="text-xs text-yellow-700 leading-relaxed">You suggest a trip. Cucumber reviews and approves it. Once approved it goes live and other travelers can join. You will be the first member!</div>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 p-5 flex flex-col gap-5">

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Where do you want to go?</label>
            <select
              value={form.destination}
              onChange={e => setForm(prev => ({ ...prev, destination: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400 transition-all bg-white"
            >
              <option value="">Select destination...</option>
              {DESTINATIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">When do you want to go?</label>
            <input
              type="text"
              value={form.dates}
              onChange={e => setForm(prev => ({ ...prev, dates: e.target.value }))}
              placeholder="e.g. May 10-13, 2026"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400 transition-all"
            />
          </div>

          {/* Seats */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">How many people? (including you)</label>
            <div className="flex gap-2 flex-wrap">
              {['4', '5', '6', '7', '8', '10'].map(s => (
                <button
                  key={s}
                  onClick={() => setForm(prev => ({ ...prev, seats: s }))}
                  className={'px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ' + (form.seats === s ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">What is the vibe?</label>
            <div className="flex gap-2 flex-wrap">
              {VIBES.map(v => (
                <button
                  key={v}
                  onClick={() => setForm(prev => ({ ...prev, vibe: v }))}
                  className={'px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ' + (form.vibe === v ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300')}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Who can join?</label>
            <div className="flex gap-2">
              {[
                { value: 'any', label: 'Everyone' },
                { value: 'women', label: 'Women Only' },
                { value: 'men', label: 'Men Only' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setForm(prev => ({ ...prev, gender_preference: option.value }))}
                  className={'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ' + (form.gender_preference === option.value ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300')}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note to admin */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Anything else you want to tell us? (optional)</label>
            <textarea
              value={form.note}
              onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
              placeholder="e.g. I want a peaceful trip with fellow book lovers..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Sending request...' : 'Request this Trip'}
          </button>

          <a href="/rooms" className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Back to Rooms
          </a>

        </div>
      </div>
    </main>
  )
}