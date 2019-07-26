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

type Query {
  user(userId: ID!): User
}
```

A query on the type

```graphql
query MyNewUserQuery($id: ID!) {
  user(userId: $id) {
    name
    id
    username
  }
}
```

Quite a few things is happening here, firstly we declare our user type. Secondly we declare new type called Query which will hold
all the data access functions we want to be able to run on our server.

We have declared at single one which will, given a user id, fetch that user.

In the query part we make a new **Named** query called `MyNewUserQuery` which takes an id as a veriable. This varible is passed into the function below wich in turn tries to fetch the user with that ID.

If the user exists we will get a object matching the queried data structure.

```json
{
  "user": {
    "name": "the  name",
    "id": "the id",
    "username": "the username"
  }
}
```
