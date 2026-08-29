from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
import re

class FeatureExplanation(BaseModel):
    feature: str
    impact: str
    type: str  # "RISK_INCREASE" or "RISK_DECREASE"

class OrderRiskRequest(BaseModel):
    order_id: str = Field(description="Unique transaction ID")
    cart_value: float = Field(gt=0, description="Order total in INR (must be > 0)")
    payment_mode: str = Field(default="COD", description="COD or PREPAID")
    shipping_address: str = Field(min_length=5, description="Delivery address string")
    pincode: str = Field(description="6-digit Indian PIN Code")
    phone_number: Optional[str] = Field(default=None)
    device_order_count_last_24h: int = Field(default=1, ge=1, le=50, description="Order velocity in last 24h")
    address_mismatch_flag: bool = Field(default=False, description="Flag for IP vs address mismatch")
    category_risk_weight: Optional[float] = Field(default=0.35, ge=0.0, le=1.0, description="Category risk multiplier")

    @field_validator("pincode")
    @classmethod
    def validate_indian_pincode(cls, v: str) -> str:
        clean_pin = re.sub(r"\D", "", v)
        if len(clean_pin) != 6:
            return "110001"
        return clean_pin

class OrderRiskResponse(BaseModel):
    order_id: str
    rto_probability: float
    decision: str  # "PASS", "DYNAMIC_INTERVENTION", "BLOCK_COD"
    action_required: str  # "FULFILL_COD", "PROMPT_UPI_ADVANCE", "ENFORCE_PREPAYMENT"
    advance_amount: float
    explanation: List[FeatureExplanation]

class BenchmarkRequest(BaseModel):
    risk_threshold: float = Field(default=0.55, ge=0.0, le=1.0)
    avg_rto_cost_inr: float = Field(default=180.0, gt=0)
    customer_ltv_cost_inr: float = Field(default=650.0, gt=0)

class ConfusionMatrixData(BaseModel):
    true_positives: int
    false_positives: int
    true_negatives: int
    false_negatives: int

class FinancialImpactData(BaseModel):
    gross_fraud_prevented_inr: float
    false_positive_churn_cost_inr: float
    net_margin_saved_inr: float

class BenchmarkResponse(BaseModel):
    total_records_evaluated: int
    precision: float
    recall: float
    false_positive_rate: float
    pass_count: int = Field(default=0)
    intervene_count: int = Field(default=0)
    block_count: int = Field(default=0)
    confusion_matrix: ConfusionMatrixData
    financial_impact: FinancialImpactData

class VerifyReturnRequest(BaseModel):
    order_id: str = Field(description="Order ID being returned")
    customer_name: str = Field(description="Customer full name")
    return_reason_claimed: str = Field(description="Claimed return reason")
    claimed_item: str = Field(description="Product item name")
    image_url_or_base64: Optional[str] = Field(default=None)
    mock_case_type: Optional[str] = Field(default=None)

class VerifyReturnResponse(BaseModel):
    order_id: str
    verdict: str  # "SUSPECTED_FRAUD", "VERIFIED_GENUINE", "NEEDS_MANUAL_REVIEW"
    fraud_confidence_score: float
    detected_anomalies: List[str]
    serial_number_match: bool
    weight_mismatch_grams: float
    packaging_seal_tampered: bool
    summary: str

class DossierGenerationRequest(BaseModel):
    order_id: str
    customer_name: str
    claimed_reason: str
    merchant_name: str = Field(default="Merchant Store")
    verdict: str
    confidence_score: float
    anomalies: List[str]
