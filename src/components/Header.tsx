import React, { useState, useEffect } from 'react';
import { KeeromLogo } from './KeeromLogo';
import { 
  Tv, 
  Ticket, 
  Headphones, 
  ListOrdered, 
  FileText, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  Settings, 
  Clock,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { SystemSettings, UserRole } from '../types';
import { playChime } from '../services/audioService';

export type ActiveTab = 'display' | 'kiosk' | 'operator' | 'queue-list' | 'requirements' | 'stats' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: SystemSettings;
  onOpenSettings: () => void;
  waitingCount: number;
  userRole?: UserRole;
  setUserRole?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenSettings,
  waitingCount,
  userRole = 'admin',
  setUserRole
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [audioTesting, setAudioTesting] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format with WIT (Keerom / Papua timezone)
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTestAudio = async () => {
    if (audioTesting) return;
    setAudioTesting(true);
    await playChime(settings.chimeVolume);
    setTimeout(() => setAudioTesting(false), 800);
  };

  const handleSelectRole = (newRole: UserRole) => {
    if (setUserRole) {
      setUserRole(newRole);
    }
    setShowRoleSelector(false);
    if (newRole === 'admin') {
      setActiveTab('admin');
    } else if (newRole === 'operator') {
      setActiveTab('operator');
    } else {
      setActiveTab('display');
    }
  };

  return (
    <header className="bg-[#0a1633] text-white border-b border-blue-900 sticky top-0 z-40 shadow-xl">
      {/* Top Banner with Motto & Status - Navy & Yellow Palette */}
      <div className="bg-gradient-to-r from-[#060e20] via-[#0e1f44] to-[#060e20] px-4 py-1.5 text-xs border-b border-amber-400/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-300">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400" />
          <span className="font-extrabold tracking-wide uppercase text-white">SISTEM ANTRIAN TERPADU DISDUKCAPIL KEEROM</span>
          <span className="hidden sm:inline text-amber-400/70">•</span>
          <span className="hidden sm:inline italic text-amber-300 font-medium">"Kwa Ne Sangkei - Bersatu untuk Maju"</span>
        </div>
        
        <div className="flex items-center gap-3 text-slate-300">
          {/* Waiting queue badge */}
          <div className="flex items-center gap-1.5 bg-[#07132c] px-2.5 py-0.5 rounded-full text-[11px] border border-blue-900">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300">Antrian Menunggu:</span>
            <span className="font-bold text-amber-400 font-mono">{waitingCount} orang</span>
          </div>

          {/* Clock WIT */}
          <div className="flex items-center gap-1.5 font-mono text-amber-300 font-extrabold bg-[#050b18] px-2.5 py-0.5 rounded-md border border-blue-900">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentTime} WIT</span>
            <span className="text-slate-400 text-[10px] hidden md:inline">({currentDate})</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('display')}>
          <KeeromLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white leading-tight">
                DISDUKCAPIL KAB. KEEROM
              </h1>
              <span className="hidden lg:inline text-[10px] uppercase font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-xs">
                PROVINSI PAPUA
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              Dinas Kependudukan dan Pencatatan Sipil • Layanan Prima & 100% Bebas Biaya (Gratis)
            </p>
          </div>
        </div>

        {/* Action controls & Role Selector */}
        <div className="flex items-center gap-2 relative">
          {/* Role selector badge */}
          <div className="relative">
            <button
              id="role-selector-btn"
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              title="Ganti Peran Akses Sistem"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition border shadow-xs ${
                userRole === 'admin'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20'
                  : userRole === 'operator'
                  ? 'bg-blue-900 text-amber-300 border-amber-400/40'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {userRole === 'admin' ? (
                <ShieldCheck className="w-4 h-4 text-slate-950" />
              ) : userRole === 'operator' ? (
                <Headphones className="w-4 h-4 text-amber-400" />
              ) : (
                <UserCheck className="w-4 h-4 text-slate-300" />
              )}
              <span className="uppercase text-[11px]">
                {userRole === 'admin' ? 'Role: Admin' : userRole === 'operator' ? 'Role: Petugas' : 'Role: Publik'}
              </span>
            </button>

            {/* Role Dropdown */}
            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-52 bg-[#0c1a38] border-2 border-amber-400/80 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in text-xs">
                <div className="text-[10px] uppercase font-bold text-amber-400 px-2 py-1 tracking-wider border-b border-blue-900/60 mb-1">
                  PILIH HAK AKSES PENGGUNA
                </div>

                <button
                  onClick={() => handleSelectRole('admin')}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 font-bold transition ${
                    userRole === 'admin' ? 'bg-amber-400 text-slate-950' : 'hover:bg-blue-900 text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <div>
                    <div>Administrator</div>
                    <div className="text-[10px] font-normal opacity-80">Pantau, Ubah & Cetak Laporan</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectRole('operator')}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 font-bold transition ${
                    userRole === 'operator' ? 'bg-amber-400 text-slate-950' : 'hover:bg-blue-900 text-slate-200'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <div>
                    <div>Petugas Loket</div>
                    <div className="text-[10px] font-normal opacity-80">Panggil & Layani Pemohon</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectRole('public')}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 font-bold transition ${
                    userRole === 'public' ? 'bg-amber-400 text-slate-950' : 'hover:bg-blue-900 text-slate-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <div>
                    <div>Masyarakat / Publik</div>
                    <div className="text-[10px] font-normal opacity-80">Ambil Tiket & Lihat Display TV</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Audio Test button */}
          <button
            id="test-audio-chime-btn"
            onClick={handleTestAudio}
            title="Uji Suara Bel Panggilan"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              audioTesting
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : 'bg-[#0e214d] hover:bg-[#12285a] text-slate-200 border-blue-900'
            }`}
          >
            {settings.soundEnabled ? (
              <Volume2 className={`w-4 h-4 ${audioTesting ? 'animate-bounce text-slate-950' : 'text-amber-400'}`} />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
            <span className="hidden md:inline">Tes Bel</span>
          </button>

          {/* Settings button */}
          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            title="Pengaturan Sistem"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#0e214d] hover:bg-[#12285a] text-slate-200 border border-blue-900 transition"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar in Navy & Yellow */}
      <div className="bg-[#060e20] border-t border-blue-900/80 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-1.5">
          {/* Admin Dedicated Tab */}
          <button
            id="nav-tab-admin"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition whitespace-nowrap border ${
              activeTab === 'admin'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20 ring-1 ring-amber-400'
                : 'text-amber-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/80 border-amber-400/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>PANEL ADMIN (PANTAU, UBAH, LAPORAN)</span>
          </button>

          <button
            id="nav-tab-display"
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'display'
                ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span>Display TV Ruang Tunggu</span>
          </button>

          <button
            id="nav-tab-kiosk"
            onClick={() => setActiveTab('kiosk')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'kiosk'
                ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Ticket className="w-4 h-4 text-amber-400" />
            <span>Kios Ambil Tiket</span>
          </button>

          <button
            id="nav-tab-operator"
            onClick={() => setActiveTab('operator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'operator'
                ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Headphones className="w-4 h-4 text-amber-400" />
            <span>Konsol Petugas Loket</span>
          </button>

          <button
            id="nav-tab-queue-list"
            onClick={() => setActiveTab('queue-list')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'queue-list'
                ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <span>Daftar Antrian</span>
          </button>

          <button
            id="nav-tab-requirements"
            onClick={() => setActiveTab('requirements')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'requirements'
                ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Syarat Adminduk</span>
          </button>

          <button
            id="nav-tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Statistik & Laporan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
