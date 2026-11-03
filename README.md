# Allowance
AI shopping agent that spends within a PayPal-enforced budget (PayPal Orders v2, sandbox only).
Describe what you need; the agent builds a cart, explains it, and the rules engine auto-approves or asks a human.

Run: `PAYPAL_CLIENT_ID=... PAYPAL_SECRET=... [LLM_API_KEY=...] node src/server.js` ; test: `npm test`. Copy `.env.example`.
