
# Aplikasi Todo List Sederhana

## Demo Aplikasi

Anda dapat mencoba langsung aplikasi todo list ini melalui tautan berikut:

**[https://shoukelp.github.io/todo-app/](https://shoukelp.github.io/todo-app/)**

## Fitur Aplikasi

Aplikasi todo list ini memungkinkan Anda untuk:

- **Menambahkan Tugas Baru**
- **Melihat Daftar Tugas**
- **Menandai Tugas Selesai**
- **Menghapus Tugas**
- **Mengedit Tugas**
- **Login dengan Google**
- **Melanjutkan Sebagai Tamu**
- **Sign Up/Sign In dengan Email dan Password**

## Struktur
```
.
└── /
    ├── docs/
    │   ├── flowchart.png
    │   └── tables.png
    ├── public/
    │   ├── favicon.ico
    │   ├── index.html
    │   ├── logo.png
    │   ├── logo192.png
    │   ├── logo512.png
    │   ├── manifest.json
    │   └── robots.txt
    ├── src/
    │   ├── assets/
    │   │   └── icons/
    │   │       ├── auth-icon.svg
    │   │       ├── google-icon.svg
    │   │       └── guest-icon.svg
    │   ├── components/
    │   │   ├── Auth.js
    │   │   ├── constants.js
    │   │   ├── TodoForm.js
    │   │   └── TodoItem.js
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── utils/
    │   │   └── cookie.js
    │   ├── App.css
    │   ├── App.js
    │   └── index.js
    ├── .env
    ├── .gitignore
    ├── LICENSE
    ├── package.json
    └── README.md
```

## Instalasi dan Penggunaan Pribadi

Berikut adalah langkah-langkah untuk menjalankan aplikasi ini di lokal dan menghubungkannya dengan Supabase serta Google OAuth.

### Prasyarat

- **Node.js dan npm (atau yarn)**  
  [https://nodejs.org/](https://nodejs.org/)
- **Akun GitHub**
- **Akun Supabase**  
  [https://supabase.com/](https://supabase.com/)
- **Akun Google Cloud**  
  [https://console.cloud.google.com/](https://console.cloud.google.com/)

---

### Langkah 1: Kloning Repositori

```bash
git clone https://github.com/shoukelp/todo-app.git
cd todo-app
```

---

### Langkah 2: Instalasi Dependensi

```bash
npm install
# atau
yarn install
```

---

### Langkah 3: Setup Supabase & Struktur Database

1. Masuk ke dashboard Supabase dan buat proyek baru.
2. Buka **SQL Editor** dan jalankan SQL berikut:

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES auth.users(id),
  text TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to insert their own todos." ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to select their own todos." ON todos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own todos." ON todos FOR UPDATE WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own todos." ON todos FOR DELETE USING (auth.uid() = user_id);
```

---

### Langkah 4: Setup Google OAuth

#### a. Google Cloud Console

1. Buat proyek atau gunakan proyek yang sudah ada.
2. Masuk ke **APIs & Services > Credentials**.
3. Klik **+ Create credentials > OAuth client ID**.
4. Pilih **Web Application**.
5. Tambahkan:

   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://<username_github>.github.io/todo-app/
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/auth/v1/callback
     https://<username_github>.github.io/todo-app/auth/v1/callback
     ```

6. Salin **Client ID** dan **Client Secret**.

#### b. Konfigurasi di Supabase

1. Buka **Authentication > Providers**.
2. Pilih **Google** dan aktifkan.
3. Masukkan Client ID dan Secret dari Google Cloud Console.
4. Pastikan Redirect URI sesuai.

---

### Langkah 5: Konfigurasi `.env.local`

Buat file `.env.local` di root direktori:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

### Langkah 6: Menjalankan Aplikasi Secara Lokal

```bash
npm run dev
# atau
yarn dev
```

Akses di `http://localhost:3000`.

---

### Langkah 7: Deploy ke GitHub Pages

#### a. Instal gh-pages

```bash
npm install gh-pages --save-dev
# atau
yarn add gh-pages --dev
```

#### b. Tambahkan script deploy ke `package.json`

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "gh-pages -d dist"
}
```

Atau jika menggunakan repositori terpisah:

```json
"deploy": "gh-pages -d dist -r https://github.com/shoukelp/todo-app.git"
```

#### c. Konfigurasi `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/todo-app/', // Atur sesuai path GitHub Pages Anda
})
```

#### d. Build dan Deploy

```bash
npm run build
npm run deploy
# atau
yarn build
yarn deploy
```

#### e. Update Redirect URI dan Origins di Google Cloud Console

Ganti URI lokal dengan:

```
https://<username_github>.github.io/<nama_repositori>/auth/v1/callback
```

dan

```
https://<username_github>.github.io/<nama_repositori>/
```

---

## Kontribusi

Silakan fork repositori dan buat pull request jika Anda ingin berkontribusi.

---

## Lisensi

[MIT License](LICENSE)

---

**Catatan:** Gantilah placeholder seperti `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, `<username_github>`, dan `<nama_repositori>` sesuai konfigurasi proyek Anda sendiri.
