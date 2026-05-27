# Desain Halaman: KDS Kitchen Display System (Antrian Dapur Utama)

Halaman Kitchen Display (`apps/web/src/app/dashboard/kitchen/page.tsx`) adalah stasiun antrian digital dapur KDS (Kitchen Display System) berbasis Kanban yang merutecan secara khusus setiap menu pesanan berkategori **Makanan (Food)** secara real-time langsung ke hadapan kepala koki di dapur utama.

---

## 1. Tampilan Visual & Estetika (Aesthetics)
- **Tema Warna**: Estetika modern minimalis dengan latar belakang abu-abu cafe premium (`bg-cafe-50`), tajuk KDS dapur berwarna cokelat espresso pekat (`bg-cafe-800`), aksen hijau zaitun pekat (`text-earth-olive`), serta kartu antrean putih bersih dengan batas tepian halus.
- **Indikator Waktu Dinamis (Elapsed Timer)**: Batas kartu KDS otomatis berubah menjadi kuning keemasan (`border-amber-500`) jika pesanan tertahan di dapur >15 menit, dan berubah menjadi merah menyala (`border-red-500 ring-2 ring-red-500/20`) jika pesanan tertahan >25 menit untuk mengingatkan kecepatan racik koki.

---

## 2. Optimasi Viewport (Responsivitas)
- **Desain Tablet Split Grid**: Dirancang khusus untuk monitor KDS tablet yang terpasang di area dinding dapur. Tata letak grid dinamis otomatis menyesuaikan diri:
  - 1 kolom pada layar HP koki/waiter.
  - 2 kolom pada monitor kecil.
  - 3-4 kolom pada monitor lebar resolusi tinggi (`lg:grid-cols-3 xl:grid-cols-4`).
- **Target Sentuh Nyaman (Minimum 48px)**: Setiap item hidangan makanan yang harus dimasak dikemas dalam tombol baris tebal lebar berukuran minimal 52px agar koki dapat mengetuk status selesai masak menggunakan satu jari dengan mudah dan higienis.

---

## 3. Komponen Utama & Elemen UI/UX
- **Header KDS Kitchen**: Memuat judul panel, ikon topi koki (`ChefHat`), pencatat statistik tiket makanan aktif, dan label status.
- **Kanban Order Ticket (Tiket Masak Dapur)**: Setiap kartu memuat:
  - Judul Meja (misal: "Meja 2") dengan warna latar belakang kontras tinggi.
  - Nama Waiter penginput pesanan.
  - Elapsed Timer (penunjuk menit waktu tunggu sejak pesanan diproses di kasir).
  - Daftar Item hidangan berserta catatan kustom koki (misal: "Spaghetti Bolognese Extra Cheese").
  - Tombol aksi centang penyelesaian hidangan individu.
  - Tombol utama "Selesaikan Makanan" untuk menyelesaikan seluruh tiket.
- **Layar Antrian Kosong**: Ilustrasi ikon topi koki abu-abu berbayang premium jika seluruh antrean hidangan makanan dapur telah disajikan.

---

## 4. Manajemen State & Integrasi Data
- **Variabel State Utama**:
  - `tickets` (array): Array objek tiket pesanan makanan dapur aktif.
  - `now` (date): Objek waktu real-time yang memicu pembaruan timer elapsed menit per detik.
  - `confirmTicketId` (string | null): Menyimpan ID tiket yang sedang dikonfirmasi untuk diselesaikan.
- **Metode Aksi KDS**:
  - `toggleItemCompleted`: Menandai hidangan makanan individu dalam satu tiket sudah selesai dimasak (memberikan gaya coretan teks / *line-through* abu-abu halus).
  - `triggerCompleteConfirmation`: Menampilkan dialog popup verifikasi ganda sebelum mengarsipkan tiket dapur.
  - `handleExecuteCompleteTicket`: Mengirim status PATCH `READY` ke API KDS (`http://localhost:4002/kds/tickets/${ticketId}`) untuk mengarsipkan pesanan makanan dan memberi tahu kasir.
