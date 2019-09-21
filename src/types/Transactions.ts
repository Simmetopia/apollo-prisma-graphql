import { objectType } from 'nexus';

export const Transaction = objectType({
  name: 'Transaction',
  definition(t) {
    t.model.id();
    t.model.price();
    t.model.item({ type: 'Item' });
  },
});
