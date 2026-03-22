export default function Rooms() {
  const rooms = [
    {
      name: "Adventure Squad 🏔️",
      dest: "Spiti Valley, HP",
      dates: "Aug 14–17, 2025",
      filled: 9,
      max: 10,
      vibe: "Adventure",
      color: "from-indigo-900 to-purple-900",
      status: "🔥 1 seat left",
      statusColor: "text-orange-400",
      members: ["PK", "SM", "AR", "RV", "+5"],
      colors: ["#7B1FA2", "#1565C0", "#B71C1C", "#E65100", "#2E7D32"],
    },
    {
      name: "Peaceful Escape 🌿",
      dest: "Shimla, HP",
      dates: "Aug 2–5, 2025",
      filled: 6,
      max: 10,
      vibe: "Peaceful",
      color: "from-green-900 to-green-700",
      status: "🌱 4 seats open",
      statusColor: "text-green-400",
      members: ["PK", "NK", "DN", "+3"],
      colors: ["#7B1FA2", "#00695C", "#0277BD", "#2E7D32"],
    },
    {
      name: "Explorer Crew 🏛️",
      dest: "Jaipur, Rajasthan",
      dates: "Sep 5–8, 2025",
      filled: 2,
      max: 8,
      vibe: "Explorer",
      color: "from-orange-900 to-red-800",
      status: "🆕 Just opened!",
      statusColor: "text-blue-400",
      members: ["DN", "KP"],
      colors: ["#0277BD", "#AD1457"],
    },
    {
      name: "Beach Vibes 🏖️",
      dest: "Goa",
      dates: "Sep 20–24, 2025",
      filled: 8,
      max: 10,
      vibe: "Beach",
      color: "from-blue-900 to-blue-700",
      status: "🚨 2 seats left!",
      statusColor: "text-red-400",
      members: ["TK", "PS", "LR", "+5"],
      colors: ["#AD1457", "#7B1FA2", "#2E7D32", "#2E7D32"],
    },
    {
      name: "Mountain Souls 🧘",
      dest: "Rishikesh, Uttarakhand",
      dates: "Oct 3–6, 2025",
      filled: 4,
      max: 10,
      vibe: "Peaceful",
      color: "from-teal-900 to-teal-700",
      status: "🌱 6 seats open",
      statusColor: "text-green-400",
      members: ["AR", "SM", "+2"],
      colors: ["#B71C1C", "#1565C0", "#2E7D32"],
    },
    {
      name: "Culture Seekers 🎭",
      dest: "Varanasi, UP",
      dates: "Oct 15–18, 2025",
      filled: 3,
      max: 8,
      vibe: "Explorer",
      color: "from-yellow-900 to-orange-800",
      status: "🌱 5 seats open",
      statusColor: "text-green-400",
      members: ["RV", "NK", "+1"],
      colors: ["#E65100", "#00695C", "#2E7D32"],
    },
  ]

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-16 bg-white border-b border-green-100">
        <a href="/" className="text-2xl font-extrabold text-green-700 tracking-tight no-underline">
          cucumber<span className="text-green-400">.</span>
        </a>
        <div className="flex items-center gap-8">
          <a href="/" className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">Home</a>
          <a href="/rooms" className="text-sm font-bold text-green-700 cursor-pointer">Rooms</a>
          <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">My Trips</span>
          <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-green-700 transition-colors">Profile</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-semibold text-green-700 border border-green-200 px-5 py-2 rounded-xl hover:bg-green-50 transition-all">
            Sign in
          </button>
          <button className="text-sm font-bold text-white bg-gradient-to-r from-green-400 to-green-500 px-5 py-2 rounded-xl hover:shadow-lg transition-all hover:scale-105">
            Join a Room →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 pb-12 px-16 bg-green-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-4 py-2 text-xs font-bold text-green-700 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
              12 rooms open right now
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
              Travel <span className="text-green-500">Rooms</span> 🏠
            </h1>
            <p className="text-lg text-gray-500">Find your tribe. Travel together.</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center bg-white rounded-2xl px-8 py-4 border border-green-100 shadow-sm">
              <div className="text-3xl font-extrabold text-green-700">12</div>
              <div className="text-xs text-gray-400 mt-1">Active rooms</div>
            </div>
            <div className="text-center bg-white rounded-2xl px-8 py-4 border border-green-100 shadow-sm">
              <div className="text-3xl font-extrabold text-green-700">89</div>
              <div className="text-xs text-gray-400 mt-1">Travelers online</div>
            </div>
            <div className="text-center bg-white rounded-2xl px-8 py-4 border border-green-100 shadow-sm">
              <div className="text-3xl font-extrabold text-green-700">47</div>
              <div className="text-xs text-gray-400 mt-1">Trips this month</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <section className="px-16 py-5 bg-white border-b border-green-50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {["All Vibes", "🏔️ Adventure", "🌿 Peaceful", "🏛️ Explorer", "🏖️ Beach"].map((f, i) => (
            <button key={f} className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${i === 0 ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-700"}`}>
              {f}
            </button>
          ))}
          <div className="ml-auto">
            <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold hover:scale-105 transition-all shadow-sm">
              + Create Your Room
            </button>
          </div>
        </div>
      </section>

      {/* ── TRENDING BANNER ── */}
      <div className="px-16 pt-5 max-w-7xl mx-auto">
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 flex items-center gap-3 mb-6">
          <span className="text-orange-500 font-bold text-sm">🔥 Trending — Spiti Valley Adventure Squad has 3 travelers joining this hour</span>
          <span className="ml-auto text-xs font-bold bg-green-500 text-white px-3 py-1 rounded-full animate-pulse">LIVE</span>
        </div>
      </div>

      {/* ── ROOMS GRID ── */}
      <section className="px-16 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          {rooms.map((room) => {
            const pct = Math.round((room.filled / room.max) * 100)
            return (
              <div key={room.name} className="bg-white rounded-2xl overflow-hidden border border-green-100 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-100 transition-all duration-300 cursor-pointer">

                {/* top accent bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${room.color}`} />

                <div className="p-5">
                  {/* header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{room.name}</div>
                      <div className="text-xs text-green-600 font-semibold mt-0.5">📍 {room.dest}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{room.dates}</div>
                    </div>
                    <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">
                      {room.vibe}
                    </span>
                  </div>

                  {/* members */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex">
                      {room.members.map((m, i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold -ml-1.5 first:ml-0" style={{ background: room.colors[i] || "#2E7D32" }}>
                          {m}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{room.filled}/{room.max} joined</span>
                  </div>

                  {/* seat bar */}
                  <div className="mb-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-gray-600">{room.filled} / {room.max} seats filled</span>
                      <span className="text-gray-400">{pct}%</span>
                    </div>
                    <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 80 ? "bg-gradient-to-r from-orange-400 to-red-500" : "bg-gradient-to-r from-green-400 to-green-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* status */}
                  <div className={`text-xs font-bold mt-2 mb-4 ${room.statusColor}`}>
                    {room.status}
                  </div>

                  {/* buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold hover:scale-105 transition-transform shadow-sm">
                      Join Room
                    </button>
                    <button className="px-4 py-2.5 rounded-xl border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-50 transition-all">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 py-10 px-16 text-center">
        <div className="text-2xl font-extrabold text-green-400 mb-2">cucumber<span className="text-white opacity-40">.</span></div>
        <div className="text-sm text-gray-600">© 2025 Cucumber Travel · Made with 🥒 in India</div>
      </footer>

    </main>
  )
}