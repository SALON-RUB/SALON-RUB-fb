import { betterAuth } from 'better-auth'
import { Pool } from 'pg'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: (() => {
    if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
    return process.env.V0_RUNTIME_URL || 'http://localhost:3000'
  })(),
  trustedOrigins: [
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    process.env.V0_RUNTIME_URL || 'http://localhost:3000',
  ],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes:
      process.env.NODE_ENV === 'development'
        ? { sameSite: 'none', secure: true }
        : { sameSite: 'lax', secure: true },
  },
})
