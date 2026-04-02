'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RoomDetails({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRoom() {
      const { data, error } = await supabase
        .from('Rooms')
        .select('*')
        .eq('id', params.id)
        .single()
      if (error) console.error(error)
      else setRoom(data)
      setLoading(false)
    }
    fetchRoom()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🥒</div>
          <div className="text-green-700 font-bold text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏔️</div>
          <div className="text-gray-700 font-bold text-lg">Room not found!</div>
          <a href="/rooms" className="text-green-600 text-sm mt-2 block">Back to Rooms</a>
        </div>
      </div>
    )
  }

  const pct = Math.round(((room.seats_filled || 0) / (room.seats_total || 10)) * 100)

  return (
    <main className="min-h-screen bg-green-50 font-sans">

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl font-extrabold text-green-700">
          cucumber<span className="text-green-400">.</span>
        </a>
        <a href="/rooms" className="text-sm font-semibold text-gray-500 hover:text-green-700">
          Back to Rooms
        </a>
      </nav>

      <div className="pt-20 pb-16 px-4 md:px-16 max-w-3xl mx-auto">

        <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-3xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">{room.vibe}</span>
              {room.gender_preference !== 'any' && (
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                  {room.gender_preference === 'women' ? '👩 Women Only' : '👨 Men Only'}
                </span>
              )}
              {room.is_private && (
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">🔒 Private</span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{room.name}</h1>
            <div className="text-green-200 text-sm">📍 {room.destination}</div>
            {room.dates && (
              <div className="text-green-200 text-sm mt-1">📅 {room.dates}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Price', value: room.price ? 'Rs.' + room.price.toLocaleString() : 'TBD' },
            { label: 'Seats Left', value: String((room.seats_total || 10) - (room.seats_filled || 0)) },
            { label: 'Duration', value: room.duration || '4 Days' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-green-100">
              <div className="font-extrabold text-green-700 text-lg">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 mb-6 border border-green-100">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-gray-600">{room.seats_filled || 0} / {room.seats_total || 10} seats filled</span>
            <span className="text-gray-400">{pct}%</span>
          </div>
          <div className="h-2 bg-green-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 80 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-green-500'}`}
              style={{ width: pct + '%' }}
            />
          </div>
          <div className={`text-xs font-bold mt-2 ${pct >= 80 ? 'text-orange-500' : 'text-green-600'}`}>
            {pct >= 80 ? '🔥 Almost full!' : '🌱 Seats available'}
          </div>
        </div>

        {room.description && (
          <div className="bg-white rounded-2xl p-5 mb-6 border border-green-100">
            <h2 className="font-bold text-gray-900 mb-2">About this trip</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{room.description}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 mb-6 border border-green-100">
          <h2 className="font-bold text-gray-900 mb-3">Itinerary Preview 🗺️</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-16 text-xs font-bold text-green-600">Day 1</span>
              <span>Arrival + hotel check-in + local exploration</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-16 text-xs font-bold text-green-600">Day 2</span>
              <span>Main sightseeing + group activities</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-16 text-xs font-bold text-green-600">Day 3+</span>
              <span className="text-gray-400 italic">🔒 Full itinerary unlocks after joining</span>
            </div>
          </div>
          <div className="mt-4 bg-green-50 rounded-xl p-3 border border-green-100">
            <p className="text-xs text-green-700 font-medium">🔑 Pay Rs.199 to unlock full itinerary, hotel details, and meet your travel buddies!</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-6 border border-green-100">
          <h2 className="font-bold text-gray-900 mb-3">What is Included</h2>
          <div className="grid grid-cols-2 gap-2">
            {['🏨 Hotel stay', '🚌 Transport', '🍽️ Meals', '🎯 Activities', '🥒 Trip Captain', '📞 24/7 Support'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-4">
          
            href={'/rooms/' + params.id + '/join'}
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base text-center hover:shadow-lg transition-all shadow-md"
          >
            Join This Room 
          </a>
          <p className="text-center text-xs text-gray-400 mt-2">Rs.199 token · Refundable within 24 hours</p>
        </div>

      </div>
    </main>
  )
}