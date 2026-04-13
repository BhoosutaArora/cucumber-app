'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const VIBE_COLORS: Record<string, string> = {
  Adventure: 'bg-orange-100 text-orange-600',
  Chill: 'bg-blue-100 text-blue-600',
  Cultural: 'bg-purple-100 text-purple-600',
  Explorer: 'bg-green-100 text-green-600',
}

const POPULAR_DESTINATIONS = ['Shimla', 'Manali', 'Goa', 'Spiti', 'Amritsar', 'Leh', 'Rishikesh', 'Jaipur']
const VIBES = ['All', 'Adventure', 'Chill', 'Cultural', 'Explorer']

export default function Explore() {
  const [username, setUsername] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedVibe, setSelectedVibe] = useState('All')
  const [activeTab, setActiveTab] = useState('posts')
  const [selectedPost, setSelectedPost] = useState<any>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        setUsername(profile?.username || user.email?.split('@')[0] || 'Traveler')
      }

      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      setPosts(postData || [])

      const { data: roomData } = await supabase
        .from('Rooms')
        .select('*')
        .eq('status', 'Open')
        .order('created_at', { ascending: false })
      setRooms(roomData || [])

      setLoading(false)
    }
    init()
  }, [])

  const filteredPosts = posts.filter(post => {
    const matchesSearch = search === '' ||
      post.location?.toLowerCase().includes(search.toLowerCase()) ||
      post.caption?.toLowerCase().includes(search.toLowerCase())
    const matchesVibe = selectedVibe === 'All' || post.vibe === selectedVibe
    return matchesSearch && matchesVibe
  })

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = search === '' ||
      room.destination?.toLowerCase().includes(search.toLowerCase()) ||
      room.name?.toLowerCase().includes(search.toLowerCase())
    const matchesVibe = selectedVibe === 'All' || room.vibe === selectedVibe
    return matchesSearch && matchesVibe
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Loading explore...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Feed</a>
          <a href="/explore" className="text-sm font-bold text-green-700">Explore</a>
          <a href="/rooms" className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Trips</a>
          <a href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Dashboard</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {username ? (
            <a href="/dashboard" className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                {username[0].toUpperCase()}
              </div>
              <span className="text-xs md:text-sm font-semibold text-green-700">{username}</span>
            </a>
          ) : (
            <a href="/login" className="text-xs md:text-sm font-semibold text-green-700 border border-green-200 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:bg-green-50 transition-all">
              Sign in
            </a>
          )}
          <a href="/rooms" className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:shadow-lg transition-all">
            Find Trip
          </a>
        </div>
      </nav>

      <div className="pt-14 md:pt-16">

        {/* HERO SEARCH */}
        <div className="bg-gradient-to-br from-green-600 to-green-400 px-4 py-10 md:py-16 text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">Explore the world 🌍</h1>
          <p className="text-green-100 text-sm md:text-base mb-6">Find travel stories and trips for your next adventure</p>
          <div className="max-w-xl mx-auto relative">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search destinations... Shimla, Goa, Spiti"
              className="w-full px-5 py-4 rounded-2xl text-gray-800 text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          </div>
        </div>

        {/* POPULAR DESTINATIONS */}
        <div className="px-4 py-4 border-b border-green-50 overflow-x-auto">
          <div className="flex gap-2 max-w-4xl mx-auto min-w-max md:min-w-0 md:flex-wrap md:justify-center">
            {POPULAR_DESTINATIONS.map(dest => (
              <button
                key={dest}
                onClick={() => setSearch(dest)}
                className={'px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ' + (search === dest ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700')}
              >
                {dest}
              </button>
            ))}
            {search !== '' && (
              <button
                onClick={() => setSearch('')}
                className="px-4 py-1.5 rounded-full text-xs font-bold border border-red-200 text-red-400 hover:bg-red-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* VIBE FILTERS */}
        <div className="px-4 py-3 border-b border-green-50">
          <div className="flex gap-2 max-w-4xl mx-auto overflow-x-auto">
            {VIBES.map(vibe => (
              <button
                key={vibe}
                onClick={() => setSelectedVibe(vibe)}
                className={'px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ' + (selectedVibe === vibe ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-700')}
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div className="px-4 border-b border-green-100">
          <div className="flex max-w-4xl mx-auto">
            <button
              onClick={() => setActiveTab('posts')}
              className={'px-6 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ' + (activeTab === 'posts' ? 'border-green-500 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600')}
            >
              Posts ({filteredPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={'px-6 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ' + (activeTab === 'trips' ? 'border-green-500 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600')}
            >
              Trips ({filteredRooms.length})
            </button>
          </div>
        </div>

        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <div className="max-w-4xl mx-auto px-2 py-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📸</div>
                <div className="font-bold text-gray-700 text-xl mb-2">No posts found</div>
                <div className="text-gray-400 text-sm mb-6">
                  {search ? 'No travel memories for ' + search + ' yet. Be the first!' : 'No posts yet. Be the first to share!'}
                </div>
                <a href="/" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all">
                  Share a Memory
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 md:gap-1">
                {filteredPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="aspect-square overflow-hidden cursor-pointer relative group"
                  >
                    {post.img_url ? (
                      <img
                        src={post.img_url}
                        alt={post.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-100 flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl">📍</span>
                        <span className="text-xs text-green-600 font-medium text-center px-2">{post.location}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all">
                      <div className="text-white text-xs font-bold truncate">{post.location}</div>
                    </div>
                    {post.is_verified_trip && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        V
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRIPS TAB */}
        {activeTab === 'trips' && (
          <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🏔️</div>
                <div className="font-bold text-gray-700 text-xl mb-2">No trips found</div>
                <div className="text-gray-400 text-sm mb-6">
                  {search ? 'No open trips to ' + search + ' right now.' : 'No open trips right now.'}
                </div>
                <a href="/rooms" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all">
                  Browse All Trips
                </a>
              </div>
            ) : (
              filteredRooms.map(room => {
                const seatsLeft = (room.seats_total || 8) - (room.seats_filled || 0)
                const pct = Math.round(((room.seats_filled || 0) / (room.seats_total || 8)) * 100)
                return (
                  <div key={room.id} className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="h-40 relative overflow-hidden">
                      {room.image_url ? (
                        <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-700 to-green-500" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <div className="text-white font-extrabold text-lg leading-tight">{room.name}</div>
                          <div className="text-white/80 text-xs mt-0.5">📍 {room.destination}</div>
                        </div>
                        {room.vibe && (
                          <span className="text-xs font-bold bg-white/20 backdrop-blur text-white px-2 py-1 rounded-full">
                            {room.vibe}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xl font-extrabold text-green-700">₹{room.price?.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 ml-1">per person</span>
                        </div>
                        <span className="text-xs text-gray-400">{room.dates}</span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-600">{room.seats_filled || 0} / {room.seats_total || 8} seats</span>
                          <span className={seatsLeft <= 2 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>{seatsLeft} left</span>
                        </div>
                        <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                          <div className={'h-full rounded-full ' + (pct >= 80 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-green-500')} style={{ width: pct + '%' }} />
                        </div>
                      </div>
                      <a
                        href={'/rooms/' + room.id}
                        className="block w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:shadow-lg transition-all"
                      >
                        View Room
                      </a>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

      </div>

      {/* POST DETAIL MODAL */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {selectedPost.img_url && (
              <div className="aspect-square overflow-hidden">
                <img src={selectedPost.img_url} alt={selectedPost.caption} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <a
                  href={'/profile/' + selectedPost.author_name}
                  className="font-bold text-sm text-gray-900 hover:text-green-700 transition-colors"
                >
                  {selectedPost.author_name}
                </a>
                {selectedPost.location && (
                  <span className="text-xs text-gray-400">📍 {selectedPost.location}</span>
                )}
                {selectedPost.is_verified_trip && (
                  <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">Verified Trip</span>
                )}
                {selectedPost.vibe && (
                  <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (VIBE_COLORS[selectedPost.vibe] || 'bg-gray-100 text-gray-500')}>
                    {selectedPost.vibe}
                  </span>
                )}
              </div>
              {selectedPost.caption && (
                <p className="text-sm text-gray-700 mb-3">{selectedPost.caption}</p>
              )}
              <a
                href="/rooms"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:shadow-lg transition-all"
              >
                Travel here with Cucumber
              </a>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}