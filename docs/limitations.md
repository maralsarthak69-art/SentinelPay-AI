# SentinelPay — Technical Limitations & Production Roadmap

## Honest Technical Boundaries

While SentinelPay is fully functional and backed by empirical training on 250,000 transactions, hackathon judges should note the following real-world technical boundaries:

---

## 1. Current System Limitations

1. **PIN Code Coverage Scope**
   - The current `pincode_risk_index.json` indexes **38,941 Indian PIN codes**.
   - *Limitation:* Brand-new or newly assigned postal codes fall back to regional cluster averages ($0.25$ baseline risk).

2. **Multimodal Vision Fallback**
   - When a valid `GEMINI_API_KEY` is provided, return claim verification uses live multimodal Gemini VLM API calls.
   - *Limitation:* If no API key is configured or during network timeouts, the system falls back to rule-based optical inspection heuristics.

3. **Courier API Integration**
   - While SentinelPay outputs standardized decision payloads (`FULFILL_COD`, `PROMPT_UPI_ADVANCE`, `ENFORCE_PREPAYMENT`), direct webhook integration with third-party logistics (3PL) carriers (e.g. Delhivery, Shiprocket) requires production merchant API credentials.

4. **Address Quality Heuristics**
   - Address completeness is currently scored via text heuristics (presence of house numbers, landmark density, street length). Deep NLP address parsing (e.g., Libpostal) is planned for future releases.

---

## 2. Production Roadmap

- [ ] **Direct Shopify / WooCommerce Plugin:** One-click integration with merchant checkout.
- [ ] **Razorpay Magic Checkout Integration:** Native dynamic UPI advance popups directly inside Razorpay checkout flow.
- [ ] **Graph Neural Network (GNN) Fraud Ring Detection:** Mapping buyer phone numbers across D2C stores to catch organized fraud syndicates.
