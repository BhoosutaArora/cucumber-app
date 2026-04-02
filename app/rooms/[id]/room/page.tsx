'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function RoomPage() {
  const params = useParams()
  const id = params?.id as string
  const [room, setRoom] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: membership } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', id)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        window.location.href = '/rooms/' + id
        return
      }

      const { data: roomData } = await supabase
        .from('Rooms')
        .select('*')
        .eq('id', id)
        .single()
      setRoom(roomData)

      const { data: membersRaw } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', id)

      const membersWithProfiles = await Promise.all(
        (membersRaw || []).map(async (member: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', member.user_id)
            .single()
          return { ...member, profiles: profile }
        })
      )
      setMembers(membersWithProfiles)
      setLoading(false)
    }
    if (id) load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Loading your room...</div>
        </div>
      </div>
    )
  }

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

        <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
          <div className="relative z-10">
            <div className="text-green-200 text-xs font-bold mb-1">YOU ARE A MEMBER</div>
            <h1 className="text-2xl font-extrabold mb-1">{room?.name}</h1>
            <div className="text-green-200 text-sm">📍 {room?.destination}</div>
            {room?.dates && <div className="text-green-200 text-sm mt-1">📅 {room?.dates}</div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Travel Buddies ({members.length})</h2>
          {members.length === 0 ? (
            <p className="text-gray-400 text-sm">No members yet!</p>
          ) : (
            <div className="space-y-2">
              {members.map((member: any) => (
                
                  key={member.id}
                  href={'/profile/' + (member.profiles?.username || '')}
                  className="flex items-center gap-3 hover:bg-green-50 rounded-xl p-2 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                    {(member.profiles?.username || 'T')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">
                      {member.profiles?.username || 'Traveler'}
                    </div>
                    <div className="text-xs text-gray-400">{member.status}</div>
                  </div>
                  {member.user_id === user?.id && (
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">You</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <a href="/chat" className="block py-4 rounded-2xl bg-white border border-green-200 text-green-700 font-bold text-sm text-center hover:bg-green-50 transition-all">
            Group Chat
          </a>
          <a href="/video-call" className="block py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:shadow-lg transition-all">
            Video Call
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">Full Itinerary</h2>
          {room?.itinerary ? (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{room.itinerary}</p>
          ) : (
            <p className="text-sm text-gray-400">Itinerary will be added by Cucumber team soon!</p>
          )}
        </div>

        <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
          <div className="font-bold text-red-700 text-sm mb-1">Leave this room</div>
          <div className="text-xs text-red-500 mb-3">You can leave within 24 hours of joining for a full refund.</div>
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to leave this room?')) {
                await supabase.from('room_members').delete().eq('room_id', id).eq('user_id', user.id)
                window.location.href = '/rooms'
              }
            }}
            className="text-xs font-bold text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-all"
          >
            Leave Room
          </button>
        </div>

      </div>
    </main>
  )
}

