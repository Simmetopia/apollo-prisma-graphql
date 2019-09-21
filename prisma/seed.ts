import { Photon, SaberParts } from '@generated/photon';
import { commerce, lorem, random } from 'faker';
const photon = new Photon();
const WEBSHOP_OWNER = 'dark_saber_dealer_69';
const saberPartArry = [...Object.keys(SaberParts)];
const createItems = (amountOfItems: number) => {
  return Array.from({ length: amountOfItems }, () => ({
    saberPart: saberPartArry[random.number(saberPartArry.length - 1)] as SaberParts,
    partDescription: lorem.paragraph(),
    partName: commerce.productName(),
    price: Math.floor(random.number(300)),
  }));
};

async function main() {
  await photon.items.create({
    data: {
      partDescription: 'A genuine lightsaber hilt',
      partName: 'Saber hilt',
      saberPart: SaberParts.HILT,
    },
  });
  await photon.users.create({
    data: {
      username: WEBSHOP_OWNER,
      inventory: { create: createItems(10) },
      details: { create: { firstName: 'Watto', lastName: 'Darkies' } },
    },
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await photon.disconnect();
  });
