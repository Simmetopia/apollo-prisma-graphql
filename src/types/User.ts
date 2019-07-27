import { objectType } from '@prisma/nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    // @ts-ignore
    t.model.details({ type: 'UserDetails' });
    t.model.purchases({ type: 'Transaction' });
    t.model.sells({ type: 'Transaction' });
    t.model.username();
  },
});
