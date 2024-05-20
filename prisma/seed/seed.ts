import { PrismaClient } from '@prisma/client';
import { customAlphabet, urlAlphabet } from 'nanoid';

const prisma = new PrismaClient();

function getId() {
  const nanoid = customAlphabet(urlAlphabet, 15);
  return nanoid();
}

async function main() {
  await prisma.user.createMany({
    data: [
      {
        userId: getId(),
        email: process.env.ADMIN_EMAIL,
        userImage: 'https://avatars.githubusercontent.com/u/74864925?v=4',
        userName: 'Noah',
        provider: 'google',
        plan: 2,
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
