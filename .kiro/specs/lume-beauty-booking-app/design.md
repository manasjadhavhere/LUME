# Design Document

## Overview

Lume is a React-based progressive web application for booking professional makeup artists. The application follows a mobile-first, component-driven architecture using Vite as the build tool, React Router for navigation, vanilla CSS for styling, Lucide React for icons, and Framer Motion for animations.

The MVP is frontend-only with demo data, designed to deliver a premium user experience through elegant animations, smooth transitions, and a carefully crafted design system based on the Lume brand palette.

### Key Design Goals

1. **Premium Feel**: Deliver a luxury experience through careful attention to visual design, animations, and interactions
2. **Mobile-First**: Optimize for mobile devices with responsive breakpoints for tablet and desktop
3. **Performance**: Fast loading times with code splitting and optimized assets
4. **Accessibility**: Meet WCAG AA standards with proper contrast, touch targets, and keyboard navigation
5. **Scalability**: Structure code for easy backend integration and Capacitor mobile app deployment

## Architecture

### Technology Stack

- **Build Tool**: Vite (fast HMR, optimized production builds)
- **Framework**: React 18 with hooks for state management
- **Routing**: React Router v6 for declarative navigation
- **Styling**: Vanilla CSS with CSS Modules for scoped styles
- **Icons**: Lucide React for lightweight, tree-shakable SVG icons
- **Animation**: Framer Motion for page transitions and complex animations, CSS keyframes for micro-interactions
- **Fonts**: Google Fonts (Cormorant Garamond, DM Sans)
- **Future Mobile**: Capacitor-ready structure for APK/IPA export

### Application Structure

```
lume-web/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── images/              # Artist avatars (gradient + emoji)
│   ├── components/
│   │   ├── layout/              # App shell components
│   │   ├── home/                # Home screen components
│   │   ├── detail/              # Artist detail components
│   │   ├── booking/             # Confirmation components
│   │   └── ui/                  # Reusable UI components
│   ├── data/
│   │   └── demoData.js          # Mock artists, services, reviews
│   ├── pages/                   # Route-level page components
│   ├── hooks/                   # Custom React hooks
│   ├── styles/                  # Global CSS and design tokens
│   ├── App.jsx                  # Root component with routing
│   └── main.jsx                 # Application entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### Routing Structure

The application uses client-side routing with the following routes:

- `/` - Splash screen (auto-redirects to `/home` after 5s or user action)
- `/home` - Home/browse screen with artist listings
- `/artist/:id` - Artist detail page with booking interface
- `/booking/confirm` - Booking confirmation screen
- `/discover` - Full search and discovery interface (Phase 2 placeholder)
- `/saved` - Saved/favorited artists list (Phase 2 placeholder)
- `/profile` - User profile and settings (Phase 2 placeholder)

### State Management Strategy

Given the MVP scope, we use React's built-in state management:

1. **Component State**: `useState` for local UI state (selected service, date, time)
2. **URL State**: React Router params for artist ID and page context
3. **Local Storage**: Browser localStorage for favorites persistence
4. **Context** (if needed): For theme or user preferences shared across components

No Redux or external state library needed for MVP - keeps bundle size small and code simple.

### Data Flow

```
Demo Data (demoData.js)
    ↓
Page Component (loads and filters data)
    ↓
Child Components (receive data via props)
    ↓
User Interactions (events bubble up via callbacks)
    ↓
Page Component (updates state, triggers navigation)
```

## Components and Interfaces

### Layout Components

#### BottomNav Component
**Purpose**: Persistent navigation bar across main screens

**Props**:
- `activePage: string` - Current active page for highlighting
- `onNavigate: (page: string) => void` - Navigation handler

**State**: None (stateless component)

**Behavior**:
- Renders 4 navigation items: Home, Discover, Saved, Profile
- Highlights active tab with gradient background and color change
- Triggers page navigation on tap with scale animation

#### PageTransition Component
**Purpose**: Wrapper for smooth page transitions

**Props**:
- `children: ReactNode` - Page content to animate
- `direction: 'left' | 'right'` - Slide direction

**Behavior**:
- Uses Framer Motion for enter/exit animations
- Applies fade + slide effects with cubic-bezier easing
- Duration: 500ms

### Home Screen Components

#### SearchBar Component
**Purpose**: Search input with filter button

**Props**:
- `value: string` - Search query text
- `onChange: (value: string) => void` - Search handler
- `onFilter: () => void` - Filter button handler

**State**: None (controlled component)

**Behavior**:
- Displays search icon, input field, and filter button
- Debounces input to avoid excessive filtering (300ms delay)
- Shows active state on filter button when filters applied

#### HeroBanner Component
**Purpose**: Promotional banner with call-to-action

**Props**:
- `promo: string` - Promotional text (e.g., "Limited Slots Today")
- `title: string` - Main headline
- `ctaText: string` - Button text
- `onCtaClick: () => void` - CTA click handler

**Behavior**:
- Animated gradient background with decorative symbols
- Entrance animation: fade up with stagger
- Tap scales card slightly for feedback

#### CategoryChips Component
**Purpose**: Horizontally scrollable service category filters

**Props**:
- `categories: Array<{id, icon, label}>` - Category list
- `activeCategory: string` - Currently selected category
- `onCategorySelect: (id: string) => void` - Selection handler

**Behavior**:
- Renders scrollable chips with icons and labels
- Active chip has gradient background and shadow
- Smooth scroll behavior with momentum

#### ArtistCard Component
**Purpose**: Artist listing card with key information

**Props**:
```typescript
{
  artist: {
    id: string
    name: string
    avatar: string
    specialties: string[]
    rating: number
    reviewCount: number
    distance: number
    startingPrice: number
    badge?: 'Top Pick' | 'New'
  }
  onClick: (id: string) => void
}
```

**Behavior**:
- Displays artist avatar (gradient + emoji), name, specialties, rating, distance, price
- Shows optional badge ("Top Pick", "New")
- Tap scales card and navigates to detail page
- Staggered entrance animations when list loads

### Artist Detail Components

#### ArtistHero Component
**Purpose**: Large hero section with artist image and controls

**Props**:
```typescript
{
  artist: {
    name: string
    avatar: string
  }
  isFavorite: boolean
  onBack: () => void
  onFavoriteToggle: () => void
}
```

**Behavior**:
- Renders 300px hero with gradient background and large emoji avatar
- Back button returns to previous page with slide transition
- Heart icon toggles favorite state with scale animation
- Gradient overlay ensures text legibility

#### StatsBar Component
**Purpose**: 4-column statistics display

**Props**:
```typescript
{
  stats: {
    rating: number
    reviewCount: number
    experience: number
    bookingCount: number
  }
}
```

**Behavior**:
- Displays rating, reviews, years of experience, total bookings
- Each stat in its own column with divider borders
- Uses Cormorant Garamond for numbers (display font)

#### ServiceSelector Component
**Purpose**: Horizontally scrollable service cards

**Props**:
```typescript
{
  services: Array<{
    id: string
    icon: string
    name: string
    price: number
  }>
  selectedService: string | null
  onServiceSelect: (id: string) => void
}
```

**State**: None (controlled component)

**Behavior**:
- Renders service cards with icon, name, price
- Selected service has gradient background
- Smooth horizontal scroll

#### DatePicker Component
**Purpose**: Horizontal strip of selectable dates

**Props**:
```typescript
{
  dates: Array<{
    date: Date
    dayName: string
    dayNumber: number
  }>
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
}
```

**Behavior**:
- Generates next 7 days from current date
- Selected date has deep rose background and white text
- Smooth scroll to selected date on change

#### TimeSlotGrid Component
**Purpose**: 3-column grid of time slots

**Props**:
```typescript
{
  slots: Array<{
    time: string
    available: boolean
    selected: boolean
  }>
  onSlotSelect: (time: string) => void
}
```

**Behavior**:
- Available slots: white background, rose border, tappable
- Selected slot: deep rose background, white text
- Taken slots: pale background, struck-through text, not tappable
- Grid layout: 3 columns with 8px gap

#### ReviewCard Component
**Purpose**: Individual review display

**Props**:
```typescript
{
  review: {
    userName: string
    avatar: string
    rating: number
    text: string
    date: Date
  }
}
```

**Behavior**:
- Shows user avatar (gradient circle with emoji)
- Displays star rating, name, and review text
- Staggered entrance when scrolling

### Booking Components

#### ConfirmationRing Component
**Purpose**: Animated success indicator

**Props**: None

**State**: `isAnimating: boolean`

**Behavior**:
- Glassmorphic ring with checkmark icon
- Pop animation on mount (scale 0 → 1 with bounce easing)
- Pulse animation after initial pop (continuous)
- Duration: 600ms pop, then 2s pulse loop

#### BookingSummary Component
**Purpose**: Glassmorphic card with booking details

**Props**:
```typescript
{
  booking: {
    artistName: string
    service: string
    date: Date
    time: string
    location: string
    totalPaid: number
  }
}
```

**Behavior**:
- Displays all booking information in rows
- Each row has icon, label, and value
- Glassmorphic styling (backdrop blur, semi-transparent background)
- Fade up entrance animation with delay

### Shared UI Components

#### Button Component
**Purpose**: Reusable button with variants

**Props**:
```typescript
{
  variant: 'primary' | 'secondary' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}
```

**Variants**:
- Primary: Gradient rose background, white text
- Secondary: White background, rose text, rose border
- Ghost: Transparent background, rose text

**Behavior**:
- Scale animation on tap (0.97x)
- Disabled state: reduced opacity, no interaction
- Hover effect on desktop: lift (translateY -2px)

#### Badge Component
**Purpose**: Contextual label/tag

**Props**:
```typescript
{
  variant: 'top-pick' | 'new' | 'certified'
  text: string
}
```

**Behavior**:
- Small rounded pill with icon + text
- Different colors per variant
- Semi-transparent background

#### SectionHeader Component
**Purpose**: Section title with optional "See all" link

**Props**:
```typescript
{
  title: string
  seeAllText?: string
  onSeeAll?: () => void
}
```

**Behavior**:
- Title uses Cormorant Garamond (display font)
- "See all" link in rose-deep color, tappable

## Data Models

### Artist Model
```typescript
interface Artist {
  id: string
  name: string
  avatar: string  // Emoji character or gradient identifier
  specialties: string[]  // e.g., ["Bridal", "Editorial"]
  rating: number  // 0-5 with one decimal
  reviewCount: number
  distance: number  // kilometers from user
  startingPrice: number  // INR
  badge?: 'Top Pick' | 'New'
  certification: string  // e.g., "Certified Makeup Artist"
  location: string  // e.g., "Mumbai"
  experience: number  // years
  bookingCount: number  // total bookings
  services: Service[]
  availability: Availability
  reviews: Review[]
}
```

### Service Model
```typescript
interface Service {
  id: string
  name: string  // "Bridal", "Editorial", "Evening", "Natural", "Glam"
  icon: string  // Emoji
  price: number  // INR
  duration?: number  // minutes (optional for MVP)
}
```

### Availability Model
```typescript
interface Availability {
  dates: Array<{
    date: Date
    slots: TimeSlot[]
  }>
}

interface TimeSlot {
  time: string  // "09:00 AM", "10:30 AM", etc.
  available: boolean
}
```

### Review Model
```typescript
interface Review {
  id: string
  userName: string
  avatar: string  // Emoji
  rating: number  // 1-5
  text: string
  date: Date
}
```

### Booking Model (for confirmation screen)
```typescript
interface Booking {
  id: string
  artistId: string
  artistName: string
  service: string
  date: Date
  time: string
  location: string
  totalPaid: number
  status: 'confirmed' | 'pending' | 'cancelled'
}
```

### Demo Data Structure

Demo data will include 6 artists with full profiles:

1. **Aria Mehra** - Bridal · Editorial · Glam - ₹2,499 - ⭐ 4.9 (218)
2. **Sia Kapoor** - Natural · Skincare · Evening - ₹1,799 - ⭐ 4.8 (164)
3. **Riya Sen** - Glam · Fantasy · Bold - ₹2,999 - ⭐ 4.7 (89)
4. **Ananya Patel** - Bridal · Traditional - ₹3,499 - ⭐ 4.9 (312)
5. **Kavya Sharma** - Editorial · Runway - ₹2,799 - ⭐ 4.6 (145)
6. **Diya Iyer** - Natural · Everyday · Evening - ₹1,499 - ⭐ 4.8 (203)

Each artist has:
- 4-5 services with prices
- 7-day availability calendar
- 9-12 time slots per day (some marked as taken)
- 3-5 reviews with ratings and text


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining correctness properties, let me analyze each acceptance criterion for testability:

### Acceptance Criteria Testing Prework


### Converting EARS to Properties

Based on the prework analysis and property reflection, here are the testable correctness properties:

**Property 1: Time-appropriate greeting**
*For any* time of day, the home screen greeting should display "Good morning", "Good afternoon", or "Good evening" based on the hour (morning: 5-11, afternoon: 12-17, evening: 18-4)
**Validates: Requirements 2.1**

**Property 2: Filtering completeness**
*For any* filter criteria (search text, category, or advanced filters) and any set of artists, all displayed artists should match the filter criteria and all artists matching the criteria should be displayed
**Validates: Requirements 3.1, 4.3, 13.2**

**Property 3: Selection state consistency**
*For any* selectable UI element (category chip, service card, date chip, or time slot), clicking it should apply active visual styling and clicking a different element should transfer the active state
**Validates: Requirements 4.2, 7.2, 8.4**

**Property 4: Category filtering correctness**
*For any* selected service category (except "All"), all displayed artists should offer that service type in their specialties list
**Validates: Requirements 4.3**

**Property 5: Component data completeness**
*For any* component rendering data (artist card, service card, or review card), the rendered output should contain all required fields (artist cards: name, specialties, rating, reviews, distance, price; service cards: icon, name, price; review cards: avatar, name, rating, text)
**Validates: Requirements 5.1, 7.1, 9.1**

**Property 6: Badge conditional rendering**
*For any* artist with a badge property set to "Top Pick" or "New", the artist card should display that badge; for any artist without a badge property, no badge should display
**Validates: Requirements 5.2**

**Property 7: Navigation correctness**
*For any* clickable navigation element (artist card, bottom nav tab, or profile menu item), clicking it should navigate to the correct route matching that element's target
**Validates: Requirements 5.4, 11.2, 14.3**

**Property 8: Favorite toggle behavior**
*For any* artist, clicking the heart icon should toggle the favorite state (favorited → unfavorited, or unfavorited → favorited)
**Validates: Requirements 6.4, 12.1**

**Property 9: Service price display sync**
*For any* selected service on the artist detail page, the "Confirm Booking" button text should display that service's price
**Validates: Requirements 7.3**

**Property 10: Date selection updates slots**
*For any* date selected in the date picker, the time slot grid should display only the time slots for that specific date with correct availability status
**Validates: Requirements 8.2**

**Property 11: Taken slot non-selectability**
*For any* time slot marked as taken (available: false), clicking it should not change its state to selected
**Validates: Requirements 8.5**

**Property 12: Review sorting correctness**
*For any* list of reviews, they should be displayed in descending order by either date (most recent first) or rating (highest first)
**Validates: Requirements 9.3**

**Property 13: Booking button enable state**
*For any* booking form state, the "Confirm Booking" button should be enabled if and only if a service, date, and time slot have all been selected
**Validates: Requirements 10.1**

**Property 14: Favorites list synchronization**
*For any* artist favorited or unfavorited, the Saved tab should immediately reflect the change by adding or removing that artist from the displayed list
**Validates: Requirements 12.2, 12.4**

**Property 15: Favorites persistence round-trip**
*For any* artist favorited, refreshing the application or closing and reopening it should restore that artist in the favorites list (localStorage round-trip)
**Validates: Requirements 19.1, 19.2, 19.3**

**Property 16: Selection state persistence**
*For any* filter or category selected, navigating to another page and returning should preserve that selection (unless explicitly cleared)
**Validates: Requirements 22.2**

**Property 17: Demo data completeness**
*For any* artist in the demo data set, the artist object should include all required fields: services array with prices, availability object with 7 days of time slots, and reviews array with at least 3 reviews
**Validates: Requirements 20.2**

**Property 18: Touch target accessibility**
*For any* interactive element (button, link, chip, card), the rendered element's clickable area should be at least 44x44 pixels
**Validates: Requirements 16.3**

**Property 19: Color contrast accessibility**
*For any* body text element, the color contrast ratio between text and background should meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text)
**Validates: Requirements 16.4**


## Error Handling

### Error Categories and Strategies

#### 1. User Input Validation Errors
**Scenario**: User attempts to proceed without completing required fields

**Handling**:
- Display inline error messages near the invalid field
- Disable CTA buttons until validation passes
- Use toast notifications for form-level errors
- Examples:
  - Booking without service selection: "Please select a service to continue"
  - Booking without date/time: "Please select a date and time for your appointment"
  - Empty search with no results: "No artists match your search. Try different keywords."

**Implementation**:
```javascript
const validateBookingForm = ({ service, date, timeSlot }) => {
  const errors = [];
  if (!service) errors.push({ field: 'service', message: 'Please select a service' });
  if (!date) errors.push({ field: 'date', message: 'Please select a date' });
  if (!timeSlot) errors.push({ field: 'timeSlot', message: 'Please select a time' });
  return errors;
};
```

#### 2. Data Loading Errors
**Scenario**: Demo data fails to load or parse

**Handling**:
- Show skeleton loading states initially
- If loading fails after timeout (3 seconds), display error state with retry button
- Graceful degradation: show partial data if some loads successfully
- Example: "Unable to load artists. Please try again."

**Implementation**:
- Error boundary component wraps main content areas
- Fallback UI with retry action
- Log errors to console for debugging (no external logging in MVP)

#### 3. Navigation Errors
**Scenario**: User navigates to non-existent route or artist ID

**Handling**:
- 404 page with branded styling
- "Back to Home" CTA button
- Automatic redirect after 5 seconds
- Example: "Artist not found. Redirecting to home..."

**Implementation**:
```javascript
<Route path="*" element={<NotFound />} />
```

#### 4. Browser Storage Errors
**Scenario**: localStorage unavailable or quota exceeded

**Handling**:
- Detect localStorage availability on app init
- If unavailable, use in-memory fallback for favorites
- Show warning: "Favorites won't persist. Enable browser storage for full experience."
- Gracefully handle quota exceeded when saving

**Implementation**:
```javascript
const storageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};
```

#### 5. Unexpected Runtime Errors
**Scenario**: JavaScript errors, component crashes

**Handling**:
- React Error Boundary catches component errors
- Display friendly error page: "Something went wrong. We're working on it."
- Preserve user state when possible
- Provide "Refresh" and "Back to Home" options

**Implementation**:
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

### Error Message Design Principles

1. **User-Friendly Language**: Avoid technical jargon
2. **Actionable**: Always provide next steps or recovery options
3. **Brand-Consistent**: Use Lume's elegant, warm tone even in errors
4. **Clear**: State what happened and what the user should do
5. **Non-Blocking**: Use toasts or inline messages where possible, not modal dialogs

### Error State Components

**Toast Notification Component**:
- Appears at top of screen
- Auto-dismisses after 4 seconds
- Variants: error (rose-deep), warning (gold), success (rose), info (champagne)
- Swipeable to dismiss

**Empty State Component**:
- Used when lists/results are empty
- Shows elegant illustration or icon
- Encouraging message with CTA
- Examples: Empty favorites, no search results, no bookings

## Testing Strategy

### Dual Testing Approach

The Lume application will use **both unit tests and property-based tests** for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property-based tests**: Verify universal properties across all inputs
- Together these provide strong confidence in correctness

### Property-Based Testing Configuration

**Library**: We'll use `@fast-check/jest` for React property-based testing

**Configuration**:
- Minimum 100 iterations per property test (to handle randomization effectively)
- Each test references its design document property
- Tag format: `// Feature: lume-beauty-booking-app, Property {number}: {property text}`

**Example Property Test**:
```javascript
import fc from 'fast-check';

// Feature: lume-beauty-booking-app, Property 2: Filtering completeness
test('filtered artists match criteria and all matching artists are shown', () => {
  fc.assert(
    fc.property(
      fc.array(artistArbitrary), // Generate random artist arrays
      fc.oneof(fc.constant('Bridal'), fc.constant('Editorial'), fc.constant('Natural')),
      (artists, category) => {
        const filtered = filterArtistsByCategory(artists, category);
        const expected = artists.filter(a => a.specialties.includes(category));
        
        // All displayed artists match filter
        expect(filtered.every(a => a.specialties.includes(category))).toBe(true);
        // All matching artists are displayed
        expect(filtered.length).toBe(expected.length);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Focus Areas for Unit Tests**:
1. **Specific Examples**: Concrete test cases for critical paths
   - Booking flow with specific artist, service, date, time
   - Search for specific artist name
   - Favoriting specific artist and viewing in Saved tab

2. **Edge Cases**: Boundary conditions and special cases
   - Empty search results
   - Empty favorites list
   - Artist with no reviews
   - All time slots taken for a date
   - Last day in date picker strip

3. **Error Conditions**: Validation and error handling
   - Booking without service selected
   - Booking without date/time selected
   - localStorage unavailable
   - Invalid artist ID in URL

4. **Integration Points**: Component interactions
   - Date selection updates time slots
   - Service selection updates booking button price
   - Category filter updates artist list
   - Bottom nav highlights active tab

**Testing Library Stack**:
- **Framework**: Jest (included with Vite React template)
- **React Testing**: React Testing Library for component tests
- **User Interactions**: @testing-library/user-event for simulating user actions
- **Mocking**: Jest mocks for localStorage, timers, navigation
- **Coverage**: Jest coverage reporting (target: 80%+ for critical paths)

### Test Organization

```
src/
├── components/
│   ├── home/
│   │   ├── ArtistCard.jsx
│   │   ├── ArtistCard.test.jsx          # Unit tests
│   │   ├── CategoryChips.jsx
│   │   └── CategoryChips.test.jsx
│   └── ...
├── utils/
│   ├── filters.js
│   ├── filters.test.js                  # Unit tests
│   └── filters.property.test.js         # Property tests
└── __tests__/
    ├── integration/
    │   ├── booking-flow.test.jsx        # End-to-end user flows
    │   └── navigation.test.jsx
    └── properties/
        ├── filtering.property.test.js    # Property tests by domain
        ├── favorites.property.test.js
        └── rendering.property.test.js
```

### Property-Based Test Coverage

Each correctness property from the design document will be implemented as a property-based test:

| Property | Test File | Generator Needs |
|----------|-----------|-----------------|
| 1. Time-appropriate greeting | `properties/greeting.property.test.js` | Random hours (0-23) |
| 2. Filtering completeness | `properties/filtering.property.test.js` | Random artist arrays, search terms |
| 3. Selection state consistency | `properties/selection.property.test.js` | Random UI element types |
| 4. Category filtering correctness | `properties/filtering.property.test.js` | Random categories, artist sets |
| 5. Component data completeness | `properties/rendering.property.test.js` | Random artist/service/review data |
| 6. Badge conditional rendering | `properties/rendering.property.test.js` | Artists with/without badges |
| 7. Navigation correctness | `properties/navigation.property.test.js` | Random navigation targets |
| 8. Favorite toggle behavior | `properties/favorites.property.test.js` | Random artist IDs, initial states |
| 9. Service price display sync | `properties/booking.property.test.js` | Random services with prices |
| 10. Date selection updates slots | `properties/booking.property.test.js` | Random dates, availability data |
| 11. Taken slot non-selectability | `properties/booking.property.test.js` | Random slot states |
| 12. Review sorting correctness | `properties/rendering.property.test.js` | Random review arrays |
| 13. Booking button enable state | `properties/booking.property.test.js` | Random form states |
| 14. Favorites list synchronization | `properties/favorites.property.test.js` | Random add/remove operations |
| 15. Favorites persistence round-trip | `properties/favorites.property.test.js` | Random favorite sets |
| 16. Selection state persistence | `properties/state.property.test.js` | Random navigation sequences |
| 17. Demo data completeness | `properties/data.property.test.js` | Demo data validation |
| 18. Touch target accessibility | `properties/accessibility.property.test.js` | Random interactive elements |
| 19. Color contrast accessibility | `properties/accessibility.property.test.js` | All text/background combinations |

### Test Execution Strategy

**Development Workflow**:
```bash
npm run test              # Run all tests in watch mode
npm run test:unit         # Run unit tests only
npm run test:property     # Run property tests only
npm run test:coverage     # Generate coverage report
```

**CI/CD Pipeline** (future):
1. Run unit tests on every commit
2. Run property tests on pull requests
3. Generate coverage report
4. Block merge if tests fail or coverage drops below 80%

### Manual Testing Checklist

While automated tests cover logic and properties, manual testing validates the complete user experience:

**Visual & Interactive Testing**:
- [ ] Splash screen animations play smoothly
- [ ] Page transitions feel premium (not janky)
- [ ] Touch targets are easy to tap on mobile
- [ ] Scrolling is smooth (no frame drops)
- [ ] Colors match brand palette exactly
- [ ] Fonts render correctly (Cormorant Garamond, DM Sans)
- [ ] Glassmorphism effects work on all backgrounds
- [ ] Loading skeletons animate properly

**Cross-Browser Testing**:
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile
- [ ] Edge Mobile

**Responsive Testing**:
- [ ] iPhone SE (375px) - mobile layout
- [ ] iPhone 12 Pro (390px) - mobile layout
- [ ] iPad Mini (768px) - tablet layout
- [ ] iPad Pro (1024px) - desktop layout
- [ ] Desktop (1440px) - centered app shell

**User Flow Testing**:
- [ ] Complete booking flow: Splash → Home → Artist Detail → Booking Confirm → Home
- [ ] Search for artist by name
- [ ] Filter by category
- [ ] Favorite an artist, view in Saved tab, unfavorite
- [ ] Navigate all bottom nav tabs
- [ ] Test back button navigation
- [ ] Verify localStorage persistence (close browser, reopen)

**Accessibility Testing**:
- [ ] All text meets WCAG AA contrast (use Chrome DevTools)
- [ ] Touch targets are minimum 44x44px (use browser inspector)
- [ ] App works with browser zoom at 200%
- [ ] Focus indicators visible on keyboard navigation
- [ ] Screen reader can announce major UI elements (basic test)

**Performance Validation**:
- [ ] Home screen loads < 2 seconds on 4G
- [ ] Artist detail loads < 1.5 seconds on 4G
- [ ] Page transitions feel instant (< 300ms perceived)
- [ ] No layout shifts during loading
- [ ] Images load progressively with placeholders

### Success Criteria

Tests should pass with the following goals:

✅ **Code Coverage**: Minimum 80% line coverage for critical paths (booking, search, favorites)
✅ **Property Tests**: All 19 properties pass with 100 iterations each
✅ **Unit Tests**: All edge cases and error conditions covered
✅ **Integration Tests**: Complete user flows work end-to-end
✅ **Manual Testing**: All checklist items pass on target devices/browsers

### Testing Anti-Patterns to Avoid

❌ **Don't**: Write too many unit tests for behavior covered by properties
✅ **Do**: Use unit tests for specific examples and edge cases, properties for general rules

❌ **Don't**: Test implementation details (internal state, private methods)
✅ **Do**: Test user-facing behavior (what users see and interact with)

❌ **Don't**: Mock everything (makes tests brittle)
✅ **Do**: Mock external dependencies only (localStorage, timers, network in future)

❌ **Don't**: Write flaky tests that randomly fail
✅ **Do**: Use deterministic data and proper async handling

This testing strategy ensures comprehensive validation while keeping tests maintainable and focused on correctness properties that matter to users.
