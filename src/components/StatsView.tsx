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
  Sparkles,
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  MessageSquare
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
    <div className="w-full min-h-[calc(100vh-130px)] bg-[#071126] py-6 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Actions */}
        <div className="bg-[#0a1736] rounded-3xl p-6 border-2 border-blue-900 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-950 text-amber-400 border border-amber-400/30">
                <BarChart3 className="w-5 h-5 text-amber-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Laporan & Statistik Pelayanan Harian
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Rekapitulasi aktivitas loket antrian Dinas Kependudukan dan Pencatatan Sipil Kabupaten Keerom.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="export-csv-btn"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition shadow-md shadow-amber-400/20"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-950" />
              <span>Ekspor CSV</span>
            </button>

            <button
              id="print-summary-btn"
              onClick={handlePrintSummary}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0e214d] hover:bg-[#12285a] text-white border border-blue-800 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak Laporan</span>
            </button>

            <button
              id="reset-queue-open-modal-btn"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Harian</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#0a1736] p-4 rounded-2xl border border-blue-900 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Antrian</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">
              {total}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Hari ini</div>
          </div>

          <div className="bg-[#0a1736] p-4 rounded-2xl border border-blue-900 shadow-md">
            <span className="text-[11px] font-bold text-amber-400 uppercase">Menunggu</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono">
              {waiting}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Belum dipanggil</div>
          </div>

          <div className="bg-[#0a1736] p-4 rounded-2xl border border-blue-900 shadow-md">
            <span className="text-[11px] font-bold text-blue-400 uppercase">Sedang Dilayani</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 font-mono">
              {serving + calling}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Di meja loket</div>
          </div>

          <div className="bg-[#0a1736] p-4 rounded-2xl border border-blue-900 shadow-md">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">Selesai</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">
              {completed}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tuntas dilayani</div>
          </div>

          <div className="bg-[#0a1736] p-4 rounded-2xl border border-blue-900 shadow-md">
            <span className="text-[11px] font-bold text-rose-400 uppercase">Terlewat</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 font-mono">
              {skipped}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Warga tidak hadir</div>
          </div>

          <div className="bg-[#0a1736] p-4 rounded-2xl border border-blue-900 shadow-md">
            <span className="text-[11px] font-bold text-amber-300 uppercase">Prioritas</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 font-mono">
              {priorityCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Lansia/Hamil/Difabel</div>
          </div>
        </div>

        {/* Counter Breakdown Grid */}
        <div className="bg-[#0a1736] rounded-3xl p-6 border-2 border-blue-900 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 mb-4">
            Rekapitulasi Beban Kerja per Loket Pelayanan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {counters.map((c) => {
              const counterTickets = tickets.filter(t => t.serviceCode === c.serviceCode);
              const cTotal = counterTickets.length;
              const cCompleted = counterTickets.filter(t => t.status === 'SELESAI').length;
              const cWaiting = counterTickets.filter(t => t.status === 'MENUNGGU').length;
              const percentage = total > 0 ? Math.round((cTotal / total) * 100) : 0;
              const service = SERVICES_DATA.find(s => s.code === c.serviceCode);

              return (
                <div key={c.id} className="bg-[#07132c] p-4 rounded-2xl border border-blue-900 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-amber-400 text-lg">
                        [{c.serviceCode}]
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-950 text-slate-300 rounded-md border border-blue-800">
                        {c.name}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white leading-snug line-clamp-1">
                      {service?.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {c.officerName}
                    </p>

                    <div className="mt-3 space-y-1 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Total Masuk:</span>
                        <span className="font-bold text-white">{cTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tuntas:</span>
                        <span className="font-bold text-emerald-400">{cCompleted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Menunggu:</span>
                        <span className="font-bold text-amber-400">{cWaiting}</span>
                      </div>
                    </div>
                  </div>

                  {/* Simple visual bar */}
                  <div className="mt-3 pt-2 border-t border-blue-900/60">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Beban</span>
                      <span className="text-amber-400 font-bold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-blue-950 h-1.5 rounded-full overflow-hidden border border-blue-900">
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
        <div className="bg-[#0a1736] rounded-3xl p-6 border-2 border-blue-900 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Asal Distrik Warga Pemohon Adminduk (Kabupaten Keerom)
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {['Arso', 'Arso Barat', 'Arso Timur', 'Skanto', 'Waris', 'Senggi', 'Web', 'Mannem', 'Towe'].map((dist) => {
              const count = tickets.filter(t => t.citizenDistrict === dist).length;
              return (
                <div key={dist} className="bg-[#07132c] p-3 rounded-xl border border-blue-900 text-center">
                  <div className="text-xs font-semibold text-slate-300">{dist}</div>
                  <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0a1736] rounded-2xl p-6 max-w-sm w-full border-2 border-blue-800 shadow-2xl space-y-4 text-white">
            <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-700/50">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-white">
                Reset Antrian Hari Ini?
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Tindakan ini akan mengosongkan semua nomor antrian aktif dan mengembalikan antrian ke nomor awal (A-001, B-001, dst) untuk hari baru.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-[#07132c] rounded-lg transition"
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
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-md"
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
