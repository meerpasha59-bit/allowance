const http = require('http'); const fs = require('fs'); const path = require('path');
const { planCart } = require('./agent'); const { evaluateCart } = require('./rules'); const { createOrder } = require('./paypal');
const policy = { budget: 100, spent: 0, perPurchaseLimit: 25, blockedCategories: ['sweets'] };
const ledger = [];
const body = req => new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => { try { r(JSON.parse(d || '{}')); } catch { r({}); } }); });
const send = (res, code, o) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
async function handler(req, res) {
  if (req.method === 'GET' && req.url === '/api/state') return send(res, 200, { policy, ledger });
  if (req.method === 'POST' && req.url === '/api/plan') {
    const { request } = await body(req);
    const plan = await planCart(String(request || ''), policy.budget - policy.spent);
    return send(res, 200, { ...plan, evaluation: evaluateCart(plan.cart, policy) });
  }
  if (req.method === 'POST' && req.url === '/api/checkout') {
    const { cart, approved } = await body(req);
    const ev = evaluateCart(cart || [], policy);
    if (ev.decision === 'needs_approval' && !approved) return send(res, 403, { error: 'Human approval required', evaluation: ev });
    try { const order = await createOrder(cart); policy.spent += ev.total; ledger.push({ id: order.id, total: ev.total, status: order.status, approved: !!approved }); return send(res, 200, { order, ledger }); }
    catch (e) { return send(res, 502, { error: e.message }); }
  }
  const f = path.join(__dirname, '../public', req.url === '/' ? 'index.html' : path.basename(req.url));
  if (fs.existsSync(f)) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(fs.readFileSync(f)); }
  send(res, 404, { error: 'not found' });
}
const server = http.createServer((q, s) => handler(q, s).catch(e => send(s, 500, { error: e.message })));
if (require.main === module) server.listen(process.env.PORT || 3000);
module.exports = { server, policy };
