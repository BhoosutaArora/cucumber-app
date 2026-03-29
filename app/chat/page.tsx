'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Chat() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [roomId, setRoomId] = useState('spiti-valley-aug-14')
  const [roomName, setRoomName] = useState('Adventure Squad 🏔️')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const rooms = [
    { id: 'spiti-valley-aug-14', name: 'Adventure Squad 🏔️', dest: 'Spiti Valley' },
    { id: 'shimla-aug-2', name: 'Peaceful Escape 🌿', dest: 'Shimla' },
    { id: 'jaipur-sep-5', name: 'Explorer Crew 🏛️', dest: 'Jaipur' },
  ]

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!user) return
    fetchMessages()

    // Real-time subscription
  const channel = supabase
  .channel(`room-${roomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `room_id=eq.${roomId}`,
  }, (payload) => {
    setMessages((prev) => [...prev, payload.new])
    setTimeout(scrollToBottom, 100)
  })
  .subscribe((status) => {
    console.log('Realtime status:', status)
  })

    return () => { supabase.removeChannel(channel) }
  }, [user, roomId])

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100)
    setMessages(data || [])
    setTimeout(scrollToBottom, 100)
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending) return
    setSending(true)

    const { error } = await supabase.from('messages').insert([{
      room_id: roomId,
      sender_email: user.email,
      sender_name: user.email?.split('@')[0],
      content: newMessage.trim(),
    }])

    if (!error) setNewMessage('')
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function switchRoom(room: any) {
    setRoomId(room.id)
    setRoomName(room.name)
    setMessages([])
  }

  function getAvatar(email: string) {
    return email?.[0]?.toUpperCase() || '?'
  }

  function getColor(email: string) {
    const colors = ['#7B1FA2', '#1565C0', '#B71C1C', '#E65100', '#00695C', '#AD1457', '#0277BD']
    const index = email?.charCodeAt(0) % colors.length || 0
    return colors[index]
  }

  function formatTime(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥒</div>
          <div className="text-green-400 font-bold">Loading chat...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="h-screen bg-gray-950 font-sans flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-4 md:px-6 h-14 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="text-lg font-extrabold text-green-400">cucumber<span className="text-white opacity-40">.</span></a>
          <span className="text-gray-600 hidden md:block">·</span>
          <span className="text-sm font-bold text-white hidden md:block">{roomName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-green-400 font-semibold">Live</span>
          <a href="/dashboard" className="text-xs font-semibold text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-800 ml-2">
            Dashboard
          </a>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* ── ROOMS SIDEBAR ── */}
        <div className="w-14 md:w-56 bg-gray-900 border-r border-gray-800 flex flex-col py-3 flex-shrink-0">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 hidden md:block">My Rooms</div>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => switchRoom(room)}
              className={`flex items-center gap-3 px-2 md:px-3 py-2.5 mx-1.5 rounded-xl transition-all mb-1 text-left ${roomId === room.id ? 'bg-green-900 text-green-400' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${roomId === room.id ? 'bg-green-600' : 'bg-gray-700'}`}>
                {room.name[0]}
              </div>
              <div className="hidden md:block overflow-hidden">
                <div className="text-xs font-semibold truncate">{room.name}</div>
                <div className="text-xs text-gray-500 truncate">{room.dest}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Room Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
            <div>
              <div className="font-bold text-white text-sm">{roomName}</div>
              <div className="text-xs text-gray-500">{messages.length} messages</div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/reviews" className="text-xs font-semibold text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all">
                ⭐ Reviews
              </a>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <div className="font-bold text-gray-400 mb-1">No messages yet</div>
                  <div className="text-xs text-gray-600">Be the first to say hello to your travel buddies!</div>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender_email === user?.email
                const prevMsg = messages[i - 1]
                const showAvatar = !prevMsg || prevMsg.sender_email !== msg.sender_email

                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}
                        style={{ background: getColor(msg.sender_email) }}>
                        {getAvatar(msg.sender_email)}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {showAvatar && !isMe && (
                        <div className="text-xs text-gray-500 mb-1 ml-1">{msg.sender_name}</div>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm'
                        : 'bg-gray-800 text-gray-200 rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 mx-1">{formatTime(msg.created_at)}</div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-4 py-3 bg-gray-900 border-t border-gray-800 flex-shrink-0">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-gray-800 rounded-2xl px-4 py-2.5 flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${roomName}...`}
                  rows={1}
                  className="flex-1 bg-transparent text-white text-sm outline-none resize-none placeholder-gray-500 max-h-32"
                  style={{ lineHeight: '1.5' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22 11 13M22 2L2 9l9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-600 mt-1.5 ml-1">Press Enter to send · Shift+Enter for new line</div>
          </div>

        </div>
      </div>
    </main>
  )
}