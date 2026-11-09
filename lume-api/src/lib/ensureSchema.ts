import prisma from './prisma';

const ADDITIVE_SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS "notifications" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE, "title" TEXT NOT NULL, "message" TEXT NOT NULL, "type" TEXT NOT NULL DEFAULT 'INFO', "isRead" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications" ("userId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "bookings_artistId_date_idx" ON "bookings" ("artistId", "date")`,
  `ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "savedAddresses" JSONB`,
  `ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "beautyPreferences" JSONB`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "googleMapsUrl" TEXT`,
  `ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "link" TEXT`,
  `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT FALSE`,
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

