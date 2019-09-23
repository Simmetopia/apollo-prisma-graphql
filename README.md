---
presentation:
  theme: league.css
---

<!-- slide -->

# To the moon with Apollo!


<!-- slide -->
# IT-MINDS

* Founded 2010 <!-- .element: class="fragment" data-fragment-index="1" -->
* Software consultancy for young talents <!-- .element: class="fragment" data-fragment-index="2" -->
* Offices in Aarhus, Copenhagen, Oslo and Aalborg <!-- .element: class="fragment" data-fragment-index="3" -->
* 180 employees <!-- .element: class="fragment" data-fragment-index="4" -->
* 450 customers <!-- .element: class="fragment" data-fragment-index="5" -->
* 280 projects<!-- .element: class="fragment" data-fragment-index="6" -->

<!-- slide -->
## Ida Lindgren
### master of HR
29888321 - ili@it-minds.dk
<!-- slide -->

## Contents of the workshop

**We will**

1. Learn about GraphQL Schemas
1. The role a GraphQL schema plays in development
1. What a strongly typed contract schema (GrahpQL) means
1. How we define a database schema
1. How we choose to expose our database schema to the client
1. How to consume our api on the frontend
1. How the apollo frontend cache works

<!-- slide -->

# The theory

<!-- slide -->

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

<!-- slide -->

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

<!-- slide vertical=true -->

Quite a few things is happening here, firstly we declare our user type. Secondly we declare new type called Query which will hold
all the data access functions we want to be able to run on our server.

We have declared at single one which will, given a user id, fetch that user.

<!-- slide vertical=true -->

In the query part we make a new **Named** query called `MyNewUserQuery` which takes an id as a veriable. This varible is passed into the function below wich in turn tries to fetch the user with that ID.

If the user exists we will get a object matching the queried data structure.

<!-- slide -->

```json
{
  "user": {
    "name": "the  name",
    "id": "the id",
    "username": "the username"
  }
}
```

This is pretty neat, since we know how the data will be recieved by the query that we write.

<!-- slide -->

## The backend stack

- **Database:** SQLite (easy no setup required database)
- **ORM**: Prisma2 Photon
- **Migration Manager:** Prisma2 Lift
- **Network Layer:** ApolloServer

<!-- slide vertical=true -->

## Database

SQLite is an easy development prototyping DB.

<!-- slide vertical=true -->

## ORM (Object Relation Mapper)

Photon will take our database schema and create I/O functions our server will be able to use.

Photon will then be able to be instanced and used like:

```typescript
new Photon().users.create({
  data: { name: 'Watto', username: 'Watto_jedi_sith_reseller' },
});
```

Which will in one go write the changes to the databse.

<!-- slide vertical=true -->

## Migration Manager

When you change your schema, you will have to write those changes to the database. This is where _Lift_ comes into the picture.

To add the migration to the database

```bash
prisma2 lift save --name "My new migration changes"
```

To push the migration changes to the database

```bash
prisma2 lift up
```

Reverts the last migration

```bash
prisma2 lift down 1
```

<!-- slide vertical=true -->

## Network layer

This is the part that will recieve the request and make sure the right context (with photon inejcted) is passed down to the resolvers that will handle the individual request. (More in this later).

<!-- slide -->

The frontend

JSX, the javascript of html.

```typescript 
<Initialization>
  <App/>
</Initialization>
```

<!-- slide -->
## A frontend query:

```typescript
const items_query = gql`
  query UserQuery($id: ID) {
    user(where: { id: $id }) @connection(key: "user_items") {
      id
      inventory {
        ...item_fragment
      }
    }
  }
  ${item_fragment}
`;
```	

<!-- slide -->
## Show in code


<!-- slide -->
## Assignments:

1. This is how you remind me?
1. WHAT!? NO SELLING!?
1. AND NO MONEY!?



