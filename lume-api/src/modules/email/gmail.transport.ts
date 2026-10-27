import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import type { EmailMessage, EmailTransport } from './email.service';

export interface GmailSettings {
  enabled: boolean;
  user: string;
  appPassword: string;
  fromName: string;
  replyTo: string;
  appUrl: string;
}

export interface GmailTransport extends EmailTransport {
  verify(): Promise<void>;
}

/** Creating a transport is local; only send() or verify() connects to Google. */
export function createGmailTransport(settings: GmailSettings): GmailTransport | undefined {
  if (!settings.enabled) return undefined;
  if (!settings.user || !settings.appPassword) {
    throw new Error('Set SMTP_USER and SMTP_APP_PASSWORD to enable Gmail booking emails');
  }
  if (!z.string().email().safeParse(settings.user).success || !settings.user.toLowerCase().endsWith('@gmail.com')) {
    throw new Error('SMTP_USER must be the Gmail account used for sending');
  }
  if (settings.replyTo && !z.string().email().safeParse(settings.replyTo).success) {
    throw new Error('EMAIL_REPLY_TO must be a single email address');
  }
  const appUrl = new URL(settings.appUrl);
  if (!['https:', 'http:'].includes(appUrl.protocol)) {
    throw new Error('EMAIL_APP_URL must be an HTTP or HTTPS frontend URL');
  }

  const smtp = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: settings.user, pass: settings.appPassword },
    tls: { minVersion: 'TLSv1.2' },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    dnsTimeout: 10000,
    logger: false,
    debug: false,
    disableFileAccess: true,
    disableUrlAccess: true,
  });

  const inFlight = new Map<string, Promise<void>>();
  const sent = new Map<string, number>();
  const retentionMs = 24 * 60 * 60 * 1000;

  async function deliver(message: EmailMessage, key: string): Promise<void> {
    const messageId = `<lume.${createHash('sha256').update(key).digest('hex')}@gmail.com>`;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await smtp.sendMail({
          from: { name: settings.fromName, address: settings.user },
          to: { address: message.to, name: '' },
          replyTo: { address: settings.replyTo || settings.user, name: '' },
          subject: message.subject,
          html: message.html,
          text: message.text,
          messageId,
        });
        sent.set(key, Date.now());
        // Bound the in-process cache even on a long-running server.
        if (sent.size > 5000) sent.delete(sent.keys().next().value!);
        return;
      } catch (error) {
        const smtpError = error as { responseCode?: number; code?: string };
        // Retry explicit temporary SMTP rejections only. A network timeout after
        // DATA can mean Google already accepted the message; retrying may duplicate it.
        const temporaryRejection = typeof smtpError.responseCode === 'number'
          && smtpError.responseCode >= 400 && smtpError.responseCode < 500;
        if (!temporaryRejection || smtpError.code === 'EAUTH' || attempt === 2) throw error;
        await delay(1000 * (attempt + 1));
      }
    }
  }

  return {
    async verify() { await smtp.verify(); },
    async send(message) {
      if (!z.string().email().safeParse(message.to).success) throw new Error('Invalid booking email recipient');
      const now = Date.now();
      for (const [key, sentAt] of sent) {
        if (now - sentAt >= retentionMs) sent.delete(key);
      }
      const key = `${message.idempotencyKey}/${message.to.toLowerCase()}`;
      if (sent.has(key)) return;
      const pending = inFlight.get(key);
      if (pending) return pending;
      const delivery = deliver(message, key);
      inFlight.set(key, delivery);
      try { await delivery; } finally { inFlight.delete(key); }
    },
  };
}

/** SMTP errors can contain recipients or credentials. Log only bounded status fields. */
export function describeEmailError(error: unknown): string {
  const smtpError = error as { code?: unknown; responseCode?: unknown } | null;
  const code = typeof smtpError?.code === 'string' && /^[A-Z_]{2,24}$/.test(smtpError.code)
    ? smtpError.code : 'DELIVERY_FAILED';
  const status = typeof smtpError?.responseCode === 'number' && smtpError.responseCode >= 400 && smtpError.responseCode <= 599
    ? ` (SMTP ${smtpError.responseCode})` : '';
  return `${code}${status}`;
}
