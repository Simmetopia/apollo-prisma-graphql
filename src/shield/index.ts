import { ApolloError, AuthenticationError } from 'apollo-server-errors';
import { allow, deny, not, rule, shield } from 'graphql-shield';

const isAuthenticated = rule()(async (source, args, ctx) => {
  return !!ctx.user ? true : new AuthenticationError('yikes');
});

export const permissions = shield(
  {
    Query: {
      '*': isAuthenticated,
    },
    Subscription: {
      '*': allow,
    },
    Mutation: {
      '*': isAuthenticated,
      userLogin: allow,
      userCreate: allow,
    },
  },
  {
    fallbackRule: allow,
    fallbackError: async (thrownThing, parent, args, context, info) => {
      if (thrownThing instanceof ApolloError) {
        // expected errors
        return thrownThing;
      } else if (thrownThing instanceof Error) {
        // unexpected errors
        console.error(thrownThing);
        return new ApolloError('Internal server error', 'ERR_INTERNAL_SERVER');
      } else {
        // what the hell got thrown
        console.error('The resolver threw something that is not an error.');
        console.error(thrownThing);
        return new ApolloError('Internal server error', 'ERR_INTERNAL_SERVER');
      }
    },
  },
);
