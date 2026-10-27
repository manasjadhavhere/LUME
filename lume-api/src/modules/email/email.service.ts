import { config } from '../../config/env';
import { createGmailTransport } from './gmail.transport';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

export interface EmailTransport {
  send(message: EmailMessage): Promise<void>;
}

// Startup registers Gmail when enabled; tests can use a local recording adapter.
let transport: EmailTransport | undefined;

export function configureBookingEmail(): boolean {
  transport = undefined;
  transport = createGmailTransport(config.email);
  return Boolean(transport);
}

export function registerEmailTransport(adapter: EmailTransport): void {
  transport = adapter;
}

export function isEmailConfigured(): boolean {
  return Boolean(transport);
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!transport) throw new Error('Booking email delivery is not configured');
  await transport.send(message);
}

