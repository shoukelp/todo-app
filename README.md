# 📝 Aplikasi Todo List Sederhana

## 🌐 Demo Aplikasi

Coba langsung aplikasinya di sini:  
🔗 **[https://shoukelp.github.io/todo-app/](https://shoukelp.github.io/todo-app/)**

---

## ✨ Fitur Utama

- ✅ Tambah, edit, hapus, dan tandai tugas
- 🔐 Login menggunakan:
  - Google OAuth
  - Email & Password
  - Mode Tamu (tanpa login, disimpan via cookie)
- 🔄 Sinkronisasi otomatis ke Supabase setelah login

---

## 🌳 Flowchart

![](docs/flowchart.png)

## 📁 Struktur Direktori

```
todo-app/
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
├── package_lock.json
└── README.md
```

---

## ⚙️ Instalasi & Penggunaan Lokal

### 📌 Prasyarat

- [Node.js & npm](https://nodejs.org/)
- [Akun Supabase](https://supabase.com/)
- [Akun Google Cloud Console](https://console.cloud.google.com/)

---

### 🧪 1. Kloning Repositori

```bash
git clone https://github.com/shoukelp/todo-app.git
cd todo-app
```

---

### 📦 2. Instalasi Dependensi

```bash
npm install
# atau
yarn install
```

---

### 🗄️ 3. Setup Supabase & Struktur Database

1. Buat proyek baru di Supabase.
2. Jalankan SQL berikut di SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (char_length(text) > 0),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos (user_id);
CREATE INDEX IF NOT EXISTS todos_priority_idx ON public.todos (priority);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow individual read access" ON public.todos;
CREATE POLICY "Allow individual read access"
ON public.todos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual insert access" ON public.todos;
CREATE POLICY "Allow individual insert access"
ON public.todos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual update access" ON public.todos;
CREATE POLICY "Allow individual update access"
ON public.todos
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual delete access" ON public.todos;
CREATE POLICY "Allow individual delete access"
ON public.todos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

### 🔑 4. Setup Google OAuth

#### a. Google Cloud Console

1. Buat atau pilih proyek.
2. Buka **APIs & Services > Credentials**.
3. Klik **+ Create credentials > OAuth client ID**.
4. Pilih **Web Application** dan tambahkan:

**Authorized JavaScript origins:**

```
http://localhost:3000
https://<username_github>.github.io/
```

**Authorized redirect URIs:**

```
http://localhost:3000/auth/callback
https://<username_github>.github.io/auth/callback
```

5. Simpan Client ID dan Client Secret.

#### b. Supabase Authentication

1. Buka **Authentication > Providers** di Supabase.
2. Pilih **Google**, aktifkan, dan isi Client ID & Secret dari Google Cloud Console.

---

### 🧾 5. Konfigurasi `.env`

Buat file `.env` di direktori utama:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

### 🚀 6. Menjalankan Aplikasi Lokal

```bash
npm run dev
# atau
yarn dev
```

Akses melalui `http://localhost:3000`

---

## 📦 7. Deploy ke GitHub Pages

### a. Install `gh-pages`

```bash
npm install gh-pages --save-dev
# atau
yarn add gh-pages --dev
```

### b. Tambahkan script di `package.json`

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "gh-pages -d dist"
}
```

### c. Konfigurasi `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/todo-app/', // Penting untuk GitHub Pages
})
```

### d. Build & Deploy

```bash
npm run build && npm run deploy
# atau
yarn build && yarn deploy
```

### e. Update Redirect URI di Google Console

```
https://<username_github>.github.io
https://<username_github>.github.io/auth/v1/callback
```

---

## 🤝 Kontribusi

Pull request dan feedback sangat diterima. Fork dulu dan buat perubahanmu!

---

## 📜 Lisensi

Distribusi di bawah lisensi MIT – lihat file [LICENSE](LICENSE) untuk detail.

---

> 📝 **Catatan:** Gantilah placeholder seperti `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, `<username_github>`, dan `<nama_repositori>` sesuai dengan konfigurasi proyek milikmu.
