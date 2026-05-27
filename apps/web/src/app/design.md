# Desain Halaman: Landing Page & Registrasi Tenant

Halaman Landing Page (`apps/web/src/app/page.tsx`) adalah pintu gerbang utama aplikasi **POS CAOCAO** yang berfungsi sebagai portal informasi produk sekaligus form registrasi mandiri bagi pemilik cafe baru (Multi-Tenant).

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Estetika modern bertema Cafe Premium dengan latar belakang bernada netral hangat (`bg-cafe-50`), teks charcoal pekat (`text-cafe-900`), aksen hijau olive alami (`text-earth-olive`), dan tombol cokelat gelap premium (`bg-cafe-800`).
- **Elemen Dinamis**:
  - Efek blur abstrak melingkar berwarna pastel hangat (`bg-cafe-200/40 blur-[120px]` dan `bg-earth-olive/10 blur-[150px]`) di latar belakang untuk kedalaman visual yang elegan.
  - Animasi denyut halus (`animate-pulse`) pada badge fitur Multi-Tenant untuk menarik perhatian.
  - Tombol aksi berbayang premium (`shadow-premium`) dengan transisi skala halus saat diklik.

---

## 2. Optimasi Viewport (Responsivitas)
- **Desktop (Layar Lebar)**: Tata letak *grid split* 12 kolom (`lg:grid-cols-12`):
  - **Kiri (7 Kolom)**: Berisi branding brand (POS CAOCAO), tagline visual, paragraf penjelasan nilai jual produk, dan 2-kolom ringkasan fitur utama (BOM Deductions & Reliable Offline Mode).
  - **Kanan (5 Kolom)**: Form registrasi melayang dengan kartu putih premium berbayang solid (`rounded-3xl p-8 border border-cafe-100 shadow-premium`).
- **Tablet & Mobile (Layar Kecil)**: Kolom kiri dan kanan melebur menjadi tata letak satu kolom vertikal. Konten edukasi berada di atas, diikuti oleh form registrasi di bagian bawah untuk memudahkan pengoperasian satu tangan.

---

## 3. Komponen Utama & Elemen UI/UX
- **Branding Header**: Logo berupa ikon cangkir kopi (`Coffee`) dengan bayangan premium dan teks label "POS CAOCAO".
- **Kartu Fitur Ringkas**: Grid mini 2 kolom yang menyorot fitur mutakhir:
  - *Automatic BOM Deductions* (Ikon petir hijau).
  - *Reliable Offline Mode* (Ikon perisai centang cokelat).
- **Form Registrasi Tenant**:
  - Input teks teroptimasi dengan tinggi tap minimum 48px (`py-3`) untuk kenyamanan penginputan di perangkat seluler.
  - Skema pembatas form yang rapi (`hr className="border-cafe-100"`).
- **Layar Sukses**: Transisi transparan dengan ikon centang bulat besar (`Check`) saat pendaftaran berhasil dilakukan sebelum dialihkan ke dasbor.

---

## 4. Manajemen State & Integrasi Data
- **State Form (`formData`)**:
  - `cafeName`: Nama cafe tenant.
  - `address`: Alamat fisik cafe.
  - `phone`: Nomor kontak operasional.
  - `name`: Nama pemilik (Owner).
  - `email`: Alamat email akun.
  - `password`: Kata sandi akun utama.
- **State UI**:
  - `isLoading` (boolean): Menampilkan teks status pengiriman data pada tombol submit.
  - `isSuccess` (boolean): Menampilkan visual perayaan registrasi sukses.
  - `errorMessage` (string): Pesan galat dari server jika pendaftaran gagal.
- **Penyimpanan Lokal (Local Storage)**:
  - `pos_token`: Token JWT mock untuk autentikasi.
  - `pos_user`: Serialisasi objek pengguna utama.
  - `pos_tenant_id`: Kode unik tenant (kafe) untuk memisahkan data antarentitas.
- **Mekanisme Offline Fallback**:
  - Jika server registrasi API (`http://localhost:4001/register`) mati, sistem secara otomatis mengaktifkan mode demo/simulasi lokal dengan menyuntikkan profil dummy ke localStorage dan mengarahkan pengguna langsung ke kasir dalam 1,5 detik guna menjamin kelancaran pengetesan.
