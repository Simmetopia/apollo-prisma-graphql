import { objectType } from '@prisma/nexus/dist';

export const Transaction = objectType({
  name: 'Transaction',
  definition(t) {
    t.model.id();
    t.model.price();
    t.model.item({ type: 'Item' });
  },
});
