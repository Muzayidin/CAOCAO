# Desain Halaman: Inventory & Ingredients Management (BOM Recipe)

Halaman Inventory & BOM (`apps/web/src/app/dashboard/inventory/page.tsx`) adalah modul pergudangan bahan baku terintegrasi resep otomatis (Bill of Materials) yang mengelola stok bahan mentah bar vs dapur, batas aman stok kritis (safety threshold), audit Stock Opname fisik, pencatatan bahan rusak (Waste), serta kalkulasi rasio HPP margin menu.

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Warna latar belakang abu-abu cafe premium hangat (`bg-cafe-50`), kartu ringkasan putih bersih dengan batas tipis transparan, aksen hijau zaitun khas (`text-earth-olive`), denda operasional merah redup, denda merah pastel, serta visual badge status aman hijau segar.
- **Elemen Dinamis**:
  - Badge peringatan kritis beranimasi denyut merah menyala (`animate-pulse`) jika bahan baku menyentuh/berada di bawah safety threshold aman.
  - Tampilan resep menu interaktif dalam tata letak daftar butir bersimbul bulat cokelat lembut.

---

## 2. Optimasi Viewport (Responsivitas)
- **Desktop Grid Layout**:
  - Kolom ringkasan aset (Total Aset, Kritis, Belanja Restok) tersusun dalam format 3 kolom sejajar (`grid-cols-3`).
  - Menu filter navigasi tab pergudangan dipisahkan rapi di bagian atas layar.
  - Untuk menu BOM (resep), layout terbagi menjadi formulir pendaftaran menu baru (1 Kolom) dan katalog resep profitabilitas menu (2 Kolom).
- **Tablet / Mobile Viewport**: Kontainer grid menyusut menjadi baris tunggal vertikal. Tabel audit Stock Opname dan kerugian bahan tumpah (Waste) diubah menjadi model gulir horizontal agar tetap rapi pada layar kecil.

---

## 3. Komponen Utama & Elemen UI/UX
- **Ringkasan Aset Inventaris (KPI Cards)**: 3 kartu metrik pergudangan:
  - *Total Nilai Aset*: Akumulasi stok aktif dikali harga beli bahan baku.
  - *Kesehatan Bahan*: Jumlah bahan baku yang menyentuh batas aman.
  - *Estimasi Belanja*: Kebutuhan biaya belanja restok bahan baku agar mencapai stok aman.
- **Direktori Bahan Baku (Bar vs Dapur)**: Tab pemisah stok bahan baku barista (Bar) vs koki (Kitchen).
- **Stasiun Opname Gudang (Stock Opname)**: Sistem penyesuaian stok sistem dengan hitungan fisik lapangan guna melacak selisih rupiah gudang (*discrepancy*).
- **Pencatatan Waste (Bahan Rusak)**: Form pencatatan kerugian bahan baku terbuang tumpah/pecah/kadaluarsa.
- **Menu Recipe Binder (BOM Creator)**: Formulir pengikatan resep bahan baku ke menu jual (misal: Latte memotong 20g biji kopi & 150ml fresh milk).
- **Harga Pokok Penjualan (HPP) Settings**: Panel kontrol Owner untuk menimpa HPP resep dengan nominal HPP manual dan mengatur biaya operasional (*operational cost*) per porsi.

---

## 4. Sistem Pengurangan Stok Otomatis (Automatic BOM Deductions)
Sistem dilengkapi modul kalkulasi porsi menu tersisa secara real-time berdasarkan batas kritis stok bahan baku:
- **Portion Constraints**: Saat kasir memuat katalog produk di POS Kasir, sistem secara dinamis memeriksa ketersediaan stok bahan resep yang terikat. Porsi maksimal menu dihitung dari bahan baku paling membatasi (limiting raw material). Jika salah satu bahan habis, status porsi menu di POS Kasir otomatis berubah menjadi **HABIS** dan mengunci tombol pemesanan.
- **Stock Deductions**: Begitu pembayaran dinyatakan sukses di kasir, sistem secara otomatis mengurangi volume gram/ml bahan baku di gudang sesuai porsi recipe BOM yang terjual.
