import * as chai from 'chai';
const { assert } = chai;
import gql from 'graphql-tag';
import { PropTypes } from 'react';

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
          name: 'Wrong',
        });
      });

      assert.throws(() => {
        fragment.check({
          alias: 'Bob',
          height: 1.89,
        });
      });
    });

    it('can check propTypes', () => {
      assert.isNull(fragment.propType({ field: data }, 'field'));
      assert.isNotNull(fragment.propType({ field: { name: 'Wrong' } }, 'field'));
    });

    describe('with an array of data', () => {
      const arrayData = [{
        alias: 'Bob',
        name: 'Wrong',
        height: 1.89,
        avatar: {
          square: 'abc',
          circle: 'def',
          triangle: 'qwe',
        },
      }, {
        alias: 'Alice',
        name: 'Wrongtoo',
        height: 1.99,
        avatar: {
          square: 'xyz',
        },
      }];
      const filteredArrayData = [{
        alias: 'Bob',
        height: 1.89,
        avatar: {
          square: 'abc',
        },
      }, {
        alias: 'Alice',
        height: 1.99,
        avatar: {
          square: 'xyz',
        },
      }];

      it('can filter data', () => {
        assert.deepEqual(fragment.filter(arrayData), filteredArrayData);
      });

      it('can check propTypes', () => {
        const propType = PropTypes.arrayOf(fragment.propType);
        // We have to do this fireable offence to test our propType can be used
        assert.isNull(propType({ field: arrayData }, 'field',
          'a', 'b', 'c', 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'));
        assert.isNotNull(propType({ field: { name: 'Wrong' } }, 'field',
          'a', 'b', 'c', 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'));
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
          name: 'Wrong',
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
      });
    });
  });
});
