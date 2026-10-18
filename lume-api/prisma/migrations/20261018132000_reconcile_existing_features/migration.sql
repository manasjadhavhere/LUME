-- Earlier releases used db push for these existing features. Make fresh migration
-- installs match schema.prisma while preserving databases that already have them.
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'ACCEPTED';
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'EDIT_REQUESTED';
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'EDIT_APPROVED';
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "aadharNumber" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "verificationRemarks" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "isTakingBookings" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "lastBookingStatusChange" TIMESTAMP(3);
ALTER TABLE "artist_bank_accounts" ADD COLUMN IF NOT EXISTS "isLinkedToRazorpay" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "artist_bank_accounts" ADD COLUMN IF NOT EXISTS "razorpayLinkedAccountId" TEXT;
ALTER TABLE "payment_records" ADD COLUMN IF NOT EXISTS "razorpayTransferId" TEXT;
ALTER TABLE "payment_records" ADD COLUMN IF NOT EXISTS "transferStatus" TEXT NOT NULL DEFAULT 'PENDING';
