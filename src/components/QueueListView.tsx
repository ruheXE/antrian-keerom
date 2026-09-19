import React, { useState } from 'react';
import { Ticket, QueueStatus, ServiceCategory } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  Search, 
  Filter, 
  Printer, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  FileText,
  HelpCircle,
  TrendingUp,
  MapPin,
  MessageSquare,
  Phone
} from 'lucide-react';

interface QueueListViewProps {
  tickets: Ticket[];
  onPrintTicket: (ticket: Ticket) => void;
}

export const QueueListView: React.FC<QueueListViewProps> = ({
  tickets,
  onPrintTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [checkTicketNumber, setCheckTicketNumber] = useState('');
  const [trackedTicket, setTrackedTicket] = useState<Ticket | null>(null);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    // Status filter
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    // Service filter
    if (serviceFilter !== 'ALL' && t.serviceCode !== serviceFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = t.ticketNumber.toLowerCase().includes(q);
      const matchName = t.citizenName ? t.citizenName.toLowerCase().includes(q) : false;
      const matchNik = t.citizenNik ? t.citizenNik.includes(q) : false;
      const matchDistrict = t.citizenDistrict ? t.citizenDistrict.toLowerCase().includes(q) : false;
      return matchNumber || matchName || matchNik || matchDistrict;
    }

    return true;
  });

  const handleTrackTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkTicketNumber.trim()) return;
    const found = tickets.find(
      t => t.ticketNumber.toLowerCase() === checkTicketNumber.trim().toLowerCase()
    );
    setTrackedTicket(found || null);
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'MENUNGGU':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Menunggu</span>;
      case 'DIPANGGIL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-white animate-pulse">Dipanggil</span>;
      case 'SEDANG_DILAYANI':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Sedang Dilayani</span>;
      case 'SELESAI':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Selesai</span>;
      case 'TERLEWAT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Terlewat</span>;
      case 'DIBATALKAN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Dibatalkan</span>;
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-130px)] bg-[#071126] py-6 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Track My Ticket Card for Citizens in Navy & Yellow */}
        <div className="bg-gradient-to-r from-[#0a1736] via-[#0f2352] to-[#0a1736] text-white rounded-3xl p-6 shadow-xl border-2 border-amber-400/40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 text-amber-400 text-xs font-bold mb-1 border border-amber-400/40">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                Cek Posisi Antrian Warga
              </div>
              <h3 className="text-xl font-black text-white">
                Lacak Status Nomor Antrian Anda
              </h3>
              <p className="text-xs text-slate-300">
                Ketik nomor tiket Anda (contoh: A-004 atau B-002) untuk melihat status dan sisa antrian di depan Anda.
              </p>
            </div>

            <form onSubmit={handleTrackTicket} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                id="search-ticket-input"
                placeholder="Contoh: A-004"
                value={checkTicketNumber}
                onChange={(e) => setCheckTicketNumber(e.target.value.toUpperCase())}
                className="px-4 py-2.5 bg-[#07132c] text-white border border-blue-900 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 uppercase w-full md:w-44 placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
              />
              <button
                type="submit"
                id="search-ticket-submit-btn"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm transition shrink-0 shadow-md shadow-amber-400/20"
              >
                Cari Tiket
              </button>
            </form>
          </div>

          {/* Tracked ticket result dialog / alert */}
          {trackedTicket && (
            <div className="mt-5 p-4 bg-[#07132c] rounded-2xl border-2 border-amber-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xl flex items-center justify-center shadow-md">
                  {trackedTicket.ticketNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{trackedTicket.serviceName}</span>
                    {getStatusBadge(trackedTicket.status)}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {trackedTicket.citizenName ? `Atas Nama: ${trackedTicket.citizenName}` : 'Tiket Reguler'}
                    {trackedTicket.counterAssigned && ` • Diarahkan ke Loket ${trackedTicket.counterAssigned}`}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onPrintTicket(trackedTicket)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0e214d] hover:bg-[#12285a] text-amber-300 border border-blue-800 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Lihat Slip Tiket</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#0a1736] rounded-2xl p-4 border border-blue-900 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="queue-list-search-all"
              placeholder="Cari nomor, nama, NIK, distrik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#07132c] text-white border border-blue-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'MENUNGGU', label: 'Menunggu' },
              { id: 'DIPANGGIL', label: 'Dipanggil' },
              { id: 'SEDANG_DILAYANI', label: 'Dilayani' },
              { id: 'SELESAI', label: 'Selesai' },
              { id: 'TERLEWAT', label: 'Terlewat' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  statusFilter === f.id
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'bg-[#07132c] hover:bg-[#0e214d] text-slate-300 border border-blue-900/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-[#07132c] text-white border border-blue-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 w-full md:w-auto"
            >
              <option value="ALL">Semua Pelayanan (A - E)</option>
              {SERVICES_DATA.map((s) => (
                <option key={s.code} value={s.code}>
                  [{s.code}] {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table of Tickets */}
        <div className="bg-[#0a1736] rounded-3xl border-2 border-blue-900 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#07132c] border-b border-blue-900 text-amber-400 font-extrabold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">No. Tiket</th>
                  <th className="py-3.5 px-4">Layanan</th>
                  <th className="py-3.5 px-4">Warga & Distrik</th>
                  <th className="py-3.5 px-4">Jalur</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Waktu Ambil</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/50">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#0e214d]/60 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-black text-amber-400 text-sm sm:text-base">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{ticket.serviceName}</div>
                      <div className="text-[11px] text-slate-400">
                        {ticket.counterAssigned ? `Loket ${ticket.counterAssigned}` : 'Belum ditentukan'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-100">
                        {ticket.citizenName || 'Warga'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ticket.citizenDistrict ? `Distrik ${ticket.citizenDistrict}` : '-'}
                        {ticket.citizenNik && ` • NIK: ${ticket.citizenNik}`}
                      </div>
                      {ticket.citizenPhone && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{ticket.citizenPhone}</span>
                          {ticket.smsSent ? (
                            <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 px-1 rounded font-sans font-bold flex items-center gap-0.5">
                              <MessageSquare className="w-2.5 h-2.5" /> SMS Terkirim
                            </span>
                          ) : (
                            <span className="text-[9px] bg-blue-950 text-slate-300 px-1 rounded font-sans">
                              SMS Siap
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {ticket.queueType === 'PRIORITAS' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/40">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Prioritas
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-300 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-900">
                          Reguler
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                      {new Date(ticket.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIT
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onPrintTicket(ticket)}
                        title="Cetak Ulang Tiket"
                        className="inline-flex items-center gap-1 p-2 text-amber-400 hover:text-white hover:bg-blue-950 rounded-lg transition"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                      Tidak ada antrian yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
