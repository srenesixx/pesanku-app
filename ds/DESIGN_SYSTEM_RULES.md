# Design System Rules — PesanKu (Khusus Sisi Pembeli)

> **Project**: PesanKu — Aplikasi Pemesanan Digital Warung Nasi Ayam Mak Nyus (A26-CS055)  
> **Scope**: **Khusus antarmuka Pembeli** (membuka aplikasi → melihat daftar menu → memilih menu & jumlah pesanan → mengirim pesanan → memantau status pesanan)  
> **Architecture**: Atomic Design + Semantic Utility Tokens (`@theme inline` / Tailwind v4-ready)  
> **Typography**: `Inter` (dengan `tabular-nums` untuk seluruh harga dan kuantitas)

---

## 1. Foundation: Semantic Tokens & Utility Classes (Light & Dark Mode)

Frontend developer **dilarang** melakukan hardcode warna hex di dalam komponen. Gunakan nama utility class semantik berikut agar tema **Light** dan **Dark** bekerja otomatis melalui CSS variables (`:root` dan `.dark`).

### 1.1 Color Tokens & Utility Mapping

| Role | Utility Class | Light Mode (Hex) | Dark Mode (Hex) | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Background Base** | `bg-surface` | `#FAF7F2` | `#141210` | Latar utama halaman (warm parchment / espresso) |
| **Surface Card** | `bg-surface-card` | `#FFFFFF` | `#1E1B18` | Kartu menu, panel keranjang, modal |
| **Surface Subtle** | `bg-surface-subtle` | `#F2ECE1` | `#2A2521` | Input field, hover state, skeleton, badge netral |
| **Text Primary** | `text-ink` | `#1C1917` | `#F5F2EB` | Judul, nama menu, angka total |
| **Text Secondary** | `text-ink-muted` | `#57534E` | `#A8A29E` | Deskripsi menu, catatan pesanan, subjudul |
| **Border / Divider** | `border-line` | `#E5DDD0` | `#332D28` | Garis pemisah kartu, input border |
| **Brand Primary** | `bg-brand` / `text-brand` | `#C2410C` | `#EA580C` | Tombol utama (Tambah, Kirim Pesanan), harga highlight |
| **Brand Hover** | `hover:bg-brand-hover` | `#9A3412` | `#F97316` | Hover state tombol utama |
| **Brand Soft** | `bg-brand-soft` | `#FFEDD5` | `#431407` | Background badge kategori aktif, highlight ringan |
| **Success (Selesai)** | `bg-success-soft` / `text-success` | `#DCFCE7` / `#15803D` | `#052E16` / `#4ADE80` | Status pesanan *Selesai* / *Siap Diambil* |
| **Warning (Diproses)** | `bg-warning-soft` / `text-warning` | `#FEF3C7` / `#B45309` | `#451A03` / `#FBBF24` | Status pesanan *Menunggu* / *Sedang Dimasak* |
| **Danger (Batal/Error)** | `bg-danger-soft` / `text-danger` | `#FEE2E2` / `#B91C1C` | `#450A0A` / `#F87171` | Hapus item, validasi error, menu habis |

### 1.2 Implementasi `@theme inline` (CSS)

```css
:root {
  --surface: #FAF7F2;
  --surface-card: #FFFFFF;
  --surface-subtle: #F2ECE1;
  --ink: #1C1917;
  --ink-muted: #57534E;
  --line: #E5DDD0;
  --brand: #C2410C;
  --brand-hover: #9A3412;
  --brand-soft: #FFEDD5;
  --success: #15803D;
  --success-soft: #DCFCE7;
  --warning: #B45309;
  --warning-soft: #FEF3C7;
  --danger: #B91C1C;
  --danger-soft: #FEE2E2;
}

.dark {
  --surface: #141210;
  --surface-card: #1E1B18;
  --surface-subtle: #2A2521;
  --ink: #F5F2EB;
  --ink-muted: #A8A29E;
  --line: #332D28;
  --brand: #EA580C;
  --brand-hover: #F97316;
  --brand-soft: #431407;
  --success: #4ADE80;
  --success-soft: #052E16;
  --warning: #FBBF24;
  --warning-soft: #451A03;
  --danger: #F87171;
  --danger-soft: #450A0A;
}

@theme inline {
  --color-surface: var(--surface);
  --color-surface-card: var(--surface-card);
  --color-surface-subtle: var(--surface-subtle);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-line: var(--line);
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-soft: var(--brand-soft);
  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-warning: var(--warning);
  --color-warning-soft: var(--warning-soft);
  --color-danger: var(--danger);
  --color-danger-soft: var(--danger-soft);
}
```

### 1.3 Typography & Spacing Rules
- **Font Family**: `Inter, system-ui, sans-serif`
- **Angka & Harga**: Wajib pakai `tabular-nums` agar harga dan jumlah pesanan sejajar rapi.
- **Radius**:
  - Card & Panel: `rounded-xl` (`12px`)
  - Button & Input: `rounded-lg` (`8px`)
  - Badge / Pill Status: `rounded-full`
- **Touch Target**: Minimal `44px × 44px` (`min-h-11 min-w-11`) untuk semua elemen interaktif di HP & Tablet.

---

## 2. Atomic Design Hierarchy (Sisi Pembeli)

Struktur folder komponen: `src/components/{atoms,molecules,organisms,templates}/`.

### 2.1 Atoms (Elemen Dasar)
1. **`Button`**: Variants `primary` (`bg-brand text-white`), `secondary` (`bg-surface-subtle text-ink`), `ghost` (`text-ink-muted hover:bg-surface-subtle`), `danger` (`bg-danger-soft text-danger`). Sizes: `sm`, `md`, `lg`.
2. **`Badge`**: Status pill (`warning`, `success`, `danger`, `neutral`).
3. **`PriceTag`**: Menampilkan format `Rp15.000` dengan `tabular-nums font-semibold text-ink`.
4. **`QuantityStepper`**: Tombol `-` / angka / `+` dengan ukuran sentuh minimal `44px` di mobile.
5. **`Input`**: Input nama pembeli / catatan pesanan dengan `bg-surface-card border border-line text-ink focus:ring-2 focus:ring-brand`.

### 2.2 Molecules (Gabungan Atom)
1. **`MenuCard`**: Foto menu + Nama menu + Deskripsi singkat + `PriceTag` + `Button` ("Tambah") atau `QuantityStepper` (jika sudah dipilih).
2. **`CartItemRow`**: Nama menu + `PriceTag` subtotal + `QuantityStepper` + tombol hapus.
3. **`OrderStatusPill`**: `Badge` yang memetakan status pesanan pembeli: `Menunggu` (warning) → `Diproses` (brand-soft) → `Selesai` (success).
4. **`SearchFilterBar`**: Input pencarian menu + pill kategori (Semua, Makanan, Minuman).

### 2.3 Organisms (Bagian Halaman Utuh)
1. **`HeaderNav`**: Logo *PesanKu*, nama warung (*Warung Nasi Ayam Mak Nyus*), toggle Light/Dark mode, dan tombol keranjang (dengan badge jumlah item).
2. **`MenuGrid`**: Grid responsif berisi `MenuCard` + `SearchFilterBar`.
3. **`CartPanel` / `CartDrawer`**: Daftar `CartItemRow`, input nama/catatan pembeli, kalkulasi subtotal & total otomatis, serta `Button` **"Kirim Pesanan"**.
4. **`OrderStatusTracker`**: Ringkasan pesanan yang sudah dikirim beserta `OrderStatusPill` yang terupdate otomatis.

### 2.4 Templates & Pages (Alur Pembeli)
1. **Halaman Katalog & Pemesanan (`/menu`)**:
   - *Alur*: Pembeli membuka aplikasi → melihat daftar menu → memilih menu & jumlah pesanan → mengirim pesanan.
2. **Halaman Status Pesanan (`/order/:id`)**:
   - *Alur*: Sistem menyimpan pesanan → pembeli memantau pembaruan status (*Menunggu* → *Diproses* → *Selesai*).

---

## 3. Responsive Rules untuk Pembeli (HP, Tablet, Laptop)

| Viewport | Breakpoint | Layout Menu (`MenuGrid`) | Keranjang (`Cart`) | Navigasi & Aksi Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Website HP** | `< 640px` (base) | `grid-cols-1` (1 kolom penuh, mudah di-scroll jempol) | **Sticky Bottom Bar** (`fixed bottom-0 inset-x-0`) menampilkan total & tombol *"Lihat Keranjang"* → membuka **Bottom Sheet / Full Drawer** | Header ringkas, filter kategori horizontal scrollable (`overflow-x-auto`) |
| **Website Tablet** | `640px – 1023px` (`sm:` / `md:`) | `grid-cols-2 gap-4` | **Slide-over Drawer** dari kanan (`w-96`) saat tombol keranjang diklik | Header dengan search bar + filter kategori sejajar |
| **Website Laptop** | `>= 1024px` (`lg:` / `xl:`) | `grid-cols-3 gap-5` di sisi kiri (`flex-1`), max-width container `1280px` | **Persistent Sticky Panel** (`w-[380px] sticky top-20`) selalu terlihat di kanan tanpa perlu klik buka-tutup | Pembeli bisa langsung melihat menu di kiri & mengedit jumlah/kirim pesanan di kanan secara bersamaan |
