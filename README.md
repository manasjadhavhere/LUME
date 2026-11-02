# LUME — Luxury Beauty Artist Booking Platform

> **India's premier beauty artist booking ecosystem.** Connecting discerning clients with top verified makeup artists for bridal, editorial, occasion, and everyday looks.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-134%20Passed-brightgreen)](https://vitest.dev/)

---

## Table of Contents

1. [Platform Overview & Architecture](#platform-overview--architecture)
2. [Project Structure](#project-structure)
3. [Key Features & Capabilities](#key-features--capabilities)
   - [Real Geo-Location & City Radius Search](#1-real-geo-location--city-radius-search)
   - [Google OAuth 2.0 & Streamlined Authentication](#2-google-oauth-20--streamlined-authentication)
   - [Luxury Admin Console & Business Intelligence](#3-luxury-admin-console--business-intelligence)
   - [Automated Gmail SMTP Booking Notifications](#4-automated-gmail-smtp-booking-notifications)
   - [Meta WhatsApp Cloud API Booking Bot](#5-meta-whatsapp-cloud-api-booking-bot)
   - [Split Payments & Razorpay Escrow](#6-split-payments--razorpay-escrow)
4. [Tech Stack](#tech-stack)
5. [Quick Start & Local Development](#quick-start--local-development)
6. [Environment Variables Reference](#environment-variables-reference)
7. [External Services Setup](#external-services-setup)
   - [Google Cloud Platform (OAuth 2.0)](#google-cloud-platform-oauth-20)
   - [Gmail SMTP (Google App Password)](#gmail-smtp-google-app-password)
   - [Meta WhatsApp Cloud API](#meta-whatsapp-cloud-api)
   - [Razorpay Integration](#razorpay-integration)
8. [Database Setup, Migrations & Seeding](#database-setup-migrations--seeding)
9. [Testing & Quality Assurance](#testing--quality-assurance)
10. [Deployment Guide (Render + Vercel)](#deployment-guide-render--vercel)

---

## Platform Overview & Architecture

LUME is designed as a modular, production-ready fullstack monorepo structured into two primary services:

- **`lume-api`**: High-performance Express & TypeScript REST API utilizing Prisma ORM with PostgreSQL (hosted on Supabase). Manages authentication, bookings, geocoding resolution, Razorpay escrow payments, Gmail transactional notifications, and WhatsApp webhook automation.
- **`lume-web`**: Luxury client-facing Progressive Web App (PWA) built with React 19, TypeScript, and Vite. Designed in an artisanal luxury palette (`Cormorant Garamond` serif headings, `DM Sans` body, rose/champagne accents, and glassmorphic micro-interactions).

```
                      ┌─────────────────────────────────────────┐
                      │          LUME Client / Artist           │
                      │         (React 19 + Vite PWA)           │
                      └────────────────────┬────────────────────┘
                                           │ HTTPS / JSON
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │          LUME API (Express + TS)        │
                      └───────┬────────────┬────────────┬───────┘
                              │            │            │
            ┌─────────────────┴──┐  ┌──────┴───────┐  ┌─┴────────────────┐
            ▼                    ▼  ▼              ▼  ▼                  ▼
     ┌──────────────┐     ┌──────────────┐   ┌──────────────┐     ┌──────────────┐
     │  PostgreSQL  │     │ Google OAuth │   │  Gmail SMTP  │     │   Razorpay   │
     │  (Supabase)  │     │  & Places    │   │ Notifications│     │ Escrow & Pay │
     └──────────────┘     └──────────────┘   └──────────────┘     └──────────────┘
                                           ▲
                                           │ Webhooks
                                  ┌────────┴────────┐
                                  │ WhatsApp Cloud  │
                                  │   Booking Bot   │
                                  └─────────────────┘
```

---

## Project Structure

```
LUME/
├── lume-api/                      # Backend REST API Service
│   ├── prisma/                    # Database schema, migrations, and seeds
│   │   ├── schema.prisma          # PostgreSQL schema definition
│   │   ├── seed.ts                # Primary demo data seeder
│   │   ├── seed-admin.ts          # Dedicated administrator provisioner
│   │   └── migrations/            # Version-controlled SQL migrations
│   ├── scripts/                   # Utility scripts (create-admin, test cleanups)
│   ├── src/
│   │   ├── config/                # Environment configuration & Zod validation
│   │   ├── lib/                   # Shared singletons (Prisma client, JWT helpers)
│   │   ├── middleware/            # Auth guards, role checks, error handlers, rate limiters
│   │   ├── modules/
│   │   │   ├── admin/             # Platform oversight, analytics, artist approvals
│   │   │   ├── artists/           # Profile management, portfolios, bank accounts
│   │   │   ├── auth/              # Local JWT auth & Google OAuth token verification
│   │   │   ├── availability/      # Working hours, recurring schedules, date overrides
│   │   │   ├── bookings/          # Appointment workflows, price calculations, state machine
│   │   │   ├── email/             # Gmail SMTP transport, booking templates, queuing
│   │   │   ├── geo/               # Locality-to-city diameter resolution & autocomplete
│   │   │   ├── notifications/     # In-app notification delivery
│   │   │   ├── payments/          # Razorpay orders, split escrow, signature verification
│   │   │   ├── reviews/           # Verified booking review engine
│   │   │   └── whatsapp/          # Cloud API templates, webhooks, interactive buttons
│   │   └── index.ts               # Express application entrypoint
│   └── tests/                     # 71 Node.js native unit & integration test suites
│
├── lume-web/                      # Luxury Frontend Application (PWA)
│   ├── public/                    # Static assets, category imagery, slideshows, PWA icons
│   ├── src/
│   │   ├── assets/                # Design assets and illustrations
│   │   ├── components/
│   │   │   ├── booking/           # Summary cards, confirmation ring
│   │   │   ├── detail/            # Artist hero, services, calendar, timeslots, reviews
│   │   │   ├── home/              # Hero banner, category chips, artist cards, search
│   │   │   ├── layout/            # Navbar, footer, bottom navigation, error boundary
│   │   │   └── ui/                # GeoLocationInput, GoogleAuthButton, modal lightboxes
│   │   ├── context/               # AuthContext, ToastContext
│   │   ├── data/                  # Types, Indian cities offline database (ODbL)
│   │   ├── hooks/                 # Custom React hooks (favorites, scroll, api, toasts)
│   │   ├── pages/
│   │   │   ├── admin/             # Executive portal, analytics, artist verification
│   │   │   ├── artist/            # Artist workspace (bookings, calendar, profile, payouts)
│   │   │   ├── auth/              # Clean login & registration flows
│   │   │   └── ...                # LandingPage, DiscoverPage, ArtistDetailPage, ProfilePage
│   │   ├── styles/                # Design tokens, typography, glassmorphism, animations
│   │   └── utils/                 # Geocoding helpers, review sorters, PWA installers
│   └── test/                      # Vitest test setup, fixtures, property-based tests
│
└── docs/                          # Platform Documentation & Assets
    ├── Lume_PRD.pdf               # Original Product Requirements Document
    ├── Lume_PRD.docx              # PRD Document source
    ├── prototypes/                # HTML prototypes for email templates & app flow
    └── ui-ux-review/              # Comprehensive UI/UX design audit & visual assets
```

---

## Key Features & Capabilities

### 1. Real Geo-Location & City Radius Search
- **Locality-to-City Diameter Expansion (`locationMatching.ts`)**: When users search specific localities (e.g., *Bandra*, *Koramangala*, *Connaught Place*, *Baner*), the engine automatically resolves the parent metropolitan area (*Mumbai*, *Bengaluru*, *Delhi NCR*, *Pune*). Clients never encounter empty results due to strict neighborhood mismatch.
- **Universal Combobox (`GeoLocationInput.tsx`)**: Debounced autocomplete identifying Indian cities, metropolitan regions, and neighborhoods.
- **GPS Location Detection**: One-click browser geolocation with reverse-geocoding fallback.
- **Dual Provider Strategy**: Google Places API in production, with seamless fallback to Photon / OpenStreetMap and an offline database of 4,000+ Indian cities and prime localities (`indianCities.json`, distributed under ODbL 1.0).

### 2. Google OAuth 2.0 & Streamlined Authentication
- **1-Click Authentication (`GoogleAuthButton.tsx`)**: Official Google Identity Services button on `/login` and `/register`.
- **Role-Aware Onboarding**: Automatic profile provisioning for `CLIENT` accounts, while `ARTIST` Google registrations are placed into an onboarding setup state.
- **Safe Account Linking**: Verified Google accounts can link to existing email/password credentials securely.

### 3. Luxury Admin Console & Business Intelligence
- Accessible at `/admin` for administrators.
- **Financial Analytics**: Real-time Gross Merchandise Value (GMV), platform net commission, and GST reporting.
- **Supply & Demand Map**: Highlights high-traffic client booking zones against artist distribution.
- **Artist Excellence Leaderboard**: Top-ranked artists sorted by client ratings and completed revenue.
- **Verification SLA**: 48-hour artist document verification countdown timer with one-click approval/rejection.

### 4. Automated Gmail SMTP Booking Notifications
- **Authorized Sender**: Sent from `Hellolumeadmin@gmail.com` as **LUME Bookings** via secure TLS (`smtp.gmail.com:465`).
- **Google App Password Authentication**: Uses application-specific passwords without sharing main account credentials.
- **6 Transactional Lifecycle Events**:
  1. *Booking Requested*: Notification sent to artist with client details; acknowledgement sent to client.
  2. *Booking Accepted*: Alert sent to client with advance payment request link.
  3. *Booking Declined*: Respectful decline notification with cancellation reason to client.
  4. *Advance Paid*: Payment receipt and appointment confirmation sent to both parties.
  5. *Full Payment / Confirmed*: Final receipt with breakdown of GST and remaining balance.
  6. *Booking Cancelled*: Immediate update sent if either client or artist cancels the appointment.
- **Verification Tooling**: Built-in test script (`npm run email:verify`) checks SMTP credentials without sending test spam.

### 5. Meta WhatsApp Cloud API Booking Bot
- **Interactive Artist Alerts**: When a client books, the artist receives a structured WhatsApp message with client details and quick-action buttons:
  - `[ ✅ Accept ]`
  - `[ ❌ Deny ]`
  *(Includes signed one-click fallback URL for browser execution).*
- **Automated Webhooks (`/api/webhooks/whatsapp`)**: Instantly updates booking states in PostgreSQL and notifies the client on WhatsApp.

### 6. Split Payments & Razorpay Escrow
- **Escrow Protection**: Clients pay a partial advance to reserve the artist. The advance is securely held until the appointment is completed.
- **Remaining Balance Collection**: Clients settle the remainder directly online or on the day of the appointment.
- **Tamper-Proof Verification**: Backend verifies Razorpay signatures, amounts, and currency strictly against server-generated unique orders.

---

## Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | High-performance UI rendering |
| **Bundler & Tooling** | Vite 8 + Rolldown | Sub-second HMR and optimized production bundling |
| **Routing** | React Router v7 | Declarative nested routing |
| **Typography** | Cormorant Garamond & DM Sans | Editorial luxury aesthetic |
| **Backend Framework**| Express 4.21 + TypeScript | RESTful API architecture |
| **ORM & Database** | Prisma 5.22 + PostgreSQL | Strongly typed database queries via Supabase |
| **Authentication** | JWT + Google OAuth 2.0 | Dual local password & Google Identity Services |
| **Transactional Email**| Nodemailer + Gmail SMTP | Direct TLS booking notification delivery |
| **Messaging Bot** | Meta WhatsApp Cloud API | Interactive WhatsApp booking automation |
| **Payment Gateway** | Razorpay SDK | Dual-installment escrow checkout |
| **Testing** | Node.js Test Runner + Vitest | Unit, integration, and property-based tests |

---

## Quick Start & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Local instance or free Supabase cloud database

### 1. Backend Setup (`lume-api`)

```bash
# Navigate to API directory
cd lume-api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your database connection string in .env:
# DATABASE_URL="postgresql://user:password@localhost:5432/lume?schema=public"

# Apply database schema
npx prisma db push

# Seed database with demo artists, clients, and admin
npm run db:seed

# Start API in development mode
npm run dev
# Server runs on: http://localhost:3001
```

### 2. Frontend Setup (`lume-web`)

```bash
# Open a new terminal and navigate to frontend directory
cd lume-web

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Web app runs on: http://localhost:5173
```

### Default Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `Hellolumeadmin@gmail.com` | `password123` |
| **Verified Artist** | `aria@lume.in` | `password123` |
| **Client** | `priya@demo.com` | `password123` |

---

## Environment Variables Reference

### Backend (`lume-api/.env`)

```dotenv
# ── Database (Supabase / PostgreSQL) ────────────────────────
DATABASE_URL="postgresql://postgres:[PASS]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASS]@[HOST]:5432/postgres"

# ── JWT Security ────────────────────────────────────────────
JWT_SECRET="generate_a_long_random_secret_32_chars_min"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="generate_a_second_long_random_secret"
JWT_REFRESH_EXPIRES_IN="30d"

# ── Server Configuration ────────────────────────────────────
PORT=3001
NODE_ENV=development
CLIENT_URL="http://localhost:5173,http://localhost:5174"
MAX_FILE_SIZE=10485760

# ── Admin Account ───────────────────────────────────────────
ADMIN_EMAIL="Hellolumeadmin@gmail.com"
ADMIN_LOCALHOST_ONLY=false

# ── Google OAuth 2.0 ────────────────────────────────────────
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
# Optional Google Places (New) key for premium geocoding:
# GOOGLE_PLACES_API_KEY=""

# ── Gmail SMTP Booking Notifications ────────────────────────
EMAIL_ENABLED=false
SMTP_USER="Hellolumeadmin@gmail.com"
SMTP_APP_PASSWORD=""
EMAIL_FROM_NAME="LUME Bookings"
EMAIL_REPLY_TO="Hellolumeadmin@gmail.com"
EMAIL_APP_URL="https://hellolume.in"

# ── Razorpay Payment Gateway ────────────────────────────────
RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_KEY_SECRET"
BANK_ENCRYPTION_KEY="32_character_encryption_secret_key"

# ── Meta WhatsApp Cloud API ─────────────────────────────────
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_VERIFY_TOKEN="lume_whatsapp_secret_token"
PUBLIC_API_URL="http://localhost:3001"
```

### Frontend (`lume-web/.env` or `.env.development`)

```dotenv
VITE_API_URL="http://localhost:3001"
VITE_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
VITE_RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
```

---

## External Services Setup

### Google Cloud Platform (OAuth 2.0)
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project named `Lume`.
3. Under **APIs & Services → OAuth consent screen**:
   - User Type: **External**
   - App Name: `Lume`
   - User Support & Developer Email: `Hellolumeadmin@gmail.com`
   - Authorized Domain: `hellolume.in`
4. Under **APIs & Services → Credentials**:
   - Create **OAuth Client ID** → **Web application**.
   - Authorized JavaScript Origins:
     - `http://localhost:5173` (Local Dev)
     - `https://hellolume.in` (Production)
     - `https://www.hellolume.in`
   - Copy Client ID into `GOOGLE_CLIENT_ID` (`lume-api`) and `VITE_GOOGLE_CLIENT_ID` (`lume-web`).

### Gmail SMTP (Google App Password)
1. Sign in to Google as `Hellolumeadmin@gmail.com`.
2. Enable **2-Step Verification** at [Google Account Security](https://myaccount.google.com/security).
3. Open [Google App Passwords](https://myaccount.google.com/apppasswords).
4. Create an app password named **LUME Booking API**.
5. Copy the 16-character generated password into `SMTP_APP_PASSWORD` in `lume-api/.env`.
6. Set `EMAIL_ENABLED=true`.
7. Verify configuration by running:
   ```bash
   cd lume-api
   npm run email:verify
   ```

### Meta WhatsApp Cloud API
1. Create a Meta Developer App at [Meta for Developers](https://developers.facebook.com/).
2. Add the **WhatsApp** product.
3. Configure your verified business phone number.
4. Copy `Phone Number ID`, `WhatsApp Business Account ID`, and generate a permanent `Access Token`.
5. In Meta App Dashboard, set the Webhook URL to `https://api.hellolume.in/api/webhooks/whatsapp` with your `WHATSAPP_VERIFY_TOKEN`.
6. Subscribe to the `messages` event.

### Razorpay Integration
1. Generate API Keys in [Razorpay Dashboard](https://dashboard.razorpay.com/#/app/keys).
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `lume-api/.env`.
3. Set `VITE_RAZORPAY_KEY_ID` in `lume-web/.env`.

---

## Database Setup, Migrations & Seeding

All database schema definitions are managed in [`lume-api/prisma/schema.prisma`](file:///lume-api/prisma/schema.prisma).

```bash
# Push schema changes to Supabase / PostgreSQL
npx prisma db push

# Generate updated Prisma client types
npx prisma generate

# Seed sample artists, services, reviews, and admin
npm run db:seed

# Seed or promote an admin account directly
npm run admin:create

# Launch Prisma Studio database GUI
npx prisma studio
```

---

## Testing & Quality Assurance

LUME includes comprehensive test coverage across both API and Web layers:

```bash
# ── Run Backend Tests (71 test suites) ───────────────────────
cd lume-api
npm test

# ── Run Frontend Tests (63 test suites) ──────────────────────
cd lume-web
npm test

# ── Frontend Production Typecheck & Build ────────────────────
cd lume-web
npm run build
```

---

## Deployment Guide (Render + Vercel)

### Backend (`lume-api`) on Render
1. Create a **Web Service** on [Render](https://render.com/).
2. Connect your Git repository and set the root directory to `lume-api`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add all required environment variables from the [Environment Variables Reference](#backend-lume-apienv).
6. In the Render Shell, run `npm run email:verify` to confirm outbound SMTP connectivity.

### Frontend (`lume-web`) on Vercel
1. Create a **New Project** on [Vercel](https://vercel.com/).
2. Select repository and set Root Directory to `lume-web`.
3. Framework Preset: **Vite**.
4. Configure environment variables:
   - `VITE_API_URL="https://api.hellolume.in"`
   - `VITE_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"`
   - `VITE_RAZORPAY_KEY_ID="rzp_live_..."`
5. Deploy. Custom domain: `https://hellolume.in`.

---

## License & Attribution

- **LUME Platform Codebase**: Proprietary © 2026 LUME Beauty. All rights reserved.
- **Location Database**: The Indian cities dataset in `lume-web/src/data/indianCities.json` is derived from the Countries States Cities Database by dr5hn and contributors, made available under the [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/).

