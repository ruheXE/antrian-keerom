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
  Sparkles,
  LayoutGrid,
  LogOut,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  KeyRound,
  X,
  ChevronDown
} from 'lucide-react';
import { SystemSettings, UserRole } from '../types';
import { playChime } from '../services/audioService';

export type ActiveTab = 'display' | 'kiosk' | 'operator' | 'queue-list' | 'requirements' | 'stats' | 'admin' | 'portal';

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
  
  // Role password protection state
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [rolePasswordInput, setRolePasswordInput] = useState('');
  const [rolePasswordError, setRolePasswordError] = useState(false);
  const [showRolePasswordModal, setShowRolePasswordModal] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);

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
    setShowRoleSelector(false);

    // If switching to portal, public/pendaftar, or kiosk: NO PASSWORD NEEDED
    if (newRole === 'portal' || newRole === 'public' || newRole === 'kiosk') {
      applyRoleChange(newRole);
      return;
    }

    // Check if role is already authenticated in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem(`dukcapil_auth_${newRole}`) === 'true') {
      applyRoleChange(newRole);
      return;
    }

    // Protected roles (admin, operator, kiosk, display) need password verification
    setPendingRole(newRole);
    setRolePasswordInput('');
    setRolePasswordError(false);
    setShowPasswordText(false);
    setShowRolePasswordModal(true);
  };

  const applyRoleChange = (role: UserRole) => {
    if (setUserRole) {
      setUserRole(role);
    }
    if (role === 'admin') {
      setActiveTab('admin');
    } else if (role === 'operator') {
      setActiveTab('operator');
    } else if (role === 'kiosk') {
      setActiveTab('kiosk');
    } else if (role === 'display') {
      setActiveTab('display');
    } else if (role === 'portal') {
      setActiveTab('portal');
    } else {
      setActiveTab('queue-list');
    }
  };

  const handleVerifyRolePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRole) return;

    let expected = '';
    let alternative = '';
    if (pendingRole === 'admin') {
      expected = (settings.adminPassword || 'admin123').toLowerCase();
      alternative = (settings.adminPin || '1234').toLowerCase();
    } else if (pendingRole === 'operator') {
      expected = (settings.operatorPassword || 'petugas123').toLowerCase();
    } else if (pendingRole === 'display') {
      expected = (settings.displayPassword || 'tv123').toLowerCase();
    }

    const input = rolePasswordInput.trim().toLowerCase();
    const isMatched = input === expected || (alternative && input === alternative);

    if (isMatched) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`dukcapil_auth_${pendingRole}`, 'true');
      }
      const targetRole = pendingRole;
      setShowRolePasswordModal(false);
      setPendingRole(null);
      setRolePasswordInput('');
      setRolePasswordError(false);
      applyRoleChange(targetRole);
    } else {
      setRolePasswordError(true);
    }
  };

  return (
    <header className="bg-[#08142c] text-white border-b border-blue-900/60 sticky top-0 z-40 shadow-lg">
      {/* Top Banner with Motto & Status - Navy & Amber Palette */}
      <div className="bg-[#050d1e] px-4 sm:px-6 py-2 text-xs border-b border-blue-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-bold tracking-wider uppercase text-slate-100 text-[11px]">Sistem Antrian Terpadu Disdukcapil Keerom</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400 font-medium text-[11px]">"Kwa Ne Sangkei - Bersatu untuk Maju"</span>
        </div>
        
        <div className="flex items-center gap-3 text-slate-300">
          {/* Waiting queue badge */}
          <div className="flex items-center gap-2 bg-[#0a1636] px-3 py-1 rounded-md text-[11px] border border-blue-900/50">
            <span className="text-slate-400">Antrian Menunggu:</span>
            <span className="font-bold text-amber-400 font-mono text-xs">{waitingCount}</span>
          </div>

          {/* Clock WIT */}
          <div className="flex items-center gap-1.5 font-mono text-amber-300 font-semibold bg-[#0a1636] px-3 py-1 rounded-md text-xs border border-blue-900/50">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentTime} WIT</span>
            <span className="text-slate-400 text-[10px] hidden md:inline font-sans">({currentDate})</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Identity */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => {
            if (userRole === 'admin') setActiveTab('admin');
            else if (userRole === 'operator') setActiveTab('operator');
            else if (userRole === 'kiosk') setActiveTab('kiosk');
            else if (userRole === 'display') setActiveTab('display');
            else setActiveTab('portal');
          }}
        >
          <KeeromLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight group-hover:text-amber-300 transition-colors">
                DISDUKCAPIL KAB. KEEROM
              </h1>
              <span className="hidden lg:inline text-[10px] uppercase font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                PROVINSI PAPUA
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
              Dinas Kependudukan dan Pencatatan Sipil • Layanan Prima & 100% Bebas Biaya (Gratis)
            </p>
          </div>
        </div>

        {/* Action controls & Role Selector */}
        <div className="flex items-center gap-2 relative">
          {/* Active Screen / Role Badge */}
          <div className="relative">
            <button
              id="role-selector-btn"
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              title="Pilih Akses Layar Terpisah"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                userRole === 'admin'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
                  : userRole === 'operator'
                  ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                  : userRole === 'kiosk'
                  ? 'bg-[#0f244f] text-amber-300 border-amber-400/50 hover:bg-[#143069]'
                  : userRole === 'display'
                  ? 'bg-[#0f244f] text-sky-300 border-sky-400/50 hover:bg-[#143069]'
                  : userRole === 'portal'
                  ? 'bg-[#0f244f] text-slate-200 border-blue-800 hover:bg-[#143069]'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {userRole === 'admin' ? (
                <ShieldCheck className="w-4 h-4 text-slate-950" />
              ) : userRole === 'operator' ? (
                <Headphones className="w-4 h-4 text-white" />
              ) : userRole === 'kiosk' ? (
                <Ticket className="w-4 h-4 text-amber-400" />
              ) : userRole === 'display' ? (
                <Tv className="w-4 h-4 text-sky-400" />
              ) : userRole === 'portal' ? (
                <LayoutGrid className="w-4 h-4 text-amber-400" />
              ) : (
                <UserCheck className="w-4 h-4 text-slate-300" />
              )}
              <span className="text-xs">
                {userRole === 'admin' 
                  ? 'Layar: Admin' 
                  : userRole === 'operator' 
                  ? 'Layar: Petugas Loket' 
                  : userRole === 'kiosk' 
                  ? 'Layar: Kiosk Tiket'
                  : userRole === 'display' 
                  ? 'Layar: Display TV'
                  : userRole === 'portal'
                  ? 'Portal Layar'
                  : 'Layar: Publik'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Role Dropdown */}
            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0a1633] border border-blue-800/80 rounded-xl p-2 shadow-xl z-50 animate-in fade-in text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider border-b border-blue-900/60 mb-1">
                  Pilih Layar & Hak Akses
                </div>

                <button
                  onClick={() => handleSelectRole('portal')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 font-medium transition ${
                    userRole === 'portal' ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-[#102450] text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-amber-400" />
                  <div>
                    <div>Portal Pemilihan Layar</div>
                    <div className="text-[10px] opacity-75">Tampilan awal semua perangkat</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectRole('admin')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 font-medium transition ${
                    userRole === 'admin' ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-[#102450] text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>Administrator</span>
                      <span className="flex items-center gap-1 text-[10px] bg-amber-400/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/20">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        <span>Kunci</span>
                      </span>
                    </div>
                    <div className="text-[10px] opacity-75">Pantau, Ubah & Cetak Laporan</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectRole('operator')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 font-medium transition ${
                    userRole === 'operator' ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-[#102450] text-slate-200'
                  }`}
                >
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>Petugas Loket</span>
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-400/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/20">
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Kunci</span>
                      </span>
                    </div>
                    <div className="text-[10px] opacity-75">Panggil & Layani Pemohon</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectRole('kiosk')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 font-medium transition ${
                    userRole === 'kiosk' ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-[#102450] text-slate-200'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>Kiosk Mandiri Warga</span>
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Bebas</span>
                      </span>
                    </div>
                    <div className="text-[10px] opacity-75">Layar Cetak Tiket (Bebas Password)</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectRole('display')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 font-medium transition ${
                    userRole === 'display' ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-[#102450] text-slate-200'
                  }`}
                >
                  <Tv className="w-4 h-4 text-sky-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>Display TV Ruang Tunggu</span>
                      <span className="flex items-center gap-1 text-[10px] bg-sky-400/10 text-sky-300 px-1.5 py-0.5 rounded border border-sky-400/20">
                        <Lock className="w-2.5 h-2.5 text-sky-400" />
                        <span>Kunci</span>
                      </span>
                    </div>
                    <div className="text-[10px] opacity-75">Monitor TV Utama & Per Loket</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectRole('public')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 font-medium transition ${
                    userRole === 'public' ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-[#102450] text-slate-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>Informasi Warga / Pendaftar</span>
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Bebas</span>
                      </span>
                    </div>
                    <div className="text-[10px] opacity-75">Akses Terbuka Tanpa Password</div>
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
              audioTesting
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-[#0f244f] hover:bg-[#143069] text-slate-200 border-blue-800/80'
            }`}
          >
            {settings.soundEnabled ? (
              <Volume2 className={`w-4 h-4 ${audioTesting ? 'text-slate-950' : 'text-amber-400'}`} />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
            <span className="hidden md:inline">Tes Bel</span>
          </button>

          {/* Settings button (Admin only or always available with PIN) */}
          {userRole === 'admin' && (
            <button
              id="open-settings-btn"
              onClick={onOpenSettings}
              title="Pengaturan Sistem"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#0f244f] hover:bg-[#143069] text-slate-200 border border-blue-800/80 transition"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Pengaturan</span>
            </button>
          )}

          {/* Switch Screen / Exit to Portal Button */}
          {userRole !== 'portal' && (
            <button
              onClick={() => handleSelectRole('portal')}
              title="Kembali ke Portal Pemilihan Layar"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#0a1636] hover:bg-[#0f2250] text-amber-300 border border-blue-800/80 transition"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ganti Layar</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar - Filtered strictly by role */}
      {userRole !== 'portal' && userRole !== 'kiosk' && userRole !== 'display' && (
        <div className="bg-[#050d1e] border-t border-blue-900/60 px-4 sm:px-6 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-2">
            {/* ADMIN ROLE TABS */}
            {userRole === 'admin' && (
              <>
                <button
                  id="nav-tab-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap border ${
                    activeTab === 'admin'
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'text-amber-300 hover:text-white bg-[#0a1636] hover:bg-[#0f2450] border-blue-900/80'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Panel Admin</span>
                </button>

                <button
                  id="nav-tab-stats"
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'stats'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Statistik & Laporan</span>
                </button>

                <button
                  id="nav-tab-queue-list"
                  onClick={() => setActiveTab('queue-list')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'queue-list'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <ListOrdered className="w-4 h-4 text-amber-400" />
                  <span>Daftar Antrian</span>
                </button>

                <button
                  id="nav-tab-operator"
                  onClick={() => setActiveTab('operator')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'operator'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <Headphones className="w-4 h-4 text-amber-400" />
                  <span>Konsol Petugas</span>
                </button>

                <button
                  id="nav-tab-display"
                  onClick={() => setActiveTab('display')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'display'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <Tv className="w-4 h-4 text-amber-400" />
                  <span>Display TV</span>
                </button>

                <button
                  id="nav-tab-kiosk"
                  onClick={() => setActiveTab('kiosk')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'kiosk'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>Kiosk Tiket</span>
                </button>
              </>
            )}

            {/* OPERATOR ROLE TABS */}
            {userRole === 'operator' && (
              <>
                <button
                  id="nav-tab-operator"
                  onClick={() => setActiveTab('operator')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap border ${
                    activeTab === 'operator'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'text-emerald-300 hover:text-white bg-emerald-950/40 border-emerald-500/30'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>Konsol Panggilan Loket</span>
                </button>

                <button
                  id="nav-tab-queue-list"
                  onClick={() => setActiveTab('queue-list')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'queue-list'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <ListOrdered className="w-4 h-4 text-amber-400" />
                  <span>Daftar Antrian Hari Ini</span>
                </button>

                <button
                  id="nav-tab-requirements"
                  onClick={() => setActiveTab('requirements')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'requirements'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Panduan Syarat Adminduk</span>
                </button>
              </>
            )}

            {/* PUBLIC ROLE TABS */}
            {userRole === 'public' && (
              <>
                <button
                  id="nav-tab-queue-list"
                  onClick={() => setActiveTab('queue-list')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'queue-list'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <ListOrdered className="w-4 h-4 text-amber-400" />
                  <span>Nomor Antrian Berjalan</span>
                </button>

                <button
                  id="nav-tab-requirements"
                  onClick={() => setActiveTab('requirements')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'requirements'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Syarat Kelengkapan Dokumen</span>
                </button>

                <button
                  id="nav-tab-kiosk"
                  onClick={() => setActiveTab('kiosk')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap border ${
                    activeTab === 'kiosk'
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a1636] border-transparent'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>Ambil Tiket Pelayanan</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Kiosk Mode Notice Banner */}
      {userRole === 'kiosk' && (
        <div className="bg-[#0b1f48] border-t border-amber-400/40 py-2 px-4 text-center">
          <div className="flex items-center justify-between max-w-7xl mx-auto text-xs text-amber-200">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-medium">Layar Kiosk Mandiri Warga Aktif • Sentuh Layar Untuk Mengambil Tiket</span>
            </span>
            <button
              onClick={() => handleSelectRole('portal')}
              className="text-[11px] bg-[#07132c] hover:bg-[#0e214d] px-3 py-1 rounded-md border border-amber-400/30 text-amber-300 font-medium transition"
            >
              Keluar Kiosk
            </button>
          </div>
        </div>
      )}

      {/* Display TV Mode Notice Banner */}
      {userRole === 'display' && (
        <div className="bg-[#0b1f48] border-t border-blue-800/80 py-2 px-4 text-center">
          <div className="flex items-center justify-between max-w-7xl mx-auto text-xs text-slate-200">
            <span className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-sky-400" />
              <span className="font-medium">Layar Monitor Display TV Ruang Tunggu Aktif</span>
            </span>
            <button
              onClick={() => handleSelectRole('portal')}
              className="text-[11px] bg-[#07132c] hover:bg-[#0e214d] px-3 py-1 rounded-md border border-blue-700/50 text-slate-200 font-medium transition"
            >
              Keluar Mode TV
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VERIFIKASI PASSWORD PERAN UNTUK GANTI PERAN */}
      {showRolePasswordModal && pendingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#0a1633] border border-blue-800 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/60 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg text-slate-950 font-bold ${
                  pendingRole === 'operator' ? 'bg-emerald-400' :
                  pendingRole === 'display' ? 'bg-sky-400' : 'bg-amber-400'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {pendingRole === 'admin'
                      ? 'Akses Administrator'
                      : pendingRole === 'operator'
                      ? 'Akses Petugas Loket'
                      : 'Akses Display TV'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Verifikasi Password Peran</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRolePasswordModal(false);
                  setPendingRole(null);
                  setRolePasswordInput('');
                  setRolePasswordError(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {pendingRole === 'admin'
                ? 'Masukkan Password atau PIN Administrator untuk beralih ke pusat kendali dan pengaturan sistem.'
                : pendingRole === 'operator'
                ? 'Masukkan Password Petugas Loket untuk membuka konsol pemanggilan antrian.'
                : 'Masukkan Password Display TV untuk mengaktifkan monitor digital ruang tunggu.'}
            </p>

            <form onSubmit={handleVerifyRolePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Masukkan Password Akses:
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    autoFocus
                    value={rolePasswordInput}
                    onChange={(e) => {
                      setRolePasswordInput(e.target.value);
                      if (rolePasswordError) setRolePasswordError(false);
                    }}
                    className={`w-full pl-4 pr-11 py-2.5 bg-[#050d1e] border rounded-lg text-center text-base font-mono tracking-wider text-white focus:outline-none focus:ring-1 ${
                      rolePasswordError 
                        ? 'border-rose-500 focus:ring-rose-400' 
                        : 'border-blue-900 focus:ring-amber-400'
                    }`}
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    title={showPasswordText ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {rolePasswordError ? (
                  <p className="text-xs text-rose-400 font-medium mt-1.5 text-center">
                    Password tidak sesuai. Silakan coba lagi!
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                    Password Bawaan: <span className="font-mono text-amber-400 font-semibold">
                      {pendingRole === 'admin'
                        ? `${settings.adminPassword || 'admin123'} (atau PIN ${settings.adminPin || '1234'})`
                        : pendingRole === 'operator'
                        ? (settings.operatorPassword || 'petugas123')
                        : (settings.displayPassword || 'tv123')}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRolePasswordModal(false);
                    setPendingRole(null);
                    setRolePasswordInput('');
                    setRolePasswordError(false);
                  }}
                  className="flex-1 py-2 rounded-lg border border-blue-900 text-xs font-medium text-slate-300 hover:bg-[#0e214d] transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-950" />
                  <span>Verifikasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
