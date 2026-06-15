# Lume Beauty Booking App

> Your canvas. Our masterpiece.

Lume is a premium mobile-first progressive web application that connects users with professional makeup artists for on-demand and scheduled beauty sessions. Built with React, TypeScript, and modern web technologies for a seamless, elegant user experience.

## 🎨 Overview

This MVP focuses on delivering a premium booking experience through a mobile-first web application with demo data. The app showcases six professional makeup artists in Mumbai, India, offering services including Bridal, Editorial, Evening, Natural, and Glam makeup looks.

### ✨ Key Features

- **Elegant Splash Screen**: Animated brand introduction with glassmorphic effects
- **Personalized Discovery**: Time-aware greetings and curated artist recommendations
- **Advanced Filtering**: Search by name, specialty, or service category
- **Detailed Artist Profiles**: Comprehensive profiles with ratings, reviews, and portfolios
- **Seamless Booking**: Intuitive service, date, and time selection flow
- **Favorites Management**: Save and manage preferred artists with localStorage persistence
- **Responsive Design**: Mobile-first with tablet and desktop adaptations
- **Premium Animations**: Smooth transitions powered by Framer Motion
- **Accessibility**: WCAG AA compliant with proper contrast and touch targets

## 🛠 Tech Stack

### Core Technologies
- **React 18** - Modern React with hooks for state management
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool with Hot Module Replacement
- **React Router v7** - Declarative client-side routing

### UI & Styling
- **Vanilla CSS** - Custom CSS with CSS variables for design tokens
- **Lucide React** - Beautiful, customizable SVG icons
- **Framer Motion** - Smooth animations and page transitions
- **Google Fonts** - Cormorant Garamond & DM Sans typography

### Development & Testing
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **@fast-check/vitest** - Property-based testing for comprehensive validation
- **ESLint** - Code linting and best practices
- **TypeScript ESLint** - TypeScript-specific linting rules

### Future-Ready
- **Capacitor-Ready** - Structured for easy mobile app deployment
- **PWA Features** - Service worker and installability support
- **Performance Optimized** - Code splitting and lazy loading

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Navigate to the project directory
cd lume-web

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint to check code quality
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI dashboard
npm run test:coverage # Generate test coverage report
```

### Building
```bash
npm run build        # Build for production
npm run build:prod   # Build for production with production config
npm run build:analyze # Build with bundle analysis
npm run preview      # Preview production build locally
npm run preview:prod # Preview production build with production config
```

### Maintenance
```bash
npm run clean        # Clean dist and cache directories
```

## 📁 Project Structure

```
lume-web/
├── public/
│   └── favicon.svg                    # Brand favicon
├── src/
│   ├── components/                    # React components
│   │   ├── layout/                    # App shell components
│   │   │   ├── BottomNav.tsx         # Bottom navigation
│   │   │   ├── ErrorBoundary.tsx     # Error handling
│   │   │   ├── NotFound.tsx          # 404 page
│   │   │   └── Toast.tsx             # Notification system
│   │   ├── home/                     # Home screen components
│   │   │   ├── SearchBar.tsx         # Search input with filters
│   │   │   ├── HeroBanner.tsx        # Promotional hero section
│   │   │   ├── CategoryChips.tsx     # Service category filters
│   │   │   ├── ArtistCard.tsx        # Artist listing card
│   │   │   └── ArtistCardSkeleton.tsx # Loading skeleton
│   │   ├── detail/                   # Artist detail components
│   │   │   ├── ArtistHero.tsx        # Hero section with avatar
│   │   │   ├── StatsBar.tsx          # Rating and stats display
│   │   │   ├── ServiceSelector.tsx   # Service selection cards
│   │   │   ├── DatePicker.tsx        # Date selection strip
│   │   │   ├── TimeSlotGrid.tsx      # Time slot selection grid
│   │   │   ├── ReviewCard.tsx        # Individual review display
│   │   │   └── ServiceCardSkeleton.tsx # Service loading skeleton
│   │   ├── booking/                  # Booking confirmation
│   │   │   ├── ConfirmationRing.tsx  # Animated success indicator
│   │   │   └── BookingSummary.tsx    # Booking details card
│   │   └── ui/                       # Reusable UI components
│   │       ├── Button.tsx            # Primary button component
│   │       ├── Badge.tsx             # Contextual labels
│   │       ├── SectionHeader.tsx     # Section titles
│   │       ├── LazyImage.tsx         # Optimized image loading
│   │       └── PWAInstallPrompt.tsx  # PWA installation prompt
│   ├── pages/                        # Route-level page components
│   │   ├── SplashPage.tsx            # Brand splash screen
│   │   ├── HomePage.tsx              # Main discovery page
│   │   ├── ArtistDetailPage.tsx      # Artist profile and booking
│   │   ├── BookingConfirmPage.tsx    # Booking confirmation
│   │   ├── DiscoverPage.tsx          # Advanced search interface
│   │   ├── SavedPage.tsx             # Favorites management
│   │   └── ProfilePage.tsx           # User profile
│   ├── hooks/                        # Custom React hooks
│   │   ├── useGreeting.ts            # Time-aware greeting logic
│   │   ├── useLocalStorage.ts        # localStorage state management
│   │   ├── useFavorites.ts           # Favorites management
│   │   ├── useFilterState.ts         # Search and filter state
│   │   ├── useScrollPosition.ts      # Scroll position persistence
│   │   └── useToast.ts               # Toast notification system
│   ├── data/                         # Data management
│   │   ├── types.ts                  # TypeScript type definitions
│   │   └── demoData.ts               # Demo artist and service data
│   ├── context/                      # React context providers
│   │   └── ToastContext.tsx          # Global toast state
│   ├── utils/                        # Utility functions
│   │   ├── reviewSorting.ts          # Review sorting logic
│   │   └── pwa.ts                    # PWA utilities
│   ├── styles/                       # Global CSS
│   │   ├── index.css                 # Main stylesheet with design tokens
│   │   ├── animations.css            # Animation keyframes
│   │   └── accessibility.css         # Accessibility improvements
│   ├── assets/                       # Static assets
│   │   └── images/                   # Artist avatars and graphics
│   ├── App.tsx                       # Root application component
│   └── main.tsx                      # Application entry point
├── index.html                        # HTML entry point
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.app.json                 # App-specific TypeScript config
├── tsconfig.node.json                # Node.js TypeScript config
├── vite.config.ts                    # Vite build configuration
├── vitest.config.ts                  # Vitest testing configuration
└── eslint.config.js                  # ESLint configuration
```

## 🎯 Core Concepts

### Design System
The app uses a carefully crafted design system with:
- **Brand Colors**: Rose (#F2A4B0), Deep Rose (#D97A8C), Champagne (#F5E6D3), Cream (#FDF6F0)
- **Typography**: Cormorant Garamond for headings, DM Sans for body text
- **Spacing**: Consistent 8px grid system
- **Animations**: Smooth transitions with cubic-bezier easing

### State Management
- **Local State**: `useState` for component-level state
- **URL State**: React Router for navigation state
- **Persistence**: `localStorage` for favorites and preferences
- **Context**: Toast notifications and global app state

### Data Flow
1. Demo data provides artist profiles, services, and reviews
2. Pages load and filter data based on user interactions
3. Components receive data via props and emit events via callbacks
4. State updates trigger re-renders and navigation

### Component Architecture
- **Pages**: Route-level components that manage data and state
- **Components**: Reusable UI components that receive props
- **Hooks**: Custom hooks for shared logic and state management
- **Utils**: Pure functions for data transformation and validation

## 🧪 Testing Strategy

The app uses a dual testing approach for comprehensive coverage:

### Unit Tests
- Component rendering and interactions
- Hook behavior and edge cases
- Utility function logic
- Error handling scenarios

### Property-Based Tests
- Universal properties across all inputs
- Data consistency and validation
- UI behavior correctness
- Accessibility compliance

### Test Files
- `*.test.tsx` - Unit tests for components
- `*.property.test.tsx` - Property-based tests
- `*.test.ts` - Unit tests for utilities and hooks

## 📱 Responsive Design

The app follows a mobile-first approach with three breakpoints:

- **Mobile** (≤480px): Single-column layouts, full-bleed cards
- **Tablet** (481-768px): Centered content, 2-column grids
- **Desktop** (≥769px): Centered app shell, enhanced spacing

## 🎨 Animation Philosophy

Animations enhance the premium feel through:
- **Page Transitions**: Smooth slide and fade effects
- **Micro-interactions**: Button scales, hover states
- **Loading States**: Skeleton shimmer effects
- **Success States**: Celebration animations

## 🔧 Performance Features

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Lazy loading and proper sizing
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Service worker for static asset caching

## 🌐 Browser Support

- **Chrome** 90+
- **Safari** 14+
- **Firefox** 88+
- **Edge** 90+

## 🚀 Deployment

### Production Build
```bash
npm run build:prod
```

### Capacitor Mobile App (Future)
The project structure is ready for Capacitor integration:
1. Build the web app
2. Add Capacitor configuration
3. Generate native iOS/Android projects
4. Deploy to app stores

## 🤝 Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement components with tests
   - Run tests and linting
   - Create pull request

2. **Testing**
   - Unit tests for specific behaviors
   - Property tests for universal properties
   - Manual testing on devices
   - Accessibility testing

3. **Code Quality**
   - TypeScript for type safety
   - ESLint for code consistency
   - Prettier for code formatting
   - Test coverage monitoring

## 📖 Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router](https://reactrouter.com/)
- [Vitest](https://vitest.dev/)

## 📄 License

This project is proprietary software. All rights reserved.

---

**Made with ❤️ by the Lume team**