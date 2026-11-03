// Cart-building agent. Uses an LLM if LLM_API_KEY (OpenAI-compatible) is set; otherwise a keyword fallback.
const CATALOG = [
  { sku: 'pencils', name: 'Colored pencils (24)', price: 6.5, category: 'art' },
  { sku: 'sketchbook', name: 'Sketchbook A4', price: 8.99, category: 'art' },
  { sku: 'paints', name: 'Watercolor set', price: 11.0, category: 'art' },
  { sku: 'notebook', name: 'Ruled notebook 3-pack', price: 7.25, category: 'school' },
  { sku: 'backpack', name: 'School backpack', price: 34.0, category: 'school' },
  { sku: 'candy', name: 'Candy box', price: 4.0, category: 'sweets' },
  { sku: 'headphones', name: 'Wired headphones', price: 19.99, category: 'electronics' },
];
function fallbackPlan(request, budget) {
  const words = request.toLowerCase();
  const picks = CATALOG.filter(i => words.includes(i.category) || words.includes(i.sku) || words.includes(i.name.split(' ')[0].toLowerCase()));
  const cart = []; let t = 0;
  for (const i of picks.sort((a, b) => a.price - b.price)) if (t + i.price <= budget) { cart.push({ ...i, qty: 1 }); t += i.price; }
  return { cart, explanation: cart.map(i => `${i.name} ($${i.price}) matches your request`).join('; ') || 'No matching items within budget.' };
}
async function planCart(request, budget, fetchImpl = fetch) {
  const key = process.env.LLM_API_KEY;
  if (!key) return fallbackPlan(request, budget);
  const res = await fetchImpl(process.env.LLM_URL || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.LLM_MODEL || 'gpt-4o-mini', response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: `Pick items from this catalog for the request, within $${budget}. Reply JSON {"skus":[...],"explanation":"..."}. Catalog: ${JSON.stringify(CATALOG)}` }, { role: 'user', content: request }] }) });
  const j = JSON.parse((await res.json()).choices[0].message.content);
  const cart = (j.skus || []).map(s => CATALOG.find(c => c.sku === s)).filter(Boolean).map(i => ({ ...i, qty: 1 }));
  return { cart, explanation: j.explanation };
}
module.exports = { CATALOG, planCart, fallbackPlan };
