import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'mysql',
    out: './drizzle',
    schema: './server/database/schema.ts',
    dbCredentials: { url: process.env.DATABASE_URL! },
})