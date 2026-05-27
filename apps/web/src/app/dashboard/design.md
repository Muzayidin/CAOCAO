# Desain Halaman: Core Dashboard Layout & Overview

Halaman Dashboard (`apps/web/src/app/dashboard/page.tsx` & `layout.tsx`) merupakan fondasi utama sistem pos terintegrasi yang berfungsi sebagai cangkang tata letak (Layout Wrapper), pengendali akses berbasis peran (RBAC Sub-system), dan indikator sinkronisasi jaringan offline.

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Dominasi warna gelap premium arang (`bg-cafe-900`) untuk sidebar guna memberikan kontras fokus yang tinggi, abu-abu cafe lembut (`bg-cafe-50`) untuk area kerja konten utama, dan panel kasir atas berwarna putih bersih.
- **Elemen Dinamis**:
  - Indikator sinkronisasi awan (`Cloud` / `CloudOff`) yang berubah warna secara dinamis (Hijau untuk Online, Amber/Merah untuk Disconnected).
  - Floating Simulator switcher melayang di sudut kanan bawah dengan efek skala transisi saat disorot.
  - Efek transisi halus lebar sidebar (`w-64` menjadi `w-20`) saat dilipat.

---

## 2. Optimasi Viewport (Responsivitas)
- **Desktop (Layar Lebar)**: Sidebar kiri permanen berdiri tegak dengan opsi penyusutan lebar (`isSidebarExpanded`) untuk memaksimalkan ruang kerja utama.
- **Tablet / Mobile (Layar Kecil)**: Sidebar disembunyikan di bawah tombol hamburger (`Menu`) di navbar atas. Mengetuk tombol hamburger akan memunculkan menu laci sliding transisi penuh dari sisi kiri dengan lapisan latar belakang blur buram (`bg-cafe-950/60 backdrop-blur-sm`).

---

## 3. Komponen Utama & Elemen UI/UX
- **Collapsible Sidebar**:
  - Menu navigasi dinamis yang memetakan fitur berdasarkan hak akses peran aktif pengguna.
  - Bagian bawah memuat kartu nama staf aktif dan tombol keluar sistem beraksen merah bata redup (`bg-red-950/40 text-red-300`).
- **Navbar Operasional (Header)**:
  - Tombol hamburger responsif untuk perangkat mobile.
  - Teks sapaan interaktif ("Selamat bekerja, Budi Santoso").
  - Cloud Sync badge real-time.
  - Terminal ID unik kafe (`CAS-XXXXXX`).
- **Floating Simulator Peran (Bypass Mode)**:
  - Panel simulasi khusus bagi akun Owner untuk berpindah peran secara instan (Owner, Admin, Kasir, Barista, Kitchen) demi kenyamanan evaluasi fitur tanpa harus keluar-masuk sistem.

---

## 4. Sub-Sistem Akses Peran & PIN Modal (RBAC Gate)
Untuk menjaga keamanan operasional kafe, perpindahan peran ke akun yang lebih sensitif (seperti Owner atau Admin) diwajibkan melewati verifikasi PIN akses peran:
- **PIN Standar Demo**: Owner (`123456`), Admin (`9999`), Kitchen (`5555`), Bar (`4444`), Kasir (`3333`).
- **Modal Input PIN**: Keypad numerik virtual berukuran besar untuk menghindari kegagalan ketuk pada layar tablet kasir.

---

## 5. Sinkronisasi Data Jaringan & Keandalan Offline
Sistem dilengkapi modul deteksi status koneksi internet (`navigator.onLine`):
- **Event Jaringan**: Memasang listener `online` dan `offline` pada jendela browser.
- **Offline Banner**: Saat internet terputus, banner amber cerah beranimasi memantul (`animate-bounce`) akan muncul di atas navbar, mengunci akses menu analisis keuangan dan payroll, tetapi mempertahankan fungsi transaksi kasir 100% aktif dengan menyimpan antrean ke IndexedDB (`offline_orders`).
- **Background Sync**: Begitu koneksi pulih, sistem secara otomatis memicu sinkronisasi latar belakang (`triggerBackgroundSync`) untuk mengunggah antrean pesanan offline ke database cloud server secara kronologis dan memperbarui laci kas.
