import React, { useState, useMemo } from 'react';
import { Ticket, CounterInfo, SystemSettings, SmsNotificationLog, KEEROM_DISTRICTS } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  ShieldCheck, 
  Users, 
  Edit3, 
  Printer, 
  Trash2, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRightLeft, 
  PlusCircle, 
  Save, 
  X, 
  FileText, 
  BarChart3, 
  Sliders, 
  Phone, 
  MessageSquare,
  Building,
  UserCheck,
  FileSpreadsheet,
  Download,
  FileCode,
  Archive,
  Database,
  Check
} from 'lucide-react';
import { KeeromLogo } from './KeeromLogo';
import { 
  updateTicketInStorage, 
  deleteTicketFromStorage, 
  updateCounterInStorage, 
  resetQueueData,
  restoreSampleQueueData 
} from '../services/storageService';
import { loadSmsLogs } from '../services/smsService';
import { 
  exportArchiveAsJson, 
  exportTicketsAsCsv, 
  exportCallLogsAsCsv, 
  exportStatisticsSummaryAsCsv 
} from '../services/exportService';

interface AdminPanelViewProps {
  tickets: Ticket[];
  counters: CounterInfo[];
  settings: SystemSettings;
  onRefreshData: () => void;
  onTakeTicket: (data: any) => Ticket;
}

type AdminSubTab = 'monitor' | 'manage' | 'report';

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  tickets,
  counters,
  settings,
  onRefreshData,
  onTakeTicket
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('monitor');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCounter, setFilterCounter] = useState<string>('ALL');

  // Edit ticket state
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditCounterModal, setShowEditCounterModal] = useState<CounterInfo | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // New ticket form
  const [newTicketService, setNewTicketService] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [newTicketName, setNewTicketName] = useState('');
  const [newTicketNik, setNewTicketNik] = useState('');
  const [newTicketPhone, setNewTicketPhone] = useState('');
  const [newTicketDistrict, setNewTicketDistrict] = useState('Arso');
  const [newTicketPriority, setNewTicketPriority] = useState<'REGULER' | 'PRIORITAS'>('REGULER');

  // SMS logs
  const smsLogs: SmsNotificationLog[] = useMemo(() => {
    return loadSmsLogs();
  }, [tickets]);

  // Statistics calculation
  const totalTickets = tickets.length;
  const waitingTickets = tickets.filter(t => t.status === 'MENUNGGU');
  const servingTickets = tickets.filter(t => t.status === 'SEDANG_DILAYANI' || t.status === 'DIPANGGIL');
  const finishedTickets = tickets.filter(t => t.status === 'SELESAI');
  const skippedTickets = tickets.filter(t => t.status === 'TERLEWAT' || t.status === 'DIBATALKAN');

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch = 
        t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.citizenName && t.citizenName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.citizenNik && t.citizenNik.includes(searchTerm)) ||
        (t.citizenPhone && t.citizenPhone.includes(searchTerm));

      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const matchCounter = filterCounter === 'ALL' || (t.counterAssigned && t.counterAssigned.toString() === filterCounter);

      return matchSearch && matchStatus && matchCounter;
    });
  }, [tickets, searchTerm, filterStatus, filterCounter]);

  // Calculate Average Service Time in Minutes
  const avgServiceTimeMinutes = useMemo(() => {
    const finishedWithTime = tickets.filter(t => t.servedAt && t.finishedAt);
    if (finishedWithTime.length === 0) return 12;
    const totalMs = finishedWithTime.reduce((acc, t) => {
      const start = new Date(t.servedAt!).getTime();
      const end = new Date(t.finishedAt!).getTime();
      return acc + (end - start);
    }, 0);
    return Math.round(totalMs / finishedWithTime.length / 60000);
  }, [tickets]);

  // Handle Save Ticket Edit
  const handleSaveTicketEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    updateTicketInStorage(editingTicket);
    setEditingTicket(null);
    onRefreshData();
  };

  // Handle Delete Ticket
  const handleDeleteTicket = (ticketId: string, ticketNumber: string) => {
    if (window.confirm(`Yakin ingin menghapus tiket nomor ${ticketNumber}? Data tidak dapat dikembalikan.`)) {
      deleteTicketFromStorage(ticketId);
      onRefreshData();
    }
  };

  // Handle Status Quick Change
  const handleQuickStatusChange = (ticket: Ticket, newStatus: Ticket['status']) => {
    const updated: Ticket = {
      ...ticket,
      status: newStatus,
      finishedAt: newStatus === 'SELESAI' ? (ticket.finishedAt || new Date().toISOString()) : ticket.finishedAt
    };
    updateTicketInStorage(updated);
    onRefreshData();
  };

  // Handle Counter Status / Officer Edit
  const handleSaveCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditCounterModal) return;

    updateCounterInStorage(showEditCounterModal);
    setShowEditCounterModal(null);
    onRefreshData();
  };

  // Handle Toggle Counter Open/Close
  const handleToggleCounterOpen = (counter: CounterInfo) => {
    const updated: CounterInfo = {
      ...counter,
      isOpen: !counter.isOpen
    };
    updateCounterInStorage(updated);
    onRefreshData();
  };

  // Handle Manual Create Ticket
  const handleCreateManualTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const service = SERVICES_DATA.find(s => s.code === newTicketService) || SERVICES_DATA[0];

    onTakeTicket({
      serviceCategory: service.id,
      serviceCode: service.code,
      serviceName: service.name,
      queueType: newTicketPriority,
      citizenName: newTicketName.trim() || 'Pemohon Khusus/VIP',
      citizenNik: newTicketNik.trim() || undefined,
      citizenPhone: newTicketPhone.trim() || undefined,
      citizenDistrict: newTicketDistrict,
    });

    setShowCreateModal(false);
    setNewTicketName('');
    setNewTicketNik('');
    setNewTicketPhone('');
    onRefreshData();
  };

  // Handle Print Official Report
  const handlePrintOfficialReport = () => {
    window.print();
  };

  // Handle Export / Download
  const triggerExport = (type: 'json' | 'csv_tickets' | 'csv_calls' | 'csv_stats') => {
    try {
      if (type === 'json') {
        exportArchiveAsJson(tickets, counters, settings, smsLogs);
        setExportSuccessMsg('Arsip data lengkap (.JSON) berhasil diunduh untuk arsip lokal.');
      } else if (type === 'csv_tickets') {
        exportTicketsAsCsv(tickets, counters);
        setExportSuccessMsg('Data antrian lengkap (.CSV) berhasil diunduh untuk Excel / spreadsheet.');
      } else if (type === 'csv_calls') {
        exportCallLogsAsCsv(tickets, counters, smsLogs);
        setExportSuccessMsg('Log pemanggilan loket & SMS (.CSV) berhasil diunduh.');
      } else if (type === 'csv_stats') {
        exportStatisticsSummaryAsCsv(tickets, counters);
        setExportSuccessMsg('Rekapitulasi statistik pelayanan (.CSV) berhasil diunduh.');
      }
      setTimeout(() => {
        setExportSuccessMsg(null);
      }, 4000);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-130px)] bg-[#071126] text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {exportSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 border border-emerald-300 animate-in fade-in slide-in-from-top-4">
          <Check className="w-5 h-5 text-slate-950" />
          <span className="text-xs">{exportSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner - Navy & Yellow Theme */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-[#0c1a38] via-[#102452] to-[#0c1a38] border-2 border-amber-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                  HAK AKSES ADMINISTRATOR
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Disdukcapil Kab. Keerom</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                PUSAT KONTROL & MANAJEMEN ADMIN
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Memantau antrian live, memodifikasi data tiket & loket, serta mencetak & mengekspor laporan resmi Disdukcapil.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            {/* Quick Export Master Button */}
            <button
              id="admin-quick-export-modal-btn"
              onClick={() => setShowExportModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-blue-950 hover:bg-blue-900 text-amber-300 border border-amber-400/50 transition shadow-lg shrink-0"
              title="Ekspor seluruh data antrian, log, dan statistik ke file JSON / CSV"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Ekspor & Arsip Data</span>
            </button>

            {/* Sub-tab switcher */}
            <div className="flex items-center gap-1 bg-[#060e20] p-1.5 rounded-2xl border border-blue-900/80 w-full sm:w-auto overflow-x-auto">
              <button
                id="admin-subtab-monitor"
                onClick={() => setActiveSubTab('monitor')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  activeSubTab === 'monitor'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>1. Memantau Live</span>
              </button>

              <button
                id="admin-subtab-manage"
                onClick={() => setActiveSubTab('manage')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  activeSubTab === 'manage'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>2. Ubah Data</span>
              </button>

              <button
                id="admin-subtab-report"
                onClick={() => setActiveSubTab('report')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  activeSubTab === 'report'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>3. Laporan & Ekspor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* ========================================================================= */}
        {/* SUBTAB 1: MEMANTAU (LIVE MONITORING DASHBOARD)                            */}
        {/* ========================================================================= */}
        {activeSubTab === 'monitor' && (
          <div className="space-y-6">
            {/* Top KPI Cards in Navy & Gold */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-[#0a1736] border border-blue-900/80 rounded-2xl p-4 shadow-lg">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  TOTAL TIKET
                </div>
                <div className="font-mono text-3xl font-black text-white mt-1">
                  {totalTickets}
                </div>
                <div className="text-[10px] text-amber-400 mt-0.5">Semua Layanan Hari Ini</div>
              </div>

              <div className="bg-[#0a1736] border border-blue-900/80 rounded-2xl p-4 shadow-lg">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  MENUNGGU
                </div>
                <div className="font-mono text-3xl font-black text-amber-400 mt-1">
                  {waitingTickets.length}
                </div>
                <div className="text-[10px] text-amber-300/80 mt-0.5">Dalam Ruang Tunggu</div>
              </div>

              <div className="bg-[#0a1736] border border-blue-900/80 rounded-2xl p-4 shadow-lg">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  DILAYANI
                </div>
                <div className="font-mono text-3xl font-black text-yellow-300 mt-1">
                  {servingTickets.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sedang di Meja Loket</div>
              </div>

              <div className="bg-[#0a1736] border border-blue-900/80 rounded-2xl p-4 shadow-lg">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  SELESAI
                </div>
                <div className="font-mono text-3xl font-black text-emerald-400 mt-1">
                  {finishedTickets.length}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">Pelayanan Tuntas</div>
              </div>

              <div className="bg-[#0a1736] border border-blue-900/80 rounded-2xl p-4 shadow-lg">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  RATA-RATA WAKTU
                </div>
                <div className="font-mono text-3xl font-black text-amber-400 mt-1">
                  {avgServiceTimeMinutes} <span className="text-sm font-sans font-bold">mnt</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Durasi per Pemohon</div>
              </div>

              <div className="bg-[#0a1736] border border-blue-900/80 rounded-2xl p-4 shadow-lg">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-amber-400" />
                  SMS GATEWAY
                </div>
                <div className="font-mono text-3xl font-black text-amber-300 mt-1">
                  {smsLogs.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Notifikasi Terkirim</div>
              </div>
            </div>

            {/* Counter Workload Matrix */}
            <div className="bg-[#0a1736] rounded-3xl p-6 border border-blue-900/80 shadow-xl">
              <div className="flex items-center justify-between border-b border-blue-900/60 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-400" />
                    PEMANTAUAN STATUS & BEBAN KERJA LOKET (LOKET 1 - 5)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kondisi operasional real-time setiap loket di Kantor Disdukcapil Keerom
                  </p>
                </div>
                <button
                  id="admin-refresh-data-btn"
                  onClick={onRefreshData}
                  className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan Data</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {counters.map(c => {
                  const currentT = tickets.find(t => t.id === c.currentTicketId);
                  const waitingForThis = tickets.filter(t => t.serviceCode === c.serviceCode && t.status === 'MENUNGGU').length;
                  const finishedForThis = tickets.filter(t => (t.counterAssigned === c.id || t.serviceCode === c.serviceCode) && t.status === 'SELESAI').length;

                  return (
                    <div
                      key={c.id}
                      className="bg-[#0e214d]/90 rounded-2xl p-4 border border-blue-900/80 flex flex-col justify-between gap-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                          {c.serviceCode}
                        </span>
                        <button
                          id={`admin-toggle-counter-${c.id}`}
                          onClick={() => handleToggleCounterOpen(c)}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition ${
                            c.isOpen
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-rose-900/30 hover:text-rose-300'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-emerald-900/30 hover:text-emerald-300'
                          }`}
                          title="Klik untuk Buka/Tutup Loket"
                        >
                          {c.isOpen ? 'LOKET BUKA' : 'LOKET TUTUP'}
                        </button>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-base text-white">{c.name}</h4>
                        <div className="text-xs text-slate-300 truncate mt-0.5">
                          {SERVICES_DATA.find(s => s.code === c.serviceCode)?.name}
                        </div>
                        <div className="text-[11px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          <span className="truncate">{c.officerName}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-blue-900/60 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">NOMOR AKTIF</div>
                          <div className="font-mono text-lg font-black text-amber-300">
                            {currentT ? currentT.ticketNumber : '- -'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Selesai / Antri</div>
                          <div className="font-mono text-sm font-bold text-white">
                            <span className="text-emerald-400">{finishedForThis}</span> / <span className="text-amber-400">{waitingForThis}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SMS Notification Live Log Stream */}
            <div className="bg-[#0a1736] rounded-3xl p-6 border border-blue-900/80 shadow-xl">
              <div className="flex items-center justify-between border-b border-blue-900/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-white text-base">
                    LOG PENGIRIMAN SMS GATEWAY TERBARU
                  </h3>
                </div>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  Status: {settings.smsEnabled ? 'Aktif (Otomatis)' : 'Non-Aktif'}
                </span>
              </div>

              {smsLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] uppercase bg-[#0d1d40] text-amber-300 border-b border-blue-900/80 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3">Nomor Antrian</th>
                        <th className="py-2.5 px-3">Nama Pemohon</th>
                        <th className="py-2.5 px-3">Nomor Ponsel</th>
                        <th className="py-2.5 px-3">Loket Panggilan</th>
                        <th className="py-2.5 px-3">Status Pengiriman</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/40">
                      {smsLogs.slice(0, 8).map(log => (
                        <tr key={log.id} className="hover:bg-[#0e214d]/60">
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString('id-ID')} WIT
                          </td>
                          <td className="py-2.5 px-3 font-mono font-black text-amber-300">
                            {log.ticketNumber}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-white">
                            {log.citizenName || '-'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 font-semibold">
                            {log.phoneNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {log.counterName}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              TERKIRIM (DELIVERED)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Belum ada log pengiriman SMS hari ini. SMS otomatis terkirim saat warga memasukkan nomor HP dan dipanggil di loket.
                </p>
              )}
            </div>

            {/* EKSPOR & ARSIP DATA PELAYANAN LOKAL (JSON & CSV) */}
            <div className="bg-gradient-to-br from-[#0c1a38] via-[#0e214d] to-[#0a1736] rounded-3xl p-6 border-2 border-amber-400/40 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-900/80 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center font-black shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">
                        EKSPOR & ARSIP DATA PELAYANAN LOKAL
                      </h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                        OFFLINE ARCHIVE READY
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Simpan seluruh data tiket antrian, riwayat panggilan loket, notifikasi SMS, dan statistik ke file lokal (JSON / CSV).
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => triggerExport('json')}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-400/20 transition shrink-0"
                >
                  <Archive className="w-4 h-4" />
                  <span>Unduh Master Backup (.JSON)</span>
                </button>
              </div>

              {/* 4 Format Export Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. JSON Master Archive */}
                <div className="bg-[#060e20] p-4 rounded-2xl border border-blue-900/80 flex flex-col justify-between hover:border-amber-400/50 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-400/30">
                        <FileCode className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                        .JSON
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs">Arsip Master Lengkap</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Seluruh dataset terstruktur: metadata dinas, {tickets.length} tiket, loket, log panggilan, SMS, dan statistik.
                    </p>
                  </div>
                  <button
                    id="export-btn-json-full"
                    onClick={() => triggerExport('json')}
                    className="mt-4 w-full py-2 bg-blue-950 hover:bg-amber-400 hover:text-slate-950 text-amber-300 font-bold rounded-xl text-xs border border-amber-400/40 flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh JSON</span>
                  </button>
                </div>

                {/* 2. CSV Data Antrian */}
                <div className="bg-[#060e20] p-4 rounded-2xl border border-blue-900/80 flex flex-col justify-between hover:border-emerald-400/50 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                        <FileSpreadsheet className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                        .CSV (Excel)
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs">Data Antrian Lengkap</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Daftar pemohon, NIK, No HP, asal distrik, jalur, status, durasi menit pelayanan, dan catatan petugas loket.
                    </p>
                  </div>
                  <button
                    id="export-btn-csv-tickets"
                    onClick={() => triggerExport('csv_tickets')}
                    className="mt-4 w-full py-2 bg-emerald-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 font-bold rounded-xl text-xs border border-emerald-500/40 flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh CSV Antrian</span>
                  </button>
                </div>

                {/* 3. CSV Log Panggilan & SMS */}
                <div className="bg-[#060e20] p-4 rounded-2xl border border-blue-900/80 flex flex-col justify-between hover:border-blue-400/50 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                        <Phone className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] text-blue-300 font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                        .CSV (Excel)
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs">Log Panggilan & SMS</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Catatan timestamp audit pemanggilan loket, frekuensi panggil ulang, dan rekap log SMS notifikasi.
                    </p>
                  </div>
                  <button
                    id="export-btn-csv-calls"
                    onClick={() => triggerExport('csv_calls')}
                    className="mt-4 w-full py-2 bg-blue-950 hover:bg-blue-500 hover:text-white text-blue-300 font-bold rounded-xl text-xs border border-blue-500/40 flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Log Panggilan</span>
                  </button>
                </div>

                {/* 4. CSV Rekapitulasi Statistik */}
                <div className="bg-[#060e20] p-4 rounded-2xl border border-blue-900/80 flex flex-col justify-between hover:border-purple-400/50 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/30">
                        <BarChart3 className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] text-purple-300 font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                        .CSV (Excel)
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs">Rekap Statistik Layanan</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Ringkasan KPI, total berkas per jenis loket & layanan, serta persentase distribusi asal distrik pemohon.
                    </p>
                  </div>
                  <button
                    id="export-btn-csv-stats"
                    onClick={() => triggerExport('csv_stats')}
                    className="mt-4 w-full py-2 bg-purple-950 hover:bg-purple-500 hover:text-white text-purple-300 font-bold rounded-xl text-xs border border-purple-500/40 flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Rekap Statistik</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: UBAH DATA & LOKET (CRUD & OVERRIDES)                            */}
        {/* ========================================================================= */}
        {activeSubTab === 'manage' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-[#0a1736] rounded-3xl p-5 border border-blue-900/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative min-w-[240px] flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari No Tiket, Nama, NIK, No HP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#060e20] text-xs rounded-xl border border-blue-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#060e20] text-xs px-3 py-2 rounded-xl border border-blue-900/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="MENUNGGU">Menunggu</option>
                  <option value="DIPANGGIL">Dipanggil</option>
                  <option value="SEDANG_DILAYANI">Sedang Dilayani</option>
                  <option value="SELESAI">Selesai</option>
                  <option value="TERLEWAT">Terlewat</option>
                  <option value="DIBATALKAN">Dibatalkan</option>
                </select>

                {/* Counter Filter */}
                <select
                  value={filterCounter}
                  onChange={(e) => setFilterCounter(e.target.value)}
                  className="bg-[#060e20] text-xs px-3 py-2 rounded-xl border border-blue-900/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="ALL">Semua Loket</option>
                  {counters.map(c => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name} ({c.serviceCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="admin-export-csv-direct-btn"
                  onClick={() => triggerExport('csv_tickets')}
                  className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Unduh data antrian ke CSV Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Ekspor CSV</span>
                </button>

                <button
                  id="admin-create-ticket-btn"
                  onClick={() => setShowCreateModal(true)}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Buat Tiket Manual / VIP</span>
                </button>

                <button
                  id="admin-restore-sample-data"
                  onClick={() => {
                    if (window.confirm('Pulihkan data simulasi antrian Disdukcapil Keerom?')) {
                      restoreSampleQueueData();
                      onRefreshData();
                    }
                  }}
                  className="px-3 py-2 bg-blue-950 hover:bg-blue-900 text-slate-200 border border-blue-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Pulihkan Data Sampel</span>
                </button>
              </div>
            </div>

            {/* Editable Tickets Table */}
            <div className="bg-[#0a1736] rounded-3xl border border-blue-900/80 overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-blue-900/60 flex items-center justify-between">
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  MANAJEMEN DATA TIKET ({filteredTickets.length} TIKET DITEMUKAN)
                </h3>
                <span className="text-xs text-slate-400">
                  Admin dapat mengedit biodata warga, nomor HP, status, atau memindahkan nomor ke loket lain
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0d1d40] text-amber-300 uppercase font-black tracking-wider text-[11px] border-b border-blue-900/80">
                    <tr>
                      <th className="py-3 px-4">No. Antrian</th>
                      <th className="py-3 px-4">Nama & NIK Warga</th>
                      <th className="py-3 px-4">No HP (SMS)</th>
                      <th className="py-3 px-4">Layanan & Loket</th>
                      <th className="py-3 px-4">Jalur</th>
                      <th className="py-3 px-4">Status Saat Ini</th>
                      <th className="py-3 px-4 text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/50">
                    {filteredTickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-[#0e214d]/70 transition">
                        {/* Ticket Number */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-base font-black text-amber-400">
                            {ticket.ticketNumber}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(ticket.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIT
                          </div>
                        </td>

                        {/* Citizen Name & NIK */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-sm">
                            {ticket.citizenName || 'Warga'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            NIK: {ticket.citizenNik || '-'}
                          </div>
                          {ticket.citizenDistrict && (
                            <div className="text-[10px] text-amber-300/80 mt-0.5">
                              Distrik {ticket.citizenDistrict}
                            </div>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 font-mono">
                          {ticket.citizenPhone ? (
                            <div className="text-emerald-400 font-bold flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{ticket.citizenPhone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Tanpa No. HP</span>
                          )}
                        </td>

                        {/* Service & Counter */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{ticket.serviceName}</div>
                          <div className="text-[11px] text-amber-400 font-medium">
                            {ticket.counterAssigned ? `Loket ${ticket.counterAssigned}` : `Ditujukan ke Kode [${ticket.serviceCode}]`}
                          </div>
                        </td>

                        {/* Queue Type */}
                        <td className="py-3 px-4">
                          {ticket.queueType === 'PRIORITAS' ? (
                            <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md text-[10px]">
                              PRIORITAS
                            </span>
                          ) : (
                            <span className="text-slate-400">Reguler</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            ticket.status === 'SELESAI'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : ticket.status === 'DIPANGGIL'
                              ? 'bg-amber-400 text-slate-950 animate-pulse'
                              : ticket.status === 'SEDANG_DILAYANI'
                              ? 'bg-blue-900 text-amber-300 border border-amber-400/40'
                              : ticket.status === 'MENUNGGU'
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              id={`admin-edit-ticket-${ticket.id}`}
                              onClick={() => setEditingTicket(ticket)}
                              title="Ubah Data Lengkap Tiket"
                              className="p-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-amber-300 border border-amber-400/40 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Complete */}
                            {ticket.status !== 'SELESAI' && (
                              <button
                                id={`admin-complete-ticket-${ticket.id}`}
                                onClick={() => handleQuickStatusChange(ticket, 'SELESAI')}
                                title="Tandai Selesai"
                                className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Quick Recall to Waiting */}
                            {ticket.status !== 'MENUNGGU' && (
                              <button
                                id={`admin-waiting-ticket-${ticket.id}`}
                                onClick={() => handleQuickStatusChange(ticket, 'MENUNGGU')}
                                title="Kembalikan ke Status Menunggu"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                            )}

                            {/* Delete Ticket */}
                            <button
                              id={`admin-delete-ticket-${ticket.id}`}
                              onClick={() => handleDeleteTicket(ticket.id, ticket.ticketNumber)}
                              title="Hapus Tiket"
                              className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredTickets.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Tidak ada data tiket yang cocok dengan filter atau pencarian Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Officer & Counter Management */}
            <div className="bg-[#0a1736] rounded-3xl p-6 border border-blue-900/80 shadow-xl">
              <div className="border-b border-blue-900/60 pb-3 mb-4">
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  PENGATURAN PETUGAS & OPERASIONAL LOKET
                </h3>
                <p className="text-xs text-slate-400">
                  Ubah nama pejabat/petugas yang bertugas di masing-masing loket
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {counters.map(c => (
                  <div key={c.id} className="bg-[#0d1d40] rounded-2xl p-4 border border-blue-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 text-sm">{c.name}</span>
                      <span className="text-[10px] bg-blue-950 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                        Kode {c.serviceCode}
                      </span>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Petugas Bertugas:</div>
                      <div className="text-sm font-bold text-white truncate mt-0.5">{c.officerName}</div>
                    </div>

                    <button
                      id={`admin-edit-officer-btn-${c.id}`}
                      onClick={() => setShowEditCounterModal(c)}
                      className="w-full py-1.5 rounded-xl text-xs font-bold bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/30 transition flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Ganti Petugas</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Maintenance Area */}
            <div className="bg-rose-950/20 border border-rose-900/50 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  TINDAKAN DARURAT ADMINISTRATOR
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reset antrian harian membersihkan seluruh data tiket hari ini (gunakan di akhir jam pelayanan).
                </p>
              </div>

              <button
                id="admin-reset-all-queue-btn"
                onClick={() => {
                  if (window.confirm('PERINGATAN: Anda akan mereset seluruh antrian hari ini menjadi kosong. Lanjutkan?')) {
                    resetQueueData();
                    onRefreshData();
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Antrian Hari Ini</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: PRINTOUT LAPORAN RESMI (OFFICIAL REPORT PRINTOUT)               */}
        {/* ========================================================================= */}
        {activeSubTab === 'report' && (
          <div className="space-y-6">
            {/* Control Bar for Report */}
            <div className="bg-[#0a1736] rounded-3xl p-5 border border-blue-900/80 flex flex-wrap items-center justify-between gap-4 shadow-xl no-print">
              <div>
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-400" />
                  LAPORAN RESMI & ARSIP DIGITAL DISDUKCAPIL KEEROM
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cetak dokumen berkop resmi (PDF/Kertas) atau unduh arsip data elektronik (JSON / CSV).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  id="admin-export-json-report-btn"
                  onClick={() => triggerExport('json')}
                  className="px-3 py-2 bg-blue-950 hover:bg-blue-900 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  title="Unduh seluruh arsip data sistem (.JSON)"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Arsip JSON</span>
                </button>

                <button
                  id="admin-export-csv-report-btn"
                  onClick={() => triggerExport('csv_tickets')}
                  className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  title="Unduh data antrian tabular (.CSV)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV Antrian</span>
                </button>

                <button
                  id="admin-export-stats-report-btn"
                  onClick={() => triggerExport('csv_stats')}
                  className="px-3 py-2 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  title="Unduh rekapitulasi statistik (.CSV)"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>CSV Statistik</span>
                </button>

                <button
                  id="admin-print-official-btn"
                  onClick={handlePrintOfficialReport}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-400/30 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Laporan (Print / PDF)</span>
                </button>
              </div>
            </div>

            {/* The Printable Official Report Container */}
            <div 
              id="printable-report"
              className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-300 max-w-5xl mx-auto font-serif"
            >
              {/* Kop Surat Resmi Disdukcapil Keerom */}
              <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 flex items-center justify-between gap-6">
                <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                  <KeeromLogo size="lg" />
                </div>

                <div className="text-center flex-1">
                  <h3 className="text-sm sm:text-base font-bold tracking-wider text-slate-800 uppercase">
                    PEMERINTAH KABUPATEN KEEROM
                  </h3>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                    DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL
                  </h2>
                  <p className="text-xs text-slate-700 font-sans mt-0.5">
                    Kompleks Kantor Bupati Keerom, Jl. Trans Papua, Arso Kota, Kabupaten Keerom - Provinsi Papua
                  </p>
                  <p className="text-[11px] text-slate-600 font-sans">
                    Laman: disdukcapil.keeromkab.go.id • Pos-el: dukcapil@keeromkab.go.id • Kode Pos: 99368
                  </p>
                </div>

                <div className="w-20 h-20 shrink-0 hidden sm:flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center text-center p-1">
                    <span className="text-[9px] font-bold font-sans uppercase leading-tight">
                      GISA KEEROM
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="text-center mb-6">
                <h3 className="text-base sm:text-lg font-black uppercase underline decoration-2 underline-offset-4 tracking-wide text-slate-950">
                  LAPORAN REKAPITULASI PELAYANAN ADMINISTRASI KEPENDUDUKAN
                </h3>
                <div className="text-xs font-sans text-slate-600 mt-1">
                  Nomor: 470 / {new Date().getFullYear()} / DUKCAPIL-KRM
                </div>
                <div className="text-xs font-sans text-slate-700 font-semibold mt-0.5">
                  Tanggal Laporan: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Summary Stats Table */}
              <div className="font-sans mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
                  I. RINGKASAN VOLUME PELAYANAN HARI INI
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                    <div className="text-[11px] text-slate-600 font-semibold">TOTAL PEMOHON</div>
                    <div className="text-xl font-bold text-slate-900">{totalTickets} Orang</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                    <div className="text-[11px] text-slate-600 font-semibold">TERLAYANI SELESAI</div>
                    <div className="text-xl font-bold text-emerald-800">{finishedTickets.length} Berkas</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                    <div className="text-[11px] text-slate-600 font-semibold">ANTRIAN MENUNGGU</div>
                    <div className="text-xl font-bold text-amber-800">{waitingTickets.length} Orang</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                    <div className="text-[11px] text-slate-600 font-semibold">RATA-RATA WAKTU LAYANAN</div>
                    <div className="text-xl font-bold text-slate-900">{avgServiceTimeMinutes} Menit</div>
                  </div>
                </div>
              </div>

              {/* Table per Loket */}
              <div className="font-sans mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
                  II. REKAPITULASI PELAYANAN PER LOKET
                </h4>
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border border-slate-300">Loket</th>
                      <th className="p-2 border border-slate-300">Jenis Layanan</th>
                      <th className="p-2 border border-slate-300">Petugas Bertugas</th>
                      <th className="p-2 border border-slate-300 text-center">Selesai</th>
                      <th className="p-2 border border-slate-300 text-center">Menunggu</th>
                      <th className="p-2 border border-slate-300 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counters.map(c => {
                      const service = SERVICES_DATA.find(s => s.code === c.serviceCode);
                      const fin = tickets.filter(t => (t.counterAssigned === c.id || t.serviceCode === c.serviceCode) && t.status === 'SELESAI').length;
                      const wait = tickets.filter(t => t.serviceCode === c.serviceCode && t.status === 'MENUNGGU').length;
                      const tot = tickets.filter(t => t.serviceCode === c.serviceCode).length;

                      return (
                        <tr key={c.id} className="border-b border-slate-200">
                          <td className="p-2 border border-slate-300 font-bold">{c.name}</td>
                          <td className="p-2 border border-slate-300">{service?.name}</td>
                          <td className="p-2 border border-slate-300">{c.officerName}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">{fin}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-amber-800">{wait}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold">{tot}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table per District */}
              <div className="font-sans mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
                  III. REKAPITULASI ASAL DISTRIK WARGA PEMOHON
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {KEEROM_DISTRICTS.map(district => {
                    const count = tickets.filter(t => t.citizenDistrict === district).length;
                    return (
                      <div key={district} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded">
                        <span>Distrik {district}:</span>
                        <span className="font-bold">{count} orang</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Signatures Block */}
              <div className="font-sans pt-6 border-t border-slate-300 flex items-start justify-between text-xs">
                <div className="text-center w-64">
                  <div>Petugas Pelapor / Administrator,</div>
                  <div className="h-20" />
                  <div className="font-bold underline text-slate-900">ADMINISTRATOR SISTEM</div>
                  <div className="text-slate-600 text-[11px]">NIP. 19850412 201001 1 014</div>
                </div>

                <div className="text-center w-64">
                  <div>Keerom, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div className="font-semibold text-slate-800">Mengetahui,</div>
                  <div>Kepala Dinas Kependudukan dan Pencatatan Sipil</div>
                  <div>Kabupaten Keerom</div>
                  <div className="h-16" />
                  <div className="font-bold underline text-slate-900">NIKOLAUS T. RUMAROPEN, S.Sos., M.Si</div>
                  <div className="text-slate-600 text-[11px]">Pembina Utama Muda (IV/c)</div>
                  <div className="text-slate-600 text-[11px]">NIP. 19710315 199803 1 007</div>
                </div>
              </div>

              {/* Print Document Footnote */}
              <div className="mt-8 pt-2 border-t border-dotted border-slate-300 text-[10px] text-slate-400 font-sans flex items-center justify-between">
                <span>Dokumen Resmi Disdukcapil Kabupaten Keerom • Semboyan: "Tamne Yisan Kefase"</span>
                <span>Sistem Antrian dikembangkan oleh: <strong>heraX (082189585776)</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT TICKET                                                        */}
      {/* ========================================================================= */}
      {editingTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1736] border-2 border-amber-400/80 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-blue-900/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">
                  Ubah Data Tiket: {editingTicket.ticketNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingTicket(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTicketEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Warga Pemohon:</label>
                <input
                  type="text"
                  value={editingTicket.citizenName || ''}
                  onChange={(e) => setEditingTicket({ ...editingTicket, citizenName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400"
                  placeholder="Nama Lengkap"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">NIK 16 Digit:</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={editingTicket.citizenNik || ''}
                    onChange={(e) => setEditingTicket({ ...editingTicket, citizenNik: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white font-mono focus:ring-2 focus:ring-amber-400"
                    placeholder="9111..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">No. HP / WA (SMS):</label>
                  <input
                    type="tel"
                    value={editingTicket.citizenPhone || ''}
                    onChange={(e) => setEditingTicket({ ...editingTicket, citizenPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white font-mono focus:ring-2 focus:ring-amber-400"
                    placeholder="0812..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Distrik Asal:</label>
                  <select
                    value={editingTicket.citizenDistrict || 'Arso'}
                    onChange={(e) => setEditingTicket({ ...editingTicket, citizenDistrict: e.target.value })}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400"
                  >
                    {KEEROM_DISTRICTS.map(d => (
                      <option key={d} value={d}>Distrik {d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jalur Antrian:</label>
                  <select
                    value={editingTicket.queueType}
                    onChange={(e) => setEditingTicket({ ...editingTicket, queueType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="REGULER">Reguler (Umum)</option>
                    <option value="PRIORITAS">Prioritas (Lansia/Disabilitas/Ibu Hamil)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Status Antrian:</label>
                  <select
                    value={editingTicket.status}
                    onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400 font-bold"
                  >
                    <option value="MENUNGGU">MENUNGGU</option>
                    <option value="DIPANGGIL">DIPANGGIL</option>
                    <option value="SEDANG_DILAYANI">SEDANG DILAYANI</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="TERLEWAT">TERLEWAT</option>
                    <option value="DIBATALKAN">DIBATALKAN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pindahkan ke Layanan/Loket:</label>
                  <select
                    value={editingTicket.serviceCode}
                    onChange={(e) => {
                      const newCode = e.target.value as any;
                      const s = SERVICES_DATA.find(item => item.code === newCode);
                      if (s) {
                        setEditingTicket({
                          ...editingTicket,
                          serviceCode: newCode,
                          serviceCategory: s.id,
                          serviceName: s.name,
                          counterAssigned: s.defaultCounter
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400"
                  >
                    {SERVICES_DATA.map(s => (
                      <option key={s.code} value={s.code}>
                        [{s.code}] {s.name} (Loket {s.defaultCounter})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/80">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  id="admin-save-ticket-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 shadow-md shadow-amber-400/30"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE MANUAL TICKET                                               */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1736] border-2 border-amber-400/80 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-blue-900/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">
                  Buat Tiket Manual / Prioritas Khusus
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Pilih Layanan Loket:</label>
                <select
                  value={newTicketService}
                  onChange={(e) => setNewTicketService(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400"
                >
                  {SERVICES_DATA.map(s => (
                    <option key={s.code} value={s.code}>
                      [{s.code}] {s.name} (Loket {s.defaultCounter})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Pemohon (Wajib):</label>
                <input
                  type="text"
                  required
                  value={newTicketName}
                  onChange={(e) => setNewTicketName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400"
                  placeholder="Contoh: Barnabas Wenda"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">NIK 16 Digit (Opsional):</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={newTicketNik}
                    onChange={(e) => setNewTicketNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white font-mono focus:ring-2 focus:ring-amber-400"
                    placeholder="9111..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">No HP / WA (SMS):</label>
                  <input
                    type="tel"
                    value={newTicketPhone}
                    onChange={(e) => setNewTicketPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white font-mono focus:ring-2 focus:ring-amber-400"
                    placeholder="0812..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Distrik Asal:</label>
                  <select
                    value={newTicketDistrict}
                    onChange={(e) => setNewTicketDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400"
                  >
                    {KEEROM_DISTRICTS.map(d => (
                      <option key={d} value={d}>Distrik {d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jalur Pelayanan:</label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400 font-bold"
                  >
                    <option value="REGULER">Reguler</option>
                    <option value="PRIORITAS">Prioritas Khusus (Lansia / Disabilitas)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/80">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  id="admin-submit-create-ticket"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 shadow-md shadow-amber-400/30"
                >
                  Terbitkan Tiket Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT COUNTER OFFICER                                               */}
      {/* ========================================================================= */}
      {showEditCounterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1736] border-2 border-amber-400/80 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-blue-900/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">
                  Pengaturan {showEditCounterModal.name}
                </h3>
              </div>
              <button
                onClick={() => setShowEditCounterModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCounter} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Petugas Bertugas:</label>
                <input
                  type="text"
                  required
                  value={showEditCounterModal.officerName}
                  onChange={(e) => setShowEditCounterModal({ ...showEditCounterModal, officerName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#060e20] border border-blue-900 rounded-xl text-white focus:ring-2 focus:ring-amber-400"
                  placeholder="Nama & Gelar Petugas"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Status Operasional Loket:</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isOpen"
                      checked={showEditCounterModal.isOpen}
                      onChange={() => setShowEditCounterModal({ ...showEditCounterModal, isOpen: true })}
                      className="text-amber-400"
                    />
                    <span className="text-emerald-300 font-bold">LOKET BUKA</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isOpen"
                      checked={!showEditCounterModal.isOpen}
                      onChange={() => setShowEditCounterModal({ ...showEditCounterModal, isOpen: false })}
                      className="text-amber-400"
                    />
                    <span className="text-rose-300 font-bold">LOKET TUTUP</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/80">
                <button
                  type="button"
                  onClick={() => setShowEditCounterModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  id="admin-save-counter-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 shadow-md shadow-amber-400/30"
                >
                  Simpan Petugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPORT & ARSIP DATA MODAL (DOWNLOAD JSON / CSV FOR LOCAL ARCHIVE)         */}
      {/* ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1736] border-2 border-amber-400/70 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-400/20">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  PUSAT EKSPOR & ARSIP DATA LOKAL
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Unduh seluruh database antrian, log panggilan, notifikasi SMS, dan statistik ke komputer Anda.
                </p>
              </div>
            </div>

            {/* Quick Data Summary Badge */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 bg-[#060e20] p-3 rounded-2xl border border-blue-900/80 text-center">
              <div className="p-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Tiket</div>
                <div className="font-mono text-lg font-black text-amber-300">{tickets.length}</div>
              </div>
              <div className="p-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Loket Aktif</div>
                <div className="font-mono text-lg font-black text-white">{counters.filter(c => c.isOpen).length} / {counters.length}</div>
              </div>
              <div className="p-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">SMS Terkirim</div>
                <div className="font-mono text-lg font-black text-emerald-400">{smsLogs.length}</div>
              </div>
              <div className="p-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Format File</div>
                <div className="font-mono text-xs font-bold text-amber-400 mt-1">JSON & CSV</div>
              </div>
            </div>

            {/* Export List Options */}
            <div className="space-y-3">
              {/* Option 1: Master JSON Archive */}
              <div className="bg-[#060e20] p-4 rounded-2xl border border-blue-900/80 hover:border-amber-400/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Arsip Master Lengkap (.JSON)</h4>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded font-bold">
                        RECOMMENDED BACKUP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Berisi seluruh struktur data sistem: profil dinas, semua data tiket, status loket, log panggilan, log SMS, dan ringkasan statistik.
                    </p>
                  </div>
                </div>
                <button
                  id="modal-export-json-btn"
                  onClick={() => triggerExport('json')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 transition shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh JSON</span>
                </button>
              </div>

              {/* Option 2: Tickets CSV */}
              <div className="bg-[#060e20] p-4 rounded-2xl border border-blue-900/80 hover:border-emerald-400/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Data Antrian Tabular (.CSV)</h4>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded font-bold">
                        EXCEL / SPREADSHEET
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tabel rinci seluruh nomor antrian, nama pemohon, NIK, HP, distrik, waktu ambil tiket, waktu dipanggil, durasi selesai, dan catatan petugas.
                    </p>
                  </div>
                </div>
                <button
                  id="modal-export-csv-tickets-btn"
                  onClick={() => triggerExport('csv_tickets')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 font-bold rounded-xl text-xs border border-emerald-500/40 flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh CSV Antrian</span>
                </button>
              </div>

              {/* Option 3: Call & SMS Logs CSV */}
              <div className="bg-[#060e20] p-4 rounded-2xl border border-blue-900/80 hover:border-blue-400/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Log Panggilan Loket & SMS (.CSV)</h4>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded font-bold">
                        AUDIT LOG
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Jejak audit pemanggilan nomor di tiap loket (waktu panggil, nama petugas, counter) beserta riwayat SMS pengingat warga.
                    </p>
                  </div>
                </div>
                <button
                  id="modal-export-csv-calls-btn"
                  onClick={() => triggerExport('csv_calls')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-950 hover:bg-blue-500 hover:text-white text-blue-300 font-bold rounded-xl text-xs border border-blue-500/40 flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Log CSV</span>
                </button>
              </div>

              {/* Option 4: Summary Stats CSV */}
              <div className="bg-[#060e20] p-4 rounded-2xl border border-blue-900/80 hover:border-purple-400/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Rekapitulasi Statistik (.CSV)</h4>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded font-bold">
                        EXECUTIVE SUMMARY
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ringkasan eksekutif KPI pelayanan harian, rincian per loket dan layanan, serta sebaran persentase distrik pemohon.
                    </p>
                  </div>
                </div>
                <button
                  id="modal-export-csv-stats-btn"
                  onClick={() => triggerExport('csv_stats')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-purple-950 hover:bg-purple-500 hover:text-white text-purple-300 font-bold rounded-xl text-xs border border-purple-500/40 flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Statistik CSV</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-5 mt-6 border-t border-blue-900/80">
              <span className="text-[11px] text-slate-400">
                File otomatis diformat dengan UTF-8 BOM agar rapi saat dibuka di Microsoft Excel.
              </span>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-slate-200 border border-blue-800 font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
