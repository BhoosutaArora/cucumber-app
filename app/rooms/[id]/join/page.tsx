'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function JoinRoom() {
  const params = useParams()
  const id = params?.id as string
  const [room, setRoom] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: room } = await supabase
        .from('Rooms')
        .select('*')
        .eq('id', id)
        .single()
      setRoom(room)

      const { data: existing } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', id)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        window.location.href = '/rooms/' + id + '/room'
        return
      }

      setLoading(false)
    }
    if (id) load()
  }, [id])

  async function handleJoin() {
    setJoining(true)

    const { error } = await supabase.from('room_members').insert({
      room_id: id,
      user_id: user.id,
      status: 'pending',
      joined_at: new Date().toISOString(),
    })

    if (error) {
      alert('Error: ' + error.message)
      setJoining(false)
    } else {
      // Auto update seats count
      await supabase.rpc('increment_seats', { room_id: parseInt(id) })
      window.location.href = '/rooms/' + id + '/room'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <a href="/" className="text-2xl font-extrabold text-green-700 block mb-4">
            cucumber<span className="text-green-400">.</span>
          </a>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-4">
          <div className="text-lg font-extrabold text-yellow-800 mb-2">Before you join!</div>
          <ul className="text-sm text-yellow-700 space-y-2">
  <li>✋ Be sure about who you travel with</li>
  <li>👀 You will see member profiles after joining</li>
  <li>✅ All members are verified by Cucumber</li>
  <li>🎥 Pay ₹35 to unlock video call with your group</li>
  <li>❌ ₹35 video call token is non refundable</li>
  <li>💬 Chat with your travel buddies before the trip</li>
</ul>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">
          <div className="font-bold text-gray-900 text-lg mb-1">{room?.name}</div>
          <div className="text-sm text-green-600">📍 {room?.destination}</div>
          {room?.dates && (
            <div className="text-sm text-gray-400 mt-1">📅 {room?.dates}</div>
          )}
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50 mb-3"
        >
          {joining ? 'Joining...' : 'Yes I want to Join!'}
        </button>

        <button
          onClick={() => { window.location.href = '/rooms/' + id }}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2"
        >
          Go back
        </button>

      </div>
    </main>
  )
}