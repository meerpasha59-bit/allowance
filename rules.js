// Allowance rules engine: decides if a cart fits the PayPal-enforced budget.
function evaluateCart(cart, policy) {
  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const violations = [];
  if (total > policy.perPurchaseLimit) violations.push(`Total $${total.toFixed(2)} exceeds per-purchase limit $${policy.perPurchaseLimit}`);
  if (policy.spent + total > policy.budget) violations.push(`Would exceed budget: $${(policy.spent + total).toFixed(2)} of $${policy.budget}`);
  for (const i of cart) if ((policy.blockedCategories || []).includes(i.category)) violations.push(`${i.name}: category "${i.category}" is blocked`);
  return { total: Math.round(total * 100) / 100, violations, decision: violations.length ? 'needs_approval' : 'auto_approve' };
}
module.exports = { evaluateCart };
