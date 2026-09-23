# Sistem Antrian Disdukcapil Kabupaten Keerom

Aplikasi Sistem Antrian & Display Ruang Pelayanan Terpadu Dinas Kependudukan dan Pencatatan Sipil Kabupaten Keerom, Provinsi Papua.

## Cara Menjalankan di Komputer Lokal

### 1. Prasyarat
- Pastikan sudah terpasang [Node.js](https://nodejs.org/) versi 18 atau 20 ke atas.
- Pastikan koneksi internet aktif saat pertama kali instalasi paket modul.

### 2. Instalasi Dependensi
Buka Terminal / Command Prompt / PowerShell di folder ini, lalu jalankan:
```bash
npm install
```

### 3. Menjalankan Aplikasi (Mode Development)
```bash
npm run dev
```
Setelah itu, buka browser Anda dan akses:
```
http://localhost:3000
```

### 4. Membangun untuk Produksi (Self-Hosted / Server Kantor)
```bash
npm run build
npm start
```
Atau Anda dapat menggunakan folder hasil kompilasi di `dist/` untuk dipasang pada server web Nginx, Apache, atau IIS kantor.

## Fitur Utama
1. **Layar Display TV Ruang Tunggu**: Menampilkan pemanggilan nomor antrian, video profil Disdukcapil Keerom, info petugas loket, dan running text.
2. **Layar Kiosk Mandiri Warga**: Pengambilan nomor antrian instan dan cetak tiket barcode/QR tanpa hambatan.
3. **Layar Petugas Loket (Operator)**: Panggilan suara bel otomatis, durasi waktu pelayanan, fitur transfer loket, dan catatan berkas.
4. **Panel Administrator**: Rekapitulasi kuota, statistik harian, cetak laporan resmi kedinasan, dan konfigurasi sistem.
5. **Display per Loket**: Layar overhead monitor per meja loket.
