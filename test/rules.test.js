const test = require('node:test'); const assert = require('node:assert');
const { evaluateCart } = require('../src/rules');
const policy = { budget: 50, spent: 10, perPurchaseLimit: 25, blockedCategories: ['gambling'] };
test('auto approves within limits', () => {
  assert.equal(evaluateCart([{ name: 'Pens', price: 5, qty: 2, category: 'school' }], policy).decision, 'auto_approve');
});
test('flags limit and budget', () => {
  const r = evaluateCart([{ name: 'Set', price: 45, category: 'school' }], policy);
  assert.equal(r.decision, 'needs_approval'); assert.equal(r.violations.length, 2);
});
test('blocks category', () => {
  assert.equal(evaluateCart([{ name: 'Chips', price: 1, category: 'gambling' }], policy).violations.length, 1);
});
