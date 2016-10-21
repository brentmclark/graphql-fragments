# GraphQL Fragments

Tools for dealing with GraphQL fragments.

## Installing

```bash
npm install -S graphql-fragments
```

## Usage

```js
import Fragment from 'graphql-fragments';
import gql from 'grapqhl-tag';

const fragmentDoc = gql`
  fragment Foo on Bar {
    field1
    field2
    ...SubFragment
  }
`;

// subFragment is the Fragment which defines `SubFragment` above
const fragment = new Fragment(fragmentDoc, subFragment);
```

## API

```js
fragment.fragments()
```
Return a list of fragment documents, suitable to be passed into [`client.watchQuery`](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.watchQuery)

```js
fragment.filter(data);
```
Assuming that `data` is of the type this fragment applies to, and is the result of a query that includes this fragment, filter out only the fields of `data` that are defined by this fragment.

```js
fragment.check(data)
```
Throw an error if `data` does not include all the fields that this fragment defines.

```js
fragment.propType
```
A function, much like `fragment.check`, suitable to be used by in a React [`propTypes` check](https://facebook.github.io/react/docs/reusable-components.html).

### Caveats

As we cannot know if a conditional sub-fragment should apply, we take a conservative approach:

  - when checking we do not error if fields from a conditional sub-fragment are missing
  - when filtering, we take sub fields from conditional sub-fragments where possible.
