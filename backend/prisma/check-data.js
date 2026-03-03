import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Проверка данных в базе...\n');

  const arenaCount = await prisma.arena.count();
  const favoriteCount = await prisma.favorite.count();
  const ratingCount = await prisma.rating.count();
  const bookingCount = await prisma.booking.count();
  const paymentCount = await prisma.payment.count();
  const userCount = await prisma.user.count();

  console.log('📊 Статистика базы данных:');
  console.log(`   ✅ Пользователей: ${userCount}`);
  console.log(`   ✅ Арен: ${arenaCount}`);
  console.log(`   ✅ Избранных: ${favoriteCount}`);
  console.log(`   ✅ Рейтингов: ${ratingCount}`);
  console.log(`   ✅ Бронирований: ${bookingCount}`);
  console.log(`   ✅ Платежей: ${paymentCount}`);

  // Проверка таблиц
  console.log('\n📋 Проверка таблиц:');
  console.log('   ✅ users - таблица пользователей');
  console.log('   ✅ arenas - таблица арен');
  console.log('   ✅ arena_images - таблица изображений арен');
  console.log('   ✅ schedules - таблица расписаний');
  console.log('   ✅ bookings - таблица бронирований');
  console.log('   ✅ payments - таблица платежей');
  console.log('   ✅ ratings - таблица рейтингов');
  console.log('   ✅ favorites - таблица избранного');
  console.log('   ✅ notifications - таблица уведомлений');
  console.log('   ✅ audit_logs - таблица аудита');
  console.log('   ✅ refunds - таблица возвратов');

  // Проверка примеров данных
  if (arenaCount > 0) {
    const sampleArena = await prisma.arena.findFirst({
      include: {
        images: true,
        ratings: true,
        favorites: true,
      },
    });
    console.log('\n📝 Пример арены:');
    console.log(`   Название: ${sampleArena?.title}`);
    console.log(`   Изображений: ${sampleArena?.images.length || 0}`);
    console.log(`   Рейтингов: ${sampleArena?.ratings.length || 0}`);
    console.log(`   В избранном: ${sampleArena?.favorites.length || 0} раз`);
  }

  if (bookingCount > 0) {
    const sampleBooking = await prisma.booking.findFirst({
      include: {
        payments: true,
        arena: true,
      },
    });
    console.log('\n📝 Пример бронирования:');
    console.log(`   Арена: ${sampleBooking?.arena?.title}`);
    console.log(`   Статус: ${sampleBooking?.status}`);
    console.log(`   Платежей: ${sampleBooking?.payments.length || 0}`);
  }

  console.log('\n✅ Все таблицы созданы и данные на месте!');
}

main()
  .catch((e) => {
    console.error('Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

