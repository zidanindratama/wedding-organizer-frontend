# JeWePe Wedding Organizer — Frontend

Frontend untuk platform **JeWePe Wedding Organizer**.
Dibangun dengan **Next.js (App Router) + TypeScript**, **Tailwind + shadcn/ui**, **React Hook Form + Zod**, **Axios**, dan **sonner** untuk notifikasi.

Aplikasi ini terhubung dengan **JeWePe Backend API**.

---

## ✨ Fitur

### Publik

- **Beranda** → Hero, layanan, showcase paket, CTA.
- **Katalog Paket** → Cari, sort (A–Z, harga), paginate.
- **Detail Paket** → Info paket + harga.
- **Pemesanan Paket** → Form order dengan validasi.
- **Status Pemesanan** → Cek order by `email` atau `orderCode`.
- **Kontak** → Form kirim pesan.

### Admin

- **Login** → Autentikasi user role `ADMIN`.
- **Dashboard** → Ringkasan order, grafik tren, status distribusi.
- **Kelola Paket** → List, tambah, update, hapus.
- **Kelola Order** → List, filter, ubah status (PENDING/APPROVED/REJECTED).
- **Kelola Kontak** → List pesan, tandai NEW/READ.
- **Reports** → Laporan order & revenue, top packages, export CSV.

---

## 🧱 Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Lucide-react** (ikon)
- **React Hook Form** + **Zod**
- **Axios** (dengan interceptor cookie/token)
- **sonner** (toast notification)

---

## 📁 Struktur Proyek (ringkas)

```
app/
  (main)/
    page.tsx
    katalog-paket/page.tsx
    kontak/page.tsx
    pemesanan-paket/page.tsx
    status-pemesanan/page.tsx
  dashboard/
    page.tsx
    katalog/
      tambah/page.tsx
      [id]/page.tsx
  login/page.tsx
  layout.tsx   # RootLayout
  globals.css

components/
  main/        # Navbar, hero, sections, forms publik
  dashboard/   # Admin shell, overview, manajer paket/order/kontak
  login/       # Login form + hero
  ui/          # shadcn/ui (button, card, table, form, toast, dsb.)

libs/
  axios-instance.ts   # Axios client dgn interceptor cookies/token
```

---

## ⚙️ Environment Variables

Buat file `.env.local`:

```env
# URL API backend
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

> Saat deploy di Vercel, isi `NEXT_PUBLIC_API_URL` dengan URL backend production.

---

## 🚀 Menjalankan Proyek

```bash
# install dependencies
npm install

# development
npm run dev
# -> http://localhost:3000

# build
npm run build

# production start
npm start

# lint
npm run lint
```

---

## 🔐 Autentikasi

- Login (`/login`) → `POST /auth/login`
- Backend mengembalikan `{ accessToken, user }`
- Token disimpan di **cookie** (`access_token`, `user`)
- `axiosInstance` otomatis pasang header `Authorization: Bearer <token>`
- Jika `401 Unauthorized` → token & user dihapus, redirect login

---

## 🔗 Integrasi API

- **Packages**

  - `GET /packages` (publik)
  - `GET /packages/:id` (publik)
  - `GET /packages/admin/all` (admin)
  - `POST /packages`, `PUT /packages/:id`, `DELETE /packages/:id` (admin)

- **Orders**

  - `POST /orders` (publik)
  - `GET /orders/check?email=...|code=...` (publik)
  - `GET /orders` (admin)
  - `PATCH /orders/:id/status` (admin)

- **Contacts**

  - `POST /contacts` (publik)
  - `GET /contacts` (admin)
  - `PATCH /contacts/:id/status` (admin)

- **Reports (admin)**

  - `/reports/orders/summary`
  - `/reports/orders/status-distribution`
  - `/reports/orders/trend`
  - `/reports/orders/export/csv`
  - `/reports/revenue/summary`
  - `/reports/packages/top`
  - `/reports/events/upcoming`
  - `/reports/pending/aging`

---

## 🎨 UI/UX

- **Warna utama**: hijau JeWePe `#4E5A40`, variasi `#3E4638`, abu `#8C8C8C`.
- **Komponen shadcn/ui**: Button, Card, Table, Select, Dialog, Badge, Skeleton, Toast.
- **Font** (via `next/font`):

  - Heading → `Marcellus` / `Sen`
  - Body → `Montserrat`
  - Sans/Mono tambahan → `Geist`, `Geist_Mono`

- **Feedback**

  - Loading state (skeleton/spinner)
  - Toast sukses/gagal
  - Empty state untuk tabel kosong

---

## ☁️ Deploy (Vercel)

1. Push repo ke GitHub/GitLab.
2. Import ke Vercel.
3. Set env di Vercel:

   - `NEXT_PUBLIC_API_URL=https://wedding-organizer-backend.vercel.app/api/v1`

4. Build command default: `next build`.
5. Tambahkan domain frontend (`*.vercel.app`) ke allowlist CORS backend.

---

## 🧪 QA Checklist

- [ ] Semua form tervalidasi (Zod + RHF)
- [ ] Error API muncul di toast
- [ ] Admin route redirect ke login kalau belum login
- [ ] Pagination/sorting katalog bekerja
- [ ] Cek order by email/kode jalan
- [ ] Export CSV bisa diunduh
- [ ] UI responsive (mobile & desktop)

---

## 🛡️ Keamanan

- Token disimpan di cookie (jangan simpan di URL).
- Jangan render data sensitif tanpa sanitize.
- Handle `401 Unauthorized` secara global.
- Rate limiting bisa ditambah di backend untuk endpoint publik.

---

## 📄 License

MIT © 2025 JeWePe Team

---
