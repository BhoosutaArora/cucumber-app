'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function CreateRoom() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    gender_preference: 'any',
    is_private: false,
  })

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) window.location.href = '/login'
      else setUser(user)
    }
    getUser()
  }, [])

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit() {
    if (!form.name) {
      alert('Please enter a room name!')
      return
    }
    setLoading(true)

    const roomCode = form.is_private
      ? Math.random().toString(36).substring(2, 8).toUpperCase()
      : null

    const { error } = await supabase.from('Rooms').insert({
      name: form.name,
      gender_preference: form.gender_preference,
      is_private: form.is_private,
      room_code: roomCode,
      created_by: user.id,
      status: 'Pending Approval',
    })

    if (error) {
      alert('Something went wrong! Try again.')
      console.error(error)
      setLoading(false)
    } else {
      window.location.href = '/rooms/success'
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F0FAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ fontSize: '24px', fontWeight: '900', color: '#2E7D32', display: 'block', marginBottom: '24px', textDecoration: 'none' }}>
            cucumber<span style={{ color: '#4CAF50' }}>.</span>
          </a>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏠</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Create a Room</h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Your room will be reviewed by Cucumber before going live!</p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #E8F5E9', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Room Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '6px' }}>Room Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Girls Trip to Shimla 🏔️"
              style={{
                width: '100%',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#111827',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Gender Preference */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '6px' }}>Who can join?</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { value: 'any', label: '🌍 Everyone' },
                { value: 'women', label: '👩 Women Only' },
                { value: 'men', label: '👨 Men Only' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, gender_preference: option.value }))}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    border: form.gender_preference === option.value ? '1px solid #4CAF50' : '1px solid #E5E7EB',
                    background: form.gender_preference === option.value ? '#4CAF50' : '#ffffff',
                    color: form.gender_preference === option.value ? '#ffffff' : '#4B5563',
                    cursor: 'pointer',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Private Room */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FAF0', borderRadius: '12px', padding: '12px 16px', border: '1px solid #E8F5E9' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>Private Room 🔒</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Like Among Us — only with the code!</div>
            </div>
            <input
              type="checkbox"
              name="is_private"
              checked={form.is_private}
              onChange={handleChange}
              style={{ width: '20px', height: '20px', accentColor: '#4CAF50' }}
            />
          </div>

          {form.is_private && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px 16px', fontSize: '12px', color: '#92400E', fontWeight: '500' }}>
              🔑 A unique room code will be generated automatically when your room is approved!
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7ED957, #4CAF50)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '16px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating...' : 'Create Room 🥒'}
          </button>

          <a href="/rooms" style={{ display: 'block', textAlign: 'center', fontSize: '12px', color: '#9CA3AF', textDecoration: 'none' }}>
            ← Back to Rooms
          </a>

        </div>
      </div>
    </main>
  )
}
