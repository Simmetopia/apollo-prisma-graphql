import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { commerce, lorem, random } from 'faker';

import { SaberParts } from '../src/types/SaberPart';

const client = new PrismaClient();

const WEBSHOP_OWNER = 'dark_saber_dealer_69';
const saberPartArry = [...SaberParts];

const createItems = (amountOfItems: number) => {
  return Array.from({ length: amountOfItems }, () => ({
    saberPart: saberPartArry[random.number(saberPartArry.length - 1)],
    partDescription: lorem.paragraph(),
    partName: commerce.productName(),
    price: Math.floor(random.number(300)),
  }));
};

async function main() {
  await client.$connect();

  const hashedPassword = await bcrypt.hash('1234', 10);
  await client.user.create({
    data: {
      username: WEBSHOP_OWNER,
      inventory: { create: createItems(10) },
      details: { create: { firstName: 'Watto', lastName: 'Darkies' } },
      money: 21000,
      password: hashedPassword,
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await client.$disconnect();
  });
