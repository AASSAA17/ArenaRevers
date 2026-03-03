import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@arenareserve.kz' },
    update: {
      passwordHash: adminPassword,
    },
    create: {
      email: 'admin@arenareserve.kz',
      fullName: 'Admin User',
      phone: '+77000000000',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // Create owner user
  const ownerPassword = await bcrypt.hash('Owner123', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@arenareserve.kz' },
    update: {
      passwordHash: ownerPassword,
    },
    create: {
      email: 'owner@arenareserve.kz',
      fullName: 'Arena Owner',
      phone: '+77000000001',
      passwordHash: ownerPassword,
      role: 'OWNER',
      isVerified: true,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('User123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@arenareserve.kz' },
    update: {
      passwordHash: userPassword,
    },
    create: {
      email: 'user@arenareserve.kz',
      fullName: 'Regular User',
      phone: '+77000000002',
      passwordHash: userPassword,
      role: 'USER',
      isVerified: true,
    },
  });

  // Create sample arenas
  const arena1 = await prisma.arena.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      ownerId: owner.id,
      title: 'Футбольное поле "Центральное"',
      description: 'Современное футбольное поле с искусственным покрытием',
      sportType: 'football',
      address: 'Алматы, ул. Абая, 150',
      latitude: 51.1605,
      longitude: 71.4704,
      pricePerHour: 5000,
      timezone: 'Asia/Almaty',
      status: 'active',
      technicalInfo: {
        lighting: true,
        shower: true,
        parking: true,
        capacity: 22,
      },
      images: {
        create: [
          {
            url: 'https://example.com/arena1.jpg',
            altText: 'Main view',
          },
        ],
      },
      schedules: {
        create: [
          {
            weekday: 1, // Monday
            startTime: '08:00',
            endTime: '22:00',
            priceModifier: 1.0,
          },
          {
            weekday: 5, // Friday
            startTime: '08:00',
            endTime: '22:00',
            priceModifier: 1.2, // Premium time
          },
        ],
      },
    },
  });

  const arena2 = await prisma.arena.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      ownerId: owner.id,
      title: 'Баскетбольная площадка "Спортивная"',
      description: 'Профессиональная баскетбольная площадка',
      sportType: 'basketball',
      address: 'Алматы, пр. Абылай хана, 45',
      latitude: 51.1485,
      longitude: 71.4304,
      pricePerHour: 4000,
      timezone: 'Asia/Almaty',
      status: 'active',
      technicalInfo: {
        lighting: true,
        shower: false,
        parking: true,
        capacity: 10,
      },
      images: {
        create: [
          {
            url: 'https://example.com/arena2.jpg',
            altText: 'Basketball court',
          },
        ],
      },
    },
  });

  // Create sample booking with payment for testing receipt download
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      arenaId: arena1.id,
      startDatetime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDatetime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
      status: 'confirmed',
      totalAmount: 5000,
      paidAmount: 5000,
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      payments: {
        create: {
          userId: user.id,
          amount: 5000,
          currency: 'KZT',
          provider: 'cash',
          status: 'succeeded',
          type: 'full',
        },
      },
    },
  });

  // Create sample rating for testing (use upsert to avoid duplicates)
  const rating = await prisma.rating.upsert({
    where: {
      userId_arenaId: {
        userId: user.id,
        arenaId: arena1.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      arenaId: arena1.id,
      stars: 5,
      comment: 'Отличная арена! Всем рекомендую.',
    },
  });

  // Create sample favorite for testing (use upsert to avoid duplicates)
  const favorite = await prisma.favorite.upsert({
    where: {
      userId_arenaId: {
        userId: user.id,
        arenaId: arena2.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      arenaId: arena2.id,
    },
  });

  console.log('Seed completed!');
  console.log('Admin:', admin.email, '/ Admin123');
  console.log('Owner:', owner.email, '/ Owner123');
  console.log('User:', user.email, '/ User123');
  console.log('Arenas created:', arena1.id, arena2.id);
  console.log('Sample booking created:', booking.id);
  console.log('Sample rating created:', rating.id);
  console.log('Sample favorite created:', favorite.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

