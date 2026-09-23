import React, { useState, useEffect } from 'react';
import { Ticket, CounterInfo, CallLogItem, SystemSettings } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  Maximize, 
  Minimize, 
  Users, 
  Clock, 
  ShieldCheck, 
  Megaphone,
  MessageSquare,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { SingleCounterDisplayView } from './SingleCounterDisplayView';

interface DisplayTvViewProps {
  tickets: Ticket[];
  counters: CounterInfo[];
  callLogs: CallLogItem[];
  settings: SystemSettings;
  activeCallingTicket: Ticket | null;
  activeCallingCounter: CounterInfo | null;
  selectedScreen?: 'all' | number;
  onSelectScreen?: (screen: 'all' | number) => void;
}

export const DisplayTvView: React.FC<DisplayTvViewProps> = ({
  tickets,
  counters,
  callLogs,
  settings,
  activeCallingTicket,
  activeCallingCounter,
  selectedScreen = 'all',
  onSelectScreen,
}) => {
  const [internalScreen, setInternalScreen] = useState<'all' | number>(selectedScreen);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  const activeScreen = onSelectScreen ? selectedScreen : internalScreen;
  const handleSelectScreen = (screen: 'all' | number) => {
    if (onSelectScreen) {
      onSelectScreen(screen);
    } else {
      setInternalScreen(screen);
    }
  };

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
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleOpenPopout = (counterId: number | 'all') => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'display');
    url.searchParams.set('screen', counterId.toString());
    window.open(url.toString(), `_blank_display_${counterId}`, 'width=1280,height=800');
  };

  const eduSlides = [
    {
      title: 'Perekaman KTP-el Warga Keerom',
      desc: 'Bagi remaja berusia 17 tahun atau sudah menikah, silakan melakukan perekaman KTP-el dengan membawa fotokopi Kartu Keluarga.',
      tag: 'KTP-el'
    },
    {
      title: 'Identitas Kependudukan Digital (IKD)',
      desc: 'Aktivasi KTP digital di ponsel pintar Anda sekarang di Loket 1 bersama petugas Disdukcapil Keerom.',
      tag: 'IKD Digital'
    },
    {
      title: 'Dokumen Ber-Barcode (TTE) Bebas Legalisir',
      desc: 'Seluruh dokumen kependudukan yang telah bertanda tangan elektronik (QR Code) sah dan tidak perlu dilegalisir.',
      tag: 'Regulasi TTE'
    },
    {
      title: 'Seluruh Layanan Adminduk 100% Bebas Biaya',
      desc: 'Pelayanan kependudukan dan pencatatan sipil di Kabupaten Keerom bebas pungutan biaya (Gratis). Tolak segala bentuk pungli!',
      tag: 'Layanan Gratis'
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % eduSlides.length);
    }, 9000);
    return () => clearInterval(slideTimer);
  }, [eduSlides.length]);

  if (activeScreen !== 'all') {
    return (
      <SingleCounterDisplayView
        counterId={activeScreen}
        tickets={tickets}
        counters={counters}
        settings={settings}
        activeCallingTicket={activeCallingTicket}
        onSelectCounter={handleSelectScreen}
        onOpenPopout={handleOpenPopout}
      />
    );
  }

  const latestCalled = activeCallingTicket || 
    tickets.find(t => t.status === 'DIPANGGIL') ||
    tickets.find(t => t.status === 'SEDANG_DILAYANI') ||
    null;

  const targetCounter = latestCalled 
    ? counters.find(c => c.id === latestCalled.counterAssigned || c.serviceCode === latestCalled.serviceCode)
    : null;

  const currentService = latestCalled ? SERVICES_DATA.find(s => s.id === latestCalled.serviceCategory) : null;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#050b18] text-slate-100 flex flex-col justify-between select-none">
      
      {/* Top Display TV Toolbar */}
      <div className="bg-[#081329] border-b border-blue-900/40 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Screen switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs font-semibold text-slate-400 mr-2 hidden sm:inline">
            Tampilan Layar:
          </span>

          <button
            id="display-select-all"
            onClick={() => handleSelectScreen('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeScreen === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Monitor Utama (Semua Loket)
          </button>

          {counters.map(c => (
            <button
              key={c.id}
              id={`display-select-counter-${c.id}`}
              onClick={() => handleSelectScreen(c.id)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition whitespace-nowrap flex items-center gap-1.5"
            >
              <span>{c.name}</span>
              <span className="font-mono text-[10px] text-amber-400">
                ({c.serviceCode})
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="popout-master-display-btn"
            onClick={() => handleOpenPopout('all')}
            title="Buka Layar Utama di Window Terpisah"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0a1633] text-amber-300 hover:text-white border border-blue-900/60 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Window Baru</span>
          </button>

          <button
            id="toggle-fullscreen-btn"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0a1633] text-slate-200 hover:text-white border border-blue-900/60 transition"
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5 text-amber-400" />
                <span>Keluar Layar Penuh</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 text-amber-400" />
                <span>Layar TV Penuh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main TV Screen Content Viewport */}
      <div className="p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column (7 cols): Dominant Focal Anchor - Current Ticket Spotlight */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          
          <div className={`relative rounded-3xl p-6 sm:p-8 border transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[400px] sm:min-h-[460px] overflow-hidden ${
            activeCallingTicket
              ? 'bg-[#0a183d] border-amber-400 ring-2 ring-amber-400/40'
              : 'bg-[#091530] border-blue-900/60'
          }`}>
            
            {/* Header: Call Status Bar */}
            <div className="flex items-center justify-between border-b border-blue-900/50 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wide uppercase">
                  {latestCalled?.status === 'DIPANGGIL' ? (
                    <div className="flex items-center gap-2 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span>Sedang Dipanggil</span>
                    </div>
                  ) : latestCalled?.status === 'SEDANG_DILAYANI' ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>Sedang Dilayani</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">Panggilan Terakhir</span>
                  )}
                </div>

                {latestCalled?.queueType === 'PRIORITAS' && (
                  <span className="text-xs font-semibold text-amber-300">
                    · Jalur Prioritas
                  </span>
                )}
              </div>

              <div className="text-xs font-mono text-slate-400 tabular-nums">
                {latestCalled?.calledAt ? (
                  <span>Pukul {new Date(latestCalled.calledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIT</span>
                ) : (
                  <span>Siap Melayani</span>
                )}
              </div>
            </div>

            {/* Center: Massive Number Display with Tabular Figures */}
            <div className="py-8 sm:py-12 text-center relative z-10">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-2">
                Nomor Antrian
              </div>
              
              <div className={`font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none my-2 tabular-nums transition-transform ${
                activeCallingTicket ? 'text-amber-400 scale-105' : 'text-amber-300'
              }`}>
                {latestCalled ? latestCalled.ticketNumber : '--'}
              </div>

              {latestCalled?.citizenName && (
                <div className="mt-4 text-base sm:text-xl font-bold text-white flex flex-wrap items-center justify-center gap-3">
                  <span>{latestCalled.citizenName}</span>
                  {latestCalled.citizenDistrict && (
                    <span className="text-xs text-slate-400 font-normal">
                      · Distrik {latestCalled.citizenDistrict}
                    </span>
                  )}
                  {latestCalled.smsSent && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      SMS Terkirim
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer Destination Box: Menuju ke Loket */}
            <div className="bg-[#050e24] rounded-2xl p-5 border border-blue-900/60 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="text-[11px] uppercase text-slate-400 font-medium">Silakan Menuju Ke</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight mt-0.5">
                  {targetCounter ? targetCounter.name : 'Loket Pelayanan'}
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-[11px] uppercase text-slate-400 font-medium">Pelayanan</div>
                <div className="text-sm font-semibold text-slate-100 mt-0.5">
                  {currentService ? currentService.name : 'Administrasi Kependudukan'}
                </div>
                {targetCounter?.officerName && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    Petugas: <span className="text-slate-200">{targetCounter.officerName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Citizen Educational Slide Banner */}
          <div className="bg-[#091530] rounded-2xl p-4 sm:p-5 border border-blue-900/50 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <span>{eduSlides[tickerIndex].tag}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400 font-normal">Informasi Disdukcapil Keerom</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {eduSlides[tickerIndex].title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {eduSlides[tickerIndex].desc}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Live Matrix of Counters 1 to 5 */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Status Loket Pelayanan
            </h3>
            <span className="text-xs text-amber-400 font-mono tabular-nums">
              {counters.filter(c => c.isOpen).length} dari {counters.length} Loket Buka
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {counters.map((counter) => {
              const currentTicket = tickets.find(t => t.id === counter.currentTicketId);
              const isServing = currentTicket?.status === 'SEDANG_DILAYANI';
              const isCalling = currentTicket?.status === 'DIPANGGIL';
              const isThisCalling = activeCallingTicket?.id === currentTicket?.id;
              const service = SERVICES_DATA.find(s => s.code === counter.serviceCode);

              const waitingCount = tickets.filter(
                t => t.serviceCode === counter.serviceCode && t.status === 'MENUNGGU'
              ).length;

              return (
                <div
                  key={counter.id}
                  onClick={() => handleSelectScreen(counter.id)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                    isThisCalling
                      ? 'bg-[#0d1e44] border-amber-400 shadow-md ring-1 ring-amber-400/30'
                      : isCalling
                      ? 'bg-[#0a1838] border-amber-400/60'
                      : isServing
                      ? 'bg-[#091530] border-blue-900/60'
                      : 'bg-[#060e20] border-blue-900/40 opacity-80'
                  } hover:border-amber-400/50`}
                  title="Klik untuk membuka layar khusus loket ini"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl font-bold font-mono flex items-center justify-center text-sm ${
                        counter.isOpen
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {counter.serviceCode}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {counter.name}
                          </h4>
                          <span className={`text-[10px] font-semibold ${counter.isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                            · {counter.isOpen ? 'Buka' : 'Tutup'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">
                          {service?.name || counter.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-medium text-slate-400">
                        {isCalling ? 'Dipanggil' : isServing ? 'Melayani' : 'Status'}
                      </div>
                      <div className={`font-mono text-2xl font-bold tabular-nums ${
                        isCalling
                          ? 'text-amber-400'
                          : isServing
                          ? 'text-yellow-300'
                          : 'text-slate-600'
                      }`}>
                        {currentTicket ? currentTicket.ticketNumber : '- -'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-blue-900/40 flex items-center justify-between text-xs text-slate-400">
                    <div className="truncate max-w-[200px]">
                      Petugas: <span className="text-slate-200">{counter.officerName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Antrian:</span>
                      <span className="font-mono font-bold text-amber-400 tabular-nums">
                        {waitingCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Call Log Ticker */}
          <div className="bg-[#091530] rounded-2xl p-3.5 border border-blue-900/50 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Riwayat Panggilan Terakhir:
            </div>
            <div className="flex flex-wrap gap-2">
              {callLogs.slice(0, 4).map((log) => (
                <span
                  key={log.id}
                  className="bg-[#050e24] px-2.5 py-1 rounded-lg text-xs font-mono text-slate-200 border border-blue-900/50 flex items-center gap-1.5"
                >
                  <span className="font-bold text-amber-400 tabular-nums">{log.ticketNumber}</span>
                  <span className="text-slate-600">→</span>
                  <span>{log.counterName}</span>
                </span>
              ))}
              {callLogs.length === 0 && (
                <span className="text-slate-500 italic text-xs">Belum ada panggilan antrian</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Running Text Marquee */}
      <div className="bg-[#060e20] border-t border-amber-400/80 px-4 py-2 text-slate-200 overflow-hidden flex items-center justify-between relative shadow-lg">
        <div className="flex items-center overflow-hidden flex-1 mr-4">
          <div className="bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg mr-3 shrink-0 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-slate-950" />
            <span>Pengumuman</span>
          </div>

          <div className="marquee-container flex-1 overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-marquee font-medium text-xs sm:text-sm text-slate-200">
              {settings.runningText}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 shrink-0 pl-4 border-l border-blue-900/60 font-mono">
          <span>Disdukcapil Keerom</span>
          <span>·</span>
          <span className="text-amber-400">100% Bebas Pungli</span>
        </div>
      </div>

    </div>
  );
};
