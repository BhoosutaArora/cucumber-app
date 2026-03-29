'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function VerifyID() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [idType, setIdType] = useState('Aadhaar')
  const [idNumber, setIdNumber] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setFile(selectedFile)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(selectedFile)
  }

  async function handleUpload() {
    if (!file || !idNumber || !fullName) {
      setError('Please fill in all fields and select a file.')
      return
    }

    if (idNumber.length < 8) {
      setError('Please enter a valid ID number.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${idType.toLowerCase()}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('id-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      setUploaded(true)
      setStep(3)
    } catch (err: any) {
      setError('Upload failed: ' + err.message)
    }

    setUploading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥒</div>
          <div className="text-green-700 font-bold">Loading...</div>
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
        <a href="/dashboard" className="text-xs md:text-sm font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50">
          Dashboard
        </a>
      </nav>

      <div className="pt-20 md:pt-24 px-4 md:px-8 pb-16 max-w-lg mx-auto">

        {/* ── PROGRESS STEPS ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 md:w-20 h-1 rounded-full transition-all ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1 — Info ── */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🪪</div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Verify Your Identity</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Cucumber requires all travelers to verify their identity. This keeps our community safe and builds trust between strangers.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-green-100 p-5 mb-5">
              <div className="font-bold text-gray-900 mb-4">Why we verify your ID</div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '🛡️', text: 'Keeps all travelers safe and accountable' },
                  { icon: '🔒', text: 'Your document is stored securely and privately' },
                  { icon: '✅', text: 'Get a verified badge on your profile' },
                  { icon: '🚀', text: 'Required to join any travel room' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <div className="text-xs font-bold text-green-700 mb-1">🔐 Privacy Promise</div>
              <div className="text-xs text-green-600 leading-relaxed">Your ID document is only used for identity verification. It is never shared with other travelers or third parties. Only Cucumber admins can access it.</div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-green-200"
            >
              Continue to Verification →
            </button>
          </div>
        )}

        {/* ── STEP 2 — Upload ── */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Upload Your ID</h1>
              <p className="text-sm text-gray-500">Accepted: Aadhaar Card, PAN Card, Passport, Driving Licence</p>
            </div>

            <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4">

              {/* ID Type */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 mb-2 block">ID Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Aadhaar', 'PAN Card', 'Passport', 'Driving Licence'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setIdType(type)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${idType === type ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name (as on ID)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>

              {/* ID Number */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">{idType} Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={idType === 'Aadhaar' ? 'XXXX XXXX XXXX' : idType === 'PAN Card' ? 'ABCDE1234F' : 'Enter ID number'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Upload {idType} Photo</label>
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="ID Preview" className="w-full h-48 object-cover rounded-xl border border-green-200" />
                    <button
                      onClick={() => { setFile(null); setPreview(null) }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      ✓ Ready to upload
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-green-200 rounded-xl cursor-pointer hover:bg-green-50 transition-all">
                    <div className="text-3xl mb-2">📷</div>
                    <div className="text-sm font-semibold text-green-700">Tap to upload photo</div>
                    <div className="text-xs text-gray-400 mt-1">JPG, PNG or PDF · Max 5MB</div>
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || !file || !idNumber || !fullName}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {uploading ? 'Uploading securely...' : 'Submit for Verification 🔒'}
              </button>
            </div>

            <button onClick={() => setStep(1)} className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600">
              ← Back
            </button>
          </div>
        )}

        {/* ── STEP 3 — Success ── */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <polyline points="20,6 9,17 4,12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              ID Submitted! 🎉
            </h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Your {idType} has been submitted successfully. Our team will verify it within <strong>24 hours</strong>. You'll receive an email once verified.
            </p>

            <div className="bg-white rounded-2xl border border-green-100 p-5 mb-6 text-left">
              <div className="font-bold text-gray-900 mb-3">What happens next?</div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '📧', text: 'You\'ll receive a confirmation email shortly' },
                  { icon: '👀', text: 'Our team reviews your ID within 24 hours' },
                  { icon: '✅', text: 'Get your verified badge on your profile' },
                  { icon: '🏔️', text: 'You can now join any travel room!' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a href="/rooms" className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-sm text-center hover:scale-105 transition-all shadow-lg shadow-green-200">
                Browse Travel Rooms 🏔️
              </a>
              <a href="/dashboard" className="w-full py-3 rounded-2xl border-2 border-green-200 text-green-700 font-bold text-sm text-center hover:bg-green-50 transition-all">
                Go to Dashboard
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}