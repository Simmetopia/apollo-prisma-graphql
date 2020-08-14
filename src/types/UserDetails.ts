import { schema } from 'nexus';

export const UserDetails = schema.objectType({
  name: 'UserDetails',
  definition(t) {
    t.model.id();
    t.model.firstName();
    t.model.lastName();
    t.model.user({ type: 'User' });
  },
});
