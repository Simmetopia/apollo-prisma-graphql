import { objectType } from '@prisma/nexus/dist';

export const Item = objectType({
  name: 'Item',
  definition(t) {
    t.model.id();
    // @ts-ignore
    t.model.saberPart({ type: 'SaberPart' });
    t.model.partDescription();
    t.model.partName();
  },
});
