# Asesmen Excel - Pelatihan Basic & Intermediate

Platform asesmen online untuk pelatihan Microsoft Excel dari level Basic hingga Intermediate.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Hosting**: Vercel

## Fitur

- Asesmen Excel Level Basic (15 soal, 45 menit)
- Asesmen Excel Level Intermediate (15 soal, 60 menit)
- Upload & auto-grading jawaban
- Dashboard user dengan riwayat asesmen
- Admin panel untuk kelola soal dan review asesmen

## Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd asesmen-excel
npm install
```

### 2. Setup Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Buka SQL Editor di dashboard Supabase
4. Jalankan script dari `supabase/schema.sql`
5. Copy URL dan Anon Key dari project settings

### 3. Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Buat Admin User

1. Jalankan aplikasi dan daftar akun baru
2. Buka Supabase Dashboard → Table Editor → profiles
3. Edit role user yang baru dibuat menjadi `admin`

### 5. Run Development

```bash
npm run dev
```

Buka http://localhost:3000

## Deploy ke Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy

1. Login ke [Vercel](https://vercel.com)
2. Import project dari GitHub
3. Tambahkan environment variables
4. Deploy

### 3. Update Supabase

Di Supabase Dashboard → Authentication → URL Configuration:
- Add your Vercel domain to Redirect URLs

## Struktur Project

```
asesmen-excel/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── assessment/
│   │   ├── [levelId]/page.tsx
│   │   └── results/[id]/page.tsx
│   ├── api/upload/route.ts
│   └── admin/
│       ├── page.tsx
│       ├── questions/page.tsx
│       └── reviews/page.tsx
├── components/
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts
├── supabase/
│   └── schema.sql
├── public/
│   └── templates/
├── .env.local.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Topik Asesmen

### Level Basic (15 Soal)
- Operasi sel & rumus dasar
- Fungsi SUM, AVERAGE, COUNT, MIN, MAX
- Format sel & conditional formatting
- Sort, filter & freeze panes

### Level Intermediate (15 Soal)
- VLOOKUP & INDEX-MATCH
- Pivot Table
- Charts & Graphs
- Conditional Formatting lanjutan

## License

MIT
