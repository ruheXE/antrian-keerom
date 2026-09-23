import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Headphones, 
  Ticket, 
  Tv, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Clock, 
  CheckCircle2, 
  KeyRound, 
  X,
  UserCheck
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
  expectedPassword: string;
  expectedAlternative?: string;
  defaultHint: string;
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

    const input = passwordInput.trim().toLowerCase();
    const primaryMatch = input === activeAuthModal.expectedPassword.toLowerCase();
    const altMatch = activeAuthModal.expectedAlternative 
      ? input === activeAuthModal.expectedAlternative.toLowerCase() 
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

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#060d1e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Editorial Civic Hero Section */}
        <div className="border border-blue-900/40 bg-[#0a1633]/60 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-5">
              <KeeromLogo size="lg" className="shrink-0" />
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1">
                  <span>Kabupaten Keerom</span>
                  <span aria-hidden="true">·</span>
                  <span>Provinsi Papua</span>
                  <span aria-hidden="true">·</span>
                  <span className="italic text-slate-400">"Tamne Yisan Kefase"</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight [text-wrap:balance]">
                  Pusat Kendali Sistem Antrian Pelayanan Adminduk
                </h1>
                <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                  Pilih mode layar operasional sesuai perangkat. Setiap modul terisolasi untuk menjamin kestabilan dan keamanan alur layanan warga.
                </p>
              </div>
            </div>

            {/* Quiet Real-Time Metric Strip with Tabular Numerals */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 bg-[#060e20] border border-blue-900/50 px-5 py-3.5 rounded-2xl shrink-0">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Antrian Menunggu</div>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums mt-0.5">
                  {waitingCount}
                </div>
              </div>
              <div className="border-l border-blue-900/60 pl-3 sm:pl-6">
                <div className="text-[11px] text-slate-400 font-medium">Total Hari Ini</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums mt-0.5">
                  {totalToday}
                </div>
              </div>
              <div className="border-l border-blue-900/60 pl-3 sm:pl-6">
                <div className="text-[11px] text-slate-400 font-medium">Loket Pelayanan</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                  {counters.filter(c => c.isOpen).length}/{counters.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Screen Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Kiosk Mandiri Warga */}
          <div className="bg-[#0a1633]/80 border border-blue-900/50 hover:border-amber-400/60 rounded-2xl p-6 flex flex-col justify-between transition group shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Bebas Sandi</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Kiosk Mandiri Warga
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Layar Sentuh Lobi</span>
                  <span aria-hidden="true">·</span>
                  <span>Cetak Struk Fisik</span>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  Layar sentuh anjungan di lobi kantor. Warga memilih jenis berkas, opsi prioritas, dan mencetak tiket antrian.
                </p>
              </div>

              <div className="text-xs text-slate-400 space-y-1 bg-[#060e20] p-3 rounded-xl border border-blue-900/40">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Bebas biaya pelayanan (100% Gratis)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Notifikasi SMS pengingat warga terintegrasi</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-blue-900/50">
              <button
                id="portal-btn-kiosk"
                onClick={() => onSelectRole('kiosk', 'kiosk')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <span>Buka Layar Kiosk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Display TV Ruang Tunggu */}
          <div className="bg-[#0a1633]/80 border border-blue-900/50 hover:border-amber-400/60 rounded-2xl p-6 flex flex-col justify-between transition group shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-sky-400/10 border border-sky-400/20 text-sky-400 flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-mono">tv123</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Display TV Ruang Tunggu
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Signage TV Utama</span>
                  <span aria-hidden="true">·</span>
                  <span>Audio Bel Panggilan</span>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  Monitor TV ruang tunggu warga dengan panggilan suara otomatis, riwayat panggil per loket, dan running text.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Target Tampilan TV:
                </label>
                <select
                  value={selectedTvScreen}
                  onChange={(e) => setSelectedTvScreen(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#060e20] border border-blue-900/60 rounded-xl text-white text-xs outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="all">Semua Loket (Monitor Utama Gabungan)</option>
                  <option value="1">Layar Khusus Loket 1 (KTP-el & IKD)</option>
                  <option value="2">Layar Khusus Loket 2 (KK & Pindah)</option>
                  <option value="3">Layar Khusus Loket 3 (Akta Catatan Sipil)</option>
                  <option value="4">Layar Khusus Loket 4 (KIA & Validasi NIK)</option>
                  <option value="5">Layar Khusus Loket 5 (Pengaduan & Khusus)</option>
                </select>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-blue-900/50">
              <button
                id="portal-btn-display"
                onClick={() => requestRoleAccess({
                  role: 'display',
                  targetTab: 'display',
                  screen: selectedTvScreen,
                  title: 'Display TV Ruang Tunggu',
                  subtitle: 'Otorisasi Digital Signage',
                  description: 'Masukkan kata sandi untuk mengaktifkan tampilan visual dan pengeras suara pada Smart TV ruang tunggu.',
                  expectedPassword: settings.displayPassword || 'tv123',
                  defaultHint: 'tv123'
                })}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <KeyRound className="w-4 h-4" />
                <span>Buka Layar Display TV</span>
              </button>
            </div>
          </div>

          {/* Card 3: Konsol Petugas Loket */}
          <div className="bg-[#0a1633]/80 border border-blue-900/50 hover:border-amber-400/60 rounded-2xl p-6 flex flex-col justify-between transition group shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono">petugas123</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Konsol Petugas Loket
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Meja Pelayanan 1-5</span>
                  <span aria-hidden="true">·</span>
                  <span>Panggilan & Alih Berkas</span>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  Meja kerja operator loket untuk memanggil pemohon berikutnya, panggil ulang suara, mencatat status, atau alih loket.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-400">
                  Pilih Meja Loket:
                </label>
                <select
                  value={selectedOperatorCounter}
                  onChange={(e) => setSelectedOperatorCounter(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#060e20] border border-blue-900/60 rounded-xl text-white text-xs outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {counters.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.officerName} ({c.serviceCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-blue-900/50">
              <button
                id="portal-btn-operator"
                onClick={() => requestRoleAccess({
                  role: 'operator',
                  targetTab: 'operator',
                  title: 'Konsol Petugas Loket',
                  subtitle: 'Otorisasi Meja Pelayanan',
                  description: 'Masukkan kata sandi petugas loket untuk mengakses meja kerja pelayanan dan pemanggilan warga.',
                  expectedPassword: settings.operatorPassword || 'petugas123',
                  defaultHint: 'petugas123'
                })}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <KeyRound className="w-4 h-4" />
                <span>Masuk Konsol Petugas</span>
              </button>
            </div>
          </div>

          {/* Card 4: Administrator Panel */}
          <div className="bg-[#0a1633]/80 border border-blue-900/50 hover:border-amber-400/60 rounded-2xl p-6 flex flex-col justify-between transition group shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono">admin123 / 1234</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Administrator & Arsip Data
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Pantau Live</span>
                  <span aria-hidden="true">·</span>
                  <span>Ubah Data & Ekspor</span>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  Pusat kendali eksekutif: pantau antrian live, input manual, edit data, ekspor cadangan CSV/JSON, dan cetak laporan resmi ber-kop.
                </p>
              </div>

              <div className="text-xs text-slate-400 space-y-1 bg-[#060e20] p-3 rounded-xl border border-blue-900/40">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Cadangan lokal JSON & CSV UTF-8 Excel</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Konfigurasi loket, SMS & parameter suara</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-blue-900/50">
              <button
                id="portal-btn-admin"
                onClick={() => requestRoleAccess({
                  role: 'admin',
                  targetTab: 'admin',
                  title: 'Pusat Kontrol Administrator',
                  subtitle: 'Otorisasi Penuh Sistem',
                  description: 'Masukkan kata sandi atau PIN admin untuk mengelola database antrian, loket, dan pencetakan laporan dinas.',
                  expectedPassword: settings.adminPassword || 'admin123',
                  expectedAlternative: settings.adminPin || '1234',
                  defaultHint: 'admin123 / 1234'
                })}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <KeyRound className="w-4 h-4" />
                <span>Masuk Panel Administrator</span>
              </button>
            </div>
          </div>

          {/* Card 5: Informasi Publik & Pendaftar */}
          <div className="bg-[#0a1633]/80 border border-blue-900/50 hover:border-amber-400/60 rounded-2xl p-6 flex flex-col justify-between transition group shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Bebas Akses</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Informasi Warga & Persyaratan
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Tracking Tiket</span>
                  <span aria-hidden="true">·</span>
                  <span>Persyaratan Berkas</span>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  Layanan terbuka bagi warga untuk melacak status nomor tiket antrian secara real-time serta memeriksa persyaratan resmi berkas kependudukan.
                </p>
              </div>

              <div className="text-xs text-slate-400 space-y-1 bg-[#060e20] p-3 rounded-xl border border-blue-900/40">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Pencarian nomor antrian dan waktu tunggu</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Syarat berkas KTP-el, KK, KIA & Akta Capil</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-blue-900/50">
              <button
                id="portal-btn-public"
                onClick={() => onSelectRole('public', 'queue-list')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] border border-slate-700"
              >
                <span>Buka Informasi Publik</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Technical Specs & Offline Capability Card */}
          <div className="bg-[#060e20] border border-blue-900/40 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Spesifikasi & Keandalan
              </div>
              <h2 className="text-base font-bold text-white">
                Operasional Mandiri Offline / LAN
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dirancang khusus untuk keandalan jaringan perkantoran di Kabupaten Keerom. Sistem menyimpan data antrian secara otomatis di komputer lokal tanpa ketergantungan server awan.
              </p>

              <div className="pt-2 text-xs text-slate-400 space-y-1.5 font-mono">
                <div>• Format Cadangan: JSON & CSV Tabular</div>
                <div>• Format Suara: Web Speech API & Polyphonic Chime</div>
                <div>• Format Cetak: Struk Termal 58mm/80mm & PDF Resmi</div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-blue-900/40 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Kabupaten Keerom, Papua</span>
              <span className="font-semibold text-slate-300">v2.5.0</span>
            </div>
          </div>

        </div>

      </div>

      {/* Role Authorization Modal */}
      {activeAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1633] border border-blue-800/80 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveAuthModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {activeAuthModal.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeAuthModal.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed bg-[#060e20] p-3 rounded-xl border border-blue-900/40">
              {activeAuthModal.description}
            </p>

            <form onSubmit={handleVerifyRolePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Masukkan Kata Sandi / PIN:
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(false);
                    }}
                    autoFocus
                    placeholder={`Bawaan: ${activeAuthModal.defaultHint}`}
                    className={`w-full px-3.5 py-2.5 bg-[#050d1e] border rounded-xl text-white text-sm outline-none transition focus:ring-2 focus:ring-amber-400 ${
                      passwordError ? 'border-rose-500 bg-rose-950/20' : 'border-blue-900/80'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-rose-400 mt-1.5">
                    Kata sandi salah. Silakan periksa kembali.
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Kata sandi default:{' '}
                  <span className="font-mono text-amber-300 font-semibold">
                    {activeAuthModal.defaultHint}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={() => setActiveAuthModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition active:scale-[0.98]"
                >
                  Buka Layar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
