import React, { useState } from 'react';
import { Ticket, CounterInfo } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  Printer, 
  RotateCcw, 
  MapPin, 
  FileSpreadsheet 
} from 'lucide-react';

interface StatsViewProps {
  tickets: Ticket[];
  counters: CounterInfo[];
  onResetData: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  tickets,
  counters,
  onResetData,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Aggregates
  const total = tickets.length;
  const waiting = tickets.filter(t => t.status === 'MENUNGGU').length;
  const calling = tickets.filter(t => t.status === 'DIPANGGIL').length;
  const serving = tickets.filter(t => t.status === 'SEDANG_DILAYANI').length;
  const completed = tickets.filter(t => t.status === 'SELESAI').length;
  const skipped = tickets.filter(t => t.status === 'TERLEWAT').length;
  const priorityCount = tickets.filter(t => t.queueType === 'PRIORITAS').length;

  // Average service duration calculation for completed tickets
  const completedTickets = tickets.filter(t => t.status === 'SELESAI' && t.servedAt && t.finishedAt);
  let avgServiceMinutes = 0;
  if (completedTickets.length > 0) {
    const totalDurationMs = completedTickets.reduce((acc, t) => {
      const start = new Date(t.servedAt!).getTime();
      const end = new Date(t.finishedAt!).getTime();
      return acc + (end - start);
    }, 0);
    avgServiceMinutes = Math.round((totalDurationMs / completedTickets.length) / 60000);
  }

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Nomor Antrian',
      'Kode Layanan',
      'Nama Layanan',
      'Jalur',
      'Nama Warga',
      'NIK',
      'No HP / WA',
      'Status Notifikasi SMS',
      'Distrik',
      'Loket',
      'Status',
      'Waktu Ambil',
      'Waktu Panggil',
      'Waktu Selesai',
      'Catatan Petugas'
    ];

    const rows = tickets.map(t => [
      t.ticketNumber,
      t.serviceCode,
      `"${t.serviceName}"`,
      t.queueType,
      `"${t.citizenName || '-'}"`,
      `'${t.citizenNik || '-'}`,
      `'${t.citizenPhone || '-'}`,
      t.smsSent ? 'SMS TERKIRIM' : (t.citizenPhone ? 'TERDAFTAR' : 'TIDAK AKTIF'),
      `"${t.citizenDistrict || '-'}"`,
      t.counterAssigned ? `Loket ${t.counterAssigned}` : '-',
      t.status,
      new Date(t.createdAt).toLocaleString('id-ID'),
      t.calledAt ? new Date(t.calledAt).toLocaleString('id-ID') : '-',
      t.finishedAt ? new Date(t.finishedAt).toLocaleString('id-ID') : '-',
      `"${t.officerNotes || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Rekap_Antrian_Dukcapil_Keerom_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#060d1e] py-8 px-4 sm:px-6 lg:px-8 text-slate-100 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Top Header & Actions */}
        <div className="bg-[#0a1633]/80 rounded-2xl p-6 border border-blue-900/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <span>Laporan Operasional Harian</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Disdukcapil Kabupaten Keerom</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Statistik Pelayanan & Rekapitulasi Loket
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Ringkasan aktivitas tiket, estimasi beban kerja loket, dan demografi distrik pemohon adminduk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="export-csv-btn"
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              id="print-summary-btn"
              onClick={handlePrintSummary}
              className="flex items-center gap-2 px-4 py-2 bg-[#060e20] hover:bg-[#0e214d] text-slate-200 border border-blue-900/80 rounded-xl text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak Laporan</span>
            </button>

            <button
              id="reset-queue-open-modal-btn"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Harian</span>
            </button>
          </div>
        </div>

        {/* 6 High-Contrast Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-[#0a1633]/80 p-4 rounded-2xl border border-blue-900/50 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400">Total Antrian</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1 font-mono tabular-nums">
              {total}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Hari ini</div>
          </div>

          <div className="bg-[#0a1633]/80 p-4 rounded-2xl border border-blue-900/50 shadow-xs">
            <span className="text-[11px] font-medium text-amber-400">Menunggu</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 font-mono tabular-nums">
              {waiting}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Belum dipanggil</div>
          </div>

          <div className="bg-[#0a1633]/80 p-4 rounded-2xl border border-blue-900/50 shadow-xs">
            <span className="text-[11px] font-medium text-blue-400">Sedang Dilayani</span>
            <div className="text-2xl sm:text-3xl font-bold text-blue-300 mt-1 font-mono tabular-nums">
              {serving + calling}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Di meja loket</div>
          </div>

          <div className="bg-[#0a1633]/80 p-4 rounded-2xl border border-blue-900/50 shadow-xs">
            <span className="text-[11px] font-medium text-emerald-400">Tuntas Selesai</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 font-mono tabular-nums">
              {completed}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Pelayanan tuntas</div>
          </div>

          <div className="bg-[#0a1633]/80 p-4 rounded-2xl border border-blue-900/50 shadow-xs">
            <span className="text-[11px] font-medium text-rose-400">Terlewat</span>
            <div className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1 font-mono tabular-nums">
              {skipped}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Tidak hadir</div>
          </div>

          <div className="bg-[#0a1633]/80 p-4 rounded-2xl border border-blue-900/50 shadow-xs">
            <span className="text-[11px] font-medium text-amber-300">Jalur Prioritas</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-300 mt-1 font-mono tabular-nums">
              {priorityCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Lansia/Hamil/Difabel</div>
          </div>
        </div>

        {/* Counter Breakdown Grid */}
        <div className="bg-[#0a1633]/80 rounded-2xl p-6 border border-blue-900/50 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-blue-900/40 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Rekapitulasi Beban Kerja per Meja Loket
            </h2>
            <div className="text-xs text-slate-400">
              Rata-rata Waktu Layanan: <span className="text-white font-mono font-semibold tabular-nums">{avgServiceMinutes > 0 ? `~${avgServiceMinutes} menit` : 'Belum tercatat'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {counters.map((c) => {
              const counterTickets = tickets.filter(t => t.serviceCode === c.serviceCode);
              const cTotal = counterTickets.length;
              const cCompleted = counterTickets.filter(t => t.status === 'SELESAI').length;
              const cWaiting = counterTickets.filter(t => t.status === 'MENUNGGU').length;
              const percentage = total > 0 ? Math.round((cTotal / total) * 100) : 0;
              const service = SERVICES_DATA.find(s => s.code === c.serviceCode);

              return (
                <div key={c.id} className="bg-[#060e20] p-4 rounded-xl border border-blue-900/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-amber-400 text-lg tabular-nums">
                        [{c.serviceCode}]
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {c.name}
                      </span>
                    </div>

                    <h3 className="font-semibold text-xs text-white leading-snug line-clamp-1">
                      {service?.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      Petugas: {c.officerName}
                    </p>

                    <div className="mt-3 space-y-1 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Masuk:</span>
                        <span className="font-mono font-semibold text-white tabular-nums">{cTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tuntas:</span>
                        <span className="font-mono font-semibold text-emerald-400 tabular-nums">{cCompleted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Menunggu:</span>
                        <span className="font-mono font-semibold text-amber-400 tabular-nums">{cWaiting}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Load Bar */}
                  <div className="mt-3 pt-2.5 border-t border-blue-900/40">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Porsi Beban</span>
                      <span className="font-mono font-semibold text-amber-400 tabular-nums">{percentage}%</span>
                    </div>
                    <div className="w-full bg-[#0a1633] h-1.5 rounded-full overflow-hidden border border-blue-900/80">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* District Demographic Breakdown */}
        <div className="bg-[#0a1633]/80 rounded-2xl p-6 border border-blue-900/50 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Asal Distrik Warga Pemohon Adminduk (Kabupaten Keerom)
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {['Arso', 'Arso Barat', 'Arso Timur', 'Skanto', 'Waris', 'Senggi', 'Web', 'Mannem', 'Towe'].map((dist) => {
              const count = tickets.filter(t => t.citizenDistrict === dist).length;
              return (
                <div key={dist} className="bg-[#060e20] p-3 rounded-xl border border-blue-900/60 text-center">
                  <div className="text-xs font-medium text-slate-300">{dist}</div>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-0.5 tabular-nums">
                    {count}
                  </div>
                  <div className="text-[10px] text-slate-400">pemohon</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Day Queue */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a1633] rounded-2xl p-6 max-w-sm w-full border border-blue-800 shadow-2xl space-y-4 text-white">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                Reset Antrian Hari Ini?
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Tindakan ini akan mengosongkan semua nomor antrian aktif dan mengembalikan antrian ke nomor awal (A001, B001, dst) untuk hari baru.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-900/40">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition"
              >
                Batal
              </button>
              <button
                id="confirm-reset-day-btn"
                type="button"
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
