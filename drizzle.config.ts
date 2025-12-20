import { defineConfig } from 'drizzle-kit';

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL not set for Drizzle. Run with DATABASE_URL=[pathtosqlite]')

export default defineConfig({
  out: './drizzle/migrations',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  // dbCredentials: { url: process.env.DATABASE_URL as string }
});
