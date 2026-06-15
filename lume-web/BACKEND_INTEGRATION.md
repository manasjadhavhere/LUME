# Backend Integration Guide

This document provides a comprehensive guide for integrating the Lume frontend application with a backend API, including authentication, payment processing, and mobile app deployment.

## 📋 Table of Contents

1. [API Endpoints](#-api-endpoints)
2. [Authentication Strategy](#-authentication-strategy)
3. [Payment Gateway Integration](#-payment-gateway-integration)
4. [Capacitor Mobile App Setup](#-capacitor-mobile-app-setup)
5. [Data Migration](#-data-migration)
6. [Error Handling](#-error-handling)
7. [Performance Considerations](#-performance-considerations)
8. [Security Best Practices](#-security-best-practices)

## 🚀 API Endpoints

### Base URL Structure
```
Production: https://api.lume.app/v1
Staging: https://staging-api.lume.app/v1
Development: http://localhost:3001/v1
```

### Authentication Endpoints

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+919876543210",
  "password": "securePassword123",
  "location": {
    "city": "Mumbai",
    "area": "Bandra West",
    "coordinates": {
      "lat": 19.0596,
      "lng": 72.8295
    }
  }
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user_123abc",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "+919876543210",
    "verified": false,
    "location": {
      "city": "Mumbai",
      "area": "Bandra West"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 3600
  }
}
```

#### POST `/auth/login`
Authenticate existing user.

**Request Body:**
```json
{
  "email": "priya@example.com",
  "password": "securePassword123"
}
```

#### POST `/auth/logout`
Invalidate current session.

#### POST `/auth/refresh`
Refresh access token using refresh token.

#### POST `/auth/verify-otp`
Verify phone number with OTP.

### Artist Endpoints

#### GET `/artists`
Retrieve paginated list of artists with filtering and search.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 50)
- `category` (string): Service category filter ("Bridal", "Editorial", etc.)
- `search` (string): Search query for artist name or specialty
- `location` (string): City or area filter
- `minRating` (number): Minimum rating filter (1-5)
- `sortBy` (string): Sort field ("rating", "distance", "price", "experience")
- `sortOrder` (string): Sort direction ("asc", "desc")
- `userLat` (number): User latitude for distance calculation
- `userLng` (number): User longitude for distance calculation

**Response (200):**
```json
{
  "artists": [
    {
      "id": "artist_aria123",
      "name": "Aria Mehra",
      "avatar": "https://cdn.lume.app/avatars/aria-mehra.jpg",
      "specialties": ["Bridal", "Editorial", "Glam"],
      "rating": 4.9,
      "reviewCount": 218,
      "distance": 2.3,
      "startingPrice": 2499,
      "badge": "Top Pick",
      "certification": "Certified Makeup Artist",
      "location": "Bandra West, Mumbai",
      "experience": 8,
      "bookingCount": 1250,
      "isVerified": true,
      "responseTime": "Usually responds within 1 hour",
      "services": [
        {
          "id": "service_bridal_aria",
          "name": "Bridal",
          "icon": "👰",
          "price": 4999,
          "duration": 180,
          "description": "Complete bridal makeup with trial session"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 97,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "categories": ["All", "Bridal", "Editorial", "Evening", "Natural", "Glam"],
    "locations": ["Mumbai", "Delhi", "Bangalore"],
    "priceRange": { "min": 999, "max": 8999 }
  }
}
```

#### GET `/artists/:id`
Retrieve detailed artist profile.

**Response (200):**
```json
{
  "artist": {
    "id": "artist_aria123",
    "name": "Aria Mehra",
    "avatar": "https://cdn.lume.app/avatars/aria-mehra.jpg",
    "coverImage": "https://cdn.lume.app/covers/aria-mehra-cover.jpg",
    "bio": "Award-winning makeup artist specializing in bridal and editorial looks...",
    "specialties": ["Bridal", "Editorial", "Glam"],
    "rating": 4.9,
    "reviewCount": 218,
    "location": "Bandra West, Mumbai",
    "experience": 8,
    "bookingCount": 1250,
    "certification": "Certified Makeup Artist",
    "badge": "Top Pick",
    "isVerified": true,
    "languages": ["English", "Hindi", "Gujarati"],
    "responseTime": "Usually responds within 1 hour",
    "cancellationPolicy": "Free cancellation up to 24 hours before appointment",
    "portfolio": [
      {
        "id": "portfolio_1",
        "imageUrl": "https://cdn.lume.app/portfolio/aria-1.jpg",
        "category": "Bridal",
        "description": "Traditional Indian bridal look"
      }
    ],
    "services": [...],
    "availability": {
      "dates": [
        {
          "date": "2024-01-20T00:00:00Z",
          "slots": [
            { "time": "09:00", "available": true, "price": 2499 },
            { "time": "10:30", "available": false, "price": 2499 },
            { "time": "14:00", "available": true, "price": 2499 }
          ]
        }
      ]
    },
    "reviews": [
      {
        "id": "review_123",
        "userId": "user_456",
        "userName": "Sneha Patel",
        "userAvatar": "https://cdn.lume.app/avatars/user-456.jpg",
        "rating": 5,
        "text": "Absolutely stunning work! Aria made me feel like a princess...",
        "date": "2024-01-10T14:30:00Z",
        "service": "Bridal",
        "helpful": 12,
        "images": ["https://cdn.lume.app/reviews/review-123-1.jpg"]
      }
    ]
  }
}
```

#### GET `/artists/:id/availability`
Get artist availability for specific date range.

**Query Parameters:**
- `startDate` (date): Start date (ISO format)
- `endDate` (date): End date (ISO format)

### Booking Endpoints

#### POST `/bookings`
Create a new booking.

**Request Body:**
```json
{
  "artistId": "artist_aria123",
  "serviceId": "service_bridal_aria",
  "date": "2024-01-25",
  "time": "10:00",
  "duration": 180,
  "location": {
    "type": "home", // "home" | "salon" | "venue"
    "address": "123 Marine Drive, Mumbai",
    "coordinates": { "lat": 19.0176, "lng": 72.8562 },
    "instructions": "Gate 2, Apartment 5B"
  },
  "specialRequests": "Please bring false eyelashes",
  "totalAmount": 4999,
  "paymentMethodId": "pm_1234567890"
}
```

**Response (201):**
```json
{
  "booking": {
    "id": "booking_789xyz",
    "status": "confirmed", // "pending" | "confirmed" | "cancelled" | "completed"
    "artistId": "artist_aria123",
    "artistName": "Aria Mehra",
    "service": {
      "id": "service_bridal_aria",
      "name": "Bridal",
      "duration": 180
    },
    "date": "2024-01-25",
    "time": "10:00",
    "endTime": "13:00",
    "location": {...},
    "totalAmount": 4999,
    "paymentStatus": "paid",
    "createdAt": "2024-01-15T11:00:00Z",
    "bookingCode": "LM-789XYZ"
  },
  "payment": {
    "id": "payment_456def",
    "amount": 4999,
    "currency": "INR",
    "status": "succeeded",
    "method": "razorpay"
  }
}
```

#### GET `/bookings`
Get user's booking history.

#### GET `/bookings/:id`
Get specific booking details.

#### PUT `/bookings/:id/cancel`
Cancel a booking.

#### PUT `/bookings/:id/reschedule`
Reschedule a booking.

### User Profile Endpoints

#### GET `/users/profile`
Get current user profile.

#### PUT `/users/profile`
Update user profile.

#### GET `/users/favorites`
Get user's favorite artists.

#### POST `/users/favorites/:artistId`
Add artist to favorites.

#### DELETE `/users/favorites/:artistId`
Remove artist from favorites.

### Review Endpoints

#### POST `/reviews`
Create a review for completed booking.

#### GET `/reviews/:bookingId`
Get review for specific booking.

#### PUT `/reviews/:id`
Update existing review.

## 🔐 Authentication Strategy

### JWT Token Management

**Implementation Pattern:**
```typescript
// src/services/auth.ts
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const { user, tokens } = await response.json();
    this.setTokens(tokens);
    return user;
  }

  private setTokens(tokens: TokenResponse) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenExpiry = Date.now() + (tokens.expiresIn * 1000);
    
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('tokenExpiry', this.tokenExpiry.toString());
  }

  async getValidToken(): Promise<string> {
    if (!this.accessToken || this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
    return this.accessToken!;
  }

  private isTokenExpired(): boolean {
    return this.tokenExpiry ? Date.now() >= this.tokenExpiry : true;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token');

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Token refresh failed');
    }

    const tokens = await response.json();
    this.setTokens(tokens);
  }
}
```

### API Client with Authentication

```typescript
// src/services/apiClient.ts
class ApiClient {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/v1';
  private authService = new AuthService();

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.authService.getValidToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        this.authService.logout();
        window.location.href = '/login';
        return Promise.reject(new Error('Authentication required'));
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Convenience methods
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

## 💳 Payment Gateway Integration (Razorpay)

### Razorpay Setup

1. **Install Razorpay SDK:**
```bash
npm install razorpay-web-sdk
```

2. **Environment Variables:**
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_1234567890
REACT_APP_RAZORPAY_KEY_SECRET=your_secret_key
```

3. **Payment Integration:**
```typescript
// src/services/payment.ts
interface PaymentOptions {
  amount: number; // in paise (₹49.99 = 4999)
  currency: string;
  name: string;
  description: string;
  orderId: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}

class PaymentService {
  private razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID!;

  async createOrder(amount: number, currency = 'INR'): Promise<string> {
    const response = await apiClient.post('/payments/create-order', {
      amount: amount * 100, // Convert to paise
      currency,
    });
    return response.orderId;
  }

  async processPayment(options: PaymentOptions): Promise<PaymentResult> {
    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: this.razorpayKeyId,
        amount: options.amount,
        currency: options.currency,
        name: 'Lume Beauty',
        description: options.description,
        order_id: options.orderId,
        prefill: options.prefill,
        theme: {
          color: '#D97A8C' // Deep Rose brand color
        },
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verification = await apiClient.post('/payments/verify', {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              verification,
            });
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          }
        }
      });

      razorpay.open();
    });
  }
}

export const paymentService = new PaymentService();
```

### Booking Flow with Payment

```typescript
// src/hooks/useBooking.ts
export const useBooking = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createBooking = async (bookingData: BookingRequest) => {
    setIsProcessing(true);
    try {
      // 1. Create order on backend
      const orderId = await paymentService.createOrder(bookingData.totalAmount);

      // 2. Process payment
      const paymentResult = await paymentService.processPayment({
        amount: bookingData.totalAmount * 100,
        currency: 'INR',
        name: 'Lume Beauty Booking',
        description: `${bookingData.artistName} - ${bookingData.serviceName}`,
        orderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
      });

      // 3. Create booking with payment confirmation
      const booking = await apiClient.post('/bookings', {
        ...bookingData,
        paymentId: paymentResult.paymentId,
      });

      return booking;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { createBooking, isProcessing };
};
```

## 📱 Capacitor Mobile App Setup

### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init lume-app com.lume.app
```

### 2. Add Platforms

```bash
# iOS
npm install @capacitor/ios
npx cap add ios

# Android
npm install @capacitor/android
npx cap add android
```

### 3. Configure Capacitor

**capacitor.config.ts:**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lume.app',
  appName: 'Lume',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#F5E6D3', // Champagne color
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT_CONTENT',
      backgroundColor: '#D97A8C', // Deep Rose color
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#D97A8C',
    },
    Geolocation: {
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
  },
  server: {
    // For development only
    url: 'http://localhost:5173',
    cleartext: true,
  },
};

export default config;
```

### 4. Add Native Features

**Install plugins:**
```bash
npm install @capacitor/push-notifications @capacitor/local-notifications @capacitor/geolocation @capacitor/camera @capacitor/share @capacitor/haptics
```

**Native feature service:**
```typescript
// src/services/native.ts
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';

export class NativeService {
  static isNative = Capacitor.isNativePlatform();

  static async initializePushNotifications() {
    if (!this.isNative) return;

    await PushNotifications.requestPermissions();
    await PushNotifications.register();
  }

  static async getCurrentLocation() {
    if (!this.isNative) {
      // Web fallback using browser geolocation
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
    }

    const coordinates = await Geolocation.getCurrentPosition();
    return coordinates;
  }

  static async hapticFeedback(style: ImpactStyle = ImpactStyle.Medium) {
    if (!this.isNative) return;
    await Haptics.impact({ style });
  }

  static async shareBooking(booking: Booking) {
    if (!this.isNative) {
      // Web fallback using Web Share API
      if (navigator.share) {
        return navigator.share({
          title: 'My Lume Booking',
          text: `I've booked ${booking.artistName} for ${booking.service} on ${booking.date}`,
          url: `https://lume.app/booking/${booking.id}`,
        });
      }
      return;
    }

    await Share.share({
      title: 'My Lume Booking',
      text: `I've booked ${booking.artistName} for ${booking.service} on ${booking.date}`,
      url: `https://lume.app/booking/${booking.id}`,
    });
  }
}
```

### 5. Build and Deploy

**Build process:**
```bash
# Build web app
npm run build

# Copy web assets to native projects
npx cap copy

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio (Android)
npx cap open android
```

**App Store Configuration:**
- Update app icons in `ios/App/App/Assets.xcassets/` and `android/app/src/main/res/`
- Configure app permissions in `ios/App/App/Info.plist` and `android/app/src/main/AndroidManifest.xml`
- Set up app signing certificates
- Configure deep linking schemes

## 🔄 Data Migration

### Replace Demo Data

1. **Create Data Service Layer:**
```typescript
// src/services/dataService.ts
export class DataService {
  // Replace demo data calls with API calls
  async getArtists(filters?: ArtistFilters): Promise<Artist[]> {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);
    
    const response = await apiClient.get<ArtistsResponse>(`/artists?${queryParams}`);
    return response.artists;
  }

  async getArtistById(id: string): Promise<Artist> {
    return apiClient.get<{ artist: Artist }>(`/artists/${id}`).then(r => r.artist);
  }

  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    return apiClient.post<{ booking: Booking }>('/bookings', bookingData).then(r => r.booking);
  }

  async getFavorites(): Promise<Artist[]> {
    return apiClient.get<{ artists: Artist[] }>('/users/favorites').then(r => r.artists);
  }
}

export const dataService = new DataService();
```

2. **Update Components to Use Real Data:**
```typescript
// Example: HomePage.tsx
const HomePage = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true);
        const data = await dataService.getArtists();
        setArtists(data);
      } catch (error) {
        console.error('Failed to load artists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, []);

  // Rest of component...
};
```

## ⚡ Performance Considerations

### Caching Strategy

```typescript
// src/services/cache.ts
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMinutes = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }
}

export const cacheService = new CacheService();
```

### Image Optimization

```typescript
// src/components/ui/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  ...props
}) => {
  const optimizedSrc = useMemo(() => {
    const url = new URL(src);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    return url.toString();
  }, [src, width, height, quality]);

  return <LazyImage src={optimizedSrc} alt={alt} {...props} />;
};
```

## 🔒 Security Best Practices

### 1. API Security Headers
```typescript
// Add to API responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://checkout.razorpay.com",
};
```

### 2. Input Validation
```typescript
// src/utils/validation.ts
import { z } from 'zod';

export const bookingSchema = z.object({
  artistId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  totalAmount: z.number().min(100).max(100000),
});

export const validateBooking = (data: unknown) => {
  return bookingSchema.safeParse(data);
};
```

### 3. Environment Configuration
```env
# .env.production
REACT_APP_API_URL=https://api.lume.app/v1
REACT_APP_RAZORPAY_KEY_ID=rzp_live_1234567890
REACT_APP_SENTRY_DSN=your_sentry_dsn
REACT_APP_ENVIRONMENT=production

# .env.development
REACT_APP_API_URL=http://localhost:3001/v1
REACT_APP_RAZORPAY_KEY_ID=rzp_test_1234567890
REACT_APP_ENVIRONMENT=development
```

---

## 📞 Support & Resources

- **Backend API Documentation**: [swagger/openapi docs URL]
- **Razorpay Documentation**: https://razorpay.com/docs/
- **Capacitor Documentation**: https://capacitorjs.com/docs
- **React Query for Data Fetching**: https://tanstack.com/query
- **Sentry for Error Monitoring**: https://sentry.io/

For questions or issues during integration, contact the development team or create an issue in the project repository.
