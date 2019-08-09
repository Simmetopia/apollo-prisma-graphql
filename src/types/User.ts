import { objectType } from '@prisma/nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.field('computedField', {
      type: 'String',
      resolve: () => 'some computed value',
    });
    t.model.details();
    t.model.purchases({ type: 'Transaction' });
    t.model.sells({ type: 'Transaction' });
    t.model.username();
  },
});
