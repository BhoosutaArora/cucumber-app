
'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { username } = React.use(params)
  const profileEmail = `${username}@gmail.com`

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_email', profileEmail)
        .order('created_at', { ascending: false })

      setReviews(data || [])
      setLoading(false)
    }
    init()
  }, [username])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const getRankBadge = (trips: number) => {
    if (trips >= 20) return { label: 'Legend 🏆', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    if (trips >= 10) return { label: 'Voyager 🌍', color: 'text-purple-600 bg-purple-50 border-purple-200' }
    if (trips >= 5) return { label: 'Explorer 🧭', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    return { label: 'New Traveler 🌱', color: 'text-green-600 bg-green-50 border-green-200' }
  }

  const rank = getRankBadge(reviews.length)

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

      {/* ── NAVBAR ── */}
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

      <div className="pt-20 md:pt-24 px-4 md:px-8 pb-16 max-w-2xl mx-auto">

        {/* ── PROFILE COVER ── */}
        <div className="bg-gradient-to-br from-green-600 to-green-400 rounded-3xl h-28 md:h-36 relative mb-14 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-white shadow-lg">
              {username[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── PROFILE INFO ── */}
        <div className="bg-white rounded-2xl border border-green-100 p-5 mb-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">{username}</h1>
              <div className="text-sm text-green-600 font-medium mt-0.5">@{username}</div>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${rank.color}`}>
              {rank.label}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { num: reviews.length.toString(), label: 'Reviews' },
              { num: avgRating ? `${avgRating}⭐` : '—', label: 'Rating' },
              { num: '🇮🇳', label: 'India' },
            ].map((stat) => (
              <div key={stat.label} className="bg-green-50 rounded-xl py-3 border border-green-100 text-center">
                <div className="font-bold text-green-700 text-lg">{stat.num}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {currentUser && currentUser.email !== profileEmail && (
            <div className="flex gap-2">
              <a href="/rooms" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold text-center hover:scale-105 transition-all">
                Invite to Room
              </a>
              <a href="/reviews" className="flex-1 py-2.5 rounded-xl border border-green-200 text-green-700 text-sm font-bold text-center hover:bg-green-50 transition-all">
                Write Review
              </a>
            </div>
          )}
        </div>

        {/* ── RATING BREAKDOWN ── */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-green-100 p-5 mb-5">
            <div className="font-bold text-gray-900 mb-4">Rating Breakdown</div>
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-green-700">{avgRating}</div>
                <div className="flex justify-center gap-0.5 mt-1">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} className={`text-lg ${Number(avgRating) >= star ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-1">{reviews.length} reviews</div>
              </div>
              <div className="flex-1">
                {[5,4,3,2,1].map((star) => {
                  const count = reviews.filter(r => r.rating === star).length
                  const pct = reviews.length > 0 ? Math.round(count / reviews.length * 100) : 0
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-gray-500 w-3">{star}</span>
                      <span className="text-yellow-400 text-xs">★</span>
                      <div className="flex-1 h-2 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all" style={{width:`${pct}%`}} />
                      </div>
                      <span className="text-xs text-gray-400 w-6">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-green-50">
            <div className="font-bold text-gray-900">Reviews from travelers ({reviews.length})</div>
          </div>
          <div className="divide-y divide-green-50">
            {reviews.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">⭐</div>
                <div className="font-bold text-gray-600 mb-1">No reviews yet</div>
                <div className="text-xs text-gray-400">Reviews will appear here after trips</div>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-4 md:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                        {review.reviewer_email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{review.reviewer_email?.split('@')[0]}</div>
                        <div className="text-xs text-green-600">🏔️ {review.trip_name}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((star) => (
                        <span key={star} className={`text-sm ${review.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  )
}