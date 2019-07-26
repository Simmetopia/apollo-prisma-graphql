# To the moon with Apollo!

## Contents of the workshop

**We wil**

1. Learn about GraphQL Schemas
1. The role a GraphQL schema plays in development
1. What a strongly typed contract schema (GrahpQL) means
1. How we define a database schema
1. How we choose to expose our database schema to the client
1. How to consume our api on the frontend
1. How the apollo frontend cache works

# The theory

A graphql type

```graphql
type User {
  id: ID!
  name: String
  purchases: [Transaction!]
  sells: [Transaction!]
  username: String!
}
```
