import React, { useState } from 'react';
import { Ticket, QueueStatus } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  Search, 
  Printer, 
  Clock, 
  User, 
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

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (serviceFilter !== 'ALL' && t.serviceCode !== serviceFilter) return false;

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

  const getStatusIndicator = (status: QueueStatus) => {
    switch (status) {
      case 'MENUNGGU':
        return <span className="text-amber-400 font-medium">● Menunggu</span>;
      case 'DIPANGGIL':
        return <span className="text-amber-300 font-bold animate-pulse">● Dipanggil</span>;
      case 'SEDANG_DILAYANI':
        return <span className="text-emerald-400 font-semibold">● Sedang Dilayani</span>;
      case 'SELESAI':
        return <span className="text-slate-400">● Selesai</span>;
      case 'TERLEWAT':
        return <span className="text-rose-400">● Terlewat</span>;
      case 'DIBATALKAN':
        return <span className="text-slate-500">● Dibatalkan</span>;
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#060d1e] py-8 px-4 sm:px-6 lg:px-8 text-slate-100 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Track Ticket Card for Citizens */}
        <div className="bg-[#0a1633]/80 rounded-2xl p-6 border border-blue-900/50 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                <span>Pelacakan Mandiri</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Posisi Antrian Warga</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Lacak Status Nomor Antrian Anda
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Ketik nomor tiket Anda (contoh: A004 atau B002) untuk memantau status secara langsung.
              </p>
            </div>

            <form onSubmit={handleTrackTicket} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                id="search-ticket-input"
                placeholder="Contoh: A004"
                value={checkTicketNumber}
                onChange={(e) => setCheckTicketNumber(e.target.value.toUpperCase())}
                className="px-4 py-2.5 bg-[#060e20] text-white border border-blue-900/80 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 uppercase w-full md:w-44 tabular-nums"
              />
              <button
                type="submit"
                id="search-ticket-submit-btn"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition shrink-0"
              >
                Cari Tiket
              </button>
            </form>
          </div>

          {/* Tracked ticket result */}
          {trackedTicket && (
            <div className="mt-5 p-4 bg-[#060e20] rounded-xl border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono font-bold text-xl flex items-center justify-center tabular-nums">
                  {trackedTicket.ticketNumber}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{trackedTicket.serviceName}</span>
                    <span className="text-xs">{getStatusIndicator(trackedTicket.status)}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {trackedTicket.citizenName ? `Pemohon: ${trackedTicket.citizenName}` : 'Tiket Warga'}
                    {trackedTicket.counterAssigned && ` · Diarahkan ke Loket ${trackedTicket.counterAssigned}`}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onPrintTicket(trackedTicket)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0a1633] hover:bg-[#0e214d] text-amber-300 border border-blue-900/80 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Lihat Struk Tiket</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#0a1633]/80 rounded-2xl p-4 border border-blue-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="queue-list-search-all"
              placeholder="Cari nomor, nama, NIK, distrik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#060e20] text-white border border-blue-900/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  statusFilter === f.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#060e20]'
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
              className="px-3 py-2 text-xs bg-[#060e20] text-white border border-blue-900/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 w-full md:w-auto"
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
        <div className="bg-[#0a1633]/80 rounded-2xl border border-blue-900/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#060e20] border-b border-blue-900/60 text-slate-400 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-5">No. Tiket</th>
                  <th className="py-3 px-4">Layanan</th>
                  <th className="py-3 px-4">Warga & Distrik</th>
                  <th className="py-3 px-4">Jalur</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Waktu Ambil</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/30">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#0e214d]/40 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-amber-400 text-sm tabular-nums">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{ticket.serviceName}</div>
                      <div className="text-[11px] text-slate-400">
                        {ticket.counterAssigned ? `Loket ${ticket.counterAssigned}` : 'Belum diarahkan'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-100">
                        {ticket.citizenName || 'Warga'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ticket.citizenDistrict ? `Distrik ${ticket.citizenDistrict}` : '-'}
                        {ticket.citizenNik && ` · NIK: ${ticket.citizenNik}`}
                      </div>
                      {ticket.citizenPhone && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{ticket.citizenPhone}</span>
                          {ticket.smsSent && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              · SMS Terkirim
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {ticket.queueType === 'PRIORITAS' ? (
                        <span className="text-xs font-semibold text-amber-400">
                          Jalur Prioritas
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Reguler
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusIndicator(ticket.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-xs tabular-nums">
                      {new Date(ticket.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIT
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onPrintTicket(ticket)}
                        title="Cetak Slip Tiket"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
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
