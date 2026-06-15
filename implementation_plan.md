# Lume — React Web App Implementation Plan

Build a professional, production-quality React (Vite) web app for the Lume beauty booking platform, faithful to the PRD and reference HTML. Frontend-only with demo data, Capacitor-ready for future APK export.

---

## Proposed Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Build Tool | **Vite** | Fast HMR, clean React template |
| Routing | **React Router v6** | Page-based navigation matching the 4+ screen flow |
| Styling | **Vanilla CSS** (CSS Modules or scoped) | Full control over the brand palette; no framework lock-in |
| Icons | **Lucide React** | Lightweight, tree-shakable SVG icon library |
| Animation | **CSS keyframes + Framer Motion** | Smooth page transitions, micro-animations |
| Fonts | **Google Fonts** (Cormorant Garamond + DM Sans) | Per PRD brand guidelines |
| Future APK | **Capacitor** (config prepared, not installed yet) | Structure will be Capacitor-ready |

---

## Folder Structure

```
c:\Users\Manas\Desktop\LUME\
├── lume-app.html              # (existing reference)
├── Lume_PRD.pdf               # (existing PRD)
└── lume-web/                  # ← NEW React project root
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── assets/
    │   │   └── images/        # Generated hero/avatar images
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── BottomNav.jsx
    │   │   │   ├── BottomNav.css
    │   │   │   ├── PageTransition.jsx
    │   │   │   └── PageTransition.css
    │   │   ├── home/
    │   │   │   ├── HeroBanner.jsx / .css
    │   │   │   ├── CategoryChips.jsx / .css
    │   │   │   ├── ArtistCard.jsx / .css
    │   │   │   └── SearchBar.jsx / .css
    │   │   ├── detail/
    │   │   │   ├── ArtistHero.jsx / .css
    │   │   │   ├── StatsBar.jsx / .css
    │   │   │   ├── ServiceSelector.jsx / .css
    │   │   │   ├── DatePicker.jsx / .css
    │   │   │   ├── TimeSlotGrid.jsx / .css
    │   │   │   └── ReviewCard.jsx / .css
    │   │   ├── booking/
    │   │   │   ├── ConfirmationRing.jsx / .css
    │   │   │   └── BookingSummary.jsx / .css
    │   │   └── ui/
    │   │       ├── Badge.jsx / .css
    │   │       ├── Button.jsx / .css
    │   │       └── SectionHeader.jsx / .css
    │   ├── data/
    │   │   └── demoData.js     # All mock artists, reviews, services, slots
    │   ├── pages/
    │   │   ├── SplashPage.jsx / .css
    │   │   ├── HomePage.jsx / .css
    │   │   ├── ArtistDetailPage.jsx / .css
    │   │   ├── BookingConfirmPage.jsx / .css
    │   │   ├── DiscoverPage.jsx / .css
    │   │   ├── SavedPage.jsx / .css
    │   │   └── ProfilePage.jsx / .css
    │   ├── hooks/
    │   │   └── useGreeting.js  # Time-of-day greeting logic
    │   ├── styles/
    │   │   ├── index.css       # Global reset, CSS variables, fonts
    │   │   └── animations.css  # Shared keyframe animations
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── README.md
    └── BACKEND_INTEGRATION.md
```

---

## Screens & Features (Mapped to PRD IDs)

### 1. Splash Screen (`/`) — F-01, F-02
- Full-viewport gradient background (rose → cream)
- Animated floating orbs (CSS keyframes)
- Pulsing logo icon with glassmorphism
- "LUME" brand title + "Beauty · Art · Glow" subtitle
- Tagline: *"Your canvas. Our masterpiece."*
- **"Explore Artists →"** CTA button → navigates to Home
- Auto-advance after 5s tap/click

### 2. Home Screen (`/home`) — F-03 to F-10
- **Header**: Time-aware greeting ("Good morning, Priya ✨"), notification bell with badge
- **Search bar**: Styled input with filter button (frontend filter of demo data)
- **Hero banner**: Gradient card "Bridal & Editorial Looks Near You" with "Book Now" CTA
- **Category chips**: Horizontally scrollable — All, Bridal, Editorial, Evening, Natural, Glam; active chip filters artist list
- **Top Artists**: Vertical card list (6+ demo artists) with avatar, name, specialties, rating, reviews, distance, price, badges ("Top Pick", "New")
- **"See All" links** on each section

### 3. Artist Detail Screen (`/artist/:id`) — F-11 to F-19
- **Hero area**: 300px gradient hero with artist avatar/emoji, back button, favourite heart toggle
- **Artist info**: Name, certification, city
- **Stats bar**: Rating, Reviews, Experience, Bookings (4-column)
- **Service cards**: Horizontally scrollable — Bridal, Editorial, Evening, Natural with price; selection state
- **Date picker strip**: Next 7 days, scrollable chips
- **Time slot grid**: 3-column grid with Available / Selected / Taken states
- **Reviews section**: Avatar, name, stars, review text; "See All" link
- **Confirm Booking CTA**: Full-width sticky button with dynamic price

### 4. Booking Confirmation (`/booking/confirm`) — F-20 to F-22
- Full-viewport gradient overlay
- Animated success ring with checkmark (pop + pulse)
- "Booking Confirmed!" title
- Glassmorphism summary card: Artist, Service, Date & Time, Location, Total Paid
- "Back to Home" CTA

### 5. Discover Page (`/discover`) — F-24
- Full search interface with filters
- Grid of all artists, filterable by category/price/rating
- Skeleton loading shimmer effect

### 6. Saved Page (`/saved`) — F-25
- List of favourited artists (local state / localStorage)
- Empty state with illustration when no favourites

### 7. Profile Page (`/profile`) — F-26
- User avatar, name, location
- Menu items: My Bookings, Payment Methods, Settings, Help, Logout
- Each navigates to a styled placeholder

---

## Design System (CSS Variables)

```css
:root {
  --rose: #F2A4B0;
  --rose-deep: #D97A8C;
  --rose-light: #FAD4DC;
  --rose-pale: #FFF0F3;
  --rose-blush: #FBDDE4;
  --champagne: #F5E6D3;
  --gold: #C9956A;
  --gold-light: #E8C99A;
  --cream: #FDF6F0;
  --dark: #2A1A1F;
  --mid: #6B3D4A;
  --text-soft: #9E6B78;
  --white: #FFFFFF;
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'DM Sans', sans-serif;
}
```

---

## Responsive Design Strategy

| Breakpoint | Behaviour |
|------------|-----------|
| ≤ 480px | Mobile-first — single column, full-bleed cards, native feel |
| 481–768px | Tablet — centered content with max-width, 2-column artist grid |
| 769–1024px | Small desktop — side padding, wider cards |
| ≥ 1025px | Desktop — centered app shell (max 480px) mimicking mobile feel, or full-width layout with sidebar nav |

All touch targets ≥ 44×44px per PRD accessibility requirements.

---

## Demo Data

6 makeup artists with complete profiles:
1. **Aria Mehra** — Bridal · Editorial · Glam — ₹2,499/session — ⭐ 4.9 (218)
2. **Sia Kapoor** — Natural · Skincare · Evening — ₹1,799/session — ⭐ 4.8 (164)
3. **Riya Sen** — Glam · Fantasy · Bold — ₹2,999/session — ⭐ 4.7 (89)
4. **Ananya Patel** — Bridal · Traditional — ₹3,499/session — ⭐ 4.9 (312)
5. **Kavya Sharma** — Editorial · Runway — ₹2,799/session — ⭐ 4.6 (145)
6. **Diya Iyer** — Natural · Everyday · Evening — ₹1,499/session — ⭐ 4.8 (203)

Each artist has: services with prices, 7-day availability, time slots (some taken), 3+ reviews.

---

## Verification Plan

### Automated
```bash
npm run build   # Ensure zero build errors
npm run dev     # Launch dev server, verify all pages render
```

### Manual Verification
- Navigate all 7 pages via bottom nav and links
- Test category filtering on Home
- Test service/date/time selection on Artist Detail
- Verify booking confirmation flow end-to-end
- Test favourite toggle persistence (localStorage)
- Test responsive layout at 375px, 768px, 1024px, 1440px
- Verify smooth page transitions and animations

---

## Deliverables

| File | Description |
|------|-------------|
| `README.md` | Project overview, setup, folder structure, tech stack, scripts |
| `BACKEND_INTEGRATION.md` | API endpoints to replace demo data, auth strategy, payment gateway hooks, Capacitor setup guide |

---

> [!IMPORTANT]
> The Discover, Saved, and Profile pages will be implemented as polished placeholder screens with demo data, matching the overall design. They are marked as Phase 2 in the PRD but will be included as navigable pages for a complete app feel.

> [!NOTE]
> No images will be generated for artist avatars — instead, we'll use beautiful gradient backgrounds with elegant emoji icons (as in the reference HTML) to keep the app self-contained and fast-loading. If you prefer real AI-generated portrait images, let me know and I can generate them.
