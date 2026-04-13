'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

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
      setLoading(false)
    }
    init()
  }, [])

  const links = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/explore', label: 'Explore', icon: '🔍' },
    { href: '/rooms', label: 'Trips', icon: '✈️' },
    { href: '/chat', label: 'Chat', icon: '💬' },
  ]

  return (
    <>
      {/* TOP NAVBAR — desktop */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">

        {/* Logo */}
        <a href="/" className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight flex-shrink-0">
          cucumber<span className="text-green-400">.</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={'px-4 py-2 rounded-xl text-sm font-semibold transition-all ' + (pathname === link.href ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-green-700 hover:bg-green-50')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {!loading && (
            username ? (
              <a
                href={'/profile/' + username}
                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 hover:bg-green-100 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                  {username[0].toUpperCase()}
                </div>
                <span className="text-xs md:text-sm font-semibold text-green-700 hidden md:block">{username}</span>
              </a>
            ) : (
              <a href="/login" className="text-xs md:text-sm font-semibold text-green-700 border border-green-200 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:bg-green-50 transition-all">
                Sign in
              </a>
            )
          )}
         {username ? (
  <button
    onClick={async () => {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }}
    className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-red-400 to-red-500 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:shadow-lg transition-all flex-shrink-0 cursor-pointer"
  >
    Sign Out
  </button>
) : (
  <a href="/rooms" className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:shadow-lg transition-all flex-shrink-0">
    Find Trip
  </a>
)}
        </div>
      </nav>

      {/* BOTTOM NAV — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-green-100 flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {links.map(link => (
          <a
            key={link.href}
            href={link.href}
            className={'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ' + (pathname === link.href ? 'text-green-700' : 'text-gray-400')}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-xs font-semibold">{link.label}</span>
          </a>
        ))}
        {username ? (
          <a
            href={'/profile/' + username}
            className={'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ' + (pathname?.startsWith('/profile') ? 'text-green-700' : 'text-gray-400')}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
              {username[0].toUpperCase()}
            </div>
            <span className="text-xs font-semibold">Profile</span>
          </a>
        ) : (
          <a
            href="/login"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-gray-400"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs font-semibold">Sign in</span>
          </a>
        )}
      </div>
    </>
  )
}