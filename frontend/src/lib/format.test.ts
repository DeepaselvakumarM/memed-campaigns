import { formatRupees, percentSpent } from './format';

describe('formatRupees', () => {
  it('uses Indian digit grouping without decimals', () => {
    expect(formatRupees(120000)).toBe('₹1,20,000');
  });
});

describe('percentSpent', () => {
  it.each([
    [0, 1000, 0],
    [500, 1000, 50],
    [999, 1000, 99], // rounds down so 100% only shows when fully spent
    [1000, 1000, 100],
    [10, 0, 0],
  ])('%i of %i is %i%%', (spent, total, expected) => {
    expect(percentSpent(spent, total)).toBe(expected);
  });
});
