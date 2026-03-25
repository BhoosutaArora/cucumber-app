'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Qahiri } from 'next/font/google'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  async function handleAuth() {
    if (!email || !password) {
      setMessage('Please enter your email and password')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        setMessage(error.message)
        setMessageType('error')
      } else {
        setMessage('Account created! Check your email to confirm your account 🎉')
        setMessageType('success')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setMessage(error.message)
        setMessageType('error')
      } else {
        setMessage('Welcome back! Redirecting... 🥒')
        setMessageType('success')
        setTimeout(() => {
          window.location.href = '/dashboard' 
        }, 1500)
      }
    }

    setLoading(false)
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    if (error) {
      setMessage(error.message)
      setMessageType('error')
    }
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-4">

      {/* background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-green-200 opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-72 h-72 rounded-full bg-green-300 opacity-15 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="bg-white rounded-3xl shadow-xl shadow-green-100 w-full max-w-md overflow-hidden">

        {/* top green header */}
        <div className="bg-gradient-to-br from-green-700 to-green-500 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
          <a href="/" className="text-4xl font-extrabold text-green-300 tracking-tight relative z-10">
            cucumber<span className="text-white opacity-50">.</span>
          </a>
          <p className="text-green-200 text-sm mt-2 relative z-10">
            {isSignUp ? 'Join 12,000+ travelers' : 'Welcome back traveler'}
          </p>
        </div>

        <div className="px-8 py-8">

          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
            {isSignUp ? 'Create your account' : 'Sign in to Cucumber'}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {isSignUp ? 'Start your travel journey today' : 'Your tribe is waiting for you'}
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* email input */}
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>

          {/* password input */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>

          {/* message */}
          {message && (
            <div className={`text-sm font-medium px-4 py-3 rounded-xl mb-4 ${
              messageType === 'error'
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-green-50 text-green-700 border border-green-100'
            }`}>
              {message}
            </div>
          )}

          {/* submit button */}
          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account 🥒' : 'Sign In →'}
          </button>

          {/* toggle sign up / sign in */}
          <p className="text-center text-sm text-gray-400 mt-5">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
              className="text-green-600 font-bold hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up free'}
            </button>
          </p>

          {/* back to home */}
          <p className="text-center mt-3">
            <a href="/" className="text-xs text-gray-300 hover:text-gray-400 transition-colors">
              ← Back to home
            </a>
          </p>

        </div>
      </div>
    </main>
  )
}
