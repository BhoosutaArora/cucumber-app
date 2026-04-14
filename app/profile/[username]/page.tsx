'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'

export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [tripsCount, setTripsCount] = useState(0)
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [openRooms, setOpenRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [inviting, setInviting] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [currentUsername, setCurrentUsername] = useState('')
  const { username } = React.use(params)

  const VIBE_COLORS: Record<string, string> = {
    Adventure: 'bg-orange-100 text-orange-600 border-orange-200',
    Chill: 'bg-blue-100 text-blue-600 border-blue-200',
    Cultural: 'bg-purple-100 text-purple-600 border-purple-200',
    Explorer: 'bg-green-100 text-green-600 border-green-200',
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (user) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        setCurrentUsername(myProfile?.username || '')
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      setProfileUser(profileData)

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_email', profileData?.email || '')
        .order('created_at', { ascending: false })
      setReviews(reviewData || [])

      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('author_name', username)
        .order('created_at', { ascending: false })
      setPosts(postData || [])

      if (profileData?.id) {
        const { data: memberData } = await supabase
          .from('room_members')
          .select('id')
          .eq('user_id', profileData.id)
        setTripsCount(memberData?.length || 0)
      }

      const { data: roomData } = await supabase
        .from('Rooms')
        .select('*')
        .eq('status', 'Open')
      setOpenRooms(roomData || [])

      setLoading(false)
    }
    init()
  }, [username])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return
    setUploadingAvatar(true)

    try {
      const ext = file.name.split('.').pop()
      const fileName = 'avatars/' + currentUser.id + '.' + ext
      const { error: uploadError } = await supabase.storage
        .from('image')
        .upload(fileName, file, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('image')
          .getPublicUrl(fileName)

        await supabase
          .from('profiles')
          .update({ avatar_url: urlData.publicUrl })
          .eq('id', currentUser.id)

        setProfileUser((prev: any) => ({ ...prev, avatar_url: urlData.publicUrl }))
      }
    } catch (err) {
      console.error(err)
    }
    setUploadingAvatar(false)
  }

  async function handleSendInvite() {
    if (!selectedRoom || !currentUser || !profileUser) return
    setInviting(true)

    await supabase.from('room_invites').insert({
      room_id: selectedRoom.id,
      inviter_id: currentUser.id,
      invitee_id: profileUser.id,
      inviter_name: currentUsername,
      room_name: selectedRoom.name,
      status: 'pending',
    })

    setInviting(false)
    setInviteSent(true)
    setTimeout(() => {
      setShowInviteModal(false)
      setInviteSent(false)
      setSelectedRoom(null)
    }, 2000)
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  function getDominantVibe() {
    if (posts.length === 0) return null
    const vibeCounts: Record<string, number> = {}
    posts.forEach(p => {
      if (p.vibe) vibeCounts[p.vibe] = (vibeCounts[p.vibe] || 0) + 1
    })
    return Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  }

  const dominantVibe = getDominantVibe()

  function getRankBadge(trips: number) {
    if (trips >= 20) return { label: 'Legend', emoji: '🏆', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    if (trips >= 10) return { label: 'Voyager', emoji: '🌍', color: 'text-purple-600 bg-purple-50 border-purple-200' }
    if (trips >= 5) return { label: 'Explorer', emoji: '🧭', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    return { label: 'New Traveler', emoji: '🌱', color: 'text-green-600 bg-green-50 border-green-200' }
  }

  const rank = getRankBadge(tripsCount)
  const isMyProfile = currentUser?.id === profileUser?.id

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
    <main className="min-h-screen bg-green-50 font-sans pb-20 md:pb-0">

      <Navbar />

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl">
            <div className="bg-gradient-to-br from-green-600 to-green-400 px-6 py-5 text-center">
              <div className="text-3xl mb-2">🥒</div>
              <h2 className="text-white font-extrabold text-lg">Invite {username} to a Trip!</h2>
              <p className="text-green-100 text-xs mt-1">Choose which room to invite them to</p>
            </div>

            <div className="p-5">
              {inviteSent ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">🎉</div>
                  <div className="font-bold text-green-700 text-lg">Invite sent!</div>
                  <div className="text-gray-400 text-sm mt-1">{username} will see your invite when they open the app!</div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 mb-4">
                    {openRooms.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-4">No open rooms right now</div>
                    ) : (
                      openRooms.map(room => (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ' + (selectedRoom?.id === room.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200')}
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                            {room.image_url ? (
                              <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 text-sm truncate">{room.name}</div>
                            <div className="text-xs text-gray-400">📍 {room.destination} · {room.dates}</div>
                          </div>
                          {selectedRoom?.id === room.id && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={handleSendInvite}
                    disabled={!selectedRoom || inviting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </button>
                  <button
                    onClick={() => { setShowInviteModal(false); setSelectedRoom(null) }}
                    className="w-full py-2.5 mt-2 text-sm text-gray-400 cursor-pointer hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="pt-14 md:pt-16 max-w-2xl mx-auto">

        <div className="bg-gradient-to-br from-green-600 to-green-400 h-32 md:h-40 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        <div className="px-4 md:px-6 pb-4 bg-white border-b border-green-100">
          <div className="flex items-end justify-between -mt-12 mb-3">
            <div className="relative">
              {profileUser?.avatar_url ? (
                <img
                  src={profileUser.avatar_url}
                  alt={username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                  {username[0]?.toUpperCase()}
                </div>
              )}
              {isMyProfile && (
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-all shadow-md border-2 border-white">
                  {uploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-white text-sm">📷</span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              )}
            </div>

            <div className="flex gap-2">
              {!isMyProfile && currentUser && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold hover:scale-105 transition-all cursor-pointer"
                >
                  Invite to Room
                </button>
              )}
              {isMyProfile && (
                <a href="/dashboard" className="px-5 py-2 rounded-xl border border-green-200 text-green-700 text-sm font-bold hover:bg-green-50 transition-all">
                  Edit Profile
                </a>
              )}
            </div>
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
                    <img src={post.img_url} alt={post.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl">📍</span>
                    </div>
                  )}
                  {post.is_verified_trip && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">V</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="bg-white mt-2 border-t border-green-100">
            <div className="px-4 py-3 border-b border-green-50 flex items-center justify-between">
              <div className="font-bold text-gray-900 text-sm">Reviews ({reviews.length})</div>
              {avgRating && <div className="text-sm font-bold text-green-700">{avgRating} ⭐</div>}
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

      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            {selectedPost.img_url && (
              <div className="aspect-square overflow-hidden">
                <img src={selectedPost.img_url} alt={selectedPost.caption} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {selectedPost.location && <span className="text-xs text-gray-400">📍 {selectedPost.location}</span>}
                {selectedPost.is_verified_trip && <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">Verified Trip</span>}
                {selectedPost.vibe && (
                  <span className={'text-xs font-bold px-2 py-0.5 rounded-full border ' + (VIBE_COLORS[selectedPost.vibe] || 'bg-gray-100 text-gray-500 border-gray-200')}>
                    {selectedPost.vibe}
                  </span>
                )}
              </div>
              {selectedPost.caption && <p className="text-sm text-gray-700 mb-3">{selectedPost.caption}</p>}
              <a href="/rooms" className="block w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:shadow-lg transition-all">
                Travel here with Cucumber
              </a>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}