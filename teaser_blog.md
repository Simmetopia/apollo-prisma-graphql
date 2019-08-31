Some weeks ago i teased about a new technology called prisma2.

In the end of September (23') i will be doing a workshop in these exact technologies to show how you would go about writing a very barebone webshop.

This specific web shop is for Watto who is a known slavetrader based out of tatooine.

Quite suddenly he stumpled upon some lightsaber parts which he is trying to fence over a webshop which __you__ have been hired to build.

First of we design the needed functionality.

## The Model
Since we will be dealing with users and trading we need some kind of tradeable item. This specific webshop will only handle the trade of items.

A lightsaber item could be designed as :

```
model Item {
  id                 String     @default(cuid()) @id @unique
  saberPart          SaberParts
  partName           String
  partDescription    String?
  price              Float?
}

enum SaberParts {
  CRYSTAL
  POWER_CORE
  CRYSTAL_VIBRATOR
  HILT
}
```
These items will be traded in a Transaction. These transaction will have a buyer and a seller. This will also be the bill of sales for both parties.

Also we need a user which will hold a reference to the sells and purchases they have made.

Pretty good so far.

## The backend schema

After having created the underlying data structure, we need to find the best way to expose this data to our webshop.

First of all we need users. These users should be able to signup and login after having signed up.

For brevity a user is only specified by a unique username. To construct our app schema we will be using prisma/nexus. Prisma nexus is a code-first app schema creation tool.

The root type of a graphql schema will be `{Mutation: {...}, Query: {...}, Subscription: {...} }`. 

The subscription part is left out since this is used to implement a websocket like interface, and is not needed for this specific underground webshop. 

To be able to specify the different mutations and queries on our app schema, GraphQL needs to know what kind of types it will return.

Lets implement how our Item model would look when implemented on our app schema:

```typescript
const Item = objectType({
  name: 'Item',
  definition(t) {
    t.model.id();
    t.field('saberPart', {
      type: 'saberPart',
    });

    t.model.partDescription();
    t.model.partName();
  },
});
```
In this code we are specifying that on our schema there exists an objectType called `'Item'`. The definition of this type is specified in the definition function. 

Since we have used prisma nexus to write our schema, we can use a field on `t` called `model`. This will take the value defined in the model and put that on the appschema. When using typescript, you will even have intellisense for these types.

When defining a new type, the `t.field` is used. The first string will be the name of the field, and after will be the type. As we remember from the database model shown before, the `saberPart` is an enum type.

__We got the model down, now to change it!__
This is where we will be defining keys on query and mutation part of the GraphQL schema. Lets start by how we would create an item.
```typescript
const ItemArgs = inputObjectType({
  name: 'ItemArgs',
  definition: t => {
    t.string('partDescription', { required: true });
    t.string('partName', { required: true });
    t.field('saberPart', { type: 'saberPart', required: true });
  },
});

t.field('itemCreate', {
	type: 'Item',
	args: { data: arg({ type: ItemArgs, required: true }) },
	resolve: (_, { data }, ctx) => {
		const { partName, partDescription, saberPart } = data;
		return ctx.photon.items.create({
			data: {
				partName,
				partDescription,
				isAvailableLocally: true,
				saberPart,
			},
		});
	},
});
```
The `t.field` shown above is a definition field on a type called Mutation, defined just like the Item type. 

These fields however will control what arguments this `mutation` will have. Above the mutation will have an argument called `data` which is of the `ItemArgs` type. 

Lastly in the resolver is where the actual magic is happening, here we are taking `data` from the arguments, and the `ctx` which ApolloServer will inject into every resolver, we can create our type. Photon is a auto generated object that acts as and interface to our database. 

The `ctx.photon.items.create` return a promise, but ApolloServer is smart enough to know that is has to wait for the data before returning data to the client.






