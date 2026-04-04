'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function VideoCall() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [callStarted, setCallStarted] = useState(false)
  const [roomName, setRoomName] = useState('Peaceful Escape')
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const jitsiApiRef = useRef<any>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      setLoading(false)
    }
    init()

    // Load Jitsi script
    const script = document.createElement('script')
    script.src = 'https://meet.jit.si/external_api.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose()
      }
      document.head.removeChild(script)
    }
  }, [])

  function startJitsiCall() {
    if (!jitsiContainerRef.current) return

    const meetingName = 'Cucumber-' + roomName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
    const displayName = profile?.username || user?.email?.split('@')[0] || 'Traveler'

    const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
      roomName: meetingName,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      userInfo: {
        displayName: displayName,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        disableInviteFunctions: true,
        enableWelcomePage: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop',
          'fullscreen', 'fodeviceselection', 'hangup',
          'chat', 'raisehand', 'tileview', 'select-background',
        ],
        DEFAULT_BACKGROUND: '#0a0a0a',
        MOBILE_APP_PROMO: false,
      },
    })

    jitsiApiRef.current = api

    api.addEventListener('videoConferenceLeft', () => {
      setCallStarted(false)
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose()
        jitsiApiRef.current = null
      }
    })

    setCallStarted(true)
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
          <a href="/" className="text-lg font-extrabold text-green-400">
            cucumber<span className="text-white opacity-40">.</span>
          </a>
          {callStarted && (
            <>
              <span className="text-gray-600">·</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400 font-bold">Live Call</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden md:block">{roomName}</span>
          <a href="/dashboard" className="text-xs font-semibold text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all">
            Dashboard
          </a>
        </div>
      </nav>

      {!callStarted ? (
        /* ── WAITING ROOM ── */
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">

            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎥</div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                Pre-Trip Video Call
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                Meet your travel buddies before the adventure begins!<br />
                Your camera and mic will turn on when you join.
              </p>
            </div>

            {/* Room info */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Room</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-xl">
                  🏔️
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{roomName}</div>
                  <div className="text-xs text-green-400">📍 Shimla, HP · Aug 2–5, 2026</div>
                </div>
              </div>
            </div>

            {/* Your info */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">You will join as</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                  {(profile?.username || user?.email)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{profile?.username || user?.email?.split('@')[0]}</div>
                  <div className="text-xs text-gray-500">Your display name in the call</div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-6">
              <div className="text-xs font-bold text-gray-400 mb-3">Before you join</div>
              <div className="flex flex-col gap-2">
                {[
                  { icon: '🔇', tip: 'Find a quiet place' },
                  { icon: '💡', tip: 'Good lighting helps!' },
                  { icon: '😊', tip: 'These are your future travel buddies — have fun!' },
                ].map((t) => (
                  <div key={t.tip} className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{t.icon}</span>
                    <span>{t.tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Join button */}
            <button
              onClick={startJitsiCall}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-extrabold text-base hover:scale-105 transition-all shadow-xl shadow-green-900 cursor-pointer"
            >
              Join Video Call 🎥
            </button>

            <a href="/chat" className="block text-center text-xs text-gray-500 mt-4 hover:text-gray-400 transition-colors">
              Switch to text chat instead →
            </a>

          </div>
        </div>
      ) : (
        /* ── JITSI CALL ── */
        <div className="flex-1 flex flex-col">
          <div
            ref={jitsiContainerRef}
            className="flex-1"
            style={{ minHeight: 'calc(100vh - 56px)' }}
          />
        </div>
      )}

    </main>
  )
}