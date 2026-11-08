import prisma from './prisma';

const ADDITIVE_SCHEMA_SQL = [
  `ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "savedAddresses" JSONB`,
  `ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "beautyPreferences" JSONB`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "googleMapsUrl" TEXT`,
  `ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "link" TEXT`,
  `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT FALSE`,
];

/**
 * Ensures additive nullable columns exist in PostgreSQL on startup so Railway
 * deployments self-reconcile even when `prisma migrate deploy` is not in Start Command.
 */
export async function ensureSchemaColumns(): Promise<void> {
  if (typeof (prisma as any)?.$executeRawUnsafe !== 'function') return;
  for (const statement of ADDITIVE_SCHEMA_SQL) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (err) {
      console.warn('[Schema] Non-fatal column check warning:', (err as Error)?.message || err);
    }
  }
}

