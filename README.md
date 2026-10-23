# ASEAN AgroTwin

Sesuai arsitektur: Pengguna (Petani, Koperasi, Administrator) → Frontend React.js → Nginx + HTTPS → Backend Node.js + Express.js
→ Digital Twin dan Simulation Engine → Layanan AI dan Prediction → PostgreSQL.

| Komponen | Lokasi |
|---|---|
| Frontend (React, Recharts, Leaflet) | `frontend/` |
| Nginx reverse proxy + HTTPS | `nginx/nginx.conf` |
| REST API, JWT, peran, validasi (zod) | `backend/src/index.js`, `auth.js` |
| Digital Twin dan Simulation Engine | `backend/src/twin.js` |
| Layanan AI (API analitik opsional, cadangan regresi) | `backend/src/ai.js` |
| Skema PostgreSQL (Prisma) | `backend/prisma/schema.prisma` |

## Menjalankan dengan Docker
```bash
cp .env.example .env            # isi POSTGRES_PASSWORD dan JWT_SECRET
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -subj "/CN=localhost" \
  -keyout nginx/certs/privkey.pem -out nginx/certs/fullchain.pem   # sertifikat uji; produksi: Let's Encrypt
docker compose up --build -d
docker compose exec backend npm run seed   # data contoh
```
Buka https://localhost. Akun contoh (kata sandi `password123`): `admin@agrotwin.id`, `koperasi@agrotwin.id`, `petani@agrotwin.id`.

## Pengembangan lokal
Backend: `cd backend && npm i && npx prisma db push && npm run seed && npm run dev` (butuh `DATABASE_URL` dan `JWT_SECRET`).
Frontend: `cd frontend && npm i && npm run dev` (proxy `/api` ke localhost:4000).

## Catatan
- PostgreSQL tidak membuka port ke luar; hanya backend yang mengaksesnya.
- Petani hanya melihat dan mengisi data koperasinya; simulasi, peta, dan prediksi untuk Koperasi dan Admin.
- Model simulasi dan prediksi masih sederhana. Isi `ANALYTICS_URL` untuk menyambungkan model Python (`POST /predict` menerima `{series, steps}` dan mengembalikan `{prakiraan:[...]}`).
- Data cuaca, harga, dan energi eksternal belum terintegrasi otomatis; saat ini dimasukkan lewat endpoint `/api/harga`.

## Deployment Vercel + Neon PostgreSQL

1. Di Neon, buat proyek database dan ambil dua connection string:
   - **Pooled** (untuk runtime serverless): `postgresql://...@<host>-pooler.<region>.aws.neon.tech/<db>?sslmode=require`
   - **Direct** (untuk migrasi, port 5432): `postgresql://...@<host>.<region>.aws.neon.tech/<db>?sslmode=require`
   Keduanya wajib menyertakan `sslmode=require` (Neon mewajibkan TLS). Simpan di `.env` lokal, **tidak** di source code.
2. Di Vercel (Settings → Project → Environment Variables), isi per lingkungan:
   - `DATABASE_URL` → connection string pooled Neon. Atur tersedia untuk **Production** (dan **Preview** jika pakai Neon branch terpisah; jangan biarkan Preview tertukar dengan Production).
   - `DIRECT_DATABASE_URL` → connection string direct Neon (hanya perlu saat build/migrasi).
   - `JWT_SECRET` → string acak panjang (sama dengan yang digunakan agar token tetap valid).
   - `ANALYTICS_URL` → opsional.
3. Sebelum trafik produksi diterima, jalankan migrasi sekali secara terkontrol terhadap Neon:
   ```
   cd backend
   DATABASE_URL=<DIRECT_DATABASE_URL_Neon> npx prisma migrate deploy
   ```
   Migrasi ini idempoten (hanya menerapkan migrasi yang belum pernah dijalankan) dan tidak memanggil `migrate reset`, sehingga data produksi tidak dihapus.
4. Setiap `git push` ke produksi, Jalankan `npm run build` (melalui Vercel) yang menjalankan `prisma generate` lalu `prisma migrate deploy`.
5. Untuk data awal/akun admin, jalankan `npm run seed` setelah tabel tersedia. Seed aman dijalankan ulang: tidak menimpa `passwordHash` user yang sudah ada.

Akun contoh dari seed (sandi `password123`): `admin@agrotwin.id`, `koperasi@agrotwin.id`, `petani@agrotwin.id`.

## Publikasi ke GitHub Pages (mode demo)
GitHub Pages hanya menyajikan file statis, jadi backend Node.js dan PostgreSQL tidak berjalan di sana. Frontend React dibangun dalam **mode demo**:
`frontend/src/mock.js` meniru API (login, produksi, twin, prediksi, simulasi) di browser dan menyimpan data di localStorage.

1. Push ke branch `main`.
2. Di GitHub: Settings, Pages, Build and deployment, Source: **GitHub Actions**.
3. Workflow `.github/workflows/pages.yml` membangun dan menerbitkan otomatis. Link: `https://USERNAME.github.io/agrotwin/`.

Akun demo (kata sandi `password123`): `admin@agrotwin.id`, `koperasi@agrotwin.id`, `petani@agrotwin.id`.
Untuk memakai backend asli (Docker atau VPS), build frontend dengan `VITE_USE_API=true` (sudah diatur di `frontend/Dockerfile`).
