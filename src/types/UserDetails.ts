import { objectType } from '@prisma/nexus/dist';

export const UserDetails = objectType({
  name: 'UserDetails',
  definition(t) {
    t.model.id();
    t.model.firstName();
    t.model.lastName();
    t.model.user({ type: 'User' });
  },
});
