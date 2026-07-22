'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TokenPage() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const cleanToken = token.trim()

    if (!cleanToken) {
      setError('Silakan masukkan nomor token terlebih dahulu.')
      setLoading(false)
      return
    }

    // 1. CEK APAKAH INI TOKEN KHUSUS ADMIN (DIARAHKAN KE /admin)
    if (cleanToken === 'ADMIN2026') {
      sessionStorage.setItem('is_admin', 'true')
      router.push('/admin')
      return
    }

    // 2. CEK TOKEN PEMILIH DI DATABASE SUPABASE
    const { data: tokenData, error: fetchError } = await supabase
      .from('tokens')
      .select('*')
      .eq('token_code', cleanToken)
      .maybeSingle()

    if (fetchError || !tokenData) {
      setError('Nomor token tidak valid!')
      setLoading(false)
      return
    }

    if (tokenData.used_count >= tokenData.max_uses) {
      setError('Token ini sudah pernah digunakan sebelumnya!')
      setLoading(false)
      return
    }

    // 3. UPDATE STATUS TOKEN MENJADI TERPAKAI
    const { error: updateError } = await supabase
      .from('tokens')
      .update({ used_count: tokenData.used_count + 1 })
      .eq('id', tokenData.id)

    if (updateError) {
      setError('Terjadi kesalahan sistem. Coba lagi.')
      setLoading(false)
      return
    }

    // Simpan session pemilih dan alihkan ke halaman voting
    sessionStorage.setItem('has_token', 'true')
    sessionStorage.setItem('voted_token', cleanToken)
    router.push('/poll')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Tema Voting Pelindo */}
        <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h2 className="font-bold tracking-wide text-lg">VOTING GATHERING 2026</h2>
          </div>
          <div className="bg-gray-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 text-gray-200 border border-gray-700">
            <span>🔒</span> Aman & Anonim
          </div>
        </div>

        {/* Stepper Indikator */}
        <div className="px-6 pt-6 pb-2 border-b border-gray-100">
          <div className="flex justify-between items-center max-w-xs mx-auto text-xs font-semibold">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1 shadow-sm">1</div>
              <span className="text-blue-600">Masukan Token</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-4"></div>
            <div className="flex flex-col items-center text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mb-1">2</div>
              <span>Pilih Opsi</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-4"></div>
            <div className="flex flex-col items-center text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mb-1">3</div>
              <span>Konfirmasi</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-4"></div>
            <div className="flex flex-col items-center text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mb-1">4</div>
              <span>Selesai</span>
            </div>
          </div>
        </div>

        {/* Form Input */}
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Masukkan Token Anda</h1>
          <p className="text-sm text-gray-500 mb-6">Masukkan token yang Anda dapatkan pada kertas untuk mulai voting.</p>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyToken} className="space-y-6">
            <div>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Masukkan Token Anda"
                className="w-full py-4 px-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-center text-lg tracking-wider font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal placeholder:text-base transition"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition duration-200 disabled:opacity-50 text-base"
            >
              {loading ? 'Memeriksa Token...' : 'LANJUT →'}
            </button>
          </form>

          {/* Kotak Informasi Bawah */}
          <div className="mt-8 p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start gap-3 text-left">
            <span className="text-blue-600 text-lg mt-0.5">ℹ️</span>
            <div className="text-xs text-blue-900">
              <span className="font-semibold block mb-0.5">Pastikan token Anda dimasukkan dengan benar.</span>
              Token bersifat unik dan hanya dapat digunakan satu kali.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}