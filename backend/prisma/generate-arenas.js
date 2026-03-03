import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sport types
const SPORT_TYPES = ['football', 'basketball', 'volleyball', 'tennis', 'badminton', 'table-tennis', 'futsal', 'other'];

// Sample addresses in Kazakhstan (only 3 cities: Astana, Almaty, Semey)
const ADDRESSES = [
  // Алматы
  { city: 'Алматы', street: 'Абай көшесі', number: '150', lat: 43.2389, lng: 76.8897 },
  { city: 'Алматы', street: 'Абылай хан даңғылы', number: '45', lat: 43.2382, lng: 76.8854 },
  { city: 'Алматы', street: 'Сәтбаев көшесі', number: '30', lat: 43.2222, lng: 76.8512 },
  { city: 'Алматы', street: 'Достық көшесі', number: '120', lat: 43.2567, lng: 76.9286 },
  { city: 'Алматы', street: 'Төле би көшесі', number: '75', lat: 43.2377, lng: 76.9542 },
  { city: 'Алматы', street: 'Назарбаев даңғылы', number: '200', lat: 43.2500, lng: 76.9125 },
  { city: 'Алматы', street: 'Райымбек даңғылы', number: '85', lat: 43.2233, lng: 76.8512 },
  { city: 'Алматы', street: 'Жандосов көшесі', number: '95', lat: 43.2067, lng: 76.8675 },
  { city: 'Алматы', street: 'Қалқаман көшесі', number: '110', lat: 43.2733, lng: 76.9050 },
  { city: 'Алматы', street: 'Қасым хан көшесі', number: '65', lat: 43.2178, lng: 76.8789 },
  // Астана
  { city: 'Астана', street: 'Қабанбай батыр даңғылы', number: '25', lat: 51.1694, lng: 71.4491 },
  { city: 'Астана', street: 'Кенесары көшесі', number: '40', lat: 51.1494, lng: 71.4291 },
  { city: 'Астана', street: 'Республика даңғылы', number: '15', lat: 51.1594, lng: 71.4391 },
  { city: 'Астана', street: 'Тұран даңғылы', number: '35', lat: 51.1544, lng: 71.4241 },
  { city: 'Астана', street: 'Әмір Темір даңғылы', number: '50', lat: 51.1744, lng: 71.4191 },
  { city: 'Астана', street: 'Дінмұхамед Қонаев даңғылы', number: '60', lat: 51.1394, lng: 71.4341 },
  { city: 'Астана', street: 'Қорғалжын даңғылы', number: '70', lat: 51.1644, lng: 71.4441 },
  { city: 'Астана', street: 'Мәңгілік Ел даңғылы', number: '80', lat: 51.1444, lng: 71.4141 },
  // Семей
  { city: 'Семей', street: 'Абай даңғылы', number: '110', lat: 50.4114, lng: 80.2275 },
  { city: 'Семей', street: 'Қазақстан көшесі', number: '45', lat: 50.4067, lng: 80.2342 },
  { city: 'Семей', street: 'Достық даңғылы', number: '55', lat: 50.4167, lng: 80.2189 },
  { city: 'Семей', street: 'Шәкәрім даңғылы', number: '65', lat: 50.4011, lng: 80.2416 },
  { city: 'Семей', street: 'Мұхтар Әуезов көшесі', number: '75', lat: 50.4211, lng: 80.2250 },
  { city: 'Семей', street: 'Тауелсіздік даңғылы', number: '85', lat: 50.4111, lng: 80.2325 },
];

// Sample titles
const TITLES = [
  'Футбол алаңы',
  'Баскетбол алаңы',
  'Волейбол корты',
  'Теннис корты',
  'Спорт кешені',
  'Футбол аренасы',
  'Көп мақсатты алаң',
  'Спорт залы',
  'Жаттығу базасы',
  'Спорт орталығы',
];

// Sample descriptions
const DESCRIPTIONS = [
  'Жасанды жабыны бар заманауи спорт құрылымы',
  'Спортпен шұғылдануға арналған кәсіби алаң',
  'Жаттығу және жарыстар үшін тамаша орын',
  'Жаңа жабдықтар және сапалы жабын',
  'Жақсы жарықтандырылған кең алаң',
  'Белсенді демалыс үшін идеалды орын',
  'Заманауи инфрақұрылым және ыңғайлылықтар',
  'Кәсіби спорт жабдықтары',
  'Спортпен шұғылдану үшін жайлы жағдайлар',
  'Сапалы жабын және керемет қызмет',
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice() {
  const prices = [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000];
  return getRandomElement(prices);
}

function generateArenaTitle(sportType) {
  const sportNames = {
    football: 'Футбол алаңы',
    basketball: 'Баскетбол алаңы',
    volleyball: 'Волейбол корты',
    tennis: 'Теннис корты',
    badminton: 'Бадминтон корты',
    'table-tennis': 'Үстелдік теннис алаңы',
    futsal: 'Футзал алаңы',
    other: 'Спорт алаңы',
  };
  
  const baseTitle = sportNames[sportType] || 'Спорт алаңы';
  const number = Math.floor(Math.random() * 50) + 1;
  const location = getRandomElement(['Орталық', 'Солтүстік', 'Оңтүстік', 'Шығыс', 'Батыс', 'Жаңа', 'Спорттық']);
  
  return `${baseTitle} "${location}" ${number}`;
}

async function main() {
  console.log('Генерация 50 арен...');

  // Get admin user as owner (or create one if doesn't exist)
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.log('Создание админ пользователя...');
    const bcrypt = await import('bcrypt');
    const adminPassword = await bcrypt.hash('Admin123', 12);
    admin = await prisma.user.create({
      data: {
        email: 'admin@arenareserve.kz',
        fullName: 'Admin User',
        phone: '+77000000000',
        passwordHash: adminPassword,
        role: 'ADMIN',
        isVerified: true,
      },
    });
  }

  const arenas = [];

  for (let i = 0; i < 50; i++) {
    const sportType = getRandomElement(SPORT_TYPES);
    const address = getRandomElement(ADDRESSES);
    const title = generateArenaTitle(sportType);
    const description = getRandomElement(DESCRIPTIONS);
    const pricePerHour = getRandomPrice();
    
    // Add some variation to coordinates
    const latitude = address.lat + (Math.random() - 0.5) * 0.1;
    const longitude = address.lng + (Math.random() - 0.5) * 0.1;
    
    const fullAddress = `${address.city}, ${address.street}, ${address.number}`;
    
    // Random status (mostly active)
    const statuses = ['active', 'active', 'active', 'maintenance', 'closed'];
    const status = getRandomElement(statuses);

    try {
      const arena = await prisma.arena.create({
        data: {
          ownerId: admin.id,
          title,
          description,
          sportType,
          address: fullAddress,
          latitude: latitude,
          longitude: longitude,
          pricePerHour: pricePerHour,
          timezone: 'Asia/Almaty',
          status: status,
          technicalInfo: {
            lighting: Math.random() > 0.3,
            shower: Math.random() > 0.4,
            parking: Math.random() > 0.2,
            capacity: Math.floor(Math.random() * 30) + 10,
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
                priceModifier: 1.2,
              },
            ],
          },
        },
      });

      arenas.push(arena);
      console.log(`Создана арена ${i + 1}/50: ${title}`);
    } catch (error) {
      console.error(`Ошибка при создании арены ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Создано ${arenas.length} арен!`);
  console.log(`   - Футбол: ${arenas.filter(a => a.sportType === 'football').length}`);
  console.log(`   - Баскетбол: ${arenas.filter(a => a.sportType === 'basketball').length}`);
  console.log(`   - Волейбол: ${arenas.filter(a => a.sportType === 'volleyball').length}`);
  console.log(`   - Теннис: ${arenas.filter(a => a.sportType === 'tennis').length}`);
  console.log(`   - Другие: ${arenas.filter(a => !['football', 'basketball', 'volleyball', 'tennis'].includes(a.sportType)).length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

