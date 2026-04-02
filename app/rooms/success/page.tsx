'use client'

export default function RoomSuccess() {
  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🥒</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Room Created!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your room is under review by the Cucumber team. We'll notify you once it's approved and live!
        </p>
        <a href="/rooms" className="block w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold hover:shadow-lg transition-all">
          Back to Rooms 🏠
        </a>
      </div>
    </main>
  )
}


