export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-16 bg-white border-b border-green-100">
        <div className="text-2xl font-extrabold text-green-700 tracking-tight">
          cucumber<span className="text-green-400">.</span>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">Explore</span>
          <a href="/rooms" className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">Rooms</a>
          <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">My Trips</span>
          <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">Profile</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm font-semibold text-green-700 border border-green-200 px-5 py-2 rounded-xl hover:bg-green-50 transition-all">
  Sign in
</a>
          <button className="text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all hover:scale-105">
            Find a Room →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden pt-16">

        {/* background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,#C8F0C0,transparent_65%)] pointer-events-none" />

        {/* floating blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-gradient-to-br from-green-200 to-green-400 opacity-10 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-gradient-to-br from-green-300 to-green-500 opacity-10 animate-pulse" />

        <div className="relative z-10 text-center max-w-5xl px-8 w-full">

          {/* live tag */}
          <div className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-4 py-2 text-xs font-bold text-green-700 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
            12,000+ travelers have found their tribe
          </div>

          {/* headline */}
          <h1 className="text-7xl md:text-8xl font-extrabold leading-none tracking-tight text-gray-900 mb-6">
            Travel <span className="text-green-500">together</span><br />
            with strangers<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">who get it.</span>
          </h1>

          {/* subline */}
          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-10">
            Cucumber connects you to small, curated travel rooms of 8–10 people who share your exact travel vibe. No boring group tours. No lonely solo trips.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <button className="px-9 py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-white font-extrabold text-base shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all">
              Find Your Room →
            </button>
            <button className="px-8 py-4 rounded-2xl border-2 border-green-200 text-green-700 font-bold text-base bg-white hover:bg-green-50 transition-all">
              See the community
            </button>
          </div>

          {/* stats */}
          <div className="flex items-center justify-center gap-16">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-green-700">48</div>
              <div className="text-xs text-gray-400 mt-1">Active rooms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-green-700">12K+</div>
              <div className="text-xs text-gray-400 mt-1">Travelers joined</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-green-700">4.9 ⭐</div>
              <div className="text-xs text-gray-400 mt-1">Avg rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-green-700">847</div>
              <div className="text-xs text-gray-400 mt-1">Trips completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROOMS SECTION ── */}
      <section className="w-full bg-green-50 py-24 px-16">
        <div className="text-center mb-14">
          <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">Travel Rooms</div>
          <h2 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-3">Pick your vibe. Join the room.</h2>
          <p className="text-base text-gray-500">Every destination, three vibes. Find your people in seconds.</p>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">

          {/* Room 1 */}
          <div className="bg-white rounded-2xl overflow-hidden border border-green-100 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 transition-all duration-300 cursor-pointer">
            <div className="h-48 bg-gradient-to-br from-indigo-900 to-purple-900 relative flex items-end p-4">
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold text-white bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/30">🏔️ Adventure</span>
              </div>
              <span className="text-xs font-bold text-white bg-black/30 px-3 py-1 rounded-lg relative z-10">📍 Spiti Valley, HP</span>
            </div>
            <div className="p-5">
              <div className="font-bold text-gray-900 text-lg mb-1">Adventure Squad 🏔️</div>
              <div className="text-xs text-gray-400 mb-3">Aug 14–17, 2025 · 4 days</div>
              <div className="h-1.5 bg-green-100 rounded-full mb-2 overflow-hidden">
                <div className="h-full w-[90%] bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex">
                  {['#7B1FA2','#1565C0','#B71C1C','#E65100'].map((c,i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold -ml-1.5 first:ml-0" style={{background:c}}>
                      {['P','S','A','+6'][i]}
                    </div>
                  ))}
                </div>
                <button className="text-xs font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-4 py-2 rounded-lg hover:scale-105 transition-transform">
                  Join Room
                </button>
              </div>
              <div className="text-xs text-orange-500 font-semibold mt-3">🔥 1 seat remaining</div>
            </div>
          </div>

          {/* Room 2 */}
          <div className="bg-white rounded-2xl overflow-hidden border border-green-100 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 transition-all duration-300 cursor-pointer">
            <div className="h-48 bg-gradient-to-br from-green-800 to-green-600 relative flex items-end p-4">
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold text-white bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/30">🌿 Peaceful</span>
              </div>
              <span className="text-xs font-bold text-white bg-black/30 px-3 py-1 rounded-lg relative z-10">📍 Shimla, HP</span>
            </div>
            <div className="p-5">
              <div className="font-bold text-gray-900 text-lg mb-1">Peaceful Escape 🌿</div>
              <div className="text-xs text-gray-400 mb-3">Aug 2–5, 2025 · 4 days</div>
              <div className="h-1.5 bg-green-100 rounded-full mb-2 overflow-hidden">
                <div className="h-full w-[60%] bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex">
                  {['#7B1FA2','#00695C','#2E7D32'].map((c,i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold -ml-1.5 first:ml-0" style={{background:c}}>
                      {['P','N','+4'][i]}
                    </div>
                  ))}
                </div>
                <button className="text-xs font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-4 py-2 rounded-lg hover:scale-105 transition-transform">
                  Join Room
                </button>
              </div>
              <div className="text-xs text-green-600 font-semibold mt-3">🌱 4 seats open</div>
            </div>
          </div>

          {/* Room 3 */}
          <div className="bg-white rounded-2xl overflow-hidden border border-green-100 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-100 transition-all duration-300 cursor-pointer">
            <div className="h-48 bg-gradient-to-br from-orange-700 to-red-700 relative flex items-end p-4">
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold text-white bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/30">🏛️ Explorer</span>
              </div>
              <span className="text-xs font-bold text-white bg-black/30 px-3 py-1 rounded-lg relative z-10">📍 Jaipur, Rajasthan</span>
            </div>
            <div className="p-5">
              <div className="font-bold text-gray-900 text-lg mb-1">Explorer Crew 🏛️</div>
              <div className="text-xs text-gray-400 mb-3">Sep 5–8, 2025 · 4 days</div>
              <div className="h-1.5 bg-green-100 rounded-full mb-2 overflow-hidden">
                <div className="h-full w-[25%] bg-gradient-to-r from-green-300 to-green-400 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex">
                  {['#0277BD','#AD1457'].map((c,i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold -ml-1.5 first:ml-0" style={{background:c}}>
                      {['D','K'][i]}
                    </div>
                  ))}
                </div>
                <button className="text-xs font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-4 py-2 rounded-lg hover:scale-105 transition-transform">
                  Join Room
                </button>
              </div>
              <div className="text-xs text-blue-600 font-semibold mt-3">🆕 Just opened — be early!</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="w-full bg-white py-24 px-16">
        <div className="text-center mb-14">
          <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">How it works</div>
          <h2 className="text-5xl font-extrabold tracking-tight text-gray-900">From stranger to travel buddy<br />in 4 steps.</h2>
        </div>
        <div className="grid grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            {num:'01', icon:'🪪', title:'Sign up & verify', desc:'Create your profile, take the vibe quiz, upload your government ID for safety verification.'},
            {num:'02', icon:'🏠', title:'Browse rooms', desc:'Pick a destination and vibe — Adventure, Peaceful, or Explorer. See exactly who\'s already joined.'},
            {num:'03', icon:'💳', title:'Book your seat', desc:'Pay once. Everything included — hotel, transport, meals, activities, and a group coordinator.'},
            {num:'04', icon:'✈️', title:'Travel together', desc:'Meet your tribe in the pre-trip video call, then show up on day one to start the adventure.'},
          ].map((s) => (
            <div key={s.num} className="text-center p-8">
              <div className="text-6xl font-extrabold text-green-100 leading-none mb-4">{s.num}</div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-2xl mx-auto mb-4">{s.icon}</div>
              <div className="font-bold text-gray-900 text-lg mb-2">{s.title}</div>
              <div className="text-sm text-gray-400 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-gray-950 py-16 px-16">
        <div className="grid grid-cols-4 gap-12 max-w-7xl mx-auto mb-10">
          <div>
            <div className="text-2xl font-extrabold text-green-400 mb-3">cucumber<span className="text-white/40">.</span></div>
            <div className="text-sm text-gray-500 leading-relaxed">Social travel for people who want real connections, not just destinations.</div>
          </div>
          {[
            {title:'Product', links:['Browse Rooms','Explore Feed','Pricing','Blog']},
            {title:'Safety', links:['ID Verification','Community Guidelines','Trust & Safety','Insurance']},
            {title:'Company', links:['About','Careers','Press','Contact']},
          ].map((col) => (
            <div key={col.title}>
              <div className="text-sm font-bold text-gray-300 mb-4">{col.title}</div>
              {col.links.map(l => <div key={l} className="text-sm text-gray-600 mb-2 cursor-pointer hover:text-green-400 transition-colors">{l}</div>)}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-gray-800 pt-6 max-w-7xl mx-auto">
          <span className="text-xs text-gray-600">© 2025 Cucumber Travel Pvt. Ltd. · Made with 🥒 in India</span>
          <span className="text-xs text-gray-600">Privacy Policy · Terms</span>
        </div>
      </footer>

    </main>
  )
}