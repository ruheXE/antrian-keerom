import React, { useState, useEffect } from 'react';
import { Ticket, CounterInfo } from '../types';
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
  User, 
  Edit3, 
  Check, 
  AlertCircle,
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
  const activeTicket = tickets.find(t => t.id === currentCounter.currentTicketId);

  useEffect(() => {
    if (activeTicket) {
      setOfficerNotes(activeTicket.officerNotes || '');
    } else {
      setOfficerNotes('');
    }
  }, [activeTicket?.id]);

  useEffect(() => {
    setOfficerNameInput(currentCounter.officerName);
    setIsEditingOfficer(false);
  }, [selectedCounterId, currentCounter.officerName]);

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

  const waitingTickets = tickets.filter(
    t => t.serviceCode === currentCounter.serviceCode && t.status === 'MENUNGGU'
  ).sort((a, b) => {
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
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#060d1e] py-8 px-4 sm:px-6 lg:px-8 text-slate-100 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Top Counter Selector Bar */}
        <div className="bg-[#0a1633]/80 rounded-2xl p-4 border border-blue-900/50 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">
              Meja Loket:
            </span>
            {counters.map((c) => (
              <button
                key={c.id}
                id={`select-operator-counter-${c.id}`}
                onClick={() => setSelectedCounterId(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-2 ${
                  selectedCounterId === c.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#060e20] hover:bg-[#0e214d] text-slate-300 border border-blue-900/60'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${c.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span>{c.name}</span>
                <span className="font-mono text-[10px] text-amber-400">({c.serviceCode})</span>
              </button>
            ))}
          </div>

          <button
            id="operator-toggle-open-btn"
            onClick={handleToggleOpen}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              currentCounter.isOpen
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            {currentCounter.isOpen ? 'Status: Loket Buka' : 'Status: Loket Tutup'}
          </button>
        </div>

        {/* Counter Info Header */}
        <div className="bg-[#0a1633]/80 rounded-2xl p-6 border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono font-bold text-xl flex items-center justify-center shrink-0">
              {currentCounter.serviceCode}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {currentCounter.name} · {currentService?.name}
              </h2>
              
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Petugas:</span>
                {isEditingOfficer ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={officerNameInput}
                      onChange={(e) => setOfficerNameInput(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-[#060e20] border border-blue-900 rounded-lg text-white outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      onClick={handleSaveOfficerName}
                      className="p-1 bg-amber-400 rounded-lg text-slate-950 font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
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

          <div className="flex items-center gap-6 bg-[#060e20] px-5 py-3 rounded-xl border border-blue-900/50 self-stretch md:self-auto justify-between md:justify-start">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Antrian Menunggu</div>
              <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">
                {waitingTickets.length}
              </div>
            </div>
            <div className="h-6 w-px bg-blue-900/60" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Jalur Prioritas</div>
              <div className="text-xl font-bold text-amber-300 font-mono tabular-nums">
                {waitingTickets.filter(t => t.queueType === 'PRIORITAS').length}
              </div>
            </div>
          </div>
        </div>

        {/* Main Work Area: Active Ticket & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Current Active Ticket & Action Buttons */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-[#0a1633]/80 rounded-2xl p-6 border border-blue-900/50 shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-900/40 pb-4 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Antrian Aktif di Loket
                </span>

                {activeTicket ? (
                  <div className="flex items-center gap-3">
                    {activeTicket.queueType === 'PRIORITAS' && (
                      <span className="text-xs font-semibold text-amber-400">
                        · Jalur Prioritas
                      </span>
                    )}
                    <span className={`text-xs font-bold ${
                      activeTicket.status === 'DIPANGGIL' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {activeTicket.status === 'DIPANGGIL' ? '● Sedang Dipanggil' : '● Sedang Dilayani'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Meja loket siap memanggil</span>
                )}
              </div>

              {activeTicket ? (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-[#060e20] p-6 rounded-2xl border border-blue-900/50">
                    <div className="text-center sm:text-left">
                      <div className="text-xs text-slate-400 font-medium">Nomor Antrian</div>
                      <div className="text-5xl sm:text-6xl font-black text-amber-400 font-mono tabular-nums tracking-tight my-1">
                        {activeTicket.ticketNumber}
                      </div>
                      <div className="text-xs text-slate-400">
                        Dipanggil: <span className="text-white font-semibold font-mono tabular-nums">{activeTicket.callCount}x</span>
                      </div>
                    </div>

                    <div className="text-center sm:text-right space-y-1">
                      <div className="text-xs text-slate-400 font-medium">Identitas Pemohon</div>
                      <div className="text-base sm:text-lg font-bold text-white">
                        {activeTicket.citizenName || 'Warga (Tanpa Nama)'}
                      </div>
                      {activeTicket.citizenNik && (
                        <div className="text-xs font-mono text-slate-400 tabular-nums">
                          NIK: {activeTicket.citizenNik}
                        </div>
                      )}
                      {activeTicket.citizenDistrict && (
                        <div className="text-xs text-amber-300 font-medium">
                          Distrik {activeTicket.citizenDistrict}
                        </div>
                      )}
                      {activeTicket.citizenPhone && (
                        <div className="text-xs font-mono text-slate-400 flex items-center justify-center sm:justify-end gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{activeTicket.citizenPhone}</span>
                          {activeTicket.smsSent && (
                            <span className="text-emerald-400 font-sans font-medium flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> SMS Terkirim
                            </span>
                          )}
                        </div>
                      )}

                      {activeTicket.status === 'SEDANG_DILAYANI' && (
                        <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold mt-1 tabular-nums">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Durasi: {formatTimer(serviceDurationSec)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Officer Notes Area */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Catatan Pelayanan Petugas (Opsional)
                    </label>
                    <textarea
                      id="operator-officer-notes"
                      rows={2}
                      placeholder="Catat status berkas atau keterangan pelayanan..."
                      value={officerNotes}
                      onChange={(e) => setOfficerNotes(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-[#060e20] text-white rounded-xl border border-blue-900/80 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <button
                      id="operator-recall-btn"
                      type="button"
                      onClick={() => onRecall(currentCounter.id)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#060e20] hover:bg-[#0e214d] text-amber-300 border border-amber-400/30 transition font-semibold text-xs active:scale-[0.98]"
                    >
                      <RotateCcw className="w-4 h-4 mb-1 text-amber-400" />
                      <span>Panggil Ulang</span>
                      <span className="text-[10px] text-slate-400">Bel & Suara</span>
                    </button>

                    {activeTicket.status === 'DIPANGGIL' && (
                      <button
                        id="operator-start-serving-btn"
                        type="button"
                        onClick={() => onStartServing(currentCounter.id)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition font-semibold text-xs active:scale-[0.98]"
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
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition font-semibold text-xs active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4 mb-1" />
                      <span>Selesai</span>
                      <span className="text-[10px] text-emerald-200">Tuntaskan</span>
                    </button>

                    <button
                      id="operator-skip-btn"
                      type="button"
                      onClick={() => onSkipTicket(currentCounter.id)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition font-semibold text-xs active:scale-[0.98]"
                    >
                      <SkipForward className="w-4 h-4 mb-1 text-rose-400" />
                      <span>Lewati</span>
                      <span className="text-[10px] text-rose-400">Tidak Hadir</span>
                    </button>

                    <button
                      id="operator-transfer-btn"
                      type="button"
                      onClick={() => setShowTransferModal(true)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#060e20] hover:bg-[#0e214d] text-slate-200 border border-blue-900/80 transition font-semibold text-xs col-span-2 sm:col-span-1 active:scale-[0.98]"
                    >
                      <ArrowRightLeft className="w-4 h-4 mb-1 text-amber-400" />
                      <span>Transfer</span>
                      <span className="text-[10px] text-slate-400">Ke Loket Lain</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#060e20] text-amber-400 border border-amber-400/20 flex items-center justify-center">
                    <PhoneCall className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Meja Loket Sedang Bebas
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
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition active:scale-[0.98] ${
                      waitingTickets.length > 0
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow-md'
                        : 'bg-[#060e20] text-slate-500 border border-blue-900/60 cursor-not-allowed'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Panggil Antrian Berikutnya</span>
                  </button>
                </div>
              )}
            </div>

            {/* Service Guidelines Card */}
            <div className="bg-[#0a1633]/60 rounded-2xl p-5 border border-blue-900/40">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Standar Persyaratan {currentService?.name}
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {currentService?.requirements.slice(0, 3).map((req, idx) => (
                  <li key={idx} className="line-clamp-1">{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column (4 cols): Waiting Queue */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0a1633]/80 rounded-2xl p-5 border border-blue-900/50 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Antrian Menunggu
                </h3>
                <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                  {waitingTickets.length} warga
                </span>
              </div>

              <div className="divide-y divide-blue-900/30 max-h-[480px] overflow-y-auto mt-2">
                {waitingTickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="py-3 flex items-center justify-between gap-2 hover:bg-[#060e20] px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[#060e20] text-amber-400 text-xs font-mono font-bold flex items-center justify-center border border-blue-900/60 tabular-nums">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-amber-400 tabular-nums">
                            {ticket.ticketNumber}
                          </span>
                          {ticket.queueType === 'PRIORITAS' && (
                            <span className="text-[10px] font-semibold text-amber-300">
                              · Prioritas
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
                      <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                        {new Date(ticket.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {waitingTickets.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    Tidak ada antrian menunggu untuk loket ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Transfer Modal */}
      {showTransferModal && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a1633] rounded-2xl p-6 max-w-sm w-full border border-blue-800 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Transfer Nomor {activeTicket.ticketNumber}
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Pindahkan antrian warga ({activeTicket.citizenName || 'Warga'}) ke loket layanan lain.
            </p>

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-slate-300">
                Pilih Loket Tujuan:
              </label>
              {counters
                .filter(c => c.id !== currentCounter.id)
                .map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      transferTargetCounter === c.id
                        ? 'border-amber-400 bg-[#0e214d]'
                        : 'border-blue-900/60 bg-[#060e20] hover:bg-[#0a1633]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="transferTarget"
                        checked={transferTargetCounter === c.id}
                        onChange={() => setTransferTargetCounter(c.id)}
                        className="text-amber-400 focus:ring-amber-400"
                      />
                      <div>
                        <div className="font-bold text-xs text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400">
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-blue-900/40">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition"
              >
                Batal
              </button>
              <button
                id="confirm-transfer-btn"
                type="button"
                onClick={handleExecuteTransfer}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition"
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
