# Laporan Pengujian Keamanan Manual & Penetrasi Input (EMPTRACK-118)

**Aplikasi**: EmpTrack (Employee & Asset Management Dashboard)  
**Tanggal Pengujian**: 3 November 2026  
**Status**: SELESAI (100% Skenario Terverifikasi)  
**Cakupan**: Formulir Client, Skema Validasi Zod, API Route Handlers (BFF), dan Parameter Query

---

## 1. Ringkasan Eksekutif

Pengujian keamanan manual dan injeksi adversarial (_Penetration Testing_) dilakukan untuk menguji ketahanan aplikasi EmpTrack terhadap masukan berbahaya (_untrusted inputs_), percobaan eksploitasi celah umum web (OWASP Top 10), serta integritas logika validasi data.

Pengujian ini mensimulasikan penyerang yang mencoba mengirimkan payload injeksi secara langsung melalui antarmuka formulir (Create/Edit Karyawan dan Aset) serta secara langsung ke API Route Handler Next.js (`POST /api/employees`, `POST /api/assets`, `GET /api/employees/check-email`).

---

## 2. Metodologi & Standar Acuan

Pengujian dirancang merujuk pada standar industri:

- **OWASP Top 10 Web Application Security Risks**:
  - A03:2021 – Injection (XSS, SQLi, Parameter Tampering)
  - A04:2021 – Insecure Design & Missing Input Validation
  - A05:2021 – Security Misconfiguration
  - A08:2021 – Software and Data Integrity Failures
- **CWE (Common Weakness Enumeration)**:
  - CWE-79: Cross-site Scripting (XSS)
  - CWE-89: SQL Injection
  - CWE-20: Improper Input Validation
  - CWE-1321: Improperly Controlled Modification of Object Prototype Attributes ('Prototype Pollution')
  - CWE-1287: Improper Validation of Specified Type of Input

---

## 3. Matriks Hasil Pengujian Penetrasi

| ID Uji     | Domain / Vektor Serangan                   | Payload Contoh                                              | Ekspektasi                                                   | Hasil Pengujian                            |  Status  |
| :--------- | :----------------------------------------- | :---------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------- | :------: |
| **SEC-01** | Stored/Reflected XSS pada `employeeNumber` | `<script>alert('XSS')</script>`, `"><svg onload=alert(1)>`  | Ditolak oleh regex `/^[A-Za-z0-9-]+$/`                       | 400 Bad Request / Form Error               | ✅ Lolos |
| **SEC-02** | XSS pada `fullName`                        | `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>` | Ditolak oleh regex `/^[A-Za-z\s.,'`-]+$/`                    | 400 Bad Request / Form Error               | ✅ Lolos |
| **SEC-03** | XSS pada `serialNumber` Aset               | `SN-001"><script>alert(1)</script>`                         | Ditolak oleh regex `/^[A-Za-z0-9/_-]+$/`                     | 400 Bad Request / Form Error               | ✅ Lolos |
| **SEC-04** | XSS via Status / Category Spoofing         | `status: "<script>alert(1)</script>"`                       | Ditolak oleh Zod Enum whitelist                              | 400 Bad Request / Invalid Enum             | ✅ Lolos |
| **SEC-05** | SQL Injection pada `projectId`             | `' OR '1'='1`, `'; DROP TABLE employees; --`                | Ditolak oleh regex `/^[1-9]\d*$/`                            | 400 Bad Request / Regex Mismatch           | ✅ Lolos |
| **SEC-06** | SQL Injection pada `email`                 | `admin' OR 1=1 --@perusahaan.com`                           | Ditolak oleh validasi RFC email Zod                          | 400 Bad Request / Invalid Email            | ✅ Lolos |
| **SEC-07** | Query Ingestion Tampering                  | `search: "' OR 1=1 --"`                                     | Nilai di-encode aman via `URLSearchParams`                   | Search teks literal tanpa injeksi          | ✅ Lolos |
| **SEC-08** | Whitelist Parameter Query                  | `filters: { $where: "..." }`                                | Parameter yang tidak terdaftar otomatis dibuang              | Parameter stripping aktif                  | ✅ Lolos |
| **SEC-09** | Buffer Overflow / ReDoS                    | String >10.000 karakter (`"A".repeat(10000)`)               | Ditolak oleh pembatas `.max()`                               | 400 Bad Request / Max Length Exceeded      | ✅ Lolos |
| **SEC-10** | Null Byte Poisoning (`\0`)                 | `managerId: "EMP-001\0hack"`                                | Ditolak oleh validator custom `.refine(!val.includes('\0'))` | 400 Bad Request / Null Byte Detected       | ✅ Lolos |
| **SEC-11** | Mass Assignment / Privilege Escalation     | `{ role: "SUPERADMIN", isAdmin: true }`                     | Payload liar dibuang, tidak pernah masuk ke database         | Atribut ekstra tereliminasi                | ✅ Lolos |
| **SEC-12** | Prototype Pollution                        | `{"__proto__": {"isAdmin": true}}`                          | Tidak mencemari `Object.prototype` global                    | Prototype aman                             | ✅ Lolos |
| **SEC-13** | NoSQL Injection Operator Juggling          | `email: { $ne: null }`                                      | Ditolak karena tipe bukan `string`                           | 400 Bad Request / Invalid Type             | ✅ Lolos |
| **SEC-14** | Type Juggling pada Teks                    | `employeeNumber: true`, `employeeNumber: ["EMP-1"]`         | Ditolak karena tipe mismatch                                 | 400 Bad Request / Expected String          | ✅ Lolos |
| **SEC-15** | Anomali Finansial: Nilai Negatif           | `purchaseCost: -15000000`                                   | Ditolak oleh `.min(0)`                                       | 400 Bad Request / Nilai Negatif Ditolak    | ✅ Lolos |
| **SEC-16** | Anomali Finansial: Overflow Nilai          | `purchaseCost: 999_999_999_999_999`                         | Ditolak oleh `.max(1_000_000_000_000)`                       | 400 Bad Request / Nilai Maksimal Melampaui | ✅ Lolos |
| **SEC-17** | Anomali Finansial: Non-numeric String      | `purchaseCost: "GRATIS"`                                    | Coercion menghasilkan `NaN` dan ditolak                      | 400 Bad Request / Number Required          | ✅ Lolos |
| **SEC-18** | Manipulasi Tanggal: Tahun Lampau           | `hireDate: "1960-01-01"`                                    | Ditolak batas minimal tahun (<1970)                          | 400 Bad Request / Tanggal Lampau           | ✅ Lolos |
| **SEC-19** | Manipulasi Tanggal: Masa Depan Jauh        | `hireDate: "2099-01-01"`                                    | Ditolak batas maksimal (>1 tahun ke depan)                   | 400 Bad Request / Tanggal Melebihi Batas   | ✅ Lolos |
| **SEC-20** | Manipulasi Format Tanggal                  | `hireDate: "31-12-2024"`, `hireDate: "invalid"`             | Ditolak oleh regex `^\d{4}-\d{2}-\d{2}$`                     | 400 Bad Request / Format Tanggal Salah     | ✅ Lolos |
| **SEC-21** | Route Handler: Malformed Body JSON         | Request body: `{unclosed_json: true`                        | Ditangkap oleh blok `try/catch` JSON parser                  | 400 Bad Request (`INVALID_JSON`)           | ✅ Lolos |
| **SEC-22** | Route Handler: Logic Relasi Aset           | `status: "assigned"` tanpa `assignedToId`                   | Ditolak oleh validasi kondisional silang Zod                 | 400 Bad Request (`INVALID_BODY`)           | ✅ Lolos |
| **SEC-23** | Route Handler: Check Email XSS Query       | `?email=%3Cscript%3Ealert(1)%3C/script%3E`                  | Ditolak oleh validasi schema email                           | 400 Bad Request (`INVALID_QUERY`)          | ✅ Lolos |

---

## 4. Temuan Analisis & Resolusi Perbaikan (EMPTRACK-119)

Pengujian manual pada EMPTRACK-118 mengidentifikasi 3 observasi penyempurnaan, yang telah diimplementasikan dan diverifikasi secara tuntas pada **EMPTRACK-119**:

1. **JavaScript Date Rollover Edge-case**:
   - _Masalah_: Input tanggal seperti `"2024-02-31"` (tanggal 31 di bulan Februari) atau `"2024-04-31"` secara sintaksis lolos regex `YYYY-MM-DD`. Mesin runtime JavaScript V8 secara otomatis melakukan _date rollover_ menjadi bulan berikutnya sehingga `new Date("2024-02-31")` tidak menghasilkan `NaN`.
   - _Resolusi (EMPTRACK-119)_: Menambahkan fungsi helper `isValidCalendarDate(dateString: string)` di `src/lib/date.ts` yang memvalidasi integritas kalender riil via UTC parsing (memverifikasi bahwa `getUTCFullYear()`, `getUTCMonth()`, dan `getUTCDate()` persis identik dengan input awal). Diintegrasikan ke `hireDate` (`employeeFormSchema`) dan `purchaseDate` (`assetFormSchema`).

2. **Sanitasi Kurung Sudut pada Field Aset**:
   - _Masalah_: Field `name` dan `model` pada formulir aset sebelumnya memperbolehkan kurung sudut `<` dan `>`.
   - _Resolusi (EMPTRACK-119)_: Menambahkan validasi preventif tingkat Zod `.refine(!/[<>]/.test(val))` untuk menolak tag HTML apapun di hulu (Defense-in-Depth).

3. **Eliminasi Karakter Tersembunyi (Zero-Width Characters)**:
   - _Masalah_: Karakter zero-width (`\u200B`, `\u200C`, `\uFEFF`) dapat diselipkan untuk mengelabui filter teks atau pencarian.
   - _Resolusi (EMPTRACK-119)_: Menambahkan validasi Zod `.refine(!/[\u200B-\u200D\uFEFF]/.test(val))` pada field `managerId`, `name`, `model`, dan `notes`.

---

## 5. Kesimpulan

Implementasi keamanan EmpTrack pada lapisan validasi formulir dan BFF Route Handlers terbukti tangguh terhadap serangan injeksi, parameter tampering, mass assignment, manipulasi kalender/temporal, dan serangan DoS berbasis ukuran payload. Seluruh skenario telah dikodifikasi ke dalam suite uji otomatis `src/test/security-penetration.test.ts` (26 test cases) dan `src/lib/date.test.ts` (6 test cases) yang berjalan pada pipeline CI secara permanen.
