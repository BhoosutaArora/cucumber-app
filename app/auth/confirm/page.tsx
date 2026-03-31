'use client'

import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ConfirmPage() {
  useEffect(() => {
    const { searchParams } = new URL(window.location.href)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (token_hash && type) {
      supabase.auth.verifyOtp({ token_hash, type: type as any })
        .then(({ error }) => {
          if (!error) {
            window.location.href = '/dashboard'
          } else {
            window.location.href = '/login?error=confirmation_failed'
          }
        })
    }
  }, [])

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#F0FAF0',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🥒</div>
      <p style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: '18px' }}>
        Confirming your email...
      </p>
      <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>
        Just a second!
      </p>
    </main>
  )
}