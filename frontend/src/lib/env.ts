import { z } from "zod"

const envSchema = z.object({
  // z.url() memastikan nilainya URL valid; default dipakai kalau env tidak diisi.
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.url(),
})

// Setiap variabel HARUS ditulis eksplisit (bukan process.env langsung di-spread).
// Next.js hanya mengganti `process.env.NEXT_PUBLIC_X` yang tertulis literal saat build,
// jadi akses dinamis akan bernilai undefined di browser.
export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})
