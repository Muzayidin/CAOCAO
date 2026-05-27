# Desain Halaman: Login & Sinkronisasi Hub

Halaman Login & Sinkronisasi (`apps/web/src/app/login/page.tsx`) adalah portal multifungsi yang membagi alur masuk menjadi dua jenis pengguna: Pengelola Kafe (Owner & Admin) melalui kredensial email, serta Karyawan Operasional (Staff Roster) melalui HP pribadi yang terhubung dengan sistem geofencing dan pemindai QR.

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Warna latar belakang semen abu-abu lembut premium (`bg-cafe-100`), kartu konten putih bersih melayang, teks pekat maskulin, aksen hijau zaitun (`text-earth-olive`), dan latar belakang numpad netral hangat (`bg-cafe-50`).
- **Elemen Dinamis**:
  - Tab geser interaktif untuk memisahkan portal "Owner/Admin" dan "HP Staf Roster".
  - Denyut animasi halus (`animate-pulse`) pada ikon kamera pemindai QR.
  - Gelembung notifikasi kesalahan berwarna merah pastel lembut dengan ikon penanda.

---

## 2. Optimasi Viewport (Responsivitas)
- **Desain Mobile-First**: Seluruh form dan tata letak dirancang agar pas sempurna di layar smartphone.
- **Keypad Virtual Terintegrasi**: Tombol PIN didesain dengan ukuran tap 56px (`h-14`) agar bebas salah pencet saat dioperasikan dengan satu tangan oleh staf di lapangan.

---

## 3. Komponen Utama & Elemen UI/UX
- **Tab Portal Kredensial vs Smartphone**:
  - **Portal Owner / Admin**: Form input email & sandi standar dengan tautan pendaftaran cafe baru.
  - **Portal HP Staf Roster**:
    - *Kondisi Belum Terhubung*: Form input Nama Perangkat Staf dan Token Sinkronisasi Outlet.
    - *Kondisi Terhubung*: Dasbor mini personal staf menampilkan status outlet, nama perangkat, ID unik perangkat, tombol pemicu pemindai QR absensi, dan opsi putus koneksi.
- **In-App PIN Keypad (Roster PIN)**: Keypad 3x4 numerik untuk mengonfirmasi kehadiran staf setelah pemindaian QR code kasir dinyatakan valid oleh sistem.

---

## 4. Manajemen State & Integrasi Data
- **State Portal & Form**:
  - `activePortal` ('OWNER' | 'STAFF'): Mengontrol panel aktif.
  - `ownerMode` ('LOGIN' | 'REGISTER'): Mengontrol sub-form di portal pengelola.
  - `deviceNameInput` & `invitationCodeInput`: Input teks pendaftaran HP staf baru.
  - `ownerEmail`, `ownerPassword`, `cafeName`, `ownerName`: Kredensial pengelola.
- **State Autentikasi HP Staf**:
  - `isDeviceConnected` (boolean): Status koneksi lokal HP staf ke workspace.
  - `connectedDeviceId` (string): ID unik perangkat terdaftar (misal: `DEV-A1B2C3`).
  - `connectedDeviceName` (string): Label nama perangkat.
  - `showPinPad` (boolean): Menampilkan layar penginputan PIN roster.
  - `pin` (string): Penyimpan input PIN 4-digit.
- **Kamera Scanner (`QrCameraScanner`)**:
  - Pemindai QR internal yang memanfaatkan modul kamera smartphone untuk membaca token QR dinamis kasir.

---

## 5. Alur Validasi Absensi Mandiri (HP Staf)
1. **Verifikasi Perangkat**: HP harus terdaftar di sistem dengan token outlet (`CAO-STAFF-2026`). Jika ID perangkat dihapus oleh Owner di panel pengaturan, HP staf otomatis keluar dari kafe.
2. **Scan QR Kasir**: Staf mengetuk tombol "Absen Masuk/Pulang" untuk membuka kamera dan memindai QR dinamis di layar kasir.
3. **Pemeriksaan Kedaluwarsa**: Sistem membaca token QR yang memuat *timestamp*. Jika selisih waktu scan dengan waktu pembuatan token >60 detik, scan ditolak untuk menghindari kecurangan absensi dari luar kafe.
4. **Verifikasi PIN**: Jika QR valid, staf memasukkan PIN roster pribadi mereka. Kehadiran dicatat di `pos_attendances` lengkap dengan lokasi perangkat dan jam dinas saat itu.
