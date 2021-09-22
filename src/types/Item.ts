import { company, lorem, random } from 'faker';
import { objectType, inputObjectType, idArg, arg, extendType } from 'nexus';
import {Item} from "nexus-prisma"



export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field('saberPart', {
      type: 'String',
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
  },
});

export const ItemMutations = extendType({
  type: 'Mutation',
  definition: (t) => {

  },
});
