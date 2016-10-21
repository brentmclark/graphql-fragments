import graphqlAnywhere from 'graphql-anywhere';

import {
  getFragmentDefinitions,
  addFragmentsToDocument } from 'graphql-anywhere/lib/src/getFromAST';

import {
  Document,
  FragmentDefinition,
} from 'graphql';

export default class Fragment {
  private doc: Document;
  private children: Fragment[];

  constructor(doc: Document, ...children: Fragment[]) {
    this.doc = doc;
    this.children = children;

    this.propType = this.propType.bind(this);
  }

  public fragments(): FragmentDefinition[] {
    return getFragmentDefinitions(this.fragmentDocument());
  }

  public filter(data: any): any {
    const resolver = (
      fieldName: string,
      root: any,
      args: any,
      context: any,
      info: any
    ) => {
      return root[info.resultKey];
    };

    return graphqlAnywhere(resolver, this.fragmentDocument(), data);
  }

  public check(data: any) {
    const resolver = (
      fieldName: string,
      root: any,
      args: any,
      context: any,
      info: any
    ) => {
      if (!{}.hasOwnProperty.call(root, info.resultKey)) {
        throw new Error(`${info.resultKey} missing on ${root}`);
      }
      return root[info.resultKey];
    };

    graphqlAnywhere(resolver, this.fragmentDocument(), data, {}, {}, {
      fragmentMatcher: () => false,
    });
  }

  public propType(props: any, propName: string) {
    const prop = props[propName];
    try {
      this.check(prop);
      return null;
    } catch (e) {
      // Need a much better error.
      // Also we aren't checking for extra fields
      return e;
    }
  }

  private childFragments(): FragmentDefinition[] {
    return [].concat(...this.children.map(c => c.fragments()));
  }

  private fragmentDocument(): Document {
    return addFragmentsToDocument(this.doc, this.childFragments());
  }
}
