import { schema } from 'nexus';

export const WEBSHOP_OWNER = 'dark_saber_dealer_69';

export const webshopQueries = schema.extendType({
  type: 'Query',
  definition: (t) => {
    t.field('getWebshopContent', {
      type: 'Item',
      list: true,
      resolve: (_parent, _args, ctx) => {
        return ctx.db.item.findMany({ where: { User: { username: WEBSHOP_OWNER } } });
      },
    });
  },
});

export default [webshopQueries];
