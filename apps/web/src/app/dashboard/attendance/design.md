# Desain Halaman: Staff Attendance Geofencing Portal

Halaman Attendance (`apps/web/src/app/dashboard/attendance/page.tsx`) adalah stasiun pengelola absensi karyawan terintegrasi geofencing GPS yang memfasilitasi pencatatan jam kerja dinas secara mandiri (Clock-In/Clock-Out) menggunakan QR Code Dinamis ataupun Keypad PIN cadangan.

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Dominasi warna putih bersih pada kontainer kartu, abu-abu cafe premium hangat (`bg-cafe-100`), dan warna hijau zaitun pekat (`text-earth-olive`) sebagai aksen utama penunjuk kesuksesan.
- **Elemen Dinamis**:
  - **Circular Timer Ring**: Animasi cincin hitung mundur visual melingkar murni menggunakan SVG (`strokeDasharray` & `strokeDashoffset`) yang berubah warna dari hijau subur ke merah menyala saat durasi token dinamis mendekati detik-detik terakhir kedaluwarsa.
  - Kartu QR Code melayang dengan batas sudut membulat elegan (`rounded-2xl shadow-md`).

---

## 2. Optimasi Viewport (Responsivitas)
- **Tablet (Cashier Screen Layout)**: Layout 3 kolom:
  - **Kiri (1 Kolom)**: Berisi panel generator QR Code Dinamis Layar Kasir dan Keypad Backup PIN.
  - **Kanan (2 Kolom)**: Berisi Roster Absensi & tombol aksi cetak kartu QR Code karyawan.
- **Mobile Viewport**: Seluruh kolom menyusut menjadi satu jalur vertikal teratur yang meletakkan stasiun scan QR di bagian teratas agar mudah dipindai oleh kamera handphone staf.

---

## 3. Komponen Utama & Elemen UI/UX
- **QR Code Absensi Dinamis (Tablet Screen)**:
  - Tombol generator token QR unik berdurasi 60 detik.
  - Cincin countdown visual + penayangan kode alfanumerik cadangan (`attendanceCode`) di dalam kotak putih.
- **Keypad Backup PIN**:
  - Papan tombol 3x4 numerik virtual untuk mencatat absensi secara manual jika kamera smartphone bermasalah.
- **GPS Geofencing Simulator Panel**:
  - Switcher simulasi koordinat GPS satelit perangkat staf ("Di Cafe" Lat -6.2088 radius 5m vs "Di Luar Area" Lat -6.2300 radius 4.8km).
- **Roster & QR Karyawan**:
  - Tabel berisi nama, jabatan/peran staf, PIN roster terenkripsi, dan tombol unduh kartu QR pribadi karyawan (`QRCodeSVG`).

---

## 4. Manajemen State & Integrasi Data
- **State QR Dinamis**:
  - `activeAttendanceToken` (string): Token QR terenkripsi yang memuat kode acak dan *timestamp* waktu pembuatan.
  - `timeLeft` (number): Countdown sisa waktu validitas token (detik).
- **State Input & Geofencing**:
  - `clockPin` (string): Menampung digit PIN yang diinput via numpad.
  - `gpsMode` ('CAFE' | 'AWAY'): Menyetel simulasi radius GPS absensi.
- **State Modal Overlays**:
  - `isQrModalOpen` (boolean): Membuka dialog pratinjau QR Code kartu nama karyawan.
  - `isScannerOpen` (boolean): Membuka simulator pemindai kamera outlet.

---

## 5. Logika Absensi Roster & Denda Keterlambatan
Sistem secara otomatis menghitung status absensi berdasarkan waktu clock-in staf:
- **Toleransi Telat (Late Tolerance)**: Standar jam masuk adalah pukul 08:00 pagi. Jika staf melakukan clock-in lewat dari menit toleransi (default 15 menit), status diubah menjadi **Terlambat** dan denda potong gaji diakumulasikan ke modul payroll.
- **Geofence Enforcement**: Jika GPS mendeteksi staf berada di luar koordinat aman kafe saat mengetuk tombol absen, status disetel menjadi **Diluar Area (Tidak Valid)**, jam kerja bernilai **0**, dan denda denda kedisiplinan diaktifkan demi mencegah absensi palsu.
