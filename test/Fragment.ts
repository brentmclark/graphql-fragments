import * as chai from 'chai';
const { assert } = chai;
import gql from 'graphql-tag';

import Fragment from '../src/Fragment';

describe('Fragment', () => {
  describe('with a single fragment', () => {
    const doc = gql`
      fragment PersonDetails on Person {
        alias: name
        height(unit: METERS)
        avatar {
          square
        }
      }
    `;
    const fragment = new Fragment(doc);
    const data = {
      alias: 'Bob',
      name: 'Wrong',
      height: 1.89,
      avatar: {
        square: 'abc',
        circle: 'def',
        triangle: 'qwe',
      },
    };
    const filteredData = {
      alias: 'Bob',
      height: 1.89,
      avatar: {
        square: 'abc',
      },
    };

    it('returns a fragmentDocument', () => {
      assert.deepEqual(fragment.fragmentDocument(), doc);
    });

    it('can filter data', () => {
      assert.deepEqual(fragment.filter(data), filteredData);
    });

    it('can check matching data', () => {
      fragment.check(filteredData);
    });

    // This doesn't throw but potentially it should?
    it('can check overspecified data', () => {
      fragment.check(data);
    });

    it('throws when checking underspecified data', () => {
      assert.throws(() => {
        fragment.check({
          name: 'Wrong'
        });
      });

      assert.throws(() => {
        fragment.check({
          alias: 'Bob',
          height: 1.89,
        });
      });
    });
  });

  describe('with nested fragments', () => {
    const doc = gql`
      fragment PersonDetails on Person {
        alias: name
        height(unit: METERS)
        avatar {
          square
          ... on Avatar {
            circle
          }
        }
      }
    `;
    const fragment = new Fragment(doc);
    const data = {
      alias: 'Bob',
      name: 'Wrong',
      height: 1.89,
      avatar: {
        square: 'abc',
        circle: 'def',
        triangle: 'qwe',
      },
    };
    const filteredData = {
      alias: 'Bob',
      height: 1.89,
      avatar: {
        square: 'abc',
        circle: 'def',
      },
    };

    it('returns a fragmentDocument', () => {
      assert.deepEqual(fragment.fragmentDocument(), doc);
    });

    it('can filter data', () => {
      assert.deepEqual(fragment.filter(data), filteredData);
    });

    it('can check matching data', () => {
      fragment.check(filteredData);
    });

    // This doesn't throw but potentially it should?
    it('can check overspecified data', () => {
      fragment.check(data);
    });

    it('throws when checking underspecified data', () => {
      assert.throws(() => {
        fragment.check({
          name: 'Wrong'
        });
      });

      assert.throws(() => {
        fragment.check({
          alias: 'Bob',
          height: 1.89,
        });
      });

      assert.throws(() => {
        fragment.check({
          alias: 'Bob',
          height: 1.89,
          avatar: {
            // missing the correct field
            triangle: 'qwe',
          },
        });
      });
    });

    describe('if the nested fragment has not matched', () => {
      it('can filter data', () => {
        const filtered = fragment.filter({
          alias: 'Bob',
          name: 'Wrong',
          height: 1.89,
          avatar: {
            square: 'abc',
            // there is no circle field here, but we can't know if that's not
            // because avatar is not an Avatar
            triangle: 'qwe',
          },
        });

        assert.deepEqual(filtered, {
          alias: 'Bob',
          height: 1.89,
          avatar: {
            square: 'abc',
          },
        });
      });

      it('does not throw when checking', () => {
        fragment.check({
          alias: 'Wrong',
          height: 1.89,
          avatar: {
            square: 'abc',
            // there is no circle field here, but we can't know if that's not
            // because avatar is not an Avatar
          },
        });
      })
    });
  });
});
