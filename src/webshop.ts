import { extendType } from 'nexus';

const WEBSHOP_OWNER = 'dark_saber_dealer_69';

export const webshopQueries = extendType({
  type: 'Query',
  definition: t => {
    t.field('getWebshopContent', {
      type: 'Item',
      list: true,
      resolve: (_parent, _args, ctx) => {
        return ctx.photon.items({ where: { user: { username: WEBSHOP_OWNER } } });
      },
    });
  },
});

export default [webshopQueries];
