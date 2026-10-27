# Booking email notifications

## Current state

Gmail SMTP is implemented for the approved sender **hellolumeadmin@gmail.com**.
The API sends as **LUME Bookings** using `smtp.gmail.com:465` with TLS and a Google App Password.
No Resend account, paid mailbox, or email-specific DNS changes are needed for this Gmail sender.
The frontend remains on Vercel at `https://hellolume.in`; the backend runs on paid Render.

Delivery is enabled only when `EMAIL_ENABLED=true` and valid credentials are configured.
No real emails were sent during implementation; connection/authentication still needs to
be checked on Render after the account owner adds the App Password.

## Enable Gmail and configure Render

1. Sign in to Google as `hellolumeadmin@gmail.com`.
2. Enable **2-Step Verification** at https://myaccount.google.com/security.
3. Open https://myaccount.google.com/apppasswords and create an App Password named **LUME Booking API**.
   If App Passwords is unavailable, check Google's account restrictions in the documentation below.
4. In Render, open the **backend service → Environment** and set:

   ```dotenv
   EMAIL_ENABLED=true
   SMTP_USER=hellolumeadmin@gmail.com
   SMTP_APP_PASSWORD=PASTE_YOUR_GOOGLE_APP_PASSWORD_HERE
   EMAIL_FROM_NAME=LUME Bookings
   EMAIL_REPLY_TO=hellolumeadmin@gmail.com
   EMAIL_APP_URL=https://hellolume.in
   ```

   Use the App Password, not your normal Google login password. Google displays it in
   groups; the application removes spaces automatically. Enter it directly in Render,
   not in chat, source control, or the Vercel frontend environment.
5. Deploy the backend with these code changes and environment settings.
   The startup log should include **[Email] Gmail SMTP configured for booking notifications**.
   This confirms local configuration only, not successful Google authentication.
6. In the paid Render service's Shell, run **`npm run email:verify`**.
   This checks the connection, TLS and login without sending an email.
7. Create one controlled booking with test client and artist accounts whose inboxes you
   control. Check the request emails, accept/decline updates and payment confirmation.
   Check spam folders too. Automated tests use local mocks and do not replace this live check.

`EMAIL_ENABLED` defaults to false. If required configuration is invalid, startup logs
that booking email is disabled and the API still runs. Changing environment variables
requires a backend redeploy. To disable emails, set `EMAIL_ENABLED=false` and redeploy.

For local development, add the same variables to the ignored `lume-api/.env`, then run
`npm run build` followed by `npm run email:verify`. The verification script also requires
the API's existing environment variables, because it uses the shared configuration.

Google account setup: https://support.google.com/accounts/answer/185833?hl=EN

Render environment setup: https://render.com/docs/configure-environment-variables

## Events and recipients

| Event | Artist email | Client email |
| --- | --- | --- |
| Request created | New request and dashboard link to accept/decline | Receipt; awaiting artist approval |
| Artist accepts | Accepted; awaiting payment | Accepted; link to pay through LUME |
| Artist declines a pending request | Decline record | Declined, with reason if supplied |
| Either party cancels an appointment | Cancellation details | Cancellation details |
| Advance payment verified | Appointment secured; balance due | Advance received; balance due |
| Full/remaining payment verified, or status confirmed | Confirmed appointment details | Confirmed appointment details |

Artist decisions made through either the dashboard or existing WhatsApp actions send
the same emails. WhatsApp message content, action verification, and delivery are unchanged.
The WhatsApp controller only has additive email hooks after successful database updates.

Emails have HTML and plain-text bodies, escaped user content, INR amounts, and IST dates/times.
Acceptance is distinguished from payment confirmation. The booking's `totalPaid` field is
actually its base service price, so the email labels it as before GST. Paid amounts and
remaining balances are shown separately when verified payment information is available.

Client links lead to `/profile`; artist links lead to `/artist-dashboard/bookings`.
`EMAIL_APP_URL` can select the public frontend origin. Otherwise the first `CLIENT_URL`
origin is used, even if CORS is configured with multiple origins.

## Delivery behavior

`src/modules/email/email.service.ts` defines `EmailTransport.send(message)` and
`registerEmailTransport(adapter)`. API startup calls `configureBookingEmail()` to register
the Gmail adapter when enabled. The event service returns immediately while email is
disabled, without querying contacts. Tests can register a local recording adapter.

Gmail connections have bounded timeouts and retain TLS certificate validation. SMTP
protocol/content logging and attachment file/URL access are disabled. An explicit SMTP
4xx temporary rejection can be retried twice with short delays. Authentication errors,
permanent rejections and ambiguous network timeouts are not retried automatically.
A timeout after submitting a message can mean Google accepted it already.

Each booking/event/recipient gets a stable Message-ID. A bounded in-memory cache suppresses
concurrent and repeated successful sends for 24 hours. Gmail SMTP does not provide the
same idempotency guarantees as an HTTP email provider; Message-ID alone cannot guarantee
deduplication. The cache resets when the API restarts and is not shared across instances.

Email preparation runs independently of the HTTP response and WhatsApp delivery. A failure
for one recipient does not suppress the other. Repeated requests returning an existing
booking and sequential updates to the same status do not enqueue another email. Errors
are logged without addresses or message contents. Payment emails are prepared after the
payment record is saved.

The current dispatcher runs in the API process; it is not a persistent queue. A server
restart can interrupt an unfinished attempt. A durable outbox/worker would be needed for
guaranteed retries across restarts. Provider acceptance also does not prove inbox delivery.

## Verification

From `lume-api`, run `npm test`. Tests use fake users and bookings; no database connection,
provider credentials, WhatsApp messages, or real email delivery is needed.

The SMTP adapter tests cover TLS, sender/reply-to, startup configuration requirements,
verification without mail, recipient validation, deduplication, retries and safe error logs.

## Troubleshooting and free Gmail limits

- `EAUTH` / SMTP 535: confirm the sender account, 2-Step Verification and its App Password.
  A Google password change revokes existing App Passwords. Regenerate it and update Render.
- Connection timeout: confirm the service is on the paid Render plan and can reach
  `smtp.gmail.com:465`. Authentication can also be restricted by Google account controls.
- The startup log says emails are disabled: check `EMAIL_ENABLED=true` and the required
  environment variables, then redeploy the backend.
- Gmail applies account sending limits; Google documents a personal-account limit of
  500 emails per day. Several emails are sent for each booking, so this is not 500 bookings.
  The verification command authenticates but does not prove inbox delivery.

Google sending limits: https://support.google.com/mail/answer/22839?hl=en
