'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState<any>(null)
  const [membersCount, setMembersCount] = useState(0)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        setUsername(profile?.username || user.email?.split('@')[0] || 'Traveler')
      }
    }

    async function fetchRoom() {
      const { data } = await supabase
        .from('Rooms')
        .select('*')
        .eq('id', 2)
        .single()
      setRoom(data)

      const { count } = await supabase
        .from('room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', 2)
      setMembersCount(count || 0)
    }

    checkUser()
    fetchRoom()
  }, [])

  const seatsLeft = room ? room.seats_total - (room.seats_filled || 0) : 0
  const pct = room ? Math.round(((room.seats_filled || 0) / room.seats_total) * 100) : 0

  return (
    <main className="min-h-screen font-sans" style={{background: '#0a0a0a', color: '#fff'}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .display { font-family: 'Syne', sans-serif; }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.8);opacity:0} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes slide-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(74,222,128,0.3)} 50%{box-shadow:0 0 40px rgba(74,222,128,0.6)} }
        .float { animation: float 4s ease-in-out infinite; }
        .slide-up { animation: slide-up 0.8s ease forwards; }
        .slide-up-2 { animation: slide-up 0.8s ease 0.2s forwards; opacity:0; }
        .slide-up-3 { animation: slide-up 0.8s ease 0.4s forwards; opacity:0; }
        .slide-up-4 { animation: slide-up 0.8s ease 0.6s forwards; opacity:0; }
        .glow-btn { animation: glow 2s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #4ade80 0%, #86efac 25%, #ffffff 50%, #86efac 75%, #4ade80 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(74,222,128,0.15); }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse-ring 1.5s ease-out infinite;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '60px',
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div className="display" style={{fontSize: '22px', fontWeight: 800, color: '#4ade80', letterSpacing: '-0.5px'}}>
          cucumber<span style={{color: 'rgba(255,255,255,0.2)'}}>.</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          {username ? (
            <a href="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: '12px', padding: '6px 14px', textDecoration: 'none'
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800, color: '#000'
              }}>
                {username[0].toUpperCase()}
              </div>
              <span style={{fontSize: '13px', fontWeight: 600, color: '#4ade80'}}>{username}</span>
            </a>
          ) : (
            <a href="/login" style={{
              fontSize: '13px', fontWeight: 600, color: '#9ca3af',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '7px 16px', textDecoration: 'none',
              transition: 'all 0.2s'
            }}>Sign in</a>
          )}
          <a href="/rooms" style={{
            fontSize: '13px', fontWeight: 700, color: '#000',
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            borderRadius: '10px', padding: '7px 18px', textDecoration: 'none',
          }}>
            Find Room →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        paddingTop: '80px', paddingBottom: '60px',
        position: 'relative', overflow: 'hidden',
        padding: '80px 24px 60px'
      }}>
        {/* Background blobs */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '5%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Live badge */}
        <div className="slide-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '100px', padding: '8px 16px', marginBottom: '32px'
        }}>
          <div className="pulse-dot" style={{position: 'relative', width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80'}} />
          <span style={{fontSize: '12px', fontWeight: 600, color: '#4ade80'}}>Shimla trip open now — {seatsLeft > 0 ? `${seatsLeft} seats left` : 'filling fast!'}</span>
        </div>

        {/* Main heading */}
        <h1 className="display slide-up-2" style={{
          fontSize: 'clamp(42px, 8vw, 96px)',
          fontWeight: 800, lineHeight: 1.0,
          textAlign: 'center', letterSpacing: '-2px',
          marginBottom: '24px', maxWidth: '900px'
        }}>
          Travel with strangers<br />
          <span className="shimmer-text">who get you.</span>
        </h1>

        <p className="slide-up-3" style={{
          fontSize: 'clamp(14px, 2vw, 18px)', color: '#6b7280',
          textAlign: 'center', maxWidth: '500px',
          lineHeight: 1.7, marginBottom: '40px'
        }}>
          Small curated rooms of 8–10 people. Same vibe, real connections, unforgettable trips.
        </p>

        {/* CTA Buttons */}
        <div className="slide-up-4" style={{display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '80px'}}>
          <a href="/rooms" className="glow-btn" style={{
            padding: '14px 32px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #4ade80, #16a34a)',
            color: '#000', fontWeight: 800, fontSize: '15px',
            textDecoration: 'none', display: 'inline-block'
          }}>
            Join Shimla Trip 🏔️
          </a>
          <a href="/login" style={{
            padding: '14px 32px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontWeight: 600, fontSize: '15px',
            textDecoration: 'none', display: 'inline-block'
          }}>
            How it works ↓
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '48px', flexWrap: 'wrap', justifyContent: 'center'
        }}>
          {[
            { num: '4 Days', label: '3 Nights in Shimla' },
            { num: '₹6,999', label: 'All inclusive' },
            { num: '8–10', label: 'People per room' },
            { num: '4.9 ⭐', label: 'Avg trip rating' },
          ].map((s) => (
            <div key={s.label} style={{textAlign: 'center'}}>
              <div className="display" style={{fontSize: '22px', fontWeight: 800, color: '#4ade80'}}>{s.num}</div>
              <div style={{fontSize: '12px', color: '#4b5563', marginTop: '4px'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE ROOM CARD ── */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0d1a0d 50%, #0a0a0a 100%)'
      }}>
        <div style={{maxWidth: '600px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '40px'}}>
            <div style={{fontSize: '11px', fontWeight: 700, color: '#4ade80', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px'}}>Live Now</div>
            <h2 className="display" style={{fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px'}}>
              One trip. Your tribe.
            </h2>
          </div>

          {/* Real room card */}
          <div className="card-hover" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: '24px', overflow: 'hidden'
          }}>
            {/* Room image / gradient header */}
            <div style={{
              height: '200px',
              background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #052e16 100%)',
              position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '20px'
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(74,222,128,0.15) 0%, transparent 60%)',
              }} />
              <div className="float" style={{
                position: 'absolute', right: '24px', top: '24px',
                fontSize: '64px'
              }}>🏔️</div>
              <div style={{position: 'relative', zIndex: 1}}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)',
                  borderRadius: '100px', padding: '4px 12px',
                  fontSize: '11px', fontWeight: 700, color: '#4ade80', marginBottom: '8px'
                }}>
                  ✅ APPROVED · OPEN
                </div>
                <div className="display" style={{fontSize: '24px', fontWeight: 800, color: '#fff'}}>
                  {room?.name || 'Peaceful Escape'}
                </div>
                <div style={{fontSize: '13px', color: '#86efac', marginTop: '4px'}}>
                  📍 {room?.destination || 'Shimla, HP'} · {room?.dates || 'Aug 2–5, 2026'}
                </div>
              </div>
            </div>

            {/* Room details */}
            <div style={{padding: '24px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <div style={{fontSize: '13px', color: '#6b7280'}}>
                  {membersCount} member{membersCount !== 1 ? 's' : ''} joined
                </div>
                <div style={{fontSize: '13px', fontWeight: 700, color: seatsLeft <= 2 ? '#f87171' : '#4ade80'}}>
                  {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Full!'}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', marginBottom: '24px', overflow: 'hidden'}}>
                <div style={{
                  height: '100%', borderRadius: '100px',
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #4ade80, #86efac)',
                  transition: 'width 1s ease'
                }} />
              </div>

              {/* Details grid */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px'}}>
                {[
                  { icon: '💰', label: 'Price', value: `₹${room?.price?.toLocaleString() || '6,999'}` },
                  { icon: '👥', label: 'Group size', value: `${room?.seats_total || 10} people` },
                  { icon: '🎯', label: 'Vibe', value: room?.vibe || 'Peaceful' },
                  { icon: '📅', label: 'Duration', value: '4 Days 3 Nights' },
                ].map((d) => (
                  <div key={d.label} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', padding: '12px'
                  }}>
                    <div style={{fontSize: '18px', marginBottom: '4px'}}>{d.icon}</div>
                    <div style={{fontSize: '11px', color: '#4b5563', marginBottom: '2px'}}>{d.label}</div>
                    <div style={{fontSize: '14px', fontWeight: 700, color: '#e5e7eb'}}>{d.value}</div>
                  </div>
                ))}
              </div>

              <a href="/rooms/2" style={{
                display: 'block', textAlign: 'center',
                padding: '14px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                color: '#000', fontWeight: 800, fontSize: '15px',
                textDecoration: 'none'
              }}>
                View Room & Join →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{padding: '80px 24px', background: '#0a0a0a'}}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '56px'}}>
            <div style={{fontSize: '11px', fontWeight: 700, color: '#4ade80', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px'}}>How it works</div>
            <h2 className="display" style={{fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px'}}>
              Stranger → Travel buddy<br />in 4 steps.
            </h2>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px'}}>
            {[
              { num: '01', icon: '🪪', title: 'Sign up', desc: 'Create profile, verify your ID' },
              { num: '02', icon: '🏠', title: 'Join a room', desc: 'Pick your vibe, see who\'s in' },
              { num: '03', icon: '🎥', title: 'Video call', desc: 'Meet the group before you go' },
              { num: '04', icon: '✈️', title: 'Travel!', desc: 'Show up, make memories' },
            ].map((s) => (
              <div key={s.num} className="card-hover" style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px', padding: '24px', textAlign: 'center'
              }}>
                <div className="display" style={{fontSize: '13px', fontWeight: 700, color: 'rgba(74,222,128,0.4)', marginBottom: '12px'}}>{s.num}</div>
                <div style={{fontSize: '32px', marginBottom: '12px'}}>{s.icon}</div>
                <div style={{fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '8px'}}>{s.title}</div>
                <div style={{fontSize: '12px', color: '#4b5563', lineHeight: 1.6}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '48px 24px',
        background: '#050505',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{maxWidth: '600px', margin: '0 auto', textAlign: 'center'}}>
          <div className="display" style={{fontSize: '28px', fontWeight: 800, color: '#4ade80', marginBottom: '12px'}}>
            cucumber<span style={{color: 'rgba(255,255,255,0.15)'}}>.</span>
          </div>
          <p style={{fontSize: '13px', color: '#374151', marginBottom: '24px', lineHeight: 1.6}}>
            Social travel for people who want real connections, not just destinations.
          </p>

          {/* Instagram link */}
          <a href="https://instagram.com/cucumbertravel.in" target="_blank" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '10px 20px', textDecoration: 'none',
            color: '#9ca3af', fontSize: '13px', fontWeight: 600,
            marginBottom: '32px', transition: 'all 0.2s'
          }}>
            📸 @cucumbertravel.in
          </a>

          <div style={{borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '24px'}}>
            <div style={{fontSize: '12px', color: '#1f2937'}}>
              © 2025 Cucumber Travel · Made with 🥒 in India
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}