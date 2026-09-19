import React, { useState, useEffect } from 'react';
import { Ticket, CounterInfo, CallLogItem, SystemSettings } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  Maximize, 
  Minimize, 
  Volume2, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  Megaphone,
  MessageSquare,
  ExternalLink
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

  // Educational slides for citizens in waiting room
  const eduSlides = [
    {
      title: 'Perekaman KTP-el Warga Keerom',
      desc: 'Bagi remaja yang telah berusia 17 tahun atau sudah menikah, segera lakukan perekaman KTP-el. Cukup membawa fotokopi Kartu Keluarga.',
      tag: 'KTP-el Gratis'
    },
    {
      title: 'Identitas Kependudukan Digital (IKD)',
      desc: 'KTP digital kini ada di ponsel Anda! Aktifkan IKD sekarang di Loket 1 bersama petugas Disdukcapil Keerom.',
      tag: 'Modern & Aman'
    },
    {
      title: 'Dokumen Ber-Barcode (TTE) Bebas Legalisir',
      desc: 'Sesuai Permendagri No. 104/2019, seluruh dokumen kependudukan yang sudah memiliki tanda tangan elektronik (QR code) tidak perlu lagi dilegalisir.',
      tag: 'Info Resmi'
    },
    {
      title: 'Layanan Adminduk 100% GRATIS',
      desc: 'Seluruh pelayanan kependudukan dan pencatatan sipil di Kabupaten Keerom bebas pungutan biaya (GRATIS). Tolak dan laporkan segala bentuk pungli!',
      tag: 'Bebas Pungli'
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % eduSlides.length);
    }, 9000);
    return () => clearInterval(slideTimer);
  }, [eduSlides.length]);

  // If a specific counter is chosen, render the dedicated SingleCounterDisplayView
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

  // Current ticket displayed on main call card:
  const latestCalled = activeCallingTicket || 
    tickets.find(t => t.status === 'DIPANGGIL') ||
    tickets.find(t => t.status === 'SEDANG_DILAYANI') ||
    null;

  const targetCounter = latestCalled 
    ? counters.find(c => c.id === latestCalled.counterAssigned || c.serviceCode === latestCalled.serviceCode)
    : null;

  const currentService = latestCalled ? SERVICES_DATA.find(s => s.id === latestCalled.serviceCategory) : null;

  return (
    <div className="w-full min-h-[calc(100vh-130px)] bg-[#071126] text-slate-100 flex flex-col justify-between select-none">
      {/* Top Banner Toolbar with Display Switcher */}
      <div className="bg-[#0c1a38] border-b border-blue-900/60 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Screen switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider mr-1 hidden lg:inline">
            PILIH LAYAR:
          </span>

          <button
            id="display-select-all"
            onClick={() => handleSelectScreen('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap border ${
              activeScreen === 'all'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <span>📺 Layar Utama (Semua)</span>
          </button>

          {counters.map(c => (
            <button
              key={c.id}
              id={`display-select-counter-${c.id}`}
              onClick={() => handleSelectScreen(c.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-400/40"
            >
              <span>{c.name}</span>
              <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                {c.serviceCode}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="popout-master-display-btn"
            onClick={() => handleOpenPopout('all')}
            title="Buka Layar Utama di Tab / Window Baru"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-950 hover:bg-blue-900 text-amber-300 border border-amber-400/30 transition shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Buka Layar Terpisah ↗</span>
          </button>

          <button
            id="toggle-fullscreen-btn"
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
                <span>Layar TV Penuh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main TV Screen Content */}
      <div className="p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Column (7 cols): Giant Call Spotlight Box */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {/* Main Calling Spotlight */}
          <div className={`relative rounded-3xl p-6 sm:p-8 border-2 transition-all duration-500 shadow-2xl flex flex-col justify-between min-h-[380px] sm:min-h-[440px] overflow-hidden ${
            activeCallingTicket
              ? 'bg-gradient-to-br from-[#12285a] via-[#0d1d42] to-[#152a5c] border-amber-400 ring-4 ring-amber-400/30 shadow-amber-400/20'
              : 'bg-[#0a1736] border-blue-900/80'
          }`}>
            {/* Background Glow */}
            <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -top-16 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-blue-900/80 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-2 ${
                  latestCalled?.status === 'DIPANGGIL'
                    ? 'bg-amber-400 text-slate-950 animate-bounce shadow-md shadow-amber-400/40'
                    : 'bg-blue-900/80 text-amber-300 border border-amber-400/40'
                }`}>
                  <Megaphone className="w-4 h-4" />
                  <span>
                    {latestCalled?.status === 'DIPANGGIL'
                      ? 'SEDANG DIPANGGIL SAAT INI'
                      : latestCalled?.status === 'SEDANG_DILAYANI'
                      ? 'SEDANG DILAYANI DI LOKET'
                      : 'PANGGILAN LOKET TERAKHIR'}
                  </span>
                </div>

                {latestCalled?.queueType === 'PRIORITAS' && (
                  <span className="flex items-center gap-1 text-xs font-black bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/50">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Jalur Prioritas Khusus
                  </span>
                )}
              </div>

              <div className="text-xs font-mono text-slate-300">
                {latestCalled?.calledAt ? (
                  <span>Pukul {new Date(latestCalled.calledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIT</span>
                ) : (
                  <span>Siap Melayani</span>
                )}
              </div>
            </div>

            {/* Center: Massive Number Display */}
            <div className="py-6 sm:py-10 text-center relative z-10">
              <div className="text-xs sm:text-sm uppercase tracking-widest text-amber-300 font-extrabold mb-2">
                NOMOR ANTRIAN
              </div>
              
              <div className={`font-mono text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter leading-none my-2 drop-shadow-2xl transition-transform ${
                activeCallingTicket ? 'scale-105 text-amber-400 animate-pulse' : 'text-yellow-300'
              }`}>
                {latestCalled ? latestCalled.ticketNumber : '--'}
              </div>

              {latestCalled?.citizenName && (
                <div className="mt-3 text-lg sm:text-2xl font-bold text-white flex flex-wrap items-center justify-center gap-2">
                  <span>{latestCalled.citizenName}</span>
                  {latestCalled.citizenDistrict && (
                    <span className="text-xs font-bold text-amber-300 bg-[#07132c] px-3 py-0.5 rounded-full border border-amber-400/40">
                      Distrik {latestCalled.citizenDistrict}
                    </span>
                  )}
                  {latestCalled.smsSent && (
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      SMS Terkirim
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer Destination Box: Menuju ke Loket */}
            <div className="bg-[#07132c]/95 rounded-2xl p-5 border border-blue-900/80 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="text-xs uppercase text-slate-400 tracking-wider font-bold">SILAKAN MENUJU KE</div>
                <div className="text-2xl sm:text-4xl font-black text-amber-400 tracking-tight mt-0.5 flex items-center gap-3">
                  <span>{targetCounter ? targetCounter.name : 'Loket Pelayanan'}</span>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-xs uppercase text-slate-400 tracking-wider font-bold">JENIS PELAYANAN</div>
                <div className="text-sm sm:text-base font-bold text-yellow-300 mt-0.5">
                  {currentService ? currentService.name : 'Administrasi Kependudukan'}
                </div>
                {targetCounter?.officerName && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Petugas: <span className="text-slate-200 font-semibold">{targetCounter.officerName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Education / Info Slideshow Banner */}
          <div className="bg-[#0a1736] rounded-2xl p-4 border border-blue-900/80 flex items-start gap-4 shadow-md">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  {eduSlides[tickerIndex].tag}
                </span>
                <span className="text-[10px] text-slate-400">• Disdukcapil Kab. Keerom</span>
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

        {/* Right Column (5 cols): Live Grid of Counters 1 to 5 */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              STATUS SEMUA LOKET PELAYANAN
            </h3>
            <span className="text-xs text-amber-400 font-mono font-bold">
              {counters.filter(c => c.isOpen).length} dari {counters.length} Loket Buka
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {counters.map((counter) => {
              const currentTicket = tickets.find(t => t.id === counter.currentTicketId);
              const isServing = currentTicket?.status === 'SEDANG_DILAYANI';
              const isCalling = currentTicket?.status === 'DIPANGGIL';
              const isThisCalling = activeCallingTicket?.id === currentTicket?.id;
              const service = SERVICES_DATA.find(s => s.code === counter.serviceCode);

              // Waiting count for this service
              const waitingCount = tickets.filter(
                t => t.serviceCode === counter.serviceCode && t.status === 'MENUNGGU'
              ).length;

              return (
                <div
                  key={counter.id}
                  onClick={() => handleSelectScreen(counter.id)}
                  className={`rounded-2xl p-4 border transition-all duration-300 cursor-pointer ${
                    isThisCalling
                      ? 'bg-[#152a5c] border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                      : isCalling
                      ? 'bg-[#10224d] border-amber-400/60'
                      : isServing
                      ? 'bg-[#0e214d] border-blue-800'
                      : 'bg-[#091530] border-blue-900/60 opacity-85'
                  } hover:border-amber-400/60`}
                  title="Klik untuk membuka layar khusus loket ini"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-sm shadow-md ${
                        counter.isOpen
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {counter.serviceCode}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-base">
                            {counter.name}
                          </h4>
                          {counter.isOpen ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-500/30">
                              BUKA
                            </span>
                          ) : (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md font-bold border border-rose-500/30">
                              TUTUP
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium truncate max-w-[200px]">
                          {service?.name || counter.name}
                        </p>
                      </div>
                    </div>

                    {/* Current Number in Counter */}
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {isCalling ? 'DIPANGGIL' : isServing ? 'DILAYANI' : 'STATUS'}
                      </div>
                      <div className={`font-mono text-2xl sm:text-3xl font-black ${
                        isCalling
                          ? 'text-amber-400 animate-pulse'
                          : isServing
                          ? 'text-yellow-300'
                          : 'text-slate-500'
                      }`}>
                        {currentTicket ? currentTicket.ticketNumber : '- -'}
                      </div>
                    </div>
                  </div>

                  {/* Sub details: Officer and Waiting queue */}
                  <div className="mt-3 pt-2.5 border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-300">
                    <div className="truncate max-w-[220px]">
                      Petugas: <span className="text-white font-semibold">{counter.officerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Antrian:</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                        waitingCount > 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {waitingCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Call Log Ticker */}
          <div className="bg-[#0a1736] rounded-xl p-3 border border-blue-900/80 text-xs">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Riwayat Panggilan Terakhir:
            </div>
            <div className="flex flex-wrap gap-2">
              {callLogs.slice(0, 4).map((log) => (
                <span
                  key={log.id}
                  className="bg-[#060e20] px-2 py-1 rounded-md text-[11px] font-mono text-slate-200 border border-blue-900 flex items-center gap-1"
                >
                  <span className="font-bold text-amber-400">{log.ticketNumber}</span>
                  <span className="text-slate-500">→</span>
                  <span>{log.counterName}</span>
                </span>
              ))}
              {callLogs.length === 0 && (
                <span className="text-slate-500 italic">Belum ada riwayat panggilan</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Running Text Marquee in Navy & Yellow */}
      <div className="bg-[#060e20] border-t-2 border-amber-400 px-4 py-2.5 text-amber-200 overflow-hidden flex items-center relative shadow-lg">
        <div className="bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-md mr-3 uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-md">
          <Megaphone className="w-3.5 h-3.5 text-slate-950" />
          <span>Warta Dukcapil Keerom</span>
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
