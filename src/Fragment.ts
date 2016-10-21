import graphql from 'graphql-anywhere';
import {
  getFragmentDefinitions,
  addFragmentsToDocument } from 'graphql-anywhere/lib/src/getFromAST';

import {
  Document,
  FragmentDefinition,
} from 'graphql';

export default class Fragment {
  private document: Document;
  private children: Fragment[];

  constructor(document: Document, ...children: Fragment[]) {
    this.document = document;
    this.children = children;

    this.propType = this.propType.bind(this);
  }

  childFragments(): FragmentDefinition[] {
    return [].concat(...this.children.map(c => c.fragments()));
  }

  fragmentDocument(): Document {
    return addFragmentsToDocument(this.document, this.childFragments());
  }

  fragments(): FragmentDefinition[] {
    return getFragmentDefinitions(this.fragmentDocument());
  }

  filter(data: any): any {
    const resolver = (
      fieldName: string,
      root: any,
      args: any,
      context: any,
      info: any
    ) => {
      return root[info.resultKey];
    }

    return graphql(resolver, this.fragmentDocument(), data);
  }

  check(data: any) {
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
    }

    graphql(resolver, this.fragmentDocument(), data, {}, {}, {
      fragmentMatcher: () => false,
    });
  }

  propType(props: any, propName: string) {
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
}
