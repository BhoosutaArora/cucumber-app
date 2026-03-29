'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Explore() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [newPost, setNewPost] = useState({
    caption: '',
    location: '',
    trip_name: '',
  })
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      await fetchPosts()
      setLoading(false)
    }
    init()
  }, [])

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  async function createPost() {
    if (!user) { window.location.href = '/login'; return }
    if (!newPost.caption || !newPost.location) {
      alert('Please add a caption and location!')
      return
    }
    setSubmitting(true)

    const { error } = await supabase.from('posts').insert([{
      author_email: user.email,
      author_name: user.email?.split('@')[0],
      caption: newPost.caption,
      location: newPost.location,
      trip_name: newPost.trip_name,
      likes: 0,
    }])

    if (!error) {
      setShowCreatePost(false)
      setNewPost({ caption: '', location: '', trip_name: '' })
      await fetchPosts()
    }
    setSubmitting(false)
  }

  async function likePost(postId: number, currentLikes: number) {
    if (!user) { window.location.href = '/login'; return }
    const newLiked = new Set(likedPosts)
    if (likedPosts.has(postId)) {
      newLiked.delete(postId)
      await supabase.from('posts').update({ likes: currentLikes - 1 }).eq('id', postId)
    } else {
      newLiked.add(postId)
      await supabase.from('posts').update({ likes: currentLikes + 1 }).eq('id', postId)
    }
    setLikedPosts(newLiked)
    await fetchPosts()
  }

  function getColor(email: string) {
    const colors = ['#7B1FA2', '#1565C0', '#B71C1C', '#E65100', '#00695C', '#AD1457', '#0277BD', '#2E7D32']
    return colors[(email?.charCodeAt(0) || 0) % colors.length]
  }

  function getGradient(index: number) {
    const gradients = [
      'from-indigo-900 to-purple-800',
      'from-green-800 to-teal-700',
      'from-orange-800 to-red-700',
      'from-blue-900 to-blue-700',
      'from-pink-800 to-rose-700',
      'from-slate-800 to-gray-700',
    ]
    return gradients[index % gradients.length]
  }

  function timeAgo(timestamp: string) {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filters = ['All', '🏔️ Adventure', '🌿 Peaceful', '🏛️ Explorer', '🏖️ Beach']

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Loading explore...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          <a href="/" className="text-sm font-medium text-gray-500 hover:text-green-700">Home</a>
          <a href="/explore" className="text-sm font-bold text-green-700">Explore</a>
          <a href="/rooms" className="text-sm font-medium text-gray-500 hover:text-green-700">Rooms</a>
          <a href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-green-700">Dashboard</a>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:shadow-lg transition-all"
            >
              + Post
            </button>
          ) : (
            <a href="/login" className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-4 py-1.5 rounded-xl">
              Sign in
            </a>
          )}
        </div>
      </nav>

      <div className="pt-16 md:pt-20 max-w-2xl mx-auto px-4 pb-16">

        {/* ── HEADER ── */}
        <div className="py-6 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Explore 🌍</h1>
          <p className="text-sm text-gray-500">See what the Cucumber community is up to</p>
        </div>

        {/* ── FILTERS ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap transition-all flex-shrink-0 ${activeFilter === filter ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-700'}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ── CREATE POST PROMPT ── */}
        {user && (
          <div
            onClick={() => setShowCreatePost(true)}
            className="bg-white rounded-2xl border border-green-100 p-4 mb-5 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{background: getColor(user.email)}}>
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 bg-green-50 rounded-xl px-4 py-2.5 text-sm text-gray-400 border border-green-100">
              Share your travel story... ✈️
            </div>
            <button className="text-xs font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-3 py-2 rounded-xl">
              Post
            </button>
          </div>
        )}

        {/* ── POSTS FEED ── */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 p-10 text-center">
            <div className="text-5xl mb-4">🌍</div>
            <div className="font-bold text-gray-700 text-lg mb-2">No posts yet!</div>
            <div className="text-sm text-gray-400 mb-5">Be the first to share your travel story with the Cucumber community.</div>
            {user ? (
              <button
                onClick={() => setShowCreatePost(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all"
              >
                Share Your Story 🥒
              </button>
            ) : (
              <a href="/login" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm">
                Sign in to Post
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post, index) => (
              <div key={post.id} className="bg-white rounded-2xl border border-green-100 overflow-hidden">

                {/* Post Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <a href={`/profile/${post.author_name}`}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 hover:scale-110 transition-transform" style={{background: getColor(post.author_email)}}>
                      {post.author_name?.[0]?.toUpperCase()}
                    </div>
                  </a>
                  <div className="flex-1">
                    <a href={`/profile/${post.author_name}`} className="font-bold text-gray-900 text-sm hover:text-green-700 transition-colors">
                      {post.author_name}
                    </a>
                    <div className="text-xs text-gray-400 mt-0.5">{timeAgo(post.created_at)}</div>
                  </div>
                  {post.trip_name && (
                    <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
                      {post.trip_name}
                    </span>
                  )}
                </div>

                {/* Post Image Placeholder */}
                <div className={`h-48 md:h-64 bg-gradient-to-br ${getGradient(index)} flex items-end p-4 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
                  <span className="text-xs font-bold text-white bg-black/30 backdrop-blur px-3 py-1.5 rounded-xl relative z-10">
                    📍 {post.location}
                  </span>
                </div>

                {/* Post Caption */}
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.caption}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-1 border-t border-green-50 pt-3">
                    <button
                      onClick={() => likePost(post.id, post.likes)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all flex-1 justify-center ${likedPosts.has(post.id) ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}
                    >
                      {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-green-50 hover:text-green-700 transition-all flex-1 justify-center">
                      💬 Comment
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-green-50 hover:text-green-700 transition-all flex-1 justify-center">
                      ↗ Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CREATE POST MODAL ── */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-green-50">
              <div className="font-bold text-gray-900 text-lg">Share Your Story ✈️</div>
              <button onClick={() => setShowCreatePost(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Caption *</label>
                <textarea
                  value={newPost.caption}
                  onChange={(e) => setNewPost({...newPost, caption: e.target.value})}
                  placeholder="Tell the community about your trip... 🏔️"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Location *</label>
                <input
                  type="text"
                  value={newPost.location}
                  onChange={(e) => setNewPost({...newPost, location: e.target.value})}
                  placeholder="e.g. Pangong Lake, Ladakh"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Trip Name (optional)</label>
                <input
                  type="text"
                  value={newPost.trip_name}
                  onChange={(e) => setNewPost({...newPost, trip_name: e.target.value})}
                  placeholder="e.g. Adventure Squad 🏔️"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                <div className="text-xs font-bold text-yellow-700 mb-1">📸 Photo upload coming soon!</div>
                <div className="text-xs text-yellow-600">For now posts show a beautiful gradient. Real photo uploads will be added in the next update.</div>
              </div>

              <button
                onClick={createPost}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Share Post 🥒'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}