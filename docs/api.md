# SentinelPay — API Specification

The SentinelPay backend exposes a FastAPI REST API running on port `8000`. Base path: `/api/v1`.

---

## Endpoints Summary

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/risk/predict` | `POST` | Evaluate RTO risk probability & TreeSHAP breakdown for a customer order |
| `/api/v1/benchmark/run` | `POST` | Calculate performance metrics (Precision, Recall, FPR, Net Saved) across store database |
| `/api/v1/benchmark/matrix` | `GET` | Retrieve default store matrix metrics |
| `/api/v1/dispute/verify-return` | `POST` | Audit return package unboxing claim using VLM multimodal vision analysis |
| `/api/v1/dispute/generate-dossier` | `POST` | Generate PDF legal dispute dossier for courier/marketplace arbitration |
| `/api/v1/sample-orders` | `GET` | Fetch real store order samples from `sales.csv` archive |

---

## Detailed Specifications

### 1. Predict Order RTO Risk
`POST /api/v1/risk/predict`

#### Request Body
```json
{
  "order_id": "ORD-84920",
  "cart_value": 2499.00,
  "payment_mode": "COD",
  "shipping_address": "Flat 402, Near Sai Mandir, Pune",
  "pincode": "411041",
  "phone_number": "+919876543210",
  "device_order_count_last_24h": 3,
  "address_mismatch_flag": false,
  "category_risk_weight": 0.35
}
```

#### Response Body
```json
{
  "order_id": "ORD-84920",
  "rto_probability": 0.582,
  "decision": "DYNAMIC_INTERVENTION",
  "action_required": "PROMPT_UPI_ADVANCE",
  "advance_amount": 50.0,
  "explanation": [
    {
      "feature": "Delivery PIN Code (Safe Zone)",
      "impact": "-18.3%",
      "type": "RISK_DECREASE"
    },
    {
      "feature": "24h Order Velocity (3 Orders)",
      "impact": "+42.1%",
      "type": "RISK_INCREASE"
    }
  ]
}
```

---

### 2. Calculate Store Benchmark Metrics
`POST /api/v1/benchmark/run`

#### Request Body
```json
{
  "risk_threshold": 0.55,
  "avg_rto_cost_inr": 180.0,
  "customer_ltv_cost_inr": 650.0
}
```

#### Response Body
```json
{
  "total_records_evaluated": 5000,
  "precision": 0.9911,
  "recall": 0.9768,
  "false_positive_rate": 0.0029,
  "pass_count": 3676,
  "intervene_count": 850,
  "block_count": 474,
  "confusion_matrix": {
    "true_positives": 1221,
    "false_positives": 11,
    "true_negatives": 3739,
    "false_negatives": 29
  },
  "financial_impact": {
    "gross_fraud_prevented_inr": 219780.0,
    "false_positive_churn_cost_inr": 7150.0,
    "net_margin_saved_inr": 207410.0
  }
}
```

---

### 3. Verify Return Claim (VLM Vision Auditor)
`POST /api/v1/dispute/verify-return`

#### Request Body
```json
{
  "order_id": "ORD-84920",
  "customer_name": "Rohan Verma",
  "return_reason_claimed": "Received Empty Box",
  "claimed_item": "Sony WH-1000XM5 Headphones",
  "mock_case_type": "EMPTY_BOX"
}
```

#### Response Body
```json
{
  "order_id": "ORD-84920",
  "verdict": "SUSPECTED_FRAUD",
  "fraud_confidence_score": 0.94,
  "detected_anomalies": [
    "Package weight mismatch (-240g vs warehouse log)",
    "Box seal tampered prior to unboxing",
    "Serial number mismatch on inner label"
  ],
  "serial_number_match": false,
  "weight_mismatch_grams": 240.0,
  "packaging_seal_tampered": true,
  "summary": "High likelihood of friendly fraud: Return weight is 240g below warehouse dispatch log."
}
```

---

### 4. Generate Legal Dispute Dossier (PDF)
`POST /api/v1/dispute/generate-dossier`

#### Response
Returns binary PDF file attachment (`SentinelPay_Dispute_Dossier_ORD-84920.pdf`).
