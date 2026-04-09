'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function RoomDetails() {
  const params = useParams()
  const id = params?.id as string
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAlreadyMember, setIsAlreadyMember] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    async function fetchRoom() {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch room data
      const { data, error } = await supabase
        .from('Rooms')
        .select('*, itineraries(*)')
        .eq('id', id)
        .single()
      if (error) console.error(error)
      else setRoom(data)

      // Check if user is already a member
      if (user) {
        const { data: membership } = await supabase
          .from('room_members')
          .select('id')
          .eq('room_id', id)
          .eq('user_id', user.id)
          .single()
        if (membership) setIsAlreadyMember(true)
      }

      setLoading(false)
    }
    fetchRoom()
  }, [id])

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

      <div className="pt-20 pb-24 px-4 md:px-16 max-w-3xl mx-auto">

        {/* Already member banner */}
        {isAlreadyMember && (
          <div className="bg-green-100 border border-green-300 rounded-2xl p-4 mb-5 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-bold text-green-800 text-sm">You are already in this room!</div>
              <div className="text-xs text-green-600 mt-0.5">Go to your room to chat, check members and seal the room.</div>
            </div>
            <a href={'/rooms/' + id + '/room'} className="ml-auto text-xs font-bold text-white bg-green-500 px-3 py-2 rounded-xl hover:bg-green-600 transition-all flex-shrink-0">
              Enter Room →
            </a>
          </div>
        )}

        {/* Room header */}
        <div className="rounded-3xl mb-6 text-white relative overflow-hidden" style={{backgroundImage: room.image_url ? 'url(' + room.image_url + ')' : 'linear-gradient(to right, #15803d, #22c55e)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="absolute inset-0 bg-black/40 rounded-3xl" />
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">{room.vibe}</span>
              {room.gender_preference && room.gender_preference !== 'any' && (
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                  {room.gender_preference === 'women' ? 'Women Only' : 'Men Only'}
                </span>
              )}
              {isAlreadyMember && (
                <span className="text-xs font-bold bg-green-500/80 px-3 py-1 rounded-full">✅ You're a member</span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{room.name}</h1>
            <div className="text-green-200 text-sm">📍 {room.destination}</div>
            {room.dates && <div className="text-green-200 text-sm mt-1">📅 {room.dates}</div>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Price', value: '₹' + (room.price?.toLocaleString() || '3,499') },
            { label: 'Seats Left', value: String((room.seats_total || 10) - (room.seats_filled || 0)) },
            { label: 'Duration', value: room.itineraries?.duration || '2 Days' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-green-100">
              <div className="font-extrabold text-green-700 text-lg">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-green-100">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-gray-600">{room.seats_filled || 0} / {room.seats_total || 10} seats filled</span>
            <span className="text-gray-400">{pct}%</span>
          </div>
          <div className="h-2 bg-green-100 rounded-full overflow-hidden">
            <div className={'h-full rounded-full ' + (pct >= 80 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-green-500')} style={{ width: pct + '%' }} />
          </div>
          <div className={'text-xs font-bold mt-2 ' + (pct >= 80 ? 'text-orange-500' : 'text-green-600')}>
            {pct >= 80 ? 'Almost full!' : 'Seats available'}
          </div>
        </div>

        {/* Description */}
        {room.itineraries?.description && (
          <div className="bg-white rounded-2xl p-5 mb-6 border border-green-100">
            <h2 className="font-bold text-gray-900 mb-2">About this trip</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{room.itineraries.description}</p>
          </div>
        )}

        {/* Itinerary Preview */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-green-100">
          <h2 className="font-bold text-gray-900 mb-3">Itinerary Preview</h2>
          {room.itineraries ? (
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">{room.itineraries.duration}</span>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">₹{room.itineraries.price?.toLocaleString() || room.price?.toLocaleString()} per person</span>
              </div>
              <div className="space-y-2">
                {room.itineraries.day_plan?.split('\n').slice(0, 2).map((day: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-xs font-bold text-green-600 w-16 flex-shrink-0">{day.split(':')[0]}</span>
                    <span>{day.split(':').slice(1).join(':')}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-16 text-xs font-bold text-gray-400">More...</span>
                  <span className="text-gray-400 italic">Full itinerary unlocks after joining</span>
                </div>
              </div>
              <div className="mt-4 bg-green-50 rounded-xl p-3 border border-green-100">
                <p className="text-xs text-green-700 font-medium">Join to unlock full day by day itinerary and hotel details!</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Itinerary coming soon!</p>
          )}
        </div>

        {/* Includes */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-green-100">
          <h2 className="font-bold text-gray-900 mb-3">What is Included</h2>
          <div className="grid grid-cols-2 gap-2">
            {(room.itineraries?.includes || 'Hotel stay, Transport, Meals, Activities, Trip Captain, 24/7 Support').split(',').map((item: string) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>{item.trim()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STICKY BOTTOM BUTTON */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-green-100 shadow-lg">
          <div className="max-w-3xl mx-auto">
            {isAlreadyMember ? (
              <a href={'/rooms/' + id + '/room'} className="block w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base text-center hover:shadow-lg transition-all shadow-md cursor-pointer">
                Enter Your Room 🥒
              </a>
            ) : user ? (
              <button onClick={() => { window.location.href = '/rooms/' + id + '/join' }} className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base text-center hover:shadow-lg transition-all shadow-md cursor-pointer">
                Join This Room →
              </button>
            ) : (
              <button onClick={() => { window.location.href = '/login' }} className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base text-center hover:shadow-lg transition-all shadow-md cursor-pointer">
                Sign in to Join →
              </button>
            )}
            <p className="text-center text-xs text-gray-400 mt-2">
              {isAlreadyMember ? 'You are already a member of this room!' : 'Free to join · Leave anytime within 24 hours'}
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}