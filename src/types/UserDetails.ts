import { objectType } from 'nexus';
import { UserDetails } from 'nexus-prisma';

export const userDetails = objectType({
  name: UserDetails.$name,
  description: UserDetails.$description,
  definition(t) {
    t.field(UserDetails.id), t.field(UserDetails.lastName);
  },
});
