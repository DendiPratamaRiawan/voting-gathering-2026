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

type DetailedVote = {
  token_code: string
  choice: string
  created_at: string
}

export default function AdminPage() {
  const [results, setResults] = useState<VoteResult[]>([])
  const [detailedVotes, setDetailedVotes] = useState<DetailedVote[]>([])
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
    
    // Mengambil data suara beserta informasi token terkait (mendukung foreign key token_id)
    const { data, error } = await supabase
      .from('votes')
      .select(`
        choice,
        created_at,
        token_id,
        tokens (
          token_code
        )
      `)

    if (error) {
      console.error('Gagal mengambil data:', error)
      setLoading(false)
      return
    }

    const rows = data || []

    // Format data untuk detail per token (untuk keperluan PDF)
    const formattedDetails: DetailedVote[] = rows.map((row: any) => {
      // Mengambil kode token dari relasi object ataupun fallback langsung jika berupa string/id
      let tokenCodeText = 'Tanpa Token'
      if (row.tokens) {
        if (Array.isArray(row.tokens)) {
          tokenCodeText = row.tokens[0]?.token_code || 'Tanpa Token'
        } else if (typeof row.tokens === 'object' && row.tokens !== null) {
          tokenCodeText = row.tokens.token_code || 'Tanpa Token'
        }
      } else if (row.token_id) {
        tokenCodeText = `Token ID: ${row.token_id}`
      }

      return {
        token_code: tokenCodeText,
        choice: row.choice,
        created_at: row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-'
      }
    })

    setDetailedVotes(formattedDetails)

    // Hitung rekapitulasi suara per pilihan untuk tampilan UI web & ringkasan PDF
    const counts: Record<string, number> = {}
    rows.forEach((row: any) => {
      const choiceName = row.choice
      if (choiceName) {
        counts[choiceName] = (counts[choiceName] || 0) + 1
      }
    })

    const formattedResults: VoteResult[] = Object.keys(counts).map((choice) => ({
      choice,
      count: counts[choice],
    }))

    setResults(formattedResults)
    setTotalVotes(rows.length)
    setLoading(false)
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()

    // Header Laporan
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("REKAPITULASI MONITORING VOTING GATHERING 2026", 14, 20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Total Suara Masuk: ${totalVotes}`, 14, 28)
    doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 34)

    doc.setLineWidth(0.5)
    doc.line(14, 40, 196, 40)

    let yPos = 48

    // BAGIAN 1: Ringkasan Persentase Dominasi Pilihan
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("1. Ringkasan Persentase Pilihan", 14, yPos)
    
    yPos += 7
    doc.setFontSize(10)
    doc.text("Pilihan / Kandidat", 14, yPos)
    doc.text("Jumlah", 130, yPos)
    doc.text("Persentase", 165, yPos)

    yPos += 5
    doc.setFont("helvetica", "normal")
    results.forEach((res) => {
      const percentage = totalVotes > 0 ? Math.round((res.count / totalVotes) * 100) : 0
      doc.text(`- ${res.choice}`, 14, yPos)
      doc.text(`${res.count} suara`, 130, yPos)
      doc.text(`${percentage}%`, 165, yPos)
      yPos += 7
    })

    yPos += 5
    doc.setLineWidth(0.2)
    doc.line(14, yPos, 196, yPos)
    yPos += 10

    // BAGIAN 2: Detail Riwayat Token Memilih Apa
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("2. Detail Riwayat Pilihan Berdasarkan Token", 14, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.text("No", 14, yPos)
    doc.text("Token Pemilih", 30, yPos)
    doc.text("Pilihan", 90, yPos)
    doc.text("Waktu Memilih", 140, yPos)

    yPos += 6
    doc.setFont("helvetica", "normal")

    if (detailedVotes.length === 0) {
      doc.text("Belum ada data suara masuk.", 14, yPos)
    } else {
      detailedVotes.forEach((vote, index) => {
        // Pagination sederhana jika halaman PDF penuh
        if (yPos > 275) {
          doc.addPage()
          yPos = 20
        }
        doc.text(`${index + 1}`, 14, yPos)
        doc.text(`${vote.token_code}`, 30, yPos)
        doc.text(`${vote.choice}`, 90, yPos)
        doc.text(`${vote.created_at}`, 140, yPos)
        yPos += 7
      })
    }

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