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
  LayoutGrid,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  KeyRound,
  X,
  ChevronDown,
  Download
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
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
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

    // Protected roles (admin, operator, display) need password verification
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

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'operator': return 'Petugas Loket';
      case 'kiosk': return 'Kiosk Mandiri';
      case 'display': return 'Display TV';
      case 'portal': return 'Portal';
      default: return 'Publik';
    }
  };

  return (
    <header className="bg-[#060e20] text-slate-100 border-b border-blue-900/40 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (Nav Links) — Zone 3 (Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark with insignia */}
        <button
          onClick={() => {
            if (userRole === 'admin') setActiveTab('admin');
            else if (userRole === 'operator') setActiveTab('operator');
            else if (userRole === 'kiosk') setActiveTab('kiosk');
            else if (userRole === 'display') setActiveTab('display');
            else setActiveTab('portal');
          }}
          className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg p-1"
        >
          <KeeromLogo size="sm" />
          <div className="leading-tight">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
              Disdukcapil Keerom
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-normal ml-2">
              · Sistem Antrian
            </span>
          </div>
        </button>

        {/* Zone 2: 4-6 Clean text navigation links with single-line labels */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-300">
          <button
            onClick={() => {
              if (setUserRole) setUserRole('portal');
              setActiveTab('portal');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'portal'
                ? 'text-amber-400 font-bold bg-amber-400/10'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Portal Layar
          </button>

          <button
            onClick={() => handleSelectRole('kiosk')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'kiosk'
                ? 'text-amber-400 font-bold bg-amber-400/10'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Kiosk Tiket
          </button>

          <button
            onClick={() => handleSelectRole('display')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'display'
                ? 'text-amber-400 font-bold bg-amber-400/10'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Display TV
          </button>

          <button
            onClick={() => handleSelectRole('operator')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'operator'
                ? 'text-amber-400 font-bold bg-amber-400/10'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Konsol Loket
          </button>

          <button
            onClick={() => handleSelectRole('admin')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'admin' || activeTab === 'stats'
                ? 'text-amber-400 font-bold bg-amber-400/10'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Admin Panel
          </button>

          <button
            onClick={() => {
              if (setUserRole) setUserRole('public');
              setActiveTab('queue-list');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'queue-list' || activeTab === 'requirements'
                ? 'text-amber-400 font-bold bg-amber-400/10'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Daftar Antrian
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Actions & Controls */}
        <div className="flex items-center gap-2">
          {/* Subtle Live Queue & WIT Clock */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium px-2.5 py-1 rounded-lg bg-[#0a1633] border border-blue-900/40">
            <span>Antrian:</span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">{waitingCount}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-200 tabular-nums">{currentTime} WIT</span>
          </div>

          {/* Audio Chime Test */}
          <button
            id="test-audio-chime-btn"
            onClick={handleTestAudio}
            title="Uji Suara Bel Panggilan"
            className="p-2 rounded-lg text-xs font-medium text-slate-300 hover:text-amber-400 hover:bg-[#0a1633] border border-blue-900/40 transition-colors"
          >
            {settings.soundEnabled ? (
              <Volume2 className={`w-4 h-4 ${audioTesting ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`} />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Admin Settings (if admin role) */}
          {userRole === 'admin' && (
            <button
              id="open-settings-btn"
              onClick={onOpenSettings}
              title="Pengaturan Sistem"
              className="p-2 rounded-lg text-xs font-medium text-slate-300 hover:text-amber-400 hover:bg-[#0a1633] border border-blue-900/40 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Screen Role Selector Menu */}
          <div className="relative">
            <button
              id="role-selector-btn"
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              title="Ganti Mode Layar Perangkat"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-[0.98] transition shadow-sm"
            >
              <span>{getRoleLabel(userRole)}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Role Dropdown */}
            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0a1633] border border-blue-800/80 rounded-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider border-b border-blue-900/60 mb-1">
                  Pilih Layar Perangkat
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
                    <div className="text-[10px] opacity-75">Navigasi utama seluruh perangkat</div>
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
                      <Lock className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="text-[10px] opacity-75">Pantau live & cetak laporan</div>
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
                      <Lock className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-[10px] opacity-75">Panggil & layani pemohon</div>
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
                      <Lock className="w-3 h-3 text-sky-400" />
                    </div>
                    <div className="text-[10px] opacity-75">Monitor TV & panggilan suara</div>
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
                      <Unlock className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-[10px] opacity-75">Layar ambil tiket tanpa password</div>
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
                      <span>Informasi Publik</span>
                      <Unlock className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-[10px] opacity-75">Tracking antrian & berkas</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Password Modal */}
      {showRolePasswordModal && pendingRole && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1633] border border-blue-800/80 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 relative">
            <button
              onClick={() => {
                setShowRolePasswordModal(false);
                setPendingRole(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Otorisasi Hak Akses {getRoleLabel(pendingRole)}
                </h3>
                <p className="text-xs text-slate-400">
                  Masukkan kata sandi atau PIN untuk membuka layar ini.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyRolePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kata Sandi / PIN:
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={rolePasswordInput}
                    onChange={(e) => {
                      setRolePasswordInput(e.target.value);
                      setRolePasswordError(false);
                    }}
                    autoFocus
                    placeholder={pendingRole === 'admin' ? 'admin123 / 1234' : pendingRole === 'operator' ? 'petugas123' : 'tv123'}
                    className={`w-full px-3.5 py-2.5 bg-[#050d1e] border rounded-xl text-white text-sm outline-none transition focus:ring-2 focus:ring-amber-400 ${
                      rolePasswordError ? 'border-rose-500 bg-rose-950/20' : 'border-blue-900/80'
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
                {rolePasswordError && (
                  <p className="text-xs text-rose-400 mt-1.5">
                    Kata sandi salah. Silakan coba kembali.
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Bawaan default:{' '}
                  <span className="font-mono text-amber-300 font-semibold">
                    {pendingRole === 'admin' ? 'admin123 (PIN: 1234)' : pendingRole === 'operator' ? 'petugas123' : 'tv123'}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setShowRolePasswordModal(false);
                    setPendingRole(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition"
                >
                  Verifikasi & Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
