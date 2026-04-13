'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [tripsCount, setTripsCount] = useState(0)
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const { username } = React.use(params)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Get profile from profiles table by username
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      setProfileUser(profileData)

      // Get reviews
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_email', profileData?.email || '')
        .order('created_at', { ascending: false })
      setReviews(reviewData || [])

      // Get posts by this user
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('author_name', username)
        .order('created_at', { ascending: false })
      setPosts(postData || [])

      // Get trips count from room_members
      if (profileData?.id) {
        const { data: memberData } = await supabase
          .from('room_members')
          .select('id')
          .eq('user_id', profileData.id)
        setTripsCount(memberData?.length || 0)
      }

      setLoading(false)
    }
    init()
  }, [username])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // Get dominant vibe from posts
  function getDominantVibe() {
    if (posts.length === 0) return null
    const vibeCounts: Record<string, number> = {}
    posts.forEach(p => {
      if (p.vibe) vibeCounts[p.vibe] = (vibeCounts[p.vibe] || 0) + 1
    })
    return Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  }

  const dominantVibe = getDominantVibe()

  const VIBE_COLORS: Record<string, string> = {
    Adventure: 'bg-orange-100 text-orange-600 border-orange-200',
    Chill: 'bg-blue-100 text-blue-600 border-blue-200',
    Cultural: 'bg-purple-100 text-purple-600 border-purple-200',
    Explorer: 'bg-green-100 text-green-600 border-green-200',
  }

  const getRankBadge = (trips: number) => {
    if (trips >= 20) return { label: 'Legend', emoji: '🏆', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    if (trips >= 10) return { label: 'Voyager', emoji: '🌍', color: 'text-purple-600 bg-purple-50 border-purple-200' }
    if (trips >= 5) return { label: 'Explorer', emoji: '🧭', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    return { label: 'New Traveler', emoji: '🌱', color: 'text-green-600 bg-green-50 border-green-200' }
  }

  const rank = getRankBadge(tripsCount)

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </a>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <a href="/dashboard" className="text-xs md:text-sm font-semibold text-green-700 border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50">
              Dashboard
            </a>
          ) : (
            <a href="/login" className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-4 py-1.5 rounded-xl">
              Sign in
            </a>
          )}
        </div>
      </nav>

      <div className="pt-16 pb-16 max-w-2xl mx-auto">

        {/* COVER */}
        <div className="bg-gradient-to-br from-green-600 to-green-400 h-32 md:h-40 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        {/* AVATAR + NAME */}
        <div className="px-4 md:px-6 pb-4 bg-white border-b border-green-100">
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-white shadow-lg">
              {username[0]?.toUpperCase()}
            </div>
            {currentUser && currentUser.email !== profileUser?.email && (
              <a href="/rooms" className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold hover:scale-105 transition-all">
                Invite to Room
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">{username}</h1>
            <span className={'text-xs font-bold px-2.5 py-1 rounded-full border ' + rank.color}>
              {rank.emoji} {rank.label}
            </span>
            {dominantVibe && (
              <span className={'text-xs font-bold px-2.5 py-1 rounded-full border ' + (VIBE_COLORS[dominantVibe] || 'bg-gray-100 text-gray-500 border-gray-200')}>
                {dominantVibe} traveler
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400 mb-4">@{username}</div>

          {/* Stats row */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="font-extrabold text-gray-900 text-lg">{posts.length}</div>
              <div className="text-xs text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-extrabold text-gray-900 text-lg">{tripsCount}</div>
              <div className="text-xs text-gray-400">Trips</div>
            </div>
            <div className="text-center">
              <div className="font-extrabold text-gray-900 text-lg">{avgRating ? avgRating + ' ⭐' : '—'}</div>
              <div className="text-xs text-gray-400">Rating</div>
            </div>
          </div>
        </div>

        {/* POSTS GRID */}
        <div className="bg-white mt-2 border-t border-b border-green-100">
          <div className="px-4 py-3 border-b border-green-50">
            <div className="font-bold text-gray-900 text-sm">Travel Memories</div>
          </div>

          {posts.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">📸</div>
              <div className="font-bold text-gray-600 mb-1">No posts yet</div>
              <div className="text-xs text-gray-400">Travel memories will appear here</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 p-0.5">
              {posts.map((post) => (
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
                    <div className="w-full h-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl">📍</span>
                    </div>
                  )}
                  {post.is_verified_trip && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      ✓
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REVIEWS */}
        {reviews.length > 0 && (
          <div className="bg-white mt-2 border-t border-green-100">
            <div className="px-4 py-3 border-b border-green-50 flex items-center justify-between">
              <div className="font-bold text-gray-900 text-sm">Reviews ({reviews.length})</div>
              {avgRating && (
                <div className="text-sm font-bold text-green-700">{avgRating} ⭐</div>
              )}
            </div>
            <div className="divide-y divide-green-50">
              {reviews.map((review) => (
                <div key={review.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                        {review.reviewer_email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{review.reviewer_email?.split('@')[0]}</div>
                        <div className="text-xs text-green-600">{review.trip_name}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={'text-sm ' + (review.rating >= star ? 'text-yellow-400' : 'text-gray-200')}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
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
              <div className="flex items-center gap-2 mb-2">
                {selectedPost.location && (
                  <span className="text-xs text-gray-400">📍 {selectedPost.location}</span>
                )}
                {selectedPost.is_verified_trip && (
                  <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">✓ Verified Trip</span>
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