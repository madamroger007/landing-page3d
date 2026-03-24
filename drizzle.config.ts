import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.production' });

export default defineConfig({
    schema: './src/server/db/schema',
    out: './supabase/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.POSTGRES_URL!,
    },
});
