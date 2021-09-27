import { PrismaClient } from '@prisma/client';
import { datatype, lorem, random } from 'faker';

const client = new PrismaClient(/*{ log: ['query', 'info'] }*/);

const WEBSHOP_OWNER = 'dark_saber_dealer_69';

const createSaberParts = () => {
  return ["Addon"/*, "Body", "Emitter", "Pommel", "Switch"*/];
}

const createPartName = () => {
  return [
    {saberPart: "Addon", partList: ["Coupler 01 Female", "Coupler 01 Female/Male", "Coupler 01 Male", "Coupler 02 Female", "Coupler 02 Female/Male", "Coupler 02 Male", "Coupler 03 Female", "Coupler 03 Female/Male", "Coupler 03 Male", "Coupler 04 Female", "Coupler 04 Female/Male", "Coupler 04 Male", "Coupler Knurled Female", "Coupler Knurled Female/Male", "Coupler Knurled Male", "Coupler Staff Long", "Coupler Staff Short", "Coupler Staff Very Short", "Crystal Chamber 1", "Crystal Chamber 2", "Crystal Chamber 3", "Crystal Chamber 4", "Elbow 1", "Elbow 2", "Quick Release Staff Coupler 15-lbs", "Quick Release Staff Coupler 35-lbs", "S Coupler", "Staff Extension 1", "Staff Extension 2", "Thin Neck Adapter 01", "Thin Neck Adapter 02", "Thin Neck Adapter 03" ]}, // Addons
    /*{saberPart: "Body", partList: ["01 Body", "02 Body", "03 Body", "04 Body", "05 Body", "06 Body", "07 Body", "08 Body", "09 Body", "10 Body", "11 Body", "12 Body", "13 Body", "14 Body", "15 Body", "Avenger Body", "Commando Body", "Curved Body 1", "Curved Body 2", "Curved Body 3", "Curved Body 4", "Dissident Body", "Epoch Body", "Exile Body", "Fallen Body", "Fury Body", "Gladius Body", "Graflex Body", "Jade Fire Body", "Juggernaut Body", "Katana Body (long)", "Katana Body (long)", "Mauler Body", "Outcast Body", "Pathfinder Body", "Reborn Body", "Redeemer Body", "Reliant Body", "Reliant Body L", "Reliant Body S", "Resilient Body", "Sinister Prophecy Body", "Sorcerer Body", "Vengeance Body", "Venom Body", "Vigilant Body" ]} , // Bodies
    {saberPart: "Emitter", partList: ["01 Emitter", "02 Emitter", "03 Emitter", "04 Emitter", "05 Emitter", "06 Emitter", "07 Emitter", "08 Emitter", "09 Emitter", "10 Emitter", "11 Emitter", "12 Emitter", "13 Emitter", "14 Emitter", "Angled Emitter 1", "Angled Emitter 2", "Avenger Emitter", "Commando Emitter", "Dissident Emitter", "Epoch Emitter", "Exile Emitter", "Fallen Emitter", "Fury Emitter", "Gladius Emitter", "Graflex Emitter", "Jade Fire Emitter", "Juggernaut Emitter", "Katana Emitter Short", "Outcast Emitter", "Pathfinder Emitter", "Prodigal Son Emitter", "Rebel Emitter", "Reborn Emitter", "Redeemer Emitter", "Reliant Emitter", "Relic Emitter", "Resilient Emitter", "Sinister Prophecy Emitter", "Sorcerer Emitter", "Templar Emitter", "Vengeance Emitter", "Venom Emitter", "Vigilant Emitter", "Viper Emitter" ]}, // Emitters
    {saberPart: "Pommel", partList: ["01 Pommel", "02 Pommel", "03 Pommel", "04 Pommel", "05 Pommel", "06 Pommel", "07 Pommel", "08 Pommel", "09 Pommel", "10 Pommel", "12 Pommel", "13 Pommel", "14 Pommel", "15 Pommel", "16 Pommel", "17 Pommel", "Avenger Pommel", "Commando Pommel", "Dissident Pommel", "Epoch Pommel", "Exile Pommel", "Fallen Pommel", "Fury Pommel", "Gladius Pommel", "Graflex Pommel", "Jade Fire Pommel", "Juggernaut Pommel", "Katana Pommel", "Outcast Pommel", "Pathfinder Pommel", "Prodigal Son Pommel", "Rebel Pommel", "Redeemer Pommel", "Relic Pommel", "Sorcerer Pommel", "Sinister Prophecy Pommel", "Venom Pommel", "Vigilant Pommel" ]}, // Pommels
    {saberPart: "Switch", partList: ["01 Switch", "02 Switch", "03 Switch", "04 Switch", "05 Switch", "06 Switch", "07 Switch", "08 Switch", "09 Switch", "10 Switch", "11 Switch", "12 Switch", "13 Switch", "14 Switch", "15 Switch", "16 Switch", "17 Switch", "Commando Switch", "Dissident Switch", "Epoch Switch", "Exile Switch", "Fallen Switch", "Fury Switch", "Gladius Switch", "Graflex Switch", "Jade Fire Switch", "Juggernaut Switch", "Katana Switch", "Mauler Switch", "Outcast Switch", "Pathfinder Switch", "Reborn Switch", "Redeemer Switch", "Redeemer Switch + Body", "Reliant Switch", "Resilient Switch", "Sinister Prophecy Switch", "Sorcerer Switch", "Vengeance Switch", "Venom Switch", "Vigilant Switch" ]} // Switches
  */];
}

const createItems = async (amountOfItems: number) => {
  const items = [];
  

  for (let i = 0; i < amountOfItems; i++) 
  {
    const saberParts = await client.saberPart.findMany();
    const saberPart = random.arrayElement(saberParts);
    const partNames = await client.partName.findMany( {where: {saberPartId: saberPart.id}});
    const partName = random.arrayElement(partNames);

    items.push({
      SaberPart: {create: {id: saberPart.id}},
      PartName: {connect: {id: partName.id}},
      partDescription: lorem.paragraph(),
      price: datatype.number(300),
    });
    console.log(items[items.length])
  }

  return items;
};

async function main() {

  await client.$connect();
  const saberPartPromises = createSaberParts().map(saberPart => {
    return client.saberPart.create({
      data: {
        name: saberPart
      }
    })
  });
  await Promise.all(saberPartPromises);

  const partNamePromisesInSecondDegree = createPartName().map(async partSet => {
   const partNames = await Promise.all(partSet.partList.map(async partName => {
      const saberPart = await client.saberPart.findFirst({where: {name: partSet.saberPart}})

      return client.partName.create({
        data: {
          name: partName,
          saberPartId: saberPart?.id
        }
      })
    }))
    return partNames
  })
  await Promise.all(partNamePromisesInSecondDegree);

  const items = await createItems(10);
  console.log(await client.user.create({
    data: {
      username: WEBSHOP_OWNER,
      inventory: { create: items },
      // inventory: { create: [{
      //   PartName: {create: {name: "d", SaberPart:{create: {name: "dlug"}}}}
      // }] },
      // inventory: { create: {
      //   SaberPart: {connect: {id: saberPart.id}},
      //   PartName: {connect: {id: partName.id}},
      //   partDescription: lorem.paragraph(),
      //   price: datatype.number(300),
      // }},
      details: { create: { firstName: 'Watto', lastName: 'Darkies' } },
      money: 21000,
    },
  }))
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await client.$disconnect();
  });
