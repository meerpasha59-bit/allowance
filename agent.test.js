const test = require('node:test'); const assert = require('node:assert');
const { fallbackPlan } = require('../src/agent');
test('fallback stays in budget', () => {
  const r = fallbackPlan('art supplies', 20);
  assert.ok(r.cart.length > 0); assert.ok(r.cart.reduce((s, i) => s + i.price, 0) <= 20);
});
