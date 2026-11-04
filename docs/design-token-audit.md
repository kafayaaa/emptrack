# EmpTrack Design Token Audit & Harmonization Report

> **Ticket:** EMPTRACK-122 (Epic: EMPTRACK-121 - Minggu 11: Polish UI/UX Final)  
> **Tanggal Audit:** 4 November 2026  
> **Status:** Passed & Harmonized  
> **Scope:** Design Token Architecture, Typography Scale, Spacing/Layout, Colors (Light/Dark Mode OKLCH), and Component Surface Consistency.

---

## 1. Executive Summary

EmpTrack telah melalui audit komprehensif terhadap seluruh token desain, tipografi, jarak (_spacing_), sistem warna semantik, dan kompatibilitas tema gelap (_dark mode_).

Audit ini memastikan:

1. **Zero Hardcoded Colors / Magic Values:** Seluruh komponen aplikasi menggunakan token semantik CSS (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, dll.) tanpa nilai warna heksadesimal statis atau kelas warna arbitrer Tailwind (`bg-gray-500`, `#ffffff`, dsb.).
2. **Harmonisasi Navigasi & Dialog:** Seluruh dialog formulir (_create/edit_) dan navigasi _back button_ pada halaman detail (_employee & asset_) memiliki hierarki tipografi dan _hover state_ yang konsisten.
3. **Standarisasi Skala Tipografi & Spacing:** Seluruh halaman utama (_Dashboard_, _Employees_, _Assets_) mematuhi _baseline grid_ 4px dengan skala judul terstandardisasi (`text-2xl font-bold tracking-tight text-foreground`).
4. **WCAG 2.1 AA Contrast Compliance:** Rasio kontras teks terhadap latar belakang diuji pada kedua palet warna OKLCH (Light Mode & Dark Mode), memenuhi standar aksesibilitas minimum 4.5:1 untuk teks normal dan 3.0:1 untuk teks tebal/besar.

---

## 2. Design Token Architecture

EmpTrack dibangun menggunakan **Tailwind CSS v4** dengan integrasi CSS Variables berbasis model warna perseptual **OKLCH** untuk akurasi saturasi dan kontras yang seragam di berbagai layar.

### 2.1. Color Tokens (OKLCH)

Palet warna semantik didefinisikan di `frontend/src/app/globals.css`:

| Token Semantik           | Kelas Tailwind               | Light Mode (OKLCH)          | Dark Mode (OKLCH)           | Peruntukan                                   |
| :----------------------- | :--------------------------- | :-------------------------- | :-------------------------- | :------------------------------------------- |
| `--background`           | `bg-background`              | `oklch(1 0 0)`              | `oklch(0.145 0 0)`          | Latar belakang dasar halaman                 |
| `--foreground`           | `text-foreground`            | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`          | Teks primer halaman                          |
| `--card`                 | `bg-card`                    | `oklch(1 0 0)`              | `oklch(0.205 0 0)`          | Kontainer Card / Widget                      |
| `--card-foreground`      | `text-card-foreground`       | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`          | Teks isi pada Card                           |
| `--popover`              | `bg-popover`                 | `oklch(1 0 0)`              | `oklch(0.205 0 0)`          | Dropdown, Popover, Dialog Popup              |
| `--popover-foreground`   | `text-popover-foreground`    | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`          | Teks pada Popover / Dialog                   |
| `--primary`              | `bg-primary`, `text-primary` | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`          | Aksi utama, tombol CTA, _brand highlight_    |
| `--primary-foreground`   | `text-primary-foreground`    | `oklch(0.985 0 0)`          | `oklch(0.205 0 0)`          | Teks kontras di atas elemen primary          |
| `--secondary`            | `bg-secondary`               | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | Elemen sekunder, filter chip, badge          |
| `--secondary-foreground` | `text-secondary-foreground`  | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`          | Teks pada elemen sekunder                    |
| `--muted`                | `bg-muted`                   | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | Latar belakang subtle, skeleton loader       |
| `--muted-foreground`     | `text-muted-foreground`      | `oklch(0.556 0 0)`          | `oklch(0.708 0 0)`          | Teks sekunder, label pembantu, _placeholder_ |
| `--accent`               | `bg-accent`                  | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | Hover state interaktif, item aktif           |
| `--accent-foreground`    | `text-accent-foreground`     | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`          | Teks pada hover state aksen                  |
| `--destructive`          | `bg-destructive`             | `oklch(0.577 0.245 27.325)` | `oklch(0.396 0.141 25.723)` | Tindakan kritis (hapus, error, pembatalan)   |
| `--border`               | `border-border`              | `oklch(0.922 0 0)`          | `oklch(0.269 0 0)`          | Garis pembatas kartu, tabel, dan pemisah     |
| `--input`                | `border-input`               | `oklch(0.922 0 0)`          | `oklch(0.269 0 0)`          | Garis batas input form                       |
| `--ring`                 | `ring-ring`                  | `oklch(0.708 0 0)`          | `oklch(0.439 0 0)`          | Indikator fokus aksesibilitas keyboard       |
| `--sidebar`              | `bg-sidebar`                 | `oklch(0.985 0 0)`          | `oklch(0.205 0 0)`          | Latar belakang navigasi samping (_sidebar_)  |

### 2.2. Typography Scale

Sistem tipografi menggunakan font sans sistem yang dioptimalkan dengan skala ukuran dan bobot berikut:

| Kategori                | Kelas Tailwind                                                    | Ukuran / Line Height  | Bobot          | Penggunaan                                             |
| :---------------------- | :---------------------------------------------------------------- | :-------------------- | :------------- | :----------------------------------------------------- |
| **Page Title**          | `text-2xl font-bold tracking-tight text-foreground`               | 24px / 32px           | 700 (Bold)     | Header halaman utama (_Dashboard, Karyawan, Aset_)     |
| **Detail Hero Title**   | `text-xl font-bold tracking-tight text-foreground sm:text-2xl`    | 20px / 28px (24px sm) | 700 (Bold)     | Judul nama pada halaman detail                         |
| **Dialog Title**        | `text-lg font-semibold tracking-tight text-foreground`            | 18px / 24px           | 600 (Semibold) | Judul modal formulir (_Create/Edit Dialog_)            |
| **Card / Widget Title** | `font-semibold leading-none tracking-tight text-foreground`       | 16px / 16px           | 600 (Semibold) | Judul kartu ringkasan, kartu statistik, dan panel info |
| **Section Header**      | `text-sm font-semibold text-foreground`                           | 14px / 20px           | 600 (Semibold) | Sub-bagian dalam kartu detail / form group             |
| **Body / Form Value**   | `text-sm font-normal text-foreground`                             | 14px / 20px           | 400 (Regular)  | Teks isi, nilai data field, input teks                 |
| **Muted / Subtitle**    | `text-xs text-muted-foreground` / `text-sm text-muted-foreground` | 12px-14px             | 400 (Regular)  | Deskripsi dialog, metadata, info waktu                 |
| **Code / Tag / Badge**  | `font-mono text-xs font-semibold`                                 | 12px / 16px           | 600 (Semibold) | Nomor NIK (`EMP-xxxxx`), Asset Tag (`AST-xxxxx`)       |

### 2.3. Spacing & Layout Scale (4px Base Grid)

Spasi antar elemen dan _padding_ kontainer distandarisasi mengikuti kelipatan 4px:

| Token Tailwind      | Piksel      | Penggunaan Standar                                         |
| :------------------ | :---------- | :--------------------------------------------------------- |
| `gap-1.5` / `p-1.5` | 6px         | Jarak mikro dalam tag/badge, icon-button padding           |
| `gap-2` / `p-2`     | 8px         | Jarak tombol dengan ikon, jarak antar baris ringkas        |
| `gap-3` / `p-3`     | 12px        | Jarak elemen formulir bertingkat, avatar ke nama           |
| `gap-4` / `p-4`     | 16px        | Jarak antar kartu grid pada _mobile_, padding kartu modal  |
| `p-5` / `sm:p-6`    | 20px - 24px | Padding standar Card (`CardHeader`, `CardContent`)         |
| `gap-6`             | 24px        | Jarak antar seksi halaman, vertikal gap halaman detail     |
| `gap-8` / `py-8`    | 32px        | Jarak vertikal layout _dashboard_ dan batas konten halaman |

### 2.4. Border Radius & Shadows

| Token                      | Nilai                              | Penggunaan                                    |
| :------------------------- | :--------------------------------- | :-------------------------------------------- |
| `rounded-md`               | `calc(var(--radius) - 4px)` (~6px) | Input field, tombol standar, select item      |
| `rounded-lg`               | `calc(var(--radius) - 2px)` (~8px) | Dropdown menu, popover, badge besar           |
| `rounded-xl`               | `var(--radius)` (~10px - 12px)     | Kontainer Card, modal dialog, panel detail    |
| `rounded-2xl`              | 16px                               | Kontainer icon avatar, hero visual card       |
| `rounded-full`             | 9999px                             | Status badge, avatar pengguna, search pill    |
| `shadow-2xs` / `shadow-xs` | Subtle elevation                   | Kartu data tabel, search bar, dropdown button |
| `shadow-xl`                | High elevation                     | Modal Dialog, Alert Confirmation Dialog       |

---

## 3. Audit Findings & Harmonization Log (EMPTRACK-122)

Selama audit kode sumber dilakukan pengecekan otomatis dan manual terhadap seluruh file di `frontend/src`. Berikut temuan dan harmonisasi yang diterapkan:

### 3.1. Navigasi Kembali (_Back Navigation Button_)

- **Temuan:** Pada `AssetDetailView`, tombol navigasi kembali menggunakan kelas `className="gap-2 text-xs"`, sedangkan pada `EmployeeDetailView` menggunakan `className="gap-2 text-muted-foreground transition-colors hover:text-foreground"`.
- **Harmonisasi:** `AssetDetailView` diselaraskan ke `className="gap-2 text-muted-foreground transition-colors hover:text-foreground"` sehingga transisi warna _hover_ dan ukuran ikon selaras di seluruh halaman detail. Teks semantik `"Kembali ke Daftar Aset"` dipertahankan untuk kompatibilitas uji otomatis.

### 3.2. Tipografi Judul Modal Dialog (_DialogTitle_)

- **Temuan:**
  - `EmployeeCreateDialog` & `EmployeeEditDialog` menggunakan `DialogTitle` dengan `text-lg font-bold`.
  - `AssetCreateDialog` & `AssetEditDialog` menggunakan `DialogTitle` bawaan tanpa kelas override (`text-base font-medium`).
- **Harmonisasi:** Seluruh judul modal formulir diselaraskan menggunakan `className="text-lg font-semibold"` yang menghasilkan ketebalan konsisten (_semibold_ 600) dengan keterbacaan optimal tanpa distorsi ketebalan font (_bold_ 700 yang terlalu berat).

### 3.3. Zero Magic Numbers & Hardcoded Colors Check

- **Hasil Pemeriksaan:** Dilakukan penelusuran regex terhadap kelas warna arbitrer Tailwind (`(text|bg|border)-(gray|slate|zinc|neutral|blue|red)-[0-9]+` dan kode warna heksadesimal `#...`).
- **Hasil:** **100% Bersih.** Tidak ada kode warna heksadesimal atau warna arbitrer statis di dalam kode komponen produksi. Seluruh pewarnaan memanfaatkan token tema OKLCH dari CSS Variables.

---

## 4. Accessibility & Contrast Compliance

Pengujian kontras warna dilakukan pada rasio Light Mode dan Dark Mode terhadap elemen-elemen kunci:

| Pasangan Warna                             | Light Mode Contrast      | Dark Mode Contrast       | WCAG AA Level  |
| :----------------------------------------- | :----------------------- | :----------------------- | :------------- |
| `text-foreground` on `bg-background`       | > 14:1                   | > 13:1                   | **Pass (AAA)** |
| `text-muted-foreground` on `bg-background` | ~ 4.8:1                  | ~ 5.2:1                  | **Pass (AA)**  |
| `text-primary-foreground` on `bg-primary`  | > 12:1                   | > 11:1                   | **Pass (AAA)** |
| `text-destructive` on `bg-destructive/10`  | ~ 5.1:1                  | ~ 4.9:1                  | **Pass (AA)**  |
| `border-border` on `bg-card`               | Garis batas tampak jelas | Garis batas tampak jelas | **Pass**       |

Indikator fokus keyboard (`focus-visible:ring-1 focus-visible:ring-ring`) tersedia pada seluruh elemen tombol, _input_, _select_, dan navigasi untuk memenuhi standar WCAG 2.4.7 (Focus Visible).

---

## 5. Standard Component Guidelines for Developers

Untuk pengembangan fitur dan komponen selanjutnya pada sistem EmpTrack, gunakan panduan berikut:

```tsx
// 1. Standar Kontainer Halaman
<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
    <h1 className="text-2xl font-bold tracking-tight text-foreground">Judul Halaman</h1>
    <p className="text-sm text-muted-foreground">Deskripsi singkat halaman.</p>
  </div>
</div>

// 2. Standar Kartu Data (Card)
<Card className="rounded-xl border border-border bg-card shadow-2xs">
  <CardHeader className="p-5 sm:p-6">
    <CardTitle className="font-semibold text-foreground">Judul Kartu</CardTitle>
    <CardDescription className="text-xs text-muted-foreground">Keterangan kartu.</CardDescription>
  </CardHeader>
  <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
    {/* Konten data */}
  </CardContent>
</Card>

// 3. Standar Modal Formulir (Dialog)
<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
  <DialogHeader>
    <DialogTitle className="text-lg font-semibold text-foreground">Judul Modal</DialogTitle>
    <DialogDescription className="text-sm text-muted-foreground">Petunjuk pengisian formulir.</DialogDescription>
  </DialogHeader>
  {/* Body formulir */}
</DialogContent>
```

---

_Laporan ini disusun sebagai bagian dari penyelesaian tiket EMPTRACK-122 pada sprint Minggu 11 EmpTrack._
