ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "savedAddresses" JSONB;
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "beautyPreferences" JSONB;

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "googleMapsUrl" TEXT;

-- Some existing installations created the inbox with db push.
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "bookings_artistId_date_idx" ON "bookings" ("artistId", "date");
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "link" TEXT;


-- Announce this release once to accounts already on LUME.
INSERT INTO "notifications" ("id", "userId", "title", "message", "type")
SELECT 'release-20261108-' || "id", "id", 'Booking updates',
       'Bookings now include a venue pin, reserved times, shared style preferences and reviews after the appointment.',
       'WEBSITE_UPDATE'
FROM "users" WHERE "isActive"
ON CONFLICT ("id") DO NOTHING;
