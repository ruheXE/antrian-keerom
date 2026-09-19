import React, { useState, useEffect } from 'react';
import { Ticket, CounterInfo, QueueStatus, ServiceCategory } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  PhoneCall, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  SkipForward, 
  ArrowRightLeft, 
  Users, 
  Clock, 
  Sparkles, 
  User, 
  Edit3, 
  Check, 
  Save, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  Phone
} from 'lucide-react';

interface OperatorViewProps {
  counters: CounterInfo[];
  tickets: Ticket[];
  onCallNext: (counterId: number) => void;
  onRecall: (counterId: number) => void;
  onStartServing: (counterId: number) => void;
  onFinishServing: (counterId: number, notes?: string) => void;
  onSkipTicket: (counterId: number) => void;
  onTransferTicket: (ticketId: string, targetCounterId: number) => void;
  onUpdateCounterStatus: (counterId: number, isOpen: boolean, officerName?: string) => void;
}

export const OperatorView: React.FC<OperatorViewProps> = ({
  counters,
  tickets,
  onCallNext,
  onRecall,
  onStartServing,
  onFinishServing,
  onSkipTicket,
  onTransferTicket,
  onUpdateCounterStatus,
}) => {
  const [selectedCounterId, setSelectedCounterId] = useState<number>(1);
  const [officerNameInput, setOfficerNameInput] = useState('');
  const [isEditingOfficer, setIsEditingOfficer] = useState(false);
  const [officerNotes, setOfficerNotes] = useState('');
  const [transferTargetCounter, setTransferTargetCounter] = useState<number>(2);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [serviceDurationSec, setServiceDurationSec] = useState(0);

  const currentCounter = counters.find(c => c.id === selectedCounterId) || counters[0];
  const currentService = SERVICES_DATA.find(s => s.code === currentCounter.serviceCode);

  // Active ticket assigned to this counter
  const activeTicket = tickets.find(t => t.id === currentCounter.currentTicketId);

  // Sync officer notes when active ticket changes
  useEffect(() => {
    if (activeTicket) {
      setOfficerNotes(activeTicket.officerNotes || '');
    } else {
      setOfficerNotes('');
    }
  }, [activeTicket?.id]);

  // Sync officer name when switching counter
  useEffect(() => {
    setOfficerNameInput(currentCounter.officerName);
    setIsEditingOfficer(false);
  }, [selectedCounterId, currentCounter.officerName]);

  // Live timer for serving duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTicket && activeTicket.status === 'SEDANG_DILAYANI' && activeTicket.servedAt) {
      const start = new Date(activeTicket.servedAt).getTime();
      interval = setInterval(() => {
        const now = Date.now();
        setServiceDurationSec(Math.max(0, Math.floor((now - start) / 1000)));
      }, 1000);
    } else {
      setServiceDurationSec(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTicket?.status, activeTicket?.servedAt]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tickets waiting for this counter's service code
  const waitingTickets = tickets.filter(
    t => t.serviceCode === currentCounter.serviceCode && t.status === 'MENUNGGU'
  ).sort((a, b) => {
    // Priorities first, then older createdAt
    if (a.queueType === 'PRIORITAS' && b.queueType !== 'PRIORITAS') return -1;
    if (b.queueType === 'PRIORITAS' && a.queueType !== 'PRIORITAS') return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const handleSaveOfficerName = () => {
    if (officerNameInput.trim()) {
      onUpdateCounterStatus(currentCounter.id, currentCounter.isOpen, officerNameInput.trim());
      setIsEditingOfficer(false);
    }
  };

  const handleToggleOpen = () => {
    onUpdateCounterStatus(currentCounter.id, !currentCounter.isOpen);
  };

  const handleFinish = () => {
    onFinishServing(currentCounter.id, officerNotes);
  };

  const handleExecuteTransfer = () => {
    if (activeTicket) {
      onTransferTicket(activeTicket.id, transferTargetCounter);
      setShowTransferModal(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-130px)] bg-[#071126] py-6 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Counter Selector Bar */}
        <div className="bg-[#0a1633] rounded-xl p-3.5 shadow-sm border border-blue-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <span className="text-xs font-bold uppercase text-amber-400 mr-1 shrink-0">
              Pilih Loket:
            </span>
            {counters.map((c) => (
              <button
                key={c.id}
                id={`select-operator-counter-${c.id}`}
                onClick={() => setSelectedCounterId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 flex items-center gap-2 ${
                  selectedCounterId === c.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-[#050d1e] hover:bg-[#0e214d] text-slate-200 border border-blue-900/60'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${c.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span>{c.name} ({c.serviceCode})</span>
              </button>
            ))}
          </div>

          {/* Loket Status & Officer Quick Setting */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              id="operator-toggle-open-btn"
              onClick={handleToggleOpen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                currentCounter.isOpen
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/50'
                  : 'bg-rose-950/40 text-rose-300 border-rose-500/50 hover:bg-rose-900/50'
              }`}
            >
              {currentCounter.isOpen ? 'Loket Buka' : 'Loket Tutup'}
            </button>
          </div>
        </div>

        {/* Counter Officer Profile Header Card */}
        <div className="bg-[#0a1633] text-white rounded-xl p-4 sm:p-5 border border-blue-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#050d1e] border border-amber-400/40 text-amber-400 font-bold text-xl flex items-center justify-center shrink-0">
              {currentCounter.serviceCode}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {currentCounter.name} - {currentService?.name}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Petugas:</span>
                {isEditingOfficer ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={officerNameInput}
                      onChange={(e) => setOfficerNameInput(e.target.value)}
                      className="px-2 py-0.5 text-xs bg-[#050d1e] border border-blue-900 rounded text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      onClick={handleSaveOfficerName}
                      className="p-1 bg-amber-400 rounded hover:bg-amber-300 text-slate-950"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">{currentCounter.officerName}</span>
                    <button
                      onClick={() => setIsEditingOfficer(true)}
                      className="text-slate-400 hover:text-amber-400 p-0.5"
                      title="Ubah Nama Petugas"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#050d1e] px-4 py-2 rounded-xl border border-blue-900/80 self-stretch md:self-auto justify-between md:justify-start">
            <div className="text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Antrian Menunggu</div>
              <div className="text-xl font-bold text-amber-400 font-mono">
                {waitingTickets.length}
              </div>
            </div>
            <div className="h-7 w-px bg-blue-900/80" />
            <div className="text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Prioritas</div>
              <div className="text-xl font-bold text-amber-300 font-mono">
                {waitingTickets.filter(t => t.queueType === 'PRIORITAS').length}
              </div>
            </div>
          </div>
        </div>

        {/* Main Work Area: Active Ticket & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (8 cols): Current Active Ticket & Action Buttons */}
          <div className="lg:col-span-8 space-y-5">
            {/* Active Ticket Card */}
            <div className="bg-[#0a1633] rounded-xl p-5 sm:p-6 border border-blue-900/80 shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-900/60 pb-3.5 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  ANTRIAN YANG SEDANG DIHADAPI DI LOKET
                </span>

                {activeTicket ? (
                  <div className="flex items-center gap-2">
                    {activeTicket.queueType === 'PRIORITAS' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#0b1f48] text-amber-300 border border-amber-400/40">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Prioritas
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                      activeTicket.status === 'DIPANGGIL'
                        ? 'bg-amber-400 text-slate-950'
                        : activeTicket.status === 'SEDANG_DILAYANI'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#050d1e] text-slate-300'
                    }`}>
                      {activeTicket.status === 'DIPANGGIL' ? 'Dipanggil' : 'Sedang Dilayani'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Tidak ada antrian aktif</span>
                )}
              </div>

              {activeTicket ? (
                <div className="space-y-5">
                  {/* Giant Number & Citizen Info */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#050d1e] p-5 rounded-xl border border-blue-900/70">
                    <div className="text-center sm:text-left">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">Nomor Antrian</div>
                      <div className="text-5xl sm:text-6xl font-black text-amber-400 font-mono tracking-tight my-1">
                        {activeTicket.ticketNumber}
                      </div>
                      <div className="text-xs text-slate-300">
                        Dipanggil: <strong className="text-white font-semibold">{activeTicket.callCount} kali</strong>
                      </div>
                    </div>

                    <div className="text-center sm:text-right space-y-1">
                      <div className="text-[11px] text-slate-400">Identitas Warga:</div>
                      <div className="text-base sm:text-lg font-bold text-white">
                        {activeTicket.citizenName || 'Warga (Tanpa Nama)'}
                      </div>
                      {activeTicket.citizenNik && (
                        <div className="text-xs font-mono text-slate-300">
                          NIK: {activeTicket.citizenNik}
                        </div>
                      )}
                      {activeTicket.citizenDistrict && (
                        <div className="text-xs font-medium text-amber-300">
                          Asal: Distrik {activeTicket.citizenDistrict}
                        </div>
                      )}
                      {activeTicket.citizenPhone && (
                        <div className="text-xs font-mono text-slate-300 flex items-center justify-center sm:justify-end gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{activeTicket.citizenPhone}</span>
                          {activeTicket.smsSent ? (
                            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-sans font-semibold flex items-center gap-1">
                              <MessageSquare className="w-2.5 h-2.5" /> SMS Terkirim
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-sans">
                              SMS Siap
                            </span>
                          )}
                        </div>
                      )}

                      {/* Live Timer if serving */}
                      {activeTicket.status === 'SEDANG_DILAYANI' && (
                        <div className="inline-flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold mt-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          Durasi: {formatTimer(serviceDurationSec)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Officer Notes Area */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 uppercase mb-1">
                      Catatan Pelayanan Petugas (Opsional)
                    </label>
                    <textarea
                      id="operator-officer-notes"
                      rows={2}
                      placeholder="Catat status berkas atau keterangan tindak lanjut..."
                      value={officerNotes}
                      onChange={(e) => setOfficerNotes(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#050d1e] text-white rounded-lg border border-blue-900 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  {/* Control Buttons Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <button
                      id="operator-recall-btn"
                      type="button"
                      onClick={() => onRecall(currentCounter.id)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#0e214d] hover:bg-[#12285a] text-amber-300 border border-amber-400/40 transition font-semibold text-xs"
                    >
                      <RotateCcw className="w-4 h-4 mb-1 text-amber-400" />
                      <span>Panggil Ulang</span>
                      <span className="text-[10px] text-amber-300/80">Bel & Suara</span>
                    </button>

                    {activeTicket.status === 'DIPANGGIL' && (
                      <button
                        id="operator-start-serving-btn"
                        type="button"
                        onClick={() => onStartServing(currentCounter.id)}
                        className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition font-semibold text-xs shadow-xs"
                      >
                        <Play className="w-4 h-4 mb-1" />
                        <span>Mulai Layani</span>
                        <span className="text-[10px] text-blue-200">Warga Tiba</span>
                      </button>
                    )}

                    <button
                      id="operator-finish-btn"
                      type="button"
                      onClick={handleFinish}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition font-semibold text-xs shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 mb-1" />
                      <span>Selesai</span>
                      <span className="text-[10px] text-emerald-200">Tuntaskan</span>
                    </button>

                    <button
                      id="operator-skip-btn"
                      type="button"
                      onClick={() => onSkipTicket(currentCounter.id)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition font-semibold text-xs"
                    >
                      <SkipForward className="w-4 h-4 mb-1 text-rose-400" />
                      <span>Lewati</span>
                      <span className="text-[10px] text-rose-300/80">Tidak Hadir</span>
                    </button>

                    <button
                      id="operator-transfer-btn"
                      type="button"
                      onClick={() => setShowTransferModal(true)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#0e214d] hover:bg-[#12285a] text-slate-200 border border-blue-900 transition font-semibold text-xs col-span-2 sm:col-span-1"
                    >
                      <ArrowRightLeft className="w-4 h-4 mb-1 text-amber-400" />
                      <span>Transfer</span>
                      <span className="text-[10px] text-slate-400">Ke Loket Lain</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* No active ticket state: Big Call Next button in Yellow */
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3.5">
                  <div className="w-16 h-16 rounded-full bg-[#050d1e] text-amber-400 border border-amber-400/30 flex items-center justify-center">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Loket Sedang Kosong
                    </h3>
                    <p className="text-xs text-slate-300 max-w-sm mt-1">
                      {waitingTickets.length > 0
                        ? `Tersedia ${waitingTickets.length} antrian yang menunggu pelayanan ${currentService?.name}.`
                        : `Saat ini tidak ada antrian menunggu untuk pelayanan ${currentService?.name}.`}
                    </p>
                  </div>

                  <button
                    id="operator-call-next-btn"
                    type="button"
                    disabled={waitingTickets.length === 0}
                    onClick={() => onCallNext(currentCounter.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition ${
                      waitingTickets.length > 0
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                        : 'bg-[#050d1e] text-slate-500 border border-blue-900 cursor-not-allowed'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>PANGGIL ANTRIAN BERIKUTNYA</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Service Checklist & Guidance for Operator */}
            <div className="bg-[#0a1633] rounded-xl p-4 border border-blue-900/80 shadow-xs">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Standar Pelayanan & Persyaratan {currentService?.name}
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {currentService?.requirements.slice(0, 3).map((req, idx) => (
                  <li key={idx} className="line-clamp-1">{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column (4 cols): Waiting Queue for this Loket */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0a1633] rounded-xl p-4 border border-blue-900/80 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  Antrian Menunggu ({waitingTickets.length})
                </h3>
              </div>

              <div className="divide-y divide-blue-900/40 max-h-[480px] overflow-y-auto mt-1">
                {waitingTickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-[#050d1e] px-2 rounded-lg transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#050d1e] text-amber-400 text-[11px] font-bold flex items-center justify-center border border-blue-900">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-amber-400">
                            {ticket.ticketNumber}
                          </span>
                          {ticket.queueType === 'PRIORITAS' && (
                            <span className="px-1.5 py-0.2 bg-[#0b1f48] text-amber-300 text-[10px] font-semibold rounded border border-amber-400/30">
                              Prioritas
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-200 truncate max-w-[140px]">
                          {ticket.citizenName || 'Warga'}
                        </div>
                        {ticket.citizenDistrict && (
                          <div className="text-[10px] text-slate-400">
                            Distrik {ticket.citizenDistrict}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(ticket.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {waitingTickets.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    Tidak ada antrian menunggu untuk loket ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Transfer Antrian */}
      {showTransferModal && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#0a1633] rounded-xl p-5 max-w-sm w-full border border-blue-900 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1">
              Transfer Nomor {activeTicket.ticketNumber}
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Pindahkan antrian warga ({activeTicket.citizenName || 'Warga'}) ke loket layanan lain untuk proses lanjutan.
            </p>

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-amber-400">
                Pilih Loket Tujuan:
              </label>
              {counters
                .filter(c => c.id !== currentCounter.id)
                .map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                      transferTargetCounter === c.id
                        ? 'border-amber-400 bg-[#0e214d]'
                        : 'border-blue-900/60 bg-[#050d1e] hover:bg-[#07132c]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="transferTarget"
                        checked={transferTargetCounter === c.id}
                        onChange={() => setTransferTargetCounter(c.id)}
                        className="text-amber-400 focus:ring-amber-400"
                      />
                      <div>
                        <div className="font-bold text-xs text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-300">
                          {SERVICES_DATA.find(s => s.code === c.serviceCode)?.name}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      [{c.serviceCode}]
                    </span>
                  </label>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                Batal
              </button>
              <button
                id="confirm-transfer-btn"
                type="button"
                onClick={handleExecuteTransfer}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition"
              >
                Transfer Antrian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
