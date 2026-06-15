/* ===========================
   LUME - Demo Data
   =========================== */

import type { Artist, Service, Review, TimeSlot } from './types';

// Helper function to generate dates for next 7 days
const generateNext7Days = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Helper function to generate time slots for a day
const generateTimeSlots = (takenSlots: string[] = []): TimeSlot[] => {
  const times = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
    '07:00 PM', '07:30 PM'
  ];

  return times.map(time => ({
    time,
    available: !takenSlots.includes(time)
  }));
};

// 1. Aria Mehra - Bridal · Editorial · Glam
const ariaMehraServices: Service[] = [
  { id: 'bridal-1', name: 'Bridal', icon: '👰', price: 2499 },
  { id: 'editorial-1', name: 'Editorial', icon: '📸', price: 2199 },
  { id: 'glam-1', name: 'Glam', icon: '✨', price: 1899 },
  { id: 'evening-1', name: 'Evening', icon: '🌆', price: 1699 }
];

const ariaMehraReviews: Review[] = [
  {
    id: 'r1-1',
    userName: 'Priya Sharma',
    avatar: '👩',
    rating: 5,
    text: 'Absolutely stunning bridal makeup! Aria made me feel like a queen on my special day. Highly recommend!',
    date: new Date('2026-05-15')
  },
  {
    id: 'r1-2',
    userName: 'Neha Kapoor',
    avatar: '👩‍🦱',
    rating: 5,
    text: 'Professional and talented. My editorial shoot turned out perfect thanks to Aria\'s amazing work.',
    date: new Date('2026-05-10')
  },
  {
    id: 'r1-3',
    userName: 'Ananya Singh',
    avatar: '👩‍🦰',
    rating: 4.5,
    text: 'Beautiful glam look for my anniversary. Aria is very skilled and uses quality products.',
    date: new Date('2026-05-05')
  }
];

const ariaMehra: Artist = {
  id: 'aria-mehra',
  name: 'Aria Mehra',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  specialties: ['Bridal', 'Editorial', 'Glam'],
  rating: 4.9,
  reviewCount: 218,
  distance: 2.3,
  startingPrice: 2499,
  badge: 'Top Pick',
  certification: 'Certified Makeup Artist',
  location: 'Bandra, Mumbai',
  experience: 8,
  bookingCount: 450,
  services: ariaMehraServices,
  availability: {
    dates: generateNext7Days().map((date, index) => ({
      date,
      slots: generateTimeSlots(
        index === 0 ? ['10:00 AM', '11:00 AM', '02:00 PM'] : 
        index === 1 ? ['09:00 AM', '03:00 PM'] : []
      )
    }))
  },
  reviews: ariaMehraReviews
};

// 2. Sia Kapoor - Natural · Skincare · Evening
const siaKapoorServices: Service[] = [
  { id: 'natural-2', name: 'Natural', icon: '🌿', price: 1799 },
  { id: 'evening-2', name: 'Evening', icon: '🌆', price: 1599 },
  { id: 'bridal-2', name: 'Bridal', icon: '👰', price: 2399 },
];

const siaKapoorReviews: Review[] = [
  {
    id: 'r2-1',
    userName: 'Riya Desai',
    avatar: '👩‍🦳',
    rating: 5,
    text: 'Sia has magic hands! My skin looked flawless with her natural makeup. Perfect for everyday looks.',
    date: new Date('2026-05-18')
  },
  {
    id: 'r2-2',
    userName: 'Kavya Reddy',
    avatar: '👩',
    rating: 4.5,
    text: 'Loved the evening makeup for my friend\'s wedding. Sia is very gentle and professional.',
    date: new Date('2026-05-12')
  },
  {
    id: 'r2-3',
    userName: 'Simran Patel',
    avatar: '👩‍🦱',
    rating: 5,
    text: 'Best natural makeup artist in Mumbai! Sia understands exactly what you want.',
    date: new Date('2026-05-08')
  }
];

const siaKapoor: Artist = {
  id: 'sia-kapoor',
  name: 'Sia Kapoor',
  avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  specialties: ['Natural', 'Skincare', 'Evening'],
  rating: 4.8,
  reviewCount: 164,
  distance: 3.1,
  startingPrice: 1799,
  certification: 'Certified Makeup Artist',
  location: 'Juhu, Mumbai',
  experience: 6,
  bookingCount: 320,
  services: siaKapoorServices,
  availability: {
    dates: generateNext7Days().map((date, index) => ({
      date,
      slots: generateTimeSlots(
        index === 0 ? ['09:00 AM', '01:00 PM', '04:00 PM'] : 
        index === 2 ? ['11:00 AM', '02:00 PM'] : []
      )
    }))
  },
  reviews: siaKapoorReviews
};

// 3. Riya Sen - Glam · Fantasy · Bold
const riyaSenServices: Service[] = [
  { id: 'glam-3', name: 'Glam', icon: '✨', price: 2999 },
  { id: 'editorial-3', name: 'Editorial', icon: '📸', price: 2799 },
  { id: 'evening-3', name: 'Evening', icon: '🌆', price: 2299 },
];

const riyaSenReviews: Review[] = [
  {
    id: 'r3-1',
    userName: 'Diya Malhotra',
    avatar: '👩‍🦰',
    rating: 5,
    text: 'Riya is a true artist! My glam makeup for the party was absolutely stunning. Everyone asked who did it!',
    date: new Date('2026-05-20')
  },
  {
    id: 'r3-2',
    userName: 'Tanvi Joshi',
    avatar: '👩',
    rating: 4.5,
    text: 'Bold and beautiful! Riya created the perfect look for my photoshoot. Very creative!',
    date: new Date('2026-05-14')
  },
  {
    id: 'r3-3',
    userName: 'Ishita Gupta',
    avatar: '👩‍🦱',
    rating: 4.5,
    text: 'Love her fantasy makeup style! Riya is very talented and knows the latest trends.',
    date: new Date('2026-05-09')
  }
];

const riyaSen: Artist = {
  id: 'riya-sen',
  name: 'Riya Sen',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  specialties: ['Glam', 'Fantasy', 'Bold'],
  rating: 4.7,
  reviewCount: 89,
  distance: 4.5,
  startingPrice: 2999,
  badge: 'New',
  certification: 'Professional Makeup Artist',
  location: 'Andheri, Mumbai',
  experience: 4,
  bookingCount: 180,
  services: riyaSenServices,
  availability: {
    dates: generateNext7Days().map((date, index) => ({
      date,
      slots: generateTimeSlots(
        index === 1 ? ['10:00 AM', '12:00 PM', '03:00 PM'] : 
        index === 3 ? ['09:00 AM', '05:00 PM'] : []
      )
    }))
  },
  reviews: riyaSenReviews
};

// 4. Ananya Patel - Bridal · Traditional
const ananyaPatelServices: Service[] = [
  { id: 'bridal-4', name: 'Bridal', icon: '👰', price: 3499 },
  { id: 'editorial-4', name: 'Editorial', icon: '📸', price: 2999 },
  { id: 'glam-4', name: 'Glam', icon: '✨', price: 2599 },
  { id: 'evening-4', name: 'Evening', icon: '🌆', price: 2299 },
];

const ananyaPatelReviews: Review[] = [
  {
    id: 'r4-1',
    userName: 'Meera Iyer',
    avatar: '👰',
    rating: 5,
    text: 'Ananya is the best bridal makeup artist! She made me look absolutely gorgeous on my wedding day.',
    date: new Date('2026-05-22')
  },
  {
    id: 'r4-2',
    userName: 'Pooja Nair',
    avatar: '👩',
    rating: 5,
    text: 'Traditional bridal makeup at its finest! Ananya understands Indian bridal looks perfectly.',
    date: new Date('2026-05-16')
  },
  {
    id: 'r4-3',
    userName: 'Sanya Khanna',
    avatar: '👩‍🦱',
    rating: 4.5,
    text: 'Highly recommended for brides! Ananya is very experienced and professional.',
    date: new Date('2026-05-11')
  },
  {
    id: 'r4-4',
    userName: 'Rhea Chatterjee',
    avatar: '👩‍🦰',
    rating: 5,
    text: 'My sister looked like a dream on her wedding! Thank you Ananya for the beautiful makeup.',
    date: new Date('2026-05-06')
  }
];

const ananyaPatel: Artist = {
  id: 'ananya-patel',
  name: 'Ananya Patel',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  specialties: ['Bridal', 'Traditional'],
  rating: 4.9,
  reviewCount: 312,
  distance: 1.8,
  startingPrice: 3499,
  badge: 'Top Pick',
  certification: 'Master Bridal Makeup Artist',
  location: 'Powai, Mumbai',
  experience: 10,
  bookingCount: 580,
  services: ananyaPatelServices,
  availability: {
    dates: generateNext7Days().map((date, index) => ({
      date,
      slots: generateTimeSlots(
        index === 0 ? ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'] : 
        index === 2 ? ['09:00 AM', '01:00 PM'] : 
        index === 4 ? ['10:00 AM', '03:00 PM'] : []
      )
    }))
  },
  reviews: ananyaPatelReviews
};

// 5. Kavya Sharma - Editorial · Runway
const kavyaSharmaServices: Service[] = [
  { id: 'editorial-5', name: 'Editorial', icon: '📸', price: 2799 },
  { id: 'glam-5', name: 'Glam', icon: '✨', price: 2499 },
  { id: 'bridal-5', name: 'Bridal', icon: '👰', price: 2999 },
];

const kavyaSharmaReviews: Review[] = [
  {
    id: 'r5-1',
    userName: 'Aisha Khan',
    avatar: '👩',
    rating: 5,
    text: 'Kavya did my editorial makeup and it was phenomenal! Very professional and creative.',
    date: new Date('2026-05-19')
  },
  {
    id: 'r5-2',
    userName: 'Zara Ahmed',
    avatar: '👩‍🦱',
    rating: 4.5,
    text: 'Great for runway looks! Kavya knows exactly how to make you stand out.',
    date: new Date('2026-05-13')
  },
  {
    id: 'r5-3',
    userName: 'Nisha Roy',
    avatar: '👩‍🦰',
    rating: 4.5,
    text: 'Editorial perfection! Kavya is very talented and easy to work with.',
    date: new Date('2026-05-07')
  }
];

const kavyaSharma: Artist = {
  id: 'kavya-sharma',
  name: 'Kavya Sharma',
  avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  specialties: ['Editorial', 'Runway'],
  rating: 4.6,
  reviewCount: 145,
  distance: 5.2,
  startingPrice: 2799,
  certification: 'Fashion Makeup Specialist',
  location: 'Versova, Mumbai',
  experience: 7,
  bookingCount: 290,
  services: kavyaSharmaServices,
  availability: {
    dates: generateNext7Days().map((date, index) => ({
      date,
      slots: generateTimeSlots(
        index === 1 ? ['11:00 AM', '02:00 PM', '04:00 PM'] : 
        index === 3 ? ['09:00 AM', '01:00 PM'] : []
      )
    }))
  },
  reviews: kavyaSharmaReviews
};

// 6. Diya Iyer - Natural · Everyday · Evening
const diyaIyerServices: Service[] = [
  { id: 'natural-6', name: 'Natural', icon: '🌿', price: 1499 },
  { id: 'evening-6', name: 'Evening', icon: '🌆', price: 1699 },
  { id: 'glam-6', name: 'Glam', icon: '✨', price: 1899 },
];

const diyaIyerReviews: Review[] = [
  {
    id: 'r6-1',
    userName: 'Shreya Menon',
    avatar: '👩',
    rating: 5,
    text: 'Diya is amazing for natural everyday looks! Very affordable and professional.',
    date: new Date('2026-05-21')
  },
  {
    id: 'r6-2',
    userName: 'Aarti Pillai',
    avatar: '👩‍🦱',
    rating: 4.5,
    text: 'Perfect for office events and everyday makeup. Diya is very sweet and talented.',
    date: new Date('2026-05-17')
  },
  {
    id: 'r6-3',
    userName: 'Divya Nambiar',
    avatar: '👩‍🦰',
    rating: 5,
    text: 'Best value for money! Diya\'s natural makeup always looks flawless and lasts all day.',
    date: new Date('2026-05-10')
  }
];

const diyaIyer: Artist = {
  id: 'diya-iyer',
  name: 'Diya Iyer',
  avatar: 'https://images.unsplash.com/photo-1508214751196-bfd140925c41?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  specialties: ['Natural', 'Everyday', 'Evening'],
  rating: 4.8,
  reviewCount: 203,
  distance: 2.7,
  startingPrice: 1499,
  certification: 'Certified Makeup Artist',
  location: 'Colaba, Mumbai',
  experience: 5,
  bookingCount: 380,
  services: diyaIyerServices,
  availability: {
    dates: generateNext7Days().map((date, index) => ({
      date,
      slots: generateTimeSlots(
        index === 0 ? ['12:00 PM', '03:00 PM'] : 
        index === 2 ? ['10:00 AM', '01:00 PM', '05:00 PM'] : 
        index === 4 ? ['09:00 AM', '02:00 PM'] : []
      )
    }))
  },
  reviews: diyaIyerReviews
};

// Export all artists as demo data
export const demoArtists: Artist[] = [
  ariaMehra,
  siaKapoor,
  riyaSen,
  ananyaPatel,
  kavyaSharma,
  diyaIyer
];

// Helper function to get artist by ID
export const getArtistById = (id: string): Artist | undefined => {
  return demoArtists.find(artist => artist.id === id);
};

// Helper function to filter artists by category
export const filterArtistsByCategory = (category: string): Artist[] => {
  if (category === 'All') {
    return demoArtists;
  }
  return demoArtists.filter(artist => 
    artist.specialties.some(specialty => 
      specialty.toLowerCase() === category.toLowerCase()
    )
  );
};

// Helper function to search artists
export const searchArtists = (query: string): Artist[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return demoArtists;
  }
  
  return demoArtists.filter(artist => 
    artist.name.toLowerCase().includes(lowerQuery) ||
    artist.specialties.some(s => s.toLowerCase().includes(lowerQuery)) ||
    artist.location.toLowerCase().includes(lowerQuery)
  );
};
