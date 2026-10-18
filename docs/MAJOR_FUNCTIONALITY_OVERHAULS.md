# LUME — Major Functionality Overhauls Specification & Execution Plan

**Document Version:** 1.0.0  
**Target Environment:** Lume Fullstack (`lume-api` + `lume-web`)  
**Scope:** Geo-Location System, Direct Google Sign-In & Auth Simplification, Luxury Admin Portal & Business Insights  
**Status:** Approved for Implementation (Planning Phase — No Code Modified Yet)

---

## 1. Executive Summary

This document specifies the technical design, architectural requirements, user experience flows, data models, and step-by-step implementation roadmap for three major platform overhauls requested for LUME:

1. **Real Geo-Location System Across the Platform**: Replacing basic static city strings and HTML datalists with a modern, real-time geocoding and location auto-suggest engine (Google Places / Nominatim + Indian localities, GPS "Detect Location", and locality-level search) across the Landing Page search bar, Discover directory, Artist registration, and Client profiles.
2. **Simplified Authentication & Direct Google Sign-In**: Streamlining the onboarding and authentication flow by introducing official Google Sign-In ("Continue with Google" button and One-Tap) with automated role assignment, frictionless 1-click client signup, and seamless token generation.
3. **Luxury Brand Admin Portal & Advanced Business Insights**: Elevating the admin dashboard from a generic blue-gray theme into Lume’s signature luxury brand aesthetic (`Cormorant Garamond`, `--rose-deep`, `--rose-pale`, `--dark`, glassmorphic cards, brand logo) while integrating critical business intelligence metrics: GMV vs Net Platform Revenue, Geographic Demand Heatmap, Artist Performance Leaderboard, and Real-time Activity Feeds.

---

## 2. Overhaul 1: Real Geo-Location System Across Platform

### 2.1 Current State Analysis
- **Landing Page (`LandingPage.tsx`)**: The search bar currently uses an HTML `<datalist id="home-cities">` containing only 8 hardcoded cities (`Mumbai`, `Delhi NCR`, `Bangalore`, `Pune`, `Hyderabad`, `Chennai`, `Kolkata`, `Ahmedabad`). On mobile screens, the location input is currently hidden.
- **Discover Page (`DiscoverPage.tsx`)**: Uses `LocationAutocomplete.tsx` containing an array of 33 Indian cities. Users cannot search for specific sub-localities (e.g., *Bandra West, Mumbai*, *Indiranagar, Bengaluru*, *Connaught Place, New Delhi*, *Koregaon Park, Pune*) or auto-detect their current GPS location.
- **Registration Page (`RegisterPage.tsx`)**: Relies on the same 33-city list for artist and client registration.
- **Profile Pages (`ProfilePage.tsx`, `ArtistProfile.tsx`)**: Plain text inputs with no auto-suggestion or validation.

### 2.2 Target Experience (Like Leading Consumer Platforms: Airbnb, Zomato, Urban Company)
1. **GPS "Use Current Location"**: One-click location detection via HTML5 Geolocation (`navigator.geolocation`) with reverse-geocoding to display the user's current city and neighborhood.
2. **Predictive Auto-Suggest**: Real-time debounce lookup identifying Indian cities, metropolitan regions, neighborhoods, and pincodes.
3. **Popular City Badges**: Quick-select chips for top beauty hubs (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Jaipur, Goa, Chandigarh).
4. **Recent Searches**: Caching previous search locations in `localStorage` for instant re-selection.
5. **Universal Integration**: Consistent dropdown UI across Landing Page hero search, Mobile hero search, Discover page search & filter drawer, Registration page, and Profile settings.

### 2.3 Technical Architecture & API Strategy

```
+-------------------------------------------------------------+
|                  <GeoLocationInput />                       |
+-------------------------------------------------------------+
                              |
       +----------------------+----------------------+
       |                                             |
       v                                             v
[GPS "Detect Location"]                     [Search Input (Debounced 300ms)]
       |                                             |
       v                                             v
navigator.geolocation                         Provider Strategy:
       |                                      1. Google Places Autocomplete API (Production)
       v                                      2. OpenStreetMap / Nominatim (Free Fallback)
Reverse Geocode Engine                        3. Built-in 500+ Indian Tier 1/2/3 Cities &
       |                                         Localities JSON Database (Offline Fallback)
       +----------------------+----------------------+
                              |
                              v
             Unified Location Result Object:
             {
               formattedAddress: "Bandra West, Mumbai, Maharashtra",
               city: "Mumbai",
               sublocality: "Bandra West",
               state: "Maharashtra",
               pincode: "400050",
               latitude: 19.0596,
               longitude: 72.8295
             }
```

### 2.4 Component Specification (`lume-web/src/components/ui/GeoLocationInput.tsx`)

#### Props Interface
```typescript
export interface GeoLocationResult {
  formattedAddress: string;
  city: string;
  sublocality?: string;
  state?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
}

export interface GeoLocationInputProps {
  value: string;
  onChange: (location: string, details?: GeoLocationResult) => void;
  placeholder?: string;
  className?: string;
  variant?: 'hero' | 'filter' | 'form';
  showCurrentLocationBtn?: boolean;
  onSelect?: (details: GeoLocationResult) => void;
}
```

#### UI States & Dropdown Sections
1. **Quick Actions Row**:
   - `📍 Use my current location` (Triggers GPS + reverse geocoding with animated loading spinner).
2. **Recent Locations**:
   - Shows up to 3 recently selected locations stored in `localStorage`.
3. **Popular Cities**:
   - Pill chips: `Mumbai`, `Delhi NCR`, `Bengaluru`, `Pune`, `Hyderabad`, `Kolkata`, `Jaipur`, `Goa`.
4. **Dynamic Results**:
   - Displays matched results with MapPin icon, primary text (neighborhood/city), and secondary text (state/region).

### 2.5 Backend Alignment (`lume-api`)
- In `lume-api/src/modules/artists/artists.service.ts`:
  - Enhance `getArtists` query filter to support fuzzy matching for both city and sublocalities:
    ```prisma
    OR: [
      { location: { contains: locationQuery, mode: 'insensitive' } },
      { bio: { contains: locationQuery, mode: 'insensitive' } }
    ]
    ```
  - Support comma-separated locality queries (e.g. searching "Bandra, Mumbai" matches artists with location "Mumbai" or "Bandra").

### 2.6 Step-by-Step Execution Plan
1. **Step 1.1**: Create `lume-web/src/data/indianGeoLocations.ts` with comprehensive coverage of 500+ Indian cities, union territories, and key metropolitan sub-localities.
2. **Step 1.2**: Implement `lume-web/src/utils/geoCoding.ts` helper wrapping `navigator.geolocation` and reverse geocoding (with graceful fallback).
3. **Step 1.3**: Build `lume-web/src/components/ui/GeoLocationInput.tsx` and accompanying `GeoLocationInput.css` styled with Lume's frosted glass and luxury tokens.
4. **Step 1.4**: Integrate `GeoLocationInput` into:
   - `LandingPage.tsx` desktop search bar & mobile search drawer.
   - `DiscoverPage.tsx` search bar & filter drawer.
   - `RegisterPage.tsx` (Client and Artist registration forms).
   - `ProfilePage.tsx` and `ArtistProfile.tsx` (Profile editing forms).
5. **Step 1.5**: Validate end-to-end selection, mobile touch friendliness, and search filtering accuracy.

---

## 3. Overhaul 2: Frictionless Auth & Direct Google Sign-In

### 3.1 Current State Analysis
- Registration requires manual email, password (min 8 chars), name, phone, gender, and location.
- Login requires manual email and password.
- No single-click social login exists.
- In `lume-api/prisma/schema.prisma`, `passwordHash String` is mandatory on the `User` model, preventing passwordless/OAuth user creation.

### 3.2 Target Experience
- **1-Click Google Sign-In / Sign-Up**: Official Google OAuth button on both Login and Register pages.
- **Client Auto-Onboarding**: When a client signs in with Google, an account and `ClientProfile` are automatically provisioned if they do not exist; users are instantly authenticated and redirected to `/home`.
- **Artist Studio Google Sign-In**: Artists can sign in with Google directly. If a new artist signs in via the Artist portal, their `ArtistProfile` is initialized and they are directed to the Artist Dashboard.
- **Linked Accounts**: Existing email accounts seamlessly link with Google Sign-In if the verified Google email matches.
- **Google One-Tap (Optional Prompt)**: Automatic native browser prompt for returning users.

### 3.3 Architecture & OAuth Flow

```
[User Clicks "Continue with Google"]
                |
                v
    Google Identity Services (GIS SDK)
                |
                v
    Receives Google ID Token (JWT)
                |
                v
POST /api/auth/google  { idToken, role: 'CLIENT' | 'ARTIST' }
                |
                v
Backend: Verify ID Token with Google Auth Library
  - Validates signature, audience (Client ID), expiration
  - Extracts: email, name, picture, sub (googleId), email_verified
                |
                +---------------------------------+
                |                                 |
     [User Already Exists?]              [New User]
                |                                 |
         YES    |                          NO     |
                v                                 v
     Update googleId if missing           Create User (role from request)
     Generate Lume JWT                    Create ClientProfile / ArtistProfile
                |                         Generate Lume JWT
                +---------------------------------+
                                |
                                v
               Return { user, token } to Frontend
                                |
                                v
         AuthContext saves token & user in LocalStorage
                                |
                                v
     Redirect to /home (Client) or /artist-dashboard (Artist)
```

### 3.4 Database Schema Changes (`lume-api/prisma/schema.prisma`)

```prisma
model User {
  id               String         @id @default(cuid())
  email            String         @unique
  passwordHash     String?        // Changed from String to String? for Google OAuth users
  googleId         String?        @unique // Added: Unique Google Subject Identifier
  authProvider     String         @default("LOCAL") // Added: "LOCAL" | "GOOGLE"
  role             Role           @default(CLIENT)
  name             String
  phone            String?
  gender           Gender?
  dob              DateTime?
  avatarUrl        String?
  isActive         Boolean        @default(true)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  artistProfile    ArtistProfile?
  bookingsAsClient Booking[]      @relation("ClientBookings")
  clientProfile    ClientProfile?
  notifications    Notification[]
  reviewsGiven     Review[]       @relation("ClientReviews")

  @@map("users")
}
```

### 3.5 Backend API Endpoint (`POST /api/auth/google`)

- **Dependencies**: `google-auth-library` (in `lume-api`).
- **Controller**: `lume-api/src/modules/auth/auth.controller.ts` -> `googleAuth`.
- **Service**: `lume-api/src/modules/auth/auth.service.ts` -> `authenticateGoogleUser`:
  ```typescript
  export async function authenticateGoogleUser(idToken: string, requestedRole: Role = 'CLIENT') {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google token payload');
    }

    const { email, name, sub: googleId, picture } = payload;

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email: email.toLowerCase() }] },
      include: { clientProfile: true, artistProfile: true }
    });

    if (user) {
      // Link Google ID if registered via local email previously
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: user.avatarUrl || picture },
          include: { clientProfile: true, artistProfile: true }
        });
      }
    } else {
      // Create new user & associated profile
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || 'Lume Member',
          googleId,
          authProvider: 'GOOGLE',
          avatarUrl: picture,
          role: requestedRole,
          ...(requestedRole === 'CLIENT'
            ? { clientProfile: { create: {} } }
            : { artistProfile: { create: { location: 'Mumbai' } } })
        },
        include: { clientProfile: true, artistProfile: true }
      });
    }

    const token = generateJwtToken(user);
    return { user, token };
  }
  ```

### 3.6 Frontend Implementation (`lume-web`)
1. **Google Identity Services SDK**:
   - Load official GIS script dynamically in `index.html` or via `@react-oauth/google`.
2. **UI Component (`GoogleAuthButton.tsx`)**:
   - Elegant, luxury button with official SVG Google "G" icon.
   - Text: `"Continue with Google"` or `"Sign in with Google"`.
   - Subtle frosted glass border matching Lume’s luxury style tokens.
3. **Divider**:
   - `"OR"` divider styled with thin subtle lines: `── Or continue with email ──`.
4. **Auth Context Updates (`AuthContext.tsx`)**:
   - Add `loginWithGoogle(idToken: string, role?: UserRole)` helper.
5. **Page Placement**:
   - Positioned prominently above the manual email/password form in both `LoginPage.tsx` and `RegisterPage.tsx`.

### 3.7 Step-by-Step Execution Plan
1. **Step 2.1**: Update `lume-api/prisma/schema.prisma` with optional `passwordHash`, `googleId`, and `authProvider`. Run `npx prisma db push` or `prisma migrate`.
2. **Step 2.2**: Install `google-auth-library` in `lume-api`.
3. **Step 2.3**: Implement `authenticateGoogleUser` service and `googleAuth` controller endpoint.
4. **Step 2.4**: Add `GOOGLE_CLIENT_ID` configuration to `.env.example`, `.env.development`, and `.env.production`.
5. **Step 2.5**: Install `@react-oauth/google` or lightweight GIS wrapper in `lume-web`.
6. **Step 2.6**: Create `GoogleAuthButton` component and integrate into `LoginPage.tsx` and `RegisterPage.tsx`.
7. **Step 2.7**: Test sign-in, account creation, role routing, and profile association.

---

## 4. Overhaul 3: Luxury Brand Admin Portal & Advanced Business Insights

### 4.1 Current State Analysis
- **Aesthetic Mismatch**: `AdminDashboard.css` currently uses generic Inter typography with harsh blue-gray (`#f8fafc`, `#e2e8f0`, `#64748b`) and aggressive crimson (`#e11d48`) Tailwind colors, which clash with Lume's editorial rose & dark palette.
- **Logo Integration**: Header has a plain placeholder `<img>` tag with lowercase `/logo.png`, missing Lume’s signature icon mark and `LUME` display typography.
- **Limited Insights**: The current dashboard only shows basic user count, artist count, pending verifications, and simple user growth. It lacks financial analytics, GMV tracking, geographic performance, artist ranking, and operational activity feeds.

### 4.2 Brand Design System Alignment

| Admin UI Element | Current Generic Style | New Lume Luxury Design Token |
| :--- | :--- | :--- |
| **Font Headings** | Standard sans-serif | `Cormorant Garamond` (var(--font-display)) italic accents |
| **Font Body** | Inter | `DM Sans` (var(--font-body)) / Inter for tabular figures |
| **Primary Accent** | Tailwind Red (`#e11d48`) | Deep Rose (`#D97A8C` / `var(--rose-deep)`) |
| **Surface Background** | Slate Gray (`#f8fafc`) | Warm Cream / Pale Blush (`#FFF9FA` / `var(--rose-pale)`) |
| **Card Borders** | Gray (`#e2e8f0`) | Frosted Rose Glass (`rgba(217, 122, 140, 0.16)`) |
| **Active Nav Item** | Solid Red Pill | Soft Rose Glow with Glassmorphic Highlight & 3px left indicator bar |
| **Brand Logo** | Misaligned `/logo.png` | Official Mark (`/Logo.png`) + `LUME` luxury serif wordmark + `ADMIN CONSOLE` pill badge |

### 4.3 Advanced Business Intelligence & Insights Suite

#### 1. Financial Intelligence Panel
- **Gross Merchandise Value (GMV)**: Total transaction value processed across all bookings.
- **Platform Net Revenue**: Real-time calculation of Lume's 5% platform commission + 18% GST.
- **Average Order Value (AOV)**: Average booking cost categorized by style:
  - Bridal AOV
  - Occasion / Party AOV
  - Editorial / Commercial AOV
- **Payout Pipeline Health**: Total Paid Out to Artists vs Pending Payouts awaiting bank transfer.

#### 2. Geographic Market Intelligence
- **City Revenue & Volume Breakdown**:
  - Interactive distribution bar chart: Top booking cities (Mumbai, Delhi NCR, Bangalore, Pune, Hyderabad, Jaipur).
  - Supply vs Demand Ratio: Number of verified artists active in each city vs client booking requests.
  - Highlights underserved regions where more artist onboarding is required.

#### 3. Artist Excellence & Operational Verification Funnel
- **Verification Funnel SLA**:
  - Verification submission velocity.
  - Average approval turnaround time.
  - Acceptance vs rejection rate.
- **Top Artist Leaderboard**:
  - Highest grossing artists.
  - Most reviewed and highest rated (5.0 stars) artists.
  - Direct links to artist profile management modal.

#### 4. Real-time Live Operations Feed
- Live chronological activity stream:
  - `🟢 New Booking Confirmed`: Client X booked Artist Y for Bridal Makeup (₹15,000).
  - `🟣 Verification Submitted`: Artist Z submitted certification documents.
  - `💳 Payout Completed`: Payout of ₹12,500 transferred to Artist W.
  - `⭐ 5-Star Review Received`: Client A reviewed Artist B.

### 4.4 Component Overhaul Breakdown (`AdminDashboard.tsx`)

1. **Navigation Structure**:
   - `Overview / Insights`: High-level business KPI dashboard, financial charts, geo-distribution.
   - `Artist Directory & Verifications`: Enhanced artist table with specialty badges, verification quick-actions, and edit modal.
   - `Client Management`: Client accounts, booking history, lifetime value (LTV).
   - `Payments & Invoices`: Payout tracking, automated invoice generation, Razorpay route sync status.
   - `Activity Logs`: System audit trail.
2. **Visual Enhancements**:
   - Custom Glassmorphic stat cards with gradient icons.
   - Recharts charts re-themed to Lume's palette (rose, champagne, gold, soft dark).
   - Polished responsive modals with document preview tabs (certificate images, portfolio galleries, verified bank accounts).

### 4.5 Backend Insights Service & Endpoints (`lume-api`)

- **New Endpoint**: `GET /api/admin/insights/analytics`
- **Controller**: `lume-api/src/modules/admin/admin.controller.ts` -> `getAdvancedInsights`.
- **Service**: Returns aggregated metrics via Prisma queries:
  ```typescript
  export async function getAdvancedInsights() {
    const totalGmv = await prisma.paymentRecord.aggregate({
      _sum: { totalCharged: true },
      where: { status: 'PAID' }
    });
    const totalCommission = await prisma.paymentRecord.aggregate({
      _sum: { lumeCommission: true },
      where: { status: 'PAID' }
    });
    const cityDistribution = await prisma.artistProfile.groupBy({
      by: ['location'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });
    const recentActivity = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { name: true, email: true } },
        artist: { include: { user: { select: { name: true } } } }
      }
    });

    return {
      gmv: totalGmv._sum.totalCharged || 0,
      netRevenue: totalCommission._sum.lumeCommission || 0,
      cityDistribution,
      recentActivity,
      // ... AOV & Funnel aggregations
    };
  }
  ```

### 4.6 Step-by-Step Execution Plan
1. **Step 3.1**: Add `getAdvancedInsights` analytics service and route to `lume-api/src/modules/admin/`.
2. **Step 3.2**: Redesign `AdminDashboard.css` using Lume design tokens (`--rose-deep`, `--rose-pale`, glassmorphic cards, brand fonts).
3. **Step 3.3**: Update `AdminDashboard.tsx` sidebar with official Lume mark (`/Logo.png`), typography, and refined navigation items.
4. **Step 3.4**: Build the new **Business Insights KPI Panel** (GMV, Net Revenue, AOV, Payout ratio).
5. **Step 3.5**: Implement the **Geographic City Performance Chart** and **Artist Excellence Leaderboard**.
6. **Step 3.6**: Add the **Real-time Operations Activity Feed**.
7. **Step 3.7**: Verify all modals, approve/reject triggers, invoice downloads, and responsive navigation.

---

## 5. Master Implementation Roadmap & Phased Execution

```
+-------------------------------------------------------------------------------+
| PHASE 1: Real Geo-Location System                                             |
| - indianGeoLocations.ts database & geocoding helper                          |
| - <GeoLocationInput /> component with GPS detection & quick chips            |
| - Integration in LandingPage, DiscoverPage, RegisterPage, and Profiles        |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| PHASE 2: Frictionless Auth & Direct Google Sign-In                            |
| - Prisma schema update (optional passwordHash, googleId, authProvider)       |
| - Backend POST /api/auth/google verification endpoint                         |
| - Frontend GoogleAuthButton integration in LoginPage & RegisterPage           |
| - 1-click Client auto-provisioning & role resolution                         |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| PHASE 3: Luxury Brand Admin Portal & Advanced Insights                        |
| - Lume brand theme migration in AdminDashboard.css                           |
| - Logo & brand identity integration in Admin layout                           |
| - Backend /api/admin/insights/analytics endpoint                              |
| - Financial Intelligence (GMV, Net Revenue, AOV) cards                        |
| - Geographic Market Demand & Live Activity Timeline                           |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| PHASE 4: Full System Integration, Build Verification & Quality Assurance      |
| - TypeScript compilation check (lume-api + lume-web)                          |
| - Browser testing on Mobile, Tablet, and Desktop                              |
| - End-to-end user journey verification                                        |
+-------------------------------------------------------------------------------+
```

---

## 6. Pre-requisites & Environment Variables Checklist

Before triggering Phase 2 and Phase 3 execution, the following environment variables should be verified:

1. **Google OAuth Client ID**:
   - `VITE_GOOGLE_CLIENT_ID` in `lume-web/.env.development` & `.env.production`.
   - `GOOGLE_CLIENT_ID` in `lume-api/.env`.
   - Authorized Javascript origins: `http://localhost:5173`, `http://localhost:5174`, production domain.
   - Authorized redirect URIs: `http://localhost:5173`, `http://localhost:5174`, production domain.
2. **Database Migration**:
   - Run `npx prisma db push` or `prisma migrate dev` inside `lume-api/` to apply the `googleId` and `authProvider` fields.
3. **Admin Access Role**:
   - Run `npm run admin:create` inside `lume-api/` to ensure the administrator account (`admin@lume.in`) is ready for admin panel testing.
