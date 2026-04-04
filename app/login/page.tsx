'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // T&C popup states
  const [showTerms, setShowTerms] = useState(false)
  const [termsChecked, setTermsChecked] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const termsBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If already logged in, go straight to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = '/dashboard'
    })

    // Watch for auth changes on ANY device
    // When user confirms email on phone, laptop will auto redirect to dashboard
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/dashboard'
      }
    })

    // Show confirmed message if redirected from confirm page
    const params = new URLSearchParams(window.location.search)
    if (params.get('confirmed') === 'true') {
      setMessage('Your email is confirmed! Now sign in below 🥒')
      setMessageType('success')
    }

    return () => subscription.unsubscribe()
  }, [])

  function handleScroll() {
    const el = termsBoxRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20
    if (atBottom) setHasScrolled(true)
  }

  function handleSignUpClick() {
    if (!email || !password) {
      setMessage('Please enter your email and password')
      setMessageType('error')
      return
    }
    if (!username) { setMessage('Please choose a username 🥒'); setMessageType('error'); return }
    if (!age) { setMessage('Please enter your age 🥒'); setMessageType('error'); return }
    if (!gender) { setMessage('Please select your gender 🥒'); setMessageType('error'); return }
    if (parseInt(age) < 18) { setMessage('You must be 18+ to join Cucumber 🥒'); setMessageType('error'); return }

    setShowTerms(true)
    setTermsChecked(false)
    setHasScrolled(false)
  }

  async function handleAuth() {
    setShowTerms(false)
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(
        error.message.includes('already registered') || error.message.includes('already exists')
          ? 'This email is already registered! Try signing in instead 🥒'
          : error.message
      )
      setMessageType('error')
    } else {
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: username.toLowerCase().trim(),
          email: email,
          age: parseInt(age),
          gender: gender,
        })
      }
      setMessage('We sent a confirmation email to ' + email + ' — open it on any device and click the link. This page will automatically take you to dashboard! 🥒')
      setMessageType('success')
    }
    setLoading(false)
  }

  async function handleSignIn() {
    if (!email || !password) {
      setMessage('Please enter your email and password')
      setMessageType('error')
      return
    }
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(
        error.message === 'Email not confirmed'
          ? 'Please confirm your email first! Check your inbox and spam folder 🥒'
          : error.message
      )
      setMessageType('error')
    } else {
      setMessage('Welcome back! 🥒')
      setMessageType('success')
      setTimeout(() => { window.location.href = '/dashboard' }, 1500)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    })
    if (error) { setMessage(error.message); setMessageType('error') }
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-8">
      <div className="fixed top-0 right-0 w-64 h-64 rounded-full bg-green-200 opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-48 h-48 rounded-full bg-green-300 opacity-15 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* ───────── TERMS & CONDITIONS POPUP ───────── */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

            <div className="bg-gradient-to-br from-green-700 to-green-500 px-6 py-5 text-center">
              <p className="text-2xl mb-1">📋</p>
              <h2 className="text-white font-extrabold text-lg">Terms & Conditions</h2>
              <p className="text-green-200 text-xs mt-1">Please read carefully before joining Cucumber</p>
            </div>

            <div
              ref={termsBoxRef}
              onScroll={handleScroll}
              className="px-6 py-4 overflow-y-auto max-h-72 text-sm text-gray-700 space-y-4 border-b border-gray-100"
            >
              <div>
                <p className="font-bold text-gray-900 mb-1">🪪 1. Bring Your Aadhaar Card</p>
                <p>You must carry a valid government-issued photo ID (Aadhaar card or equivalent) to the trip meetup point. Without valid ID, you may be denied entry to the trip. This is non-negotiable for the safety of all travelers.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">✅ 2. Provide Accurate Details</p>
                <p>You agree that all information you provide — including your name, age, gender, and contact details — is true and accurate. Providing false information is a violation of these terms and may result in immediate removal from the platform and the trip without refund.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">🧍 3. You Are Responsible for Your Conduct</p>
                <p>You are solely responsible for your behavior during the trip. Cucumber is a platform that connects travelers — we are not liable for any personal disputes, accidents, losses, or incidents that occur during the trip. Travel safely and respectfully.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">🔞 4. Age Requirement</p>
                <p>You confirm that you are at least 18 years of age. Minors are strictly not permitted on Cucumber trips.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">💸 5. Payments & Refunds</p>
                <p>The ₹199 token payment is refundable within 24 hours of payment. The full trip payment of ₹6,999 is subject to the refund policy communicated at time of booking. Cucumber reserves the right to cancel a trip if minimum seats are not filled.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">🚫 6. Zero Tolerance Policy</p>
                <p>Any form of harassment, discrimination, or misconduct toward fellow travelers or Cucumber staff will result in immediate removal from the trip and a permanent ban from the platform. No refund will be issued in such cases.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">📸 7. Photos & Privacy</p>
                <p>By joining a trip, you consent to being photographed in group settings for Cucumber's social media and promotional use. If you do not consent, please inform the Trip Captain at the meetup point.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">📞 8. Emergency Contact</p>
                <p>Cucumber may contact you via email or WhatsApp for trip updates, payment reminders, and emergency communication. By signing up you consent to receiving these messages.</p>
              </div>
              <div className="pb-2">
                <p className="font-bold text-gray-900 mb-1">⚖️ 9. Governing Law</p>
                <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Shimla, Himachal Pradesh.</p>
              </div>
            </div>

            {!hasScrolled && (
              <p className="text-center text-xs text-gray-400 pt-3 px-6 animate-bounce">
                ↓ Scroll down to read all terms
              </p>
            )}

            <div className="px-6 pt-3 pb-4">
              <label className={`flex items-start gap-3 cursor-pointer select-none ${!hasScrolled ? 'opacity-40 pointer-events-none' : ''}`}>
                <input
                  type="checkbox"
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-green-500 cursor-pointer flex-shrink-0"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I have read and agree to Cucumber's Terms & Conditions. I confirm I will carry valid ID, have provided accurate details, and understand I am responsible for my own conduct during the trip.
                </span>
              </label>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowTerms(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAuth}
                disabled={!termsChecked}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-green-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                I Agree & Join 🥒
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ───────── END POPUP ───────── */}

      <div className="bg-white rounded-3xl shadow-xl shadow-green-100 w-full max-w-md overflow-hidden">

        <div className="bg-gradient-to-br from-green-700 to-green-500 px-6 md:px-8 py-8 md:py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
          <a href="/" className="text-3xl md:text-4xl font-extrabold text-green-300 tracking-tight relative z-10 block">
            cucumber<span className="text-white opacity-50">.</span>
          </a>
          <p className="text-green-200 text-sm mt-2 relative z-10">
            {isSignUp ? 'Join 12,000+ travelers' : 'Welcome back traveler'}
          </p>
        </div>

        <div className="px-6 md:px-8 py-6 md:py-8">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">
            {isSignUp ? 'Create your account' : 'Sign in to Cucumber'}
          </h2>
          <p className="text-sm text-gray-400 mb-5 md:mb-6">
            {isSignUp ? 'Start your travel journey today' : 'Your tribe is waiting for you'}
          </p>

          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 md:py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all mb-4 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {isSignUp && (
            <>
              <div className="mb-3">
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. hills_over_malls"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Age (18+)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 24"
                  min="18"
                  max="60"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={'py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ' + (gender === g ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300')}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              onKeyDown={(e) => { if (e.key === 'Enter') { isSignUp ? handleSignUpClick() : handleSignIn() } }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>

          {message && (
            <div className={'text-sm font-medium px-4 py-3 rounded-xl mb-4 ' + (messageType === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100')}>
              {message}
            </div>
          )}

          <button
            onClick={isSignUp ? handleSignUpClick : handleSignIn}
            disabled={loading}
            className="w-full py-3 md:py-3.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account 🥒' : 'Sign In →'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-5">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setMessage('') }} className="text-green-600 font-bold hover:underline cursor-pointer">
              {isSignUp ? 'Sign in' : 'Sign up free'}
            </button>
          </p>

          <p className="text-center mt-3">
            <a href="/" className="text-xs text-gray-300 hover:text-gray-400 transition-colors">← Back to home</a>
          </p>
        </div>
      </div>
    </main>
  )
}