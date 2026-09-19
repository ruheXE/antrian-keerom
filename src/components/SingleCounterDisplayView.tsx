import React, { useState, useEffect } from 'react';
import { Ticket, CounterInfo, SystemSettings } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  Maximize, 
  Minimize, 
  Users, 
  Clock, 
  Sparkles, 
  Megaphone, 
  ExternalLink,
  Phone,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { KeeromLogo } from './KeeromLogo';

interface SingleCounterDisplayViewProps {
  counterId: number;
  tickets: Ticket[];
  counters: CounterInfo[];
  settings: SystemSettings;
  activeCallingTicket: Ticket | null;
  onSelectCounter: (id: number | 'all') => void;
  onOpenPopout?: (id: number) => void;
}

export const SingleCounterDisplayView: React.FC<SingleCounterDisplayViewProps> = ({
  counterId,
  tickets,
  counters,
  settings,
  activeCallingTicket,
  onSelectCounter,
  onOpenPopout
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const counter = counters.find(c => c.id === counterId) || counters[0];
  const service = SERVICES_DATA.find(s => s.code === counter.serviceCode) || SERVICES_DATA[0];

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
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // Current active ticket for this counter
  const isThisCounterCalling = activeCallingTicket && (
    activeCallingTicket.counterAssigned === counter.id || 
    activeCallingTicket.serviceCode === counter.serviceCode
  );

  const activeTicket = (isThisCounterCalling ? activeCallingTicket : null) ||
    tickets.find(t => t.id === counter.currentTicketId) ||
    tickets.find(t => (t.counterAssigned === counter.id || t.serviceCode === counter.serviceCode) && t.status === 'DIPANGGIL') ||
    tickets.find(t => (t.counterAssigned === counter.id || t.serviceCode === counter.serviceCode) && t.status === 'SEDANG_DILAYANI') ||
    null;

  // Waiting tickets in queue for this counter
  const waitingTickets = tickets.filter(
    t => t.serviceCode === counter.serviceCode && t.status === 'MENUNGGU'
  );

  // Finished tickets today for this counter
  const finishedTickets = tickets.filter(
    t => (t.counterAssigned === counter.id || t.serviceCode === counter.serviceCode) && t.status === 'SELESAI'
  );

  return (
    <div className="w-full min-h-[calc(100vh-130px)] bg-[#071126] text-white flex flex-col justify-between select-none">
      {/* Top Display Switcher Bar */}
      <div className="bg-[#0c1a38] border-b border-blue-900/60 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Switcher tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            id="switch-display-all"
            onClick={() => onSelectCounter('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
          >
            <span>📺 Layar Utama (Semua)</span>
          </button>

          {counters.map(c => {
            const isSelected = c.id === counterId;
            return (
              <button
                key={c.id}
                id={`switch-display-counter-${c.id}`}
                onClick={() => onSelectCounter(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                    : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {c.serviceCode}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {onOpenPopout && (
            <button
              id={`popout-display-${counterId}`}
              onClick={() => onOpenPopout(counterId)}
              title="Buka display loket ini di tab/jendela baru untuk monitor terpisah"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-950 hover:bg-blue-900 text-amber-300 border border-amber-400/30 transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Buka Layar Terpisah ↗</span>
            </button>
          )}

          <button
            id="toggle-counter-fullscreen"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5 text-amber-400" />
                <span>Normal</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 text-amber-400" />
                <span>Layar Penuh TV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Overhead Screen Body */}
      <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1600px] mx-auto w-full flex flex-col justify-between gap-6">
        {/* Counter Overhead Header Header */}
        <div className="bg-gradient-to-r from-[#0d1d40] via-[#102452] to-[#0d1d40] rounded-3xl p-5 sm:p-7 border-2 border-amber-400/60 shadow-2xl shadow-blue-950/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <KeeromLogo size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                  DISDUKCAPIL KABUPATEN KEEROM
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">• Layar Display Loket Resmi</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
                <span className="text-amber-400">{counter.name.toUpperCase()}</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="text-slate-100">{service.name}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {service.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 bg-[#07132c]/90 px-5 py-3 rounded-2xl border border-blue-900/60">
            {/* Officer info */}
            <div className="text-right">
              <div className="text-[11px] uppercase text-slate-400 font-bold tracking-wider flex items-center justify-end gap-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Petugas Loket:</span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white">
                {counter.officerName}
              </div>
              <div className="text-[11px] text-amber-400 font-semibold flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${counter.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>{counter.isOpen ? 'LOKET AKTIF MELAYANI' : 'LOKET TUTUP'}</span>
              </div>
            </div>

            {/* Clock */}
            <div className="hidden sm:block border-l border-blue-900/80 pl-5 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Waktu Indonesia Timur</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">
                {currentTime} <span className="text-xs font-bold text-slate-300">WIT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Grid: Giant Calling Spotlight & Next Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
          {/* Main Giant Call Card (8 cols) */}
          <div className={`lg:col-span-8 rounded-3xl p-6 sm:p-10 border-2 transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden relative ${
            isThisCounterCalling || activeTicket?.status === 'DIPANGGIL'
              ? 'bg-gradient-to-br from-[#12285a] via-[#0e1f47] to-[#152a5c] border-amber-400 ring-4 ring-amber-400/30 shadow-amber-400/20'
              : 'bg-[#0a1736] border-blue-900/80'
          }`}>
            {/* Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top status indicator */}
            <div className="flex items-center justify-between border-b border-blue-900/70 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-2 ${
                  activeTicket?.status === 'DIPANGGIL'
                    ? 'bg-amber-400 text-slate-950 animate-bounce shadow-lg shadow-amber-400/40'
                    : activeTicket?.status === 'SEDANG_DILAYANI'
                    ? 'bg-blue-900/80 text-amber-300 border border-amber-400/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <Megaphone className="w-4 h-4" />
                  <span>
                    {activeTicket?.status === 'DIPANGGIL'
                      ? 'NOMOR SEDANG DIPANGGIL'
                      : activeTicket?.status === 'SEDANG_DILAYANI'
                      ? 'SEDANG DILAYANI DI LOKET INI'
                      : 'MENUNGGU PANGGILAN'}
                  </span>
                </div>

                {activeTicket?.queueType === 'PRIORITAS' && (
                  <span className="flex items-center gap-1.5 text-xs font-black bg-amber-400/20 text-amber-300 px-3.5 py-1.5 rounded-full border border-amber-400/50">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    JALUR PRIORITAS KHUSUS
                  </span>
                )}
              </div>

              {activeTicket?.calledAt && (
                <div className="text-xs sm:text-sm font-mono text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Dipanggil: {new Date(activeTicket.calledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIT
                  </span>
                </div>
              )}
            </div>

            {/* Giant Number Display */}
            <div className="py-8 sm:py-14 text-center relative z-10">
              <div className="text-sm sm:text-base uppercase tracking-widest text-amber-300 font-extrabold mb-1">
                NOMOR ANTRIAN AKTIF
              </div>

              <div className={`font-mono text-7xl sm:text-9xl md:text-[11rem] font-black tracking-tight leading-none my-2 drop-shadow-2xl transition-all ${
                isThisCounterCalling || activeTicket?.status === 'DIPANGGIL'
                  ? 'text-amber-400 scale-105'
                  : activeTicket
                  ? 'text-yellow-300'
                  : 'text-slate-600'
              }`}>
                {activeTicket ? activeTicket.ticketNumber : '- - -'}
              </div>

              {/* Citizen Details */}
              {activeTicket?.citizenName && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <span className="text-2xl sm:text-4xl font-extrabold text-white">
                    {activeTicket.citizenName}
                  </span>
                  {activeTicket.citizenDistrict && (
                    <span className="text-xs sm:text-sm font-bold text-amber-300 bg-[#07132c] px-3.5 py-1 rounded-full border border-amber-400/40">
                      Distrik {activeTicket.citizenDistrict}
                    </span>
                  )}
                  {activeTicket.citizenNik && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                      NIK: {activeTicket.citizenNik.substring(0, 6)}******{activeTicket.citizenNik.slice(-4)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Reminder for Citizen */}
            <div className="bg-[#07132c]/90 rounded-2xl p-4 border border-blue-900/60 relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
                  {counter.serviceCode}
                </div>
                <div>
                  <div className="text-xs uppercase text-slate-400 font-bold">LOKET PELAYANAN</div>
                  <div className="text-base sm:text-lg font-black text-amber-400">{counter.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-300 font-medium">
                  Harap siapkan dokumen fisik/asli sesuai persyaratan
                </div>
                <div className="text-[11px] text-amber-400/90 font-bold">
                  Pelayanan Disdukcapil Keerom 100% Bebas Biaya (GRATIS)
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Next in Line & Counter Stats (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-5">
            {/* Next in Line Card */}
            <div className="bg-[#0a1736] rounded-3xl p-5 border border-blue-900/80 flex flex-col flex-1">
              <div className="flex items-center justify-between border-b border-blue-900/60 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    ANTRIAN BERIKUTNYA
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {waitingTickets.length} Menunggu
                </span>
              </div>

              {waitingTickets.length > 0 ? (
                <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
                  {waitingTickets.slice(0, 5).map((t, idx) => (
                    <div
                      key={t.id}
                      className="bg-[#0e214d]/80 rounded-xl p-3 border border-blue-900/70 flex items-center justify-between hover:border-amber-400/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-950 text-amber-400 text-xs font-black flex items-center justify-center border border-blue-900">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-mono text-lg font-black text-amber-300">
                            {t.ticketNumber}
                          </div>
                          <div className="text-xs text-slate-300 font-medium truncate max-w-[140px]">
                            {t.citizenName || 'Warga'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {t.queueType === 'PRIORITAS' ? (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md">
                            PRIORITAS
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Reguler
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(t.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mb-2" />
                  <p className="text-xs font-medium text-slate-300">Tidak ada antrian menunggu saat ini</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Loket siap menerima pemohon baru</p>
                </div>
              )}

              {waitingTickets.length > 5 && (
                <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-blue-900/60 mt-2">
                  + {waitingTickets.length - 5} antrian lainnya dalam daftar
                </div>
              )}
            </div>

            {/* Quick Stats of this counter */}
            <div className="bg-[#0a1736] rounded-3xl p-4 sm:p-5 border border-blue-900/80 grid grid-cols-2 gap-3">
              <div className="bg-[#0d1d40] rounded-2xl p-3 border border-blue-900/60 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  SELESAI HARI INI
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                  {finishedTickets.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Warga Terlayani</div>
              </div>

              <div className="bg-[#0d1d40] rounded-2xl p-3 border border-blue-900/60 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  ESTIMASI LAYANAN
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-yellow-300 mt-1">
                  {service.estimatedMinutes} <span className="text-xs font-sans font-bold">mnt</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Per Berkas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Running Text Marquee in Navy & Yellow */}
      <div className="bg-[#060e20] border-t-2 border-amber-400 px-4 py-2.5 text-amber-200 overflow-hidden flex items-center relative shadow-lg">
        <div className="bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-md mr-3 uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-md">
          <Megaphone className="w-3.5 h-3.5 text-slate-950" />
          <span>Warta {counter.name}</span>
        </div>

        <div className="marquee-container flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee font-bold text-xs sm:text-sm tracking-wide text-amber-100">
            {settings.runningText}
          </div>
        </div>
      </div>
    </div>
  );
};
