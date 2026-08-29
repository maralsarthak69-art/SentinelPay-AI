export interface FeatureExplanation {
  feature: string;
  impact: string;
  type: "RISK_INCREASE" | "RISK_DECREASE";
}

export interface OrderRiskRequest {
  order_id: string;
  cart_value: number;
  payment_mode: "COD" | "PREPAID";
  shipping_address: string;
  pincode: string;
  phone_number?: string;
  device_order_count_last_24h: number;
  address_mismatch_flag: boolean;
  category_risk_weight?: number;
}

export interface OrderRiskResponse {
  order_id: string;
  rto_probability: number;
  decision: "PASS" | "DYNAMIC_INTERVENTION" | "BLOCK_COD";
  action_required: "FULFILL_COD" | "PROMPT_UPI_ADVANCE" | "ENFORCE_PREPAYMENT";
  advance_amount: number;
  explanation: FeatureExplanation[];
}

export interface BenchmarkRequest {
  risk_threshold: number;
  avg_rto_cost_inr: number;
  customer_ltv_cost_inr: number;
}

export interface ConfusionMatrixData {
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
}

export interface FinancialImpactData {
  gross_fraud_prevented_inr: number;
  false_positive_churn_cost_inr: number;
  net_margin_saved_inr: number;
}

export interface BenchmarkResponse {
  total_records_evaluated: number;
  precision: number;
  recall: number;
  false_positive_rate: number;
  pass_count?: number;
  intervene_count?: number;
  block_count?: number;
  confusion_matrix: ConfusionMatrixData;
  financial_impact: FinancialImpactData;
}

export interface VerifyReturnRequest {
  order_id: string;
  customer_name: string;
  return_reason_claimed: string;
  claimed_item: string;
  image_url_or_base64?: string;
  mock_case_type?: "EMPTY_BOX" | "WRONG_ITEM" | "DAMAGED" | "VALID_RETURN";
}

export interface VerifyReturnResponse {
  order_id: string;
  verdict: "SUSPECTED_FRAUD" | "VERIFIED_GENUINE" | "NEEDS_MANUAL_REVIEW";
  fraud_confidence_score: number;
  detected_anomalies: string[];
  serial_number_match: boolean;
  weight_mismatch_grams: number;
  packaging_seal_tampered: boolean;
  summary: string;
}

export interface DossierGenerationRequest {
  order_id: string;
  customer_name: string;
  claimed_reason: string;
  merchant_name: string;
  verdict: string;
  confidence_score: number;
  anomalies: string[];
}
