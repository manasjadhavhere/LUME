import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LUME database...');

  // ── Create Demo Artists ─────────────────────────────────────────

  const artistUsers = [
    {
      email: 'aria@lume.in',
      name: 'Aria Mehra',
      location: 'Bandra, Mumbai',
      bio: 'Award-winning bridal and editorial makeup artist with 8 years of experience transforming faces for weddings, shoots, and runway.',
      experience: 8,
      certification: 'Certified Makeup Artist — VLCC Institute',
      specialties: ['Bridal', 'Editorial', 'Glam'],
      startingPrice: 2499,
      badge: 'TOP_PICK' as const,
      rating: 4.9,
      reviewCount: 127,
      bookingCount: 312,
      isVerified: true,
      services: [
        { name: 'Bridal Makeup', price: 7999, duration: 180, icon: '👰', description: 'Full bridal look with HD products and long-lasting finish' },
        { name: 'Editorial Makeup', price: 4999, duration: 120, icon: '📸', description: 'High-fashion editorial look for shoots and campaigns' },
        { name: 'Evening Glam', price: 2499, duration: 90, icon: '✨', description: 'Glamorous evening look for parties and events' },
        { name: 'Engagement Makeup', price: 3999, duration: 120, icon: '💍', description: 'Stunning engagement ceremony look' },
      ],
    },
    {
      email: 'sia@lume.in',
      name: 'Sia Kapoor',
      location: 'Juhu, Mumbai',
      bio: 'Specialist in natural, skin-first makeup that enhances your features without masking them. Trusted by brides and skincare enthusiasts alike.',
      experience: 5,
      certification: 'Advanced Diploma in Cosmetology — JDAI',
      specialties: ['Natural', 'Skincare', 'Evening'],
      startingPrice: 1799,
      badge: null,
      rating: 4.7,
      reviewCount: 89,
      bookingCount: 198,
      isVerified: true,
      services: [
        { name: 'Natural Bridal', price: 5999, duration: 150, icon: '🌸', description: 'Dewy, fresh bridal look using skin-prep focused techniques' },
        { name: 'Everyday Glow', price: 1799, duration: 60, icon: '🌟', description: 'No-makeup makeup look for daily wear' },
        { name: 'Evening Natural', price: 2499, duration: 90, icon: '🌙', description: 'Soft evening look with a natural finish' },
      ],
    },
    {
      email: 'riya@lume.in',
      name: 'Riya Sen',
      location: 'Andheri, Mumbai',
      bio: 'Bold, fearless, and creative — Riya specialises in avant-garde and fantasy makeup that makes a statement. Known for runway and editorial work.',
      experience: 6,
      certification: 'Pro Makeup Artist — MAC Cosmetics Academy',
      specialties: ['Glam', 'Fantasy', 'Bold'],
      startingPrice: 2999,
      badge: 'FEATURED' as const,
      rating: 4.8,
      reviewCount: 203,
      bookingCount: 445,
      isVerified: true,
      services: [
        { name: 'Fantasy Makeup', price: 6999, duration: 180, icon: '🎭', description: 'Theatrical and avant-garde looks for shoots and events' },
        { name: 'Bold Glam', price: 2999, duration: 90, icon: '💄', description: 'Dramatic, high-impact glam look' },
        { name: 'Runway Makeup', price: 4999, duration: 120, icon: '👠', description: 'Runway-ready editorial makeup' },
      ],
    },
    {
      email: 'ananya@lume.in',
      name: 'Ananya Patel',
      location: 'Powai, Mumbai',
      bio: 'Specializing in traditional Indian bridal makeup with modern sensibilities. Expert in mehendi looks, Rajasthani, and South Indian styles.',
      experience: 10,
      certification: 'Certified Bridal Specialist — L\'Oreal Paris Academy',
      specialties: ['Bridal', 'Traditional'],
      startingPrice: 3499,
      badge: 'TOP_PICK' as const,
      rating: 4.95,
      reviewCount: 341,
      bookingCount: 589,
      isVerified: true,
      services: [
        { name: 'Premium Bridal', price: 9999, duration: 240, icon: '🪷', description: 'Full traditional bridal with outfit change support' },
        { name: 'Mehendi Ceremony', price: 3499, duration: 90, icon: '🌺', description: 'Beautifully crafted mehendi ceremony look' },
        { name: 'Reception Look', price: 6999, duration: 150, icon: '💐', description: 'Glamorous reception makeup with HD finish' },
        { name: 'Family Package', price: 15999, duration: 360, icon: '👨‍👩‍👧', description: 'Full family bridal team — bride + 4 members' },
      ],
    },
    {
      email: 'kavya@lume.in',
      name: 'Kavya Sharma',
      location: 'Versova, Mumbai',
      bio: 'Editorial and runway makeup artist who has worked with top Bollywood productions and fashion weeks. Clean aesthetic meets bold creativity.',
      experience: 7,
      certification: 'Fashion Makeup Specialist — Bollywood School of Makeup',
      specialties: ['Editorial', 'Runway'],
      startingPrice: 2799,
      badge: null,
      rating: 4.6,
      reviewCount: 67,
      bookingCount: 134,
      isVerified: true,
      services: [
        { name: 'Editorial Shoot', price: 5999, duration: 150, icon: '🎬', description: 'Film and fashion editorial makeup' },
        { name: 'Runway Ready', price: 2799, duration: 60, icon: '👒', description: 'Quick runway-ready look for fashion shows' },
        { name: 'Bollywood Glam', price: 4499, duration: 120, icon: '⭐', description: 'Bollywood inspired glamorous look' },
      ],
    },
    {
      email: 'diya@lume.in',
      name: 'Diya Iyer',
      location: 'Colaba, Mumbai',
      bio: 'Your everyday beauty bestie! Diya specialises in quick, effortless looks for college, work, and casual events at affordable prices.',
      experience: 3,
      certification: 'Diploma in Beauty Therapy — IIAS',
      specialties: ['Natural', 'Everyday', 'Evening'],
      startingPrice: 1499,
      badge: 'NEW' as const,
      rating: 4.5,
      reviewCount: 28,
      bookingCount: 67,
      isVerified: false,
      services: [
        { name: 'Everyday Look', price: 1499, duration: 45, icon: '☀️', description: 'Fresh and natural everyday makeup' },
        { name: 'Office Ready', price: 1799, duration: 60, icon: '💼', description: 'Professional polished look for work' },
        { name: 'Date Night', price: 2499, duration: 90, icon: '🌹', description: 'Romantic evening look for special occasions' },
      ],
    },
  ];

  for (const artistData of artistUsers) {
    const passwordHash = await bcrypt.hash('password123', 12);
    
    const user = await prisma.user.upsert({
      where: { email: artistData.email },
      update: {},
      create: {
        email: artistData.email,
        passwordHash,
        role: 'ARTIST',
        name: artistData.name,
      },
    });

    const artistProfile = await prisma.artistProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: artistData.bio,
        location: artistData.location,
        experience: artistData.experience,
        certification: artistData.certification,
        specialties: artistData.specialties,
        startingPrice: artistData.startingPrice,
        badge: artistData.badge as any,
        rating: artistData.rating,
        reviewCount: artistData.reviewCount,
        bookingCount: artistData.bookingCount,
        isVerified: artistData.isVerified,
        totalEarnings: artistData.startingPrice * artistData.bookingCount * 0.85,
      },
    });

    // Create services
    for (const service of artistData.services) {
      await prisma.service.create({
        data: {
          artistId: artistProfile.id,
          name: service.name,
          price: service.price,
          duration: service.duration,
          icon: service.icon,
          description: service.description,
        },
      });
    }

    // Create availability for the next 30 days
    const timeSlots = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
      '05:00 PM', '06:00 PM',
    ];

    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Skip Mondays for some variety
      if (date.getDay() !== 1) {
        const slots = timeSlots.map(time => ({
          time,
          available: Math.random() > 0.3, // 70% available
        }));

        await prisma.availability.upsert({
          where: { artistId_date: { artistId: artistProfile.id, date } },
          update: {},
          create: {
            artistId: artistProfile.id,
            date,
            timeSlots: slots,
          },
        });
      }
    }

    console.log(`  ✅ Created artist: ${artistData.name}`);
  }

  // ── Create a Demo Client ────────────────────────────────────────

  const clientPasswordHash = await bcrypt.hash('password123', 12);
  const clientUser = await prisma.user.upsert({
    where: { email: 'priya@demo.com' },
    update: {},
    create: {
      email: 'priya@demo.com',
      passwordHash: clientPasswordHash,
      role: 'CLIENT',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
    },
  });

  await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      location: 'Bandra, Mumbai',
    },
  });

  console.log(`  ✅ Created demo client: ${clientUser.name}`);

  // ── Create an Admin User ─────────────────────────────────────────

  const adminPasswordHash = await bcrypt.hash('password123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lume.in' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@lume.in',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      name: 'Lume Administrator',
    },
  });

  console.log(`  ✅ Created admin user: ${adminUser.name}`);

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Admin:  admin@lume.in / password123');
  console.log('   Client: priya@demo.com / password123');
  console.log('   Artist: aria@lume.in / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
