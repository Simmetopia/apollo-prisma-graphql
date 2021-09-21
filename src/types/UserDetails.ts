import { idArg, nonNull, objectType, extendType } from 'nexus';
import {UserDetails} from 'nexus-prisma'

export const userDetails = objectType({
  name: UserDetails.$name,
  description: UserDetails.$description,
  definition(t) {
    t.field(UserDetails.id),
    t.field(UserDetails.firstName)
    t.field(UserDetails.lastName)
  }
})

export const UserDetailsQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('GetUserDetails', {
      type: "UserDetails",
      args: {id:nonNull(idArg())},
      resolve: (source, args, context) => {
        return context.db.userDetails.findFirst({
          where: {id:args.id}
        })
      }
    })
  },
});

// t.field('GetUsersList', {
//   type: list('User'),
//   resolve: (source, args, context) => {
//     return context.db.user.findMany();
//   },
// });
// t.field("GetUser", {
//   type: "User",
//   args: {id:nonNull(idArg())},
//   resolve: (source, args, context) => {
//     return context.db.user.findFirst({
//       where: {id:args.id}
//     });
//   }
// });