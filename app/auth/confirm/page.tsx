'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming')

  useEffect(() => {
    const { searchParams } = new URL(window.location.href)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (token_hash && type) {
      supabase.auth.verifyOtp({ token_hash, type: type as any })
        .then(({ error }) => {
          if (!error) {
            setStatus('success')
            // Give user 2 seconds to see the success message, then go to login
            setTimeout(() => {
              window.location.href = '/login?confirmed=true'
            }, 2000)
          } else {
            setStatus('error')
            setTimeout(() => {
              window.location.href = '/login?error=confirmation_failed'
            }, 2000)
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
      fontFamily: 'sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>
        {status === 'confirming' && '🥒'}
        {status === 'success' && '✅'}
        {status === 'error' && '❌'}
      </div>
      <p style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: '20px', marginBottom: '8px' }}>
        {status === 'confirming' && 'Confirming your email...'}
        {status === 'success' && 'Email confirmed!'}
        {status === 'error' && 'Something went wrong'}
      </p>
      <p style={{ color: '#6B7280', fontSize: '14px' }}>
        {status === 'confirming' && 'Just a second!'}
        {status === 'success' && 'Taking you to sign in now... 🥒'}
        {status === 'error' && 'Taking you back to login...'}
      </p>
    </main>
  )
}