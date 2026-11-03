const test = require('node:test'); const assert = require('node:assert');
const { server } = require('../src/server');
test('plan endpoint returns evaluation', async () => {
  await new Promise(r => server.listen(0, r));
  const p = server.address().port;
  const r = await (await fetch(`http://localhost:${p}/api/plan`, { method: 'POST', body: JSON.stringify({ request: 'art supplies' }) })).json();
  assert.ok(r.evaluation); assert.ok(r.cart.length);
  const c = await fetch(`http://localhost:${p}/api/checkout`, { method: 'POST', body: JSON.stringify({ cart: [{ name: 'x', price: 99, qty: 1, category: 'art' }] }) });
  assert.equal(c.status, 403);
  server.close();
});
