import Razorpay from 'razorpay';
import { config } from '../../config/env';

/**
 * Razorpay Route Service
 * Handles automatic payment splitting using Razorpay Route API.
 *
 * How it works:
 * 1. Each verified artist gets a "Linked Account" on Razorpay Route
 * 2. When a client pays, we trigger a Transfer to the artist's Linked Account
 * 3. Razorpay automatically settles from the Linked Account to the artist's Bank Account
 *
 * The remaining amount (Lume's cut) stays in the Lume Razorpay Account.
 *
 * Docs: https://razorpay.com/docs/route/
 */

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

/**
 * Creates a Razorpay Route Linked Account for an artist.
 * This is called when admin verifies an artist's bank account.
 *
 * @returns The Razorpay Linked Account ID (e.g. "acc_XXXXXXXXXX")
 */
export async function createLinkedAccount(artistDetails: {
  name: string;
  email: string;
  phone: string;
  legalBusinessName?: string;
}): Promise<string> {
  const response = await (razorpay as any).accounts.create({
    email: artistDetails.email,
    profile: {
      category: 'individual',
      subcategory: 'individual',
      addresses: {
        registered: {
          street1: 'Lume Artist',
          street2: '',
          city: 'Mumbai',
          state: 'MH',
          postal_code: '400001',
          country: 'IN',
        },
      },
    },
    legal_business_name: artistDetails.legalBusinessName || artistDetails.name,
    business_type: 'individual',
    legal_info: {
      pan: 'AAAPL1234C', // placeholder; actual PAN collection can be added as a future step
    },
    contact_name: artistDetails.name,
    phone: {
      primary: artistDetails.phone || '9999999999',
    },
    type: 'route',
  });

  return response.id;
}

/**
 * Adds a bank account to an existing Razorpay Linked Account.
 * Must be called AFTER createLinkedAccount().
 */
export async function addBankAccountToLinkedAccount(
  linkedAccountId: string,
  bankDetails: {
    accountNumber: string; // PLAIN text (decrypted before calling this)
    ifscCode: string;
    accountHolderName: string;
    accountType: 'savings' | 'current';
  }
): Promise<string> {
  const response = await (razorpay as any).stakeholders.createBankAccount(linkedAccountId, {
    ifsc_code: bankDetails.ifscCode,
    beneficiary_name: bankDetails.accountHolderName,
    account_type: bankDetails.accountType.toLowerCase(),
    account_number: bankDetails.accountNumber,
  });

  return response.id;
}

/**
 * Transfers a specific amount to a Razorpay Linked Account.
 * Call this AFTER payment verification, once per booking payment.
 *
 * @param paymentId - Razorpay payment_id from the payment
 * @param linkedAccountId - Artist's Razorpay Linked Account ID
 * @param amountInINR - Amount to transfer in INR (will be converted to paise)
 * @returns Transfer ID (e.g. "trf_XXXXXXXXXX")
 */
export async function transferToLinkedAccount(
  paymentId: string,
  linkedAccountId: string,
  amountInINR: number
): Promise<string> {
  const response = await (razorpay as any).payments.transfer(paymentId, {
    transfers: [
      {
        account: linkedAccountId,
        amount: Math.round(amountInINR * 100), // Convert to paise
        currency: 'INR',
        notes: {
          purpose: 'Artist payout via LUME',
        },
        linked_account_notes: ['purpose'],
        on_hold: false, // Settle immediately; set to true to hold and release later
      },
    ],
  });

  // Response is an array of transfer items
  const transfer = response.items?.[0];
  if (!transfer || !transfer.id) {
    throw new Error('Razorpay Route transfer failed: no transfer ID returned');
  }

  return transfer.id;
}

/**
 * Fetch transfer status from Razorpay.
 * Useful for reconciliation or retry logic.
 */
export async function getTransferStatus(transferId: string): Promise<string> {
  const transfer = await (razorpay as any).transfers.fetch(transferId);
  return transfer.status; // 'created' | 'processed' | 'failed'
}

/**
 * Check if Razorpay Route is configured (not using dummy/mock keys).
 */
export function isRouteEnabled(): boolean {
  return (
    config.razorpay.keyId !== 'rzp_test_YOUR_KEY_ID' &&
    config.razorpay.keyId.length > 10
  );
}
