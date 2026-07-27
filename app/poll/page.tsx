'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PollPage() {
  const [step, setStep] = useState<2 | 3>(2)
  const [selectedOption, setSelectedOption] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const hasToken = sessionStorage.getItem('has_token')
    if (!hasToken) {
      router.push('/token')
    }
  }, [router])

  // Opsi gathering dengan ikon yang lebih jelas dan kontras di latar belakang terang
  const options = [
    { id: 'Family Gathering', label: 'A. Family Gathering', icon: '👨‍👩‍👧‍👦', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { id: 'Employee Gathering', label: 'B. Employee Gathering', icon: '🧑‍💼', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  ]

  const handleConfirmSubmit = async () => {
    setLoading(true)

    const tokenIdStr = sessionStorage.getItem('token_id')
    if (!tokenIdStr) {
      alert('Sesi token tidak ditemukan. Silakan login kembali.')
      router.push('/token')
      return
    }

    const tokenId = parseInt(tokenIdStr)

    // 1. Validasi ulang ke database apakah token ini sudah dipakai orang lain
    const { data: tokenCheck, error: checkError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', tokenId)
      .single()

    if (checkError || !tokenCheck || tokenCheck.used_count >= tokenCheck.max_uses) {
      alert('Token ini sudah digunakan atau tidak valid!')
      setLoading(false)
      router.push('/token')
      return
    }

    // 2. KUNCI TOKEN: Update used_count menjadi terpakai saat dikirim
    const { error: updateError } = await supabase
      .from('tokens')
      .update({ used_count: tokenCheck.used_count + 1 })
      .eq('id', tokenId)

    if (updateError) {
      alert('Gagal memproses token. Silakan coba lagi.')
      setLoading(false)
      return
    }

    // 3. Masukkan pilihan suara ke tabel votes beserta token_id-nya[cite: 4]
    const { error: voteError } = await supabase
      .from('votes')
      .insert([{ 
        choice: selectedOption,
        token_id: tokenId 
      }])

    if (voteError) {
      alert('Gagal mengirim polling. Silakan coba lagi.')
      setLoading(false)
      return
    }

    sessionStorage.setItem('has_voted', 'true')
    router.push('/result')
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
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">✓</div>
              <span className="text-[11px] text-slate-400 mt-1">Token</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'} font-bold flex items-center justify-center text-sm shadow-md`}>2</div>
              <span className="text-[11px] font-semibold text-slate-700 mt-1">Pilih Opsi</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'} font-bold flex items-center justify-center text-sm`}>3</div>
              <span className="text-[11px] text-slate-400 mt-1">Konfirmasi</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm">4</div>
              <span className="text-[11px] text-slate-400 mt-1">Selesai</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {step === 2 ? (
            <>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900">Pilih Opsi Gathering</h2>
                <p className="text-xs text-slate-500">Pilih salah satu opsi berikut sesuai preferensi Anda.</p>
              </div>

              <div className="space-y-3">
                {options.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                      selectedOption === opt.id
                        ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="poll_option"
                        value={opt.id}
                        checked={selectedOption === opt.id}
                        onChange={() => setSelectedOption(opt.id)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-bold text-slate-800 text-sm">{opt.label}</span>
                    </div>
                    {/* Wadah ikon berlatar belakang agar terlihat kontras dan jelas */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border ${opt.bg} shadow-sm`}>
                      {opt.icon}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => router.push('/token')}
                  className="w-1/3 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl transition text-sm flex items-center justify-center space-x-1"
                >
                  <span>←</span>
                  <span>KEMBALI</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedOption}
                  className="w-2/3 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
                >
                  <span>LANJUT KE KONFIRMASI</span>
                  <span>→</span>
                </button>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-amber-800">
                <span>🔒</span>
                <div>
                  <p className="font-semibold">Anda hanya dapat memilih satu opsi.</p>
                  <p className="text-amber-700/80">Pastikan pilihan Anda sudah sesuai.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900">Konfirmasi Pilihan</h2>
                <p className="text-xs text-slate-500">Pastikan pilihan Anda sudah benar sebelum dikirim secara permanen.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-2">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pilihan Anda:</p>
                <p className="text-lg font-black text-blue-600">{selectedOption}</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="w-1/3 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl transition text-sm flex items-center justify-center space-x-1"
                >
                  <span>←</span>
                  <span>UBAH</span>
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={loading}
                  className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Mengirim...' : 'KIRIM PILIHAN'}</span>
                  <span>✓</span>
                </button>
              </div>

              <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-blue-800">
                <span>ℹ️</span>
                <p>Setelah dikirim, pilihan tidak dapat diubah kembali.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}