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
  const [joined, setJoined] = useState(false)

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
      alert('Something went wrong! Try again.')
      console.error(error)
      setJoining(false)
    } else {
      setJoined(true)
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

  if (joined) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-green-100">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">You are in!</h2>
          <p className="text-gray-500 text-sm mb-6">You have joined the room! Start chatting with your travel buddies while waiting for the room to fill up.</p>
          <a href={'/rooms/' + id} className="block w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold hover:shadow-lg transition-all">
            Go to Room
          </a>
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
            <li>🚪 You can leave within 24 hours for a full refund</li>
            <li>✅ All members are ID verified by Cucumber</li>
            <li>🥒 A Trip Captain will be present throughout</li>
            <li>💬 Chat and video call before final payment</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">
          <div className="font-bold text-gray-900 text-lg mb-1">{room?.name}</div>
          <div className="text-sm text-green-600">📍 {room?.destination}</div>
          {room?.dates && <div className="text-sm text-gray-400 mt-1">📅 {room?.dates}</div>}
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base hover:shadow-lg transition-all disabled:opacity-50 mb-3"
        >
          {joining ? 'Joining...' : 'Yes I want to Join!'}
        </button>

        <a href={'/rooms/' + id} className="block text-center text-sm text-gray-400 hover:text-gray-600">
          Go back
        </a>

      </div>
    </main>
  )
}