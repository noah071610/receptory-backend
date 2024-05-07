import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        email: 'noah071610@gmail.com',
        userImage: 'https://avatars.githubusercontent.com/u/74864925?v=4',
        userName: 'Noah',
        provider: 'google',
      },
    ],
  });

  await prisma.save.createMany({
    data: [],
  });

  await prisma.page.createMany({
    data: [],
  });
  await prisma.$disconnect();
}

main().catch((error) => {
  throw error;
});
