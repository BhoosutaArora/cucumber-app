'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

const VIBE_COLORS: Record<string, string> = {
  Adventure: 'bg-orange-100 text-orange-600',
  Chill: 'bg-blue-100 text-blue-600',
  Cultural: 'bg-purple-100 text-purple-600',
  Explorer: 'bg-green-100 text-green-600',
}

export default function Home() {
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [showPostModal, setShowPostModal] = useState(false)

  const [postCaption, setPostCaption] = useState('')
  const [postLocation, setPostLocation] = useState('')
  const [postVibe, setPostVibe] = useState('Adventure')
  const [postImage, setPostImage] = useState<File | null>(null)
  const [postImagePreview, setPostImagePreview] = useState('')
  const [posting, setPosting] = useState(false)
  const [postSuccess, setPostSuccess] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        setUsername(profile?.username || user.email?.split('@')[0] || 'Traveler')
      }

      const { data: roomData } = await supabase
        .from('Rooms')
        .select('id, name, destination, status')
        .eq('status', 'Open')
      setRooms(roomData || [])

      await fetchPosts()
    }
    init()
  }, [])

  async function fetchPosts() {
    setLoadingPosts(true)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoadingPosts(false)
  }

  function getRoomForDestination(location: string) {
    if (!location) return null
    const lower = location.toLowerCase()
    return rooms.find(r =>
      r.destination?.toLowerCase().includes(lower) ||
      lower.includes(r.destination?.toLowerCase())
    )
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPostImage(file)
    setPostImagePreview(URL.createObjectURL(file))
  }

  async function handlePost() {
    if (!postCaption.trim() || !postLocation.trim()) return
    if (!userId) { window.location.href = '/login'; return }
    setPosting(true)

    try {
      let img_url = ''

      if (postImage) {
        const ext = postImage.name.split('.').pop()
        const fileName = 'posts/' + Date.now() + '.' + ext
        const { error: uploadError } = await supabase.storage
          .from('image')
          .upload(fileName, postImage, { upsert: true })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('image')
            .getPublicUrl(fileName)
          img_url = urlData.publicUrl
        }
      }

      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from('posts').insert({
        author_email: user?.email,
        author_name: username,
        caption: postCaption,
        location: postLocation,
        vibe: postVibe,
        img_url,
        user_id: userId,
        post_type: 'photo',
        is_verified_trip: false,
        likes: 0,
      })

      setPostCaption('')
      setPostLocation('')
      setPostVibe('Adventure')
      setPostImage(null)
      setPostImagePreview('')
      setPostSuccess(true)
      setTimeout(() => {
        setShowPostModal(false)
        setPostSuccess(false)
        fetchPosts()
      }, 1500)
    } catch (err) {
      console.error(err)
    }
    setPosting(false)
  }

  async function handleLike(postId: number, currentLikes: number) {
    await supabase
      .from('posts')
      .update({ likes: (currentLikes || 0) + 1 })
      .eq('id', postId)
    fetchPosts()
  }

  return (
    <main className="min-h-screen bg-white font-sans">

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
        <div className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
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

      <section className="w-full flex flex-col items-center justify-center relative overflow-hidden px-5 md:px-8 pt-24 pb-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,#C8F0C0,transparent_65%)] pointer-events-none" />
        <div className="relative z-10 text-center max-w-3xl w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none tracking-tight text-gray-900 mb-4">
            Travel <span className="text-green-500">together</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">with people who get it.</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-6">
            See real trips. Feel inspired. Join a room going there.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/rooms" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-extrabold text-sm shadow-lg hover:scale-105 transition-all text-center">
              Browse Trips
            </a>
            {!username && (
              <a href="/login" className="w-full sm:w-auto px-7 py-3.5 rounded-2xl border-2 border-green-200 text-green-700 font-bold text-sm bg-white hover:bg-green-50 transition-all text-center">
                Create account free
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="w-full px-4 flex justify-center pb-3 sticky top-14 md:top-16 z-40 bg-white border-b border-green-50 py-3">
        <button
          onClick={() => setShowPostModal(true)}
          className="flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-2xl px-6 py-3 hover:bg-green-100 hover:border-green-400 transition-all cursor-pointer group w-full max-w-xl"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {username ? username[0].toUpperCase() : '?'}
          </div>
          <span className="text-sm text-gray-400 group-hover:text-green-700 font-medium transition-colors">
            Share a Travel Memory
          </span>
          <span className="ml-auto text-green-500 font-bold text-lg">+</span>
        </button>
      </section>

      <section className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">

        {loadingPosts && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🥒</div>
            <div className="text-green-700 font-bold">Loading travel memories...</div>
          </div>
        )}

        {!loadingPosts && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📸</div>
            <div className="font-bold text-gray-700 text-xl mb-2">No posts yet!</div>
            <div className="text-gray-400 mb-6">Be the first to share a travel memory.</div>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all"
            >
              Share a Travel Memory
            </button>
          </div>
        )}

        {posts.map((post: any) => {
          const matchedRoom = getRoomForDestination(post.location)
          const timeAgo = post.created_at
            ? new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : ''

          return (
            <div key={post.id} className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm hover:shadow-md transition-all">

              <div className="flex items-center gap-3 p-4 pb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {post.author_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm">{post.author_name || 'Traveler'}</div>
                  <div className="text-xs text-gray-400">
                    {post.location && ('📍 ' + post.location + ' · ')}
                    {timeAgo}
                  </div>
                </div>
                {post.vibe && (
                  <span className={'text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ' + (VIBE_COLORS[post.vibe] || 'bg-gray-100 text-gray-500')}>
                    {post.vibe}
                  </span>
                )}
                {post.is_verified_trip && (
                  <span className="text-xs font-bold bg-green-500 text-white px-2.5 py-1 rounded-full flex-shrink-0">
                    Verified Trip
                  </span>
                )}
              </div>

              {post.img_url && (
                <div className="w-full aspect-square overflow-hidden">
                  <img
                    src={post.img_url}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {post.caption && (
                <div className="px-4 pt-3 pb-1">
                  <span className="font-bold text-sm text-gray-900">{post.author_name} </span>
                  <span className="text-sm text-gray-700">{post.caption}</span>
                </div>
              )}

              <div className="px-4 pt-2 pb-3 flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id, post.likes)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <span className="text-lg">🤍</span>
                  <span className="font-semibold">{post.likes || 0}</span>
                </button>
              </div>

              <div className="px-4 pb-4">
                {matchedRoom ? (
                  
                    href={"/rooms/" + matchedRoom.id}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:shadow-lg transition-all"
                  >
                    Travel here with Cucumber
                  </a>
                ) : (
                  
                    href="/rooms"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-green-200 text-green-700 font-bold text-sm hover:bg-green-50 transition-all"
                  >
                    Browse all trips
                  </a>
                )}
              </div>

            </div>
          )
        })}

      </section>

      <section className="w-full bg-white py-14 md:py-24 px-4 md:px-16 border-t border-green-50">
        <div className="text-center mb-10 md:mb-14">
          <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">How it works</div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            From stranger to travel buddy in 4 steps.
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto">
          {[
            { num: '01', icon: '🪪', title: 'Sign up & verify', desc: 'Create your profile and upload your government ID.' },
            { num: '02', icon: '🏠', title: 'Join a room', desc: 'Pick a destination and vibe. See exactly who is already in.' },
            { num: '03', icon: '🎥', title: 'Video call first', desc: 'Pay 199 token to meet your travel buddies on video before committing.' },
            { num: '04', icon: '✈️', title: 'Travel together', desc: 'Show up, meet your tribe, make memories that last forever.' },
          ].map((s) => (
            <div key={s.num} className="text-center p-4 md:p-8">
              <div className="text-4xl md:text-6xl font-extrabold text-green-100 leading-none mb-3 md:mb-4">{s.num}</div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-lg md:text-2xl mx-auto mb-3 md:mb-4">{s.icon}</div>
              <div className="font-bold text-gray-900 text-sm md:text-lg mb-2">{s.title}</div>
              <div className="text-xs md:text-sm text-gray-400 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="w-full bg-gray-950 py-10 md:py-16 px-4 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div>
              <div className="text-xl md:text-2xl font-extrabold text-green-400 mb-2">cucumber.</div>
              <div className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-xs">Social travel for people who want real connections, not just destinations.</div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contact us</div>
              <a href="https://instagram.com/cucumbertravel.in" target="_blank" className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 hover:border-green-800 transition-all">
                <span className="text-lg">📸</span>
                <span className="text-sm font-semibold text-gray-300">@cucumbertravel.in</span>
              </a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-800 pt-6 gap-3">
            <span className="text-xs text-gray-600 text-center">2026 Cucumber Travel. Made with love in India</span>
            <a href="/privacy-policy" className="text-xs text-gray-600 hover:text-green-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 px-0 md:px-4">
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl">

            <div className="flex items-center justify-between px-5 py-4 border-b border-green-100">
              <div className="font-bold text-gray-900">Share a Travel Memory</div>
              <button
                onClick={() => { setShowPostModal(false); setPostImagePreview('') }}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer"
              >
                x
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              {postSuccess ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">🥒</div>
                  <div className="font-bold text-green-700 text-xl">Memory shared!</div>
                  <div className="text-gray-400 text-sm mt-1">Your travel story is now live.</div>
                </div>
              ) : (
                <>
                  <div
                    onClick={() => document.getElementById('post-image-input')?.click()}
                    className="w-full h-48 rounded-2xl border-2 border-dashed border-green-200 flex items-center justify-center cursor-pointer hover:border-green-400 transition-all overflow-hidden bg-green-50"
                  >
                    {postImagePreview ? (
                      <img src={postImagePreview} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl mb-2">📸</div>
                        <div className="text-sm text-gray-400 font-medium">Tap to add a photo</div>
                      </div>
                    )}
                  </div>
                  <input
                    id="post-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  <textarea
                    value={postCaption}
                    onChange={e => setPostCaption(e.target.value)}
                    placeholder="Tell us about this place... What did it feel like?"
                    rows={3}
                    className="w-full border border-green-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-green-400 text-gray-800 placeholder-gray-300"
                  />

                  <input
                    value={postLocation}
                    onChange={e => setPostLocation(e.target.value)}
                    placeholder="Where is this? (e.g. Shimla, Himachal Pradesh)"
                    className="w-full border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 text-gray-800 placeholder-gray-300"
                  />

                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">What is the vibe?</div>
                    <div className="flex gap-2 flex-wrap">
                      {['Adventure', 'Chill', 'Cultural', 'Explorer'].map(v => (
                        <button
                          key={v}
                          onClick={() => setPostVibe(v)}
                          className={'px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ' + (postVibe === v ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300')}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePost}
                    disabled={posting || !postCaption.trim() || !postLocation.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {posting ? 'Sharing...' : 'Share Memory'}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </main>
  )
}
