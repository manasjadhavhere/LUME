# Implementation Plan: Lume Beauty Booking App

## Overview

This implementation plan breaks down the Lume beauty booking application into discrete coding tasks. The application is a React-based progressive web app using Vite, React Router, TypeScript, vanilla CSS, Lucide React icons, and Framer Motion for animations. Tasks are ordered to build incrementally from foundation to full features.

## Tasks

- [x] 1. Initialize project structure and dependencies
  - Create Vite React TypeScript project
  - Install dependencies: react-router-dom, lucide-react, framer-motion
  - Configure Vite for optimal build settings
  - Set up folder structure (components, pages, hooks, data, styles, assets)
  - Add Google Fonts link for Cormorant Garamond and DM Sans
  - _Requirements: 23.1_

- [x] 2. Create global styles and design system
  - Create CSS variables for brand color palette (Rose, Deep Rose, Champagne, Cream, etc.)
  - Define typography styles (Cormorant Garamond for display, DM Sans for body)
  - Add CSS reset and base styles
  - Create animation keyframes (fadeUp, orbFloat, shimmer, ringPop, ringPulse)
  - Define utility classes for common patterns
  - _Requirements: 16.1, 16.2, 18.1, 18.3, 18.4_

- [x] 3. Create demo data structure
  - [x] 3.1 Define TypeScript interfaces for Artist, Service, Review, Availability, TimeSlot, Booking
    - Create type definitions matching design document data models
    - _Requirements: 20.1, 20.2_
  
  - [x] 3.2 Create demo data with 6 complete artist profiles
    - Generate artists: Aria Mehra, Sia Kapoor, Riya Sen, Ananya Patel, Kavya Sharma, Diya Iyer
    - Include services with prices, 7-day availability, time slots, and 3+ reviews per artist
    - Use gradient identifiers and emojis for avatars
    - _Requirements: 20.1, 20.2_
  
  - [ ]* 3.3 Write property test for demo data completeness
    - **Property 17: Demo data completeness**
    - **Validates: Requirements 20.2**

- [x] 4. Set up routing structure and app shell
  - [x] 4.1 Create App.jsx with React Router configuration
    - Define routes: /, /home, /artist/:id, /booking/confirm, /discover, /saved, /profile
    - Implement route-based page rendering
    - _Requirements: 1.3, 5.4_
  
  - [x] 4.2 Create PageTransition wrapper component with Framer Motion
    - Implement fade + slide animations with cubic-bezier easing
    - Support left/right slide directions
    - _Requirements: 11.3, 18.1_
  
  - [x] 4.3 Create BottomNav component
    - Render 4 navigation tabs: Home, Discover, Saved, Profile with icons
    - Highlight active tab based on current route
    - Handle navigation on tap with scale animation
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 4.4 Write property test for navigation correctness
    - **Property 7: Navigation correctness**
    - **Validates: Requirements 5.4, 11.2, 14.3**

- [x] 5. Implement shared UI components
  - [x] 5.1 Create Button component with variants (primary, secondary, ghost)
    - Support different sizes (sm, md, lg)
    - Implement scale animation on tap
    - Handle disabled state
    - _Requirements: 25.2_
  
  - [x] 5.2 Create Badge component with variants (top-pick, new, certified)
    - Render small rounded pill with appropriate styling per variant
    - _Requirements: 5.2_
  
  - [x] 5.3 Create SectionHeader component
    - Display title in Cormorant Garamond font
    - Optional "See all" link with onClick handler
    - _Requirements: 5.3_
  
  - [ ]* 5.4 Write property test for touch target accessibility
    - **Property 18: Touch target accessibility**
    - **Validates: Requirements 16.3**

- [x] 6. Build Splash screen
  - [x] 6.1 Create SplashPage component
    - Implement gradient background with animated orbs
    - Display Lume logo with glassmorphic container and pulse animation
    - Show brand title, subtitle, tagline, and CTA button
    - Add pagination dots indicator
    - _Requirements: 1.1, 1.2_
  
  - [x] 6.2 Implement auto-navigation after 5 seconds or button click
    - Use setTimeout to trigger navigation to /home
    - Clear timeout if user clicks button first
    - _Requirements: 1.3_
  
  - [ ]* 6.3 Write unit test for splash navigation
    - Test button click navigates to /home
    - Test auto-navigation after 5 seconds with timer mocking
    - _Requirements: 1.3_

- [x] 7. Create custom hooks for shared logic
  - [x] 7.1 Create useGreeting hook
    - Return time-appropriate greeting based on current hour
    - Handle morning (5-11), afternoon (12-17), evening (18-4)
    - _Requirements: 2.1_
  
  - [x] 7.2 Create useLocalStorage hook
    - Manage localStorage with get/set/remove operations
    - Handle storage unavailable gracefully (fallback to memory)
    - Sync state with localStorage changes
    - _Requirements: 19.1, 19.2, 19.3_
  
  - [ ]* 7.3 Write property test for time-appropriate greeting
    - **Property 1: Time-appropriate greeting**
    - **Validates: Requirements 2.1**
  
  - [x]* 7.4 Write property test for favorites persistence round-trip
    - **Property 15: Favorites persistence round-trip**
    - **Validates: Requirements 19.1, 19.2, 19.3**

- [x] 8. Build Home screen components
  - [x] 8.1 Create SearchBar component
    - Render search icon, input field, and filter button
    - Implement controlled input with onChange handler
    - Add debouncing to avoid excessive filtering (300ms delay)
    - _Requirements: 3.1, 3.2_
  
  - [x] 8.2 Create HeroBanner component
    - Display gradient background with decorative symbols
    - Show promo text, title, and CTA button
    - Implement fade-up entrance animation
    - _Requirements: 2.3_
  
  - [x] 8.3 Create CategoryChips component
    - Render horizontally scrollable chips with icons and labels
    - Handle active chip selection with gradient background
    - Implement staggered entrance animations
    - _Requirements: 4.1, 4.2_
  
  - [x] 8.4 Create ArtistCard component
    - Display artist avatar (gradient + emoji), name, specialties, rating, reviews, distance, price
    - Show optional badge (Top Pick, New)
    - Implement tap scale animation and onClick navigation
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 8.5 Write property test for component data completeness
    - **Property 5: Component data completeness**
    - **Validates: Requirements 5.1, 7.1, 9.1**
  
  - [ ]* 8.6 Write property test for badge conditional rendering
    - **Property 6: Badge conditional rendering**
    - **Validates: Requirements 5.2**

- [x] 9. Implement HomePage with filtering logic
  - [x] 9.1 Create HomePage component
    - Display personalized greeting using useGreeting hook
    - Render notification bell with badge
    - Show SearchBar, HeroBanner, CategoryChips, and artist list
    - Implement search and category filtering logic
    - Handle empty search results state
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.3, 4.3, 4.4, 5.1_
  
  - [ ]* 9.2 Write property test for filtering completeness
    - **Property 2: Filtering completeness**
    - **Validates: Requirements 3.1, 4.3, 13.2**
  
  - [ ]* 9.3 Write property test for category filtering correctness
    - **Property 4: Category filtering correctness**
    - **Validates: Requirements 4.3**
  
  - [ ]* 9.4 Write unit test for empty search results
    - Test that empty state message displays when no artists match search
    - _Requirements: 3.3_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 11. Build Artist Detail screen components
  - [x] 11.1 Create ArtistHero component
    - Render 300px hero with gradient background and large emoji avatar
    - Display back button and favorite heart toggle button
    - Implement gradient overlay for text legibility
    - _Requirements: 6.1, 6.3, 6.4_
  
  - [x] 11.2 Create StatsBar component
    - Display 4-column statistics: rating, reviews, experience, bookings
    - Use Cormorant Garamond for stat values
    - Add divider borders between columns
    - _Requirements: 6.2_
  
  - [x] 11.3 Create ServiceSelector component
    - Render horizontally scrollable service cards with icon, name, price
    - Highlight selected service with gradient background
    - Handle service selection with onClick
    - _Requirements: 7.1, 7.2_
  
  - [x] 11.4 Create DatePicker component
    - Generate next 7 days from current date
    - Display horizontally scrollable date chips
    - Highlight selected date with deep rose background
    - _Requirements: 8.1, 8.2_
  
  - [x] 11.5 Create TimeSlotGrid component
    - Render 3-column grid of time slots
    - Display Available, Selected, and Taken states with appropriate styling
    - Prevent selection of taken slots
    - _Requirements: 8.3, 8.4, 8.5_
  
  - [x] 11.6 Create ReviewCard component
    - Display user avatar (gradient + emoji), name, star rating, review text
    - Implement staggered entrance animation
    - _Requirements: 9.1_
  
  - [ ]* 11.7 Write property test for selection state consistency
    - **Property 3: Selection state consistency**
    - **Validates: Requirements 4.2, 7.2, 8.4**
  
  - [ ]* 11.8 Write property test for taken slot non-selectability
    - **Property 11: Taken slot non-selectability**
    - **Validates: Requirements 8.5**

- [x] 12. Implement ArtistDetailPage with booking logic
  - [x] 12.1 Create ArtistDetailPage component
    - Load artist data by ID from URL params
    - Manage state for selected service, date, and time slot
    - Implement favorite toggle with localStorage persistence
    - Update booking button with selected service price
    - Enable booking button only when all selections are made
    - Navigate to booking confirmation on button click
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.2, 7.3, 8.2, 10.1, 10.2_
  
  - [x] 12.2 Write property test for favorite toggle behavior
    - **Property 8: Favorite toggle behavior**
    - **Validates: Requirements 6.4, 12.1**
  
  - [x] 12.3 Write property test for service price display sync
    - **Property 9: Service price display sync**
    - **Validates: Requirements 7.3**
  
  - [x] 12.4 Write property test for date selection updates slots
    - **Property 10: Date selection updates slots**
    - **Validates: Requirements 8.2**
  
  - [x] 12.5 Write property test for booking button enable state
    - **Property 13: Booking button enable state**
    - **Validates: Requirements 10.1**
  
  - [x] 12.6 Write unit tests for booking validation errors
    - Test error message when attempting to book without service
    - Test error message when attempting to book without date/time
    - _Requirements: 21.1, 21.2_

- [x] 13. Build Booking Confirmation screen
  - [x] 13.1 Create ConfirmationRing component
    - Render glassmorphic ring with checkmark icon
    - Implement pop animation on mount with bounce easing
    - Add continuous pulse animation after initial pop
    - _Requirements: 10.3, 18.4_
  
  - [x] 13.2 Create BookingSummary component
    - Display glassmorphic card with booking details
    - Show artist, service, date & time, location, total paid in rows
    - Implement fade-up entrance animation with delay
    - _Requirements: 10.4_
  
  - [x] 13.3 Create BookingConfirmPage component
    - Display gradient background matching splash screen
    - Render ConfirmationRing and BookingSummary with booking data
    - Show "Back to Home" button with navigation handler
    - Reset booking state when navigating home
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 22.3_
  
  - [ ]* 13.4 Write unit test for booking state reset
    - Test that returning home from confirmation resets booking selection
    - _Requirements: 22.3_

- [x] 14. Implement favorites functionality
  - [x] 14.1 Create useFavorites hook
    - Manage favorites list with localStorage persistence
    - Provide addFavorite, removeFavorite, isFavorite, getFavorites functions
    - Handle localStorage unavailable with in-memory fallback
    - _Requirements: 12.1, 12.2, 12.4, 19.1, 19.2_
  
  - [x] 14.2 Create SavedPage component
    - Display all favorited artists using ArtistCard component
    - Show empty state when no favorites exist
    - Update list immediately when artist is unfavorited
    - _Requirements: 12.2, 12.3, 12.4_
  
  - [ ]* 14.3 Write property test for favorites list synchronization
    - **Property 14: Favorites list synchronization**
    - **Validates: Requirements 12.2, 12.4**
  
  - [ ]* 14.4 Write unit test for empty favorites state
    - Test empty state message displays when no favorites
    - _Requirements: 12.3_

- [x] 15. Create Discover and Profile placeholder pages
  - [x] 15.1 Create DiscoverPage component
    - Display full-screen search interface with filter controls
    - Show all artists in grid layout
    - Implement filter logic similar to home page
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [x] 15.2 Create ProfilePage component
    - Display user avatar, name, and location
    - Show menu items: My Bookings, Payment Methods, Settings, Help, Logout
    - Handle menu item clicks with navigation
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 15.3 Write property test for discover filtering
    - Test that discover filters work correctly (covered by Property 2)
    - **Validates: Requirements 13.2**

- [x] 16. Implement responsive design breakpoints
  - [x] 16.1 Add mobile styles (≤480px)
    - Single-column layouts with full-bleed cards
    - Optimize padding and spacing for small screens
    - _Requirements: 17.1_
  
  - [x] 16.2 Add tablet styles (481-768px)
    - Centered content with max-width
    - 2-column artist grids
    - _Requirements: 17.2_
  
  - [x] 16.3 Add desktop styles (≥769px)
    - Centered app shell (max 480px) or full-width layout
    - Appropriate spacing and hover states
    - _Requirements: 17.3_
  
  - [ ]* 16.4 Write unit tests for responsive layouts
    - Test mobile layout renders at 375px
    - Test tablet layout renders at 768px
    - Test desktop layout renders at 1024px
    - _Requirements: 17.1, 17.2, 17.3_

- [x] 17. Implement state persistence and error handling
  - [x] 17.1 Add scroll position persistence
    - Save scroll position when navigating away from home
    - Restore scroll position when returning to home
    - _Requirements: 22.1_
  
  - [x] 17.2 Add filter/selection state persistence
    - Maintain category and filter selections until explicitly changed
    - _Requirements: 22.2_
  
  - [x] 17.3 Create ErrorBoundary component
    - Catch component errors and display fallback UI
    - Provide "Refresh" and "Back to Home" options
    - Log errors to console for debugging
    - _Requirements: 21.3_
  
  - [x] 17.4 Create NotFound component for 404 errors
    - Display branded 404 page with "Back to Home" button
    - Implement auto-redirect after 5 seconds
    - _Requirements: Navigation errors_
  
  - [x] 17.5 Add toast notification system
    - Create Toast component with variants (error, warning, success, info)
    - Implement auto-dismiss after 4 seconds
    - Make swipeable to dismiss
    - _Requirements: Error messaging_
  
  - [ ]* 17.6 Write property test for selection state persistence
    - **Property 16: Selection state persistence**
    - **Validates: Requirements 22.2**
  
  - [ ]* 17.7 Write unit test for scroll position preservation
    - Test scroll position restored when returning to home
    - _Requirements: 22.1_
  
  - [ ]* 17.8 Write unit test for error boundary
    - Test error boundary displays fallback UI on component error
    - _Requirements: 21.3_

- [x] 18. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Add loading states and skeletons
  - [x] 19.1 Create skeleton loader components
    - ArtistCardSkeleton with shimmer animation
    - ServiceCardSkeleton with shimmer animation
    - _Requirements: 24.1_
  
  - [x] 19.2 Add loading states to pages
    - Show skeletons while data loads
    - Display gradient placeholders for images during loading
    - _Requirements: 24.1, 24.3_
  
  - [ ]* 19.3 Write unit tests for loading states
    - Test skeletons display during loading
    - Test placeholders display for images
    - _Requirements: 24.1, 24.3_

- [x] 20. Implement accessibility improvements
  - [x] 20.1 Add ARIA labels to interactive elements
    - Label all buttons, links, inputs with descriptive text
    - Add role attributes where appropriate
    - _Requirements: Accessibility best practices_
  
  - [x] 20.2 Add keyboard navigation support
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
    - Implement logical tab order
    - _Requirements: Accessibility best practices_
  
  - [x] 20.3 Verify color contrast meets WCAG AA
    - Check all text/background combinations
    - Adjust colors if contrast ratio < 4.5:1 for normal text
    - _Requirements: 16.4_
  
  - [ ]* 20.4 Write property test for color contrast accessibility
    - **Property 19: Color contrast accessibility**
    - **Validates: Requirements 16.4**

- [x] 21. Add review sorting functionality
  - [x] 21.1 Implement review sorting logic
    - Sort reviews by date (most recent first) or rating (highest first)
    - Add sort selector to reviews section (optional)
    - _Requirements: 9.3_
  
  - [ ]* 21.2 Write property test for review sorting correctness
    - **Property 12: Review sorting correctness**
    - **Validates: Requirements 9.3**

- [x] 22. Optimize performance and build
  - [x] 22.1 Add code splitting for routes
    - Use React.lazy and Suspense for route-based code splitting
    - Reduce initial bundle size
    - _Requirements: 15.1, 15.2_
  
  - [x] 22.2 Optimize images and assets
    - Use appropriate image formats and sizes
    - Implement lazy loading for images
    - _Requirements: 15.1_
  
  - [x] 22.3 Configure Vite for production build
    - Enable minification and tree-shaking
    - Set up proper asset handling
    - Configure base URL for deployment
    - _Requirements: Build optimization_
  
  - [x] 22.4 Add service worker for PWA capabilities (optional)
    - Cache static assets for offline support
    - Implement install prompt (future enhancement)
    - _Requirements: PWA readiness_

- [x] 23. Final integration and polish
  - [x] 23.1 Wire all components together
    - Ensure seamless navigation between all screens
    - Verify data flows correctly from pages to components
    - Test all user interactions end-to-end
    - _Requirements: All_
  
  - [x] 23.2 Add touch interaction feedback
    - Ensure all taps provide immediate visual feedback (<100ms)
    - Verify scale animations on buttons and cards
    - Test smooth momentum scrolling on chips and cards
    - _Requirements: 25.1, 25.2, 25.3_
  
  - [x] 23.3 Final visual polish
    - Verify all animations are smooth and premium-feeling
    - Check spacing, alignment, and typography across all screens
    - Ensure color palette consistency
    - Test glassmorphism and gradient effects
    - _Requirements: 1.2, 18.1, 18.2, 18.3, 18.4_
  
  - [ ]* 23.4 Write integration test for complete booking flow
    - Test user journey: Splash → Home → Artist Detail → Confirm → Home
    - _Requirements: All booking flow requirements_

- [x] 24. Create documentation
  - [x] 24.1 Write README.md
    - Project overview and tech stack
    - Setup instructions (npm install, npm run dev)
    - Available scripts and commands
    - Folder structure explanation
    - _Requirements: Documentation_
  
  - [x] 24.2 Write BACKEND_INTEGRATION.md
    - API endpoints to replace demo data
    - Authentication strategy recommendations
    - Payment gateway integration guide (Razorpay)
    - Capacitor setup instructions for mobile app
    - _Requirements: Backend preparation_

- [x] 25. Final checkpoint - Ensure all tests pass and app is production-ready
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across many generated inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation builds incrementally: foundation → core features → polish → documentation
