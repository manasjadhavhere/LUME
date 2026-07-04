# Lume — Beauty Booking Platform

> India's premium beauty artist booking app. Connect clients with verified makeup artists for bridal, editorial, glam, and everyday looks.

---

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Styling**: CSS Modules (per-component) + Global design tokens
- **State**: React hooks + LocalStorage (favorites) + SessionStorage (booking flow)
- **Testing**: Vitest + fast-check (property-based tests)

---

## Project Structure

```
lume-web/src/
├── App.tsx                    # Root with routing & layout wrappers
├── pages/                     # Route-level page components
│   ├── LandingPage            # Marketing homepage (/)
│   ├── SplashPage             # Animated splash (/splash)
│   ├── HomePage               # Artist feed with filters (/home)
│   ├── DiscoverPage           # Full directory with search (/discover)
│   ├── ArtistDetailPage       # Artist profile + booking (/artist/:id)
│   ├── BookingConfirmPage     # Booking confirmation (/booking/confirm)
│   ├── SavedPage              # Favorited artists (/saved)
│   └── ProfilePage            # User profile (/profile)
├── components/
│   ├── layout/                # Header, Footer, BottomNav, Toast, ErrorBoundary
│   ├── home/                  # ArtistCard, HeroBanner, CategoryChips, SearchBar
│   ├── detail/                # ArtistHero, ServiceSelector, DatePicker, TimeSlotGrid, ReviewCard
│   ├── booking/               # BookingSummary, ConfirmationRing
│   └── ui/                    # Button, Badge, LazyImage, SectionHeader, PWAInstallPrompt
├── data/
│   ├── types.ts               # TypeScript interfaces (Artist, Service, Review, Booking)
│   └── demoData.ts            # 6 demo artists with full availability & reviews
├── hooks/
│   ├── useFavorites           # LocalStorage-backed favorite artists
│   ├── useFilterState         # Shared category/search filter state
│   ├── useScrollPosition      # Scroll persistence on navigate back
│   ├── useToast               # Toast notification helpers
│   ├── useGreeting            # Time-based greeting string
│   └── useLocalStorage        # Generic localStorage hook
├── context/
│   └── ToastContext           # Global toast notification system
├── styles/
│   ├── index.css              # Design tokens, global reset, utilities, glassmorphism
│   ├── animations.css         # Keyframes, stagger, shimmer, hover effects
│   └── accessibility.css      # WCAG focus styles, reduced motion, screen reader utilities
└── utils/
    ├── reviewSorting.ts       # Sort reviews by date or rating
    └── pwa.ts                 # PWA install prompt utilities
```

---

## Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--rose` | `#F2A4B0` | Primary accent |
| `--rose-deep` | `#D97A8C` | CTA buttons, active states |
| `--rose-light` | `#FAD4DC` | Hover backgrounds |
| `--rose-pale` | `#FFF0F3` | Section backgrounds |
| `--champagne` | `#F5E6D3` | Secondary surfaces |
| `--gold` | `#C9956A` | Premium accents |
| `--cream` | `#FDF6F0` | App background |
| `--dark` | `#2A1A1F` | Primary text |

### Typography
- **Display**: `Cormorant Garamond` — headings, titles, prices
- **Body**: `DM Sans` — labels, descriptions, UI text

### Glassmorphism Classes
- `.glass` — light frosted glass panel
- `.glass-dark` — dark frosted glass panel
- `.glass-panel` — elevated card with blur + shadow

---

## Routing

| Path | Page | Layout |
|------|------|--------|
| `/` | LandingPage | Header + Footer |
| `/splash` | SplashPage | None (fullscreen) |
| `/home` | HomePage | Header + Footer + BottomNav |
| `/discover` | DiscoverPage | Header + Footer + BottomNav |
| `/artist/:id` | ArtistDetailPage | None (fullscreen) |
| `/booking/confirm` | BookingConfirmPage | None (fullscreen) |
| `/saved` | SavedPage | Header + Footer + BottomNav |
| `/profile` | ProfilePage | Header + Footer + BottomNav |

---

## Data Flow

1. Artist list sourced from `demoData.ts` (6 artists, no backend)
2. Booking flow: `ArtistDetailPage` → writes to `sessionStorage` → `BookingConfirmPage` reads & clears
3. Favorites: `useFavorites` hook reads/writes to `localStorage`
4. Search/filter state: `useFilterState` shared between `HomePage` and `DiscoverPage`

---

## Dev Commands

```bash
cd lume-web
npm install          # install dependencies
npm run dev          # start dev server (Vite, port 5173)
npm run build        # production build
npm run preview      # preview production build
npm run test         # run tests (Vitest)
npm run lint         # ESLint
```

---

## Demo Artists

| Artist | Specialties | Location | Price from |
|--------|-------------|----------|------------|
| Aria Mehra | Bridal, Editorial, Glam | Bandra, Mumbai | ₹2,499 |
| Sia Kapoor | Natural, Skincare, Evening | Juhu, Mumbai | ₹1,799 |
| Riya Sen | Glam, Fantasy, Bold | Andheri, Mumbai | ₹2,999 |
| Ananya Patel | Bridal, Traditional | Powai, Mumbai | ₹3,499 |
| Kavya Sharma | Editorial, Runway | Versova, Mumbai | ₹2,799 |
| Diya Iyer | Natural, Everyday, Evening | Colaba, Mumbai | ₹1,499 |
