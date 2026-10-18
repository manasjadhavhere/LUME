# LUME — Functionality Overhauls Setup & Deployment Guide

This guide details the exact environment configuration, Google Cloud Platform setup, database migrations, and operational checks for the three major functionality overhauls implemented on Lume.

---

## 1. Environment Variables Configuration

### 1.1 Backend (`lume-api/.env`)

Ensure the following variables are defined in `lume-api/.env` (and in your production hosting environment such as Railway, Render, or ECS):

```bash
# Database (PostgreSQL / Supabase)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Authentication & JWT
JWT_SECRET="your-strong-production-jwt-secret"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="your-strong-production-refresh-secret"

# Overhaul 1: Real Geo-Location (Google Places)
# Optional: If omitted, the engine automatically falls back to Photon / OpenStreetMap + offline 500+ Indian cities database
GOOGLE_PLACES_API_KEY="AIzaSy..."

# Overhaul 2: Direct Google Authentication
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

### 1.2 Frontend (`lume-web/.env.production` & `lume-web/.env.development`)

Add your public Google OAuth Client ID to the frontend environment files:

```bash
# API Base URL
VITE_API_URL="https://api.hellolume.in"

# Overhaul 2: Google Identity Services Web Client ID (Public)
VITE_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
```

> **Note**: If `VITE_GOOGLE_CLIENT_ID` is left empty, the `GoogleAuthButton` gracefully remains hidden while email/password authentication continues to function without errors.

---

## 2. Google Cloud Platform (GCP) Configuration

### 2.1 Google OAuth 2.0 Web Client Setup
1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Create or select your project (e.g., `Lume-Platform`).
3. Click **Create Credentials** → **OAuth client ID**.
4. Select Application Type: **Web application**.
5. Set Name: `Lume Web Client`.
6. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (Local web dev)
   - `http://localhost:5174` (Alternative local port)
   - `https://hellolume.in` (Production domain)
   - `https://www.hellolume.in`
7. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173`
   - `https://hellolume.in`
8. Copy the generated **Client ID** and paste it into `lume-api/.env` (`GOOGLE_CLIENT_ID`) and `lume-web/.env.production` (`VITE_GOOGLE_CLIENT_ID`).

### 2.2 Google Places API (Optional Server-Side Geocoding)
1. Go to **APIs & Services** → **Enable APIs and Services**.
2. Enable:
   - **Places API (New)**
   - **Geocoding API**
3. Under Credentials, create an API Key restricted to Places API and server IP addresses.
4. Set in `lume-api/.env` as `GOOGLE_PLACES_API_KEY`.

---

## 3. Database Migration Deployment

All database migrations for the overhauls have been generated and committed:
- `20261018132000_reconcile_existing_features`: Reconciles base features and database triggers.
- `20261018133000_google_auth_admin_insights`: Adds `googleId`, `authProvider`, `verificationReviewedAt`, and `admin_audit_logs`.

### Applying to Supabase / Production
Run the migration deploy command from `lume-api/`:

```bash
cd lume-api
npx prisma migrate deploy
```

---

## 4. Verification & Testing Checklist

### 4.1 Geo-Location Verification
- [x] **Landing Page Hero Search**: Enter location (e.g., "Bandra", "Indiranagar", "Koregaon Park") — debounced autocomplete displays Indian sublocalities and cities.
- [x] **GPS Detect**: Click "Use my current location" — retrieves latitude/longitude and reverse-geocodes into city/locality.
- [x] **Discover & Directory**: Location filtering correctly filters artists by city and neighborhood.
- [x] **Registration & Profiles**: Client and Artist profiles support full Indian locality selection.

### 4.2 Google Sign-In Verification
- [x] **Client 1-Click Signup**: Sign in with Google as a Client — creates `User` and `ClientProfile` atomically and redirects to `/home`.
- [x] **Artist Onboarding**: Sign in as Artist — provisions `User` and `ArtistProfile` and routes to Artist Studio.
- [x] **Account Linking**: Existing accounts with matching verified Gmail addresses link seamlessly without duplicate errors.

### 4.3 Admin Portal & Insights Verification
- [x] **Brand Identity**: Sidebar displays official LUME logo (`/logo.png`) and Cormorant Garamond serif headers in luxury rose palette.
- [x] **Financial Intelligence**: Displays real Service GMV, Platform Net Commission, and AOV by occasion.
- [x] **Geographic Heatmap**: City demand vs supply with active artist counts and underserved market alerts.
- [x] **Artist Leaderboard**: Ranked by gross revenue or client star rating.
- [x] **Verification Funnel SLA**: Tracks 48-hour verification target, pending artists, and average turnaround time.
- [x] **Live Activity Stream**: Real-time audit log of bookings, payouts, verifications, and admin actions.
