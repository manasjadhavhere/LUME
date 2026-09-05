import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';

// ── Encryption helpers ───────────────────────────────────────────
const ALGORITHM = 'aes-256-cbc';
const KEY_HEX = process.env.BANK_ENCRYPTION_KEY || '';

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length < 32) {
    throw new Error('BANK_ENCRYPTION_KEY must be set to a 32+ character string in .env');
  }
  // Use first 32 bytes of the key string
  return Buffer.from(KEY_HEX.substring(0, 32), 'utf8');
}

function encrypt(plainText: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  // Return iv:encrypted as hex
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(cipherText: string): string {
  const [ivHex, encHex] = cipherText.split(':');
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

function maskAccountNumber(plain: string): string {
  if (plain.length <= 4) return '****';
  return '*'.repeat(plain.length - 4) + plain.slice(-4);
}

// ── Controllers ──────────────────────────────────────────────────

/**
 * GET /api/artists/me/bank-account
 * Returns masked account details for the authenticated artist.
 */
export async function getBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await prisma.artistProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Artist profile not found' }); return; }

    const bankAccount = await prisma.artistBankAccount.findUnique({ where: { artistId: profile.id } });

    if (!bankAccount) {
      res.json({ success: true, data: null });
      return;
    }

    // Decrypt just to get the last 4 digits for masking, never send plain
    let maskedNumber = '****';
    try {
      const plain = decrypt(bankAccount.encryptedAccountNumber);
      maskedNumber = maskAccountNumber(plain);
    } catch {
      maskedNumber = '****';
    }

    res.json({
      success: true,
      data: {
        id: bankAccount.id,
        accountHolderName: bankAccount.accountHolderName,
        maskedAccountNumber: maskedNumber,
        ifscCode: bankAccount.ifscCode,
        bankName: bankAccount.bankName,
        accountType: bankAccount.accountType,
        isVerified: bankAccount.isVerified,
        createdAt: bankAccount.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/artists/me/bank-account
 * Creates or updates the bank account details (encrypted).
 */
export async function saveBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, accountType } = req.body;

    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      res.status(400).json({ success: false, message: 'All bank account fields are required' });
      return;
    }

    // Validate account number (digits only, 9-18 chars)
    const cleanAccount = accountNumber.replace(/\s/g, '');
    if (!/^\d{9,18}$/.test(cleanAccount)) {
      res.status(400).json({ success: false, message: 'Account number must be 9-18 digits' });
      return;
    }

    // Validate IFSC (standard format)
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
      res.status(400).json({ success: false, message: 'Invalid IFSC code format' });
      return;
    }

    const profile = await prisma.artistProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) { res.status(404).json({ success: false, message: 'Artist profile not found' }); return; }

    const encryptedAccountNumber = encrypt(cleanAccount);

    const bankAccount = await prisma.artistBankAccount.upsert({
      where: { artistId: profile.id },
      create: {
        artistId: profile.id,
        accountHolderName: accountHolderName.trim(),
        encryptedAccountNumber,
        ifscCode: ifscCode.toUpperCase(),
        bankName: bankName.trim(),
        accountType: accountType || 'SAVINGS',
        isVerified: false, // reset verification on update
      },
      update: {
        accountHolderName: accountHolderName.trim(),
        encryptedAccountNumber,
        ifscCode: ifscCode.toUpperCase(),
        bankName: bankName.trim(),
        accountType: accountType || 'SAVINGS',
        isVerified: false, // reset on any update
      },
    });

    res.json({
      success: true,
      message: 'Bank account saved securely',
      data: {
        id: bankAccount.id,
        accountHolderName: bankAccount.accountHolderName,
        maskedAccountNumber: maskAccountNumber(cleanAccount),
        ifscCode: bankAccount.ifscCode,
        bankName: bankAccount.bankName,
        accountType: bankAccount.accountType,
        isVerified: bankAccount.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Export decrypt for internal use by admin payout initiation
export { decrypt };

/**
 * Called by admin when marking a bank account as verified.
 * Attempts to register the artist as a Razorpay Route Linked Account
 * so future payments can be automatically split.
 *
 * If Route is not enabled (mock keys) or registration fails,
 * we still mark the account as verified — admin can do manual payouts.
 */
export async function verifyAndRegisterOnRoute(bankAccountId: string): Promise<{ success: boolean; linkedAccountId?: string; error?: string }> {
  const { isRouteEnabled, createLinkedAccount, addBankAccountToLinkedAccount } = await import('../payments/razorpay-route.service');

  const bankAccount = await prisma.artistBankAccount.findUnique({
    where: { id: bankAccountId },
    include: {
      artist: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });

  if (!bankAccount) throw new Error('Bank account not found');

  // Mark verified first regardless of Route status
  await prisma.artistBankAccount.update({
    where: { id: bankAccountId },
    data: { isVerified: true },
  });

  // Try Razorpay Route registration if real keys are present
  if (!isRouteEnabled()) {
    console.log('[Route] Skipping Route registration — mock/dummy keys detected.');
    return { success: false, error: 'Route not enabled (test keys)' };
  }

  try {
    // Decrypt the bank account number for Razorpay
    const plainAccountNumber = decrypt(bankAccount.encryptedAccountNumber);

    // 1. Create Linked Account for this artist
    const linkedAccountId = await createLinkedAccount({
      name: bankAccount.artist.user.name,
      email: bankAccount.artist.user.email,
      phone: bankAccount.artist.user.phone || '9999999999',
      legalBusinessName: bankAccount.accountHolderName,
    });

    // 2. Add their bank account to the Linked Account
    await addBankAccountToLinkedAccount(linkedAccountId, {
      accountNumber: plainAccountNumber,
      ifscCode: bankAccount.ifscCode,
      accountHolderName: bankAccount.accountHolderName,
      accountType: bankAccount.accountType.toLowerCase() as 'savings' | 'current',
    });

    // 3. Save linked account ID to DB
    await prisma.artistBankAccount.update({
      where: { id: bankAccountId },
      data: {
        razorpayLinkedAccountId: linkedAccountId,
        isLinkedToRazorpay: true,
      },
    });

    console.log(`[Route] Successfully registered artist on Razorpay Route: ${linkedAccountId}`);
    return { success: true, linkedAccountId };
  } catch (err: any) {
    console.error('[Route] Failed to register on Razorpay Route:', err?.message || err);
    return { success: false, error: err?.message || 'Route registration failed' };
  }
}
