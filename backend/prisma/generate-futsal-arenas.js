import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  { city: 'Алматы', street: 'Шевченко көшесі', number: '140', lat: 43.2611, lng: 76.9347 },
  { city: 'Алматы', street: 'Жибек жолы', number: '88', lat: 43.2433, lng: 76.9236 },
  { city: 'Алматы', street: 'Фурманов көшесі', number: '175', lat: 43.2294, lng: 76.9125 },
  { city: 'Алматы', street: 'Байзақ батыр даңғылы', number: '92', lat: 43.2544, lng: 76.8675 },
  // Астана
  { city: 'Астана', street: 'Қабанбай батыр даңғылы', number: '25', lat: 51.1694, lng: 71.4491 },
  { city: 'Астана', street: 'Кенесары көшесі', number: '40', lat: 51.1494, lng: 71.4291 },
  { city: 'Астана', street: 'Республика даңғылы', number: '15', lat: 51.1594, lng: 71.4391 },
  { city: 'Астана', street: 'Тұран даңғылы', number: '35', lat: 51.1544, lng: 71.4241 },
  { city: 'Астана', street: 'Әмір Темір даңғылы', number: '50', lat: 51.1744, lng: 71.4191 },
  { city: 'Астана', street: 'Дінмұхамед Қонаев даңғылы', number: '60', lat: 51.1394, lng: 71.4341 },
  { city: 'Астана', street: 'Қорғалжын даңғылы', number: '70', lat: 51.1644, lng: 71.4441 },
  { city: 'Астана', street: 'Мәңгілік Ел даңғылы', number: '80', lat: 51.1444, lng: 71.4141 },
  { city: 'Астана', street: 'Қажымұқан даңғылы', number: '90', lat: 51.1694, lng: 71.4491 },
  { city: 'Астана', street: 'Сарайшық көшесі', number: '100', lat: 51.1494, lng: 71.4291 },
  // Семей
  { city: 'Семей', street: 'Абай даңғылы', number: '110', lat: 50.4114, lng: 80.2275 },
  { city: 'Семей', street: 'Қазақстан көшесі', number: '45', lat: 50.4067, lng: 80.2342 },
  { city: 'Семей', street: 'Достық даңғылы', number: '55', lat: 50.4167, lng: 80.2189 },
  { city: 'Семей', street: 'Шәкәрім даңғылы', number: '65', lat: 50.4011, lng: 80.2416 },
  { city: 'Семей', street: 'Мұхтар Әуезов көшесі', number: '75', lat: 50.4211, lng: 80.2250 },
  { city: 'Семей', street: 'Тауелсіздік даңғылы', number: '85', lat: 50.4111, lng: 80.2325 },
  { city: 'Семей', street: 'Ақпарат даңғылы', number: '95', lat: 50.4061, lng: 80.2194 },
  { city: 'Семей', street: 'Жібек жолы', number: '105', lat: 50.4161, lng: 80.2389 },
  { city: 'Семей', street: 'Тәуелсіздік көшесі', number: '115', lat: 50.4017, lng: 80.2275 },
  { city: 'Семей', street: 'Қазыбек би көшесі', number: '125', lat: 50.4217, lng: 80.2216 },
];

// Sample descriptions for futsal arenas
const DESCRIPTIONS = [
  'Жасанды жабыны бар заманауи футзал алаңы',
  'Футзал ойнауға арналған кәсіби алаң',
  'Жаттығу және жарыстар үшін тамаша футзал алаңы',
  'Жаңа жабдықтар және сапалы жабыны бар футзал корты',
  'Жақсы жарықтандырылған кең футзал алаңы',
  'Белсенді демалыс үшін идеалды футзал аренасы',
  'Заманауи инфрақұрылым және ыңғайлылықтар',
  'Кәсіби футзал жабдықтары',
  'Футзал ойнау үшін жайлы жағдайлар',
  'Сапалы жабын және керемет қызмет',
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice() {
  const prices = [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000];
  return getRandomElement(prices);
}

function generateFutsalArenaTitle() {
  const location = getRandomElement(['Орталық', 'Солтүстік', 'Оңтүстік', 'Шығыс', 'Батыс', 'Жаңа', 'Спорттық']);
  const number = Math.floor(Math.random() * 50) + 1;
  
  return `Футзал алаңы "${location}" ${number}`;
}

async function main() {
  console.log('50 футзал алаңы генерациялау...');

  // Get admin user as owner (or create one if doesn't exist)
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.log('Админ пайдаланушысын жасау...');
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
    const address = getRandomElement(ADDRESSES);
    const title = generateFutsalArenaTitle();
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
          sportType: 'futsal',
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
            capacity: Math.floor(Math.random() * 10) + 20, // Futsal typically 20-30 capacity
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
      console.log(`Алаң ${i + 1}/50 жасалды: ${title}`);
    } catch (error) {
      console.error(`Алаң ${i + 1} жасау кезінде қате:`, error.message);
    }
  }

  console.log(`\n✅ ${arenas.length} футзал алаңы жасалды!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

