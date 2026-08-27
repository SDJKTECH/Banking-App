import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from './src/config/env';

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts", // <--- Added seed command here
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});