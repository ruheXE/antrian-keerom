import { ServiceDefinition, CounterInfo, SystemSettings } from '../types';

export const SERVICES_DATA: ServiceDefinition[] = [
  {
    id: 'KTP_IKD',
    code: 'A',
    name: 'KTP-el & Identitas Kependudukan Digital (IKD)',
    subtitle: 'Perekaman baru, cetak ulang rusak/hilang, & aktivasi aplikasi IKD',
    defaultCounter: 1,
    color: 'from-blue-600 to-indigo-700',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    badgeText: 'text-blue-700',
    iconName: 'CreditCard',
    estimatedMinutes: 10,
    description: 'Pelayanan penerbitan KTP Elektronik (rekam baru usia 17 tahun atau sudah menikah, ganti rusak/hilang/perubahan elemen data) serta aktivasi aplikasi Identitas Kependudukan Digital (IKD) di ponsel pintar warga.',
    requirements: [
      'Perekaman Baru: Fotokopi Kartu Keluarga (KK) & telah berusia 17 tahun atau sudah pernah menikah',
      'KTP Rusak: KTP-el fisik yang rusak & Fotokopi Kartu Keluarga',
      'KTP Hilang: Surat Keterangan Kehilangan dari Kepolisian (Polsek/Polres) & Fotokopi KK',
      'Perubahan Data: KTP lama, KK baru hasil perubahan, serta dokumen pendukung perubahan (Ijazah/Akta Nikah)',
      'Aktivasi IKD: Sudah memiliki KTP-el fisik, membawa Smartphone (Android/iOS) berakses internet, memiliki email & nomor HP aktif'
    ]
  },
  {
    id: 'KK_PINDAH',
    code: 'B',
    name: 'Kartu Keluarga (KK) & Pindah Datang (SKPWNI)',
    subtitle: 'Penerbitan KK baru, perubahan data, pecah KK, & mutasi kependudukan',
    defaultCounter: 2,
    color: 'from-emerald-600 to-teal-700',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    badgeText: 'text-emerald-700',
    iconName: 'Users',
    estimatedMinutes: 12,
    description: 'Pelayanan penerbitan Kartu Keluarga (KK) barcode baru bagi pengantin baru, penambahan anggota keluarga, perubahan biodata, penggantian KK hilang/rusak, dan Surat Keterangan Pindah Warga Negara Indonesia (SKPWNI) antar distrik/kabupaten/provinsi.',
    requirements: [
      'KK Baru (Pasangan Baru): Buku Nikah / Akta Perkawinan & Kartu Keluarga orang tua masing-masing',
      'Penambahan Anggota (Kelahiran): Kartu Keluarga lama & Surat Keterangan Lahir dari Bidan/RS/Puskesmas',
      'Pengurangan Anggota (Kematian): Kartu Keluarga lama & Surat Kematian / Akta Kematian',
      'KK Rusak / Hilang: KK rusak asli atau Surat Kehilangan Kepolisian untuk KK hilang',
      'Surat Pindah (SKPWNI): Kartu Keluarga asli, formulir permohonan pindah (F-1.03), dan alamat tujuan lengkap'
    ]
  },
  {
    id: 'AKTA_CAPIL',
    code: 'C',
    name: 'Akta Pencatatan Sipil',
    subtitle: 'Akta Kelahiran, Kematian, Perkawinan Non-Muslim & Pengesahan Anak',
    defaultCounter: 3,
    color: 'from-amber-600 to-orange-700',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeText: 'text-amber-700',
    iconName: 'FileCheck',
    estimatedMinutes: 15,
    description: 'Pelayanan pencatatan peristiwa penting kependudukan seperti akta kelahiran anak/dewasa, akta kematian, akta perkawinan bagi non-muslim, akta perceraian putusan pengadilan, dan akta pengakuan anak.',
    requirements: [
      'Akta Kelahiran: Surat Keterangan Lahir (RS/Bidan/Puskesmas/Kampung), Buku Nikah/Akta Perkawinan orang tua, KK & KTP-el orang tua, KTP-el 2 orang saksi',
      'Akta Kematian: Surat Keterangan Kematian dari Dokter/RS/Puskesmas/Kepala Kampung, KK & KTP almarhum/ah, KTP pelapor & 2 orang saksi',
      'Akta Perkawinan (Non-Muslim): Surat Pemberkatan Nikah dari Pemuka Agama/Gereja, KTP & KK kedua mempelai, Akta Lahir kedua mempelai, Pas foto berdampingan 4x6 (latar merah/biru), KTP 2 orang saksi',
      'Akta Perceraian: Salinan Putusan Pengadilan Negeri yang berkekuatan hukum tetap & Akta Perkawinan asli'
    ]
  },
  {
    id: 'KIA_NIK',
    code: 'D',
    name: 'Kartu Identitas Anak (KIA) & Konsolidasi NIK',
    subtitle: 'Identitas anak usia 0-17 tahun & aktivasi data NIK bermasalah online',
    defaultCounter: 4,
    color: 'from-purple-600 to-pink-700',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    badgeText: 'text-purple-700',
    iconName: 'Baby',
    estimatedMinutes: 8,
    description: 'Penerbitan KIA bagi anak WNI usia 0 hingga 17 tahun kurang satu hari untuk perlindungan hak konstitusional anak, serta pelayanan konsolidasi/sinkronisasi NIK tidak terbaca di BPJS Kesehatan, Perbankan, atau instansi lain.',
    requirements: [
      'KIA Usia 0 - 5 Tahun: Fotokopi Akta Kelahiran anak, KK orang tua asli/fotokopi, KTP-el kedua orang tua (tanpa foto anak)',
      'KIA Usia 5 - 17 Tahun: Fotokopi Akta Kelahiran, KK orang tua, KTP-el kedua orang tua, pas foto anak ukuran 2x3 atau 3x4 (2 lembar)',
      'Konsolidasi / Validasi NIK: Fotokopi Kartu Keluarga, KTP-el, serta informasi instansi yang menolak NIK (BPJS/Bank/Imigrasi/Pajak)'
    ]
  },
  {
    id: 'LEGALISIR_KHUSUS',
    code: 'E',
    name: 'Layanan Khusus, Legalisir & Pengaduan',
    subtitle: 'Legalisir dokumen adminduk, konsultasi distrik pedalaman & aduan warga',
    defaultCounter: 5,
    color: 'from-rose-600 to-red-700',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    badgeText: 'text-rose-700',
    iconName: 'ShieldAlert',
    estimatedMinutes: 6,
    description: 'Pelayanan pengesahan/legalisir dokumen kependudukan non-barcode, penerimaan pengaduan masyarakat, serta fasilitasi khusus warga distrik terjauh (Waris, Senggi, Web, Yafi, Kaisenar, Towe).',
    requirements: [
      'Legalisir Dokumen: Dokumen asli yang belum bertanda tangan elektronik (TTE/Barcode) & fotokopi dokumen yang akan dilegalisir (maksimal 5 rangkap)',
      '*Catatan: Dokumen yang sudah ber-barcode (TTE) sah secara hukum dan TIDAK PERLU dilegalisir sesuai Permendagri No. 104/2019',
      'Pengaduan / Masalah Khusus: Kartu Keluarga, KTP-el pelapor, bukti pendukung keluhan/permasalahan dokumen'
    ]
  }
];

export const INITIAL_COUNTERS: CounterInfo[] = [
  {
    id: 1,
    name: 'Loket 1',
    serviceCategory: 'KTP_IKD',
    serviceCode: 'A',
    officerName: 'Yohanes Rumkabu, S.Sos',
    isOpen: true,
    currentTicketId: null,
  },
  {
    id: 2,
    name: 'Loket 2',
    serviceCategory: 'KK_PINDAH',
    serviceCode: 'B',
    officerName: 'Maria Wanimbo, A.Md',
    isOpen: true,
    currentTicketId: null,
  },
  {
    id: 3,
    name: 'Loket 3',
    serviceCategory: 'AKTA_CAPIL',
    serviceCode: 'C',
    officerName: 'Petrus Tafor, S.IP',
    isOpen: true,
    currentTicketId: null,
  },
  {
    id: 4,
    name: 'Loket 4',
    serviceCategory: 'KIA_NIK',
    serviceCode: 'D',
    officerName: 'Agustina Tuamis, S.E',
    isOpen: true,
    currentTicketId: null,
  },
  {
    id: 5,
    name: 'Loket 5',
    serviceCategory: 'LEGALISIR_KHUSUS',
    serviceCode: 'E',
    officerName: 'Markus Keerom, S.AP',
    isOpen: true,
    currentTicketId: null,
  },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  soundEnabled: true,
  chimeVolume: 85,
  speechRate: 0.95,
  speechPitch: 1.0,
  voiceLanguage: 'id-ID',
  autoRecallInterval: 0,
  officeName: 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
  officeAddress: 'Kompleks Kantor Bupati Keerom, Jl. Trans Papua, Arso Kota',
  officeRegency: 'KABUPATEN KEEROM - PROVINSI PAPUA',
  runningText: 'SELAMAT DATANG DI DISDUKCAPIL KABUPATEN KEEROM • KWA NE SANGKEI (BERSATU UNTUK MAJU) • SEMUA PELAYANAN ADMINISTRASI KEPENDUDUKAN GRATIS TANPA PUNGUTAN BIAYA • PASTIKAN DOKUMEN ANDA LENGKAP SEBELUM MENUJU KE LOKET • JAM PELAYANAN: SENIN - JUMAT PUKUL 08.00 - 15.00 WIT • GERAKAN INDONESIA SADAR ADMINDUK (GISA)',
  smsEnabled: true,
  smsGatewaySender: 'DISDUKCAPIL-KEEROM',
  smsTemplate: 'Yth. Bpk/Ibu {NAMA}, Nomor Antrian Anda {NOMOR} sedang dipanggil di {LOKET} ({LAYANAN}) Disdukcapil Keerom. Silakan segera menuju loket pelayanan. Terima kasih.',
  adminPin: '1234'
};
