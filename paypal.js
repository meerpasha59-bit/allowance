// PayPal Orders v2 (sandbox). Credentials come from env vars only.
const BASE = process.env.PAYPAL_BASE || 'https://api-m.sandbox.paypal.com';
async function token(fetchImpl = fetch) {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
  const r = await fetchImpl(`${BASE}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  if (!r.ok) throw new Error('PayPal auth failed: ' + r.status);
  return (await r.json()).access_token;
}
function buildOrderBody(cart, currency = 'USD') {
  const items = cart.map(i => ({ name: i.name, quantity: String(i.qty || 1), unit_amount: { currency_code: currency, value: i.price.toFixed(2) } }));
  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0).toFixed(2);
  return { intent: 'CAPTURE', purchase_units: [{ amount: { currency_code: currency, value: total, breakdown: { item_total: { currency_code: currency, value: total } } }, items }] };
}
async function createOrder(cart, fetchImpl = fetch) {
  const t = await token(fetchImpl);
  const r = await fetchImpl(`${BASE}/v2/checkout/orders`, { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: JSON.stringify(buildOrderBody(cart)) });
  if (!r.ok) throw new Error('Create order failed: ' + r.status);
  return r.json();
}
module.exports = { createOrder, buildOrderBody };
