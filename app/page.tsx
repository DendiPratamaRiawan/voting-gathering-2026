'use client'

import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  const handleStart = () => {
    sessionStorage.clear()
    router.push('/token')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl">👥</span>
            <span className="font-bold tracking-wide">VOTING GATHERING 2026</span>
          </div>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <div className="text-4xl mb-3">👥</div>
            <h1 className="text-2xl font-black text-slate-900">VOTING GATHERING 2026</h1>
            <p className="text-slate-500 font-medium">Family Gathering atau Employee Gathering?</p>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5 text-left space-y-3">
            <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
              <span>🛡️</span>
              <span>Voting Bersifat Anonim</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pl-6 list-disc">
              <li>Setiap peserta hanya dapat memilih satu kali.</li>
              <li>Panitia tidak mengetahui token yang dimiliki peserta.</li>
              <li>Sistem tidak menyimpan hubungan antara token dan pilihan.</li>
              <li>Hasil voting akan diumumkan setelah voting ditutup.</li>
            </ul>
          </div>

          <div className="flex items-center justify-center space-x-3 text-slate-600 bg-slate-50 py-3 px-4 rounded-xl border border-slate-200/60 text-sm">
            <span className="text-xl">📅</span>
            <div className="text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase">Periode Voting</p>
              <p className="font-bold text-slate-700">24 - 25 Juli 2026</p>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
          >
            <span>MULAI VOTING</span>
            <span>→</span>
          </button>

          <p className="text-xs text-slate-400 pt-2">Terima kasih atas partisipasinya!</p>
        </div>
      </div>
    </main>
  )
}