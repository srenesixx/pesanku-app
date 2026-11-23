import { useState } from 'react';
import { ArrowLeft, Lock, Mail, UtensilsCrossed } from 'lucide-react';
import { authApi } from '../services/api.js';

export default function LoginPage({ onSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await authApi.login(email, password);
      onSuccess(session);
    } catch (err) {
      setError(err.message || 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center px-4 py-10">
      <div className="w-full max-w-md mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B5E54] hover:text-[#1F1915] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Halaman Pembeli
        </button>

        <div className="bg-white border border-[#E7DFD3] rounded-2xl p-7 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#C84B24] text-white flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F1915] leading-tight">Masuk Pemilik</h1>
              <p className="text-sm text-[#6B5E54]">Warung Nasi Ayam Mak Nyus — PesanKu</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-[#1F1915] mb-1.5">
                Email Pemilik
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B5E54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pemilik@maknyus.id"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7DFD3] bg-[#FAF7F2]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C84B24]/30 focus:border-[#C84B24]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-[#1F1915] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B5E54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7DFD3] bg-[#FAF7F2]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C84B24]/30 focus:border-[#C84B24]"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-sm text-rose-800"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C84B24] hover:bg-[#A93B19] disabled:opacity-60 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              {loading ? 'Memeriksa akun...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#E7DFD3] text-xs text-[#6B5E54] flex items-center justify-between gap-2">
            <span>Akun uji lokal:</span>
            <button
              type="button"
              onClick={() => {
                setEmail('pemilik@maknyus.id');
                setPassword('maknyus2026');
                setError('');
              }}
              className="font-semibold text-[#C84B24] hover:underline cursor-pointer"
            >
              Isi otomatis (pemilik@maknyus.id)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
