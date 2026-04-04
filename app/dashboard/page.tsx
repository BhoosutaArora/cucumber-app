'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [newUsernameInput, setNewUsernameInput] = useState('')
  const [usernameError, setUsernameError] = useState('')

  // Google users profile completion
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)
  const [promptUsername, setPromptUsername] = useState('')
  const [promptAgeGroup, setPromptAgeGroup] = useState('')
  const [promptGender, setPromptGender] = useState('')
  const [promptError, setPromptError] = useState('')
  const [promptLoading, setPromptLoading] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
      } else {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, age_group, gender')
          .eq('id', user.id)
          .single()

        if (profile?.username) {
          setUsername(profile.username)
          // Check if age_group or gender is missing — show prompt
          if (!profile.age_group || !profile.gender) {
            setShowProfilePrompt(true)
            setPromptUsername(profile.username)
          }
        } else {
          // No profile at all — show prompt to complete profile
          setShowProfilePrompt(true)
          setPromptUsername(user.user_metadata?.full_name?.split(' ')[0]?.toLowerCase() || '')
          setUsername(user.email?.split('@')[0] || 'Traveler')
        }
        setLoading(false)
      }
    }
    getUser()
  }, [])

  async function handleProfilePromptSave() {
    setPromptError('')
    const cleaned = promptUsername.toLowerCase().trim()
    if (cleaned.length < 3) { setPromptError('Username too short! Minimum 3 characters.'); return }
    if (cleaned.length > 20) { setPromptError('Username too long! Maximum 20 characters.'); return }
    if (!/^[a-z0-9_]+$/.test(cleaned)) { setPromptError('Only letters, numbers and underscores allowed!'); return }
    if (!promptAgeGroup) { setPromptError('Please select your age group!'); return }
    if (!promptGender) { setPromptError('Please select your gender!'); return }

    setPromptLoading(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: cleaned,
      email: user.email,
      age_group: promptAgeGroup,
      gender: promptGender,
    })

    if (error) {
      setPromptError('This username is already taken! Try another one 🥒')
      setPromptLoading(false)
    } else {
      setUsername(cleaned)
      setShowProfilePrompt(false)
      setPromptLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥒</div>
          <div className="text-green-700 font-bold text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  const userEmail = user?.email || ''
  const userName = username || userEmail.split('@')[0] || 'Traveler'

  return (
    <div>

      {/* ── GOOGLE USERS PROFILE PROMPT ── */}
      {showProfilePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-br from-green-700 to-green-500 px-6 py-5 text-center">
              <p className="text-2xl mb-1">🥒</p>
              <h2 className="text-white font-extrabold text-lg">Complete your profile!</h2>
              <p className="text-green-200 text-xs mt-1">Just a few details so your travel buddies know you</p>
            </div>
            <div className="px-6 py-5">

              {/* Username */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Username</label>
                <input
                  type="text"
                  value={promptUsername}
                  onChange={(e) => { setPromptUsername(e.target.value); setPromptError('') }}
                  placeholder="e.g. hills_over_malls"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>

              {/* Age Group */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Age Group</label>
                <div className="grid grid-cols-3 gap-2">
                  {['18-24', '25-30', '31+'].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setPromptAgeGroup(a)}
                      className={'py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ' + (promptAgeGroup === a ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300')}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPromptGender(g)}
                      className={'py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ' + (promptGender === g ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300')}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {promptError && (
                <div className="text-xs text-red-500 font-medium mb-3">{promptError}</div>
              )}

              <button
                onClick={handleProfilePromptSave}
                disabled={promptLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {promptLoading ? 'Saving...' : 'Save & Continue 🥒'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── USERNAME MODAL ── */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🥒</div>
              <h2 className="text-xl font-extrabold text-gray-900">Choose your username</h2>
              <p className="text-xs text-gray-400 mt-1">Letters, numbers and underscores only. 3-20 characters.</p>
            </div>
            <input
              type="text"
              value={newUsernameInput}
              onChange={(e) => { setNewUsernameInput(e.target.value); setUsernameError('') }}
              placeholder="e.g. hills_over_malls"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all mb-3"
            />
            {usernameError && (
              <div className="text-xs text-red-500 font-medium mb-3">{usernameError}</div>
            )}
            <button
              onClick={async () => {
                const cleaned = newUsernameInput.toLowerCase().trim()
                if (cleaned.length < 3) { setUsernameError('Too short! Minimum 3 characters.'); return }
                if (cleaned.length > 20) { setUsernameError('Too long! Maximum 20 characters.'); return }
                if (!/^[a-z0-9_]+$/.test(cleaned)) { setUsernameError('Only letters, numbers and underscores allowed!'); return }
                const { error } = await supabase.from('profiles').upsert({
                  id: user.id,
                  username: cleaned,
                  email: user.email,
                })
                if (error) {
                  setUsernameError('This username is already taken! Try another one 🥒')
                } else {
                  setUsername(cleaned)
                  setShowUsernameModal(false)
                  setNewUsernameInput('')
                }
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:shadow-lg transition-all mb-2 cursor-pointer"
            >
              Save Username 🥒
            </button>
            <button
              onClick={() => { setShowUsernameModal(false); setNewUsernameInput(''); setUsernameError('') }}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-green-50 font-sans">

        {/* ── NAVBAR ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
          <a href="/" className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
            cucumber<span className="text-green-400">.</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Home</a>
            <a href="/rooms" className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Rooms</a>
            <a href="/dashboard" className="text-sm font-bold text-green-700">Dashboard</a>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                {userName[0].toUpperCase()}
              </div>
              <span className="text-xs md:text-sm font-semibold text-green-700 hidden sm:block">{userName}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs md:text-sm font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </nav>

        <div className="pt-16 md:pt-20 px-4 md:px-16 pb-10 md:pb-16 max-w-7xl mx-auto">

          {/* ── WELCOME BANNER ── */}
          <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl md:rounded-3xl p-5 md:p-8 mb-6 md:mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div>
                  <div className="text-green-200 text-xs md:text-sm font-semibold mb-1">Welcome back 👋</div>
                  <div className="flex items-center gap-2">
                    <div className="text-white text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
                      Hey {userName}! 🥒
                    </div>
                    <button
                      onClick={() => setShowUsernameModal(true)}
                      className="text-white/70 hover:text-white text-lg transition-all cursor-pointer"
                      title="Edit username"
                    >
                      ✏️
                    </button>
                  </div>
                  <div className="text-green-200 text-xs md:text-sm">Ready for your next adventure?</div>
                </div>
                <div className="flex items-center gap-3 md:gap-6">
                  {[
                    { num: '0', label: 'Trips' },
                    { num: '0', label: 'Rooms' },
                    { num: '0', label: 'Buddies' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center bg-white/10 backdrop-blur rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-4 border border-white/20 flex-1 md:flex-none">
                      <div className="text-lg md:text-2xl font-extrabold text-white">{stat.num}</div>
                      <div className="text-xs text-green-200 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-5 md:gap-6">

            {/* ── LEFT — trips + rooms ── */}
            <div className="md:col-span-2 flex flex-col gap-5 md:gap-6">

              {/* upcoming trips */}
              <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-green-50">
                  <div className="font-bold text-gray-900 text-base md:text-lg">My Upcoming Trips</div>
                  <a href="/rooms" className="text-xs font-bold text-green-600 hover:underline">Browse →</a>
                </div>
                <div className="p-4 md:p-6">
                  <div className="text-center py-8 md:py-10">
                    <div className="text-4xl md:text-5xl mb-3 md:mb-4">🏔️</div>
                    <div className="font-bold text-gray-700 text-base md:text-lg mb-2">No trips booked yet</div>
                    <div className="text-xs md:text-sm text-gray-400 mb-4 md:mb-5">Your next adventure is waiting!</div>
                    <a href="/rooms" className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all shadow-sm">
                      Find a Room 🥒
                    </a>
                  </div>
                </div>
              </div>

              {/* recommended rooms */}
              <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-green-50">
                  <div className="font-bold text-gray-900 text-base md:text-lg">Recommended For You</div>
                  <a href="/rooms" className="text-xs font-bold text-green-600 hover:underline">See all →</a>
                </div>
                <div className="p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {[
                    { name: 'Adventure Squad 🏔️', dest: 'Spiti Valley', dates: 'Aug 14–17', seats: '1 seat left', color: 'from-indigo-900 to-purple-900', urgent: true },
                    { name: 'Peaceful Escape 🌿', dest: 'Shimla', dates: 'Aug 2–5', seats: '4 seats open', color: 'from-green-900 to-green-700', urgent: false },
                  ].map((room) => (
                    <div key={room.name} className="rounded-xl border border-green-100 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer">
                      <div className={`h-16 md:h-20 bg-gradient-to-br ${room.color} flex items-end p-2 md:p-3`}>
                        <span className="text-xs font-bold text-white bg-black/30 px-2 py-1 rounded-lg">📍 {room.dest}</span>
                      </div>
                      <div className="p-3">
                        <div className="font-bold text-gray-900 text-sm mb-1">{room.name}</div>
                        <div className="text-xs text-gray-400 mb-2">{room.dates}</div>
                        <div className={`text-xs font-bold mb-2 ${room.urgent ? 'text-orange-500' : 'text-green-600'}`}>
                          {room.urgent ? '🔥' : '🌱'} {room.seats}
                        </div>
                        <a href="/rooms" className="block w-full py-1.5 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold text-center hover:scale-105 transition-transform">
                          Join Room
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT — profile + actions ── */}
            <div className="flex flex-col gap-5 md:gap-6">

              {/* profile card */}
              <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
                <div className="bg-gradient-to-br from-green-600 to-green-400 h-14 md:h-16 relative">
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-lg md:text-xl font-bold border-4 border-white shadow-md">
                      {userName[0].toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="pt-7 md:pt-8 pb-4 px-4 text-center">
                  <div className="font-bold text-gray-900 text-base md:text-lg">{userName}</div>
                  <div className="text-xs text-green-600 font-semibold mt-1">🌱 New Traveler</div>
                  <div className="text-xs text-gray-400 mt-1 truncate px-2">{userEmail}</div>
                  <div className="grid grid-cols-3 gap-2 mt-3 md:mt-4">
                    {[
                      { num: '0', label: 'Trips' },
                      { num: '0', label: 'Reviews' },
                      { num: '—', label: 'Rating' },
                    ].map((s) => (
                      <div key={s.label} className="bg-green-50 rounded-xl py-2 border border-green-100">
                        <div className="font-bold text-green-700 text-base md:text-lg">{s.num}</div>
                        <div className="text-xs text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowUsernameModal(true)}
                    className="w-full mt-3 md:mt-4 py-2 rounded-xl border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-50 transition-all cursor-pointer">
                    Edit Profile ✏️
                  </button>
                </div>
              </div>

              {/* quick actions */}
              <div className="bg-white rounded-2xl border border-green-100 p-4">
                <div className="font-bold text-gray-900 text-sm md:text-base mb-3">Quick Actions</div>
                {[
                  { icon: '🏠', label: 'Browse Rooms', href: '/rooms' },
                  { icon: '🪪', label: 'Verify My ID', href: '/verify-id' },
                  { icon: '🔔', label: 'Notifications', href: '#' },
                  { icon: '⚙️', label: 'Settings', href: '#' },
                ].map((action) => (
                  <a key={action.label} href={action.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-all cursor-pointer mb-1">
                    <span className="text-base md:text-lg">{action.icon}</span>
                    <span className="text-xs md:text-sm font-semibold text-gray-700">{action.label}</span>
                    <span className="ml-auto text-gray-300 text-sm">→</span>
                  </a>
                ))}
              </div>

              {/* account info */}
              <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
                <div className="font-bold text-green-700 text-xs md:text-sm mb-2">✅ Account Verified</div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  Complete your profile to unlock all features and join travel rooms.
                </div>
                <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
                </div>
                <div className="text-xs text-gray-400 mt-1">Profile 25% complete</div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}