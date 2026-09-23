import React, { useState, useEffect } from 'react';
import { Ticket, CounterInfo, SystemSettings } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  Maximize, 
  Minimize, 
  Users, 
  Clock, 
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
      <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1600px] mx-auto w-full flex flex-col justify-between gap-5">
        {/* Counter Overhead Header Header */}
        <div className="bg-[#0a1633] rounded-xl p-4 sm:p-6 border border-blue-900/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <KeeromLogo size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 bg-[#050d1e] px-2.5 py-0.5 rounded-md border border-amber-400/30">
                  DISDUKCAPIL KABUPATEN KEEROM
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">• Layar Display Loket Resmi</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
                <span className="text-amber-400">{counter.name.toUpperCase()}</span>
                <span className="text-slate-500 font-normal">|</span>
                <span className="text-slate-100">{service.name}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {service.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 bg-[#050d1e] px-4 py-2.5 rounded-xl border border-blue-900/70">
            {/* Officer info */}
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider flex items-center justify-end gap-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Petugas Loket:</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                {counter.officerName}
              </div>
              <div className="text-[10px] text-amber-400 font-medium flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${counter.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span>{counter.isOpen ? 'LOKET AKTIF' : 'LOKET TUTUP'}</span>
              </div>
            </div>

            {/* Clock */}
            <div className="hidden sm:block border-l border-blue-900/80 pl-4 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Waktu Indonesia Timur</div>
              <div className="text-lg sm:text-xl font-bold text-amber-400">
                {currentTime} <span className="text-xs font-normal text-slate-300">WIT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Grid: Giant Calling Spotlight & Next Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
          {/* Main Giant Call Card (8 cols) */}
          <div className={`lg:col-span-8 rounded-xl p-6 sm:p-8 border transition-all duration-300 shadow-sm flex flex-col justify-between overflow-hidden relative ${
            isThisCounterCalling || activeTicket?.status === 'DIPANGGIL'
              ? 'bg-[#0e214d] border-amber-400'
              : 'bg-[#0a1633] border-blue-900/80'
          }`}>
            {/* Top status indicator */}
            <div className="flex items-center justify-between border-b border-blue-900/70 pb-3.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className={`px-3.5 py-1 rounded-md text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 ${
                  activeTicket?.status === 'DIPANGGIL'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : activeTicket?.status === 'SEDANG_DILAYANI'
                    ? 'bg-[#050d1e] text-amber-300 border border-amber-400/40'
                    : 'bg-[#050d1e] text-slate-400 border border-blue-900'
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
                  <span className="text-xs font-semibold text-amber-300">
                    · Jalur Prioritas
                  </span>
                )}
              </div>

              {activeTicket?.calledAt && (
                <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Dipanggil: {new Date(activeTicket.calledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIT
                  </span>
                </div>
              )}
            </div>

            {/* Giant Number Display */}
            <div className="py-6 sm:py-10 text-center relative z-10">
              <div className="text-xs sm:text-sm uppercase tracking-widest text-amber-400 font-bold mb-1">
                NOMOR ANTRIAN AKTIF
              </div>

              <div className={`font-mono text-7xl sm:text-9xl md:text-[10rem] font-black tracking-tight leading-none my-2 transition-all ${
                isThisCounterCalling || activeTicket?.status === 'DIPANGGIL'
                  ? 'text-amber-400 scale-102'
                  : activeTicket
                  ? 'text-amber-300'
                  : 'text-slate-600'
              }`}>
                {activeTicket ? activeTicket.ticketNumber : '- - -'}
              </div>

              {/* Citizen Details */}
              {activeTicket?.citizenName && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xl sm:text-3xl font-bold text-white">
                    {activeTicket.citizenName}
                  </span>
                  {activeTicket.citizenDistrict && (
                    <span className="text-xs font-semibold text-amber-300 bg-[#050d1e] px-2.5 py-0.5 rounded-md border border-amber-400/30">
                      Distrik {activeTicket.citizenDistrict}
                    </span>
                  )}
                  {activeTicket.citizenNik && (
                    <span className="text-xs font-mono text-slate-400 bg-[#050d1e] px-2.5 py-0.5 rounded-md border border-blue-900/60">
                      NIK: {activeTicket.citizenNik.substring(0, 6)}******{activeTicket.citizenNik.slice(-4)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Reminder for Citizen */}
            <div className="bg-[#050d1e] rounded-xl p-3.5 border border-blue-900/70 relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-base">
                  {counter.serviceCode}
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">LOKET PELAYANAN</div>
                  <div className="text-sm sm:text-base font-bold text-amber-400">{counter.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-300 font-normal">
                  Harap siapkan dokumen fisik/asli sesuai persyaratan
                </div>
                <div className="text-[11px] text-amber-400 font-semibold">
                  Pelayanan Disdukcapil Keerom 100% Bebas Biaya (GRATIS)
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Next in Line & Counter Stats (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            {/* Next in Line Card */}
            <div className="bg-[#0a1633] rounded-xl p-4 border border-blue-900/80 flex flex-col flex-1 shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-900/60 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-white">
                    ANTRIAN BERIKUTNYA
                  </h3>
                </div>
                <span className="text-xs font-semibold text-amber-400 bg-[#050d1e] px-2 py-0.5 rounded-md border border-amber-400/30">
                  {waitingTickets.length} Menunggu
                </span>
              </div>

              {waitingTickets.length > 0 ? (
                <div className="space-y-2 overflow-y-auto max-h-[290px] pr-1">
                  {waitingTickets.slice(0, 5).map((t, idx) => (
                    <div
                      key={t.id}
                      className="bg-[#050d1e] rounded-lg p-2.5 border border-blue-900/60 flex items-center justify-between hover:border-amber-400/40 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-[#0a1633] text-amber-400 text-xs font-bold flex items-center justify-center border border-blue-900">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-mono text-base font-bold text-amber-300">
                            {t.ticketNumber}
                          </div>
                          <div className="text-xs text-slate-300 font-normal truncate max-w-[140px]">
                            {t.citizenName || 'Warga'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {t.queueType === 'PRIORITAS' ? (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded">
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
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mb-2" />
                  <p className="text-xs font-medium text-slate-300">Tidak ada antrian menunggu saat ini</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Loket siap melayani pemohon baru</p>
                </div>
              )}

              {waitingTickets.length > 5 && (
                <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-blue-900/60 mt-2">
                  + {waitingTickets.length - 5} antrian lainnya dalam daftar
                </div>
              )}
            </div>

            {/* Quick Stats of this counter */}
            <div className="bg-[#0a1633] rounded-xl p-3.5 border border-blue-900/80 grid grid-cols-2 gap-2.5 shadow-sm">
              <div className="bg-[#050d1e] rounded-lg p-2.5 border border-blue-900/60 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                  SELESAI HARI INI
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">
                  {finishedTickets.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Warga Terlayani</div>
              </div>

              <div className="bg-[#050d1e] rounded-lg p-2.5 border border-blue-900/60 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                  ESTIMASI LAYANAN
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-yellow-300 mt-0.5">
                  {service.estimatedMinutes} <span className="text-xs font-sans font-normal">mnt</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Per Berkas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Running Text Marquee in Navy & Yellow */}
      <div className="bg-[#050d1e] border-t border-amber-400/80 px-4 py-2 text-amber-200 overflow-hidden flex items-center relative shadow-sm">
        <div className="bg-amber-400 text-slate-950 font-bold text-[11px] px-2.5 py-0.5 rounded mr-3 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5 text-slate-950" />
          <span>Warta {counter.name}</span>
        </div>

        <div className="marquee-container flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee font-semibold text-xs sm:text-sm tracking-wide text-amber-100">
            {settings.runningText}
          </div>
        </div>
      </div>
    </div>
  );
};
