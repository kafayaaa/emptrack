import "server-only"
import { z } from "zod"

const serverEnvSchema = z.object({
  // URL json-server. Tanpa prefix NEXT_PUBLIC_ sehingga tidak dikirim ke browser.
  BACKEND_URL: z.url(),
})

// Tulis eksplisit per variabel, sama seperti env.ts.
export const serverEnv = serverEnvSchema.parse({
  BACKEND_URL: process.env.BACKEND_URL,
})
