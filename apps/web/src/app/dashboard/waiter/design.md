# Desain Halaman: Mobile Order-Taking Waiter Portal (Terminal Waiter)

Halaman Waiter (`apps/web/src/app/dashboard/waiter/page.tsx`) adalah terminal pemesanan mobile yang dioptimalkan khusus untuk perangkat genggam (Smartphone) pramusaji (Waiter) guna melakukan pemesanan langsung dari meja pelanggan dengan navigasi satu tangan (*single-hand navigation*) serta perutean pesanan otomatis (*order routing*).

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Warna latar belakang abu-abu cafe premium hangat (`bg-cafe-50`), kartu produk putih bersih, tombol aksi hijau zaitun pekat (`bg-earth-olive`), teks arang hitam solid (`text-cafe-900`), dan laci keranjang belanja melayang bawah berwarna putih bersih.
- **Elemen Dinamis**:
  - Transisi mulus geser ke atas (*slide-up*) saat panel keranjang belanja bawah terbuka.
  - Efek bayangan halus premium pada kartu produk pramusaji.
  - Animasi transisi ketukan yang responsif pada tombol penambah porsi.

---

## 2. Optimasi Viewport (Responsivitas & Operasional Satu Tangan)
- **Optimasi Layar Sentuh Genggam (Smartphone)**:
  - Tata letak kontainer dibatasi pada lebar maksimal perangkat seluler (`max-w-md mx-auto`) agar tampilan tetap rapi di semua ukuran ponsel.
  - Tombol-tombol navigasi penting (seperti tab kategori dan tombol penambahan item) didesain dengan tinggi tap minimal 52px (`py-3.5`) untuk menjamin akurasi ketukan ibu jari yang cepat dan tanpa eror dalam suasana kafe yang sibuk.
  - Penempatan tombol konfirmasi pesanan berada di area paling bawah agar mudah dijangkau oleh satu tangan pramusaji saat berdiri di depan meja pelanggan.

---

## 3. Komponen Utama & Elemen UI/UX
- **Header Detail Waiter**:
  - Identitas pramusaji yang sedang bertugas berserta ikon penanda (`User`).
  - Dropdown daftar pilihan Meja Pelanggan yang sedang dilayani secara ringkas.
- **Tab Kategori Koki & Barista**: Tab pemisah kategori filter menu (Semua, Makanan, Minuman) berukuran ketuk besar.
- **Daftar Menu Cepat Pramusaji**:
  - Kolom daftar menu produk berserta detail harga.
  - Tombol penambah porsi bulat espresso gelap (`bg-cafe-800 text-white`) dengan tanda tambah besar.
- **Drawer Keranjang Bawah (Cart Summary Drawer)**:
  - Kotak ringkasan kuantitas pesanan pelanggan.
  - Tombol pengatur jumlah porsi item individu (tambah/kurang).
  - Tombol utama "Kirim Pesanan" beraksen hijau zaitun pekat untuk mengirim pesanan secara langsung.

---

## 4. Sistem Perutean Pesanan Otomatis (Order Routing KDS)
Sistem dilengkapi modul perutean pesanan cerdas secara instan begitu pramusaji mengetuk tombol kirim pesanan:
- **Automatic Routing**: Menu hidangan dalam satu pesanan secara otomatis dipecah berdasarkan kodenya. Menu berkategori **FOOD (Makanan)** akan diarahkan instan ke layar antrian monitor dapur (`/dashboard/kitchen`), sementara menu berkategori **DRINK (Minuman)** akan diarahkan instan ke layar antrian monitor barista (`/dashboard/bar`).
- **State Synchronization**: Status pemesanan meja pelanggan pada denah kasir utama otomatis berubah dari *Available* menjadi *Occupied* guna menghindari tumpang tindih pesanan.
