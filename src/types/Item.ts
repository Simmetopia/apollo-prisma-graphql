import { arg, extendType, idArg, inputObjectType, objectType } from 'nexus';

const Item = objectType({
  name: 'Item',
  definition(t) {
    t.model.id();
    t.field('saberPart', {
      type: 'saberPart',
    });

    t.model.partDescription();
    t.model.partName();
  },
});

const ItemArgs = inputObjectType({
  name: 'ItemArgs',
  definition: t => {
    t.string('partDescription', { required: true });
    t.string('partName', { required: true });
    t.field('saberPart', { type: 'saberPart', required: true });
  },
});

const ItemQueries = extendType({
  type: 'Query',
  definition: t => {
    t.crud.item();
    t.crud.items();
  },
});

const ItemMutations = extendType({
  type: 'Mutation',
  definition: t => {
    t.field('itemCreate', {
      type: 'Item',
      args: { data: arg({ type: ItemArgs, required: true }) },
      resolve: (_, { data }, ctx) => {
        const { partName, partDescription, saberPart } = data;
        return ctx.photon.items.create({
          data: {
            partName,
            partDescription,
            isAvailableLocally: true,
            saberPart,
          },
        });
      },
    });

    t.field('itemUpdate', {
      type: 'Item',
      args: { id: idArg({ required: true }), data: arg({ type: ItemArgs, required: true }) },
      resolve: (_, { id, data }, { photon }) => {
        return photon.items.update({ where: { id }, data: { ...data } });
      },
    });

    t.field('itemDelete', {
      type: Item,
      args: { id: idArg({ required: true }) },
      resolve: (_, { id }, { photon }) => {
        return photon.items.delete({ where: { id } });
      },
    });
  },
});
export const ItemGraph = [Item, ItemQueries, ItemMutations];
