# Desain Halaman: KDS Bar Display System (Antrian Barista)

Halaman Bar Display (`apps/web/src/app/dashboard/bar/page.tsx`) adalah stasiun antrian digital bar KDS (Kitchen Display System) berbasis Kanban yang merutekan secara khusus setiap menu pesanan berkategori **Minuman (Drink)** secara real-time langsung ke hadapan barista di balik meja racik.

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Estetika modern minimalis dengan latar belakang abu-abu cafe premium (`bg-cafe-50`), tajuk KDS bar berwarna cokelat espresso (`bg-cafe-800`), aksen hijau olive (`text-earth-olive`), serta kartu antrean putih bersih dengan batas tepian halus.
- **Indikator Waktu Dinamis**: Batas kartu KDS otomatis berubah menjadi kuning keemasan (`border-amber-500`) dengan efek cincin menyala jika pesanan minuman barista tertahan di barista melebihi batas toleransi racik 10 menit guna mengoptimalkan kecepatan penyajian.

---

## 2. Optimasi Viewport (Responsivitas)
- **Desain Tablet Split Grid**: Dirancang khusus untuk monitor KDS tablet yang terpasang di atas bar counter. Tata letak grid dinamis otomatis menyesuaikan diri:
  - 1 kolom pada layar HP waiter/barista.
  - 2 kolom pada monitor kecil.
  - 3-4 kolom pada monitor lebar resolusi tinggi (`lg:grid-cols-3 xl:grid-cols-4`).
- **Target Sentuh Nyaman (Minimum 48px)**: Setiap item menu minuman yang harus diracik dikemas dalam tombol baris tebal lebar berukuran minimal 52px agar barista dapat mengetuk status selesai racik menggunakan satu jari dengan mudah dan higienis.

---

## 3. Komponen Utama & Elemen UI/UX
- **Header KDS Bar**: Memuat judul panel, ikon cangkir kopi (`Coffee`), pencatat statistik tiket minuman aktif, dan label status.
- **Kanban Order Ticket (Tiket Racik Bar)**: Setiap kartu memuat:
  - Judul Meja (misal: "Bar Counter 1") dengan warna latar belakang kontras tinggi.
  - Nama Waiter penginput pesanan.
  - Elapsed Timer (penunjuk menit waktu tunggu sejak pesanan diproses di kasir).
  - Daftar Item minuman berserta catatan khusus (misal: "Warm (Oat milk switch)", "Double Shot").
  - Tombol aksi centang penyelesaian item individu.
  - Tombol utama "Selesaikan Minuman" untuk menyelesaikan seluruh tiket.
- **Layar Antrian Kosong**: Ilustrasi ikon Coffee abu-abu berbayang premium jika seluruh antrean racik minuman telah disajikan.

---

## 4. Manajemen State & Integrasi Data
- **Variabel State Utama**:
  - `tickets` (array): Array objek tiket pesanan minuman aktif.
  - `now` (date): Objek waktu real-time yang memicu pembaruan timer elapsed menit per detik.
  - `confirmTicketId` (string | null): Menyimpan ID tiket yang sedang dikonfirmasi untuk diselesaikan.
- **Metode Aksi KDS**:
  - `toggleItemCompleted`: Menandai item minuman individu dalam satu tiket sudah selesai diracik (memberikan gaya coretan teks / *line-through* abu-abu halus).
  - `triggerCompleteConfirmation`: Menampilkan dialog popup verifikasi ganda sebelum mengarsipkan tiket minuman.
  - `handleExecuteCompleteTicket`: Mengirim status PATCH `READY` ke API KDS (`http://localhost:4002/kds/tickets/${ticketId}`) untuk mengarsipkan pesanan dan memberi tahu server kasir.
