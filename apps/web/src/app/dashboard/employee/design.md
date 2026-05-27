# Desain Halaman: Shift, Attendance & Payroll System

Halaman Employee & Shift (`apps/web/src/app/dashboard/employee/page.tsx`) adalah modul pengelolaan sumber daya manusia (HR) dan keuangan kasir terintegrasi yang menangani pembukaan/penutupan shift laci kas (Cash Drawer Reconcile), penjadwalan dinas (Roster Schedules), perekaman presensi PIN, kebijakan denda HR, serta kalkulasi slip gaji bulanan digital.

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Estetika modern bernada cafe hangat (`bg-cafe-50`), panel navigasi putih bersih beraksen garis tipis abu-abu, teks arang hitam solid (`text-cafe-900`), tombol bayar hijau zaitun pekat, dan notifikasi denda berskema merah bata redup.
- **Elemen Dinamis**:
  - Tanda status drawer kasir beranimasi denyut hijau (`animate-ping`) saat sesi kas aktif/terbuka.
  - Efek transisi meluncur lembut pada panel laci samping (*sliding drawer*) dan dialog verifikasi.
  - Format tabel riwayat shift audit kasir yang rapi dengan indikasi selisih laci kas berwarna merah menyala (`text-red-650`) jika terjadi kekurangan fisik uang kas.

---

## 2. Optimasi Viewport (Responsivitas)
- **Tablet / Desktop Grid Layout**:
  - Kolom kiri (1 Kolom) dikooptasi untuk stasiun pembukaan shift kasir dan pencocokan nominal fisik laci kasir saat tutup shift.
  - Kolom kanan (2 Kolom) menyajikan data riwayat audit penutupan laci kas dari shift-shift sebelumnya lengkap dengan selisih rupiah.
- **Mobile Smartphone**: Seluruh kontainer disederhanakan menjadi satu kolom lurus vertikal. Tabel performa upah kerja staf dan riwayat shift diubah menjadi model gulir horizontal agar tetap rapi pada layar kecil.

---

## 3. Komponen Utama & Elemen UI/UX
- **Stasiun Shift Kasir (Cash Drawer Controller)**:
  - Form pembukaan shift dengan nominal modal awal kas.
  - Panel penutupan shift dinamis (menampilkan total nilai penjualan ekspektasi sistem dari transaksi tunai, QRIS, dan kartu debit).
  - Form entri fisik laci kas yang dihitung kasir di akhir kerja.
- **Audit Penutupan Laci Kasir**: Tabel riwayat shift penutupan kasir lengkap dengan hitungan selisih laci kas (*discrepancy*).
- **Roster Dinas & Absensi PIN**: Sistem input absensi mandiri staf via keypad numerik virtual.
- **Kebijakan HR (Owner HR Policy Panel)**: Pengaturan toleransi keterlambatan (menit), denda jam potong gaji terlambat, dan tarif upah lembur operasional per jam.
- **Automated Payroll Engine**: Portal kalkulator slip gaji digital bulanan yang menghitung:
  - Gaji Pokok (Total jam roster * tarif upah per jam).
  - Premi Lembur (Akumulasi jam lembur * tarif lembur per jam).
  - Denda Kedisiplinan (Frekuensi telat absensi * tarif denda HR).
  - Tunjangan & Potongan Kustom.
  - Nilai Laba Gaji Bersih (Net Pay) untuk diunduh sebagai payslip digital.

---

## 4. Manajemen State & Integrasi Data
- **Variabel State Utama**:
  - `activeShift` (object): Status sesi laci kasir ('OPEN' | 'CLOSED').
  - `expectedCashSales`, `expectedQrisSales`, `expectedCardSales` (numbers): Nilai akumulasi penjualan kasir terhitung dari cache `pos_completed_orders` untuk dibandingkan fisik laci.
  - `shiftCapital` (string): Nominal modal awal laci kas.
  - `hrPolicy` (object): Kebijakan durasi toleransi telat dan tarif premi lembur.
  - `payrollSlips` (array): Riwayat payslip bulanan yang diterbitkan.
- **Mekanisme Reconcile Kas drawer**: Sistem mengaudit pencatatan penjualan kasir secara ketat. Jika uang fisik di akhir shift tidak cocok dengan perhitungan sistem, selisih rupiah (minus/plus) akan dicatat sebagai beban audit kasir operasional kafe.
