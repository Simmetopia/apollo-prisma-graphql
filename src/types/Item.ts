
import { objectType, inputObjectType, extendType, stringArg, nonNull, list } from 'nexus';
import { Item } from "nexus-prisma"
import { readFileSync } from 'fs';

export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field('saberPart', {
      type: 'String',
    });
    t.field('partName', {
      type: 'String'
    });
  },
});

export const ItemArgs = inputObjectType({
  name: 'ItemArgs',
  definition: (t) => {
    t.string('partDescription');
    t.string('partName');
    t.string('saberPart');
  },
});

export const ItemQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field("items", {
      type: nonNull(list(nonNull('Item'))),
      resolve: (source, args, ctx) =>
      {
        return ctx.db.item.findMany();
      }
    })
  },
});

export const ItemMutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field("itemCreate", {
      type: "Item",
      resolve: async (source, args, ctx) => {

        const saberParts = ["Addon", "Body", "Emitter", "Pommel", "Switch"]
        const saberPart = saberParts[Math.floor(Math.random() * saberParts.length)];
        
        let partName = "~";

        const variable = readFileSync(__dirname + "/../assets/SaberParts/" + saberPart + "List.txt").toString();
        var lines = variable.split('\r\n');
        partName = lines[Math.floor(Math.random() * lines.length)];

        console.log(partName);
      
        return await ctx.db.item.create({ data: { partName: partName, saberPart: saberPart }});
      }
    })
  },
});
