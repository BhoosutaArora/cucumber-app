'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function VideoCall() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      setUsername(profile?.username || user.email?.split('@')[0] || 'Traveler')

      // Mark video call as paid if coming from payment
      const searchParams = new URLSearchParams(window.location.search)
      const paid = searchParams.get('paid')
      const roomId = searchParams.get('room')

      if (paid === 'true' && roomId) {
        await supabase
          .from('room_members')
          .update({ has_paid_video: true })
          .eq('room_id', roomId)
          .eq('user_id', user.id)

        // Clean URL
        window.history.replaceState({}, '', '/video-call')
      }

      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Setting up your video call...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 font-sans">

      <Navbar />

      <div className="pt-14 md:pt-16 h-screen flex flex-col">

        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white font-bold text-sm">Cucumber Video Call</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400">Logged in as</div>
            <div className="text-xs font-bold text-green-400">{username}</div>
          </div>
        </div>

        <div className="flex-1 relative">
          <iframe
            src={'https://meet.jit.si/cucumber-travel-room?userInfo.displayName=' + encodeURIComponent(username)}
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            allowFullScreen
          />
        </div>

        <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-gray-500">Powered by Jitsi Meet · End-to-end encrypted</div>
          <a href="/rooms" className="text-xs font-bold text-red-400 border border-red-800 px-3 py-1.5 rounded-lg hover:bg-red-900/30 transition-all">
            Leave Call
          </a>
        </div>

      </div>
    </main>
  )
}