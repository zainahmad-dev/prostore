import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    // Run the existing TypeScript seed script using tsx
    seed: 'tsx ./db/seed.ts',
  },
});
