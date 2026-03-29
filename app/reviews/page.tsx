'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Reviews() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [newReview, setNewReview] = useState({
    reviewee_email: '',
    rating: 5,
    comment: '',
    trip_name: '',
  })
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('received')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      await fetchReviews(user.email || '')
      setLoading(false)
    }
    init()
  }, [])

  async function fetchReviews(email: string) {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    setReviews(data || [])
  }

  async function submitReview() {
    if (!newReview.reviewee_email || !newReview.comment || !newReview.trip_name) {
      setError('Please fill in all fields')
      return
    }
    if (newReview.reviewee_email === user?.email) {
      setError('You cannot review yourself!')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: err } = await supabase.from('reviews').insert([{
      reviewer_email: user.email,
      reviewee_email: newReview.reviewee_email,
      rating: newReview.rating,
      comment: newReview.comment,
      trip_name: newReview.trip_name,
    }])

    if (err) {
      setError('Failed to submit review: ' + err.message)
    } else {
      setSubmitted(true)
      setShowForm(false)
      await fetchReviews(user.email)
      setNewReview({ reviewee_email: '', rating: 5, comment: '', trip_name: '' })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Loading reviews...</div>
        </div>
      </div>
    )
  }

  const receivedReviews = reviews.filter(r => r.reviewee_email === user?.email)
  const givenReviews = reviews.filter(r => r.reviewer_email === user?.email)
  const avgRating = receivedReviews.length > 0
    ? (receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length).toFixed(1)
    : null

  return (
    <main className="min-h-screen bg-green-50 font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-14 md:h-16 bg-white border-b border-green-100 shadow-sm">
        <a href="/" className="text-xl md:text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </a>
        <div className="flex items-center gap-2 md:gap-3">
          <a href="/dashboard" className="text-xs md:text-sm font-medium text-gray-500 hover:text-green-700 transition-colors">Dashboard</a>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-3 md:px-5 py-1.5 md:py-2 rounded-xl hover:shadow-lg transition-all"
          >
            + Write Review
          </button>
        </div>
      </nav>

      <div className="pt-20 md:pt-24 px-4 md:px-8 pb-16 max-w-2xl mx-auto">

        {/* ── HEADER ── */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Reviews & Ratings ⭐</h1>
          <p className="text-sm text-gray-500">Build trust in the Cucumber community</p>
        </div>

        {/* ── RATING SUMMARY ── */}
        {receivedReviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-green-100 p-5 mb-5 text-center">
            <div className="text-5xl font-extrabold text-green-700 mb-1">{avgRating}</div>
            <div className="flex justify-center gap-1 mb-2">
              {[1,2,3,4,5].map((star) => (
                <span key={star} className={`text-xl ${Number(avgRating) >= star ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
            <div className="text-sm text-gray-500">{receivedReviews.length} review{receivedReviews.length !== 1 ? 's' : ''} from fellow travelers</div>
          </div>
        )}

        {/* ── SUCCESS MESSAGE ── */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-5 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-bold text-green-800 text-sm">Review submitted!</div>
              <div className="text-xs text-green-600">Your review will help build trust in the community.</div>
            </div>
          </div>
        )}

        {/* ── TABS ── */}
        <div className="flex gap-2 mb-5 bg-white border border-green-100 rounded-2xl p-1.5">
          {[
            { id: 'received', label: `Received (${receivedReviews.length})` },
            { id: 'given', label: `Given (${givenReviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-green-500 text-white' : 'text-gray-500 hover:text-green-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── REVIEWS LIST ── */}
        <div className="flex flex-col gap-3">
          {(activeTab === 'received' ? receivedReviews : givenReviews).length === 0 ? (
            <div className="bg-white rounded-2xl border border-green-100 p-8 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <div className="font-bold text-gray-700 mb-1">No reviews yet</div>
              <div className="text-xs text-gray-400 mb-4">
                {activeTab === 'received'
                  ? 'Reviews from your travel buddies will appear here after trips'
                  : 'Reviews you write for other travelers will appear here'}
              </div>
              {activeTab === 'given' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold hover:scale-105 transition-all"
                >
                  Write Your First Review
                </button>
              )}
            </div>
          ) : (
            (activeTab === 'received' ? receivedReviews : givenReviews).map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-green-100 p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(activeTab === 'received' ? review.reviewer_email : review.reviewee_email)?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">
                        {activeTab === 'received' ? review.reviewer_email?.split('@')[0] : review.reviewee_email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-green-600 font-semibold mt-0.5">🏔️ {review.trip_name}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
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

      {/* ── WRITE REVIEW MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-green-50">
              <div className="font-bold text-gray-900 text-lg">Write a Review ⭐</div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">

              {/* Trip Name */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Trip Name</label>
                <input
                  type="text"
                  value={newReview.trip_name}
                  onChange={(e) => setNewReview({...newReview, trip_name: e.target.value})}
                  placeholder="e.g. Spiti Valley Adventure"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>

              {/* Traveler Email */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Traveler's Email</label>
                <input
                  type="email"
                  value={newReview.reviewee_email}
                  onChange={(e) => setNewReview({...newReview, reviewee_email: e.target.value})}
                  placeholder="their@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({...newReview, rating: star})}
                      className={`text-3xl transition-transform hover:scale-110 ${newReview.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2 self-center">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing!'][newReview.rating]}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Tell the community about traveling with this person. Were they fun? Respectful? Would you travel with them again?"
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                onClick={submitReview}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review ⭐'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}