import Photon, { SaberParts } from '@generated/photon';
const photon = new Photon();

async function main() {
  await photon.items.create({
    data: {
      isAvailableLocally: true,
      partDescription: 'A genuine lightsaber hilt',
      partName: 'Saber hilt',
      saberPart: SaberParts.HILT,
    },
  });
  await photon.users.create({
    data: { username: 'dark_saber_dealer_69', details: { create: { firstName: 'Watto', lastName: 'Darkies' } } },
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await photon.disconnect();
  });
