# Desain Halaman: Settings & Cafe Configurations

Halaman Settings (`apps/web/src/app/dashboard/settings/page.tsx`) adalah stasiun konfigurasi sentral bagi pengelola outlet kafe yang mengatur profil bisnis, tarif pajak & pelayanan, generator kode sinkronisasi smartphone staf, manajemen hak perangkat terhubung, kupon voucher diskon aktif, pemetaan meja dinamis, dan pengelolaan integrasi fitur langganan tenant.

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Warna latar belakang abu-abu cafe premium hangat (`bg-cafe-50`), kartu ringkasan putih bersih dengan batas tipis transparan, aksen hijau zaitun khas (`text-earth-olive`), denda operasional merah redup, denda merah pastel, serta visual badge status aman hijau segar.
- **Elemen Dinamis**:
  - Tombol toggle status otomatis (auto print receipt, merge barista) yang bergeser interaktif dengan transisi mulus (`transition-all`).
  - Pratinjau QR Code sinkronisasi perangkat yang dinamis dan terbuat dari SVG murni (`QRCodeSVG`).

---

## 2. Optimasi Viewport (Responsivitas)
- **Desktop Grid Layout**:
  - Kolom kiri (1 Kolom) dikooptasi untuk stasiun profil bisnis cafe, PPN rate, dan generator sinkronisasi HP staf.
  - Kolom kanan (2 Kolom) menyajikan panel manajemen kupon diskon (1 Kolom) dan panel pemetaan denah meja dinamis (1 Kolom).
- **Tablet / Mobile Viewport**: Kontainer grid menyusut menjadi baris tunggal vertikal. Tabel performa upah kerja staf dan riwayat shift diubah menjadi model gulir horizontal agar tetap rapi pada layar kecil.

---

## 3. Komponen Utama & Elemen UI/UX
- **Panel Profil Cafe**: Pengaturan nama outlet, alamat fisik, telepon, tarif pajak PPN (%), dan service charge (%).
- **Sinkronisasi Perangkat HP Staf (Staff invitation code)**:
  - Generator token sinkronisasi smartphone staf (`invitationCode`) dengan pratinjau QR code melayang.
  - Kotak daftar nama smartphone staf yang telah terhubung ke outlet dengan tombol pencabutan hak akses (*revoke access*).
- **Token Diskon Aktif (Discount settings)**:
  - Kotak daftar voucher diskon aktif (persentase/nominal) berserta tombol penghapus.
  - Formulir penambahan kupon diskon baru.
- **Daftar Tata Letak Meja (Table mapping creator)**:
  - Kotak daftar meja kafe berserta koordinat penempatan grid laci kasir (X, Y).
  - Formulir penambahan meja baru ke dalam denah laci grid kasir.
- **Integrasi Fitur Langganan Tenant**: Panel rangkuman status modul fitur langganan aktif (BOM resep, Cash Reconciliation laci kasir).

---

## 4. Manajemen State & Keamanan Sinkronisasi Perangkat
- **Variabel State Utama**:
  - `cafeConfig` (object): Berisi profil bisnis cafe, tarif pajak, dan service rate.
  - `invitationCode` (string): Token acak outlet untuk sinkronisasi perangkat.
  - `registeredDevices` (array): Array smartphone staf yang terhubung.
  - `discounts` (array): Array kupon voucher diskon aktif.
  - `tables` (array): Array meja kafe aktif.
- **Keamanan Sinkronisasi Staf**: Sistem membatasi penggunaan HP staf secara ketat. Pemilik kafe dapat mengacak token sinkronisasi outlet baru kapan saja untuk mencegah penyalahgunaan sinkronisasi dari luar outlet. Jika perangkat staf dicurigai melakukan kecurangan, pemilik dapat menekan tombol "Cabut Akses Perangkat" untuk menghapus ID perangkat tersebut dari `pos_registered_devices` secara instan, sehingga perangkat tersebut tidak dapat digunakan untuk absensi lagi.
