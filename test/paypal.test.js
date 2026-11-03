const test = require('node:test'); const assert = require('node:assert');
const { buildOrderBody } = require('../src/paypal');
test('order body totals', () => {
  const b = buildOrderBody([{ name: 'Pens', price: 2.5, qty: 2 }, { name: 'Pad', price: 4 }]);
  assert.equal(b.purchase_units[0].amount.value, '9.00');
  assert.equal(b.purchase_units[0].items.length, 2);
});
