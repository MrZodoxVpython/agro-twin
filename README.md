# ASEAN AgroTwin (versi statis untuk GitHub Pages)

Website statis (HTML, CSS, JavaScript) tanpa proses build. Desain sama dengan aplikasi React/Node versi penuh.
Data berupa demo yang disimpan di browser (localStorage), jadi tidak butuh backend atau database.

## Cara menerbitkan
1. Letakkan isi folder ini di **root** repositori (`index.html` harus berada di paling atas).
2. Settings, Pages, Source: **Deploy from a branch**, Branch: `main`, Folder: `/ (root)`, Save.
3. Buka `https://USERNAME.github.io/NAMA-REPO/`, lalu login.

Akun demo (kata sandi `password123`): `admin@agrotwin.id`, `koperasi@agrotwin.id`, `petani@agrotwin.id`.

## Struktur
- `index.html`: halaman utama
- `css/theme.css`: seluruh tampilan (tema malam tropis)
- `js/data.js`: data dan logika demo (digital twin, simulasi, prediksi)
- `js/app.js`: tampilan, animasi, dan interaksi (Ctrl+K membuka palet perintah)
- Library (Leaflet, Chart.js) dimuat dari cdnjs
