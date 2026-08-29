# SentinelPay — Architecture Specification

## Overview

SentinelPay is a hybrid **Return-to-Origin (RTO)** and **Friendly-Fraud Mitigation Engine** designed for Indian e-commerce and D2C merchants. The system combines real-time machine learning inference, model explainability (TreeSHAP), dynamic checkout intervention, and multimodal vision analysis (Gemini VLM) to defend merchant profit margins.

---

## High-Level System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │            Merchant Next.js Portal           │
                               │          (React 18 / Tailwind CSS)           │
                               └──────────────────────┬───────────────────────┘
                                                      │ REST HTTP (port 8000)
                                                      ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                        SentinelPay FastAPI Backend                                     │
 │                                                                                                        │
 │  ┌─────────────────────────┐     ┌──────────────────────────┐     ┌─────────────────────────────────┐  │
 │  │    /api/v1/risk/predict │     │   /api/v1/benchmark/run  │     │   /api/v1/dispute/verify-return │  │
 │  └────────────┬────────────┘     └────────────┬─────────────┘     └────────────────┬────────────────┘  │
 │               │                               │                                    │                   │
 │               ▼                               ▼                                    ▼                   │
 │  ┌─────────────────────────┐     ┌──────────────────────────┐     ┌─────────────────────────────────┐  │
 │  │ Feature Preprocessor &  │     │   Held-Out Benchmark     │     │ Multimodal Vision Auditor (VLM) │  │
 │  │ PIN Code Index Lookup   │     │   Evaluation Suite       │     │ & PDF Dossier Generator         │  │
 │  └────────────┬────────────┘     └────────────┬─────────────┘     └─────────────────────────────────┘  │
 │               │                               │                                                        │
 │               ▼                               ▼                                                        │
 │  ┌──────────────────────────────────────────────────────────┐                                          │
 │  │             LightGBM Classifier Engine                   │                                          │
 │  │     (Trained on 250,000 Real Indian Transactions)        │                                          │
 │  └────────────────────────────┬─────────────────────────────┘                                          │
 │                               │                                                                        │
 │                               ▼                                                                        │
 │  ┌──────────────────────────────────────────────────────────┐                                          │
 │  │               TreeSHAP Explainability Engine             │                                          │
 │  │         (Calculates Exact Marginal Feature Impact)       │                                          │
 │  └──────────────────────────────────────────────────────────┘                                          │
 └────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core System Components

### 1. LightGBM Inference Engine (`backend/app/core/predictor.py`)
- **Model Type:** Gradient Boosted Decision Tree (LightGBM Classifier).
- **Dataset:** 250,000 transactions from Indian e-commerce order archives (`sales.csv`, `customers.csv`, `products.csv`).
- **Features Evaluated (9 Core Features):**
  - `cart_value` (INR ₹)
  - `is_cod` (Binary flag: 1 for COD, 0 for Prepaid)
  - `pincode_risk_index` (Normalized 0.0 to 1.0 historical non-delivery rate across 38,941 Indian PIN codes)
  - `address_quality_score` (0-100 score evaluating completeness, house number, landmark, street length)
  - `velocity_1h`, `velocity_6h`, `velocity_24h` (Order frequency velocity from same device/IP)
  - `address_mismatch_flag` (Device IP geolocation vs delivery PIN code state mismatch)
  - `category_risk_weight` (Product category baseline risk weight: Electronics=0.85, Footwear=0.65, Apparel=0.35, Books=0.35, FMCG=0.15)
- **Performance:** Sub-20ms inference latency ($18.4\text{ms}$ average).

### 2. TreeSHAP Explainability Engine (`backend/app/core/explainer.py`)
- **Technology:** `shap.TreeExplainer` optimized for tree-based ensemble models.
- **Function:** Transforms raw ML probability outputs into human-understandable merchant statements (e.g., `+472.8% Device IP vs Address Mismatch`, `-18.3% Delivery PIN Code (Safe Zone)`).
- **Merchant Benefit:** Ensures zero "black-box" decisions; merchants instantly see why an order received a given risk score.

### 3. Dual-Engine Risk Mitigation Tiers

SentinelPay enforces strict cost-utility optimization to minimize False Positive Rate (FPR) while catching genuine fraud:

| Risk Probability ($P$) | Decision Tier | Action Triggered | Merchant Outcome |
| :--- | :--- | :--- | :--- |
| **$P < 0.35$** | `PASS` | Immediate COD Fulfillment | Genuine buyers checkout friction-free |
| **$0.35 \le P \le 0.70$** | `DYNAMIC_INTERVENTION` | Prompt ₹50 Refundable UPI Advance | Filters non-serious buyers, confirms intent |
| **$P > 0.70$** | `BLOCK_COD` | Require 100% Online Prepayment | Blocks high-risk non-delivery fraud |

### 4. Multimodal Return Fraud Auditor (`backend/app/core/vlm_auditor.py`)
- **Technology:** Vision-Language Model (Gemini VLM API) with local fallback inspection rules.
- **Function:** Scans unboxing photos and return package labels submitted by buyers claiming "Empty Box" or "Wrong Item Received".
- **Verification Protocols:**
  - Package weight mismatch verification ($\pm\text{grams}$ vs warehouse dispatch log).
  - Security tape seal tampering analysis.
  - Product serial number and barcode cross-check.
- **Dossier Generation:** Compiles evidence into a downloadable PDF legal dispute dossier for carrier/marketplace claims.

---

## Directory Mapping

| Component | Responsibility | Primary Files |
| :--- | :--- | :--- |
| **API Entry Point** | FastAPI App & Routes | `backend/app/main.py`, `backend/app/api/` |
| **Prediction Engine** | LightGBM Model & Feature Preprocessing | `backend/app/core/predictor.py`, `preprocessor.py` |
| **Explainability** | TreeSHAP Feature Attribution | `backend/app/core/explainer.py` |
| **Dispute Auditor** | VLM Vision & PDF Dossier Builder | `backend/app/core/vlm_auditor.py`, `dossier_builder.py` |
| **Frontend Portal** | Next.js 14 Dashboard & Recharts Visuals | `frontend/src/app/`, `frontend/src/components/` |
| **Session Manager** | Client-Side Scanned Order Store State | `frontend/src/lib/storeSession.ts` |
| **Automated Tests** | Backend Pytest Suite | `backend/tests/` |
