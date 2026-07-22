'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { jsPDF } from 'jspdf'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type VoteResult = {
  choice: string
  count: number
}

export default function AdminPage() {
  const [results, setResults] = useState<VoteResult[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('is_admin')
    if (!isAdmin) {
      router.push('/token') // Jika bukan admin, lempar kembali ke halaman token
      return
    }

    fetchResults()
  }, [router])

  const fetchResults = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('votes')
      .select('choice')

    if (error) {
      console.error('Gagal mengambil data:', error)
      setLoading(false)
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
    setLoading(false)
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()

    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("REKAPITULASI MONITORING VOTING GATHERING 2026", 14, 20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Total Suara Masuk: ${totalVotes}`, 14, 28)
    doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 34)

    doc.setLineWidth(0.5)
    doc.line(14, 40, 196, 40)

    let yPos = 50
    doc.setFont("helvetica", "bold")
    doc.text("Pilihan / Kandidat", 14, yPos)
    doc.text("Jumlah Suara", 140, yPos)
    doc.text("Persentase", 170, yPos)

    yPos += 8
    doc.setFont("helvetica", "normal")

    results.forEach((res, index) => {
      const percentage = totalVotes > 0 ? Math.round((res.count / totalVotes) * 100) : 0
      doc.text(`${index + 1}. ${res.choice}`, 14, yPos)
      doc.text(`${res.count} suara`, 140, yPos)
      doc.text(`${percentage}%`, 170, yPos)
      yPos += 10
    })

    doc.save('Hasil-Monitoring-Voting-2026.pdf')
  }

  const handleLogout = () => {
    sessionStorage.clear()
    router.push('/token')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📊</span>
            <span className="font-bold tracking-wide">PANEL ADMIN MONITORING</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl font-bold transition shadow-sm"
          >
            Keluar
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">Rekapitulasi Suara</h2>
              <p className="text-xs text-slate-500">Data hasil voting masuk secara real-time.</p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl">
              Total: {totalVotes} Suara
            </span>
          </div>

          {loading ? (
            <p className="text-center py-8 text-sm text-slate-400">Memuat data...</p>
          ) : results.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Belum ada suara yang masuk ke sistem.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((res, index) => {
                const percentage = totalVotes > 0 ? Math.round((res.count / totalVotes) * 100) : 0
                return (
                  <div key={index} className="space-y-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{res.choice}</span>
                      <span className="text-slate-500">{res.count} suara ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={handleDownloadPDF}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-sm shadow-md flex items-center justify-center space-x-2"
          >
            <span>📄</span>
            <span>UNDUH LAPORAN PDF</span>
          </button>
        </div>

      </div>
    </main>
  )
}