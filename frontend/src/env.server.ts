import "server-only"
import { z } from "zod"

export const serverEnvSchema = z.object({
  // URL json-server. Tanpa prefix NEXT_PUBLIC_ sehingga tidak dikirim ke browser.
  BACKEND_URL: z.url(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

// Tulis eksplisit per variabel, sama seperti env.ts.
export const serverEnv = serverEnvSchema.parse({
  BACKEND_URL: process.env.BACKEND_URL,
})
