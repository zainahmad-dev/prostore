// Ensure environment variables from `.env` are loaded when running `tsx ./db/seed.ts`
import 'dotenv/config';

import sampleData from './sample-data';
import { prisma } from './prisma';

async function main() {
  // Clean tables in order (important if you have foreign keys)
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Insert sample data
  await prisma.product.createMany({ data: sampleData.products });
  await prisma.user.createMany({ data: sampleData.users });

  console.log('Database has been seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
