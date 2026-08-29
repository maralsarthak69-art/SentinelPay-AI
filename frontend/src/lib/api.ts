import axios from "axios";
import {
  OrderRiskRequest,
  OrderRiskResponse,
  BenchmarkRequest,
  BenchmarkResponse,
  VerifyReturnRequest,
  VerifyReturnResponse,
  DossierGenerationRequest,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export async function predictOrderRisk(req: OrderRiskRequest): Promise<OrderRiskResponse> {
  try {
    const res = await client.post<OrderRiskResponse>("/predict", req);
    return res.data;
  } catch (error) {
    console.error("Backend prediction error:", error);
    return {
      order_id: req.order_id || "ORD-LIVE",
      rto_probability: 0.0,
      decision: "PASS",
      action_required: "FULFILL_COD",
      advance_amount: 0,
      explanation: [],
    };
  }
}

export async function runBenchmarkSuite(req: BenchmarkRequest): Promise<BenchmarkResponse> {
  try {
    const res = await client.post<BenchmarkResponse>("/benchmark/run", req);
    return res.data;
  } catch (error) {
    console.error("Backend benchmark error:", error);
    return {
      total_records_evaluated: 0,
      precision: 0.0,
      recall: 0.0,
      false_positive_rate: 0.0,
      pass_count: 0,
      intervene_count: 0,
      block_count: 0,
      confusion_matrix: { true_positives: 0, false_positives: 0, true_negatives: 0, false_negatives: 0 },
      financial_impact: {
        gross_fraud_prevented_inr: 0.0,
        false_positive_churn_cost_inr: 0.0,
        net_margin_saved_inr: 0.0,
      },
    };
  }
}

export async function verifyReturnEvidence(req: VerifyReturnRequest): Promise<VerifyReturnResponse> {
  try {
    const res = await client.post<VerifyReturnResponse>("/verify-return", req);
    return res.data;
  } catch (error) {
    console.error("Backend dispute verification error:", error);
    return {
      order_id: req.order_id || "ORD-DISPUTE",
      verdict: "NEEDS_MANUAL_REVIEW",
      fraud_confidence_score: 0.0,
      detected_anomalies: [],
      serial_number_match: true,
      weight_mismatch_grams: 0.0,
      packaging_seal_tampered: false,
      summary: "No verification result available. Please check backend connection.",
    };
  }
}

export async function dispatchCarrierWebhook(payload: { order_id: string; decision: string; cart_value: number; pincode: string; action: string }) {
  try {
    const res = await client.post("/carrier/dispatch-webhook", payload);
    return res.data;
  } catch (error) {
    console.error("Carrier webhook error:", error);
    return {
      order_id: payload.order_id,
      decision: payload.decision,
      shiprocket: { status: "DISPATCH_FAILED", endpoint: "https://apiv2.shiprocket.in/v1/external/orders/create" },
      delhivery: { status: "DISPATCH_FAILED", endpoint: "https://track.delhivery.com/api/v1/packages/json/" }
    };
  }
}

export async function downloadDisputeDossierPDF(req: DossierGenerationRequest): Promise<void> {
  try {
    const res = await axios.post(`${API_BASE}/generate-dossier`, req, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SentinelPay_Dossier_${req.order_id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    alert("Unable to generate PDF dossier. Please verify backend FastAPI service is running.");
  }
}

export async function fetchSampleOrders(): Promise<OrderRiskRequest[]> {
  try {
    const res = await client.get("/sample-orders");
    return res.data.orders || [];
  } catch (error) {
    console.error("Fetch sample orders error:", error);
    return [];
  }
}
