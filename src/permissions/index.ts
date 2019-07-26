import { rule, shield, allow } from 'graphql-shield';
import { getUserId } from '../utils';

const rules = {
  isAuthenticatedUser: rule()((parent, args, context) => {
    const userId = getUserId(context);
    return Boolean(userId);
  }),
  isPostOwner: rule()(async (parent, { id }, context) => {
    const userId = getUserId(context);
    const author = await context.photon.posts
      .findOne({
        where: {
          id,
        },
      })
      .author();
    return userId === author.id;
  }),
};

export const permissions = shield({
  Query: {
    GetUsers: rules.isAuthenticatedUser,
  },
  Mutation: {
    CreateUser: allow,
  },
});
