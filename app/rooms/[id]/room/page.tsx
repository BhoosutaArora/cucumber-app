'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

declare global {
  interface Window { Razorpay: any }
}

export default function RoomPage() {
  const params = useParams()
  const id = params?.id as string
  const [room, setRoom] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [myMembership, setMyMembership] = useState<any>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [sealing, setSealing] = useState(false)
  const [kickVotes, setKickVotes] = useState<any[]>([])
  const [kickingId, setKickingId] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [hasPaidVideo, setHasPaidVideo] = useState(false)

  const [roomPosts, setRoomPosts] = useState<any[]>([])
  const [showFeedModal, setShowFeedModal] = useState(false)
  const [feedCaption, setFeedCaption] = useState('')
  const [feedImage, setFeedImage] = useState<File | null>(null)
  const [feedImagePreview, setFeedImagePreview] = useState('')
  const [feedPosting, setFeedPosting] = useState(false)
  const [feedSuccess, setFeedSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('members')

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      setUsername(profile?.username || user.email?.split('@')[0] || 'Traveler')

      const { data: membership } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', id)
        .eq('user_id', user.id)
        .single()

      if (!membership) { window.location.href = '/rooms/' + id; return }
      setMyMembership(membership)
      setHasPaidVideo(membership.has_paid_video || false)
      if (!membership.is_ready) setShowPopup(true)

      const { data: roomData } = await supabase
        .from('Rooms')
        .select('*, itineraries(*)')
        .eq('id', id)
        .single()
      setRoom(roomData)

      await loadMembers()
      await loadKickVotes()
      await loadRoomPosts()
      setLoading(false)
    }
    if (id) load()

    return () => {
      try { document.body.removeChild(script) } catch (e) {}
    }
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
          .select('username, age_group, gender')
          .eq('id', member.user_id)
          .single()
        return {
          ...member,
          username: profile?.username || 'Traveler',
          age_group: profile?.age_group || null,
          gender: profile?.gender || null,
        }
      })
    )
    setMembers(membersWithProfiles)
  }

  async function loadKickVotes() {
    const { data } = await supabase.from('kick_votes').select('*').eq('room_id', id)
    setKickVotes(data || [])
  }

  async function loadRoomPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('destination_room_id', parseInt(id))
      .order('created_at', { ascending: false })
    setRoomPosts(data || [])
  }

  async function markReady() {
    const { error } = await supabase
      .from('room_members')
      .update({ is_ready: true })
      .eq('room_id', id)
      .eq('user_id', user.id)

    if (!error) {
      setMyMembership((prev: any) => ({ ...prev, is_ready: true }))
      await loadMembers()
    }
  }

  async function sealRoom() {
    setSealing(true)
    await supabase.from('Rooms').update({ is_sealed: true }).eq('id', id)
    setRoom((prev: any) => ({ ...prev, is_sealed: true }))
    setSealing(false)
    alert('Room sealed! Video call is now unlocked! 🥒')
  }

  async function voteToKick(targetId: string, targetUsername: string) {
    if (targetId === user.id) return
    const alreadyVoted = kickVotes.some(v => v.voter_id === user.id && v.target_id === targetId)
    if (alreadyVoted) { alert('You already voted to kick ' + targetUsername + '!'); return }
    if (!confirm('Vote to kick ' + targetUsername + '? If majority agrees they will be removed.')) return

    setKickingId(targetId)
    await supabase.from('kick_votes').insert({ room_id: id, voter_id: user.id, target_id: targetId })

    const { data: updatedVotes } = await supabase.from('kick_votes').select('*').eq('room_id', id)
    const allVotes = updatedVotes || []
    setKickVotes(allVotes)

    const { data: freshMembers } = await supabase.from('room_members').select('*').eq('room_id', id)
    const totalMembers = (freshMembers || []).length
    const votesAgainstTarget = allVotes.filter((v: any) => v.target_id === targetId).length
    const majorityReached = votesAgainstTarget > totalMembers / 2

    if (majorityReached) {
      await supabase.from('room_members').delete().eq('room_id', id).eq('user_id', targetId)
      await supabase.from('kick_votes').delete().eq('room_id', id).eq('target_id', targetId)
      alert(targetUsername + ' has been removed from the room by majority vote.')
      await loadMembers()
      await loadKickVotes()
    } else {
      alert('Vote recorded! ' + votesAgainstTarget + '/' + totalMembers + ' votes to kick ' + targetUsername + '. Need majority to remove.')
    }
    setKickingId(null)
  }

  async function handleVideoCall() {
    // If already paid — go directly to video call
    if (hasPaidVideo) {
      window.location.href = '/video-call'
      return
    }

    setPaymentLoading(true)
    try {
      const res = await fetch('/api/razorpay-order', { method: 'POST' })
      const { orderId, error } = await res.json()
      if (error || !orderId) {
        alert('Payment setup failed. Please try again!')
        setPaymentLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', user.id)
        .single()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 3500,
        currency: 'INR',
        name: 'Cucumber Travel',
        description: 'Video Call Token',
        image: '/favicon.ico',
        order_id: orderId,
        prefill: {
          name: profile?.username || '',
          email: user?.email || '',
        },
        theme: { color: '#4CAF50' },
        handler: async function (response: any) {
          // Mark as paid in database
          await supabase
            .from('room_members')
            .update({ has_paid_video: true })
            .eq('room_id', id)
            .eq('user_id', user.id)

          setHasPaidVideo(true)
          setPaymentLoading(false)

          // Redirect immediately to video call
          window.location.href = '/video-call'
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again!')
      setPaymentLoading(false)
    }
  }

  function handleFeedImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFeedImage(file)
    setFeedImagePreview(URL.createObjectURL(file))
  }

  async function handleFeedPost() {
    if (!feedCaption.trim()) return
    setFeedPosting(true)

    try {
      let img_url = ''

      if (feedImage) {
        const ext = feedImage.name.split('.').pop()
        const fileName = 'posts/' + Date.now() + '.' + ext
        const { error: uploadError } = await supabase.storage
          .from('image')
          .upload(fileName, feedImage, { upsert: true })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('image')
            .getPublicUrl(fileName)
          img_url = urlData.publicUrl
        }
      }

      await supabase.from('posts').insert({
        author_email: user?.email,
        author_name: username,
        caption: feedCaption,
        location: room?.destination || '',
        vibe: room?.vibe || 'Adventure',
        img_url,
        user_id: user?.id,
        post_type: 'photo',
        is_verified_trip: true,
        destination_room_id: parseInt(id),
        likes: 0,
      })

      setFeedCaption('')
      setFeedImage(null)
      setFeedImagePreview('')
      setFeedSuccess(true)
      setTimeout(() => {
        setShowFeedModal(false)
        setFeedSuccess(false)
        loadRoomPosts()
      }, 1500)
    } catch (err) {
      console.error(err)
    }
    setFeedPosting(false)
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
  const halfReached = totalCount > 0 && readyCount >= Math.ceil(totalCount / 2)
  const iAmReady = myMembership?.is_ready === true

  return (
    <main className="min-h-screen bg-green-50 font-sans">

      {/* WELCOME POPUP */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-3xl mb-3 text-center">🥒</div>
            <h2 className="text-lg font-extrabold text-gray-900 text-center mb-2">Welcome to the room!</h2>
            <p className="text-sm text-gray-500 text-center mb-4 leading-relaxed">
              This room can be sealed once minimum half the members click Ready. Once sealed, video call unlocks!
            </p>
            <button onClick={() => { setShowPopup(false); markReady() }} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold cursor-pointer hover:shadow-lg transition-all">
              Got it — I am Ready!
            </button>
            <button onClick={() => setShowPopup(false)} className="w-full py-2 mt-2 text-sm text-gray-400 cursor-pointer hover:text-gray-600 transition-all">
              I will decide later
            </button>
          </div>
        </div>
      )}

      {/* POST MODAL */}
      {showFeedModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 px-0 md:px-4">
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-green-100">
              <div className="font-bold text-gray-900">Share with your room</div>
              <button onClick={() => { setShowFeedModal(false); setFeedImagePreview('') }} className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer">x</button>
            </div>
            <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              {feedSuccess ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">🥒</div>
                  <div className="font-bold text-green-700 text-xl">Posted!</div>
                  <div className="text-gray-400 text-sm mt-1">Your memory is now in the room feed with a Verified Trip badge!</div>
                </div>
              ) : (
                <div>
                  <div onClick={() => document.getElementById('feed-image-input')?.click()} className="w-full h-48 rounded-2xl border-2 border-dashed border-green-200 flex items-center justify-center cursor-pointer hover:border-green-400 transition-all overflow-hidden bg-green-50 mb-4">
                    {feedImagePreview ? (
                      <img src={feedImagePreview} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl mb-2">📸</div>
                        <div className="text-sm text-gray-400 font-medium">Tap to add a photo</div>
                      </div>
                    )}
                  </div>
                  <input id="feed-image-input" type="file" accept="image/*" className="hidden" onChange={handleFeedImageChange} />
                  <textarea value={feedCaption} onChange={e => setFeedCaption(e.target.value)} placeholder="Share something with your travel buddies..." rows={3} className="w-full border border-green-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-green-400 text-gray-800 placeholder-gray-300 mb-3" />
                  <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 mb-3">
                    <div className="text-xs text-green-700 font-semibold">This post gets a Verified Trip badge and appears on the main feed!</div>
                  </div>
                  <button onClick={handleFeedPost} disabled={feedPosting || !feedCaption.trim()} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer">
                    {feedPosting ? 'Posting...' : 'Share with Room'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl font-extrabold text-green-700 cursor-pointer">cucumber<span className="text-green-400">.</span></a>
        <a href="/rooms" className="text-sm font-semibold text-gray-500 hover:text-green-700 cursor-pointer">Back to Rooms</a>
      </nav>

      <div className="pt-20 pb-16 px-4 md:px-16 max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
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
              <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all" style={{ width: totalCount > 0 ? (readyCount / totalCount * 100) + '%' : '0%' }} />
            </div>
            {!iAmReady ? (
              <button onClick={markReady} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm cursor-pointer hover:shadow-lg transition-all">
                I am Ready to Travel!
              </button>
            ) : (
              <div className="text-center text-sm text-green-600 font-semibold py-2">You are ready! Waiting for others...</div>
            )}
            {halfReached && (
              <button onClick={sealRoom} disabled={sealing} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-sm mt-3 cursor-pointer hover:shadow-lg transition-all disabled:opacity-50">
                {sealing ? 'Sealing...' : 'Seal the Room!'}
              </button>
            )}
            {halfReached && <p className="text-xs text-center text-purple-600 font-medium mt-2">Minimum members reached! Room can be sealed now.</p>}
          </div>
        )}

        {/* TABS */}
        <div className="bg-white rounded-2xl border border-green-100 mb-4 overflow-hidden">
          <div className="flex border-b border-green-50">
            {[
              { id: 'members', label: 'Members', count: members.length },
              { id: 'feed', label: 'Room Feed', count: roomPosts.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={'flex-1 py-3 text-sm font-bold transition-all cursor-pointer ' + (activeTab === tab.id ? 'text-green-700 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-600')}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="p-5">
              <h2 className="font-bold text-gray-900 mb-4">Travel Buddies ({members.length})</h2>
              {members.length === 0 ? (
                <p className="text-gray-400 text-sm">No members yet!</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member: any) => {
                    const votesAgainstMember = kickVotes.filter(v => v.target_id === member.user_id).length
                    const iHaveVoted = kickVotes.some(v => v.voter_id === user?.id && v.target_id === member.user_id)
                    const isMe = member.user_id === user?.id

                    return (
                      <div key={member.id} className="flex items-center gap-3 hover:bg-green-50 rounded-xl p-2 transition-all">
                        <div onClick={() => { window.location.href = '/profile/' + member.username }} className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold flex-shrink-0 cursor-pointer">
                          {member.username[0].toUpperCase()}
                        </div>
                        <div onClick={() => { window.location.href = '/profile/' + member.username }} className="flex-1 cursor-pointer">
                          <div className="font-semibold text-gray-900 text-sm">{member.username}</div>
                          {(member.age_group || member.gender) && (
                            <div className="text-xs text-gray-400 mt-0.5">{[member.age_group, member.gender].filter(Boolean).join(' · ')}</div>
                          )}
                          {votesAgainstMember > 0 && !isMe && (
                            <div className="text-xs text-red-400 mt-0.5 font-medium">{votesAgainstMember}/{totalCount} kick votes</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {member.is_ready ? (
                            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">Ready</span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-1 rounded-full">Thinking...</span>
                          )}
                          {isMe && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">You</span>}
                          {!isMe && (
                            <button
                              onClick={() => voteToKick(member.user_id, member.username)}
                              disabled={iHaveVoted || kickingId === member.user_id}
                              className={'text-xs font-bold px-2 py-1 rounded-full transition-all cursor-pointer ' + (iHaveVoted ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200')}
                            >
                              {kickingId === member.user_id ? '...' : iHaveVoted ? 'Voted' : 'Kick'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ROOM FEED TAB */}
          {activeTab === 'feed' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Room Feed</h2>
                <button onClick={() => setShowFeedModal(true)} className="text-xs font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-3 py-1.5 rounded-xl hover:shadow-lg transition-all cursor-pointer">
                  + Share Memory
                </button>
              </div>
              {roomPosts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">📸</div>
                  <div className="font-bold text-gray-600 mb-1">No posts yet!</div>
                  <div className="text-xs text-gray-400 mb-4">Be the first to share a memory with your travel buddies.</div>
                  <button onClick={() => setShowFeedModal(true)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all cursor-pointer">
                    Share a Memory
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {roomPosts.map(post => (
                    <div key={post.id} className="border border-green-100 rounded-2xl overflow-hidden">
                      <div className="flex items-center gap-3 p-3">
                        <a href={'/profile/' + post.author_name} className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm hover:scale-105 transition-all">
                          {post.author_name?.[0]?.toUpperCase() || '?'}
                        </a>
                        <div className="flex-1">
                          <a href={'/profile/' + post.author_name} className="font-bold text-gray-900 text-sm hover:text-green-700 transition-colors">{post.author_name}</a>
                          <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                        </div>
                        <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">Verified Trip</span>
                      </div>
                      {post.img_url && (
                        <div className="aspect-square overflow-hidden">
                          <img src={post.img_url} alt={post.caption} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {post.caption && (
                        <div className="px-3 py-2">
                          <span className="font-bold text-sm text-gray-900">{post.author_name} </span>
                          <span className="text-sm text-gray-700">{post.caption}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CHAT + VIDEO */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div onClick={() => { window.location.href = '/chat' }} className="py-4 rounded-2xl bg-white border border-green-200 text-green-700 font-bold text-sm text-center hover:bg-green-50 transition-all cursor-pointer">
            Group Chat
          </div>
          {room?.is_sealed ? (
            <div
              onClick={!paymentLoading ? handleVideoCall : undefined}
              className={'py-4 rounded-2xl font-bold text-sm text-center transition-all cursor-pointer ' + (paymentLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:shadow-lg')}
            >
              {paymentLoading ? 'Opening...' : hasPaidVideo ? 'Join Video Call' : 'Video Call — ₹35'}
            </div>
          ) : (
            <div className="py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-sm text-center cursor-not-allowed">
              Video Call (Seal first)
            </div>
          )}
        </div>

        {/* TOKEN INFO */}
        {room?.is_sealed && (
          <div className="bg-green-50 rounded-2xl border border-green-100 p-4 mb-4">
            <div className="text-xs text-green-700 font-semibold mb-2">
              {hasPaidVideo ? 'You have unlocked the video call!' : 'About the ₹35 video call token'}
            </div>
            {hasPaidVideo ? (
              <div className="text-xs text-gray-500">Click the Video Call button above to join your travel buddies!</div>
            ) : (
              <>
                <div className="text-xs text-gray-500 leading-relaxed mb-3">
                  Pay ₹35 to unlock a video call with your travel buddies before committing to the full trip.
                </div>
                <div className="border-t border-green-100 pt-3">
                  <div className="text-xs text-green-700 font-semibold mb-2">Refund Policy</div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { icon: 'X', color: 'text-red-400', text: '₹35 token — non refundable' },
                      { icon: 'V', color: 'text-green-500', text: 'Full trip — 90% back if cancelled 30+ days before' },
                      { icon: '~', color: 'text-yellow-500', text: 'Full trip — 50% back if cancelled 15-30 days before' },
                      { icon: 'X', color: 'text-red-400', text: 'No refund if cancelled less than 15 days before trip' },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={'font-bold ' + item.color}>{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ITINERARY */}
        <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">{room?.is_sealed ? 'Full Itinerary' : 'Itinerary Preview'}</h2>
          {room?.itineraries ? (
            <div className="space-y-2">
              {room.itineraries.day_plan?.split('\n').map((day: string, i: number) => {
                if (!room?.is_sealed && i >= 2) {
                  return i === 2 ? <div key={i} className="text-xs text-gray-400 italic mt-2">Seal the room to unlock full itinerary...</div> : null
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

        {/* WHAT IS INCLUDED */}
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
          <div className="text-xs text-red-500 mb-3">Leaving the room is permanent. Please be sure before leaving.</div>
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to leave this room?')) {
                await supabase.from('room_members').delete().eq('room_id', id).eq('user_id', user.id)
                window.location.href = '/rooms'
              }
            }}
            className="text-xs font-bold text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
          >
            Leave Room
          </button>
        </div>

      </div>
    </main>
  )
}