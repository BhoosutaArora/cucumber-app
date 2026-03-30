'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function VideoCall() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [roomId, setRoomId] = useState('spiti-valley-aug-14')
  const [roomName, setRoomName] = useState('Adventure Squad 🏔️')
  const [inCall, setInCall] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [participants, setParticipants] = useState<any[]>([])
  const [callDuration, setCallDuration] = useState(0)
  const [handRaised, setHandRaised] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<any>(null)

  const rooms = [
    { id: 'spiti-valley-aug-14', name: 'Adventure Squad 🏔️' },
    { id: 'shimla-aug-2', name: 'Peaceful Escape 🌿' },
    { id: 'jaipur-sep-5', name: 'Explorer Crew 🏛️' },
  ]

  // Simulated participants for UI demo
  const demoParticipants = [
    { name: 'Priya K.', initials: 'PK', color: '#7B1FA2', speaking: true, muted: false },
    { name: 'Sahil M.', initials: 'SM', color: '#1565C0', speaking: false, muted: true },
    { name: 'Anika R.', initials: 'AR', color: '#B71C1C', speaking: false, muted: false },
    { name: 'Rahul V.', initials: 'RV', color: '#E65100', speaking: false, muted: false },
  ]

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setLoading(false)
    }
    init()
    return () => {
      stopCall()
    }
  }, [])

  async function startCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setInCall(true)
      setParticipants(demoParticipants)

      // Start timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)

    } catch (err) {
      alert('Could not access camera/microphone. Please allow camera access and try again.')
    }
  }

  function stopCall() {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setInCall(false)
    setCallDuration(0)
    setParticipants([])
  }

  function toggleMic() {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setMicOn(audioTrack.enabled)
      }
    }
  }

  function toggleCam() {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setCamOn(videoTrack.enabled)
      }
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function getColor(email: string) {
    const colors = ['#7B1FA2', '#1565C0', '#B71C1C', '#E65100', '#00695C', '#AD1457']
    return colors[(email?.charCodeAt(0) || 0) % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥒</div>
          <div className="text-green-400 font-bold">Loading video call...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 font-sans flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-4 md:px-8 h-14 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="text-lg font-extrabold text-green-400">cucumber<span className="text-white opacity-40">.</span></a>
          {inCall && (
            <>
              <span className="text-gray-600">·</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-green-400 font-bold">{formatTime(callDuration)}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden md:block">{roomName}</span>
          <a href="/dashboard" className="text-xs font-semibold text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-800">
            Dashboard
          </a>
        </div>
      </nav>

      {!inCall ? (
        /* ── WAITING ROOM ── */
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📹</div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Pre-Trip Video Call</h1>
              <p className="text-sm text-gray-400">Meet your travel buddies before the adventure begins!</p>
            </div>

            {/* Room selector */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Your Room</div>
              <div className="flex flex-col gap-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => { setRoomId(room.id); setRoomName(room.name) }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${roomId === room.id ? 'bg-green-900 border border-green-700' : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'}`}
                  >
                    <div className={`w-3 h-3 rounded-full ${roomId === room.id ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <span className={`text-sm font-semibold ${roomId === room.id ? 'text-green-400' : 'text-gray-300'}`}>{room.name}</span>
                    {roomId === room.id && <span className="ml-auto text-xs text-green-500 font-bold">Selected ✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera preview */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-5">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-48 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2" style={{background: getColor(user?.email)}}>
                    {user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-400">{user?.email?.split('@')[0]}</div>
                  <div className="text-xs text-gray-600 mt-1">Camera preview will show after joining</div>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-400">Ready to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">4 others waiting</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-6">
              <div className="text-xs font-bold text-gray-400 mb-2">Before you join</div>
              <div className="flex flex-col gap-2">
                {[
                  '✅ Make sure you are in a quiet place',
                  '✅ Check your camera and microphone',
                  '✅ Have fun — these are your future travel buddies!',
                ].map((tip) => (
                  <div key={tip} className="text-xs text-gray-500">{tip}</div>
                ))}
              </div>
            </div>

            {/* Join button */}
            <button
              onClick={startCall}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-extrabold text-base hover:scale-105 transition-all shadow-xl shadow-green-900"
            >
              Join Video Call 📹
            </button>

            <a href="/chat" className="block text-center text-xs text-gray-500 mt-4 hover:text-gray-400">
              Switch to text chat instead →
            </a>
          </div>
        </div>
      ) : (
        /* ── IN CALL ── */
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Video Grid */}
          <div className="flex-1 p-3 md:p-4 grid grid-cols-2 md:grid-cols-3 gap-3">

            {/* Your video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden border-2 border-green-500">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!camOn ? 'hidden' : ''}`}
              />
              {!camOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{background: getColor(user?.email)}}>
                    {user?.email?.[0]?.toUpperCase()}
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="text-xs font-bold text-white bg-black/50 backdrop-blur px-2 py-1 rounded-lg">
                  You {handRaised ? '✋' : ''}
                </span>
                {!micOn && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg">🔇</span>}
              </div>
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </div>

            {/* Other participants */}
            {participants.map((p, i) => (
              <div key={i} className={`relative bg-gray-900 rounded-2xl overflow-hidden border ${p.speaking ? 'border-green-500' : 'border-gray-800'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-2 relative" style={{background: p.color}}>
                      {p.initials}
                      {p.speaking && (
                        <div className="absolute -inset-1 rounded-full border-2 border-green-500 animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{p.name}</div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-white bg-black/50 backdrop-blur px-2 py-1 rounded-lg">{p.name}</span>
                  {p.muted && <span className="text-xs bg-red-500/80 text-white px-1.5 py-0.5 rounded-lg">🔇</span>}
                </div>
              </div>
            ))}

          </div>

          {/* Controls */}
          <div className="bg-gray-900 border-t border-gray-800 px-4 py-4 flex-shrink-0">
            <div className="flex items-center justify-center gap-3 md:gap-4">

              {/* Mic */}
              <button onClick={toggleMic} className={`flex flex-col items-center gap-1`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    {micOn ? (
                      <>
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="white" strokeWidth="2"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </>
                    ) : (
                      <>
                        <path d="M1 1l22 22M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </>
                    )}
                  </svg>
                </div>
                <span className="text-xs text-gray-400">{micOn ? 'Mute' : 'Unmute'}</span>
              </button>

              {/* Camera */}
              <button onClick={toggleCam} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${camOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M23 7l-7 5 7 5V7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-400">{camOn ? 'Stop Video' : 'Start Video'}</span>
              </button>

              {/* Raise Hand */}
              <button onClick={() => setHandRaised(!handRaised)} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${handRaised ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                  <span className="text-xl">✋</span>
                </div>
                <span className="text-xs text-gray-400">{handRaised ? 'Lower' : 'Raise Hand'}</span>
              </button>

              {/* Chat */}
              <a href="/chat" className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Chat</span>
              </a>

              {/* Leave */}
              <button onClick={stopCall} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 17.25 8.76 16.57 8.06 15.86" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L2 22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-xs text-red-400">Leave</span>
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  )
}