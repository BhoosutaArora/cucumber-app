'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'bhoosuta@gmail.com' // 👈 your email here

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [rooms, setRooms] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoom, setNewRoom] = useState({
    name: '', destination: '', dates: '', vibe: 'Adventure',
    price: '', seats_total: '10', seats_filled: '0',
    status: 'Open', gradient: 'from-indigo-900 to-purple-900'
  })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = '/'
        return
      }
      setUser(user)
      await fetchRooms()
      setLoading(false)
    }
    init()
  }, [])

  async function fetchRooms() {
    const { data } = await supabase.from('Rooms').select('*').order('created_at', { ascending: false })
    setRooms(data || [])
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

  async function updateSeats(id: number, filled: number, total: number) {
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

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-14 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-lg font-extrabold text-green-400">cucumber.</span>
          <span className="text-xs font-bold text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden md:block">{user?.email}</span>
          <a href="/" className="text-xs font-semibold text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all">
            View Site →
          </a>
        </div>
      </nav>

      <div className="pt-14 flex min-h-screen">

        {/* ── SIDEBAR ── */}
        <div className="w-14 md:w-52 bg-gray-900 border-r border-gray-800 fixed left-0 top-14 bottom-0 flex flex-col py-4">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'rooms', icon: '🏠', label: 'Rooms' },
            { id: 'bookings', icon: '📅', label: 'Bookings' },
            { id: 'users', icon: '👥', label: 'Users' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 md:px-4 py-3 mx-2 rounded-xl transition-all mb-1 ${activeTab === tab.id ? 'bg-green-900 text-green-400' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
            >
              <span className="text-lg flex-shrink-0">{tab.icon}</span>
              <span className="text-sm font-semibold hidden md:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="ml-14 md:ml-52 flex-1 p-4 md:p-8">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Overview</h1>
              <p className="text-gray-500 text-sm mb-6">Welcome back, {user?.email?.split('@')[0]} 👋</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                {[
                  { label: 'Total Rooms', value: rooms.length, icon: '🏠', color: 'text-green-400' },
                  { label: 'Seats Filled', value: `${filledSeats}/${totalSeats}`, icon: '💺', color: 'text-blue-400' },
                  { label: 'Est. Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-yellow-400' },
                  { label: 'Avg Fill Rate', value: totalSeats > 0 ? `${Math.round(filledSeats/totalSeats*100)}%` : '0%', icon: '📈', color: 'text-purple-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className={`text-xl md:text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
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
                          <div className={`h-full rounded-full ${pct >= 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{width:`${pct}%`}} />
                        </div>
                        <div className="text-xs text-gray-400 w-16 text-right flex-shrink-0">{room.seats_filled}/{room.seats_total}</div>
                        <div className={`text-xs font-bold w-10 text-right flex-shrink-0 ${pct >= 80 ? 'text-red-400' : 'text-green-400'}`}>{pct}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ROOMS TAB ── */}
          {activeTab === 'rooms' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Rooms</h1>
                  <p className="text-gray-500 text-sm">{rooms.length} active rooms</p>
                </div>
                <button
                  onClick={() => setShowAddRoom(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold hover:scale-105 transition-all"
                >
                  + Add Room
                </button>
              </div>

              {/* Add Room Modal */}
              {showAddRoom && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-5 border-b border-gray-800">
                      <div className="font-bold text-white text-lg">Add New Room</div>
                      <button onClick={() => setShowAddRoom(false)} className="text-gray-500 hover:text-white text-xl">×</button>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                      {[
                        { label: 'Room Name *', key: 'name', placeholder: 'Adventure Squad 🏔️' },
                        { label: 'Destination *', key: 'destination', placeholder: 'Spiti Valley, HP' },
                        { label: 'Dates *', key: 'dates', placeholder: 'Aug 14-17, 2025' },
                        { label: 'Price per person (₹) *', key: 'price', placeholder: '7499', type: 'number' },
                        { label: 'Total Seats', key: 'seats_total', placeholder: '10', type: 'number' },
                        { label: 'Seats Filled', key: 'seats_filled', placeholder: '0', type: 'number' },
                        { label: 'Status', key: 'status', placeholder: 'Open' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="text-xs font-bold text-gray-400 mb-1.5 block">{field.label}</label>
                          <input
                            type={field.type || 'text'}
                            value={(newRoom as any)[field.key]}
                            onChange={(e) => setNewRoom({...newRoom, [field.key]: e.target.value})}
                            placeholder={field.placeholder}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green-500 transition-all"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-bold text-gray-400 mb-1.5 block">Vibe</label>
                        <select
                          value={newRoom.vibe}
                          onChange={(e) => setNewRoom({...newRoom, vibe: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green-500"
                        >
                          <option>Adventure</option>
                          <option>Peaceful</option>
                          <option>Explorer</option>
                          <option>Beach</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 mb-1.5 block">Color Theme</label>
                        <select
                          value={newRoom.gradient}
                          onChange={(e) => setNewRoom({...newRoom, gradient: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green-500"
                        >
                          <option value="from-indigo-900 to-purple-900">Purple (Adventure)</option>
                          <option value="from-green-900 to-green-700">Green (Peaceful)</option>
                          <option value="from-orange-900 to-red-800">Orange (Explorer)</option>
                          <option value="from-blue-900 to-blue-700">Blue (Beach)</option>
                          <option value="from-teal-900 to-teal-700">Teal (Nature)</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={addRoom}
                          disabled={saving}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm disabled:opacity-50"
                        >
                          {saving ? 'Adding...' : 'Add Room 🥒'}
                        </button>
                        <button
                          onClick={() => setShowAddRoom(false)}
                          className="px-5 py-3 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rooms List */}
              <div className="flex flex-col gap-3">
                {rooms.map((room) => {
                  const pct = Math.round((room.seats_filled / room.seats_total) * 100)
                  return (
                    <div key={room.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="font-bold text-white text-base">{room.name}</div>
                          <div className="text-xs text-green-400 mt-0.5">📍 {room.destination} · {room.dates}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">₹{room.price?.toLocaleString()}</span>
                            <span className="text-xs text-gray-600">·</span>
                            <span className="text-xs text-gray-500">{room.vibe}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${pct >= 80 ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'}`}>
                            {pct}% full
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full ${pct >= 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{width:`${pct}%`}} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Seats:</span>
                          <button onClick={() => updateSeats(room.id, Math.max(0, room.seats_filled - 1), room.seats_total)} className="w-6 h-6 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 flex items-center justify-center">-</button>
                          <span className="text-sm font-bold text-white w-12 text-center">{room.seats_filled}/{room.seats_total}</span>
                          <button onClick={() => updateSeats(room.id, Math.min(room.seats_total, room.seats_filled + 1), room.seats_total)} className="w-6 h-6 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 flex items-center justify-center">+</button>
                        </div>
                        <div className="flex items-center gap-2">
                          {deleteConfirm === room.id ? (
                            <>
                              <span className="text-xs text-red-400">Sure?</span>
                              <button onClick={() => deleteRoom(room.id)} className="text-xs font-bold text-red-400 border border-red-800 px-2 py-1 rounded-lg hover:bg-red-900">Yes</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-xs font-bold text-gray-400 border border-gray-700 px-2 py-1 rounded-lg hover:bg-gray-800">No</button>
                            </>
                          ) : (
                            <button onClick={() => setDeleteConfirm(room.id)} className="text-xs font-semibold text-red-500 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-900/30 transition-all">
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

          {/* ── BOOKINGS TAB ── */}
          {activeTab === 'bookings' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Bookings</h1>
              <p className="text-gray-500 text-sm mb-6">All trip bookings will appear here</p>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
                <div className="text-4xl mb-4">📅</div>
                <div className="font-bold text-gray-300 text-lg mb-2">No bookings yet</div>
                <div className="text-sm text-gray-500">When users book trips, they will appear here with all details — name, email, room, payment status.</div>
              </div>
            </div>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Users</h1>
              <p className="text-gray-500 text-sm mb-6">Manage your travelers</p>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
                <div className="text-4xl mb-4">👥</div>
                <div className="font-bold text-gray-300 text-lg mb-2">User management</div>
                <div className="text-sm text-gray-500 mb-4">Go to Supabase → Authentication → Users to see all registered users directly.</div>
                <a href="https://supabase.com" target="_blank" className="inline-block px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all">
                  Open Supabase →
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}