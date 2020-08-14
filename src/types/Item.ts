import { company, lorem, random } from 'faker';
import { schema } from 'nexus';

import { SaberParts } from './SaberPart';

const { arg, idArg } = schema;

const Item = schema.objectType({
  name: 'Item',
  definition(t) {
    t.model.id();
    t.field('saberPart', {
      type: 'String',
    });

    t.model.partDescription();
    t.model.partName();
    t.model.price();
  },
});

const ItemArgs = schema.inputObjectType({
  name: 'ItemArgs',
  definition: (t) => {
    t.string('partDescription', { required: true });
    t.string('partName', { required: true });
    t.field('saberPart', { type: 'String', required: true });
  },
});

const ItemQueries = schema.extendType({
  type: 'Query',
  definition: (t) => {
    t.crud.item();
    t.crud.items();
  },
});

const ItemMutations = schema.extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('itemCreate', {
      type: 'Item',
      args: { data: arg({ type: ItemArgs, required: true }) },
      resolve: (_, { data }, ctx) => {
        const { partName, partDescription, saberPart } = data;
        return ctx.db.item.create({
          data: {
            partName,
            partDescription,
            saberPart,
          },
        });
      },
    });

    t.field('randomItem', {
      type: 'User',
      args: { userId: idArg({ required: true }) },
      resolve: (_, args, ctx) => {
        const id = args.userId;
        console.log(id);
        const saberPartArry = [...SaberParts];

        return ctx.db.user.update({
          where: { id },
          data: {
            inventory: {
              create: {
                partDescription: lorem.paragraph(),
                saberPart: saberPartArry[random.number(saberPartArry.length - 1)],
                partName: company.bsBuzz(),
                price: Math.round(random.number(400)),
              },
            },
          },
        });
      },
    });

    t.field('itemUpdate', {
      type: 'Item',
      args: { id: idArg({ required: true }), data: arg({ type: ItemArgs, required: true }) },
      resolve: (_, { id, data }, { db }) => {
        return db.item.update({ where: { id }, data: { ...data } });
      },
    });

    t.field('itemDelete', {
      type: 'Item',
      args: { id: idArg({ required: true }) },
      resolve: (_, { id }, { db }) => {
        return db.item.delete({ where: { id } });
      },
    });
  },
});
