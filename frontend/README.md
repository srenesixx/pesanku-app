# PesanKu — Frontend (Warung Nasi Ayam Mak Nyus)

Antarmuka web responsif untuk aplikasi **PesanKu** (Capstone Project Asah 2026 — Tim A26-CS055).

## Fitur Utama

- **Tampilan Pembeli**: daftar menu per kategori, badge menu favorit, keranjang dengan perhitungan subtotal & total otomatis, validasi input, kirim pesanan, dan pelacakan status pesanan via kode (`PK-XXXX`).
- **Login Pemilik**: autentikasi pemilik dengan validasi input dan pesan error.
- **Dashboard Penjualan**: ringkasan pendapatan, jumlah transaksi, pesanan aktif, menu terlaris, grafik penjualan 5 hari terakhir, dan panel **AI Insight Penjualan** (termasuk fallback jika layanan AI gagal).
- **Pengelolaan Menu**: tambah, ubah, hapus menu, dan ubah status ketersediaan (Tersedia/Habis).
- **Pencatatan Pesanan**: kelola pesanan masuk, ubah status (`Menunggu` → `Diproses` → `Selesai` / `Dibatalkan`), dan catat pesanan baru langsung dari kasir.
- **Riwayat Transaksi & Laporan**: filter tanggal & status, ringkasan pendapatan, dan ekspor laporan ke CSV.

## Cara Menjalankan

```bash
npm install
npm run dev
```

Pengujian unit & build produksi:

```bash
npm test
npm run build
```

## Akun Uji Lokal (Mock API)

- **Email**: `pemilik@maknyus.id`
- **Kata sandi**: `maknyus2026`

## Integrasi Backend API

Secara default aplikasi berjalan dengan **Mock API lokal (`localStorage`)**. Untuk menghubungkan ke backend asli, salin `.env.example` menjadi `.env` dan isi `VITE_API_BASE_URL`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Endpoint yang digunakan oleh `src/services/api.js`:

- `POST /auth/login`
- `GET /menus`, `POST /menus`, `PUT /menus/:id`, `DELETE /menus/:id`
- `GET /orders`, `GET /orders/code/:code`, `POST /orders`, `PATCH /orders/:id/status`
- `GET /reports/summary`, `GET /ai/insights`
