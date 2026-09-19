import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Headphones, 
  Ticket, 
  Tv, 
  Users, 
  ArrowRight, 
  Lock, 
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

export const RolePortalView: React.FC<RolePortalViewProps> = ({
  onSelectRole,
  settings,
  counters,
  waitingCount,
  totalToday,
}) => {
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [selectedOperatorCounter, setSelectedOperatorCounter] = useState<number>(1);
  const [selectedTvScreen, setSelectedTvScreen] = useState<'all' | number>('all');

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings.adminPin || '1234';
    if (pinInput === correctPin) {
      setShowAdminPinModal(false);
      setPinInput('');
      setPinError(false);
      onSelectRole('admin', 'admin');
    } else {
      setPinError(true);
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
          {/* 1. Layar Kiosk Mandiri Warga */}
          <div className="bg-[#0a1736] border-2 border-amber-400/30 hover:border-amber-400 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                  <Ticket className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  Mesin Tiket
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
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  Mode Terkunci (Bebas tombol Admin)
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  Verifikasi Jalur Prioritas & SMS
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
              <div className="text-[10px] text-slate-400 font-mono text-center truncate" title={`${currentUrl}?role=kiosk`}>
                URL Perangkat: <span className="text-amber-300 font-bold">?role=kiosk</span>
              </div>
            </div>
          </div>

          {/* 2. Layar Display TV Ruang Tunggu */}
          <div className="bg-[#0a1736] border-2 border-blue-800 hover:border-amber-400/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                  <Tv className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-blue-900/60 text-blue-300 border border-blue-800">
                  Smart TV Ruang Tunggu
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
                onClick={() => onSelectRole('display', 'display', selectedTvScreen)}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition"
              >
                <span>Buka Layar Display TV</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[10px] text-slate-400 font-mono text-center truncate">
                URL Perangkat: <span className="text-amber-300 font-bold">?role=display{selectedTvScreen !== 'all' ? `&screen=${selectedTvScreen}` : ''}</span>
              </div>
            </div>
          </div>

          {/* 3. Layar Petugas Loket (Operator Console) */}
          <div className="bg-[#0a1736] border-2 border-blue-800 hover:border-amber-400/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                  <Headphones className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                  PC Petugas
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
                onClick={() => onSelectRole('operator', 'operator')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <span>Masuk Konsol Petugas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[10px] text-slate-400 font-mono text-center truncate">
                URL Perangkat: <span className="text-amber-300 font-bold">?role=operator</span>
              </div>
            </div>
          </div>

          {/* 4. Layar Administrator (Dilindungi PIN) */}
          <div className="bg-[#0a1736] border-2 border-amber-400/50 hover:border-amber-400 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 group-hover:scale-105 transition">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Terproteksi PIN
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
                  Edit Tiket & Pengaturan Suara / SMS
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-blue-900/80 space-y-3">
              <button
                onClick={() => setShowAdminPinModal(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition"
              >
                <KeyRound className="w-4 h-4 text-slate-950" />
                <span>Masuk Layar Administrator</span>
              </button>
              <div className="text-[10px] text-slate-400 font-mono text-center truncate">
                PIN Bawaan: <span className="text-amber-300 font-bold font-mono">1234</span>
              </div>
            </div>
          </div>

          {/* 5. Layar Publik & Warga (Cek Antrian & Syarat) */}
          <div className="bg-[#0a1736] border-2 border-blue-800 hover:border-amber-400/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group relative">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800">
                  Publik / Warga
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition">
                  Layar Informasi Publik & Warga
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Layar ramah ponsel bagi masyarakat untuk memeriksa status antrian berjalan saat menunggu atau membaca syarat kelengkapan berkas Adminduk.
                </p>
              </div>

              <div className="bg-[#07132c] p-3 rounded-xl border border-blue-900 text-xs space-y-1 text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  Cek Nomor Antrian Berjalan
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  Katalog Syarat KTP, KK, Akta, KIA, IKD
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-blue-900/80 space-y-3">
              <button
                onClick={() => onSelectRole('public', 'queue-list')}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-sm flex items-center justify-center gap-2 border border-blue-800 transition"
              >
                <span>Buka Layar Informasi Warga</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[10px] text-slate-400 font-mono text-center truncate">
                URL Perangkat: <span className="text-amber-300 font-bold">?role=public</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: VERIFIKASI PIN ADMIN */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0c1a38] border-2 border-amber-400 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Verifikasi PIN Admin</h3>
                  <p className="text-[11px] text-slate-400">Hak akses khusus Administrator</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminPinModal(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminAccess} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Masukkan PIN Keamanan Admin:
                </label>
                <input
                  type="password"
                  maxLength={10}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(false);
                  }}
                  className={`w-full px-4 py-3 bg-[#060e20] border rounded-xl text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    pinError ? 'border-rose-500' : 'border-blue-900'
                  }`}
                  placeholder="••••"
                />
                {pinError ? (
                  <p className="text-xs text-rose-400 font-bold mt-1.5 text-center">
                    PIN tidak cocok. Silakan coba lagi.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                    PIN Bawaan Sistem: <span className="font-mono text-amber-400 font-bold">1234</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPinModal(false);
                    setPinInput('');
                    setPinError(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-blue-900 text-xs font-bold text-slate-300 hover:bg-[#07132c]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20"
                >
                  Konfirmasi Masuk
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
