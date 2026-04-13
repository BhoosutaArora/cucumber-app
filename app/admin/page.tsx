'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'bhoosuta@gmail.com'

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [rooms, setRooms] = useState<any[]>([])
  const [pendingRooms, setPendingRooms] = useState<any[]>([])
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoom, setNewRoom] = useState({
    name: '', destination: '', dates: '', vibe: 'Adventure',
    price: '', seats_total: '10', seats_filled: '0',
    status: 'Open', gradient: 'from-indigo-900 to-purple-900'
  })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [completingId, setCompletingId] = useState<number | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = '/'
        return
      }
      setUser(user)
      await fetchRooms()
      await fetchPendingRooms()
      setLoading(false)
    }
    init()
  }, [])

  async function fetchRooms() {
    const { data } = await supabase.from('Rooms').select('*').order('created_at', { ascending: false })
    setRooms((data || []).filter((r: any) => r.status !== 'Pending Approval'))
  }

  async function fetchPendingRooms() {
    const { data } = await supabase.from('Rooms').select('*').eq('status', 'Pending Approval').order('created_at', { ascending: false })
    setPendingRooms(data || [])
  }

  async function approveRoom(id: number) {
    setApprovingId(id)
    await supabase.from('Rooms').update({ status: 'Open' }).eq('id', id)
    await fetchRooms()
    await fetchPendingRooms()
    setApprovingId(null)
    alert('Room approved and is now live! 🥒')
  }

  async function rejectRoom(id: number) {
    setApprovingId(id)
    await supabase.from('Rooms').update({ status: 'Rejected' }).eq('id', id)
    await fetchPendingRooms()
    setApprovingId(null)
    alert('Room rejected.')
  }

  async function markTripComplete(room: any) {
    setCompletingId(room.id)
    try {
      // Step 1 — get all members of this room
      const { data: members } = await supabase
        .from('room_members')
        .select('user_id')
        .eq('room_id', room.id)

      if (!members || members.length === 0) {
        alert('No members found in this room.')
        setCompletingId(null)
        return
      }

      // Step 2 — get their emails from profiles
      const userIds = members.map((m: any) => m.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email, username')
        .in('id', userIds)

      if (!profiles || profiles.length === 0) {
        alert('No profiles found for members.')
        setCompletingId(null)
        return
      }

      // Step 3 — find posts by these users matching this destination
      const destination = room.destination?.toLowerCase() || ''
      const usernames = profiles.map((p: any) => p.username).filter(Boolean)

      let verifiedCount = 0
      for (const username of usernames) {
        const { data: userPosts } = await supabase
          .from('posts')
          .select('id, location')
          .eq('author_name', username)

        const matchingPosts = (userPosts || []).filter((p: any) =>
          p.location?.toLowerCase().includes(destination) ||
          destination.includes(p.location?.toLowerCase())
        )

        if (matchingPosts.length > 0) {
          const postIds = matchingPosts.map((p: any) => p.id)
          await supabase
            .from('posts')
            .update({ is_verified_trip: true })
            .in('id', postIds)
          verifiedCount += matchingPosts.length
        }
      }

      // Step 4 — mark room as Completed
      await supabase.from('Rooms').update({ status: 'Completed' }).eq('id', room.id)
      await fetchRooms()

      alert('Trip marked complete! ' + verifiedCount + ' post(s) now have the Verified Trip badge. 🥒')
    } catch (err) {
      console.error(err)
      alert('Something went wrong.')
    }
    setCompletingId(null)
  }

  async function addRoom() {
    if (!newRoom.name || !newRoom.destination || !newRoom.dates || !newRoom.price) {
      alert('Please fill in all required fields!')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('Rooms').insert([{
      name: newRoom.name,
      destination: newRoom.destination,
      dates: newRoom.dates,
      vibe: newRoom.vibe,
      price: parseInt(newRoom.price),
      seats_total: parseInt(newRoom.seats_total),
      seats_filled: parseInt(newRoom.seats_filled),
      status: newRoom.status,
      gradient: newRoom.gradient,
    }])
    if (error) { alert('Error adding room: ' + error.message) }
    else {
      setShowAddRoom(false)
      setNewRoom({ name: '', destination: '', dates: '', vibe: 'Adventure', price: '', seats_total: '10', seats_filled: '0', status: 'Open', gradient: 'from-indigo-900 to-purple-900' })
      await fetchRooms()
      alert('Room added successfully! 🥒')
    }
    setSaving(false)
  }

  async function deleteRoom(id: number) {
    const { error } = await supabase.from('Rooms').delete().eq('id', id)
    if (error) { alert('Error deleting room') }
    else { await fetchRooms(); setDeleteConfirm(null) }
  }

  async function updateSeats(id: number, filled: number) {
    await supabase.from('Rooms').update({ seats_filled: filled }).eq('id', id)
    await fetchRooms()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥒</div>
          <div className="text-green-400 font-bold">Loading admin panel...</div>
        </div>
      </div>
    )
  }

  const totalRevenue = rooms.reduce((sum, r) => sum + (r.price * r.seats_filled), 0)
  const totalSeats = rooms.reduce((sum, r) => sum + r.seats_total, 0)
  const filledSeats = rooms.reduce((sum, r) => sum + r.seats_filled, 0)

  return (
    <main className="min-h-screen bg-gray-950 font-sans text-white">

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-14 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-lg font-extrabold text-green-400">cucumber.</span>
          <span className="text-xs font-bold text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden md:block">{user?.email}</span>
          <a href="/" className="text-xs font-semibold text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all">
            View Site
          </a>
        </div>
      </nav>

      <div className="pt-14 flex min-h-screen">

        <div className="w-14 md:w-52 bg-gray-900 border-r border-gray-800 fixed left-0 top-14 bottom-0 flex flex-col py-4">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'approvals', icon: '✅', label: 'Approvals', badge: pendingRooms.length },
            { id: 'rooms', icon: '🏠', label: 'Rooms' },
            { id: 'bookings', icon: '📅', label: 'Bookings' },
            { id: 'users', icon: '👥', label: 'Users' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={'flex items-center gap-3 px-3 md:px-4 py-3 mx-2 rounded-xl transition-all mb-1 relative ' + (activeTab === tab.id ? 'bg-green-900 text-green-400' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300')}
            >
              <span className="text-lg flex-shrink-0">{tab.icon}</span>
              <span className="text-sm font-semibold hidden md:block">{tab.label}</span>
              {tab.badge ? (
                <span className="absolute top-1 right-1 md:relative md:top-0 md:right-0 md:ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="ml-14 md:ml-52 flex-1 p-4 md:p-8">

          {activeTab === 'overview' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Overview</h1>
              <p className="text-gray-500 text-sm mb-6">Welcome back, {user?.email?.split('@')[0]} 👋</p>

              {pendingRooms.length > 0 && (
                <div
                  onClick={() => setActiveTab('approvals')}
                  className="bg-yellow-900/30 border border-yellow-700 rounded-2xl p-4 mb-6 flex items-center gap-3 cursor-pointer hover:bg-yellow-900/50 transition-all"
                >
                  <span className="text-2xl">⏳</span>
                  <div>
                    <div className="font-bold text-yellow-400 text-sm">{pendingRooms.length} room{pendingRooms.length > 1 ? 's' : ''} waiting for approval!</div>
                    <div className="text-xs text-yellow-600">Click here to review and approve</div>
                  </div>
                  <span className="ml-auto text-yellow-600">→</span>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                {[
                  { label: 'Live Rooms', value: rooms.length, icon: '🏠', color: 'text-green-400' },
                  { label: 'Seats Filled', value: filledSeats + '/' + totalSeats, icon: '💺', color: 'text-blue-400' },
                  { label: 'Est. Revenue', value: '₹' + totalRevenue.toLocaleString(), icon: '💰', color: 'text-yellow-400' },
                  { label: 'Pending', value: pendingRooms.length, icon: '⏳', color: 'text-orange-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className={'text-xl md:text-2xl font-extrabold ' + stat.color}>{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                <div className="font-bold text-white mb-4">Room Performance</div>
                <div className="flex flex-col gap-3">
                  {rooms.map((room) => {
                    const pct = Math.round((room.seats_filled / room.seats_total) * 100)
                    return (
                      <div key={room.id} className="flex items-center gap-3">
                        <div className="text-sm text-gray-300 w-36 md:w-48 truncate flex-shrink-0">{room.name}</div>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className={'h-full rounded-full ' + (pct >= 80 ? 'bg-red-500' : 'bg-green-500')} style={{ width: pct + '%' }} />
                        </div>
                        <div className="text-xs text-gray-400 w-16 text-right flex-shrink-0">{room.seats_filled}/{room.seats_total}</div>
                        <div className={'text-xs font-bold w-10 text-right flex-shrink-0 ' + (pct >= 80 ? 'text-red-400' : 'text-green-400')}>{pct}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Room Approvals</h1>
              <p className="text-gray-500 text-sm mb-6">{pendingRooms.length} room{pendingRooms.length !== 1 ? 's' : ''} waiting for your review</p>

              {pendingRooms.length === 0 ? (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <div className="font-bold text-gray-300 text-lg mb-2">All caught up!</div>
                  <div className="text-sm text-gray-500">No rooms waiting for approval right now.</div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingRooms.map((room) => (
                    <div key={room.id} className="bg-gray-900 rounded-2xl border border-yellow-800/50 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded-full">Pending Approval</span>
                          </div>
                          <div className="font-bold text-white text-lg">{room.name}</div>
                          <div className="text-xs text-green-400 mt-0.5">📍 {room.destination}</div>
                          {room.dates && <div className="text-xs text-gray-400 mt-0.5">📅 {room.dates}</div>}
                          <div className="text-xs text-gray-500 mt-1">Created by: {room.created_by?.slice(0, 8)}...</div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => approveRoom(room.id)}
                          disabled={approvingId === room.id}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {approvingId === room.id ? 'Processing...' : 'Approve — Go Live'}
                        </button>
                        <button
                          onClick={() => rejectRoom(room.id)}
                          disabled={approvingId === room.id}
                          className="flex-1 py-2.5 rounded-xl border border-red-800 text-red-400 font-bold text-sm hover:bg-red-900/30 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Live Rooms</h1>
                  <p className="text-gray-500 text-sm">{rooms.length} active rooms</p>
                </div>
                <button
                  onClick={() => setShowAddRoom(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold hover:scale-105 transition-all cursor-pointer"
                >
                  + Add Room
                </button>
              </div>

              {showAddRoom && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-5 border-b border-gray-800">
                      <div className="font-bold text-white text-lg">Add New Room</div>
                      <button onClick={() => setShowAddRoom(false)} className="text-gray-500 hover:text-white text-xl cursor-pointer">x</button>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                      {[
                        { label: 'Room Name', key: 'name', placeholder: 'Adventure Squad' },
                        { label: 'Destination', key: 'destination', placeholder: 'Spiti Valley, HP' },
                        { label: 'Dates', key: 'dates', placeholder: 'Aug 14-17, 2025' },
                        { label: 'Price per person (₹)', key: 'price', placeholder: '7499', type: 'number' },
                        { label: 'Total Seats', key: 'seats_total', placeholder: '10', type: 'number' },
                        { label: 'Seats Filled', key: 'seats_filled', placeholder: '0', type: 'number' },
                        { label: 'Status', key: 'status', placeholder: 'Open' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="text-xs font-bold text-gray-400 mb-1.5 block">{field.label}</label>
                          <input
                            type={field.type || 'text'}
                            value={(newRoom as any)[field.key]}
                            onChange={(e) => setNewRoom({ ...newRoom, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green-500 transition-all"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-bold text-gray-400 mb-1.5 block">Vibe</label>
                        <select value={newRoom.vibe} onChange={(e) => setNewRoom({ ...newRoom, vibe: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green-500">
                          <option>Adventure</option>
                          <option>Peaceful</option>
                          <option>Explorer</option>
                          <option>Beach</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={addRoom} disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm disabled:opacity-50 cursor-pointer">
                          {saving ? 'Adding...' : 'Add Room'}
                        </button>
                        <button onClick={() => setShowAddRoom(false)} className="px-5 py-3 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-800 cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {rooms.length === 0 ? (
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
                    <div className="text-4xl mb-4">🏠</div>
                    <div className="font-bold text-gray-300 text-lg mb-2">No live rooms yet</div>
                  </div>
                ) : rooms.map((room) => {
                  const pct = Math.round((room.seats_filled / room.seats_total) * 100)
                  const isCompleted = room.status === 'Completed'
                  return (
                    <div key={room.id} className={'bg-gray-900 rounded-2xl border p-4 md:p-5 ' + (isCompleted ? 'border-green-900' : 'border-gray-800')}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {isCompleted && (
                              <span className="text-xs font-bold bg-green-900 text-green-400 px-2 py-0.5 rounded-full">Completed</span>
                            )}
                          </div>
                          <div className="font-bold text-white text-base">{room.name}</div>
                          <div className="text-xs text-green-400 mt-0.5">📍 {room.destination} · {room.dates}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">₹{room.price?.toLocaleString()}</span>
                            <span className="text-xs text-gray-600">·</span>
                            <span className="text-xs text-gray-500">{room.vibe}</span>
                          </div>
                        </div>
                        <span className={'text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ' + (isCompleted ? 'bg-green-900 text-green-400' : pct >= 80 ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400')}>
                          {isCompleted ? 'Done' : pct + '% full'}
                        </span>
                      </div>

                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                        <div className={'h-full rounded-full ' + (isCompleted ? 'bg-green-500' : pct >= 80 ? 'bg-red-500' : 'bg-green-500')} style={{ width: pct + '%' }} />
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Seats:</span>
                          <button onClick={() => updateSeats(room.id, Math.max(0, room.seats_filled - 1))} className="w-6 h-6 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 flex items-center justify-center cursor-pointer">-</button>
                          <span className="text-sm font-bold text-white w-12 text-center">{room.seats_filled}/{room.seats_total}</span>
                          <button onClick={() => updateSeats(room.id, Math.min(room.seats_total, room.seats_filled + 1))} className="w-6 h-6 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 flex items-center justify-center cursor-pointer">+</button>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isCompleted && (
                            <button
                              onClick={() => markTripComplete(room)}
                              disabled={completingId === room.id}
                              className="text-xs font-bold text-green-400 border border-green-800 px-3 py-1.5 rounded-lg hover:bg-green-900/30 transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {completingId === room.id ? 'Processing...' : 'Mark Complete'}
                            </button>
                          )}
                          {deleteConfirm === room.id ? (
                            <>
                              <span className="text-xs text-red-400">Sure?</span>
                              <button onClick={() => deleteRoom(room.id)} className="text-xs font-bold text-red-400 border border-red-800 px-2 py-1 rounded-lg hover:bg-red-900 cursor-pointer">Yes</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-xs font-bold text-gray-400 border border-gray-700 px-2 py-1 rounded-lg hover:bg-gray-800 cursor-pointer">No</button>
                            </>
                          ) : (
                            <button onClick={() => setDeleteConfirm(room.id)} className="text-xs font-semibold text-red-500 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-900/30 transition-all cursor-pointer">
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Bookings</h1>
              <p className="text-gray-500 text-sm mb-6">All trip bookings will appear here</p>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
                <div className="text-4xl mb-4">📅</div>
                <div className="font-bold text-gray-300 text-lg mb-2">No bookings yet</div>
                <div className="text-sm text-gray-500">When users book trips, they will appear here.</div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Users</h1>
              <p className="text-gray-500 text-sm mb-6">Manage your travelers</p>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
                <div className="text-4xl mb-4">👥</div>
                <div className="font-bold text-gray-300 text-lg mb-2">User management</div>
                <div className="text-sm text-gray-500 mb-4">Go to Supabase to see all registered users.</div>
                <a href="https://supabase.com" target="_blank" className="inline-block px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all">
                  Open Supabase
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}