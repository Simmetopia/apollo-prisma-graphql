import { idArg, nonNull, objectType, extendType, inputObjectType, arg, list } from 'nexus';
import { User, UserDetails } from 'nexus-prisma'

export const userDetails = objectType({
  name: UserDetails.$name,
  description: UserDetails.$description,
  definition(t) {
    t.field(UserDetails.id);
    t.field(UserDetails.user);
    t.field(UserDetails.firstName);
    t.field(UserDetails.lastName);
  }
})

export const UserDetailsQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('GetAllUserDetails', {
      type: list("UserDetails"),
      resolve: (source, args, context) => {
        return context.db.userDetails.findMany()
      }
    }),
      t.field("GetUserDetails", {
        type: "UserDetails",
        args: { input: arg({
          type: nonNull(inputObjectType({
            name: "GetUserDetailsInputArgs",
            definition(t) {
              t.nonNull.id("id")
            }
          }))
        }) },
        resolve: (source, {input: {id}}, context) => {
          return context.db.userDetails.findFirst({
            where: { id: id }
          })
        }
      })
  },

});


export const UserDetailsMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field("userDetailsCreate", {
      type: "UserDetails",
      args: {
        input: arg({
          type: nonNull(inputObjectType({
            name: "UserDetailsCreateInputArgs",
            definition(t) {
              t.field("user", {
                type: nonNull(inputObjectType({
                  name: "UserDetailsCreateInputArgsUser",
                  definition(t) {
                    t.nonNull.id("id")
                  }
                }))
              }),
                t.nonNull.string("firstName")
              t.string("lastName")
            }
          }))
        }),
      },
      resolve: (source, { input: { user: { id: userId }, firstName, lastName } }, context) => {
        return context.db.userDetails.create({
          data: { firstName, lastName, userId }
        })
      }
    });
  },
});
//Hello simon
//Hello 
