'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type VoteResult = {
  choice: string
  count: number
}

export default function ResultPage() {
  const [results, setResults] = useState<VoteResult[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const hasToken = sessionStorage.getItem('has_token')
    const hasVoted = sessionStorage.getItem('has_voted')

    if (!hasToken || hasVoted !== 'true') {
      router.push('/token')
      return
    }

    fetchResults()
  }, [router])

  const fetchResults = async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('choice')

    if (error) {
      console.error('Gagal mengambil data:', error)
      return
    }

    const counts: { [key: string]: number } = {}
    data.forEach((row: { choice: string }) => {
      counts[row.choice] = (counts[row.choice] || 0) + 1
    })

    const formattedResults: VoteResult[] = Object.keys(counts).map((choice) => ({
      choice,
      count: counts[choice],
    }))

    setResults(formattedResults)
    setTotalVotes(data.length)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl">👥</span>
            <span className="font-bold tracking-wide">VOTING GATHERING 2026</span>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-medium border border-slate-700">🔒 Aman & Anonim</span>
        </div>

        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center max-w-md mx-auto relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">✓</div>
              <span className="text-[11px] text-slate-400 mt-1">Token</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">✓</div>
              <span className="text-[11px] text-slate-400 mt-1">Pilih Opsi</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">✓</div>
              <span className="text-[11px] text-slate-400 mt-1">Konfirmasi</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">4</div>
              <span className="text-[11px] font-semibold text-slate-700 mt-1">Selesai</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
            ✓
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Terima Kasih!</h2>
            <p className="text-sm font-semibold text-slate-700">Suara Anda telah tercatat.</p>
            <p className="text-xs text-slate-500 pt-1">Partisipasi Anda sangat berarti bagi kami.<br />Hasil voting akan diumumkan setelah voting ditutup.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-left space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 pb-2 border-b border-slate-200">
              <span>REKAPITULASI SEMENTARA</span>
              <span>Total: {totalVotes} Suara</span>
            </div>
            {results.map((res, index) => {
              const percentage = totalVotes > 0 ? Math.round((res.count / totalVotes) * 100) : 0
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{res.choice}</span>
                    <span className="text-slate-500">{res.count} suara ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-center justify-center space-x-3 text-left">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-[11px] text-blue-500 font-bold uppercase">Voting Ditutup Pada</p>
              <p className="text-xs font-bold text-slate-700">25 Juli 2026, 16:00 WIB</p>
            </div>
          </div>

          <button
            onClick={() => {
              sessionStorage.clear()
              router.push('/')
            }}
            className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl transition text-sm shadow-sm flex items-center justify-center space-x-2"
          >
            <span>🏠</span>
            <span>KEMBALI KE BERANDA</span>
          </button>
        </div>
      </div>
    </main>
  )
}