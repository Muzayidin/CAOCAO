# Desain Halaman: Owner Business Intelligence & Analytics

Halaman Analytics (`apps/web/src/app/dashboard/analytics/page.tsx`) adalah portal pusat intelijen bisnis (Business Intelligence) khusus untuk pemilik kafe (Owner) yang menyajikan laporan laba rugi komprehensif, analisis rasio kesehatan keuangan (BEP), audit performa kehadiran, dan rekomendasi margin profitabilitas menu.

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Warna latar belakang abu-abu cafe lembut (`bg-cafe-50`), kartu widget putih bersih dengan batas tipis transparan, aksen hijau zaitun khas (`text-earth-olive`), denda operasional merah redup (`text-red-650`), dan latar belakang denda merah pastel (`bg-red-50`).
- **Visualisasi Grafik**: Diagram batang keuangan bulanan representatif (Omset Kotor vs Laba Bersih) menggunakan elemen CSS murni dengan efek hover skala interaktif (`group-hover:bg-earth-olive transition-all`).
- **Elemen BI Premium**: Badge penanda level profitabilitas menu berwarna-warni (`EXCELLENT` hijau segar, `HEALTHY` olive, `CRITICAL` merah menyala) lengkap dengan kotak saran bisnis rekomendasi marketing.

---

## 2. Optimasi Viewport (Responsivitas)
- **Desktop Grid Layout**:
  - Kolom statistik ringkasan dalam 4 kolom sejajar (`grid-cols-4`).
  - Bagian tengah terbagi atas Laporan Laba Rugi Komprehensif (2 Kolom) dan Widget Rasio Kesehatan BEP (1 Kolom).
  - Katalog margin profitabilitas tertata rapi dalam 4 kolom grid.
- **Tablet / Mobile Viewport**: Seluruh baris melebur menjadi baris tunggal vertikal. Tabel laporan PnL dan performa kehadiran staf ditransformasi menjadi tabel gulir horizontal (`overflow-x-auto`) dengan ukuran baris minimal 48px untuk kenyamanan seluler.

---

## 3. Komponen Utama & Elemen UI/UX
- **Ringkasan Finansial (KPI Cards)**: 4 kartu metrik utama:
  - *Gross Revenue* (Total Penjualan real-time).
  - *Harga Pokok Penjualan* (HPP BOM akumulatif).
  - *Pengeluaran Gaji Staf* (Labor Cost terhitung otomatis).
  - *Kerugian Bahan Baku* (Waste & Stock Opname).
- **Ledger Laba Rugi (PnL Comprehensive Book)**: Tabel komprehensif yang menjabarkan arus kas masuk dan pengeluaran operasional (sewa, listrik, upah, bahan terbuang).
- **Rasio Kesehatan Bisnis & BEP**: Bar indikator visual yang memetakan Food HPP Ratio, Labor Ratio, dan Waste Ratio terhadap standar baku kuliner sehat.
- **BI Decision Engine**: Analisis profitabilitas otomatis per cangkir menu dengan rekomendasi diskon taktis atau penyesuaian harga jual.
- **Tabel Disiplin & Presensi Staf**: Tabel pemeringkatan kinerja karyawan berdasarkan rasio keterlambatan, denda potong gaji, dan validitas GPS Geofencing.

---

## 4. Manajemen State & Sinkronisasi Data
- **Konektivitas State Terintegrasi**: Memasang pendengar event `storage` untuk langsung memperbarui visual laporan finansial jika kasir baru saja menyelesaikan pesanan offline/online di tab POS Kasir.
- **Variabel State Utama**:
  - `grossRevenue` (number): Akumulasi penjualan bersih.
  - `wasteLoss` (number): Total nilai kerugian bahan baku terbuang.
  - `opnameLoss` (number): Kerugian penyusutan selisih fisik gudang.
  - `hppValue` (number): Biaya bahan baku terpakai (dihitung konstan 25% HPP).
  - `employees` & `attendances`: Roster staf dan data absen digital untuk kalkulasi labor cost.
- **Export Utility**: Tombol ekspor laporan keuangan dan performa staf ke format berkas Excel/CSV (`handleExportCSV`).
