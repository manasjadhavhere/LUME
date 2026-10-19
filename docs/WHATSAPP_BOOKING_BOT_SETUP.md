# 🌸 LUME — WhatsApp Booking Bot & Notifications Setup Guide

This guide walks you through connecting your dedicated **LUME WhatsApp phone number** to act as an automated booking bot.

---

## 🌟 How the Flow Works

```
                               ┌────────────────────────────────────────────────┐
                               │   Client Books an Appointment on LUME App      │
                               └───────────────────────┬────────────────────────┘
                                                       │
                                        Backend triggers WhatsApp Service
                                                       │
                     ┌─────────────────────────────────┴─────────────────────────────────┐
                     ▼                                                                   ▼
       ┌───────────────────────────┐                                       ┌───────────────────────────┐
       │   Client WhatsApp Alert   │                                       │   Artist WhatsApp Alert   │
       │   (Booking Confirmation)  │                                       │ (Interactive Notification)│
       └───────────────────────────┘                                       └─────────────┬─────────────┘
                                                                                         │
                                                                           Artist taps [Accept] or [Deny]
                                                                                         │
                                                                                         ▼
                                                                           ┌───────────────────────────┐
                                                                           │  Meta Webhook / Action    │
                                                                           │  /api/webhooks/whatsapp   │
                                                                           └─────────────┬─────────────┘
                                                                                         │
                                                                     1. Booking marked ACCEPTED/CANCELLED
                                                                     2. In-app notification created
                                                                     3. WhatsApp update sent to Client
                                                                                         │
                                                                                         ▼
                                                                           ┌───────────────────────────┐
                                                                           │ Client Gets "Accepted" WA │
                                                                           └───────────────────────────┘
```

1. **Client receives**: An instant WhatsApp confirmation with full appointment details (Artist, Service, Date, Time, Address, Price, Status).
2. **Artist receives**: An interactive alert on WhatsApp with client details AND two quick-action buttons:
   - `[ ✅ Accept ]`
   - `[ ❌ Deny ]`
   *(Plus a signed one-click fallback link for instant web approval).*
3. **When the Artist taps Accept or Deny**:
   - Meta posts the response to `POST /api/webhooks/whatsapp`.
   - The booking status updates in LUME's PostgreSQL database to `ACCEPTED` or `CANCELLED`.
   - The Client automatically receives a follow-up WhatsApp message: *"Good news! Your booking with [Artist Name] has been ACCEPTED!"*.

---

## 🛠️ Step-by-Step Setup Instructions

### Step 1: Create a Meta Developer Account
1. Go to [developers.facebook.com](https://developers.facebook.com) and log in with your Facebook account.
2. Click **My Apps** (top right) -> **Create App**.
3. Choose **Other** as the use case -> click **Next**.
4. Select **Business** as the app type -> click **Next**.
5. Enter your App Name: `Lume WhatsApp Bot`, select your Meta Business Account (or let Meta create one), and click **Create App**.

---

### Step 2: Add WhatsApp to Your Meta App
1. In the App Dashboard, scroll down to **WhatsApp** and click **Set up**.
2. Meta will automatically take you to the **WhatsApp > API Setup** screen.
3. *Note*: Meta immediately provides a **Test Phone Number** and temporary access token so you can test sending messages to your own number right away without any verification!

---

### Step 3: Connect Your Real LUME Phone Number
To send messages from your dedicated LUME phone number:
1. In the **API Setup** page, scroll down to **Step 5: Add a phone number** and click **Add phone number**.
2. Enter your business profile details:
   - **Profile Name**: `LUME Beauty`
   - **Category**: `Beauty, Cosmetics & Personal Care`
   - **Description**: `India's Premier Beauty & Artist Booking Platform`
3. Enter your dedicated LUME phone number.
4. Choose **Text Message (SMS)** or **Phone Call** for verification.
5. Enter the 6-digit OTP code sent to your phone.
6. Once verified, Meta will display your **Phone Number ID**.

> ⚠️ **Important Note about Phone Numbers**:
> WhatsApp requires that any phone number registered with the Cloud API is **not concurrently registered on the personal WhatsApp mobile app**.
> If your Lume number is currently logged into the regular WhatsApp app, you must either:
> - Delete the account inside WhatsApp App Settings (*Settings > Account > Delete my account*), OR
> - Use a dedicated business SIM / eSIM for the Lume WhatsApp bot.

---

### Step 4: Generate a Permanent Access Token (System User Token)
The temporary access token in the developer console expires every 24 hours. For your live server, you need a permanent token:
1. Go to **Meta Business Suite / Business Manager** -> [business.facebook.com/settings](https://business.facebook.com/settings).
2. Go to **Users > System Users** in the left sidebar.
3. Click **Add** -> Name: `lume-whatsapp-bot` -> Role: `Admin`.
4. Click **Generate New Token**:
   - Select your App (`Lume WhatsApp Bot`).
   - Check the following permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - Click **Generate Token**.
5. Copy this token immediately (save it in your password manager; Meta won't show it again).

---

### Step 5: Update Your Environment Variables (`.env`)
In your `lume-api/.env` file, add:

```env
# Meta WhatsApp Cloud API Configuration
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id_here"
WHATSAPP_ACCESS_TOKEN="your_permanent_access_token_here"
WHATSAPP_BUSINESS_ACCOUNT_ID="your_waba_id_here"
WHATSAPP_VERIFY_TOKEN="lume_whatsapp_secret_token_12345"

# Your public API domain (for one-click web fallback action links)
PUBLIC_API_URL="https://api.yourdomain.com"
```

---

### Step 6: Configure the Webhook in Meta
To receive button clicks (`Accept` / `Deny`) from artists:
1. In your Meta Developer App Dashboard, go to **WhatsApp > Configuration** (left sidebar).
2. In the **Webhook** section, click **Edit**:
   - **Callback URL**: `https://api.yourdomain.com/api/webhooks/whatsapp`
     *(For local development testing, use Ngrok: `https://xxxx.ngrok-free.app/api/webhooks/whatsapp`)*
   - **Verify Token**: Enter the exact same string you put in `.env` for `WHATSAPP_VERIFY_TOKEN` (e.g. `lume_whatsapp_secret_token_12345`).
3. Click **Verify and Save**. Meta will make a `GET` handshake request to your server and verify it instantly!
4. Under **Webhook fields**, click **Manage** and check the box for **`messages`** -> click **Done**.

---

### Step 7: Meta Message Templates (For Production Outbound)
WhatsApp requires pre-approved templates for business-initiated notifications. 

In Meta Business Manager -> **WhatsApp Manager > Message Templates** -> click **Create Template**:

#### Template 1: Client Booking Notice
- **Name**: `lume_booking_client_notice`
- **Category**: `Utility`
- **Body**:
```text
✨ LUME BOOKING CONFIRMATION ✨

Hello {{1}},
Your appointment request has been submitted!

• Artist: {{2}}
• Service: {{3}}
• Date: {{4}}
• Time: {{5}}
• Total: ₹{{6}}
• Status: Pending Artist Confirmation

We will notify you here as soon as the artist confirms!
```

#### Template 2: Artist Booking Request (with Buttons)
- **Name**: `lume_booking_artist_request`
- **Category**: `Utility`
- **Body**:
```text
🌸 NEW BOOKING REQUEST — LUME 🌸

Hello {{1}}, you have a new appointment request!

• Client: {{2}}
• Service: {{3}}
• Date: {{4}}
• Time: {{5}}
• Value: ₹{{6}}
• Location: {{7}}

Please tap an option below to confirm or decline:
```
- **Buttons**:
  - Type: **Quick Reply**
  - Button 1: `✅ Accept`
  - Button 2: `❌ Deny`

---

## 🧪 Local Testing & Simulation

The backend is built with **automatic local simulation**:
- If `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` are not yet set in `.env`, the server **will not crash**.
- Instead, whenever a booking is created or status is changed, it logs the simulated WhatsApp message and recipient to your terminal in bright yellow:
  ```
  [WhatsApp Service (Simulated)] Recipient: 919876543210
  {
    "type": "interactive",
    "buttons": ["✅ Accept", "❌ Deny"]
  }
  ```
- As soon as you add the real credentials to `.env`, it will immediately begin sending live WhatsApp messages to actual phones!

---

## 🔒 Security Measures Implemented
1. **Sender Phone Verification**: When an incoming button click or text command is received, the backend verifies that the sender's phone number matches the artist assigned to that booking. Unauthorized phone numbers cannot accept or cancel other artists' bookings.
2. **Cryptographic HMAC Action Tokens**: The one-click action links (`/api/bookings/whatsapp-action`) are signed using SHA-256 HMAC with your server's `JWT_SECRET`. Tampered links or invalid tokens are rejected automatically.
3. **Idempotency Protection**: If an artist taps "Accept" twice or both clicks the button and clicks the link, the backend recognizes that the booking is already `ACCEPTED` and prevents double actions.
4. **Asynchronous Non-Blocking Execution**: WhatsApp notification delivery runs in the background. If Meta's servers are ever slow, your clients' web checkout experience will never lag or fail.
