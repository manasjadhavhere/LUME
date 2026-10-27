import { config } from '../config/env';
import { createGmailTransport, describeEmailError } from '../modules/email/gmail.transport';

async function main() {
  try {
    const transport = createGmailTransport(config.email);
    if (!transport) {
      console.error('[Email] Set EMAIL_ENABLED=true, SMTP_USER and SMTP_APP_PASSWORD before checking Gmail SMTP');
      process.exitCode = 1;
      return;
    }
    await transport.verify();
    console.log('[Email] Gmail SMTP connection and authentication succeeded. No email was sent.');
  } catch (error) {
    console.error(`[Email] Gmail SMTP check failed: ${describeEmailError(error)}`);
    console.error('[Email] Check the Gmail address, Google App Password, frontend URL and outbound SMTP access.');
    process.exitCode = 1;
  }
}

void main();
