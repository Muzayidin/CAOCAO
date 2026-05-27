# Desain Halaman: Advanced POS & Cashier Checkout (Terminal Kasir)

Halaman Cashier (`apps/web/src/app/dashboard/cashier/page.tsx`) adalah jantung operasional penjualan harian kafe (Point of Sale) yang mengintegrasikan pemetaan denah meja pelanggan, katalog menu dinamis, pengelolaan keranjang pesanan, perhitungan pajak/diskon, pencetakan resi struk belanja fisik, serta keandalan transaksi luring (Offline Mode).

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Warna latar belakang abu-abu cafe premium (`bg-cafe-50`), kartu produk putih bersih, tombol bayar hijau zaitun pekat (`bg-earth-olive`), teks arang hitam solid (`text-cafe-900`), dan struk belanja bertema monokrom monospaced retro (`font-mono`).
- **Sentuhan Interaktif**:
  - Efek bayangan premium melayang (`hover:shadow-premium`) dan pergeseran skala (`hover:scale-[1.03]`) saat kartu produk disorot.
  - Skema warna status meja dinamis (Abu-abu untuk Kosong, Hijau Zaitun untuk Terisi, Amber untuk Cetak Tagihan).
  - Floating shopping cart button dengan animasi memantul cerdas (`animate-bounce`) saat keranjang terisi.

---

## 2. Optimasi Viewport (Responsivitas)
- **Tablet / Desktop view (Split Screen Layout)**: Area katalog produk diposisikan memenuhi lebar grid sebelah kiri, sementara panel ringkasan keranjang diletakkan di sisi kanan secara kokoh agar kasir dapat bekerja cepat menekan tombol produk di satu sisi dan meninjau pesanan di sisi lainnya.
- **Mobile Smartphone**: Tata letak diatur dalam format satu kolom linier. Keranjang pesanan diposisikan di dalam panel melayang geser (*sliding drawer modal*) yang dipicu oleh tombol keranjang melayang bawah untuk efisiensi ruang pandang.

---

## 3. Komponen Utama & Elemen UI/UX
- **Denah Meja Cafe Aktif (Table Layout Grid)**: Grid pemetaan visual meja pelanggan terintegrasi dengan status meja operasional (`AVAILABLE`, `OCCUPIED`, `BILL_PRINTED`).
- **Katalog Menu & Pencarian**: Tab pemisah kategori (Semua Menu, Makanan, Minuman, Add-on) dan kolom pencarian menu responsif.
- **Kartu Produk Premium**: Menampilkan nama produk, harga rupiah, tombol penambah item, serta badge penanda resep BOM (*BOM Recipe*) jika produk tersebut menggunakan sistem pengurangan stok otomatis.
- **Panel Keranjang Belanja & Checkout Drawer**:
  - Kolom penginputan catatan kustom per item (misal: "less sugar", "no ice").
  - Dropdown daftar voucher diskon aktif (persentase/nominal) terintegrasi sistem.
  - Penghitung agregasi biaya (Subtotal, Potongan Diskon, Pajak PPN 11%, Service Charge 5%, dan Total Net Bayar).
  - Pilihan metode bayar (`CASH`, `QRIS`, `DEBIT`).
- **Retro Thermal Receipt Printer (Struk Belanja)**: Desain struk semantik monospaced ala thermal printer 58mm/80mm yang dioptimalkan untuk cetak langsung lewat fungsi cetak asli browser (`window.print()`).

---

## 4. Keandalan Offline Mode & Sinkronisasi Cache
- **Offline Reliability**: Sistem memantau status jaringan kasir. Jika koneksi terputus (`isOffline: true`), transaksi checkout tetap diizinkan 100% berjalan normal. Data pesanan disimpan sementara ke laci IndexedDB perangkat via Localforage (`offline_orders`) dengan tanda antrean tertunda.
- **Sync Integration**: Begitu internet kembali pulih, kasir dapat menekan tombol sync atau sistem otomatis menyinkronkan data antrean luring ke database cloud.
- **Cache Local**: Menu katalog produk dan pemetaan tata letak meja dicadangkan secara lokal di penyimpanan klien sehingga aplikasi kasir tetap dapat dimuat dengan cepat meskipun dalam kondisi internet mati total.
