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
    data: { name: 'Watto', username: 'Watto_jedi_sith_reseller' },
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await photon.disconnect();
  });
