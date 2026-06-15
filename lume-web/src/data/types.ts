/* ===========================
   LUME - Type Definitions
   =========================== */

export interface TimeSlot {
  time: string; // "09:00 AM", "10:30 AM", etc.
  available: boolean;
}

export interface Availability {
  dates: Array<{
    date: Date;
    slots: TimeSlot[];
  }>;
}

export interface Service {
  id: string;
  name: string; // "Bridal", "Editorial", "Evening", "Natural", "Glam"
  icon: string; // Emoji
  price: number; // INR
  duration?: number; // minutes (optional for MVP)
}

export interface Review {
  id: string;
  userName: string;
  avatar: string; // Emoji
  rating: number; // 1-5
  text: string;
  date: Date;
}

export interface Artist {
  id: string;
  name: string;
  avatar: string; // Emoji character or gradient identifier
  specialties: string[]; // e.g., ["Bridal", "Editorial"]
  rating: number; // 0-5 with one decimal
  reviewCount: number;
  distance: number; // kilometers from user
  startingPrice: number; // INR
  badge?: 'Top Pick' | 'New';
  certification: string; // e.g., "Certified Makeup Artist"
  location: string; // e.g., "Mumbai"
  experience: number; // years
  bookingCount: number; // total bookings
  services: Service[];
  availability: Availability;
  reviews: Review[];
}

export interface Booking {
  id: string;
  artistId: string;
  artistName: string;
  service: string;
  date: Date;
  time: string;
  location: string;
  totalPaid: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export type BadgeVariant = 'Top Pick' | 'New' | 'Certified';

export type ServiceCategory = 'All' | 'Bridal' | 'Editorial' | 'Evening' | 'Natural' | 'Glam';
