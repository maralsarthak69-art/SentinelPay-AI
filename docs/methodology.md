# SentinelPay — Technical Methodology & Mathematics

## Problem Formulation

In Indian D2C and e-commerce, Return-to-Origin (RTO) on Cash on Delivery (COD) orders reaches **20% to 35%**, inflicting severe shipping lost costs ($\text{C}_{\text{RTO}} \approx \text{₹}180$ per return). However, naive rule-based filters that block COD indiscriminately cause customer churn, losing the Customer Lifetime Value ($\text{C}_{\text{LTV}} \approx \text{₹}650$).

SentinelPay formulates pre-dispatch RTO risk management as a **Cost-Utility Optimization Problem** rather than a simple classification task.

---

## 1. Cost-Utility Mathematical Model

Let:
- $y \in \{0, 1\}$ be the ground truth label ($1 = \text{RTO / Non-Delivery}$, $0 = \text{Successful Delivery}$).
- $\hat{y} \in \{0, 1\}$ be the model decision ($1 = \text{Intervene/Block COD}$, $0 = \text{Allow COD}$).
- $p = P(y = 1 \mid \mathbf{x})$ be the predicted RTO probability.
- $C_{\text{RTO}}$ be the average lost freight cost per failed return ($\approx \text{₹}180$).
- $C_{\text{LTV}}$ be the lost gross margin from a churned genuine customer ($\approx \text{₹}650$).

### Total Expected Financial Utility ($U$)

$$U(\tau) = \sum_{i=1}^{N} \left[ \mathbb{I}(y_i = 1, \hat{y}_i = 1) \cdot C_{\text{RTO}} - \mathbb{I}(y_i = 0, \hat{y}_i = 1) \cdot C_{\text{LTV}} - \mathbb{I}(y_i = 1, \hat{y}_i = 0) \cdot C_{\text{RTO}} \right]$$

Where:
- $\mathbb{I}(y=1, \hat{y}=1)$ represents **True Positives (TP)**: Fraud/RTO prevented. Net gain = $+C_{\text{RTO}}$.
- $\mathbb{I}(y=0, \hat{y}=1)$ represents **False Positives (FP)**: Genuine buyer blocked. Cost = $-C_{\text{LTV}}$.
- $\mathbb{I}(y=1, \hat{y}=0)$ represents **False Negatives (FN)**: Unfiltered RTO. Cost = $-C_{\text{RTO}}$.

SentinelPay dynamically solves for the optimal threshold $\tau^*$ that maximizes net margin saved ($\max_{\tau} U(\tau)$).

---

## 2. Dynamic Decision Tiers & Interventions

Rather than binary blocking, SentinelPay uses a 3-tier intervention policy:

```
                          ┌───────────────────────────┐
                          │  Predicted Risk Prob (p)  │
                          └─────────────┬─────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
      [ p < 0.35 ]            [ 0.35 <= p <= 0.70 ]           [ p > 0.70 ]
             │                          │                          │
             ▼                          ▼                          ▼
       Tier 1: PASS             Tier 2: INTERVENT          Tier 3: BLOCK COD
    (Allow Full COD)         (Ask ₹50 UPI Advance)      (Require 100% Online)
```

1. **Tier 1 — PASS ($p < 0.35$):** Low risk. Fulfill on standard COD without customer friction.
2. **Tier 2 — DYNAMIC INTERVENTION ($0.35 \le p \le 0.70$):** Medium risk. Prompt customer for a **₹50 refundable UPI commitment advance** at checkout.
   - *Behavioral Psychology:* Non-serious impulse buyers drop off (preventing RTO), while genuine buyers gladly pay ₹50 via UPI to confirm delivery intent.
   - *Outcome:* Converted orders credit the ₹50 toward delivery and upgrade to Tier 1 (`PASS`).
3. **Tier 3 — BLOCK COD ($p > 0.70$):** High risk. Require 100% online prepayment. Protects merchant from guaranteed freight loss.

---

## 3. TreeSHAP Feature Attribution

To explain predictions in real-time, SentinelPay implements **TreeSHAP** (SHapley Additive exPlanations for trees).

For a prediction $f(\mathbf{x})$, the Shapley value $\phi_i$ of feature $i$ represents its exact marginal contribution:

$$f(\mathbf{x}) = \phi_0 + \sum_{i=1}^{M} \phi_i$$

Where $\phi_0 = \mathbb{E}[f(\mathbf{x})]$ is the baseline expected risk score across all training transactions.

Each feature contribution $\phi_i$ is mapped to merchant-friendly copy:
$$\text{Impact Percentage} = \frac{\phi_i}{\phi_0} \times 100\%$$

---

## 4. Multimodal Return Fraud Verification (Gemini VLM)

Post-delivery "friendly fraud" (false claims of empty boxes or swapped products) is verified using multimodal vision analysis:

1. **Unboxing Visual Cross-Check:** Gemini VLM analyzes buyer photos against warehouse dispatch imagery.
2. **Serial Number & Seal Inspection:** Detects serial number mismatches and security tape tampering.
3. **Automated Evidence Dossier:** Compiles anomaly signatures into a legally compliant PDF dispute dossier for courier/marketplace arbitration.
