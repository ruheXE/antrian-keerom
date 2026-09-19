import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Headphones, 
  Ticket, 
  Tv, 
  Users, 
  ArrowRight, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  Sparkles, 
  Monitor, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  KeyRound,
  X
} from 'lucide-react';
import { UserRole, SystemSettings, CounterInfo } from '../types';
import { KeeromLogo } from './KeeromLogo';

interface RolePortalViewProps {
  onSelectRole: (role: UserRole, targetTab?: string, screen?: 'all' | number) => void;
  settings: SystemSettings;
  counters: CounterInfo[];
  waitingCount: number;
  totalToday: number;
}

interface AuthRoleModalConfig {
  role: UserRole;
  targetTab?: string;
  screen?: 'all' | number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  expectedPassword: string;
  expectedAlternative?: string;
  defaultHint: string;
  themeColor: 'amber' | 'emerald' | 'sky' | 'blue';
}

export const RolePortalView: React.FC<RolePortalViewProps> = ({
  onSelectRole,
  settings,
  counters,
  waitingCount,
  totalToday,
}) => {
  const [activeAuthModal, setActiveAuthModal] = useState<AuthRoleModalConfig | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [selectedOperatorCounter, setSelectedOperatorCounter] = useState<number>(1);
  const [selectedTvScreen, setSelectedTvScreen] = useState<'all' | number>('all');

  const requestRoleAccess = (config: AuthRoleModalConfig) => {
    // Check if role is already authenticated in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem(`dukcapil_auth_${config.role}`) === 'true') {
      onSelectRole(config.role, config.targetTab, config.screen);
      return;
    }
    setActiveAuthModal(config);
    setPasswordInput('');
    setPasswordError(false);
    setShowPasswordText(false);
  };

  const handleVerifyRolePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuthModal) return;

    const input = passwordInput.trim();
    const primaryMatch = input.toLowerCase() === activeAuthModal.expectedPassword.toLowerCase();
    const altMatch = activeAuthModal.expectedAlternative 
      ? input.toLowerCase() === activeAuthModal.expectedAlternative.toLowerCase() 
      : false;

    if (primaryMatch || altMatch) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`dukcapil_auth_${activeAuthModal.role}`, 'true');
      }
      const { role, targetTab, screen } = activeAuthModal;
      setActiveAuthModal(null);
      setPasswordInput('');
      setPasswordError(false);
      onSelectRole(role, targetTab, screen);
    } else {
      setPasswordError(true);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

  return (
    <div className="w-full min-h-[calc(100vh-130px)] bg-[#071126] text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Banner Selamat Datang */}
        <div className="bg-gradient-to-r from-[#0c1a38] via-[#102452] to-[#0c1a38] border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <KeeromLogo size="lg" />
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wider uppercase mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  PORTAL PEMILIHAN AKSES LAYAR TERPISAH
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Sistem Antrian Disdukcapil Kab. Keerom
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Silakan pilih mode layar sesuai perangkat yang digunakan. Setiap peran memiliki akses terisolasi untuk keamanan operasional pelayanan.
                </p>
              </div>
            </div>

            {/* Quick Live Stats */}
            <div className="flex items-center gap-4 bg-[#07132c] border border-blue-900 px-5 py-3.5 rounded-2xl shadow-inner">
              <div className="text-center pr-4 border-r border-blue-900">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Antrian Menunggu</div>
                <div className="text-2xl font-black text-amber-400 font-mono">{waitingCount}</div>
              </div>
              <div className="text-center pr-4 border-r border-blue-900">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Hari Ini</div>
                <div className="text-2xl font-black text-white font-mono">{totalToday}</div>
              </div>
              <div className="text-center">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Loket Buka</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {counters.filter(c => c.isOpen).length}/{counters.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Kartu Layar Terpisah */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Layar Kiosk Mandiri Warga (Bebas Akses / Tanpa Password) */}
          <div className="bg-[#0a1736] border-2 border-amber-400/50 hover:border-amber-400 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                  <Ticket className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-sm">
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bebas Akses (Pendaftar)</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition">
                  Layar Kiosk Tiket Mandiri
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Layar sentuh untuk warga di pintu masuk lobi. Dilengkapi pemilihan layanan, input NIK & No. HP SMS, dan cetak struk fisik otomatis.
                </p>
              </div>

              <div className="bg-[#07132c] p-3 rounded-xl border border-blue-900 text-xs space-y-1 text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Bebas Akses untuk Warga / Pendaftar
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  Mode Terkunci (Bebas tombol Admin)
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-blue-900/80 space-y-3">
              <button
                onClick={() => onSelectRole('kiosk', 'kiosk')}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition"
              >
                <span>Buka Layar Kiosk Tiket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[10px] text-emerald-400 font-semibold text-center truncate">
                ✓ Akses Bebas Tanpa Perlu Password
              </div>
            </div>
          </div>

          {/* 2. Layar Display TV Ruang Tunggu (Dilindungi Password) */}
          <div className="bg-[#0a1736] border-2 border-blue-800 hover:border-amber-400/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                  <Tv className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-sky-950/80 text-sky-300 border border-sky-800 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-sky-400" />
                  <span>Password: tv123</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition">
                  Layar Display TV Ruang Tunggu
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Layar khusus monitor TV di dinding ruang tunggu. Dilengkapi bel suara panggilan otomatis, riwayat panggilan, dan teks berjalan kedinasan.
                </p>
              </div>

              {/* Pilihan Layar TV */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-300">
                  Pilih Tampilan Monitor TV:
                </label>
                <select
                  value={selectedTvScreen}
                  onChange={(e) => setSelectedTvScreen(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#07132c] border border-blue-900 rounded-xl text-white text-xs font-semibold focus:ring-2 focus:ring-amber-400"
                >
                  <option value="all">📺 Monitor Utama Gabungan (Semua Loket)</option>
                  <option value="1">🖥️ Layar Khusus Loket 1 (KTP-el & IKD)</option>
                  <option value="2">🖥️ Layar Khusus Loket 2 (KK & Pindah)</option>
                  <option value="3">🖥️ Layar Khusus Loket 3 (Akta Catatan Sipil)</option>
                  <option value="4">🖥️ Layar Khusus Loket 4 (KIA & NIK)</option>
                  <option value="5">🖥️ Layar Khusus Loket 5 (Legalisir & Khusus)</option>
                </select>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-blue-900/80 space-y-3">
              <button
                onClick={() => requestRoleAccess({
                  role: 'display',
                  targetTab: 'display',
                  screen: selectedTvScreen,
                  title: 'Layar Display TV Ruang Tunggu',
                  subtitle: 'Otorisasi Monitor Digital Signage TV',
                  description: 'Masukkan password untuk mengaktifkan tampilan visual dan panggilan suara nomor antrian pada Smart TV ruang tunggu.',
                  badge: 'Display TV Signage',
                  expectedPassword: settings.displayPassword || 'tv123',
                  defaultHint: 'tv123',
                  themeColor: 'sky'
                })}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition"
              >
                <KeyRound className="w-4 h-4 text-white" />
                <span>Buka Layar Display TV</span>
              </button>
              <div className="text-[10px] text-slate-400 font-mono text-center truncate">
                Password Bawaan: <span className="text-amber-300 font-bold font-mono">tv123</span>
              </div>
            </div>
          </div>

          {/* 3. Layar Petugas Loket (Dilindungi Password) */}
          <div className="bg-[#0a1736] border-2 border-blue-800 hover:border-amber-400/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                  <Headphones className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Password: petugas123</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition">
                  Layar Konsol Petugas Loket
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Layar meja kerja petugas loket 1 - 5. Memanggil tiket berikutnya, panggil ulang, status layanan, dan pengalihan berkas antrian.
                </p>
              </div>

              {/* Pilihan Loket Petugas */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-300">
                  Pilih Meja Loket Tugas:
                </label>
                <select
                  value={selectedOperatorCounter}
                  onChange={(e) => setSelectedOperatorCounter(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#07132c] border border-blue-900 rounded-xl text-white text-xs font-semibold focus:ring-2 focus:ring-amber-400"
                >
                  {counters.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.officerName} ({c.serviceCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-blue-900/80 space-y-3">
              <button
                onClick={() => requestRoleAccess({
                  role: 'operator',
                  targetTab: 'operator',
                  title: 'Layar Konsol Petugas Loket',
                  subtitle: 'Otorisasi Meja Pelayanan Petugas',
                  description: 'Masukkan password petugas loket untuk mengakses meja kerja pemanggilan berkas dan verifikasi nomor antrian.',
                  badge: 'PC Petugas Loket',
                  expectedPassword: settings.operatorPassword || 'petugas123',
                  defaultHint: 'petugas123',
                  themeColor: 'emerald'
                })}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <KeyRound className="w-4 h-4 text-white" />
                <span>Masuk Konsol Petugas</span>
              </button>
              <div className="text-[10px] text-slate-400 font-mono text-center truncate">
                Password Bawaan: <span className="text-amber-300 font-bold font-mono">petugas123</span>
              </div>
            </div>
          </div>

          {/* 4. Layar Administrator (Dilindungi Password / PIN) */}
          <div className="bg-[#0a1736] border-2 border-amber-400/50 hover:border-amber-400 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 group-hover:scale-105 transition">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Password: admin123</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition">
                  Layar Panel Administrator
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Hak akses penuh untuk Kepala Dinas / Supervisor: pantau seluruh antrian real-time, ubah status tiket, buka/tutup loket, dan printout laporan resmi.
                </p>
              </div>

              <div className="bg-[#07132c] p-3 rounded-xl border border-blue-900 text-xs space-y-1 text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  Print Laporan Resmi Kedinasan
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  Ubah Password Seluruh Peran & Audio
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-blue-900/80 space-y-3">
              <button
                onClick={() => requestRoleAccess({
                  role: 'admin',
                  targetTab: 'admin',
                  title: 'Layar Panel Administrator',
                  subtitle: 'Otorisasi Kepala Dinas / Supervisor',
                  description: 'Masukkan PIN atau Password Administrator untuk hak akses penuh kelola kedinasan, rekap antrian, dan printout dokumen resmi.',
                  badge: 'Administrator',
                  expectedPassword: settings.adminPassword || 'admin123',
                  expectedAlternative: settings.adminPin || '1234',
                  defaultHint: 'admin123 (atau PIN 1234)',
                  themeColor: 'amber'
                })}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition"
              >
                <KeyRound className="w-4 h-4 text-slate-950" />
                <span>Masuk Layar Administrator</span>
              </button>
              <div className="text-[10px] text-slate-400 font-mono text-center truncate">
                Password Bawaan: <span className="text-amber-300 font-bold font-mono">admin123</span>
              </div>
            </div>
          </div>

          {/* 5. Layar Publik & Warga (PENDAFTAR - BEBAS AKSES TANPA PASSWORD) */}
          <div className="bg-[#0a1736] border-2 border-emerald-500/50 hover:border-emerald-400 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-700 flex items-center gap-1.5 shadow-sm">
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Bebas Akses (Tanpa Password)</span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition">
                    Layar Pendaftar & Warga
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Pendaftar
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Layar ramah ponsel bagi masyarakat/pendaftar untuk memantau giliran nomor antrian saat menunggu dan memeriksa syarat dokumen kependudukan.
                </p>
              </div>

              <div className="bg-[#07132c] p-3 rounded-xl border border-emerald-900/60 text-xs space-y-1 text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Terbuka untuk Umum / Warga Pendaftar
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Cek Nomor Antrian & Persyaratan Dokumen
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-blue-900/80 space-y-3">
              <button
                onClick={() => onSelectRole('public', 'queue-list')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <span>Buka Layar Pendaftar (Langsung)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[10px] text-emerald-400 font-semibold text-center truncate">
                ✓ Akses Bebas Tanpa Perlu Password
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: VERIFIKASI PASSWORD PERAN */}
      {activeAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0c1a38] border-2 border-amber-400 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl text-slate-950 font-bold ${
                  activeAuthModal.themeColor === 'emerald' ? 'bg-emerald-400' :
                  activeAuthModal.themeColor === 'sky' ? 'bg-sky-400' : 'bg-amber-400'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">{activeAuthModal.title}</h3>
                  <p className="text-[11px] text-slate-400">{activeAuthModal.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveAuthModal(null);
                  setPasswordInput('');
                  setPasswordError(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {activeAuthModal.description}
            </p>

            <form onSubmit={handleVerifyRolePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Masukkan Password Akses:
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(false);
                    }}
                    className={`w-full pl-4 pr-11 py-3 bg-[#060e20] border rounded-xl text-center text-lg font-mono tracking-wider text-white focus:outline-none focus:ring-2 ${
                      passwordError 
                        ? 'border-rose-500 focus:ring-rose-400' 
                        : 'border-blue-900 focus:ring-amber-400'
                    }`}
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    title={showPasswordText ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordError ? (
                  <p className="text-xs text-rose-400 font-bold mt-1.5 text-center">
                    Password tidak cocok. Silakan periksa kembali!
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                    Password Bawaan: <span className="font-mono text-amber-400 font-bold">{activeAuthModal.defaultHint}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAuthModal(null);
                    setPasswordInput('');
                    setPasswordError(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-blue-900 text-xs font-bold text-slate-300 hover:bg-[#07132c]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-950" />
                  <span>Verifikasi Masuk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-8 pt-5 border-t border-blue-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Dinas Kependudukan dan Pencatatan Sipil Kabupaten Keerom • Gedung Pelayanan Adminduk Terpadu • Papua
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span>Aplikasi dibuat oleh:</span>
          <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
            heraX
          </span>
          <a
            href="tel:082189585776"
            className="text-emerald-400 hover:text-emerald-300 font-mono font-bold hover:underline"
          >
            (082189585776)
          </a>
        </div>
      </footer>
    </div>
  );
};
