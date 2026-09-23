import { Ticket, CounterInfo, SystemSettings, SmsNotificationLog, KEEROM_DISTRICTS } from '../types';
import { SERVICES_DATA } from '../data/servicesData';

/**
 * Utility to trigger a file download in browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for filenames: YYYY-MM-DD_HHmm
 */
function getTimestampForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}${minutes}`;
}

/**
 * Format date string to Indonesian locale string
 */
function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Safe CSV cell escape
 */
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * 1. Export All Data as JSON Archive
 */
export function exportArchiveAsJson(
  tickets: Ticket[],
  counters: CounterInfo[],
  settings: SystemSettings,
  smsLogs: SmsNotificationLog[]
): void {
  const timestamp = getTimestampForFilename();
  const finishedTickets = tickets.filter(t => t.status === 'SELESAI');
  const waitingTickets = tickets.filter(t => t.status === 'MENUNGGU');
  const servingTickets = tickets.filter(t => t.status === 'SEDANG_DILAYANI' || t.status === 'DIPANGGIL');
  const skippedTickets = tickets.filter(t => t.status === 'TERLEWAT' || t.status === 'DIBATALKAN');

  const finishedWithTime = tickets.filter(t => t.servedAt && t.finishedAt);
  const avgServiceTimeMinutes = finishedWithTime.length > 0
    ? Math.round(
        finishedWithTime.reduce((acc, t) => {
          const start = new Date(t.servedAt!).getTime();
          const end = new Date(t.finishedAt!).getTime();
          return acc + (end - start);
        }, 0) / finishedWithTime.length / 60000
      )
    : 0;

  // Compile full call log entries
  const callLogs = tickets
    .filter(t => t.calledAt || t.callCount > 0)
    .map(t => {
      const counter = counters.find(c => c.id === t.counterAssigned);
      return {
        ticketId: t.id,
        ticketNumber: t.ticketNumber,
        serviceCode: t.serviceCode,
        serviceName: t.serviceName,
        citizenName: t.citizenName || 'Warga',
        citizenNik: t.citizenNik || null,
        citizenPhone: t.citizenPhone || null,
        counterId: t.counterAssigned || null,
        counterName: counter ? counter.name : `Loket ${t.counterAssigned || '-'}`,
        officerName: counter ? counter.officerName : '-',
        callCount: t.callCount,
        firstCalledAt: t.calledAt,
        servedAt: t.servedAt,
        finishedAt: t.finishedAt,
        status: t.status,
        officerNotes: t.officerNotes || null,
        smsSent: t.smsSent || false,
      };
    });

  // Per district summary
  const districtSummary: Record<string, number> = {};
  KEEROM_DISTRICTS.forEach(d => {
    districtSummary[d] = tickets.filter(t => t.citizenDistrict === d).length;
  });

  // Per counter summary
  const counterSummary = counters.map(c => {
    const service = SERVICES_DATA.find(s => s.code === c.serviceCode);
    const counterTickets = tickets.filter(t => t.counterAssigned === c.id || t.serviceCode === c.serviceCode);
    return {
      counterId: c.id,
      counterName: c.name,
      serviceCode: c.serviceCode,
      serviceName: service?.name || c.name,
      officerName: c.officerName,
      isOpen: c.isOpen,
      totalServed: counterTickets.filter(t => t.status === 'SELESAI').length,
      currentlyWaiting: tickets.filter(t => t.serviceCode === c.serviceCode && t.status === 'MENUNGGU').length,
      currentlyServing: counterTickets.filter(t => t.status === 'SEDANG_DILAYANI' || t.status === 'DIPANGGIL').length,
      totalTickets: counterTickets.length,
    };
  });

  const fullArchiveData = {
    metadata: {
      appName: 'Sistem Antrian & Display Ruang Pelayanan Terpadu',
      agency: 'Dinas Kependudukan dan Pencatatan Sipil Kabupaten Keerom',
      province: 'Provinsi Papua',
      motto: 'Tamne Yisan Kefase',
      exportedAt: new Date().toISOString(),
      exportedAtLocale: formatDateTime(new Date().toISOString()),
      exportType: 'FULL_BACKUP_ARCHIVE_JSON',
      version: '2.0.0',
    },
    statistics: {
      totalTickets: tickets.length,
      totalFinished: finishedTickets.length,
      totalWaiting: waitingTickets.length,
      totalServing: servingTickets.length,
      totalSkippedOrCancelled: skippedTickets.length,
      priorityTicketsCount: tickets.filter(t => t.queueType === 'PRIORITAS').length,
      regularTicketsCount: tickets.filter(t => t.queueType === 'REGULER').length,
      avgServiceTimeMinutes,
      districtBreakdown: districtSummary,
      counterBreakdown: counterSummary,
    },
    tickets,
    callLogs,
    counters,
    smsLogs,
    settings,
  };

  const jsonString = JSON.stringify(fullArchiveData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `arsip_antrian_dukcapil_keerom_${timestamp}.json`);
}

/**
 * 2. Export Tickets Data as CSV (Data Antrian Lengkap)
 */
export function exportTicketsAsCsv(tickets: Ticket[], counters: CounterInfo[]): void {
  const timestamp = getTimestampForFilename();

  const headers = [
    'No. Antrian',
    'Layanan',
    'Kode Layanan',
    'Nama Warga',
    'NIK (16 Digit)',
    'Nomor HP / WA',
    'Distrik Asal',
    'Jalur Antrian',
    'Status',
    'Loket Pelayanan',
    'Petugas Loket',
    'Jumlah Panggilan',
    'SMS Notifikasi',
    'Waktu Ambil Tiket',
    'Waktu Pertama Dipanggil',
    'Waktu Mulai Dilayani',
    'Waktu Selesai',
    'Durasi Pelayanan (Menit)',
    'Catatan Petugas',
  ];

  const rows = tickets.map(ticket => {
    const counter = counters.find(c => c.id === ticket.counterAssigned);
    let durationMinutes = '-';
    if (ticket.servedAt && ticket.finishedAt) {
      const ms = new Date(ticket.finishedAt).getTime() - new Date(ticket.servedAt).getTime();
      durationMinutes = (ms / 60000).toFixed(1);
    }

    return [
      ticket.ticketNumber,
      ticket.serviceName,
      ticket.serviceCode,
      ticket.citizenName || 'Warga',
      ticket.citizenNik ? `'${ticket.citizenNik}` : '-',
      ticket.citizenPhone ? `'${ticket.citizenPhone}` : '-',
      ticket.citizenDistrict || 'Arso',
      ticket.queueType === 'PRIORITAS' ? 'PRIORITAS' : 'REGULER',
      ticket.status,
      counter ? counter.name : (ticket.counterAssigned ? `Loket ${ticket.counterAssigned}` : '-'),
      counter ? counter.officerName : '-',
      ticket.callCount,
      ticket.smsSent ? 'TERKIRIM' : 'TIDAK',
      formatDateTime(ticket.createdAt),
      formatDateTime(ticket.calledAt),
      formatDateTime(ticket.servedAt),
      formatDateTime(ticket.finishedAt),
      durationMinutes,
      ticket.officerNotes || '-',
    ];
  });

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(r => r.map(escapeCsvCell).join(','))
  ].join('\r\n');

  // Add UTF-8 BOM so Excel opens indonesian characters properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `data_antrian_dukcapil_keerom_${timestamp}.csv`);
}

/**
 * 3. Export Call & SMS Logs as CSV
 */
export function exportCallLogsAsCsv(
  tickets: Ticket[],
  counters: CounterInfo[],
  smsLogs: SmsNotificationLog[]
): void {
  const timestamp = getTimestampForFilename();

  const headers = [
    'Tipe Log',
    'Waktu Pencatatan',
    'No. Antrian',
    'Nama Warga',
    'Nomor HP',
    'Layanan',
    'Loket',
    'Nama Petugas',
    'Status Antrian',
    'Frekuensi Panggil',
    'Detail Pesan / Catatan',
  ];

  const callRows: any[][] = [];

  // Add calls from tickets
  tickets.filter(t => t.calledAt || t.callCount > 0).forEach(t => {
    const counter = counters.find(c => c.id === t.counterAssigned);
    callRows.push([
      'PANGGILAN LOKET',
      formatDateTime(t.calledAt || t.createdAt),
      t.ticketNumber,
      t.citizenName || 'Warga',
      t.citizenPhone ? `'${t.citizenPhone}` : '-',
      t.serviceName,
      counter ? counter.name : (t.counterAssigned ? `Loket ${t.counterAssigned}` : '-'),
      counter ? counter.officerName : '-',
      t.status,
      `${t.callCount}x`,
      t.officerNotes ? `Catatan: ${t.officerNotes}` : 'Panggilan loket standar',
    ]);
  });

  // Add SMS logs
  smsLogs.forEach(log => {
    callRows.push([
      'NOTIFIKASI SMS',
      formatDateTime(log.timestamp),
      log.ticketNumber,
      log.citizenName || '-',
      `'${log.phoneNumber}`,
      '-',
      log.counterName,
      '-',
      log.status === 'SENT' ? 'TERKIRIM (DELIVERED)' : 'GAGAL',
      '1x',
      log.message,
    ]);
  });

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...callRows.map(r => r.map(escapeCsvCell).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `log_panggilan_sms_dukcapil_keerom_${timestamp}.csv`);
}

/**
 * 4. Export Statistics Summary as CSV
 */
export function exportStatisticsSummaryAsCsv(
  tickets: Ticket[],
  counters: CounterInfo[]
): void {
  const timestamp = getTimestampForFilename();
  const finishedTickets = tickets.filter(t => t.status === 'SELESAI');
  const waitingTickets = tickets.filter(t => t.status === 'MENUNGGU');
  const servingTickets = tickets.filter(t => t.status === 'SEDANG_DILAYANI' || t.status === 'DIPANGGIL');
  const skippedTickets = tickets.filter(t => t.status === 'TERLEWAT' || t.status === 'DIBATALKAN');
  const priorityTickets = tickets.filter(t => t.queueType === 'PRIORITAS');
  const regularTickets = tickets.filter(t => t.queueType === 'REGULER');

  const finishedWithTime = tickets.filter(t => t.servedAt && t.finishedAt);
  const avgServiceTimeMinutes = finishedWithTime.length > 0
    ? Math.round(
        finishedWithTime.reduce((acc, t) => {
          const start = new Date(t.servedAt!).getTime();
          const end = new Date(t.finishedAt!).getTime();
          return acc + (end - start);
        }, 0) / finishedWithTime.length / 60000
      )
    : 0;

  const lines: string[] = [];

  // Section 1: Header
  lines.push('REKAPITULASI STATISTIK PELAYANAN DISDUKCAPIL KABUPATEN KEEROM');
  lines.push(`Waktu Ekspor: ${formatDateTime(new Date().toISOString())}`);
  lines.push('');

  // Section 2: Ringkasan Umum
  lines.push('I. RINGKASAN VOLUME PELAYANAN');
  lines.push('Indikator,Jumlah,Keterangan');
  lines.push(`Total Pemohon Terdaftar,${tickets.length},Orang/Tiket`);
  lines.push(`Pelayanan Selesai,${finishedTickets.length},Berkas Tuntas`);
  lines.push(`Sedang Dilayani/Dipanggil,${servingTickets.length},Di Loket`);
  lines.push(`Antrian Menunggu,${waitingTickets.length},Dalam Antrian`);
  lines.push(`Antrian Terlewat/Batal,${skippedTickets.length},Tidak Hadir`);
  lines.push(`Jalur Prioritas Khusus,${priorityTickets.length},Lansia/Disabilitas/Ibu Hamil`);
  lines.push(`Jalur Reguler Umum,${regularTickets.length},Pemohon Reguler`);
  lines.push(`Rata-rata Waktu Layanan,${avgServiceTimeMinutes},Menit per Berkas`);
  lines.push('');

  // Section 3: Rekapitulasi per Loket
  lines.push('II. REKAPITULASI PELAYANAN PER LOKET');
  lines.push('Loket,Jenis Layanan,Petugas,Selesai,Menunggu,Sedang Dilayani,Total');
  counters.forEach(c => {
    const service = SERVICES_DATA.find(s => s.code === c.serviceCode);
    const fin = tickets.filter(t => (t.counterAssigned === c.id || t.serviceCode === c.serviceCode) && t.status === 'SELESAI').length;
    const wait = tickets.filter(t => t.serviceCode === c.serviceCode && t.status === 'MENUNGGU').length;
    const serv = tickets.filter(t => (t.counterAssigned === c.id || t.serviceCode === c.serviceCode) && (t.status === 'SEDANG_DILAYANI' || t.status === 'DIPANGGIL')).length;
    const tot = tickets.filter(t => t.serviceCode === c.serviceCode).length;
    lines.push(`${escapeCsvCell(c.name)},${escapeCsvCell(service?.name || '')},${escapeCsvCell(c.officerName)},${fin},${wait},${serv},${tot}`);
  });
  lines.push('');

  // Section 4: Rekapitulasi per Distrik
  lines.push('III. REKAPITULASI ASAL DISTRIK WARGA PEMOHON');
  lines.push('Nama Distrik,Jumlah Pemohon,Persentase (%)');
  KEEROM_DISTRICTS.forEach(d => {
    const count = tickets.filter(t => t.citizenDistrict === d).length;
    const pct = tickets.length > 0 ? ((count / tickets.length) * 100).toFixed(1) : '0.0';
    lines.push(`Distrik ${d},${count},${pct}%`);
  });

  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `rekap_statistik_dukcapil_keerom_${timestamp}.csv`);
}
