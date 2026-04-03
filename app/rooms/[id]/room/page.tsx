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
  const [myMembership, setMyMembership] = useState<any>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [sealing, setSealing] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: membership } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', id)
        .eq('user_id', user.id)
        .single()

      if (!membership) { window.location.href = '/rooms/' + id; return }
      setMyMembership(membership)

      if (!membership.is_ready) setShowPopup(true)

      const { data: roomData } = await supabase
        .from('Rooms')
        .select('*, itineraries(*)')
        .eq('id', id)
        .single()
      setRoom(roomData)

      await loadMembers()
      setLoading(false)
    }
    if (id) load()
  }, [id])

  async function loadMembers() {
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
        return { ...member, username: profile?.username || 'Traveler' }
      })
    )
    setMembers(membersWithProfiles)
  }

  async function markReady() {
    await supabase
      .from('room_members')
      .update({ is_ready: true })
      .eq('room_id', id)
      .eq('user_id', user.id)
    setMyMembership({ ...myMembership, is_ready: true })
    await loadMembers()
  }

  async function sealRoom() {
    setSealing(true)
    await supabase
      .from('Rooms')
      .update({ is_sealed: true })
      .eq('id', id)
    setRoom({ ...room, is_sealed: true })
    setSealing(false)
    alert('Room sealed! Video call is now unlocked!')
  }

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

  const readyCount = members.filter(m => m.is_ready).length
  const totalCount = members.length
  const halfReached = readyCount >= Math.ceil(totalCount / 2)
  const allReady = readyCount === totalCount && totalCount > 0

  return (
    <main className="min-h-screen bg-green-50 font-sans">

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-3xl mb-3 text-center">🥒</div>
            <h2 className="text-lg font-extrabold text-gray-900 text-center mb-2">Welcome to the room!</h2>
            <p className="text-sm text-gray-500 text-center mb-4 leading-relaxed">
              This room can be sealed once minimum half the members click Ready. Once sealed, video call unlocks and you can meet your travel buddies!
            </p>
            <button
              onClick={() => { setShowPopup(false); markReady() }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold"
            >
              Got it — I am Ready!
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-2 mt-2 text-sm text-gray-400"
            >
              I will decide later
            </button>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl font-extrabold text-green-700">
          cucumber<span className="text-green-400">.</span>
        </a>
        <a href="/rooms" className="text-sm font-semibold text-gray-500 hover:text-green-700">
          Back to Rooms
        </a>
      </nav>

      <div className="pt-20 pb-16 px-4 md:px-16 max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-green-200 text-xs font-bold">YOU ARE A MEMBER</div>
              {room?.is_sealed && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">SEALED</span>}
            </div>
            <h1 className="text-2xl font-extrabold mb-1">{room?.name}</h1>
            <div className="text-green-200 text-sm">📍 {room?.destination}</div>
            {room?.dates && <div className="text-green-200 text-sm mt-1">📅 {room?.dates}</div>}
          </div>
        </div>

        {/* READY STATUS */}
        {!room?.is_sealed && (
          <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Room Status</h2>
              <span className="text-sm font-bold text-green-600">{readyCount}/{totalCount} Ready</span>
            </div>
            <div className="h-2 bg-green-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                style={{ width: totalCount > 0 ? (readyCount / totalCount * 100) + '%' : '0%' }}
              />
            </div>
            {!myMembership?.is_ready ? (
              <button
                onClick={markReady}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm"
              >
                I am Ready to Travel!
              </button>
            ) : (
              <div className="text-center text-sm text-green-600 font-semibold py-2">
                You are ready! Waiting for others...
              </div>
            )}
            {halfReached && !room?.is_sealed && (
              <button
                onClick={sealRoom}
                disabled={sealing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-sm mt-3"
              >
                {sealing ? 'Sealing...' : 'Seal the Room!'}
              </button>
            )}
            {halfReached && (
              <p className="text-xs text-center text-purple-600 font-medium mt-2">
                Minimum members reached! Room can be sealed now.
              </p>
            )}
          </div>
        )}

        {/* MEMBERS */}
        <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Travel Buddies ({members.length})</h2>
          {members.length === 0 ? (
            <p className="text-gray-400 text-sm">No members yet!</p>
          ) : (
            <div className="space-y-2">
              {members.map((member: any) => (
                <div key={member.id} className="flex items-center gap-3 hover:bg-green-50 rounded-xl p-2 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{member.username}</div>
                    <div className="text-xs text-gray-400">{member.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.is_ready ? (
                      <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">Ready</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-1 rounded-full">Thinking...</span>
                    )}
                    {member.user_id === user?.id && (
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHAT + VIDEO */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div onClick={() => { window.location.href = '/chat' }} className="py-4 rounded-2xl bg-white border border-green-200 text-green-700 font-bold text-sm text-center hover:bg-green-50 transition-all cursor-pointer">
            Group Chat
          </div>
          {room?.is_sealed ? (
            <div onClick={() => { window.location.href = '/video-call' }} className="py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:shadow-lg transition-all cursor-pointer">
              Video Call (Unlocked!)
            </div>
          ) : (
            <div className="py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-sm text-center cursor-not-allowed">
              Video Call (Seal room first)
            </div>
          )}
        </div>

        {/* ITINERARY */}
        <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">
            {room?.is_sealed ? 'Full Itinerary' : 'Itinerary Preview'}
          </h2>
          {room?.itineraries ? (
            <div className="space-y-2">
              {room.itineraries.day_plan?.split('\n').map((day: string, i: number) => {
                if (!room?.is_sealed && i >= 2) {
                  return i === 2 ? (
                    <div key={i} className="text-xs text-gray-400 italic mt-2">
                      Seal the room to unlock full itinerary...
                    </div>
                  ) : null
                }
                return (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-xs font-bold text-green-600 w-16 flex-shrink-0">{day.split(':')[0]}</span>
                    <span>{day.split(':').slice(1).join(':')}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Itinerary will be added by Cucumber team soon!</p>
          )}
        </div>

        {/* WHAT'S INCLUDED */}
        {room?.is_sealed && room?.itineraries?.includes && (
          <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">
            <h2 className="font-bold text-gray-900 mb-3">What is Included</h2>
            <div className="grid grid-cols-2 gap-2">
              {room.itineraries.includes.split(',').map((item: string) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>{item.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEAVE ROOM */}
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
